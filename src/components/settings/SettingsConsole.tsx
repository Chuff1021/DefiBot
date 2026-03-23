"use client";

import { ChangeEvent } from "react";
import { AppTopbar, BottomActionBar, StatusChip } from "@/components/trade/TradeUI";
import { useAllocationSettings } from "@/hooks/useAllocationSettings";
import { defaultAllocationSettings, formatDollars } from "@/lib/allocation-settings";
import { strategyMocks } from "@/lib/trade-mock-data";

export function SettingsConsole() {
  const { settings, ready, updateSettings } = useAllocationSettings();

  function updateNumberField(field: "bankroll" | "maxPositionSize" | "maxOpenExposure", value: string) {
    const nextValue = Number(value);
    updateSettings({
      ...settings,
      [field]: Number.isFinite(nextValue) ? nextValue : 0,
    });
  }

  function updateStrategyAllocation(strategyId: string, value: string) {
    const nextValue = Number(value);
    updateSettings({
      ...settings,
      strategyAllocations: {
        ...settings.strategyAllocations,
        [strategyId]: Number.isFinite(nextValue) ? nextValue : 0,
      },
    });
  }

  function handleReset() {
    updateSettings(defaultAllocationSettings);
  }

  if (!ready) {
    return null;
  }

  return (
    <>
      <AppTopbar
        title="Risk and allocation settings"
        subtitle="These settings are stored locally in your browser and drive the strategy sizing shown on the dashboard."
        rightLabel="live controls"
      />

      <section className="space-y-3">
        <div className="connect-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--text)]">Account sizing</h2>
            <StatusChip label="active" tone="up" />
          </div>

          <div className="connect-field-grid">
            <label className="connect-field">
              <span>Total bankroll</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.bankroll}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateNumberField("bankroll", event.target.value)}
              />
            </label>
            <label className="connect-field">
              <span>Max position size</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.maxPositionSize}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateNumberField("maxPositionSize", event.target.value)}
              />
            </label>
          </div>

          <div className="connect-field-grid">
            <label className="connect-field">
              <span>Max open exposure</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={settings.maxOpenExposure}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateNumberField("maxOpenExposure", event.target.value)}
              />
            </label>
            <div className="connect-detail-cell">
              <span>Suggested posture</span>
              <strong>
                {formatDollars(settings.bankroll)} bankroll / {formatDollars(settings.maxPositionSize)} max per trade
              </strong>
            </div>
          </div>
        </div>

        <div className="connect-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--text)]">Per-strategy allocations</h2>
            <button type="button" className="connect-button-secondary" onClick={handleReset}>
              Reset defaults
            </button>
          </div>

          <div className="space-y-3">
            {strategyMocks.map((strategy) => (
              <div key={strategy.id} className="connect-detail-cell">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">{strategy.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{strategy.description}</p>
                  </div>
                  <StatusChip label={strategy.status} tone={strategy.status === "ready" ? "up" : "warning"} />
                </div>

                <label className="connect-field">
                  <span>Allocation</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.strategyAllocations[strategy.id] ?? 0}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updateStrategyAllocation(strategy.id, event.target.value)}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BottomActionBar secondaryLabel="Back dashboard" secondaryHref="/dashboard" primaryLabel="Return home" primaryHref="/" />
    </>
  );
}
