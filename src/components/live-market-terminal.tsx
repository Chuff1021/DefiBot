"use client";

import { useEffect, useEffectEvent, useState } from "react";

import { OrderBook } from "@/components/order-book";
import { PriceChart } from "@/components/price-chart";
import { ResearchPanels } from "@/components/research-panels";
import { StrategyCard } from "@/components/strategy-card";
import type { MarketOverviewPayload } from "@/lib/hyperliquid";
import { strategyProfiles, venueSnapshots } from "@/lib/research";
import { generateStrategyDecisions, runBacktestSummaries } from "@/lib/strategy-engine";
import type { BacktestSummary, OrderBookLevel, StrategyDecision } from "@/lib/types";

type Props = {
  symbol?: string;
  interval?: string;
  network?: "mainnet" | "testnet";
};

type WsMessage = {
  channel?: string;
  data?: unknown;
};

type WsBook = {
  levels: [
    Array<{ px: string; sz: string }>,
    Array<{ px: string; sz: string }>
  ];
  time: number;
};

type WsCandle = {
  t: number;
  o: string | number;
  h: string | number;
  l: string | number;
  c: string | number;
  v: string | number;
};

export function LiveMarketTerminal({ symbol = "BTC", interval = "1m", network = "mainnet" }: Props) {
  const [overview, setOverview] = useState<MarketOverviewPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "degraded">("loading");
  const [decisions, setDecisions] = useState<StrategyDecision[]>([]);
  const [backtests, setBacktests] = useState<BacktestSummary[]>([]);

  const applyBook = useEffectEvent((book: WsBook) => {
    setOverview((current) => {
      if (!current) {
        return current;
      }

      const bids = book.levels[0].map(toBookLevel);
      const asks = book.levels[1].map(toBookLevel);
      const bestBid = bids[0]?.price ?? current.market.lastPrice;
      const bestAsk = asks[0]?.price ?? current.market.lastPrice;
      const spreadBps = bestBid > 0 ? Number((((bestAsk - bestBid) / bestBid) * 10_000).toFixed(2)) : current.market.spreadBps;

      return {
        ...current,
        source: "live",
        market: {
          ...current.market,
          markPrice: Number(((bestBid + bestAsk) / 2).toFixed(2)),
          spreadBps,
          updatedAt: new Date(book.time).toISOString(),
        },
        orderBook: {
          bids,
          asks,
        },
      };
    });
  });

  const applyCandle = useEffectEvent((incoming: WsCandle | WsCandle[]) => {
    const payload = Array.isArray(incoming) ? incoming.at(-1) : incoming;

    if (!payload) {
      return;
    }

    const candle = {
      time: new Date(payload.t).toISOString(),
      open: Number(payload.o),
      high: Number(payload.h),
      low: Number(payload.l),
      close: Number(payload.c),
      volume: Number(payload.v),
    };

    setOverview((current) => {
      if (!current) {
        return current;
      }

      const nextCandles = [...current.candles];
      const last = nextCandles.at(-1);

      if (last?.time === candle.time) {
        nextCandles[nextCandles.length - 1] = candle;
      } else {
        nextCandles.push(candle);
      }

      return {
        ...current,
        source: "live",
        market: {
          ...current.market,
          lastPrice: candle.close,
        },
        candles: nextCandles.slice(-240),
      };
    });
  });

  const applyMids = useEffectEvent((data: unknown) => {
    if (!data || typeof data !== "object" || !(symbol in data)) {
      return;
    }

    const nextPrice = Number((data as Record<string, string>)[symbol]);

    if (!Number.isFinite(nextPrice)) {
      return;
    }

    setOverview((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        source: "live",
        market: {
          ...current.market,
          lastPrice: nextPrice,
        },
      };
    });
  });

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      const response = await fetch(`/api/market/overview?symbol=${symbol}&interval=${interval}&network=${network}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as MarketOverviewPayload;

      if (cancelled) {
        return;
      }

      setOverview(data);
      setStatus(data.source === "live" ? "live" : "degraded");
      setDecisions(
        generateStrategyDecisions({
          candles: data.candles,
          bids: data.orderBook.bids,
          asks: data.orderBook.asks,
          bankrollUsd: 100,
        }),
      );
      setBacktests(
        runBacktestSummaries({
          candles: data.candles,
          bids: data.orderBook.bids,
          asks: data.orderBook.asks,
          bankrollUsd: 100,
        }),
      );
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [interval, network, symbol]);

  useEffect(() => {
    if (!overview?.meta.websocketUrl) {
      return;
    }

    const socket = new WebSocket(overview.meta.websocketUrl);

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ method: "subscribe", subscription: { type: "allMids" } }));
      socket.send(JSON.stringify({ method: "subscribe", subscription: { type: "candle", coin: symbol, interval } }));
      socket.send(JSON.stringify({ method: "subscribe", subscription: { type: "l2Book", coin: symbol } }));
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data) as WsMessage;

      if (message.channel === "allMids") {
        applyMids(message.data);
      }

      if (message.channel === "candle") {
        applyCandle(message.data as WsCandle | WsCandle[]);
      }

      if (message.channel === "l2Book") {
        applyBook(message.data as WsBook);
      }
    });

    socket.addEventListener("error", () => {
      setStatus((current) => (current === "loading" ? "degraded" : current));
    });

    return () => {
      socket.close();
    };
  }, [applyBook, applyCandle, applyMids, interval, overview?.meta.websocketUrl, symbol]);

  useEffect(() => {
    if (!overview) {
      return;
    }

    setDecisions(
      generateStrategyDecisions({
        candles: overview.candles,
        bids: overview.orderBook.bids,
        asks: overview.orderBook.asks,
        bankrollUsd: 100,
      }),
    );
    setBacktests(
      runBacktestSummaries({
        candles: overview.candles,
        bids: overview.orderBook.bids,
        asks: overview.orderBook.asks,
        bankrollUsd: 100,
      }),
    );
  }, [overview]);

  if (!overview) {
    return <main className="page-shell"><section className="hero-panel"><h1>Loading live market terminal...</h1></section></main>;
  }

  const sourceLabel = status === "live" ? "Live Hyperliquid feed" : overview.source === "mock" ? "Mock fallback" : "Snapshot loaded";
  const sourceTone = status === "live" ? "status-pill--live" : "status-pill--degraded";
  const venues = overview.venues.length > 0 ? overview.venues : venueSnapshots;
  const strategies = overview.strategies.length > 0 ? overview.strategies : strategyProfiles;

  return (
    <main className="page-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Hyperliquid first</span>
          <h1>Real market data before real money.</h1>
          <p className="hero-text">
            The terminal now boots from Hyperliquid snapshots and then upgrades into a live WebSocket stream for
            candles, mids, and L2 book updates. This is the right base for a realistic paper engine.
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="detail-label">Feed status</span>
            <strong>{sourceLabel}</strong>
            <p className={sourceTone}>
              {overview.error ? overview.error : `Updated ${new Date(overview.market.updatedAt).toLocaleTimeString()}`}
            </p>
          </div>
          <div className="stat-card">
            <span className="detail-label">Primary venue</span>
            <strong>{overview.market.venue}</strong>
            <p>HTTP snapshots from `{overview.meta.httpUrl}` with live upgrades on `{overview.meta.websocketUrl}`.</p>
          </div>
          <div className="stat-card">
            <span className="detail-label">Starting bankroll</span>
            <strong>$100</strong>
            <p>Execution logic stays fee-aware and maker-biased because a small account cannot absorb churn.</p>
          </div>
        </div>
      </section>

      <section className="terminal-grid">
        <div className="panel panel--chart">
          <div className="panel-header">
            <div>
              <span className="panel-title">Interactive chart shell</span>
              <h2>
                {overview.market.symbol}/{overview.market.quote}
              </h2>
            </div>
            <div className="market-pills">
              <span>Last {overview.market.lastPrice.toLocaleString()}</span>
              <span>{overview.market.dayChangePct}% move</span>
              <span>{overview.market.spreadBps} bps spread</span>
              <span>{interval}</span>
            </div>
          </div>
          <PriceChart candles={overview.candles} />
        </div>

        <div className="panel panel--book">
          <div className="panel-header">
            <div>
              <span className="panel-title">Microstructure</span>
              <h2>Order Book</h2>
            </div>
          </div>
          <OrderBook asks={overview.orderBook.asks} bids={overview.orderBook.bids} />
        </div>
      </section>

      <section className="venue-strip">
        {venues.map((venue) => (
          <article className="venue-card" key={venue.venue}>
            <span className="detail-label">{venue.label}</span>
            <strong>
              Maker {venue.makerFeeBps} bps / Taker {venue.takerFeeBps} bps
            </strong>
            <p>{venue.notes}</p>
          </article>
        ))}
      </section>

      <section className="section-heading">
        <span className="eyebrow">Strategy research</span>
        <h2>Top 3 strategies to test first</h2>
        <p>
          The platform is still in paper-research mode. Strategy ranking stays subordinate to net expectancy after
          fees, order-book friction, and drawdown controls.
        </p>
      </section>

      <section className="strategy-stack">
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </section>

      <ResearchPanels decisions={decisions} backtests={backtests} />
    </main>
  );
}

function toBookLevel(level: { px: string; sz: string }): OrderBookLevel {
  return {
    price: Number(level.px),
    size: Number(level.sz),
  };
}
