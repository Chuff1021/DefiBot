export type VenueId = "hyperliquid" | "drift" | "vertex";

export type StrategyId =
  | "micro-reversion-maker"
  | "trend-breakout-perp"
  | "funding-basis-carry";

export type StrategyProfile = {
  id: StrategyId;
  name: string;
  style: string;
  whyItFitsSmallBalance: string;
  coreEdge: string;
  feePosture: string;
  venues: VenueId[];
  timeframes: string[];
  instruments: string[];
  risks: string[];
  status: "research-priority" | "secondary" | "later";
};

export type MarketCandle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type OrderBookLevel = {
  price: number;
  size: number;
};

export type VenueSnapshot = {
  venue: VenueId;
  label: string;
  makerFeeBps: number;
  takerFeeBps: number;
  notes: string;
};

export type ResearchSource = {
  label: string;
  url: string;
  note: string;
};

export type StrategyAction = "long" | "short" | "wait";

export type StrategyDecision = {
  strategyId: StrategyId;
  strategyName: string;
  action: StrategyAction;
  confidence: number;
  rationale: string[];
  timeframe: string;
  expectedEntry: number | null;
  stopLoss: number | null;
  takeProfit: number | null;
  positionSizeUsd: number;
  feeEstimateUsd: number;
  slippageBps: number;
  riskReward: number | null;
};

export type BacktestSummary = {
  strategyId: StrategyId;
  strategyName: string;
  trades: number;
  winRatePct: number;
  netPnlUsd: number;
  netPnlPct: number;
  maxDrawdownPct: number;
  profitFactor: number;
  status: "promising" | "needs-work" | "not-tradeable";
};
