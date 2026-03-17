# Kalshi-BotOS

Session-backed Next.js app for testing ChatGPT-powered Kalshi sandbox workflows.

## What is wired

- ChatGPT/OpenAI OAuth start and callback routes
- Manual PKCE OAuth URL generation plus pasted callback completion
- Local Codex ChatGPT session import for local testing
- Encrypted session cookie storage for provider credentials
- Kalshi sandbox credential validation with signed requests
- Live sandbox market fetches
- GPT-backed strategy analysis endpoint using connected OpenAI auth
- Dashboard and connect screens wired to real API routes

## Required environment variables

Copy `.env.example` to `.env.local` and set at least:

- `APP_SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL`

Set these as well if you want direct deployed OAuth instead of local Codex import:

- `OPENAI_OAUTH_CLIENT_ID`
- `OPENAI_OAUTH_CLIENT_SECRET`
- `OPENAI_OAUTH_REDIRECT_URI`

## Local run

```bash
npm install
npm run dev
```

Open `/connect` first.

## Production notes

- This build is designed for sandbox validation, not unattended live trading.
- Keep Kalshi pointed at `https://demo-api.kalshi.co` until you add stricter risk controls and execution review.
- `APP_SESSION_SECRET` must be set in Vercel for encrypted session cookies.
