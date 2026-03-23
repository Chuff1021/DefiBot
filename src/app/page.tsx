import Link from "next/link";
import { ArrowRight, Bot, Cable, FlaskConical, ShieldCheck } from "lucide-react";
import { sandboxChecklist, sandboxMarkets } from "@/lib/trade-mock-data";

const proofPoints = [
  { label: "Environment", value: "Kalshi live data" },
  { label: "GPT access", value: "Session import first" },
  { label: "Trade mode", value: "Manual approval" },
  { label: "Goal", value: "Review live markets safely" },
];

const featureCards = [
  {
    icon: Cable,
    title: "Connection-first setup",
    description: "Start with the wiring: your ChatGPT session, live Kalshi credentials, and a clear manual-review posture.",
  },
  {
    icon: Bot,
    title: "GPT-assisted research loop",
    description: "Capture prompts, summaries, and trade thesis generation in one place so strategy refinement is easy.",
  },
  {
    icon: ShieldCheck,
    title: "Manual-only execution posture",
    description: "Use live market data while keeping final execution decisions and order wiring behind deliberate operator review.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Connect providers",
    description: "Add your ChatGPT session and live Kalshi credentials so prompts and market reads route correctly.",
  },
  {
    step: "02",
    title: "Validate the loop",
    description: "Run a simple research-to-order workflow using mock data and human approval at each step.",
  },
  {
    step: "03",
    title: "Refine the strategy",
    description: "Review the live-data dashboard, tune prompts and risk controls, then decide whether deeper automation is justified.",
  },
];

export default function HomePage() {
  return (
    <div className="homepage-shell">
      <section className="homepage-hero">
        <div className="hero-content-block">
          <span className="site-eyebrow">Live-data starter</span>
          <h1 className="homepage-hero-title">A simple starter app to wire GPT + live Kalshi market data before refining the strategy.</h1>
          <p className="homepage-hero-copy">
            This version strips the product down to the essentials: connect your ChatGPT session, connect your live Kalshi account, review live markets safely, and use the dashboard as the first operational surface.
          </p>
          <div className="hero-cta-row">
            <Link href="/connect" className="site-button site-button-primary">
              Wire providers
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="site-button site-button-secondary">
              Open live-data app
            </Link>
          </div>
          <div className="hero-proof-row">
            {proofPoints.map((item) => (
              <div key={item.label} className="hero-proof-item">
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual-card">
          <div className="visual-card-header">
            <div>
              <span className="site-eyebrow">What ships first</span>
              <h2>Core wiring checkpoints</h2>
            </div>
            <span className="visual-status-pill">Manual</span>
          </div>

          <div className="visual-highlight-panel">
            <div>
              <p className="visual-label">Primary outcome</p>
              <h3>You can test the connection surfaces and simulated trade flow before touching live money.</h3>
            </div>
            <div className="visual-metric-grid">
              <div>
                <p className="visual-label">OAuth</p>
                <strong>Planned</strong>
              </div>
              <div>
                <p className="visual-label">Kalshi env</p>
                <strong>Production</strong>
              </div>
            </div>
          </div>

          <div className="market-preview-list">
            {sandboxChecklist.map((item) => (
              <div key={item.id} className="market-preview-row">
                <div>
                  <p className="market-preview-tag">{item.status}</p>
                  <p className="market-preview-contract">{item.title}</p>
                </div>
                <div className="market-preview-meta">
                  <span>{item.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="homepage-section">
        <div className="section-heading-block">
          <span className="site-eyebrow">What this app focuses on</span>
          <h2 className="site-section-title">Enough product surface to test wiring, prompts, and live-data review without extra noise.</h2>
        </div>

        <div className="feature-card-grid">
          {featureCards.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="feature-card">
                <span className="feature-icon-wrap">
                  <Icon className="h-5 w-5" />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="homepage-section workflow-section">
        <div className="section-heading-block compact-heading">
          <span className="site-eyebrow">Test sequence</span>
          <h2 className="site-section-title">The path from connection setup to your first safe live-market review.</h2>
        </div>

        <div className="workflow-grid">
          {workflow.map((item) => (
            <article key={item.step} className="workflow-card">
              <span className="workflow-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="homepage-section">
        <div className="section-heading-block compact-heading">
          <span className="site-eyebrow">Suggested starter markets</span>
          <h2 className="site-section-title">A few example contracts to validate the app loop while you tune the strategy.</h2>
        </div>

        <div className="feature-card-grid">
          {sandboxMarkets.map((item) => (
            <article key={item.contract} className="feature-card">
              <span className="feature-icon-wrap">
                <FlaskConical className="h-5 w-5" />
              </span>
              <p className="market-preview-tag">{item.market}</p>
              <h3>{item.contract}</h3>
              <p>{item.rationale}</p>
              <div className="feature-card-meta">
                <span>{item.signal}</span>
                <strong>{item.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="homepage-cta-banner">
        <div>
          <span className="site-eyebrow">Ready to start</span>
          <h2 className="site-section-title">Open the connect screen, enter sandbox details, and move straight into test-trade review.</h2>
          <p className="banner-copy">
            The first milestone is not full automation. It is reliable provider wiring, a safe live-data review loop, and a dashboard you can use as a working base.
          </p>
        </div>
        <div className="hero-cta-row banner-actions">
          <Link href="/connect" className="site-button site-button-primary">
            Open setup
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/dashboard" className="site-button site-button-secondary">
            View dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
