# Price Action Patterns Library (Pure Psychology)

This file contains logic for detecting raw Price Action patterns.
**Use:** Combine these with indicators for high-probability entries.

## 1. Pinbar (Rejection Candle)
**Logic:** Small body, long wick rejecting a level.
```pinescript
// --- PINBAR LOGIC ---
// Bullish Pinbar: Long lower wick, close in top third.
float bodySize = math.abs(close - open)
float rangeSize = high - low
float lowerWick = math.min(close, open) - low
float upperWick = high - math.max(close, open)

bool isBullPin = lowerWick > (rangeSize * 0.6) and bodySize < (rangeSize * 0.2)
bool isBearPin = upperWick > (rangeSize * 0.6) and bodySize < (rangeSize * 0.2)

// Plot
plotshape(isBullPin, "Bull Pin", shape.triangleup, location.belowbar, color.green, size=size.small)
plotshape(isBearPin, "Bear Pin", shape.triangledown, location.abovebar, color.red, size=size.small)
```

## 2. Engulfing Pattern (Momentum Shift)
**Logic:** Current candle completely consumes the previous one.
```pinescript
// --- ENGULFING LOGIC ---
bool bullEngulf = close > open and close[1] < open[1] and close > high[1] and open < low[1]
bool bearEngulf = close < open and close[1] > open[1] and close < low[1] and open > high[1]

// Filter: Ensure previous candle was not a doji (insignificant)
bool validPrev = math.abs(close[1] - open[1]) > ta.atr(14) * 0.3

bullEngulf := bullEngulf and validPrev
bearEngulf := bearEngulf and validPrev
```

## 3. Inside Bar (Consolidation/Indecision)
**Logic:** Current High/Low is completely inside previous High/Low.
```pinescript
bool insideBar = high < high[1] and low > low[1]
// Breakout Logic
bool breakUp = insideBar[1] and close > high[1]
bool breakDown = insideBar[1] and close < low[1]
```
