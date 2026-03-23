import { NextResponse } from "next/server";

import { getMarketOverview } from "@/lib/hyperliquid";
import { generateStrategyDecisions } from "@/lib/strategy-engine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const symbol = searchParams.get("symbol") ?? "BTC";
  const interval = searchParams.get("interval") ?? "1m";
  const network = searchParams.get("network") === "testnet" ? "testnet" : "mainnet";
  const bankrollUsd = Number(searchParams.get("bankrollUsd") ?? "100");

  const overview = await getMarketOverview({ symbol, interval, network });
  const decisions = generateStrategyDecisions({
    candles: overview.candles,
    bids: overview.orderBook.bids,
    asks: overview.orderBook.asks,
    bankrollUsd,
  });

  return NextResponse.json({
    source: overview.source,
    updatedAt: overview.market.updatedAt,
    decisions,
  });
}
