import Link from "next/link";
import { AppTopbar, BottomActionBar, StatusChip } from "@/components/trade/TradeUI";
import { strategyMocks } from "@/lib/trade-mock-data";

export default function StrategiesPage() {
  return (
    <>
      <AppTopbar
        title="Strategy selection"
        subtitle="Choose a market approach before launching a simulated run."
        rightLabel="visual only"
      />

      <section className="space-y-3">
        {strategyMocks.map((strategy) => (
          <article key={strategy.id} className="premium-panel rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-white">{strategy.name}</h2>
              <StatusChip label={strategy.status} tone={strategy.status === "ready" ? "up" : "warning"} />
            </div>
            <p className="text-sm text-[#b4c3e8]">{strategy.description}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[#a9b9df]">
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">{strategy.market}</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">Mode: {strategy.mode}</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">Cadence: {strategy.cadence}</div>
            </div>
            <Link
              href="/dashboard"
              className="mt-3 inline-block rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs text-white"
            >
              Select strategy (mock)
            </Link>
          </article>
        ))}
      </section>

      <BottomActionBar
        secondaryLabel="Back connect"
        secondaryHref="/connect"
        primaryLabel="Open dashboard"
        primaryHref="/dashboard"
      />
    </>
  );
}
