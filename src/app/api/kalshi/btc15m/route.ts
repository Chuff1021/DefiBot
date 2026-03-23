import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { findBestBtc15mMarket, getKalshiMarkets, getKalshiOrderbook, rankCryptoMarkets } from "@/lib/kalshi";
import { readSession } from "@/lib/session";

function bestBid(side: Array<[string, string]> | undefined) {
  if (!side?.length) return null;
  return side
    .map(([price]) => Number.parseFloat(price))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)[0] ?? null;
}

export async function GET() {
  try {
    const session = await readSession();
    const baseUrl = session.kalshi?.baseUrl ?? env.kalshiBaseUrl;
    const markets = await getKalshiMarkets(baseUrl, 500);
    const market = findBestBtc15mMarket(markets);

    if (!market?.ticker) {
      return NextResponse.json({
        market: null,
        orderbook: null,
        signal: { action: "pass", reason: "No BTC 15m market found." },
        candidates: rankCryptoMarkets(markets).slice(0, 10).map(({ market, score }) => ({
          ticker: market.ticker,
          title: market.title,
          subtitle: market.subtitle,
          score,
          volume: market.volume,
        })),
      });
    }

    const orderbook = await getKalshiOrderbook(baseUrl, market.ticker);
    const yesBid = bestBid(orderbook.orderbook_fp?.yes_dollars);
    const noBid = bestBid(orderbook.orderbook_fp?.no_dollars);
    const impliedYesAsk = noBid !== null ? Number((1 - noBid).toFixed(4)) : null;
    const spread = yesBid !== null && impliedYesAsk !== null ? Number((impliedYesAsk - yesBid).toFixed(4)) : null;

    let action = "watch";
    let side: "yes" | "no" | null = null;
    let maxPrice: number | null = null;
    let reason = "Spread or signal is not tight enough for a live entry.";

    if (spread !== null && spread <= 0.04 && yesBid !== null && yesBid < 0.48) {
      action = "consider_buy_yes";
      side = "yes";
      maxPrice = Math.round((yesBid + 0.02) * 100);
      reason = "YES side has a relatively cheap entry and spread is reasonably tight.";
    } else if (spread !== null && spread <= 0.04 && noBid !== null && noBid < 0.48) {
      action = "consider_buy_no";
      side = "no";
      maxPrice = Math.round((noBid + 0.02) * 100);
      reason = "NO side has a relatively cheap entry and spread is reasonably tight.";
    }

    return NextResponse.json({
      market,
      orderbook,
      signal: {
        action,
        side,
        maxPrice,
        spread,
        reason,
      },
      candidates: [],
      generatedAt: new Date().toISOString(),
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to load BTC 15m market.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
