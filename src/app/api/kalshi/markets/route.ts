import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getKalshiMarkets } from "@/lib/kalshi";
import { readSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await readSession();
    const baseUrl = session.kalshi?.baseUrl ?? env.kalshiBaseUrl;
    const markets = await getKalshiMarkets(baseUrl, 8);
    return NextResponse.json({ markets });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to load Kalshi markets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

