import type { ChainConfig, CostModel, StrategyDefinition, VenueConfig } from "@/lib/defi/types";

export const chainRegistry: ChainConfig[] = [
  {
    id: "base",
    name: "Base",
    enabled: true,
    rpcUrls: [],
    nativeToken: "ETH",
    explorerUrl: "https://basescan.org",
    priority: 1,
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    enabled: true,
    rpcUrls: [],
    nativeToken: "ETH",
    explorerUrl: "https://arbiscan.io",
    priority: 2,
  },
  {
    id: "optimism",
    name: "Optimism",
    enabled: true,
    rpcUrls: [],
    nativeToken: "ETH",
    explorerUrl: "https://optimistic.etherscan.io",
    priority: 3,
  },
  {
    id: "bnb",
    name: "BNB Chain",
    enabled: false,
    rpcUrls: [],
    nativeToken: "BNB",
    explorerUrl: "https://bscscan.com",
    priority: 4,
  },
];

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
    notes: "Used later for replayable DeFi market state and liquidity signals.",
  },
];

export const strategyRegistry: StrategyDefinition[] = [
  {
    id: "trend-breakout-v1",
    name: "Trend + Momentum Breakout",
    family: "trend-momentum",
    description: "Initial baseline family for liquid majors on spot and perp venues.",
    status: "ready",
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
