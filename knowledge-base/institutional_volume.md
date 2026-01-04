# Institutional Volume Library (Order Flow)

This file contains logic for tracking "Smart Money" via volume.

## 1. Volume Delta (Buying vs Selling Pressure)
**Logic:** Estimate Buy/Sell volume based on candle movement.
```pinescript
// --- DELTA CALCULATION ---
// Simple approximation: If close > open, assume mostly buy volume.
float buyVol = close > open ? volume : 0
float sellVol = close < open ? volume : 0

// Accumulation (CVD)
var float cvd = 0.0
if barstate.isnew
    cvd := cvd + (buyVol - sellVol)

plot(cvd, "Cumulative Volume Delta", color=color.yellow)
```

## 2. Volume Spike Detection (Climax)
**Logic:** Volume > 2x Average Volume.
```pinescript
float volAvg = ta.sma(volume, 20)
bool volSpike = volume > (volAvg * 2.0)
// High Volume Node logic often implies a reversal or breakout start.
bgcolor(volSpike ? color.new(color.gray, 80) : na, title="Vol Spike")
```

## 3. OBV Divergence (Hidden Accumulation)
**Logic:** Price making Lower Lows, OBV making Higher Lows (Bullish).
```pinescript
float obv = ta.obv
// Pivot logic needed here (refer to Divergence module if exists, or simple lookback)
// Simplified Check:
bool priceDrop = close < close[10]
bool obvRise = obv > obv[10]
bool bullDiv = priceDrop and obvRise
```
