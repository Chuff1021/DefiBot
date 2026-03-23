import type { Candle, ModuleBoundary } from "@/lib/defi/types";

export interface IndicatorSeriesPoint {
  timestamp: string;
  value: number;
}

export interface IndicatorDefinition<TParams> {
  id: string;
  name: string;
  compute(input: Candle[], params: TParams): IndicatorSeriesPoint[];
}

function roundIndicator(value: number): number {
  return Number(value.toFixed(4));
}

export function computeEmaSeries(input: Candle[], period: number): IndicatorSeriesPoint[] {
  if (period <= 0 || input.length < period) {
    return [];
  }

  const multiplier = 2 / (period + 1);
  const seed = input.slice(0, period).reduce((sum, candle) => sum + candle.close, 0) / period;
  let previous = seed;

  return input.slice(period - 1).map((candle, index) => {
    const value = index === 0 ? seed : candle.close * multiplier + previous * (1 - multiplier);
    previous = value;

    return {
      timestamp: candle.timestamp,
      value: roundIndicator(value),
    };
  });
}

export function computeAtrSeries(input: Candle[], period: number): IndicatorSeriesPoint[] {
  if (period <= 0 || input.length <= period) {
    return [];
  }

  const trueRanges = input.map((candle, index) => {
    if (index === 0) {
      return candle.high - candle.low;
    }

    const previousClose = input[index - 1]?.close ?? candle.close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose),
    );
  });

  const seed = trueRanges.slice(1, period + 1).reduce((sum, value) => sum + value, 0) / period;
  let previousAtr = seed;

  return input.slice(period).map((candle, index) => {
    const trueRange = trueRanges[index + period] ?? 0;
    const value = index === 0 ? seed : (previousAtr * (period - 1) + trueRange) / period;
    previousAtr = value;

    return {
      timestamp: candle.timestamp,
      value: roundIndicator(value),
    };
  });
}

export function computeRsiSeries(input: Candle[], period: number): IndicatorSeriesPoint[] {
  if (period <= 0 || input.length <= period) {
    return [];
  }

  const deltas = input.slice(1).map((candle, index) => candle.close - (input[index]?.close ?? candle.close));
  const gains = deltas.map((delta) => Math.max(delta, 0));
  const losses = deltas.map((delta) => Math.max(-delta, 0));

  let averageGain = gains.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  let averageLoss = losses.slice(0, period).reduce((sum, value) => sum + value, 0) / period;

  return input.slice(period).map((candle, index) => {
    if (index > 0) {
      const gain = gains[index + period - 1] ?? 0;
      const loss = losses[index + period - 1] ?? 0;
      averageGain = (averageGain * (period - 1) + gain) / period;
      averageLoss = (averageLoss * (period - 1) + loss) / period;
    }

    const relativeStrength = averageLoss === 0 ? 100 : averageGain / averageLoss;
    const value = averageLoss === 0 ? 100 : 100 - 100 / (1 + relativeStrength);

    return {
      timestamp: candle.timestamp,
      value: roundIndicator(value),
    };
  });
}

export function getLatestIndicatorValue(series: IndicatorSeriesPoint[]): number | null {
  return series.length > 0 ? series[series.length - 1]?.value ?? null : null;
}

export const indicatorModuleBoundary: ModuleBoundary = {
  moduleId: "indicators",
  title: "Indicator pipeline module",
  stage: "ready",
  responsibilities: [
    "Expose indicator computation as pure data transforms.",
    "Prevent strategy logic from embedding venue-specific calculations directly.",
  ],
  nextTargets: ["Add indicator parameter registry", "Add volume and regime filters"],
};
