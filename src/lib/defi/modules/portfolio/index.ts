import type { ModuleBoundary, PortfolioSnapshot } from "@/lib/defi/types";

export interface PortfolioStore {
  getSnapshot(): Promise<PortfolioSnapshot>;
  updateSnapshot(snapshot: PortfolioSnapshot): Promise<void>;
}

const fixturePortfolioSnapshot: PortfolioSnapshot = {
  asOf: "2026-03-23T07:15:00.000Z",
  accountValueUsd: 100,
  cashUsd: 82,
  positions: [
    {
      venueId: "aggregator-primary",
      pair: "WETH/USDC",
      side: "long",
      quantity: 0.0072,
      entryPrice: 2488,
      markPrice: 2616,
      unrealizedPnlUsd: 0.92,
    },
  ],
  dailyPnlUsd: 1.34,
  drawdownPct: 1.1,
};

export class FixturePortfolioStore implements PortfolioStore {
  private snapshot: PortfolioSnapshot = fixturePortfolioSnapshot;

  async getSnapshot(): Promise<PortfolioSnapshot> {
    return this.snapshot;
  }

  async updateSnapshot(snapshot: PortfolioSnapshot): Promise<void> {
    this.snapshot = snapshot;
  }
}

export async function getFixturePortfolioSnapshot(): Promise<PortfolioSnapshot> {
  return fixturePortfolioSnapshot;
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
  title: "Portfolio state module",
  stage: "ready",
  responsibilities: [
    "Provide a normalized account and position snapshot across venues.",
    "Give risk and analytics modules a stable read model.",
  ],
  nextTargets: ["Add persisted portfolio state", "Add realized/unrealized attribution fields"],
};
