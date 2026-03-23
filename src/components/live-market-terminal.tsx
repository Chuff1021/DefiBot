"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";

import { OrderBook } from "@/components/order-book";
import { PriceChart } from "@/components/price-chart";
import type { MarketOverviewPayload } from "@/lib/hyperliquid";
import { generateStrategyDecisions, runBacktestSummaries } from "@/lib/strategy-engine";
import type { BacktestSummary, OrderBookLevel, StrategyDecision, StrategyId } from "@/lib/types";

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

type RiskMode = "conservative" | "balanced" | "aggressive";

const bankrollOptions = [100, 250, 500];
const botPresentation: Record<StrategyId, { category: string; label: string; accent: string }> = {
  "micro-reversion-maker": {
    category: "AI Spot Grid",
    label: "Low fee / high control",
    accent: "Maker-first",
  },
  "trend-breakout-perp": {
    category: "AI Futures Trend",
    label: "Momentum / lower churn",
    accent: "Breakout",
  },
  "funding-basis-carry": {
    category: "AI Smart Rebalance",
    label: "Carry / research mode",
    accent: "Basis",
  },
};

export function LiveMarketTerminal({ symbol = "BTC", interval = "1m", network = "mainnet" }: Props) {
  const [overview, setOverview] = useState<MarketOverviewPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "degraded">("loading");
  const [decisions, setDecisions] = useState<StrategyDecision[]>([]);
  const [backtests, setBacktests] = useState<BacktestSummary[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<StrategyId>("micro-reversion-maker");
  const [bankrollUsd, setBankrollUsd] = useState(100);
  const [riskMode, setRiskMode] = useState<RiskMode>("balanced");

  const refreshResearch = useEffectEvent((data: MarketOverviewPayload, nextBankrollUsd: number) => {
    const nextDecisions = generateStrategyDecisions({
      candles: data.candles,
      bids: data.orderBook.bids,
      asks: data.orderBook.asks,
      bankrollUsd: nextBankrollUsd,
    });
    const nextBacktests = runBacktestSummaries({
      candles: data.candles,
      bids: data.orderBook.bids,
      asks: data.orderBook.asks,
      bankrollUsd: nextBankrollUsd,
    });

    setDecisions(nextDecisions);
    setBacktests(nextBacktests);
  });

  const applyBook = useEffectEvent((book: WsBook) => {
    setOverview((current) => {
      if (!current) {
        return current;
      }

      const bids = book.levels[0].map(toBookLevel);
      const asks = book.levels[1].map(toBookLevel);
      const bestBid = bids[0]?.price ?? current.market.lastPrice;
      const bestAsk = asks[0]?.price ?? current.market.lastPrice;
      const spreadBps =
        bestBid > 0 ? Number((((bestAsk - bestBid) / bestBid) * 10_000).toFixed(2)) : current.market.spreadBps;

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
      refreshResearch(data, bankrollUsd);
    }

    void loadOverview();

    return () => {
      cancelled = true;
    };
  }, [bankrollUsd, interval, network, refreshResearch, symbol]);

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

    refreshResearch(overview, bankrollUsd);
  }, [bankrollUsd, overview, refreshResearch]);

  if (!overview) {
    return (
      <main className="page-shell">
        <section className="hero-panel">
          <h1>Loading trading workspace...</h1>
        </section>
      </main>
    );
  }

  const selectedStrategy = overview.strategies.find((strategy) => strategy.id === selectedStrategyId) ?? overview.strategies[0];
  const selectedDecision = decisions.find((decision) => decision.strategyId === selectedStrategy?.id) ?? decisions[0];
  const selectedBacktest = backtests.find((summary) => summary.strategyId === selectedStrategy?.id) ?? backtests[0];
  const sourceLabel = status === "live" ? "Live feed" : overview.source === "mock" ? "Demo mode" : "Snapshot";
  const riskBadge = riskMode === "conservative" ? "Low churn" : riskMode === "balanced" ? "Balanced" : "Higher risk";
  const selectedPresentation = selectedStrategy ? botPresentation[selectedStrategy.id] : null;

  return (
    <main className="page-shell page-shell--product">
      <section className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark">D</div>
          <div>
            <strong>DefiBot</strong>
            <span>AI Bot Workspace</span>
          </div>
        </div>
        <nav className="topbar-nav">
          <span className="topbar-nav__item topbar-nav__item--active">Bot Marketplace</span>
          <span className="topbar-nav__item">Running Bots</span>
          <span className="topbar-nav__item">Backtest</span>
          <span className="topbar-nav__item">Paper Account</span>
        </nav>
        <div className="topbar-meta">
          <span className={`status-pill ${status === "live" ? "status-pill--live" : "status-pill--degraded"}`}>{sourceLabel}</span>
          <span className="status-pill">{overview.market.venue}</span>
        </div>
      </section>

      <section className="kucoin-hero">
        <div className="kucoin-hero__copy">
          <span className="eyebrow">AI bot marketplace</span>
          <h1>Choose an AI bot and launch a paper strategy in minutes.</h1>
          <p className="hero-text">
            Start with a simple bot marketplace flow: pick a strategy, review the AI settings, check live market
            conditions, and launch a paper bot without digging through a research dashboard.
          </p>
          <div className="category-tabs">
            <span className="category-tabs__item category-tabs__item--active">AI Recommended</span>
            <span className="category-tabs__item">Grid Bots</span>
            <span className="category-tabs__item">Trend Bots</span>
            <span className="category-tabs__item">Rebalance Bots</span>
          </div>
          <div className="hero-actions">
            <button className="primary-button" type="button">
              Start Paper Bot
            </button>
            <button className="secondary-button" type="button">
              View Backtest
            </button>
          </div>
        </div>
        <div className="account-card">
          <span className="detail-label">Paper account</span>
          <strong>${bankrollUsd}</strong>
          <div className="account-highlight">{selectedPresentation?.category ?? "AI Bot"} selected</div>
          <div className="account-grid">
            <div>
              <span className="detail-label">Selected bot</span>
              <p>{selectedStrategy?.name ?? "None"}</p>
            </div>
            <div>
              <span className="detail-label">Risk mode</span>
              <p>{riskBadge}</p>
            </div>
            <div>
              <span className="detail-label">Pair</span>
              <p>
                {overview.market.symbol}/{overview.market.quote}
              </p>
            </div>
            <div>
              <span className="detail-label">Spread</span>
              <p>{overview.market.spreadBps} bps</p>
            </div>
          </div>
        </div>
      </section>

      <section className="workspace-grid workspace-grid--kucoin">
        <div className="panel marketplace-panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Top strategies</span>
              <h2>Recommended AI bots</h2>
            </div>
          </div>
          <div className="bot-market-list">
            {overview.strategies.map((strategy) => {
              const decision = decisions.find((entry) => entry.strategyId === strategy.id);
              const backtest = backtests.find((entry) => entry.strategyId === strategy.id);
              const isSelected = strategy.id === selectedStrategy?.id;
              const presentation = botPresentation[strategy.id];

              return (
                <button
                  className={`bot-card ${isSelected ? "bot-card--active" : ""}`}
                  key={strategy.id}
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      setSelectedStrategyId(strategy.id);
                    });
                  }}
                >
                  <div className="bot-card__header">
                    <div>
                      <span className="bot-card__category">{presentation.category}</span>
                      <strong>{strategy.name}</strong>
                    </div>
                    <span className={`status-pill status-pill--${backtest?.status ?? "needs-work"}`}>
                      {backtest?.status?.replace("-", " ") ?? "needs work"}
                    </span>
                  </div>
                  <div className="bot-card__roi">
                    <strong>{backtest?.netPnlPct ?? 0}%</strong>
                    <span>test return</span>
                  </div>
                  <p>{presentation.label}. {strategy.whyItFitsSmallBalance}</p>
                  <div className="bot-card__stats">
                    <span>{decision?.action.toUpperCase() ?? "WAIT"}</span>
                    <span>{presentation.accent}</span>
                    <span>{strategy.feePosture}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Chart + live market</span>
              <h2>
                {overview.market.symbol}/{overview.market.quote}
              </h2>
            </div>
            <div className="market-pills">
              <span>Last {overview.market.lastPrice.toLocaleString()}</span>
              <span>{overview.market.dayChangePct}% move</span>
              <span>{interval}</span>
            </div>
          </div>
          <div className="summary-strip">
            <div className="summary-chip">
              <span className="detail-label">AI signal</span>
              <strong className={`decision-inline decision-inline--${selectedDecision?.action ?? "wait"}`}>
                {selectedDecision?.action.toUpperCase() ?? "WAIT"}
              </strong>
            </div>
            <div className="summary-chip">
              <span className="detail-label">Backtest return</span>
              <strong>{selectedBacktest?.netPnlPct ?? 0}%</strong>
            </div>
            <div className="summary-chip">
              <span className="detail-label">Win rate</span>
              <strong>{selectedBacktest?.winRatePct ?? 0}%</strong>
            </div>
            <div className="summary-chip">
              <span className="detail-label">Drawdown</span>
              <strong>{selectedBacktest?.maxDrawdownPct ?? 0}%</strong>
            </div>
          </div>
          <PriceChart candles={overview.candles} />
          <div className="chart-footer-grid">
            <div className="chart-footer-card">
              <span className="detail-label">Bot logic</span>
              <p>{selectedDecision?.rationale?.[0] ?? "No signal yet."}</p>
            </div>
            <div className="chart-footer-card">
              <span className="detail-label">Execution estimate</span>
              <p>
                Fee ${selectedDecision?.feeEstimateUsd.toFixed(4) ?? "0.0000"} | Slippage {selectedDecision?.slippageBps ?? 0} bps
              </p>
            </div>
          </div>
        </div>

        <div className="panel setup-panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Bot setup</span>
              <h2>Create AI bot</h2>
            </div>
          </div>

          <div className="setup-section">
            <span className="detail-label">Investment amount</span>
            <div className="pill-row">
              {bankrollOptions.map((option) => (
                <button
                  className={`pill-button ${option === bankrollUsd ? "pill-button--active" : ""}`}
                  key={option}
                  type="button"
                  onClick={() => setBankrollUsd(option)}
                >
                  ${option}
                </button>
              ))}
            </div>
          </div>

          <div className="setup-section">
            <span className="detail-label">AI parameters</span>
            <div className="pill-row">
              {(["conservative", "balanced", "aggressive"] as const).map((mode) => (
                <button
                  className={`pill-button ${mode === riskMode ? "pill-button--active" : ""}`}
                  key={mode}
                  type="button"
                  onClick={() => setRiskMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="setup-summary">
            <div>
              <span className="detail-label">Bot type</span>
              <p>{selectedStrategy?.name}</p>
            </div>
            <div>
              <span className="detail-label">Entry price</span>
              <p>{selectedDecision?.expectedEntry ? selectedDecision.expectedEntry.toLocaleString() : "Waiting"}</p>
            </div>
            <div>
              <span className="detail-label">Stop loss</span>
              <p>{selectedDecision?.stopLoss ? selectedDecision.stopLoss.toLocaleString() : "Not set"}</p>
            </div>
            <div>
              <span className="detail-label">Take profit</span>
              <p>{selectedDecision?.takeProfit ? selectedDecision.takeProfit.toLocaleString() : "Not set"}</p>
            </div>
            <div>
              <span className="detail-label">Order size</span>
              <p>${selectedDecision?.positionSizeUsd.toFixed(2) ?? "0.00"}</p>
            </div>
            <div>
              <span className="detail-label">Bot quality</span>
              <p>{selectedBacktest?.profitFactor ?? 0}</p>
            </div>
          </div>

          <button className="primary-button primary-button--full" type="button">
            Start {selectedStrategy?.name} Paper Bot
          </button>
          <button className="secondary-button secondary-button--full" type="button">
            Open Full Backtest
          </button>
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Running bot preview</span>
              <h2>Bot details</h2>
            </div>
          </div>
          <div className="running-bot-card">
            <div className="running-bot-card__row">
              <span>Bot</span>
              <strong>{selectedStrategy?.name}</strong>
            </div>
            <div className="running-bot-card__row">
              <span>Mode</span>
              <strong>Paper Trading</strong>
            </div>
            <div className="running-bot-card__row">
              <span>Signal</span>
              <strong className={`decision-inline decision-inline--${selectedDecision?.action ?? "wait"}`}>
                {selectedDecision?.action.toUpperCase() ?? "WAIT"}
              </strong>
            </div>
            <div className="running-bot-card__row">
              <span>Confidence</span>
              <strong>{Math.round((selectedDecision?.confidence ?? 0) * 100)}%</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-title">Order book</span>
              <h2>Execution depth</h2>
            </div>
          </div>
          <OrderBook asks={overview.orderBook.asks} bids={overview.orderBook.bids} />
        </div>
      </section>
    </main>
  );
}

function toBookLevel(level: { px: string; sz: string }): OrderBookLevel {
  return {
    price: Number(level.px),
    size: Number(level.sz),
  };
}
