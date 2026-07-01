// HWP it! — Anthropic API passthrough proxy (Cloudflare Worker)
//
// 클라이언트(데스크톱 앱)는 진짜 API 키를 갖지 않고 이 프록시로만 요청한다.
// 프록시가 서버 secret에 보관된 ANTHROPIC_API_KEY를 헤더에 주입해
// api.anthropic.com 으로 그대로 포워딩한다. 키는 절대 클라이언트로 나가지 않는다.
//
// Secrets (wrangler secret put 으로 등록):
//   ANTHROPIC_API_KEY  실제 Anthropic 키
//   APP_TOKEN          앱과 공유하는 간단한 접근 토큰 (무작위 남용 차단용)

const ANTHROPIC_BASE = "https://api.anthropic.com";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Anthropic API 경로만, POST만 허용
    if (request.method !== "POST" || !url.pathname.startsWith("/v1/")) {
      return new Response("Not found", { status: 404 });
    }

    // 공유 토큰 검증 — URL이 노출돼도 무작위 남용을 막는다.
    // (토큰은 exe에서 추출 가능하므로 완벽한 방어는 아니고, 캐주얼한 남용 차단용이다.)
    if (!env.APP_TOKEN || request.headers.get("x-app-token") !== env.APP_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 헤더 재구성: 클라이언트의 더미 키를 버리고 진짜 키를 주입한다.
    const headers = new Headers();
    headers.set("content-type", request.headers.get("content-type") || "application/json");
    headers.set("x-api-key", env.ANTHROPIC_API_KEY);
    headers.set("anthropic-version", request.headers.get("anthropic-version") || "2023-06-01");
    const beta = request.headers.get("anthropic-beta");
    if (beta) headers.set("anthropic-beta", beta);

    // 본문은 버퍼링해서 그대로 전달 (PDF 페이지 base64 → 수 MB 수준, Workers 한도 내)
    const body = await request.arrayBuffer();

    const upstream = await fetch(ANTHROPIC_BASE + url.pathname + url.search, {
      method: "POST",
      headers,
      body,
    });

    // 응답 그대로 통과 (일반 JSON·SSE 스트리밍 모두 대응)
    return new Response(upstream.body, {
      status: upstream.status,
      headers: upstream.headers,
    });
  },
};
