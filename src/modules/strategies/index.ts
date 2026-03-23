import { strategyRegistry } from "../../config/strategies.js";
import type {
  Candle,
  MarketSnapshot,
  ModuleBoundary,
  PortfolioSnapshot,
  SignalDecision,
  StrategyDefinition,
} from "../../domain/types.js";

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

export const strategyModuleBoundary: ModuleBoundary = {
  moduleId: "strategies",
  title: "Strategy evaluation",
  stage: "scaffold",
  responsibilities: [
    "Define one signal output shape across research, paper, and live flows.",
    "Keep strategy registration separate from concrete indicator implementations.",
  ],
  nextTargets: ["Add trend breakout prototype", "Add parameter schemas"],
};

export const defiStrategyRegistry = strategyRegistry;
