# Classic Indicators Megapack (Elite Visuals)

This file contains the "Gold Standard" code for the most used indicators.
**MANDATORY:** Use `color.from_gradient` and `fill` for visuals.

## 1. MACD (Gradient Edition)
**Use:** Trend changes and momentum.
```pinescript
// --- MACD INPUTS ---
int fastLen = input.int(12, "MACD Fast")
int slowLen = input.int(26, "MACD Slow")
int sigLen  = input.int(9, "MACD Signal")

// --- CALCULATION ---
[macdLine, signalLine, histLine] = ta.macd(close, fastLen, slowLen, sigLen)

// --- VISUALS ---
// Gradient based on Histogram strength
color histColor = color.from_gradient(histLine, -1, 1, color.red, color.green)

plot(macdLine, "MACD", color=color.blue)
plot(signalLine, "Signal", color=color.orange)
plot(histLine, "Hist", color=histColor, style=plot.style_columns)
```

## 2. Supertrend (Cloud Edition)
**Use:** Trend following with visual zones.
```pinescript
// --- SUPERTREND ---
[superTrendVal, trendDirection] = ta.supertrend(3.0, 10)

// --- VISUALS ---
bool bullish = trendDirection == -1
plot(superTrendVal, "Supertrend", color = bullish ? color.green : color.red, linewidth=2)

// Cloud Effect (Fill to price or close)
p1 = plot(superTrendVal, display=display.none)
p2 = plot(close, display=display.none)
fill(p1, p2, color=bullish ? color.new(color.green, 90) : color.new(color.red, 90), title="Trend Cloud")
```

## 3. RSI (Gradient Zones)
**Use:** Overbought/Oversold visually mapped.
```pinescript
// --- RSI ---
float rsi = ta.rsi(close, 14)

// --- GRADIENT ---
// Green when high (bullish momentum), Red when low? No, typically RSI > 70 is Red (Overbought).
// Let's make it heat-map style: Red = Hot (High RSI), Green = Cool (Low RSI) for mean reversion.
color bondColor = color.from_gradient(rsi, 30, 70, color.green, color.red)
plot(rsi, "RSI", color=bondColor, linewidth=2)
hline(70, "OB", color=color.red)
hline(30, "OS", color=color.green)
```

## 4. VWAP (Intraday Gold)
**Use:** Institutional benchmark with session fill.
```pinescript
float vwapVal = ta.vwap(close)
plot(vwapVal, "VWAP", color=color.rgb(255, 215, 0), linewidth=2) // Gold Color
```
