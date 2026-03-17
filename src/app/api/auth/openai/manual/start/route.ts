import { NextResponse } from "next/server";
import { createManualOpenAiOAuthUrl } from "@/lib/openai";
import { writeOAuthStateCookie } from "@/lib/session";

export async function POST() {
  try {
    const { state, verifier, redirectUri, url } = await createManualOpenAiOAuthUrl();
    await writeOAuthStateCookie({
      state,
      verifier,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      authorizeUrl: url,
      redirectUri,
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to create manual OAuth URL.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

