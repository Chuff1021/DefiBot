import type { ModuleBoundary, RepositoryAssessment } from "../domain/types.js";
import { dataModuleBoundary } from "../modules/data/index.js";
import { indicatorModuleBoundary } from "../modules/indicators/index.js";
import { strategyModuleBoundary } from "../modules/strategies/index.js";
import { executionModuleBoundary } from "../modules/execution/index.js";
import { riskModuleBoundary } from "../modules/risk/index.js";
import { portfolioModuleBoundary } from "../modules/portfolio/index.js";

export const repositoryAssessments: RepositoryAssessment[] = [
  {
    surface: "Standalone TypeScript foundation",
    classification: "build-now",
    reason: "The repo is effectively empty, so the safest first step is a clean domain-first scaffold with no legacy coupling.",
  },
  {
    surface: "Live venue connectors",
    classification: "reserved",
    reason: "Real RPC, DEX, and perp integrations should wait until risk boundaries, paper mode, and fixtures exist.",
  },
  {
    surface: "UI and operator console",
    classification: "later",
    reason: "A minimal control plane can be layered on after the first research and paper-trading pipeline is fixture-backed.",
  },
];

export const foundationBoundaries: ModuleBoundary[] = [
  dataModuleBoundary,
  indicatorModuleBoundary,
  strategyModuleBoundary,
  executionModuleBoundary,
  riskModuleBoundary,
  portfolioModuleBoundary,
];
