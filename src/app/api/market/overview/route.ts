import { NextResponse } from "next/server";

import { getMarketOverview } from "@/lib/hyperliquid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const symbol = searchParams.get("symbol") ?? "BTC";
  const interval = searchParams.get("interval") ?? "1m";
  const network = searchParams.get("network") === "testnet" ? "testnet" : "mainnet";

  const payload = await getMarketOverview({
    symbol,
    interval,
    network,
  });

  return NextResponse.json(payload);
}
