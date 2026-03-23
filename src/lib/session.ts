import { cookies } from "next/headers";
import { decryptJson, encryptJson } from "@/lib/crypto";
import { env } from "@/lib/env";

const OPENAI_SESSION_COOKIE = "kalshi_botos_openai";
const KALSHI_SESSION_COOKIE = "kalshi_botos_kalshi";
const OAUTH_COOKIE = "kalshi_botos_oauth";

export type OpenAiSession = {
  connected: boolean;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  accountId?: string;
  email?: string;
  name?: string;
  source?: "oauth" | "local-codex";
};

export type KalshiSession = {
  connected: boolean;
  baseUrl: string;
  accessKeyId: string;
  privateKeyPem: string;
  lastBalance?: string;
  lastValidatedAt?: string;
};

export type AppSession = {
  openai?: OpenAiSession;
  kalshi?: KalshiSession;
};

export type OAuthCookieState = {
  state: string;
  verifier: string;
  createdAt: string;
};

function getCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function readSession(): Promise<AppSession> {
  const cookieStore = await cookies();
  const openAiRaw = cookieStore.get(OPENAI_SESSION_COOKIE)?.value;
  const kalshiRaw = cookieStore.get(KALSHI_SESSION_COOKIE)?.value;
  const session: AppSession = {};

  if (openAiRaw) {
    try {
      session.openai = decryptJson<OpenAiSession>(env.sessionSecret, openAiRaw);
    } catch {
      session.openai = undefined;
    }
  }

  if (kalshiRaw) {
    try {
      session.kalshi = decryptJson<KalshiSession>(env.sessionSecret, kalshiRaw);
    } catch {
      session.kalshi = undefined;
    }
  }

  return session;
}

export async function writeSession(session: AppSession) {
  const cookieStore = await cookies();
  if (session.openai) {
    cookieStore.set(OPENAI_SESSION_COOKIE, encryptJson(env.sessionSecret, session.openai), getCookieOptions(60 * 60 * 24 * 14));
  } else {
    cookieStore.delete(OPENAI_SESSION_COOKIE);
  }

  if (session.kalshi) {
    cookieStore.set(KALSHI_SESSION_COOKIE, encryptJson(env.sessionSecret, session.kalshi), getCookieOptions(60 * 60 * 24 * 14));
  } else {
    cookieStore.delete(KALSHI_SESSION_COOKIE);
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(OPENAI_SESSION_COOKIE);
  cookieStore.delete(KALSHI_SESSION_COOKIE);
}

export async function writeOAuthStateCookie(state: OAuthCookieState) {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_COOKIE, encryptJson(env.sessionSecret, state), getCookieOptions(60 * 10));
}

export async function readOAuthStateCookie(): Promise<OAuthCookieState | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(OAUTH_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  try {
    return decryptJson<OAuthCookieState>(env.sessionSecret, raw);
  } catch {
    return null;
  }
}

export async function clearOAuthStateCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(OAUTH_COOKIE);
}
