import type { CostModel, VenueConfig } from "../domain/types.js";

export const venueRegistry: VenueConfig[] = [
  {
    id: "aggregator-primary",
    name: "Primary Spot Aggregator",
    kind: "dex-aggregator",
    chainIds: ["base", "arbitrum", "optimism"],
    enabled: true,
    capabilities: ["quote", "route-preview", "swap-intent"],
    notes: "Placeholder boundary for a low-fee spot routing integration.",
  },
  {
    id: "perp-primary",
    name: "Primary Perp Venue",
    kind: "perp-dex",
    chainIds: ["arbitrum", "base"],
    enabled: true,
    capabilities: ["mark-price", "funding", "order-intent", "position-sync"],
    notes: "Placeholder boundary for the first perp connector.",
  },
  {
    id: "market-data-subgraph",
    name: "Market Data Subgraph",
    kind: "subgraph",
    chainIds: ["base", "arbitrum", "optimism"],
    enabled: true,
    capabilities: ["historical-liquidity", "pool-state"],
    notes: "Reserved for replayable liquidity and market state ingestion.",
  },
];

export const defaultCostModels: CostModel[] = [
  {
    venueId: "aggregator-primary",
    estimatedGasUsd: 0.08,
    slippageBpsCeiling: 35,
    takerBps: 10,
  },
  {
    venueId: "perp-primary",
    estimatedGasUsd: 0.12,
    slippageBpsCeiling: 20,
    makerBps: 1,
    takerBps: 5,
  },
];
