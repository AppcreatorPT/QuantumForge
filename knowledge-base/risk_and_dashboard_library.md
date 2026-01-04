# Risk Management & Dashboards Library

This file provides templates for Professional Risk Management and Visual Dashboards.
ALWAYS include these features when the user asks for a "Complete" or "Professional" strategy.

## 1. Professional Risk Management System (Risk OS)
**Concept:** Standardized inputs for Stop Loss, Take Profit, and Trailing Stops.

```pinescript
// --- RISK MANAGEMENT INPUTS ---
float stopLossPct = input.float(1.5, "Stop Loss (%)", minval=0.1, step=0.1) / 100
float takeProfitPct = input.float(3.0, "Take Profit (%)", minval=0.1, step=0.1) / 100
bool useTrailing = input.bool(true, "Use Trailing Stop?")
float trailPct = input.float(1.0, "Trailing Stop (%)") / 100

// Calculation (Example for LONG)
// You must calculate these AFTER your entry condition
var float longSL = na
var float longTP = na

if (strategy.position_size > 0 and strategy.position_size[1] == 0) // On Entry
    longSL := close * (1 - stopLossPct)
    longTP := close * (1 + takeProfitPct)

// Trailing Logic
if (useTrailing and strategy.position_size > 0)
    float proposedSL = close * (1 - trailPct)
    if proposedSL > longSL
        longSL := proposedSL // Move SL up only

// Visualization of Risk
plot(strategy.position_size > 0 ? longSL : na, "Stop Loss", color=color.red, style=plot.style_linebr)
plot(strategy.position_size > 0 ? longTP : na, "Take Profit", color=color.green, style=plot.style_linebr)

// Auto-Exit
if (strategy.position_size > 0)
    strategy.exit("Exit Long", from_entry="Long", stop=longSL, limit=longTP)
```

## 2. Professional Dashboard (Table)
**Concept:** A display in the corner of the screen showing real-time status.

```pinescript
// --- DASHBOARD ---
bool showDash = input.bool(true, "Show Dashboard")
var table dash = table.new(position.top_right, 2, 4, bgcolor=color.new(color.black, 50), border_width=1)

if showDash and barstate.islast
    table.cell(dash, 0, 0, "Metric", text_color=color.white, bgcolor=color.gray)
    table.cell(dash, 1, 0, "Value", text_color=color.white, bgcolor=color.gray)
    
    table.cell(dash, 0, 1, "RSI (14)", text_color=color.white)
    table.cell(dash, 1, 1, str.tostring(ta.rsi(close, 14), "#.##"), text_color=ta.rsi(close, 14) > 70 ? color.red : color.green)
    
    table.cell(dash, 0, 2, "Trend", text_color=color.white)
    table.cell(dash, 1, 2, close > ta.ema(close, 200) ? "BULLISH" : "BEARISH", text_color=close > ta.ema(close, 200) ? color.green : color.red)
```
