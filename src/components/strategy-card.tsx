import type { StrategyProfile } from "@/lib/types";

type Props = {
  strategy: StrategyProfile;
};

export function StrategyCard({ strategy }: Props) {
  return (
    <article className="strategy-card">
      <div className="strategy-card__header">
        <span className="eyebrow">{strategy.style}</span>
        <span className={`status-pill status-pill--${strategy.status}`}>{strategy.status.replace("-", " ")}</span>
      </div>
      <h3>{strategy.name}</h3>
      <p>{strategy.whyItFitsSmallBalance}</p>
      <div className="strategy-grid">
        <div>
          <span className="detail-label">Edge</span>
          <p>{strategy.coreEdge}</p>
        </div>
        <div>
          <span className="detail-label">Fee posture</span>
          <p>{strategy.feePosture}</p>
        </div>
        <div>
          <span className="detail-label">Venues</span>
          <p>{strategy.venues.join(", ")}</p>
        </div>
        <div>
          <span className="detail-label">Timeframes</span>
          <p>{strategy.timeframes.join(", ")}</p>
        </div>
      </div>
      <div className="risk-list">
        {strategy.risks.map((risk) => (
          <span key={risk}>{risk}</span>
        ))}
      </div>
    </article>
  );
}
