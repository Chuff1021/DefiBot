import { mockAsks, mockBids, mockCandles, mockMarketSummary } from "@/lib/mock-market";
import { strategyProfiles, venueSnapshots } from "@/lib/research";
import type { MarketCandle, OrderBookLevel } from "@/lib/types";

const HYPERLIQUID_MAINNET_API_URL = "https://api.hyperliquid.xyz";
const HYPERLIQUID_TESTNET_API_URL = "https://api.hyperliquid-testnet.xyz";
const DEFAULT_SYMBOL = "BTC";
const DEFAULT_INTERVAL = "1m";
const DEFAULT_LOOKBACK_CANDLES = 240;

type HyperliquidNetwork = "mainnet" | "testnet";

type HyperliquidLevel = {
  px: string;
  sz: string;
  n: number;
};

type HyperliquidBook = {
  coin: string;
  time: number;
  levels: [HyperliquidLevel[], HyperliquidLevel[]];
};

type HyperliquidCandle = {
  t: number;
  T: number;
  s: string;
  i: string;
  o: string | number;
  c: string | number;
  h: string | number;
  l: string | number;
  v: string | number;
  n: number;
};

export type MarketOverviewPayload = {
  ok: boolean;
  source: "live" | "mock";
  market: {
    symbol: string;
    quote: string;
    venue: string;
    lastPrice: number;
    markPrice: number;
    fundingRateHourlyPct: number | null;
    spreadBps: number;
    dayChangePct: number;
    volume24hUsd: number;
    realizedVolPct: number;
    updatedAt: string;
  };
  candles: MarketCandle[];
  orderBook: {
    asks: OrderBookLevel[];
    bids: OrderBookLevel[];
  };
  venues: typeof venueSnapshots;
  strategies: typeof strategyProfiles;
  meta: {
    network: HyperliquidNetwork;
    interval: string;
    websocketUrl: string;
    httpUrl: string;
  };
  error?: string;
};

export function getHyperliquidWsUrl(network: HyperliquidNetwork = "mainnet") {
  return `${getHyperliquidBaseUrl(network)}/ws`;
}

function getHyperliquidBaseUrl(network: HyperliquidNetwork = "mainnet") {
  return network === "testnet" ? HYPERLIQUID_TESTNET_API_URL : HYPERLIQUID_MAINNET_API_URL;
}

async function hyperliquidInfoRequest<T>(
  body: Record<string, unknown>,
  network: HyperliquidNetwork,
): Promise<T> {
  const response = await fetch(`${getHyperliquidBaseUrl(network)}/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Hyperliquid info request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function toOrderBookLevel(level: HyperliquidLevel): OrderBookLevel {
  return {
    price: Number(level.px),
    size: Number(level.sz),
  };
}

function toMarketCandle(candle: HyperliquidCandle): MarketCandle {
  return {
    time: new Date(candle.t).toISOString(),
    open: Number(candle.o),
    high: Number(candle.h),
    low: Number(candle.l),
    close: Number(candle.c),
    volume: Number(candle.v),
  };
}

function computeRealizedVolPct(candles: MarketCandle[]) {
  if (candles.length < 2) {
    return 0;
  }

  const returns: number[] = [];

  for (let index = 1; index < candles.length; index += 1) {
    const previous = candles[index - 1]?.close;
    const current = candles[index]?.close;

    if (!previous || !current) {
      continue;
    }

    returns.push(Math.log(current / previous));
  }

  if (returns.length === 0) {
    return 0;
  }

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance = returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / returns.length;

  return Number((Math.sqrt(variance) * 100).toFixed(2));
}

function getMockOverview(network: HyperliquidNetwork, interval: string, error: string): MarketOverviewPayload {
  return {
    ok: false,
    source: "mock",
    market: {
      ...mockMarketSummary,
      updatedAt: new Date().toISOString(),
    },
    candles: mockCandles,
    orderBook: {
      asks: mockAsks,
      bids: mockBids,
    },
    venues: venueSnapshots,
    strategies: strategyProfiles,
    meta: {
      network,
      interval,
      websocketUrl: getHyperliquidWsUrl(network),
      httpUrl: getHyperliquidBaseUrl(network),
    },
    error,
  };
}

export async function getMarketOverview(options?: {
  symbol?: string;
  interval?: string;
  network?: HyperliquidNetwork;
}): Promise<MarketOverviewPayload> {
  const symbol = options?.symbol ?? DEFAULT_SYMBOL;
  const interval = options?.interval ?? DEFAULT_INTERVAL;
  const network = options?.network ?? "mainnet";

  try {
    const endTime = Date.now();
    const startTime = endTime - DEFAULT_LOOKBACK_CANDLES * 60_000;

    const [allMids, l2Book, candles] = await Promise.all([
      hyperliquidInfoRequest<Record<string, string>>({ type: "allMids" }, network),
      hyperliquidInfoRequest<HyperliquidBook>({ type: "l2Book", coin: symbol }, network),
      hyperliquidInfoRequest<HyperliquidCandle[]>(
        {
          type: "candleSnapshot",
          req: {
            coin: symbol,
            interval,
            startTime,
            endTime,
          },
        },
        network,
      ),
    ]);

    const formattedCandles = candles.map(toMarketCandle);
    const bids = l2Book.levels[0].map(toOrderBookLevel);
    const asks = l2Book.levels[1].map(toOrderBookLevel);
    const lastPrice = Number(allMids[symbol] ?? formattedCandles.at(-1)?.close ?? 0);
    const bestBid = bids[0]?.price ?? lastPrice;
    const bestAsk = asks[0]?.price ?? lastPrice;
    const spreadBps = bestBid > 0 ? Number((((bestAsk - bestBid) / bestBid) * 10_000).toFixed(2)) : 0;
    const previousClose = formattedCandles.at(-2)?.close ?? lastPrice;
    const dayChangePct = previousClose > 0 ? Number((((lastPrice - previousClose) / previousClose) * 100).toFixed(2)) : 0;
    const volume24hUsd = Number(
      formattedCandles.reduce((sum, candle) => sum + candle.close * candle.volume, 0).toFixed(2),
    );

    return {
      ok: true,
      source: "live",
      market: {
        symbol,
        quote: "USDC",
        venue: network === "testnet" ? "Hyperliquid Testnet" : "Hyperliquid",
        lastPrice,
        markPrice: Number(((bestBid + bestAsk) / 2).toFixed(2)),
        fundingRateHourlyPct: null,
        spreadBps,
        dayChangePct,
        volume24hUsd,
        realizedVolPct: computeRealizedVolPct(formattedCandles),
        updatedAt: new Date(l2Book.time).toISOString(),
      },
      candles: formattedCandles,
      orderBook: {
        asks,
        bids,
      },
      venues: venueSnapshots,
      strategies: strategyProfiles,
      meta: {
        network,
        interval,
        websocketUrl: getHyperliquidWsUrl(network),
        httpUrl: getHyperliquidBaseUrl(network),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Hyperliquid fetch error";
    return getMockOverview(network, interval, message);
  }
}
