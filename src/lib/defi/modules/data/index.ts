import type { Candle, MarketSnapshot, ModuleBoundary, Timeframe } from "@/lib/defi/types";

const FIXTURE_VENUE_ID = "perp-primary";
const FIXTURE_PAIR = "WETH/USDC";
const FIXTURE_CHAIN_ID = "arbitrum" as const;
const FIXTURE_TIMEFRAME = "15m" as const;

const baseTimestamp = Date.UTC(2026, 2, 23, 0, 0, 0);

const closeSeries = [
  2448, 2454, 2459, 2466, 2472, 2478, 2484, 2489, 2496, 2501,
  2498, 2506, 2512, 2518, 2525, 2533, 2529, 2538, 2546, 2554,
  2562, 2558, 2566, 2571, 2578, 2586, 2593, 2589, 2602, 2616,
];

const candleFixtures: Candle[] = closeSeries.map((close, index) => {
  const previousClose = closeSeries[Math.max(index - 1, 0)] ?? close;
  const openBias = index % 2 === 0 ? -6 : 4;
  const open = Number((previousClose + openBias).toFixed(2));
  const high = Number((Math.max(open, close) + 9 + (index % 3)).toFixed(2));
  const low = Number((Math.min(open, close) - 8 - (index % 2)).toFixed(2));
  const volume = 1_000 + index * 75 + (index % 4) * 60;

  return {
    venueId: FIXTURE_VENUE_ID,
    pair: FIXTURE_PAIR,
    timeframe: FIXTURE_TIMEFRAME,
    timestamp: new Date(baseTimestamp + index * 15 * 60 * 1000).toISOString(),
    open,
    high,
    low,
    close,
    volume,
  };
});

const snapshotFixture: MarketSnapshot = {
  venueId: FIXTURE_VENUE_ID,
  chainId: FIXTURE_CHAIN_ID,
  pair: FIXTURE_PAIR,
  timestamp: candleFixtures[candleFixtures.length - 1]?.timestamp ?? new Date(baseTimestamp).toISOString(),
  midPrice: candleFixtures[candleFixtures.length - 1]?.close ?? 0,
  spreadBps: 8,
  fundingRateHourly: 0.0001,
  openInterestUsd: 1_850_000,
  liquidityUsd: 4_500_000,
};

export interface MarketDataRequest {
  venueId: string;
  pair: string;
  timeframe: Timeframe;
  limit: number;
}

export interface MarketDataAdapter {
  id: string;
  fetchCandles(request: MarketDataRequest): Promise<Candle[]>;
  fetchSnapshot(pair: string): Promise<MarketSnapshot | null>;
}

export interface DeFiFixtureMarket {
  venueId: string;
  pair: string;
  chainId: typeof FIXTURE_CHAIN_ID;
  timeframe: typeof FIXTURE_TIMEFRAME;
  candles: Candle[];
  snapshot: MarketSnapshot;
}

export const fixtureMarketData: DeFiFixtureMarket = {
  venueId: FIXTURE_VENUE_ID,
  pair: FIXTURE_PAIR,
  chainId: FIXTURE_CHAIN_ID,
  timeframe: FIXTURE_TIMEFRAME,
  candles: candleFixtures,
  snapshot: snapshotFixture,
};

export class FixtureMarketDataAdapter implements MarketDataAdapter {
  id = "fixture-market-data";

  async fetchCandles(request: MarketDataRequest): Promise<Candle[]> {
    if (
      request.venueId !== fixtureMarketData.venueId ||
      request.pair !== fixtureMarketData.pair ||
      request.timeframe !== fixtureMarketData.timeframe
    ) {
      return [];
    }

    return fixtureMarketData.candles.slice(-Math.max(request.limit, 1));
  }

  async fetchSnapshot(pair: string): Promise<MarketSnapshot | null> {
    return pair === fixtureMarketData.pair ? fixtureMarketData.snapshot : null;
  }
}

export async function getFixtureCandles(limit = 30): Promise<Candle[]> {
  const adapter = new FixtureMarketDataAdapter();
  return adapter.fetchCandles({
    venueId: fixtureMarketData.venueId,
    pair: fixtureMarketData.pair,
    timeframe: fixtureMarketData.timeframe,
    limit,
  });
}

export async function getFixtureSnapshot(): Promise<MarketSnapshot> {
  return fixtureMarketData.snapshot;
}

export const dataModuleBoundary: ModuleBoundary = {
  moduleId: "data",
  title: "DeFi market data module",
  stage: "ready",
  responsibilities: [
    "Keep normalized market data contracts separate from UI and execution logic.",
    "Provide a future home for candles, funding, liquidity, and gas ingestion.",
  ],
  nextTargets: ["Add timestamp normalization utilities", "Add multi-pair fixture coverage"],
};
