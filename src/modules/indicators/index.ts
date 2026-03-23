import type { Candle, ModuleBoundary } from "../../domain/types.js";

export interface IndicatorSeriesPoint {
  timestamp: string;
  value: number;
}

export interface IndicatorDefinition<TParams> {
  id: string;
  name: string;
  compute(input: Candle[], params: TParams): IndicatorSeriesPoint[];
}

export const indicatorModuleBoundary: ModuleBoundary = {
  moduleId: "indicators",
  title: "Indicator pipeline",
  stage: "scaffold",
  responsibilities: [
    "Expose indicator computation as pure data transforms.",
    "Keep feature engineering separate from strategy evaluation logic.",
  ],
  nextTargets: ["Implement EMA", "Implement ATR", "Implement RSI"],
};
