import { AppTopbar, BottomActionBar, RunEventTimeline, StatusChip } from "@/components/trade/TradeUI";
import { runTimelineMock } from "@/lib/trade-mock-data";

type RunDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const { id } = await params;

  return (
    <>
      <AppTopbar
        title="Run detail"
        subtitle={`Viewing simulated state for ${id}.`}
        rightLabel="state machine"
      />

      <section className="premium-panel mb-4 rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Execution summary</h2>
          <StatusChip label="running" tone="up" />
        </div>
        <p className="text-sm text-[#b4c3e8]">
          This page represents strategy run states only. Quotes, orders, and account balances are placeholders with no live brokerage connection.
        </p>
      </section>

      <RunEventTimeline events={runTimelineMock} />

      <BottomActionBar
        secondaryLabel="Back dashboard"
        secondaryHref="/dashboard"
        primaryLabel="Open settings"
        primaryHref="/settings"
      />
    </>
  );
}

