import Link from "next/link";
import { ArrowUpRight, ChevronRight, Dot, LucideIcon } from "lucide-react";

type Tone = "up" | "warning" | "neutral" | "danger";

const toneMap: Record<Tone, string> = {
  up: "chip-up",
  warning: "chip-warning",
  neutral: "chip-neutral",
  danger: "chip-danger",
};

export function ToneChip({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return <span className={`system-chip ${toneMap[tone]}`}>{label}</span>;
}

export function StatusChip({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return <ToneChip label={label} tone={tone} />;
}

export function AppTopbar({
  title,
  subtitle,
  rightLabel,
}: {
  title: string;
  subtitle?: string;
  rightLabel?: string;
}) {
  return (
    <section className="system-frame command-band mb-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-4xl">
          <div className="section-kicker">Command surface</div>
          <h1 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--text)] md:text-[3rem]">{title}</h1>
          {subtitle && <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)] md:text-base">{subtitle}</p>}
        </div>
        {rightLabel && <ToneChip label={rightLabel} tone="neutral" />}
      </div>
    </section>
  );
}

export function CommandPanel({
  kicker,
  title,
  description,
  status,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  status?: { label: string; tone?: Tone };
  children?: React.ReactNode;
}) {
  return (
    <section className="system-frame command-band">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-4xl space-y-3">
          <div className="section-kicker">{kicker}</div>
          <h1 className="section-title max-w-4xl">{title}</h1>
          <p className="section-copy max-w-3xl text-sm md:text-base">{description}</p>
        </div>
        {status && <ToneChip label={status.label} tone={status.tone} />}
      </div>
      {children}
    </section>
  );
}

export function MetricCluster({
  index,
  label,
  value,
  detail,
}: {
  index: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metric-cluster" data-index={index}>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <p className="metric-detail">{detail}</p>
    </div>
  );
}

export function MissionMetricRow({
  items,
}: {
  items: Array<{ index: string; label: string; value: string; detail: string }>;
}) {
  return (
    <div className="mission-strip">
      {items.map((item) => (
        <MetricCluster key={item.index + item.label} {...item} />
      ))}
    </div>
  );
}

export function MarketRow({
  market,
  contract,
  price,
  edge,
  status,
}: {
  market: string;
  contract: string;
  price: string;
  edge: string;
  status: { label: string; tone?: Tone };
}) {
  return (
    <div className="market-row">
      <div>
        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--text-soft)]">{market}</p>
        <p className="mt-2 text-base font-semibold text-[var(--text)]">{contract}</p>
      </div>
      <div>
        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--text-soft)]">Price</p>
        <p className="mt-2 text-lg font-semibold text-[var(--text)]">{price}</p>
      </div>
      <div>
        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--text-soft)]">Edge</p>
        <p className="mt-2 text-lg font-semibold text-[var(--text)]">{edge}</p>
      </div>
      <div className="flex justify-start md:justify-end">
        <ToneChip label={status.label} tone={status.tone} />
      </div>
    </div>
  );
}

export function RailPanel({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="system-frame rail-stack p-4">
      <div>
        <div className="section-kicker">{kicker}</div>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-[var(--text)]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function RailList({
  items,
}: {
  items: Array<{ label: string; value: string; tone?: Tone; detail?: string }>;
}) {
  return (
    <div className="rail-list">
      {items.map((item) => (
        <div key={item.label + item.value} className="rail-row">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">{item.label}</p>
            {item.detail && <p className="mt-1 text-xs text-[var(--text-muted)]">{item.detail}</p>}
          </div>
          <div className="flex items-center gap-2">
            {item.tone && <ToneChip label={item.tone} tone={item.tone} />}
            <span className="text-sm font-semibold text-[var(--text)]">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkflowNode({
  step,
  title,
  detail,
  note,
}: {
  step: string;
  title: string;
  detail: string;
  note: string;
}) {
  return (
    <article className="workflow-node" data-step={step}>
      <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--accent-strong)]">{note}</p>
      <h3 className="mt-8 text-xl font-semibold tracking-[-0.04em] text-[var(--text)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">{detail}</p>
    </article>
  );
}

export function SpecRows({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="spec-list">
      {items.map((item) => (
        <div key={item.label} className="spec-row">
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-[var(--text-soft)]">{item.label}</p>
          <p className="text-sm leading-7 text-[var(--text)]">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function TimelinePanel({
  items,
}: {
  items: Array<{ at: string; title: string; detail: string; tone?: Tone }>;
}) {
  return (
    <div className="timeline-stack">
      {items.map((item) => (
        <div key={item.at + item.title} className="timeline-row">
          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-[var(--text-soft)]">{item.at}</p>
          <div className="timeline-node" />
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{item.detail}</p>
          </div>
          <div className="hidden md:block">{item.tone && <ToneChip label={item.tone} tone={item.tone} />}</div>
        </div>
      ))}
    </div>
  );
}

export function EvidenceCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="proof-cell">
      <p className="text-[0.7rem] uppercase tracking-[0.14em] text-[var(--text-soft)]">{title}</p>
      <p className="mt-4 text-[1.9rem] font-semibold tracking-[-0.05em] text-[var(--text)]">{value}</p>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{detail}</p>
    </div>
  );
}

export function ActionButtonRow({
  primary,
  secondary,
}: {
  primary: { href: string; label: string; icon?: LucideIcon };
  secondary?: { href: string; label: string };
}) {
  const PrimaryIcon = primary.icon ?? ArrowUpRight;

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href={primary.href} className="frame-button">
        <PrimaryIcon className="h-4 w-4" />
        {primary.label}
      </Link>
      {secondary && (
        <Link href={secondary.href} className="frame-button-ghost">
          {secondary.label}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function OperatorTray({
  primary,
  secondary,
}: {
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  return (
    <div className="operator-tray">
      <div className="command-header-frame">
        <div className="operator-tray-grid">
          <Link href={secondary.href} className="frame-button-ghost">
            {secondary.label}
          </Link>
          <Link href={primary.href} className="frame-button">
            {primary.label}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BottomActionBar({
  primaryLabel,
  secondaryLabel,
  primaryHref,
  secondaryHref,
}: {
  primaryLabel: string;
  secondaryLabel: string;
  primaryHref: string;
  secondaryHref: string;
}) {
  return <OperatorTray primary={{ href: primaryHref, label: primaryLabel }} secondary={{ href: secondaryHref, label: secondaryLabel }} />;
}

export function StepTimeline({
  items,
}: {
  items: Array<{ id: string; title: string; description: string; state: "complete" | "current" | "upcoming" }>;
}) {
  return (
    <div className="timeline-stack">
      {items.map((item) => (
        <div key={item.id} className="timeline-row">
          <p className="text-[0.7rem] uppercase tracking-[0.14em] text-[var(--text-soft)]">{item.id}</p>
          <div className="timeline-node" />
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{item.description}</p>
          </div>
          <div className="hidden md:block">
            <ToneChip label={item.state} tone={item.state === "complete" ? "up" : item.state === "current" ? "warning" : "neutral"} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RunEventTimeline({
  events,
}: {
  events: Array<{ at: string; label: string; status: "completed" | "running" | "pending" }>;
}) {
  return (
    <section className="system-frame p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="section-kicker">Run timeline</div>
          <h2 className="mt-3 text-lg font-semibold text-[var(--text)]">Execution state changes</h2>
        </div>
        <ToneChip label="Telemetry" tone="neutral" />
      </div>
      <div className="timeline-stack">
        {events.map((event) => (
          <div key={`${event.at}-${event.label}`} className="timeline-row">
            <p className="text-[0.7rem] uppercase tracking-[0.14em] text-[var(--text-soft)]">{event.at}</p>
            <div className="timeline-node" />
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{event.label}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Mission event recorded in the run ledger.</p>
            </div>
            <div className="hidden md:block">
              <ToneChip label={event.status === "running" ? "live" : event.status} tone={event.status === "completed" ? "up" : event.status === "running" ? "warning" : "neutral"} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MicroSignal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-[var(--line)] py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--text)]">
        <Dot className="h-4 w-4 text-[var(--accent)]" />
        {value}
      </span>
    </div>
  );
}
