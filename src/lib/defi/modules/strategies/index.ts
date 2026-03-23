import { strategyRegistry } from "@/lib/defi/config";
import { getFixtureCandles, getFixtureSnapshot } from "@/lib/defi/modules/data";
import { simulatePaperExecution, PaperExecutionAdapter } from "@/lib/defi/modules/execution";
import { computeAtrSeries, computeEmaSeries, computeRsiSeries, getLatestIndicatorValue } from "@/lib/defi/modules/indicators";
import { getFixturePortfolioSnapshot } from "@/lib/defi/modules/portfolio";
import { evaluateRiskRules } from "@/lib/defi/modules/risk";
import type { Candle, DeFiResearchSliceResult, ExecutionIntent, MarketSnapshot, ModuleBoundary, PortfolioSnapshot, SignalDecision, StrategyDefinition } from "@/lib/defi/types";

export interface StrategyEvaluationContext {
  strategy: StrategyDefinition;
  candles: Candle[];
  snapshot: MarketSnapshot | null;
  portfolio: PortfolioSnapshot;
}

export interface StrategyModule {
  id: string;
  evaluate(context: StrategyEvaluationContext): Promise<SignalDecision | null>;
}

function getRangeHigh(candles: Candle[], length: number): number | null {
  const sample = candles.slice(-(length + 1), -1);
  if (sample.length < length) {
    return null;
  }

  return Math.max(...sample.map((candle) => candle.high));
}

function getRangeLow(candles: Candle[], length: number): number | null {
  const sample = candles.slice(-(length + 1), -1);
  if (sample.length < length) {
    return null;
  }

  return Math.min(...sample.map((candle) => candle.low));
}

export class TrendMomentumBreakoutStrategy implements StrategyModule {
  id = "trend-breakout-v1";

  async evaluate(context: StrategyEvaluationContext): Promise<SignalDecision | null> {
    const latestCandle = context.candles[context.candles.length - 1];
    if (!latestCandle) {
      return null;
    }

    const emaFast = getLatestIndicatorValue(computeEmaSeries(context.candles, 5));
    const emaSlow = getLatestIndicatorValue(computeEmaSeries(context.candles, 12));
    const atr = getLatestIndicatorValue(computeAtrSeries(context.candles, 14));
    const rsi = getLatestIndicatorValue(computeRsiSeries(context.candles, 14));
    const breakoutLevel = getRangeHigh(context.candles, 5);
    const breakdownLevel = getRangeLow(context.candles, 5);
    const atrPct = atr && latestCandle.close > 0 ? Number(((atr / latestCandle.close) * 100).toFixed(4)) : null;

    const longBias =
      emaFast !== null &&
      emaSlow !== null &&
      breakoutLevel !== null &&
      rsi !== null &&
      latestCandle.close > breakoutLevel &&
      emaFast > emaSlow &&
      rsi >= 58;

    const shortBias =
      emaFast !== null &&
      emaSlow !== null &&
      breakdownLevel !== null &&
      rsi !== null &&
      latestCandle.close < breakdownLevel &&
      emaFast < emaSlow &&
      rsi <= 42;

    const rationale = [
      emaFast !== null && emaSlow !== null
        ? `EMA regime ${emaFast > emaSlow ? "bullish" : "bearish"} (${emaFast.toFixed(2)} vs ${emaSlow.toFixed(2)}).`
        : "EMA regime unavailable.",
      breakoutLevel !== null ? `Breakout trigger ${breakoutLevel.toFixed(2)} with last close ${latestCandle.close.toFixed(2)}.` : "Breakout range unavailable.",
      rsi !== null ? `RSI momentum ${rsi.toFixed(2)}.` : "RSI unavailable.",
      atrPct !== null ? `ATR volatility ${atrPct.toFixed(2)}% of price.` : "ATR unavailable.",
      `Current portfolio drawdown ${context.portfolio.drawdownPct.toFixed(2)}% on a $${context.portfolio.accountValueUsd.toFixed(2)} account.`,
    ];

    const action = longBias ? "enter-long" : shortBias ? "enter-short" : "wait";
    const confidence = longBias || shortBias ? 0.74 : 0.38;

    return {
      strategyId: context.strategy.id,
      family: context.strategy.family,
      pair: latestCandle.pair,
      venueId: latestCandle.venueId,
      timeframe: latestCandle.timeframe,
      action,
      confidence,
      rationale,
      generatedAt: new Date().toISOString(),
      indicators: {
        emaFast,
        emaSlow,
        atr,
        atrPct,
        rsi,
        breakoutLevel,
        breakdownLevel,
        lastClose: latestCandle.close,
      },
    };
  }
}

export function buildPaperIntent(signal: SignalDecision, snapshot: MarketSnapshot | null, portfolio: PortfolioSnapshot): ExecutionIntent {
  const referencePrice = snapshot?.midPrice ?? signal.indicators?.lastClose ?? 0;
  const baseRiskBudget = Number((portfolio.accountValueUsd * 0.15).toFixed(2));
  const notionalUsd = Math.min(baseRiskBudget, 18);

  return {
    strategyId: signal.strategyId,
    venueId: signal.venueId,
    chainId: snapshot?.chainId ?? "arbitrum",
    pair: signal.pair,
    side: signal.action === "enter-short" ? "sell" : "buy",
    notionalUsd: referencePrice > 0 ? notionalUsd : 0,
    maxSlippageBps: 15,
    mode: "paper",
  };
}

export async function runFixtureBackedResearchSlice(): Promise<DeFiResearchSliceResult> {
  const strategy = strategyRegistry.find((item) => item.id === "trend-breakout-v1") ?? strategyRegistry[0];
  if (!strategy) {
    throw new Error("Trend breakout strategy registry entry is unavailable.");
  }

  const candles = await getFixtureCandles(30);
  const snapshot = await getFixtureSnapshot();
  const portfolio = await getFixturePortfolioSnapshot();
  const strategyModule = new TrendMomentumBreakoutStrategy();
  const signal = await strategyModule.evaluate({ strategy, candles, snapshot, portfolio });

  if (!signal) {
    throw new Error("Fixture-backed strategy evaluation did not produce a signal.");
  }

  const intent = buildPaperIntent(signal, snapshot, portfolio);
  const risk = evaluateRiskRules({ signal, intent, portfolio });
  const executionAdapter = new PaperExecutionAdapter();
  const executionPreview = signal.action === "wait" ? null : await executionAdapter.preview(intent);
  const execution = signal.action === "wait" || !risk.accepted ? null : await simulatePaperExecution(intent);

  return {
    strategy,
    signal,
    portfolio,
    snapshot,
    risk,
    executionPreview,
    execution,
    candles,
  };
}

export const strategyModuleBoundary: ModuleBoundary = {
  moduleId: "strategies",
  title: "Strategy evaluation module",
  stage: "ready",
  responsibilities: [
    "Define a single signal output shape across research, paper, and live flows.",
    "Keep family registration separate from concrete indicator implementations.",
  ],
  nextTargets: ["Add strategy parameter schemas", "Add second regime-aware strategy prototype"],
};

export const defiStrategyRegistry = strategyRegistry;
