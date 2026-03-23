"use client";

import { useEffect, useState, useTransition } from "react";
import { Bot, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react";
import { ToneChip } from "@/components/trade/TradeUI";
import { useAllocationSettings } from "@/hooks/useAllocationSettings";
import { formatDollars } from "@/lib/allocation-settings";
import { strategyMocks } from "@/lib/trade-mock-data";

type DashboardStatus = {
  openai: {
    connected: boolean;
    email?: string;
  };
  kalshi: {
    connected: boolean;
    baseUrl: string;
    balance?: string;
  };
  markets: Array<{
    ticker?: string;
    title?: string;
    yes_bid_dollars?: string;
    yes_ask_dollars?: string;
    volume?: number;
    status?: string;
  }>;
};

type RunResult = {
  analysis: {
    summary: string;
    action: string;
    confidence: string;
    risk: string;
    candidateTicker: string;
    notes: string[];
  };
  generatedAt: string;
};

type Btc15mState = {
  market: {
    ticker?: string;
    title?: string;
    yes_bid_dollars?: string;
    yes_ask_dollars?: string;
    volume?: number;
  } | null;
  signal: {
    action: string;
    side?: "yes" | "no" | null;
    maxPrice?: number | null;
    spread?: number | null;
    reason: string;
  };
  candidates?: Array<{
    ticker?: string;
    title?: string;
    subtitle?: string;
    score?: number;
    volume?: number;
  }>;
};

export function DashboardConsole({ initialStatus }: { initialStatus: DashboardStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategyMocks[0]?.id ?? "");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [btc15m, setBtc15m] = useState<Btc15mState | null>(null);
  const [liveEnabled, setLiveEnabled] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { settings, ready } = useAllocationSettings();

  const selectedStrategy = strategyMocks.find((strategy) => strategy.id === selectedStrategyId) ?? strategyMocks[0];
  const selectedAllocation = ready
    ? settings.strategyAllocations[selectedStrategy?.id ?? ""] ?? 0
    : Number(selectedStrategy?.defaultAllocation.replace("$", "") ?? "0");

  async function refreshStatus() {
    const response = await fetch("/api/providers/status", { cache: "no-store" });
    const payload = (await response.json()) as DashboardStatus | { error: string };

    if (!response.ok || "error" in payload) {
      throw new Error("error" in payload ? payload.error : "Failed to refresh dashboard status.");
    }

    setStatus(payload);
  }

  async function refreshBtc15m() {
    const response = await fetch("/api/kalshi/btc15m", { cache: "no-store" });
    const payload = (await response.json()) as Btc15mState | { error: string };

    if (!response.ok || "error" in payload) {
      throw new Error("error" in payload ? payload.error : "Failed to refresh BTC 15m market.");
    }

    setBtc15m(payload);
  }

  function runTask(task: () => Promise<void>) {
    setError(null);
    startTransition(() => {
      task().catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Request failed.");
      });
    });
  }

  useEffect(() => {
    const initialTimeoutId = window.setTimeout(() => {
      refreshBtc15m().catch(() => {});
    }, 0);
    const intervalId = window.setInterval(() => {
      refreshBtc15m().catch(() => {});
    }, 15000);

    return () => {
      window.clearTimeout(initialTimeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero-card">
        <div>
          <div className="section-kicker">Live market control surface</div>
          <h1 className="section-title">Run strategy analysis against live Kalshi market data with your connected ChatGPT session.</h1>
          <p className="section-copy max-w-3xl text-sm md:text-base">
            Execution remains manual-only. This pass is about validating provider wiring, live market fetches, GPT-generated trade rationale, and operator review before any automated live execution.
          </p>
        </div>
        <ToneChip label="manual only" tone="warning" />
      </section>

      <section className="bot-top-metrics">
        <div className="bot-metric-card">
          <span>OpenAI</span>
          <strong>{status.openai.connected ? "Connected" : "Needs auth"}</strong>
          <p>{status.openai.email ?? "Connect ChatGPT OAuth on the setup screen."}</p>
        </div>
        <div className="bot-metric-card">
          <span>Kalshi</span>
          <strong>{status.kalshi.connected ? "Connected" : "Needs live API key"}</strong>
          <p>{status.kalshi.balance ?? status.kalshi.baseUrl}</p>
        </div>
        <div className="bot-metric-card">
          <span>Market feed</span>
          <strong>{status.markets.length}</strong>
          <p>Open live markets loaded into the app right now.</p>
        </div>
        <div className="bot-metric-card">
          <span>Risk posture</span>
          <strong>{ready ? formatDollars(settings.maxPositionSize) : "Loading..."}</strong>
          <p>{ready ? `Max per trade with ${formatDollars(settings.maxOpenExposure)} total exposure.` : "Loading local limits."}</p>
        </div>
      </section>

      <section className="bot-dashboard-grid">
        <div className="bot-launch-panel">
          <div className="bot-panel-header">
            <div>
              <div className="section-kicker">Strategy engine</div>
              <h2>Choose a strategy and generate a live market thesis</h2>
            </div>
            <Bot className="h-5 w-5 text-[var(--accent)]" />
          </div>

          <div className="strategy-selector-grid">
            {strategyMocks.map((strategy) => {
              const selected = strategy.id === selectedStrategyId;

              return (
                <button
                  key={strategy.id}
                  type="button"
                  className={`strategy-select-card ${selected ? "strategy-select-card-active" : ""}`}
                  onClick={() => setSelectedStrategyId(strategy.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3>{strategy.name}</h3>
                    <ToneChip label={strategy.status} tone={strategy.status === "ready" ? "up" : "warning"} />
                  </div>
                  <p>{strategy.description}</p>
                  <div className="strategy-card-meta">
                    <span>{strategy.market}</span>
                    <span>{strategy.cadence}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="selected-strategy-details">
            <div className="selected-strategy-grid">
              <div>
                <span>Prompt profile</span>
                <strong>{selectedStrategy?.promptProfile}</strong>
              </div>
              <div>
                <span>Allocation</span>
                <strong>{formatDollars(selectedAllocation)}</strong>
              </div>
              <div>
                <span>Mode</span>
                <strong>{selectedStrategy?.mode}</strong>
              </div>
              <div>
                <span>Cadence</span>
                <strong>{selectedStrategy?.cadence}</strong>
              </div>
            </div>

            <div className="connect-action-row">
              <button
                type="button"
                className="connect-button-primary"
                disabled={isPending}
                onClick={() =>
                  runTask(async () => {
                    const response = await fetch("/api/bot/run", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ strategyId: selectedStrategyId, allocation: selectedAllocation }),
                    });
                    const payload = (await response.json()) as RunResult | { error: string };

                    if (!response.ok || "error" in payload) {
                      throw new Error("error" in payload ? payload.error : "Failed to run strategy.");
                    }

                    setRunResult(payload);
                    await refreshStatus();
                  })
                }
              >
                <TrendingUp className="h-4 w-4" />
                Run live-market analysis
              </button>

              <button type="button" className="connect-button-secondary" disabled={isPending} onClick={() => runTask(refreshStatus)}>
                <RefreshCw className="h-4 w-4" />
                Refresh markets
              </button>
            </div>
            <p className="text-xs text-[var(--text-soft)]">Change bankroll and per-strategy allocations on the Settings page.</p>
          </div>
        </div>

        <div className="active-bot-panel">
          <div className="bot-panel-header">
            <div>
              <div className="section-kicker">Latest run</div>
              <h2>{runResult ? "GPT strategy output" : "No run yet"}</h2>
            </div>
            <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
          </div>

          {runResult ? (
            <div className="analysis-panel">
              <div className="analysis-row">
                <span>Action</span>
                <strong>{runResult.analysis.action}</strong>
              </div>
              <div className="analysis-row">
                <span>Confidence</span>
                <strong>{runResult.analysis.confidence}</strong>
              </div>
              <div className="analysis-row">
                <span>Candidate ticker</span>
                <strong>{runResult.analysis.candidateTicker}</strong>
              </div>
              <div className="analysis-row">
                <span>Risk</span>
                <strong>{runResult.analysis.risk}</strong>
              </div>
              <p className="analysis-summary">{runResult.analysis.summary}</p>
              <ul className="connect-checklist">
                {runResult.analysis.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="section-copy text-sm">Run a strategy once both providers are connected to generate the first GPT-backed live-market trade thesis.</p>
          )}

          {error && (
            <div className="connect-feedback mt-4">
              <p>{error}</p>
            </div>
          )}
        </div>
      </section>

      <section className="bot-dashboard-grid">
        <div className="bot-launch-panel">
          <div className="bot-panel-header">
            <div>
              <div className="section-kicker">Realtime BTC 15m</div>
              <h2>Fast market execution panel</h2>
            </div>
            <ToneChip label="live" tone="warning" />
          </div>

          {btc15m?.market ? (
            <div className="analysis-panel">
              <div className="analysis-row">
                <span>Market</span>
                <strong>{btc15m.market.title ?? btc15m.market.ticker}</strong>
              </div>
              <div className="analysis-row">
                <span>Ticker</span>
                <strong>{btc15m.market.ticker}</strong>
              </div>
              <div className="analysis-row">
                <span>Signal</span>
                <strong>{btc15m.signal.action}</strong>
              </div>
              <div className="analysis-row">
                <span>Recommended side</span>
                <strong>{btc15m.signal.side ?? "none"}</strong>
              </div>
              <div className="analysis-row">
                <span>Max entry</span>
                <strong>{btc15m.signal.maxPrice ? `${btc15m.signal.maxPrice}c` : "--"}</strong>
              </div>
              <div className="analysis-row">
                <span>Spread</span>
                <strong>{btc15m.signal.spread ?? "--"}</strong>
              </div>
              <p className="analysis-summary">{btc15m.signal.reason}</p>
            </div>
          ) : (
            <>
              <p className="section-copy text-sm">No BTC 15m market is currently available in the scan.</p>
              {btc15m?.candidates?.length ? (
                <div className="market-preview-list">
                  {btc15m.candidates.slice(0, 5).map((candidate) => (
                    <div key={candidate.ticker ?? candidate.title} className="market-preview-row">
                      <div>
                        <p className="market-preview-tag">crypto candidate</p>
                        <p className="market-preview-contract">{candidate.title ?? candidate.ticker ?? "Untitled market"}</p>
                      </div>
                      <div className="market-preview-meta market-preview-meta-column">
                        <span>{candidate.ticker ?? "--"}</span>
                        <span>score {candidate.score?.toFixed(1) ?? "--"}</span>
                        <span>vol {candidate.volume ?? "--"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="active-bot-panel">
          <div className="bot-panel-header">
            <div>
              <div className="section-kicker">Execution guardrails</div>
              <h2>One-contract live ticket</h2>
            </div>
            <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
          </div>

          <label className="execution-toggle">
            <input type="checkbox" checked={liveEnabled} onChange={(event) => setLiveEnabled(event.target.checked)} />
            <span>Arm live execution</span>
          </label>

          <p className="section-copy text-sm">
            This ticket is capped to one contract and fill-or-kill behavior. It will only submit if you explicitly arm it.
          </p>

          <div className="connect-action-row">
            <button
              type="button"
              className="connect-button-primary"
              disabled={
                isPending ||
                !btc15m?.market?.ticker ||
                !btc15m?.signal.side ||
                !btc15m?.signal.maxPrice
              }
              onClick={() =>
                runTask(async () => {
                  const response = await fetch("/api/kalshi/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ticker: btc15m?.market?.ticker,
                      side: btc15m?.signal.side,
                      priceCents: btc15m?.signal.maxPrice,
                      count: 1,
                      liveEnabled,
                    }),
                  });
                  const payload = (await response.json()) as { error?: string; order?: { order_id?: string; status?: string } };

                  if (!response.ok) {
                    throw new Error(payload.error ?? "Failed to place live order.");
                  }

                  setOrderMessage(`Live order submitted: ${payload.order?.order_id ?? "unknown"} (${payload.order?.status ?? "submitted"})`);
                })
              }
            >
              Submit live BTC 15m order
            </button>

            <button type="button" className="connect-button-secondary" disabled={isPending} onClick={() => runTask(refreshBtc15m)}>
              <RefreshCw className="h-4 w-4" />
              Refresh BTC 15m
            </button>
          </div>

          {orderMessage && (
            <div className="connect-feedback mt-4">
              <p>{orderMessage}</p>
            </div>
          )}
        </div>
      </section>

      <section className="bot-runs-panel">
        <div className="bot-panel-header">
          <div>
            <div className="section-kicker">Kalshi live feed</div>
            <h2>Live market sample</h2>
          </div>
          <ToneChip label={`${status.markets.length} markets`} tone="neutral" />
        </div>

        <div className="market-preview-list">
          {status.markets.map((market) => (
            <div key={market.ticker ?? market.title} className="market-preview-row">
              <div>
                <p className="market-preview-tag">{market.status ?? "open"}</p>
                <p className="market-preview-contract">{market.title ?? market.ticker ?? "Untitled market"}</p>
              </div>
              <div className="market-preview-meta market-preview-meta-column">
                <span>Ticker: {market.ticker ?? "--"}</span>
                <span>Yes bid: {market.yes_bid_dollars ?? "--"}</span>
                <span>Yes ask: {market.yes_ask_dollars ?? "--"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
