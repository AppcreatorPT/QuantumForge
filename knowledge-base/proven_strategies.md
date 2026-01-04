# Proven Strategies Library (Elite Reference)

This file contains **Elite Verified** strategy code snippets.
**CRITICAL:** ALL generated strategies MUST follow this structure (Inputs -> Dates -> logic -> Execution -> Dashboard).

## 1. Trend Following (Moving Average Crossover) - Elite Edition
**Features:** Date Filter, Risk Management (SL/TP), Dashboard.
```pinescript
//@version=6
strategy("Trend Follower Elite", overlay=true, initial_capital=1000, default_qty_type=strategy.percent_of_equity, default_qty_value=100)

// --- 1. STRATEGY INPUTS ---
int fastLen = input.int(9, "Fast Length", group="Strategy")
int slowLen = input.int(21, "Slow Length", group="Strategy")

// --- 2. RISK MANAGEMENT (MANDATORY) ---
float stopLossPct = input.float(1.5, "Stop Loss (%)", minval=0.1, step=0.1, group="Risk") / 100
float takeProfitPct = input.float(3.0, "Take Profit (%)", minval=0.1, step=0.1, group="Risk") / 100

// --- 3. DATE RANGE FILTER (MANDATORY) ---
bool useDate = input.bool(true, "Filter Date Range", group="Backtest")
int startYear = input.int(2023, "Start Year", group="Backtest")
// Logic:
bool inDate = not useDate or time >= timestamp(startYear, 1, 1, 0, 0)

// --- 4. INDICATORS ---
float fastMA = ta.ema(close, fastLen)
float slowMA = ta.ema(close, slowLen)
// Visuals
plot(fastMA, "Fast", color=color.green)
plot(slowMA, "Slow", color=color.red)

// --- 5. LOGIC & EXECUTION ---
bool longCond = ta.crossover(fastMA, slowMA) and inDate
bool shortCond = ta.crossunder(fastMA, slowMA) and inDate

if longCond
    strategy.entry("Long", strategy.long)
    // Auto-Exit setting
    strategy.exit("Exit Long", from_entry="Long", stop=close*(1-stopLossPct), limit=close*(1+takeProfitPct))

if shortCond
    strategy.close("Long")

// --- 6. DASHBOARD (MANDATORY) ---
var table dash = table.new(position.top_right, 2, 2, bgcolor=color.new(color.black, 50))
if barstate.islast
    table.cell(dash, 0, 0, "Trend", text_color=color.white)
    table.cell(dash, 1, 0, fastMA > slowMA ? "BULLISH" : "BEARISH", text_color=fastMA > slowMA ? color.green : color.red)
```

## 2. Mean Reversion (RSI-2) - Elite Edition
**Features:** 200 SMA Filter, Aggressive Entries, Auto SL/TP.
```pinescript
//@version=6
strategy("RSI-2 Mean Reversion Elite", overlay=true)

// Config
int rsiLen = input.int(2, "RSI Length")
int mafLength = input.int(200, "Trend Filter MA")
// Risk
float slPct = input.float(2.0, "Stop Loss (%)", group="Risk") / 100
float tpPct = input.float(1.0, "Take Profit (%)", group="Risk") / 100

// Calculation
float rsi = ta.rsi(close, rsiLen)
float trendMa = ta.sma(close, mafLength)

// Colors (Gradient Visuals)
plot(trendMa, "200 SMA", color=close > trendMa ? color.green : color.red, linewidth=2)

// Logic
// Buy when price > 200 SMA (Uptrend) but RSI is oversold (< 10)
bool validSetup = close > trendMa and rsi < 10

if validSetup
    strategy.entry("Long Dip", strategy.long)
    strategy.exit("Exit Dip", stop=close*(1-slPct), limit=close*(1+tpPct))
```

## 3. Bollinger Squeeze Breakout - Elite Edition
**Features:** Keltner Channel Confirmation, Visual Squeeze Zones.
```pinescript
//@version=6
strategy("BB Squeeze Elite", overlay=true)

// Inputs
int len = input.int(20, "Length")
float mult = input.float(2.0, "Multi")

// Calc
[middle, upper, lower] = ta.bb(close, len, mult)

// Visuals (Fill)
fill(plot(upper), plot(lower), color=color.new(color.blue, 90), title="BB Zone")

// Logic etc...
// (AI should infer standard breakout logic here but apply Risk Mgmt)
```
