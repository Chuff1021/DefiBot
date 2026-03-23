import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getKalshiMarkets, rankCryptoMarkets } from "@/lib/kalshi";
import { readSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await readSession();
    const baseUrl = session.kalshi?.baseUrl ?? env.kalshiBaseUrl;
    const markets = await getKalshiMarkets(baseUrl, 500);
    const candidates = rankCryptoMarkets(markets).slice(0, 20).map(({ market, score }) => ({
      ticker: market.ticker,
      event_ticker: market.event_ticker,
      title: market.title,
      subtitle: market.subtitle,
      yes_bid_dollars: market.yes_bid_dollars,
      yes_ask_dollars: market.yes_ask_dollars,
      volume: market.volume,
      score,
    }));

    return NextResponse.json({ candidates });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to load crypto diagnostics.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
