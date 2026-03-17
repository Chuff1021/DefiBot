import { NextResponse } from "next/server";
import { getBaseUrlFromRequest } from "@/lib/env";
import { createOpenAiSession, exchangeOpenAiCode, fetchOpenAiProfile } from "@/lib/openai";
import { clearOAuthStateCookie, readOAuthStateCookie, readSession, writeSession } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/connect?error=${encodeURIComponent(error)}`, request.url));
  }

  const cookieState = await readOAuthStateCookie();
  if (!code || !state || !cookieState || cookieState.state !== state) {
    return NextResponse.redirect(new URL("/connect?error=openai_state_mismatch", request.url));
  }

  try {
    const tokens = await exchangeOpenAiCode({
      code,
      verifier: cookieState.verifier,
      baseUrl: getBaseUrlFromRequest(request.url),
    });
    const profile = await fetchOpenAiProfile(tokens.access_token);
    const session = await readSession();

    await writeSession({
      ...session,
      openai: createOpenAiSession(tokens, profile, "oauth"),
    });
    await clearOAuthStateCookie();

    return NextResponse.redirect(new URL("/connect?openai=connected", request.url));
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "openai_callback_failed";
    return NextResponse.redirect(new URL(`/connect?error=${encodeURIComponent(message)}`, request.url));
  }
}

