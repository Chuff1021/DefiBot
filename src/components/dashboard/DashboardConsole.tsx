"use client";

import { useState, useTransition } from "react";
import { Bot, RefreshCw, ShieldCheck, TrendingUp } from "lucide-react";
import { ToneChip } from "@/components/trade/TradeUI";
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

export function DashboardConsole({ initialStatus }: { initialStatus: DashboardStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [selectedStrategyId, setSelectedStrategyId] = useState(strategyMocks[0]?.id ?? "");
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedStrategy = strategyMocks.find((strategy) => strategy.id === selectedStrategyId) ?? strategyMocks[0];

  async function refreshStatus() {
    const response = await fetch("/api/providers/status", { cache: "no-store" });
    const payload = (await response.json()) as DashboardStatus | { error: string };

    if (!response.ok || "error" in payload) {
      throw new Error("error" in payload ? payload.error : "Failed to refresh dashboard status.");
    }

    setStatus(payload);
  }

  function runTask(task: () => Promise<void>) {
    setError(null);
    startTransition(() => {
      task().catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Request failed.");
      });
    });
  }

  return (
    <div className="dashboard-shell">
      <section className="dashboard-hero-card">
        <div>
          <div className="section-kicker">Live sandbox control surface</div>
          <h1 className="section-title">Run strategy analysis against real Kalshi sandbox market data with your connected ChatGPT OAuth session.</h1>
          <p className="section-copy max-w-3xl text-sm md:text-base">
            Execution remains sandbox-only and manual. This pass is about validating provider wiring, market fetches, GPT-generated trade rationale, and operator review.
          </p>
        </div>
        <ToneChip label="sandbox only" tone="up" />
      </section>

      <section className="bot-top-metrics">
        <div className="bot-metric-card">
          <span>OpenAI</span>
          <strong>{status.openai.connected ? "Connected" : "Needs auth"}</strong>
          <p>{status.openai.email ?? "Connect ChatGPT OAuth on the setup screen."}</p>
        </div>
        <div className="bot-metric-card">
          <span>Kalshi</span>
          <strong>{status.kalshi.connected ? "Connected" : "Needs sandbox key"}</strong>
          <p>{status.kalshi.balance ?? status.kalshi.baseUrl}</p>
        </div>
        <div className="bot-metric-card">
          <span>Market feed</span>
          <strong>{status.markets.length}</strong>
          <p>Open sandbox markets loaded into the app right now.</p>
        </div>
        <div className="bot-metric-card">
          <span>Execution posture</span>
          <strong>Manual approval</strong>
          <p>No automatic order placement is wired in this pass.</p>
        </div>
      </section>

      <section className="bot-dashboard-grid">
        <div className="bot-launch-panel">
          <div className="bot-panel-header">
            <div>
              <div className="section-kicker">Strategy engine</div>
              <h2>Choose a strategy and generate a live sandbox thesis</h2>
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
                <strong>{selectedStrategy?.defaultAllocation}</strong>
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
                      body: JSON.stringify({ strategyId: selectedStrategyId }),
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
                Run sandbox analysis
              </button>

              <button type="button" className="connect-button-secondary" disabled={isPending} onClick={() => runTask(refreshStatus)}>
                <RefreshCw className="h-4 w-4" />
                Refresh markets
              </button>
            </div>
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
            <p className="section-copy text-sm">Run a strategy once both providers are connected to generate the first GPT-backed sandbox trade thesis.</p>
          )}

          {error && (
            <div className="connect-feedback mt-4">
              <p>{error}</p>
            </div>
          )}
        </div>
      </section>

      <section className="bot-runs-panel">
        <div className="bot-panel-header">
          <div>
            <div className="section-kicker">Kalshi sandbox feed</div>
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

