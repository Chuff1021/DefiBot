import type { LegacySurfaceAssessment, ModuleBoundary } from "@/lib/defi/types";

export const reusableSurfaces: LegacySurfaceAssessment[] = [
  {
    surface: "src/app layout and navigation shell",
    classification: "reuse",
    reason: "The existing Next.js app router, global layout, and visual shell can host the DeFi control surfaces with minimal churn.",
  },
  {
    surface: "src/lib/env.ts",
    classification: "reuse",
    reason: "Environment parsing patterns are reusable and can expand to cover RPC, wallet, and venue credentials.",
  },
  {
    surface: "src/components shared console patterns",
    classification: "reuse",
    reason: "Console-style UI blocks are reusable for monitoring, risk, and strategy workspaces even if their data source changes.",
  },
];

export const isolatedLegacySurfaces: LegacySurfaceAssessment[] = [
  {
    surface: "src/lib/kalshi.ts and src/app/api/kalshi/*",
    classification: "isolate",
    reason: "Kalshi-specific transport and market schemas do not fit the DeFi execution model and should remain quarantined until replaced by venue adapters.",
  },
  {
    surface: "src/lib/strategy-engine.ts",
    classification: "isolate",
    reason: "The current strategy engine is tied to Kalshi contract metadata and should not become the base abstraction for DeFi strategies.",
  },
  {
    surface: "src/lib/trade-mock-data.ts",
    classification: "deprecate-later",
    reason: "Useful for current UI continuity, but its Kalshi-oriented mock vocabulary should be replaced by DeFi-native fixtures in later subtasks.",
  },
];

export const foundationBoundaries: ModuleBoundary[] = [
  {
    moduleId: "data",
    title: "Market data and ingestion",
    stage: "scaffold",
    responsibilities: ["Normalize candles and venue metrics", "Support backfill and realtime ingestion boundaries"],
    nextTargets: ["Add adapter interfaces", "Introduce replayable fixtures"],
  },
  {
    moduleId: "indicators",
    title: "Indicator pipeline",
    stage: "scaffold",
    responsibilities: ["Define indicator contracts", "Separate feature generation from strategy logic"],
    nextTargets: ["Add EMA/ATR/RSI implementations", "Add test fixtures"],
  },
  {
    moduleId: "strategies",
    title: "Strategy registry and evaluation boundary",
    stage: "scaffold",
    responsibilities: ["Register strategy families", "Define signal evaluation inputs and outputs"],
    nextTargets: ["Wire trend breakout prototype", "Add parameter schemas"],
  },
  {
    moduleId: "risk",
    title: "Risk engine",
    stage: "scaffold",
    responsibilities: ["Define pre-trade checks", "Centralize drawdown and cost guardrails"],
    nextTargets: ["Implement account-level checks", "Add exposure policies"],
  },
  {
    moduleId: "execution",
    title: "Execution router",
    stage: "scaffold",
    responsibilities: ["Translate intents to venue adapters", "Preserve paper/live mode separation"],
    nextTargets: ["Add quote adapter", "Add order intent validation"],
  },
  {
    moduleId: "portfolio",
    title: "Portfolio state",
    stage: "scaffold",
    responsibilities: ["Track balances and open positions", "Expose mark-to-market snapshots"],
    nextTargets: ["Add normalized portfolio store", "Add PnL attribution shape"],
  },
];
