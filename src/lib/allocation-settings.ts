export type AllocationSettings = {
  bankroll: number;
  maxPositionSize: number;
  maxOpenExposure: number;
  strategyAllocations: Record<string, number>;
};

export const defaultAllocationSettings: AllocationSettings = {
  bankroll: 19,
  maxPositionSize: 4,
  maxOpenExposure: 10,
  strategyAllocations: {
    "fed-event-drift": 3,
    "btc-15m-pulse": 2,
    "btc-range-fade": 2,
  },
};

export function formatDollars(amount: number) {
  return `$${amount.toFixed(2)}`;
}
