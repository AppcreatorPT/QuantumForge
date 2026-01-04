# Elite Modules Library (Pine Script v6)

This file contains advanced modules for Backtesting and Visual Excellence.
Use these to elevate the quality of the generated script to "Premium/Paid" level.

## 1. Backtest Date Range Filter
**Use:** REQUIRED for all Strategies. Allows users to test specific periods.
```pinescript
// --- BACKTESTING DATES ---
useDateFilter = input.bool(true, "Filter Date Range", group="Backtest Control")
startYear = input.int(2023, "Start Year", minval=1900, group="Backtest Control")
startMonth = input.int(1, "Start Month", minval=1, maxval=12, group="Backtest Control")
startDay = input.int(1, "Start Day", minval=1, maxval=31, group="Backtest Control")
endYear = input.int(2099, "End Year", minval=1900, group="Backtest Control")
endMonth = input.int(12, "End Month", minval=1, maxval=12, group="Backtest Control")
endDay = input.int(31, "End Day", minval=1, maxval=31, group="Backtest Control")

// --- DATE LOGIC ---
startTime = timestamp(startYear, startMonth, startDay, 00, 00)
endTime = timestamp(endYear, endMonth, endDay, 23, 59)
inDateRange = not useDateFilter or (time >= startTime and time <= endTime)

// --- EXECUTION WRAPPER ---
// Only enter trades if inDateRange is true
if inDateRange and YOUR_ENTRY_CONDITION
    strategy.entry("Long", strategy.long)
// Always allow closing trades regardless of date (to flatten book)
if YOUR_EXIT_CONDITION
    strategy.close("Long")
```

## 2. Gradient Coloring (Eye Candy)
**Use:** Replace boring single-color lines with gradients indicating momentum.
```pinescript
// --- VISUALS: GRADIENT LINE ---
// Example: RSI with Gradient
float rsiVal = ta.rsi(close, 14)
color rsiColor = color.from_gradient(rsiVal, 30, 70, color.red, color.green)
plot(rsiVal, "RSI Gradient", color=rsiColor, linewidth=2)

// Example: Background Gradient Trend
color bgColor = close > ta.ema(close, 200) ? color.new(color.green, 90) : color.new(color.red, 90)
bgcolor(bgColor, title="Trend BG")
```

## 3. Status Label (Watermark)
**Use:** Add a professional watermark label on the chart.
```pinescript
// --- WATERMARK ---
var label watermark = label.new(bar_index, high, "Strategy Active", style=label.style_none, textcolor=color.gray)
label.set_x(watermark, bar_index + 10) // Push to future
label.set_y(watermark, high)
label.set_text(watermark, "TradeOS Alpha\n" + syminfo.ticker + "\n" + timeframe.period)
```
