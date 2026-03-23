import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getKalshiMarkets } from "@/lib/kalshi";
import { ensureOpenAiAccessToken, generateStrategyAnalysis } from "@/lib/openai";
import { generateLocalStrategyAnalysis } from "@/lib/strategy-engine";
import { readSession, writeSession } from "@/lib/session";
import { strategyMocks } from "@/lib/trade-mock-data";

type RunRequestBody = {
  strategyId?: string;
  allocation?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RunRequestBody;
    const session = await readSession();

    if (!session.openai?.connected) {
      return NextResponse.json({ error: "Connect OpenAI first." }, { status: 400 });
    }

    if (!session.kalshi?.connected) {
      return NextResponse.json({ error: "Connect Kalshi production first." }, { status: 400 });
    }

    const strategy = strategyMocks.find((item) => item.id === body.strategyId) ?? strategyMocks[0];
    if (!strategy) {
      return NextResponse.json({ error: "No strategy available." }, { status: 400 });
    }

    const markets = await getKalshiMarkets(session.kalshi.baseUrl || env.kalshiBaseUrl, 250);
    let analysis: Awaited<ReturnType<typeof generateStrategyAnalysis>> | ReturnType<typeof generateLocalStrategyAnalysis>;
    let analysisSource: "openai" | "local-rules" = "local-rules";

    try {
      const refreshed = await ensureOpenAiAccessToken(session);
      if (refreshed.session !== session) {
        await writeSession(refreshed.session);
      }

      analysis = await generateStrategyAnalysis({
        accessToken: refreshed.accessToken,
        strategyName: strategy.name,
        strategyDescription: strategy.description,
        strategyPromptProfile: strategy.promptProfile,
        markets,
      });
      analysisSource = "openai";
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "";
      analysis = generateLocalStrategyAnalysis({
        strategy,
        markets,
        allocation: body.allocation,
      });

      if (message) {
        analysis.notes.unshift(`OpenAI analysis unavailable, fell back to local rules: ${message}`);
      }
    }

    return NextResponse.json({
      strategy,
      allocation: body.allocation,
      analysisSource,
      analysis,
      sampledMarkets: markets,
      generatedAt: new Date().toISOString(),
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to run the strategy bot.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
