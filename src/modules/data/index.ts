import type { Candle, MarketSnapshot, ModuleBoundary, Timeframe } from "../../domain/types.js";

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

export const dataModuleBoundary: ModuleBoundary = {
  moduleId: "data",
  title: "Market data and ingestion",
  stage: "scaffold",
  responsibilities: [
    "Normalize candles, venue metrics, and liquidity state.",
    "Provide the future home for backfill and realtime ingestion adapters.",
  ],
  nextTargets: ["Add fixture-backed adapters", "Add timestamp normalization utilities"],
};
