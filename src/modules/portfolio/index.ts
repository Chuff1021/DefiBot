import type { ModuleBoundary, PortfolioSnapshot } from "../../domain/types.js";

export interface PortfolioStore {
  getSnapshot(): Promise<PortfolioSnapshot>;
  updateSnapshot(snapshot: PortfolioSnapshot): Promise<void>;
}

export const emptyPortfolioSnapshot: PortfolioSnapshot = {
  asOf: new Date(0).toISOString(),
  accountValueUsd: 0,
  cashUsd: 0,
  positions: [],
  dailyPnlUsd: 0,
  drawdownPct: 0,
};

export const portfolioModuleBoundary: ModuleBoundary = {
  moduleId: "portfolio",
  title: "Portfolio state",
  stage: "scaffold",
  responsibilities: [
    "Provide a normalized account and position snapshot across venues.",
    "Give risk and analytics modules a stable read model.",
  ],
  nextTargets: ["Add persisted portfolio state", "Add realized and unrealized attribution fields"],
};
