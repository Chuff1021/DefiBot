# KuCoin Bot Research

## Current KuCoin bot families identified from official KuCoin sources

Spot-side lineup referenced by KuCoin fee rules and support content:

- Spot Grid
- Infinity Grid
- AI Spot Trend
- AI Dynamic
- Grid Spot Martingale
- Smart Rebalance
- DCA
- Margin Grid

Futures-side lineup referenced by KuCoin fee rules, support pages, and bot guides:

- Futures Grid
- AI Futures Trend
- Futures Martingale
- DualFutures AI

## Strategy mechanics summary

### Spot Grid

- Trades inside a fixed range
- Profits from repeated mean reversion and oscillation
- High fee sensitivity because of repeated order flow

### Futures Grid

- Same grid concept but with leverage and long/short bias
- Requires margin and liquidation handling
- Strongly dependent on fee and liquidation modeling

### Infinity Grid

- Similar to spot grid but designed for uptrends
- Keeps compounding upward without a fixed top cap

### Smart Rebalance

- Portfolio allocation bot
- Rebalances by threshold or time interval
- Better fit for multi-asset holding and portfolio management

### DCA

- Periodic fixed-amount accumulation
- Optional profit-target logic
- Better as accumulation tooling than short-term alpha strategy

### Grid Spot Martingale / Futures Martingale

- Adds size when price moves against the position
- Lowers average cost but increases tail risk
- Dangerous for small accounts without very hard stop rules

### AI Spot Trend

- KuCoin states this uses stochastic indicators and weighted moving averages
- Buys when fast lines cross above slow lines and sells on the reverse
- Best near the start of a bullish trend

### AI Dynamic

- KuCoin includes this in fee rules, but public documentation is thinner
- Best interpreted as an AI-managed adaptive allocation and parameter strategy

### AI Futures Trend

- Futures trend-following category
- Should be treated as leverage plus trend confirmation plus hard risk limits

### DualFutures AI

- KuCoin describes this as an AI-driven futures bot with aggressive and conservative modes
- Designed to adapt across changing market conditions
- Requires the strongest infrastructure to reproduce responsibly

## Build plan for this repo

### Phase 1: fastest path to real testing

Implement these first:

1. Spot Grid
2. Futures Grid
3. Smart Rebalance
4. DCA
5. AI Spot Trend

Why:

- official mechanics are relatively clear
- easier to backtest than the more opaque AI bots
- enough to reproduce the core KuCoin bot experience quickly

### Phase 2: after the first paper engine is trustworthy

Implement next:

1. Infinity Grid
2. Grid Spot Martingale
3. AI Futures Trend

Why:

- needs stronger trend and volatility regime handling
- martingale requires better risk and shutdown logic

### Phase 3: only after futures risk modeling is mature

Implement last:

1. Margin Grid
2. Futures Martingale
3. AI Dynamic
4. DualFutures AI

Why:

- more opaque or more dangerous
- requires debt, liquidation, advanced parameter adaptation, or portfolio-level AI control

## Practical warning for a $100 starting balance

The bot families that are most realistic to test with a small balance are:

- AI Spot Trend
- DCA
- Smart Rebalance
- carefully constrained Spot Grid

The most dangerous to test early with a $100 balance are:

- Futures Martingale
- Margin Grid
- DualFutures AI clones without mature risk controls

## Working implementation sequence

1. Strategy registry and UI catalog
2. Live market-data adapters
3. Paper execution ledger
4. Backtest engine with fees and slippage
5. Strategy-specific parameter panels
6. Running bot management and pause/stop controls
7. Analytics and ranking

## Official sources used

- KuCoin Trading Bot Fee Rules: https://www.kucoin.com/ar/support/5310983040025
- KuCoin support FAQ on bot lineup: https://www.kucoin.com/support/21959669755417
- KuCoin support on AI Spot Trend: https://www.kucoin.com/support/24145619159577
- KuCoin Learn on Futures Grid: https://www.kucoin.com/learn/trading-bot/kucoin-futures-grid-bot
- KuCoin Learn on Smart Rebalance: https://www.kucoin.com/learn/trading-bot/smart-rebalance-trading-bot
- KuCoin Learn on DCA: https://www.kucoin.com/learn/trading-bot/dca-trading-bot
- KuCoin Learn on Infinity Grid: https://www.kucoin.com/learn/trading-bot/what-is-infinity-grid-trading-bot-and-how-does-it-work
- KuCoin Learn on DualFutures AI: https://www.kucoin.com/pl/learn/trading-bot/how-to-use-dualfutures-ai-bot
