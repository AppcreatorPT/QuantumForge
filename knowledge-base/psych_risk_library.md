# User Psychology & Risk Management Library
**Version:** 2.0 (Pine Script v6)
**Tags:** #RiskManagement #Psychology #PositionSizing #EquityCurve

This module focuses on Capital Preservation and Growth, prioritizing "How much" over "When".

## 1. Dynamic Position Sizing

### A. The Kelly Criterion (Simplified)
**Theory:** Mathematically optimal bet size to maximize growth while avoiding ruin.
**Formula:** $f = p - (1-p)/b$ where $p$ is win rate and $b$ is reward-to-risk ratio.

```pinescript
// Simplified Kelly Input
float win_rate = input.float(0.5, "Expected Win Rate")
float reward_ratio = input.float(2.0, "Reward to Risk")
float kelly_pct = win_rate - (1 - win_rate) / reward_ratio

// Safety: Use "Half Kelly" to reduce volatility
float risk_per_trade = (kelly_pct * 0.5) * 100 
strategy.entry("Kelly Long", strategy.long, qty=strategy.equity * (risk_per_trade / 100) / close)
```

### B. Volatility Sizing (ATR Based)
**Theory:** Adjust size so that highly volatile periods have smaller size. Risk stays constant in Dollar terms.

```pinescript
float risk_dollars = strategy.equity * 0.01 // Risk 1%
float atr_val = ta.atr(14)
float stop_loss_dist = atr_val * 2.0
float pos_size = risk_dollars / stop_loss_dist

strategy.entry("Vol Scaled", strategy.long, qty=pos_size)
strategy.exit("Exit", stop=close - stop_loss_dist)
```

## 2. Streak Management (Psychology)

### A. Anti-Martingale (Snowball)
**Theory:** Increase risk during winning streaks (playing with house money), reduce immediately on loss.

```pinescript
var float current_risk = 1.0 // Start at 1%
if strategy.opentrades == 0
    if strategy.closedtrades > 0
        if strategy.wintrades > strategy.wintrades[1]
            current_risk := math.min(current_risk * 1.5, 5.0) // Cap at 5%
        else
            current_risk := 1.0 // Reset on loss
```

### B. The "Cooler" (Tilt Protection)
**Theory:** Stop trading if losing streak gets too long to prevent emotional trading.

```pinescript
var int cons_losses = 0
if strategy.losstrades > strategy.losstrades[1]
    cons_losses += 1
else if strategy.wintrades > strategy.wintrades[1]
    cons_losses := 0

bool is_tilted = cons_losses >= 3
// Condition: and not is_tilted
```

## 3. Equity Curve Trading
**Theory:** Only trade when the system is "in sync" with the market (Equity Curve is trending up).

```pinescript
float eq_avg = ta.sma(strategy.equity, 20)
bool system_healthy = strategy.equity > eq_avg

// Plotting for visual audit
plot(strategy.equity, "Equity", color=color.white)
plot(eq_avg, "Equity SMA", color=color.yellow)

// Logic
if longCondition and system_healthy
    strategy.entry("System Sync", strategy.long)
```
