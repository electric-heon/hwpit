# HWP it! — Anthropic 프록시 (Cloudflare Worker)

데스크톱 앱에 API 키를 심지 않기 위한 passthrough 프록시.
앱은 이 Worker로만 요청하고, Worker가 서버 secret에 보관된 실제 키를 주입해
`api.anthropic.com` 으로 포워딩한다. **키는 클라이언트로 나가지 않는다.**

## 배포

```bash
cd proxy
npm install

# Cloudflare 로그인 (최초 1회)
npx wrangler login

# secret 등록
npx wrangler secret put ANTHROPIC_API_KEY   # 실제 Anthropic 키 입력
npx wrangler secret put APP_TOKEN           # 앱과 공유할 임의의 긴 토큰 입력

# 배포
npx wrangler deploy
```

배포되면 `https://hwpit-proxy.<your-subdomain>.workers.dev` 주소가 나온다.
이 주소와 `APP_TOKEN` 값을 앱의 `backend/app/services/config.py` 에 넣는다.

## 로컬 테스트

`.dev.vars` 파일(gitignore됨)에 secret을 넣고 `npm run dev`:

```
ANTHROPIC_API_KEY=sk-ant-...
APP_TOKEN=아무-긴-토큰
```

## 남용 방지

- `APP_TOKEN`으로 무작위 접근은 막지만, 토큰은 exe에서 추출 가능하므로 완벽하진 않다.
- 필요하면 Cloudflare 대시보드에서 이 Worker에 **Rate Limiting** 규칙을 추가하라
  (예: IP당 분당 요청 수 제한).
- 사용량은 Anthropic Console에서 모니터링하고, 이상 급증 시 `APP_TOKEN`을 교체한다.
