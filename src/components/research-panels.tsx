import type { BacktestSummary, StrategyDecision } from "@/lib/types";

type Props = {
  decisions: StrategyDecision[];
  backtests: BacktestSummary[];
};

export function ResearchPanels({ decisions, backtests }: Props) {
  return (
    <section className="research-panel">
      <div className="section-heading">
        <span className="eyebrow">Paper engine</span>
        <h2>Decision and backtest panels</h2>
        <p>
          These are research outputs, not live trade instructions. The goal is to display signal quality, costs,
          and evidence together before any automation is trusted.
        </p>
      </div>
      <div className="build-priorities">
        {decisions.map((decision) => (
          <article className="priority-card" key={decision.strategyId}>
            <span className="detail-label">{decision.strategyName}</span>
            <strong className={`decision decision--${decision.action}`}>{decision.action.toUpperCase()}</strong>
            <p>Confidence {Math.round(decision.confidence * 100)}%</p>
            <p>Size ${decision.positionSizeUsd.toFixed(2)} | Fee ${decision.feeEstimateUsd.toFixed(4)} | Slippage {decision.slippageBps} bps</p>
            <p>{decision.rationale[0]}</p>
          </article>
        ))}
      </div>
      <div className="strategy-stack">
        {backtests.map((summary) => (
          <article className="strategy-card" key={summary.strategyId}>
            <div className="strategy-card__header">
              <span className="eyebrow">Backtest summary</span>
              <span className={`status-pill status-pill--${summary.status}`}>{summary.status.replace("-", " ")}</span>
            </div>
            <h3>{summary.strategyName}</h3>
            <div className="strategy-grid">
              <div>
                <span className="detail-label">Trades</span>
                <p>{summary.trades}</p>
              </div>
              <div>
                <span className="detail-label">Win rate</span>
                <p>{summary.winRatePct}%</p>
              </div>
              <div>
                <span className="detail-label">Net pnl</span>
                <p>${summary.netPnlUsd} ({summary.netPnlPct}%)</p>
              </div>
              <div>
                <span className="detail-label">Profit factor</span>
                <p>{summary.profitFactor}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
