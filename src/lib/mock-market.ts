import type { MarketCandle, OrderBookLevel } from "@/lib/types";

const seedCandles = [
  [117420, 117480, 117360, 117450, 198],
  [117448, 117560, 117420, 117538, 235],
  [117540, 117620, 117510, 117582, 210],
  [117580, 117640, 117500, 117526, 244],
  [117522, 117600, 117480, 117568, 184],
  [117566, 117730, 117550, 117708, 262],
  [117710, 117820, 117680, 117792, 301],
  [117790, 117860, 117720, 117754, 229],
  [117756, 117808, 117690, 117702, 216],
  [117704, 117760, 117640, 117742, 174],
  [117744, 117886, 117734, 117864, 321],
  [117866, 117920, 117810, 117886, 248],
];

export const mockCandles: MarketCandle[] = seedCandles.map((entry, index) => {
  const timestamp = new Date(Date.now() - (seedCandles.length - index) * 60_000).toISOString();

  return {
    time: timestamp,
    open: entry[0],
    high: entry[1],
    low: entry[2],
    close: entry[3],
    volume: entry[4],
  };
});

const bestBid = 117882;
const spread = 4;

export const mockBids: OrderBookLevel[] = Array.from({ length: 8 }, (_, index) => ({
  price: bestBid - index * spread,
  size: 0.08 + index * 0.03,
}));

export const mockAsks: OrderBookLevel[] = Array.from({ length: 8 }, (_, index) => ({
  price: bestBid + spread + index * spread,
  size: 0.06 + index * 0.025,
}));

export const mockMarketSummary = {
  symbol: "BTC",
  quote: "USDC",
  venue: "Hyperliquid",
  lastPrice: 117886,
  markPrice: 117881.5,
  fundingRateHourlyPct: 0.0018,
  spreadBps: 0.34,
  dayChangePct: 1.92,
  volume24hUsd: 18_400_000,
  realizedVolPct: 2.7,
};
