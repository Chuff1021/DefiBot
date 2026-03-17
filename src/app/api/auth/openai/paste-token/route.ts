import { NextResponse } from "next/server";
import { createOpenAiSession, fetchOpenAiProfile } from "@/lib/openai";
import { readSession, writeSession } from "@/lib/session";

type TokenPayloadInput = {
  accessToken?: string;
  refreshToken?: string;
  accountId?: string;
  tokenJson?: string;
};

type ParsedLocalAuth = {
  tokens?: {
    access_token?: string;
    refresh_token?: string;
    account_id?: string;
  };
};

function parseTokenPayload(body: TokenPayloadInput) {
  if (body.tokenJson?.trim()) {
    const parsed = JSON.parse(body.tokenJson) as ParsedLocalAuth;
    return {
      accessToken: parsed.tokens?.access_token,
      refreshToken: parsed.tokens?.refresh_token,
      accountId: parsed.tokens?.account_id,
    };
  }

  return {
    accessToken: body.accessToken?.trim(),
    refreshToken: body.refreshToken?.trim(),
    accountId: body.accountId?.trim(),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TokenPayloadInput;
    const parsed = parseTokenPayload(body);

    if (!parsed.accessToken) {
      return NextResponse.json({ error: "An access token or token JSON payload is required." }, { status: 400 });
    }

    const profile = await fetchOpenAiProfile(parsed.accessToken);
    const session = await readSession();

    await writeSession({
      ...session,
      openai: createOpenAiSession(
        {
          access_token: parsed.accessToken,
          refresh_token: parsed.refreshToken,
        },
        {
          id: parsed.accountId ?? profile.id,
          email: profile.email,
          name: profile.name,
        },
        "local-codex",
      ),
    });

    return NextResponse.json({ ok: true });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to store OpenAI token.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
