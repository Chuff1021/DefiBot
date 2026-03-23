# DeFi Foundation Scaffold

## Purpose

This scaffold introduces the minimum safe architectural base for transitioning the existing Next.js workspace from Kalshi-oriented workflows toward a personal-use DeFi trading platform.

It does **not** implement live trading, real connectors, or production strategies yet.

## Architecture audit summary

### Reuse now

- [`src/app`](../src/app) app router structure and shared layout shell
- [`src/components`](../src/components) console-style UI composition patterns
- [`src/lib/env.ts`](../src/lib/env.ts) environment parsing patterns and server-side config handling

### Isolate during transition

- [`src/lib/kalshi.ts`](../src/lib/kalshi.ts)
- [`src/app/api/kalshi`](../src/app/api/kalshi)
- [`src/lib/strategy-engine.ts`](../src/lib/strategy-engine.ts)

These remain functional for the current app, but they are not the new architectural base.

### Deprecate later

- [`src/lib/trade-mock-data.ts`](../src/lib/trade-mock-data.ts)

This file still supports the current UI, but future subtasks should replace its Kalshi-specific fixtures with DeFi-native research, portfolio, and execution fixtures.

## New scaffold layout

- [`src/lib/defi/types.ts`](../src/lib/defi/types.ts): shared domain types for chains, venues, candles, snapshots, signals, execution intents, and risk checks
- [`src/lib/defi/config.ts`](../src/lib/defi/config.ts): initial chain, venue, strategy, and cost-model registry
- [`src/lib/defi/audit.ts`](../src/lib/defi/audit.ts): in-repo architecture audit and foundation boundaries
- [`src/lib/defi/modules/data/index.ts`](../src/lib/defi/modules/data/index.ts): market data adapter boundary
- [`src/lib/defi/modules/indicators/index.ts`](../src/lib/defi/modules/indicators/index.ts): indicator contract boundary
- [`src/lib/defi/modules/strategies/index.ts`](../src/lib/defi/modules/strategies/index.ts): strategy evaluation boundary and registry export
- [`src/lib/defi/modules/execution/index.ts`](../src/lib/defi/modules/execution/index.ts): execution router and venue adapter boundary
- [`src/lib/defi/modules/risk/index.ts`](../src/lib/defi/modules/risk/index.ts): centralized risk rule boundary and default guardrails
- [`src/lib/defi/modules/portfolio/index.ts`](../src/lib/defi/modules/portfolio/index.ts): normalized portfolio snapshot boundary
- [`src/lib/defi/index.ts`](../src/lib/defi/index.ts): barrel export for future adoption

## Immediate next implementation target

The next subtask should build the first **fixture-backed research pipeline**:

1. create DeFi-native mock fixtures for candles, venue snapshots, and portfolio state
2. implement the first indicator primitives, likely EMA, ATR, and RSI
3. wire a single trend-breakout strategy prototype against the new scaffold
4. expose the new registry and scaffold status in one minimal UI surface without removing legacy Kalshi screens

## Transition guidance

- Prefer new work under [`src/lib/defi`](../src/lib/defi).
- Keep legacy Kalshi code running until equivalent DeFi surfaces exist.
- Do not route live credentials or execution through the new scaffold until risk, paper trading, and adapter validation layers are implemented.
