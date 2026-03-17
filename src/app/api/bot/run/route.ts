import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getKalshiMarkets } from "@/lib/kalshi";
import { ensureOpenAiAccessToken, generateStrategyAnalysis } from "@/lib/openai";
import { readSession, writeSession } from "@/lib/session";
import { strategyMocks } from "@/lib/trade-mock-data";

type RunRequestBody = {
  strategyId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RunRequestBody;
    const session = await readSession();

    if (!session.openai?.connected) {
      return NextResponse.json({ error: "Connect OpenAI first." }, { status: 400 });
    }

    if (!session.kalshi?.connected) {
      return NextResponse.json({ error: "Connect Kalshi sandbox first." }, { status: 400 });
    }

    const strategy = strategyMocks.find((item) => item.id === body.strategyId) ?? strategyMocks[0];
    if (!strategy) {
      return NextResponse.json({ error: "No strategy available." }, { status: 400 });
    }

    const refreshed = await ensureOpenAiAccessToken(session);
    if (refreshed.session !== session) {
      await writeSession(refreshed.session);
    }

    const markets = await getKalshiMarkets(session.kalshi.baseUrl || env.kalshiBaseUrl, 6);
    const analysis = await generateStrategyAnalysis({
      accessToken: refreshed.accessToken,
      strategyName: strategy.name,
      strategyDescription: strategy.description,
      strategyPromptProfile: strategy.promptProfile,
      markets,
    });

    return NextResponse.json({
      strategy,
      analysis,
      sampledMarkets: markets,
      generatedAt: new Date().toISOString(),
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to run the strategy bot.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
