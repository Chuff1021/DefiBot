import { NextResponse } from "next/server";
import { env, getBaseUrlFromRequest } from "@/lib/env";
import { createOpenAiOAuthUrl } from "@/lib/openai";
import { writeOAuthStateCookie } from "@/lib/session";

export async function GET(request: Request) {
  if (!env.openAiClientId) {
    return NextResponse.redirect(new URL("/connect?error=openai_oauth_not_configured", request.url));
  }

  const { state, verifier, url } = await createOpenAiOAuthUrl(getBaseUrlFromRequest(request.url));
  await writeOAuthStateCookie({
    state,
    verifier,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.redirect(url);
}

