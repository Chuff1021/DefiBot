import type { ExecutionIntent, ModuleBoundary, PortfolioSnapshot, RiskCheckReport, RiskCheckResult, SignalDecision } from "@/lib/defi/types";

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
  maxSingleTradeNotionalUsd: 18,
};

function createCheckResult(accepted: boolean, summary: string, violations: string[] = []): RiskCheckResult {
  return { accepted, summary, violations };
}

export const dailyDrawdownRule: RiskRule = {
  id: "daily-drawdown-cap",
  description: "Reject new exposure once daily drawdown breaches the small-account cap.",
  check: ({ portfolio }) => {
    const accepted = portfolio.drawdownPct < defaultRiskGuardrails.maxDailyDrawdownPct;

    return createCheckResult(
      accepted,
      accepted
        ? `Drawdown ${portfolio.drawdownPct.toFixed(2)}% remains below the ${defaultRiskGuardrails.maxDailyDrawdownPct}% cap.`
        : `Drawdown ${portfolio.drawdownPct.toFixed(2)}% breached the ${defaultRiskGuardrails.maxDailyDrawdownPct}% cap.`,
      accepted ? [] : ["daily-drawdown-limit"],
    );
  },
};

export const maxOpenPositionsRule: RiskRule = {
  id: "max-open-positions",
  description: "Keep position count small for a $100 paper account.",
  check: ({ portfolio }) => {
    const accepted = portfolio.positions.length < defaultRiskGuardrails.maxOpenPositions;

    return createCheckResult(
      accepted,
      accepted
        ? `Open positions ${portfolio.positions.length}/${defaultRiskGuardrails.maxOpenPositions} within cap.`
        : `Open positions ${portfolio.positions.length}/${defaultRiskGuardrails.maxOpenPositions} exceeded.`,
      accepted ? [] : ["open-position-limit"],
    );
  },
};

export const maxPositionSizeRule: RiskRule = {
  id: "max-position-size",
  description: "Limit single-trade notional for a small paper account.",
  check: ({ intent, portfolio }) => {
    const maxByPct = portfolio.accountValueUsd * (defaultRiskGuardrails.maxPositionNotionalPct / 100);
    const accepted =
      intent.notionalUsd <= maxByPct && intent.notionalUsd <= defaultRiskGuardrails.maxSingleTradeNotionalUsd;

    return createCheckResult(
      accepted,
      accepted
        ? `Trade notional $${intent.notionalUsd.toFixed(2)} stays within small-account limits.`
        : `Trade notional $${intent.notionalUsd.toFixed(2)} exceeds sizing limits of $${Math.min(maxByPct, defaultRiskGuardrails.maxSingleTradeNotionalUsd).toFixed(2)}.`,
      accepted ? [] : ["position-size-limit"],
    );
  },
};

export const signalQualityRule: RiskRule = {
  id: "signal-quality",
  description: "Only allow entries with sufficient confidence and rationale depth.",
  check: ({ signal }) => {
    const actionable = signal.action === "enter-long" || signal.action === "enter-short";
    const accepted = !actionable || (signal.confidence >= 0.6 && signal.rationale.length >= 3);

    return createCheckResult(
      accepted,
      accepted ? "Signal quality is sufficient for paper execution." : "Signal quality is below the entry threshold.",
      accepted ? [] : ["signal-quality-threshold"],
    );
  },
};

export const smallAccountRiskRules: RiskRule[] = [
  dailyDrawdownRule,
  maxOpenPositionsRule,
  maxPositionSizeRule,
  signalQualityRule,
];

export function evaluateRiskRules(input: {
  signal: SignalDecision;
  intent: ExecutionIntent;
  portfolio: PortfolioSnapshot;
}): RiskCheckReport {
  const checks = smallAccountRiskRules.map((rule) => rule.check(input));
  const accepted = checks.every((check) => check.accepted);

  return {
    accepted,
    summary: accepted ? "All small-account paper-trading risk checks passed." : "One or more paper-trading risk checks failed.",
    checks,
  };
}

export const riskModuleBoundary: ModuleBoundary = {
  moduleId: "risk",
  title: "Risk controls module",
  stage: "ready",
  responsibilities: [
    "Centralize pre-trade and portfolio-level risk policy evaluation.",
    "Enforce fee, slippage, and drawdown guardrails before execution.",
  ],
  nextTargets: ["Add net-edge policy using real cost attribution", "Add time-in-trade and cooldown policies"],
};
