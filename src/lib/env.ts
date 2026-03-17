const DEFAULT_OPENAI_AUTHORIZE_URL = "https://auth.openai.com/oauth/authorize";
const DEFAULT_OPENAI_TOKEN_URL = "https://auth.openai.com/oauth/token";
const DEFAULT_OPENAI_USERINFO_URL = "https://api.openai.com/v1/me";
const DEFAULT_OPENAI_API_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_KALSHI_BASE_URL = "https://demo-api.kalshi.co";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const DEFAULT_OPENAI_PUBLIC_CLIENT_ID = "app_EMoamEEZ73f0CkXaXp7hrann";
const DEFAULT_OPENAI_MANUAL_REDIRECT_URI = "http://127.0.0.1:1455/auth/callback";

function coerceBoolean(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value === "1" || value.toLowerCase() === "true";
}

function getRequiredSecret() {
  const value = process.env.APP_SESSION_SECRET;

  if (value) {
    return value;
  }

  return "local-dev-session-secret-change-me";
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
  sessionSecret: getRequiredSecret(),
  openAiClientId: process.env.OPENAI_OAUTH_CLIENT_ID ?? DEFAULT_OPENAI_PUBLIC_CLIENT_ID,
  openAiClientSecret: process.env.OPENAI_OAUTH_CLIENT_SECRET ?? "",
  openAiRedirectUri: process.env.OPENAI_OAUTH_REDIRECT_URI ?? "",
  openAiManualRedirectUri: process.env.OPENAI_OAUTH_MANUAL_REDIRECT_URI ?? DEFAULT_OPENAI_MANUAL_REDIRECT_URI,
  openAiAuthorizeUrl: process.env.OPENAI_OAUTH_AUTHORIZE_URL ?? DEFAULT_OPENAI_AUTHORIZE_URL,
  openAiTokenUrl: process.env.OPENAI_OAUTH_TOKEN_URL ?? DEFAULT_OPENAI_TOKEN_URL,
  openAiUserInfoUrl: process.env.OPENAI_OAUTH_USERINFO_URL ?? DEFAULT_OPENAI_USERINFO_URL,
  openAiApiBaseUrl: process.env.OPENAI_API_BASE_URL ?? DEFAULT_OPENAI_API_BASE_URL,
  openAiOAuthScope: process.env.OPENAI_OAUTH_SCOPE ?? "openid profile email offline_access",
  openAiModel: process.env.OPENAI_DEFAULT_MODEL ?? DEFAULT_OPENAI_MODEL,
  kalshiBaseUrl: process.env.KALSHI_BASE_URL ?? DEFAULT_KALSHI_BASE_URL,
  allowLocalCodexImport:
    process.env.NODE_ENV !== "production" || coerceBoolean(process.env.ALLOW_LOCAL_CODEX_IMPORT),
};

export function getBaseUrlFromRequest(requestUrl?: string) {
  if (env.appUrl) {
    return env.appUrl.replace(/\/$/, "");
  }

  if (!requestUrl) {
    return "http://localhost:3000";
  }

  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}`;
}
