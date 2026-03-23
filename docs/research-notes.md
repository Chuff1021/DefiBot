# DefiBot Research Notes

## Objective

Build a DeFi-focused trading platform inspired by Jesse and Freqtrade, but optimized first for:

- chart-centric workflow
- paper trading and backtesting before live execution
- low-fee venue selection
- realistic order-book-aware execution
- small-account survivability starting around `$100`

## What to copy from existing bots

### Jesse-inspired

- fast strategy iteration
- one integrated product for backtest, paper trade, and live execution
- interactive charts as a first-class part of the product
- support for multiple timeframes and clear strategy ergonomics

### Freqtrade-inspired

- explicit fee-aware backtesting
- optimization workflows for parameter search
- strong dry-run mentality before live capital
- strategy modularity and repeatable research process

## Product direction

The first version should not try to be a universal bot. It should be a focused research terminal with:

1. one primary venue
2. three liquid instruments
3. three candidate strategies
4. one paper execution engine
5. one backtest engine with realistic fills

## Recommended first venue order

1. Hyperliquid
2. Drift
3. Vertex

Rationale:

- public market data and order-book access
- relatively low fees
- enough liquidity to make small-size testing meaningful
- suitable for 24/7 crypto market operation

## Strategy shortlist

### 1. Micro Reversion Maker

Best first strategy for a small account.

Why:

- avoids constant taker fees
- can restrict entries to high-liquidity conditions
- easier to enforce positive expectancy after costs

### 2. Trend Breakout Perp

Best second strategy.

Why:

- lower trade count than scalping
- clearer regime filters
- easier to reason about on interactive charts and replay tools

### 3. Funding Basis Carry

Worth researching, but not first for a `$100` account.

Why:

- attractive in theory
- usually more capital inefficient at very small size
- more complex to model and execute

## Non-negotiable requirements

- no live trading until paper execution and backtests agree within acceptable tolerance
- every backtest includes fee, slippage, and latency assumptions
- every strategy gets a kill switch, max daily loss, and max drawdown cap
- charts must display entries, exits, stop bands, and regime overlays

## Current implementation status

- Hyperliquid snapshot route for candles, mids, and L2 book
- Live browser WebSocket subscriptions for `allMids`, `candle`, and `l2Book`
- Chart-first dashboard shell now upgrades from snapshot load to live market updates

## Next engineering steps

1. Add replayable event storage for candles, trades, and book snapshots
2. Build a paper execution engine with maker/taker, spread crossing, and slippage rules
3. Add backtest jobs and strategy-specific metrics for the first two strategy candidates
