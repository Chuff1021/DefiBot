import { strategyProfiles, venueSnapshots } from "@/lib/research";
import type { BacktestSummary, MarketCandle, OrderBookLevel, StrategyDecision, StrategyProfile, VenueSnapshot } from "@/lib/types";

type StrategyContext = {
  candles: MarketCandle[];
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  bankrollUsd?: number;
};

export function generateStrategyDecisions(context: StrategyContext): StrategyDecision[] {
  return [
    buildMicroReversionDecision(context),
    buildTrendBreakoutDecision(context),
    buildFundingCarryDecision(),
  ];
}

export function runBacktestSummaries(context: StrategyContext): BacktestSummary[] {
  return [
    runRollingBacktest(strategyProfiles[0], context, "mean-reversion"),
    runRollingBacktest(strategyProfiles[1], context, "breakout"),
    {
      strategyId: strategyProfiles[2].id,
      strategyName: strategyProfiles[2].name,
      trades: 0,
      winRatePct: 0,
      netPnlUsd: 0,
      netPnlPct: 0,
      maxDrawdownPct: 0,
      profitFactor: 0,
      status: "needs-work",
    },
  ];
}

function buildMicroReversionDecision(context: StrategyContext): StrategyDecision {
  const recent = context.candles.slice(-20);
  const last = recent.at(-1);
  const bestBid = context.bids[0]?.price ?? last?.close ?? 0;
  const bestAsk = context.asks[0]?.price ?? last?.close ?? 0;

  if (!last || recent.length < 10) {
    return idleDecision(strategyProfiles[0], "1m", ["Not enough candles yet for micro-reversion evaluation."]);
  }

  const mean = average(recent.map((candle) => candle.close));
  const deviationPct = ((last.close - mean) / mean) * 100;
  const topBidDepth = sum(context.bids.slice(0, 3).map((level) => level.size));
  const topAskDepth = sum(context.asks.slice(0, 3).map((level) => level.size));
  const imbalance = topBidDepth - topAskDepth;
  const bankrollUsd = context.bankrollUsd ?? 100;
  const positionSizeUsd = Number(Math.min(bankrollUsd * 0.18, 18).toFixed(2));
  const feeEstimateUsd = feeUsd(positionSizeUsd, "hyperliquid", "maker");

  if (deviationPct <= -0.12 && imbalance > 0) {
    return {
      strategyId: "micro-reversion-maker",
      strategyName: strategyProfiles[0].name,
      action: "long",
      confidence: 0.68,
      rationale: [
        `Price is ${Math.abs(deviationPct).toFixed(2)}% below the 20-bar mean.`,
        "Top-of-book depth favors bids, which supports a maker-first fade setup.",
      ],
      timeframe: "1m",
      expectedEntry: bestBid,
      stopLoss: Number((bestBid * 0.996).toFixed(2)),
      takeProfit: Number((mean * 0.999).toFixed(2)),
      positionSizeUsd,
      feeEstimateUsd,
      slippageBps: 0.8,
      riskReward: 1.6,
    };
  }

  if (deviationPct >= 0.12 && imbalance < 0) {
    return {
      strategyId: "micro-reversion-maker",
      strategyName: strategyProfiles[0].name,
      action: "short",
      confidence: 0.66,
      rationale: [
        `Price is ${deviationPct.toFixed(2)}% above the 20-bar mean.`,
        "Ask depth dominates the top of book, which supports a passive fade setup.",
      ],
      timeframe: "1m",
      expectedEntry: bestAsk,
      stopLoss: Number((bestAsk * 1.004).toFixed(2)),
      takeProfit: Number((mean * 1.001).toFixed(2)),
      positionSizeUsd,
      feeEstimateUsd,
      slippageBps: 0.8,
      riskReward: 1.5,
    };
  }

  return idleDecision(strategyProfiles[0], "1m", [
    "Mean-reversion edge is not strong enough after fees.",
    "Order-book imbalance does not support a high-confidence passive fill.",
  ]);
}

function buildTrendBreakoutDecision(context: StrategyContext): StrategyDecision {
  const recent = context.candles.slice(-30);
  const last = recent.at(-1);

  if (!last || recent.length < 20) {
    return idleDecision(strategyProfiles[1], "5m", ["Not enough candles yet for breakout evaluation."]);
  }

  const prior = recent.slice(0, -1);
  const highest = Math.max(...prior.map((candle) => candle.high));
  const lowest = Math.min(...prior.map((candle) => candle.low));
  const avgVolume = average(prior.map((candle) => candle.volume));
  const bankrollUsd = context.bankrollUsd ?? 100;
  const positionSizeUsd = Number(Math.min(bankrollUsd * 0.22, 22).toFixed(2));
  const feeEstimateUsd = feeUsd(positionSizeUsd, "hyperliquid", "taker");
  const bestBid = context.bids[0]?.price ?? last.close;
  const bestAsk = context.asks[0]?.price ?? last.close;

  if (last.close > highest && last.volume > avgVolume * 1.18) {
    return {
      strategyId: "trend-breakout-perp",
      strategyName: strategyProfiles[1].name,
      action: "long",
      confidence: 0.61,
      rationale: [
        "Price has pushed above the recent breakout range.",
        "Volume expansion confirms the move better than a thin drift upward would.",
      ],
      timeframe: "5m",
      expectedEntry: bestAsk,
      stopLoss: Number((bestAsk * 0.992).toFixed(2)),
      takeProfit: Number((bestAsk * 1.016).toFixed(2)),
      positionSizeUsd,
      feeEstimateUsd,
      slippageBps: 2.8,
      riskReward: 2,
    };
  }

  if (last.close < lowest && last.volume > avgVolume * 1.18) {
    return {
      strategyId: "trend-breakout-perp",
      strategyName: strategyProfiles[1].name,
      action: "short",
      confidence: 0.6,
      rationale: [
        "Price has lost the recent support range.",
        "Volume confirms that the move is not just passive drift.",
      ],
      timeframe: "5m",
      expectedEntry: bestBid,
      stopLoss: Number((bestBid * 1.008).toFixed(2)),
      takeProfit: Number((bestBid * 0.984).toFixed(2)),
      positionSizeUsd,
      feeEstimateUsd,
      slippageBps: 2.8,
      riskReward: 2,
    };
  }

  return idleDecision(strategyProfiles[1], "5m", [
    "No clean breakout regime is active.",
    "The strategy should stay inactive rather than overtrade into noise.",
  ]);
}

function buildFundingCarryDecision(): StrategyDecision {
  return idleDecision(strategyProfiles[2], "1h", [
    "Funding and basis data are not wired yet.",
    "For a $100 account, carry remains research-only until collateral efficiency is modeled.",
  ]);
}

function runRollingBacktest(
  strategy: StrategyProfile,
  context: StrategyContext,
  mode: "mean-reversion" | "breakout",
): BacktestSummary {
  const candles = context.candles;
  const bankrollUsd = context.bankrollUsd ?? 100;
  let netPnlUsd = 0;
  let equity = bankrollUsd;
  let peak = bankrollUsd;
  let wins = 0;
  let losses = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  for (let index = 22; index < candles.length - 3; index += 1) {
    const window = candles.slice(index - 20, index + 1);
    const current = candles[index];
    const exit = candles[index + 3];

    if (!current || !exit) {
      continue;
    }

    const action =
      mode === "mean-reversion" ? backtestMeanReversionSignal(window) : backtestBreakoutSignal(window);

    if (action === "wait") {
      continue;
    }

    const direction = action === "long" ? 1 : -1;
    const entry = current.close;
    const exitPx = exit.close;
    const positionSizeUsd = bankrollUsd * (mode === "mean-reversion" ? 0.18 : 0.22);
    const rawReturnPct = ((exitPx - entry) / entry) * direction;
    const feeDragPct = mode === "mean-reversion" ? 0.0002 : 0.0007;
    const slippageDragPct = mode === "mean-reversion" ? 0.0001 : 0.00035;
    const pnlUsd = positionSizeUsd * (rawReturnPct - feeDragPct - slippageDragPct);

    netPnlUsd += pnlUsd;
    equity += pnlUsd;
    peak = Math.max(peak, equity);

    if (pnlUsd >= 0) {
      wins += 1;
      grossProfit += pnlUsd;
    } else {
      losses += 1;
      grossLoss += Math.abs(pnlUsd);
    }
  }

  const trades = wins + losses;
  const maxDrawdownPct = peak > 0 ? Number((((peak - equity) / peak) * 100).toFixed(2)) : 0;
  const netPnlPct = Number(((netPnlUsd / bankrollUsd) * 100).toFixed(2));
  const winRatePct = trades > 0 ? Number(((wins / trades) * 100).toFixed(2)) : 0;
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : Number(grossProfit.toFixed(2));

  return {
    strategyId: strategy.id,
    strategyName: strategy.name,
    trades,
    winRatePct,
    netPnlUsd: Number(netPnlUsd.toFixed(2)),
    netPnlPct,
    maxDrawdownPct,
    profitFactor,
    status: netPnlPct > 1.5 ? "promising" : netPnlPct > 0 ? "needs-work" : "not-tradeable",
  };
}

function backtestMeanReversionSignal(candles: MarketCandle[]): "long" | "short" | "wait" {
  const last = candles.at(-1);

  if (!last) {
    return "wait";
  }

  const mean = average(candles.map((candle) => candle.close));
  const deviationPct = ((last.close - mean) / mean) * 100;

  if (deviationPct <= -0.15) {
    return "long";
  }

  if (deviationPct >= 0.15) {
    return "short";
  }

  return "wait";
}

function backtestBreakoutSignal(candles: MarketCandle[]): "long" | "short" | "wait" {
  const last = candles.at(-1);
  const prior = candles.slice(0, -1);

  if (!last || prior.length === 0) {
    return "wait";
  }

  const highest = Math.max(...prior.map((candle) => candle.high));
  const lowest = Math.min(...prior.map((candle) => candle.low));
  const avgVolume = average(prior.map((candle) => candle.volume));

  if (last.close > highest && last.volume > avgVolume * 1.1) {
    return "long";
  }

  if (last.close < lowest && last.volume > avgVolume * 1.1) {
    return "short";
  }

  return "wait";
}

function idleDecision(strategy: StrategyProfile, timeframe: string, rationale: string[]): StrategyDecision {
  return {
    strategyId: strategy.id,
    strategyName: strategy.name,
    action: "wait",
    confidence: 0.35,
    rationale,
    timeframe,
    expectedEntry: null,
    stopLoss: null,
    takeProfit: null,
    positionSizeUsd: 0,
    feeEstimateUsd: 0,
    slippageBps: 0,
    riskReward: null,
  };
}

function feeUsd(positionSizeUsd: number, venueId: VenueSnapshot["venue"], mode: "maker" | "taker") {
  const venue = venueSnapshots.find((entry) => entry.venue === venueId) ?? venueSnapshots[0];
  const bps = mode === "maker" ? venue.makerFeeBps : venue.takerFeeBps;

  return Number(((positionSizeUsd * bps) / 10_000).toFixed(4));
}

function average(values: number[]) {
  return values.length > 0 ? sum(values) / values.length : 0;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}
