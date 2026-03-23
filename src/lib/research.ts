import type { ResearchSource, StrategyProfile, VenueSnapshot } from "@/lib/types";

export const venueSnapshots: VenueSnapshot[] = [
  {
    venue: "hyperliquid",
    label: "Hyperliquid",
    makerFeeBps: 1,
    takerFeeBps: 3.5,
    notes: "Strong candidate for a $100 start because fees are low and the API includes public market and order-book data.",
  },
  {
    venue: "drift",
    label: "Drift",
    makerFeeBps: 0,
    takerFeeBps: 3,
    notes: "Good perp venue to research next because the docs expose orderbook, user, and event streams for paper execution parity.",
  },
  {
    venue: "vertex",
    label: "Vertex",
    makerFeeBps: 0,
    takerFeeBps: 2,
    notes: "Worth adding after Hyperliquid because the hybrid order book design is suitable for low-slippage execution research.",
  },
];

export const strategyProfiles: StrategyProfile[] = [
  {
    id: "micro-reversion-maker",
    name: "Micro Reversion Maker",
    style: "Mean reversion with maker-first entries",
    whyItFitsSmallBalance:
      "Small balances get eaten by taker fees. This strategy only enters when spread, volatility, and imbalance allow passive limit placement.",
    coreEdge:
      "Fade short-term dislocations around VWAP and microstructure imbalance while forcing positive expected value after fees and slippage.",
    feePosture: "Maker-first. Reject any setup that requires urgent taker entry.",
    venues: ["hyperliquid", "vertex"],
    timeframes: ["15s", "1m", "5m"],
    instruments: ["BTC", "ETH", "SOL"],
    risks: ["Trend days can steamroll mean reversion", "Needs strict stop and regime filter"],
    status: "research-priority",
  },
  {
    id: "trend-breakout-perp",
    name: "Trend Breakout Perp",
    style: "Regime-filtered momentum breakout",
    whyItFitsSmallBalance:
      "A small account needs concentrated exposure only when volatility expansion is real. This keeps trade count low and avoids death by churn.",
    coreEdge:
      "Trade only when higher-timeframe trend, volume expansion, and local breakout align. Exit with ATR trailing logic and kill-switch drawdown rules.",
    feePosture: "Low trade frequency with narrow venue set to keep cumulative fees controlled.",
    venues: ["hyperliquid", "drift"],
    timeframes: ["5m", "15m", "1h"],
    instruments: ["BTC", "ETH", "SOL"],
    risks: ["False breakouts", "Needs strong daily loss cap"],
    status: "research-priority",
  },
  {
    id: "funding-basis-carry",
    name: "Funding Basis Carry",
    style: "Cross-venue carry and hedge",
    whyItFitsSmallBalance:
      "Potentially attractive later, but with only $100 the capital base is usually too small once collateral fragmentation and fees are included.",
    coreEdge:
      "Exploit persistent funding dislocations or spot-perp basis when hedge quality is high and net carry remains positive after all costs.",
    feePosture: "Only trade when hold-period edge dwarfs execution costs.",
    venues: ["hyperliquid", "drift"],
    timeframes: ["15m", "1h", "4h"],
    instruments: ["BTC", "ETH"],
    risks: ["Capital inefficiency at small size", "Hedge drift and liquidation risk"],
    status: "secondary",
  },
];

export const researchSources: ResearchSource[] = [
  {
    label: "Jesse",
    url: "https://jesse.trade/",
    note: "Backtesting, live and paper trading, multi-timeframe strategies, and interactive charts are core product ideas worth borrowing.",
  },
  {
    label: "Freqtrade Backtesting",
    url: "https://docs.freqtrade.io/en/2024.11/backtesting/",
    note: "Confirms the importance of repeatable historical datasets, explicit fee handling, and CLI-grade backtest ergonomics.",
  },
  {
    label: "Freqtrade Hyperopt",
    url: "https://www.freqtrade.io/en/stable/hyperopt/",
    note: "Supports building parameter search as a first-class system instead of hardcoding one-off settings.",
  },
  {
    label: "TradingView Lightweight Charts",
    url: "https://tradingview.github.io/lightweight-charts/",
    note: "Strong fit for fast interactive candlestick charts in a browser without dragging in a huge charting stack.",
  },
  {
    label: "Hyperliquid API",
    url: "https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api",
    note: "Public and testnet endpoints make it a sensible first data and paper-trading venue.",
  },
];
