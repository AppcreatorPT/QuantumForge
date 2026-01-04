# Modern Indicators Library (Reference)

This file contains code for modern trading concepts (SMC, ICT, Price Action) to ensure the AI doesn't "hallucinate" these complex logic structures.

## 1. Fair Value Gap (FVG) - Advanced
**Concept:** Price inefficiency detection with threshold filtering.
```pinescript
//@version=6
indicator("SMC FVG", overlay=true)

// Config
float minGapSize = input.float(0.0005, "Min Gap Size (%)") / 100

// Bullish FVG: High[2] < Low[0]
bool bullishFVG = high[2] < low[0]
float gapSizeBull = (low[0] - high[2]) / high[2]
bool validBull = bullishFVG and gapSizeBull >= minGapSize

// Bearish FVG: Low[2] > High[0]
bool bearishFVG = low[2] > high[0]
float gapSizeBear = (low[2] - high[0]) / low[2]
bool validBear = bearishFVG and gapSizeBear >= minGapSize

// Visualization
if validBull
    box.new(bar_index[2], high[2], bar_index[0], low[0], bgcolor=color.new(color.green, 80), border_width=0)
if validBear
    box.new(bar_index[2], low[2], bar_index[0], high[0], bgcolor=color.new(color.red, 80), border_width=0)
```

## 2. Change of Character (ChoCH)
**Concept:** Trend reversal signal (High/Low Breakout).
```pinescript
//@version=6
indicator("SMC ChoCH", overlay=true)

int len = input.int(5, "Swing Length")

// Swing High/Low Detection
float ph = ta.pivothigh(len, len)
float pl = ta.pivotlow(len, len)

// Global tracking of recent structure
var float lastHigh = Na
var float lastLow = Na

if not na(ph)
    lastHigh := ph
if not na(pl)
    lastLow := pl

// ChoCH Logic
// Bullish: Price breaks above the last valid Lower High (in a downtrend context)
// Simplified for AI Reference:
bool bullishChoCH = ta.crossover(close, lastHigh)
bool bearishChoCH = ta.crossunder(close, lastLow)

if bullishChoCH
    label.new(bar_index, high, "ChoCH Bull", color=color.green)
```
