# HWP it! — Anthropic 프록시 (Cloudflare Worker)

데스크톱 앱에 API 키를 심지 않기 위한 passthrough 프록시.
앱은 이 Worker로만 요청하고, Worker가 서버 secret에 보관된 실제 키를 주입해
`api.anthropic.com` 으로 포워딩한다. 
