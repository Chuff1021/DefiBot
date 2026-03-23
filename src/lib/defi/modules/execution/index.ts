import { defaultCostModels } from "@/lib/defi/config";
import { fixtureMarketData } from "@/lib/defi/modules/data";
import type { ExecutionIntent, ModuleBoundary, PaperExecutionReceipt, PaperPosition } from "@/lib/defi/types";

export interface QuotePreview {
  venueId: string;
  expectedPrice: number;
  estimatedFeeUsd: number;
  estimatedGasUsd: number;
}

export interface ExecutionVenueAdapter {
  id: string;
  preview(intent: ExecutionIntent): Promise<QuotePreview>;
  submit(intent: ExecutionIntent): Promise<{ accepted: boolean; reference: string }>;
}

function getCostModel(venueId: string) {
  return defaultCostModels.find((item) => item.venueId === venueId) ?? defaultCostModels[0];
}

export class PaperExecutionAdapter implements ExecutionVenueAdapter {
  id = "paper-execution";

  async preview(intent: ExecutionIntent): Promise<QuotePreview> {
    const costModel = getCostModel(intent.venueId);
    const expectedPrice = fixtureMarketData.snapshot.midPrice;
    const feeBps = costModel.takerBps ?? costModel.makerBps ?? 0;

    return {
      venueId: intent.venueId,
      expectedPrice,
      estimatedFeeUsd: Number(((intent.notionalUsd * feeBps) / 10_000).toFixed(4)),
      estimatedGasUsd: costModel.estimatedGasUsd,
    };
  }

  async submit(intent: ExecutionIntent): Promise<{ accepted: boolean; reference: string }> {
    return {
      accepted: true,
      reference: `paper-${intent.strategyId}-${Date.now()}`,
    };
  }
}

export async function simulatePaperExecution(intent: ExecutionIntent): Promise<PaperExecutionReceipt> {
  const adapter = new PaperExecutionAdapter();
  const preview = await adapter.preview(intent);
  const submitResult = await adapter.submit(intent);
  const quantity = Number((intent.notionalUsd / preview.expectedPrice).toFixed(6));

  const positionAfter: PaperPosition = {
    pair: intent.pair,
    venueId: intent.venueId,
    side: intent.side === "buy" ? "long" : "short",
    quantity,
    entryPrice: preview.expectedPrice,
    markPrice: preview.expectedPrice,
    notionalUsd: intent.notionalUsd,
  };

  return {
    accepted: submitResult.accepted,
    reference: submitResult.reference,
    mode: "paper",
    intent,
    fillPrice: preview.expectedPrice,
    estimatedFeeUsd: preview.estimatedFeeUsd,
    estimatedGasUsd: preview.estimatedGasUsd,
    positionAfter,
    notes: [
      "Fixture-backed paper fill only; no wallet, chain, or venue interaction occurred.",
      `Max configured slippage for this intent: ${intent.maxSlippageBps} bps.`,
    ],
    timestamp: new Date().toISOString(),
  };
}

export const executionModuleBoundary: ModuleBoundary = {
  moduleId: "execution",
  title: "Execution router module",
  stage: "ready",
  responsibilities: [
    "Route normalized intents into venue-specific adapters.",
    "Preserve strict separation between preview, paper execution, and live execution.",
  ],
  nextTargets: ["Add quote validation and slippage checks", "Add portfolio snapshot mutation for receipts"],
};
