import type { ExecutionIntent, ModuleBoundary, PortfolioSnapshot, RiskCheckResult, SignalDecision } from "../../domain/types.js";

export interface RiskRule {
  id: string;
  description: string;
  check(input: { signal: SignalDecision; intent: ExecutionIntent; portfolio: PortfolioSnapshot }): RiskCheckResult;
}

export const defaultRiskGuardrails = {
  maxDailyDrawdownPct: 3,
  maxOpenPositions: 2,
  minNetEdgeBps: 25,
  maxPositionNotionalPct: 20,
};

export const riskModuleBoundary: ModuleBoundary = {
  moduleId: "risk",
  title: "Risk controls",
  stage: "scaffold",
  responsibilities: [
    "Centralize pre-trade and portfolio-level risk policy evaluation.",
    "Enforce fee, slippage, and drawdown guardrails before execution.",
  ],
  nextTargets: ["Implement daily drawdown policy", "Implement max exposure policy"],
};
