export type ConnectionStatus = "connected" | "pending" | "disconnected";
export type RunStatus = "running" | "queued" | "paused" | "completed" | "failed";

export type BotStrategy = {
  id: string;
  name: string;
  market: string;
  mode: string;
  cadence: string;
  status: "ready" | "beta";
  description: string;
  defaultAllocation: string;
  promptProfile: string;
};

export type BotRun = {
  id: string;
  strategyId: string;
  strategy: string;
  market: string;
  status: RunStatus;
  updatedAt: string;
  exposure: string;
  timeActive: string;
  tradeCount: number;
  pnl: string;
  winRate: string;
};

export const sandboxChecklist = [
  {
    id: "openai-oauth",
    title: "Connect OpenAI / ChatGPT",
    description: "Authorize GPT access for research prompts, market summaries, and strategy drafting.",
    detail: "Use OAuth first so the app can later request tokens without pasting secrets into the UI.",
    status: "ready" as const,
  },
  {
    id: "kalshi-sandbox",
    title: "Connect Kalshi sandbox",
    description: "Store sandbox credentials and target the Kalshi test environment before any live deployment.",
    detail: "Everything in this starter app is framed around paper testing and test trades only.",
    status: "ready" as const,
  },
  {
    id: "paper-trading",
    title: "Run first paper trade loop",
    description: "Simulate the strategy, review AI rationale, and verify order payload wiring end-to-end.",
    detail: "Once the wiring is stable, the same surfaces can be extended for automated execution rules.",
    status: "queued" as const,
  },
];

export const sandboxMarkets = [
  {
    market: "Fed",
    contract: "Next FOMC no cut",
    signal: "Watch",
    price: "54¢",
    rationale: "Good starter contract for validating quote pulls and manual order review.",
  },
  {
    market: "Inflation",
    contract: "US CPI above 3.2%",
    signal: "Candidate",
    price: "61¢",
    rationale: "Useful for testing GPT research summaries against a well-defined macro catalyst.",
  },
  {
    market: "Crypto",
    contract: "BTC above 90k this quarter",
    signal: "Sandbox only",
    price: "39¢",
    rationale: "Higher-volatility contract to test guardrails before strategy refinement.",
  },
];

export const onboardingSteps = [
  {
    id: "account",
    title: "Create workspace",
    description: "Set your strategy profile and default risk level.",
    state: "complete" as const,
  },
  {
    id: "chatgpt",
    title: "Connect ChatGPT",
    description: "Placeholder OAuth scope review and approval.",
    state: "current" as const,
  },
  {
    id: "kalshi",
    title: "Connect Kalshi",
    description: "Mock API key or OAuth token handshake.",
    state: "upcoming" as const,
  },
  {
    id: "launch",
    title: "Launch first run",
    description: "Pick a market and start simulated execution.",
    state: "upcoming" as const,
  },
];

export const connectionMocks = [
  {
    id: "chatgpt",
    name: "OpenAI / ChatGPT",
    subtitle: "OAuth-backed research, prompt execution, and trade thesis generation",
    status: "pending" as ConnectionStatus,
    hint: "Starter wiring only — no real OAuth exchange yet",
  },
  {
    id: "kalshi",
    name: "Kalshi Sandbox",
    subtitle: "Sandbox market data, test credentials, and safe test-trade routing",
    status: "disconnected" as ConnectionStatus,
    hint: "No live or sandbox API request is performed yet",
  },
];

export const strategyMocks: BotStrategy[] = [
  {
    id: "macro-momentum",
    name: "Macro Momentum",
    market: "Fed Policy & CPI",
    mode: "Balanced",
    cadence: "15m",
    status: "ready" as const,
    description: "Weights macro event contracts with adaptive position sizing.",
    defaultAllocation: "$150",
    promptProfile: "Macro catalyst summary + directional confidence",
  },
  {
    id: "event-reversal",
    name: "Event Reversal",
    market: "Politics & Breaking News",
    mode: "Aggressive",
    cadence: "5m",
    status: "ready" as const,
    description: "Looks for overreaction spreads and mean reversion entries.",
    defaultAllocation: "$100",
    promptProfile: "Headline shock scan + reversal probability",
  },
  {
    id: "slow-grid",
    name: "Slow Grid",
    market: "Weather & Weekly Events",
    mode: "Conservative",
    cadence: "1h",
    status: "beta" as const,
    description: "Conservative band strategy for steady low-volatility sessions.",
    defaultAllocation: "$75",
    promptProfile: "Low-volatility range check + guardrail review",
  },
];

export const dashboardStats = [
  { label: "Environment", value: "Sandbox", tone: "up" as const },
  { label: "GPT status", value: "OAuth ready", tone: "neutral" as const },
  { label: "Kalshi route", value: "Test only", tone: "neutral" as const },
  { label: "Risk Mode", value: "Manual approval", tone: "warning" as const },
];

export const runMocks: BotRun[] = [
  {
    id: "run-001",
    strategyId: "macro-momentum",
    strategy: "Sandbox Macro Pilot",
    market: "US CPI YoY > 3.1%",
    status: "running" as RunStatus,
    updatedAt: "2 min ago",
    exposure: "$150",
    timeActive: "00:42:18",
    tradeCount: 6,
    pnl: "+$24.80",
    winRate: "66%",
  },
  {
    id: "run-002",
    strategyId: "event-reversal",
    strategy: "Policy Headline Probe",
    market: "Next FOMC no rate cut",
    status: "queued" as RunStatus,
    updatedAt: "just now",
    exposure: "$0",
    timeActive: "00:00:00",
    tradeCount: 0,
    pnl: "$0.00",
    winRate: "--",
  },
  {
    id: "run-003",
    strategyId: "slow-grid",
    strategy: "Crypto Catalyst Trial",
    market: "BTC above 90k this quarter",
    status: "paused" as RunStatus,
    updatedAt: "9 min ago",
    exposure: "$75",
    timeActive: "01:13:05",
    tradeCount: 3,
    pnl: "-$8.25",
    winRate: "33%",
  },
];

export const runTimelineMock = [
  { at: "09:31", label: "Run initialized", status: "completed" as const },
  { at: "09:33", label: "Signal generated by ChatGPT", status: "completed" as const },
  { at: "09:34", label: "Kalshi quote snapshot (mock)", status: "completed" as const },
  { at: "09:36", label: "Risk checks in progress", status: "running" as const },
  { at: "--:--", label: "Position execution", status: "pending" as const },
];
