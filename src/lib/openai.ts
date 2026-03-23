import { createPkceChallenge, createRandomToken } from "@/lib/crypto";
import { env } from "@/lib/env";
import type { AppSession, OpenAiSession } from "@/lib/session";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  id_token?: string;
};

type OpenAiProfile = {
  id?: string;
  sub?: string;
  email?: string;
  name?: string;
};

function decodeJwtPayload(token: string) {
  const parts = token.split(".");
  if (parts.length < 2) return null;

  const json = Buffer.from(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  return JSON.parse(json) as Record<string, unknown>;
}

export async function createOpenAiOAuthUrl(baseUrl: string) {
  const state = createRandomToken(24);
  const verifier = createRandomToken(48);
  const challenge = await createPkceChallenge(verifier);

  const redirectUri = env.openAiRedirectUri || `${baseUrl}/api/auth/openai/callback`;
  const url = new URL(env.openAiAuthorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", env.openAiClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", env.openAiOAuthScope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  return { state, verifier, url: url.toString() };
}

export async function createManualOpenAiOAuthUrl() {
  const state = createRandomToken(24);
  const verifier = createRandomToken(48);
  const challenge = await createPkceChallenge(verifier);

  const url = new URL(env.openAiAuthorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", env.openAiClientId);
  url.searchParams.set("redirect_uri", env.openAiManualRedirectUri);
  url.searchParams.set("scope", env.openAiOAuthScope);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  return {
    state,
    verifier,
    redirectUri: env.openAiManualRedirectUri,
    url: url.toString(),
  };
}

async function exchangeToken(body: URLSearchParams) {
  const response = await fetch(env.openAiTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI token exchange failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return (await response.json()) as TokenResponse;
}

export async function exchangeOpenAiCode(input: { code: string; verifier: string; baseUrl: string }) {
  const redirectUri = env.openAiRedirectUri || `${input.baseUrl}/api/auth/openai/callback`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    client_id: env.openAiClientId,
    redirect_uri: redirectUri,
    code_verifier: input.verifier,
  });

  if (env.openAiClientSecret) {
    body.set("client_secret", env.openAiClientSecret);
  }

  return exchangeToken(body);
}

export async function exchangeManualOpenAiCode(input: { code: string; verifier: string }) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    client_id: env.openAiClientId,
    redirect_uri: env.openAiManualRedirectUri,
    code_verifier: input.verifier,
  });

  if (env.openAiClientSecret) {
    body.set("client_secret", env.openAiClientSecret);
  }

  return exchangeToken(body);
}

export async function refreshOpenAiAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: env.openAiClientId,
  });

  if (env.openAiClientSecret) {
    body.set("client_secret", env.openAiClientSecret);
  }

  return exchangeToken(body);
}

export async function fetchOpenAiProfile(accessToken: string) {
  const response = await fetch(env.openAiUserInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const jwt = decodeJwtPayload(accessToken);
    return {
      id:
        (jwt?.["https://api.openai.com/auth"] as { chatgpt_account_id?: string } | undefined)?.chatgpt_account_id ??
        (jwt?.sub as string | undefined),
      email: (jwt?.["https://api.openai.com/profile"] as { email?: string } | undefined)?.email,
    };
  }

  const profile = (await response.json()) as OpenAiProfile;
  return {
    id: profile.id ?? profile.sub,
    email: profile.email,
    name: profile.name,
  };
}

export function createOpenAiSession(token: TokenResponse, profile: { id?: string; email?: string; name?: string }, source: OpenAiSession["source"]) {
  const jwt = decodeJwtPayload(token.access_token);
  const authClaims = jwt?.["https://api.openai.com/auth"] as { chatgpt_account_id?: string } | undefined;

  return {
    connected: true,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : undefined,
    accountId: profile.id ?? authClaims?.chatgpt_account_id,
    email: profile.email,
    name: profile.name,
    source,
  } satisfies OpenAiSession;
}

export async function ensureOpenAiAccessToken(session: AppSession) {
  const openai = session.openai;

  if (!openai?.connected) {
    throw new Error("OpenAI is not connected");
  }

  if (!openai.expiresAt || !openai.refreshToken) {
    return { session, accessToken: openai.accessToken };
  }

  const expiresSoon = new Date(openai.expiresAt).getTime() - Date.now() < 60_000;
  if (!expiresSoon) {
    return { session, accessToken: openai.accessToken };
  }

  const refreshed = await refreshOpenAiAccessToken(openai.refreshToken);
  const profile = await fetchOpenAiProfile(refreshed.access_token);
  const nextSession = {
    ...session,
    openai: createOpenAiSession(
      {
        ...refreshed,
        refresh_token: refreshed.refresh_token ?? openai.refreshToken,
      },
      profile,
      openai.source ?? "oauth",
    ),
  } satisfies AppSession;

  return { session: nextSession, accessToken: nextSession.openai!.accessToken };
}

export async function generateStrategyAnalysis(input: {
  accessToken: string;
  strategyName: string;
  strategyDescription: string;
  strategyPromptProfile: string;
  markets: Array<{
    ticker?: string;
    title?: string;
    yes_bid_dollars?: string;
    yes_ask_dollars?: string;
    volume?: number;
    status?: string;
  }>;
}) {
  const response = await fetch(`${env.openAiApiBaseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.accessToken}`,
    },
    body: JSON.stringify({
      model: env.openAiModel,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are helping a Kalshi market operator reviewing live markets. Return compact JSON with keys summary, action, confidence, risk, candidateTicker, and notes. Keep it conservative and manual-review oriented.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(
                {
                  strategy: {
                    name: input.strategyName,
                    description: input.strategyDescription,
                    promptProfile: input.strategyPromptProfile,
                  },
                  markets: input.markets,
                },
                null,
                2,
              ),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "strategy_analysis",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["summary", "action", "confidence", "risk", "candidateTicker", "notes"],
            properties: {
              summary: { type: "string" },
              action: { type: "string", enum: ["watch", "buy_yes_small", "buy_no_small", "pass"] },
              confidence: { type: "string" },
              risk: { type: "string" },
              candidateTicker: { type: "string" },
              notes: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI strategy call failed (${response.status}): ${text.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    output_text?: string;
  };

  if (!payload.output_text) {
    throw new Error("OpenAI response did not include output_text");
  }

  return JSON.parse(payload.output_text) as {
    summary: string;
    action: string;
    confidence: string;
    risk: string;
    candidateTicker: string;
    notes: string[];
  };
}
