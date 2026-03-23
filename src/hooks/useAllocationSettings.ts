"use client";

import { useEffect, useState } from "react";
import { AllocationSettings, defaultAllocationSettings } from "@/lib/allocation-settings";

const STORAGE_KEY = "kalshi_botos_allocation_settings";

export function useAllocationSettings() {
  const [settings, setSettings] = useState<AllocationSettings>(defaultAllocationSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setReady(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<AllocationSettings>;
      setSettings({
        bankroll: parsed.bankroll ?? defaultAllocationSettings.bankroll,
        maxPositionSize: parsed.maxPositionSize ?? defaultAllocationSettings.maxPositionSize,
        maxOpenExposure: parsed.maxOpenExposure ?? defaultAllocationSettings.maxOpenExposure,
        strategyAllocations: {
          ...defaultAllocationSettings.strategyAllocations,
          ...(parsed.strategyAllocations ?? {}),
        },
      });
    } catch {
      setSettings(defaultAllocationSettings);
    } finally {
      setReady(true);
    }
  }, []);

  function updateSettings(next: AllocationSettings) {
    setSettings(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return {
    settings,
    ready,
    updateSettings,
  };
}

