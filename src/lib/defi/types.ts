export type ChainId = "arbitrum" | "base" | "optimism" | "bnb";

export type VenueKind = "dex-aggregator" | "perp-dex" | "oracle" | "subgraph" | "rpc";

export type StrategyFamily = "trend-momentum" | "mean-reversion" | "cross-venue-spread";

export type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type EnvironmentMode = "research" | "paper" | "live";

export type ModuleStage = "scaffold" | "planned" | "in-progress" | "ready" | "isolated";

export type OrderSide = "buy" | "sell";

export type PositionSide = "long" | "short" | "flat";

export type AssetKind = "native" | "erc20" | "perp-contract" | "lp-token" | "stablecoin";

export interface TokenRef {
  chainId: ChainId;
  symbol: string;
  name: string;
  address?: string;
  decimals: number;
  kind: AssetKind;
}

export interface TradingPair {
  base: TokenRef;
  quote: TokenRef;
  symbol: string;
}

export interface ChainConfig {
  id: ChainId;
  name: string;
  enabled: boolean;
  rpcUrls: string[];
  nativeToken: string;
  explorerUrl: string;
  priority: number;
}

export interface VenueConfig {
  id: string;
  name: string;
  kind: VenueKind;
  chainIds: ChainId[];
  enabled: boolean;
  capabilities: string[];
  notes: string;
}

export interface CostModel {
  venueId: string;
  makerBps?: number;
  takerBps?: number;
  estimatedGasUsd: number;
  slippageBpsCeiling: number;
}

export interface Candle {
  venueId: string;
  pair: string;
  timeframe: Timeframe;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSnapshot {
  venueId: string;
  chainId: ChainId;
  pair: string;
  timestamp: string;
  midPrice: number;
  spreadBps: number;
  fundingRateHourly?: number;
  openInterestUsd?: number;
  liquidityUsd?: number;
}

export interface PortfolioPosition {
  venueId: string;
  pair: string;
  side: PositionSide;
  quantity: number;
  entryPrice: number;
  markPrice: number;
  unrealizedPnlUsd: number;
}

export interface PortfolioSnapshot {
  asOf: string;
  accountValueUsd: number;
  cashUsd: number;
  positions: PortfolioPosition[];
  dailyPnlUsd: number;
  drawdownPct: number;
}

export interface StrategyIndicatorSnapshot {
  emaFast: number | null;
  emaSlow: number | null;
  atr: number | null;
  atrPct: number | null;
  rsi: number | null;
  breakoutLevel: number | null;
  breakdownLevel: number | null;
  lastClose: number | null;
}

export interface SignalDecision {
  strategyId: string;
  family: StrategyFamily;
  pair: string;
  venueId: string;
  timeframe: Timeframe;
  action: "enter-long" | "enter-short" | "reduce" | "exit" | "wait";
  confidence: number;
  rationale: string[];
  generatedAt: string;
  indicators?: StrategyIndicatorSnapshot;
}

export interface RiskCheckResult {
  accepted: boolean;
  summary: string;
  violations: string[];
}

export interface ExecutionIntent {
  strategyId: string;
  venueId: string;
  chainId: ChainId;
  pair: string;
  side: OrderSide;
  notionalUsd: number;
  maxSlippageBps: number;
  mode: EnvironmentMode;
}

export interface RiskCheckReport {
  accepted: boolean;
  summary: string;
  checks: RiskCheckResult[];
}

export interface PaperPosition {
  pair: string;
  venueId: string;
  side: PositionSide;
  quantity: number;
  entryPrice: number;
  markPrice: number;
  notionalUsd: number;
}

export interface PaperExecutionReceipt {
  accepted: boolean;
  reference: string;
  mode: Extract<EnvironmentMode, "paper">;
  intent: ExecutionIntent;
  fillPrice: number;
  estimatedFeeUsd: number;
  estimatedGasUsd: number;
  positionAfter: PaperPosition | null;
  notes: string[];
  timestamp: string;
}

export interface DeFiResearchSliceResult {
  strategy: StrategyDefinition;
  signal: SignalDecision;
  portfolio: PortfolioSnapshot;
  snapshot: MarketSnapshot | null;
  risk: RiskCheckReport;
  executionPreview: {
    expectedPrice: number;
    estimatedFeeUsd: number;
    estimatedGasUsd: number;
  } | null;
  execution: PaperExecutionReceipt | null;
  candles: Candle[];
 }

export interface StrategyDefinition {
  id: string;
  name: string;
  family: StrategyFamily;
  description: string;
  status: ModuleStage;
  preferredTimeframes: Timeframe[];
  preferredVenueKinds: VenueKind[];
  riskNotes: string[];
}

export interface ModuleBoundary {
  moduleId: string;
  title: string;
  stage: ModuleStage;
  responsibilities: string[];
  nextTargets: string[];
}

export interface LegacySurfaceAssessment {
  surface: string;
  classification: "reuse" | "isolate" | "deprecate-later";
  reason: string;
}
