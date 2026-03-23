import Link from "next/link";
import { AppTopbar, BottomActionBar, StatusChip } from "@/components/trade/TradeUI";
import { runFixtureBackedResearchSlice } from "@/lib/defi";
import { strategyMocks } from "@/lib/trade-mock-data";

export default async function StrategiesPage() {
  const defiSlice = await runFixtureBackedResearchSlice().catch(() => null);

  return (
    <>
      <AppTopbar
        title="Strategy selection"
        subtitle="Choose a market approach before launching a simulated run."
        rightLabel="visual only"
      />

      <section className="space-y-3">
        {defiSlice ? (
          <article className="premium-panel rounded-2xl border border-emerald-400/20 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-300">New DeFi vertical slice</p>
                <h2 className="text-base font-semibold text-white">{defiSlice.strategy.name}</h2>
              </div>
              <StatusChip label={defiSlice.signal.action} tone={defiSlice.signal.action === "wait" ? "warning" : "up"} />
            </div>

            <p className="text-sm text-[#b4c3e8]">
              Fixture-backed paper-trading research flow for {defiSlice.snapshot?.pair} on {defiSlice.snapshot?.chainId}.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#a9b9df] md:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">Last close: ${defiSlice.signal.indicators?.lastClose?.toFixed(2) ?? "n/a"}</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">EMA 5/12: {defiSlice.signal.indicators?.emaFast?.toFixed(2) ?? "n/a"} / {defiSlice.signal.indicators?.emaSlow?.toFixed(2) ?? "n/a"}</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">RSI 14: {defiSlice.signal.indicators?.rsi?.toFixed(2) ?? "n/a"}</div>
              <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1">ATR %: {defiSlice.signal.indicators?.atrPct?.toFixed(2) ?? "n/a"}%</div>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-[#dce6ff]">
              <p className="font-medium text-white">Paper execution posture</p>
              <p className="mt-1">Risk: {defiSlice.risk.summary}</p>
              <p className="mt-1">Execution preview: {defiSlice.executionPreview ? `$${defiSlice.executionPreview.expectedPrice.toFixed(2)} with $${defiSlice.executionPreview.estimatedFeeUsd.toFixed(2)} fees + $${defiSlice.executionPreview.estimatedGasUsd.toFixed(2)} gas` : "No order preview because the signal stayed in wait mode."}</p>
              <p className="mt-1">API route: <code>/api/defi/research-slice</code></p>
            </div>
          </article>
        ) : null}

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
