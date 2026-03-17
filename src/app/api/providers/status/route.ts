import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getKalshiBalance, getKalshiMarkets } from "@/lib/kalshi";
import { readSession, writeSession } from "@/lib/session";
import { ensureOpenAiAccessToken } from "@/lib/openai";

export async function GET() {
  const session = await readSession();

  try {
    let nextSession = session;

    if (session.openai?.connected) {
      const refreshed = await ensureOpenAiAccessToken(session);
      nextSession = refreshed.session;

      if (nextSession !== session) {
        await writeSession(nextSession);
      }
    }

    const [markets, kalshiBalance] = await Promise.all([
      getKalshiMarkets(nextSession.kalshi?.baseUrl ?? env.kalshiBaseUrl, 6),
      nextSession.kalshi?.connected
        ? getKalshiBalance({
            accessKeyId: nextSession.kalshi.accessKeyId,
            privateKeyPem: nextSession.kalshi.privateKeyPem,
            baseUrl: nextSession.kalshi.baseUrl,
          }).catch(() => null)
        : Promise.resolve(null),
    ]);

    return NextResponse.json({
      openai: nextSession.openai
        ? {
            connected: true,
            email: nextSession.openai.email,
            accountId: nextSession.openai.accountId,
            expiresAt: nextSession.openai.expiresAt,
            source: nextSession.openai.source,
          }
        : { connected: false },
      kalshi: nextSession.kalshi
        ? {
            connected: true,
            baseUrl: nextSession.kalshi.baseUrl,
            accessKeyIdPreview: `${nextSession.kalshi.accessKeyId.slice(0, 6)}...`,
            balance: kalshiBalance?.balance ?? nextSession.kalshi.lastBalance ?? "Unavailable",
          }
        : { connected: false, baseUrl: env.kalshiBaseUrl },
      markets,
      config: {
        openAiOAuthReady: Boolean(env.openAiClientId),
        allowLocalCodexImport: env.allowLocalCodexImport,
      },
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to load provider status.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

