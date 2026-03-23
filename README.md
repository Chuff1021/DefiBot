# DefiBot

Session-backed Next.js app for testing ChatGPT-powered workflows across a DeFi research scaffold, while retaining existing Kalshi integration surfaces during the transition.

## What is wired

- ChatGPT/OpenAI OAuth start and callback routes
- Manual PKCE OAuth URL generation plus pasted callback completion
- Local Codex ChatGPT session import for local testing
- Encrypted session cookie storage for provider credentials
- Kalshi production credential validation with signed requests
- Live production market fetches
- GPT-backed strategy analysis endpoint using connected OpenAI auth
- Dashboard and connect screens wired to real API routes
- Fixture-backed DeFi research and paper-trading slice exposed at `/api/defi/research-slice`

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

## DeFi fixture-backed vertical slice

- Visit `/strategies` to inspect the first DeFi strategy card rendered from the new local research slice.
- Call `/api/defi/research-slice` to inspect the full end-to-end fixture-backed payload.
- The slice uses local fixtures only: `WETH/USDC` candles, a $100 paper portfolio snapshot, indicator computation, trend-plus-momentum breakout evaluation, small-account risk checks, and simulated paper execution.
- No wallet, chain RPC, or exchange execution is used in this slice.

## Production notes

- This build is designed for manual review, not unattended live trading.
- The default Kalshi endpoint is `https://api.elections.kalshi.com`.
- Keep automated live order placement disabled until you add stricter risk controls and execution review.
- `APP_SESSION_SECRET` must be set in Vercel for encrypted session cookies.
