import { AppTopbar, BottomActionBar, StatusChip } from "@/components/trade/TradeUI";

const settingsMocks = [
  { label: "Default risk mode", value: "Balanced", hint: "Visual toggle only" },
  { label: "Trade notifications", value: "Push + Email", hint: "No outbound delivery" },
  { label: "Run auto-pause", value: "Enabled", hint: "Mocked control state" },
];

export default function SettingsPage() {
  return (
    <>
      <AppTopbar
        title="Settings"
        subtitle="Customize your visual trading workspace."
        rightLabel="local ui"
      />

      <section className="space-y-3">
        {settingsMocks.map((setting) => (
          <div key={setting.label} className="premium-panel rounded-2xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">{setting.label}</h2>
              <StatusChip label="mock" tone="warning" />
            </div>
            <p className="text-sm text-[#dce7ff]">{setting.value}</p>
            <p className="mt-1 text-xs text-[#8ea3d6]">{setting.hint}</p>
          </div>
        ))}
      </section>

      <BottomActionBar
        secondaryLabel="Back dashboard"
        secondaryHref="/dashboard"
        primaryLabel="Return home"
        primaryHref="/"
      />
    </>
  );
}

