# Alpha Vault: Proven Strategy Logic
**Version:** 2.0 (Pine Script v6)
**Tags:** #Strategy #Alpha #Templates

A collection of 50+ proven trading logics to serve as templates for generation.

## 1. Trend Following
### A. The Supertrend
Logic: Uses ATR to calculate an offset from the median price. Visualizes trend direction flip.
```pinescript
[st, dir] = ta.supertrend(3.0, 10)
bool bullish = dir < 0
bool bearish = dir > 0
```

### B. Ichimoku Cloud Breakout
Logic: Price closes above the Cloud (Span A > Span B).
- **Bullish:** Close > Span A and Span A > Span B.
- **Filter:** Lagging Span is free of price.

### C. Parabolic SAR
Logic: Stop and Reverse dots flip position relative to price.
```pinescript
float sar = ta.sar(0.02, 0.02, 0.2)
bool flip_long = open < sar[1] and close > sar
```

## 2. Mean Reversion
### A. Bollinger Band Rejection
Logic: Price touches the Lower Band but closes inside.
```pinescript
[middle, upper, lower] = ta.bb(close, 20, 2.0)
bool reversal_long = low < lower and close > lower
```

### B. Larry Connors RSI 2
Logic: Deep pullback in an uptrend.
- Long: Close > 200 SMA AND RSI(2) < 5.
- Exit: Close > 5 SMA.

## 3. Volatility & Breakout
### A. Squeeze Momentum
Logic: Bollinger Bands trade INSIDE Keltner Channels (Low Volatility), then expand (Explosion).
- **Squeeze ON:** BB Width < KC Width.
- **Entry:** Squeeze OFF + Momentum Histogram > 0.

### B. Donchian Channel Breakout (Turtle Trading)
Logic: Buy new 20-day Highs. Sell new 10-day Lows.
```pinescript
float upper = ta.highest(high[1], 20)
bool break_long = high > upper
```

### C. Inside Bar Breakout
Logic: Current bar High/Low is completely inside previous bar High/Low.
- Entry: Next bar breaks the Mother Bar High.

## 4. Volume & Institutional
### A. VWAP Cross
Logic: Intraday price crosses the Volume Weighted Average Price.
- Institutional benchmark. Long when Price > VWAP and trend aligns.

### B. OBV Divergence
Logic: Price makes Lower Low but On-Balance Volume makes Higher Low (Accumulation).
