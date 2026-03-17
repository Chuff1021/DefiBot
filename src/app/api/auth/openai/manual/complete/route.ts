import { NextResponse } from "next/server";
import { createOpenAiSession, exchangeManualOpenAiCode, fetchOpenAiProfile } from "@/lib/openai";
import { clearOAuthStateCookie, readOAuthStateCookie, readSession, writeSession } from "@/lib/session";

type ManualCompleteBody = {
  callbackUrl?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ManualCompleteBody;
    const callbackUrl = body.callbackUrl?.trim();

    if (!callbackUrl) {
      return NextResponse.json({ error: "A callback URL is required." }, { status: 400 });
    }

    const parsedUrl = new URL(callbackUrl);
    const code = parsedUrl.searchParams.get("code");
    const state = parsedUrl.searchParams.get("state");
    const error = parsedUrl.searchParams.get("error");

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const cookieState = await readOAuthStateCookie();
    if (!code || !state || !cookieState || cookieState.state !== state) {
      return NextResponse.json({ error: "OAuth state mismatch or missing code." }, { status: 400 });
    }

    const tokens = await exchangeManualOpenAiCode({
      code,
      verifier: cookieState.verifier,
    });
    const profile = await fetchOpenAiProfile(tokens.access_token);
    const session = await readSession();

    await writeSession({
      ...session,
      openai: createOpenAiSession(tokens, profile, "oauth"),
    });
    await clearOAuthStateCookie();

    return NextResponse.json({ ok: true });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to complete manual OAuth.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
