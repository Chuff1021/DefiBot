# Foundation Scaffold

## Purpose

This repository starts from scratch as a standalone DeFi bot codebase. The current implementation is intentionally limited to architecture-safe foundations.

## Included now

- shared domain types for chains, venues, market data, portfolio state, signals, risk, and execution intents
- phase-one chain and venue registries aligned to low-fee EVM-first deployment
- strategy family registry for trend breakout, mean reversion, and cross-venue spread research
- placeholder module boundaries for data, indicators, strategies, execution, risk, and portfolio
- repository audit notes describing what is safe to build next versus what is intentionally deferred

## Explicitly not included yet

- live wallet handling
- real RPC or venue connectors
- backtesting engine implementation
- paper trading engine
- strategy logic beyond interface boundaries
- web UI or operator dashboard

## Recommended next implementation subtask

Build a fixture-backed research slice:

1. add DeFi-native candle, market snapshot, and portfolio fixtures
2. implement EMA, ATR, and RSI primitives in `src/modules/indicators`
3. add a first trend-breakout strategy prototype in `src/modules/strategies`
4. add a simple paper-execution adapter and risk-rule implementations
5. introduce tests around signal generation and pre-trade risk checks
