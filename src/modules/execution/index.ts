import type { ExecutionIntent, ModuleBoundary } from "../../domain/types.js";

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

export const executionModuleBoundary: ModuleBoundary = {
  moduleId: "execution",
  title: "Execution router",
  stage: "scaffold",
  responsibilities: [
    "Route normalized intents into venue-specific adapters.",
    "Preserve strict separation between preview, paper execution, and live execution.",
  ],
  nextTargets: ["Add paper execution adapter", "Add quote validation and slippage checks"],
};
