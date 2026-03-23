import type { StrategyDefinition } from "../domain/types.js";

export const strategyRegistry: StrategyDefinition[] = [
  {
    id: "trend-breakout-v1",
    name: "Trend + Momentum Breakout",
    family: "trend-momentum",
    description: "Baseline strategy family for liquid majors on spot and perp venues.",
    status: "scaffold",
    preferredTimeframes: ["5m", "15m", "1h", "4h"],
    preferredVenueKinds: ["dex-aggregator", "perp-dex"],
    riskNotes: ["Require fee-aware edge threshold", "Use ATR-scaled stops before automation"],
  },
  {
    id: "mean-reversion-v1",
    name: "Mean Reversion + Regime Rotation",
    family: "mean-reversion",
    description: "Range-biased strategy family for liquid spot pairs with strong filters.",
    status: "scaffold",
    preferredTimeframes: ["5m", "15m", "1h"],
    preferredVenueKinds: ["dex-aggregator"],
    riskNotes: ["Disable during trend regimes", "Enforce cooldown and time-in-trade limits"],
  },
  {
    id: "spread-funding-v1",
    name: "Cross-Venue Spread + Funding Capture",
    family: "cross-venue-spread",
    description: "DeFi-native spread and basis research family reserved for later phases.",
    status: "planned",
    preferredTimeframes: ["1m", "5m", "15m"],
    preferredVenueKinds: ["dex-aggregator", "perp-dex"],
    riskNotes: ["Only route if gas + slippage edge remains positive", "Monitor hedge drift continuously"],
  },
];
