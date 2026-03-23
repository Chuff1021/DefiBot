type Market = {
  ticker?: string;
  event_ticker?: string;
  title?: string;
  yes_bid_dollars?: string;
  yes_ask_dollars?: string;
  volume?: number;
  status?: string;
  subtitle?: string;
};

type Strategy = {
  id: string;
  name: string;
  market: string;
  description: string;
  promptProfile: string;
};

function asNumber(value?: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function marketMid(market: Market) {
  const bid = asNumber(market.yes_bid_dollars);
  const ask = asNumber(market.yes_ask_dollars);
  if (bid === null && ask === null) return null;
  if (bid === null) return ask;
  if (ask === null) return bid;
  return (bid + ask) / 2;
}

function scoreFedMarket(market: Market) {
  const text = `${market.title ?? ""} ${market.subtitle ?? ""} ${market.ticker ?? ""} ${market.event_ticker ?? ""}`.toLowerCase();
  const isFedLike = text.includes("fed") || text.includes("cpi") || text.includes("inflation") || text.includes("rate");
  if (!isFedLike) return 0;
  let score = 0;
  if (text.includes("fed")) score += 4;
  if (text.includes("cpi") || text.includes("inflation")) score += 3;
  if (text.includes("rate")) score += 2;
  if (text.includes("march madness") || text.includes("ncaa") || text.includes("duke") || text.includes("uconn")) score -= 8;
  score += Math.min((market.volume ?? 0) / 100000, 4);
  const mid = marketMid(market);
  if (mid !== null && mid > 0.2 && mid < 0.8) score += 2;
  return score;
}

function scoreBtc15mMarket(market: Market) {
  const text = `${market.title ?? ""} ${market.subtitle ?? ""} ${market.ticker ?? ""} ${market.event_ticker ?? ""}`.toLowerCase();
  const isBtcLike = text.includes("btc") || text.includes("bitcoin");
  const isShortHorizon = text.includes("15 minute") || text.includes("15m") || text.includes("15 min");
  if (!isBtcLike || !isShortHorizon) return 0;
  let score = 0;
  score += 5;
  score += 5;
  if (text.includes("up or down") || text.includes("up/down")) score += 3;
  if (text.includes("march madness") || text.includes("ncaa") || text.includes("duke") || text.includes("uconn")) score -= 10;
  score += Math.min((market.volume ?? 0) / 50000, 5);
  const mid = marketMid(market);
  if (mid !== null && mid > 0.25 && mid < 0.75) score += 2;
  return score;
}

function scoreBtcRangeMarket(market: Market) {
  const text = `${market.title ?? ""} ${market.subtitle ?? ""} ${market.ticker ?? ""} ${market.event_ticker ?? ""}`.toLowerCase();
  const isBtcLike = text.includes("btc") || text.includes("bitcoin");
  const isRangeLike = text.includes("above") || text.includes("below") || text.includes("between");
  if (!isBtcLike || !isRangeLike) return 0;
  let score = 0;
  score += 4;
  score += 2;
  if (text.includes("15 minute") || text.includes("15m") || text.includes("15 min")) score -= 2;
  if (text.includes("march madness") || text.includes("ncaa") || text.includes("duke") || text.includes("uconn")) score -= 8;
  score += Math.min((market.volume ?? 0) / 100000, 4);
  const mid = marketMid(market);
  if (mid !== null && mid > 0.2 && mid < 0.8) score += 2;
  return score;
}

function selectMarket(strategyId: string, markets: Market[]) {
  const scorer =
    strategyId === "fed-event-drift"
      ? scoreFedMarket
      : strategyId === "btc-15m-pulse"
        ? scoreBtc15mMarket
        : scoreBtcRangeMarket;

  return [...markets]
    .map((market) => ({ market, score: scorer(market) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.market.volume ?? 0) - (a.market.volume ?? 0))[0];
}

function buildAction(mid: number | null) {
  if (mid === null) return { action: "watch", confidence: "low" };
  if (mid >= 0.35 && mid <= 0.65) return { action: "watch", confidence: "medium" };
  if (mid < 0.35) return { action: "buy_yes_small", confidence: "medium" };
  if (mid > 0.65) return { action: "buy_no_small", confidence: "medium" };
  return { action: "pass", confidence: "low" };
}

export function generateLocalStrategyAnalysis(input: {
  strategy: Strategy;
  markets: Market[];
  allocation?: number;
}) {
  const selected = selectMarket(input.strategy.id, input.markets);
  const market = selected?.market;
  const mid = market ? marketMid(market) : null;
  const { action, confidence } = buildAction(mid);
  const candidateTicker = market?.ticker ?? "no-match";
  const volume = market?.volume ?? 0;
  const bid = market?.yes_bid_dollars ?? "--";
  const ask = market?.yes_ask_dollars ?? "--";
  const allocationText = input.allocation ? `$${input.allocation.toFixed(2)}` : "small size";

  return {
    summary: market
      ? `${input.strategy.name} selected ${market.title ?? market.ticker ?? "the current market"} because it best matches the current rule set and liquidity filter. Keep size at ${allocationText} or less until you validate fills and spreads manually.`
      : `No matching live market was found for ${input.strategy.name} in the current scan. Wait for a cleaner setup instead of forcing a trade.`,
    action: market ? action : "pass",
    confidence: market ? confidence : "low",
    risk:
      !market
        ? `Do not force a position. Preserve bankroll until a market in ${input.strategy.market} actually appears with enough liquidity.`
        : action === "watch"
        ? "Wait for a sharper catalyst, tighter spread, or a stronger consensus-vs-price gap."
        : `Use ${allocationText} max, require a manual spread check, and avoid adding if total exposure is already near your account cap.`,
    candidateTicker,
    notes: [
      `Strategy focus: ${input.strategy.market}.`,
      `Best match score: ${selected?.score?.toFixed(1) ?? "none"} with volume ${volume}.`,
      `Current yes bid/ask: ${bid} / ${ask}.`,
      "Only consider contracts with clear settlement rules and enough liquidity to exit without getting trapped.",
      "With a sub-$20 bankroll, avoid stacking correlated positions and keep two open trades max.",
    ],
  };
}
