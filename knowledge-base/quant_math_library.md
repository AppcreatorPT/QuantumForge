# Quant Math Library (Advanced Statistics)

This library provides institutional-grade statistical functions not native to Pine Script.
**MANDATORY:** Use these for any request involving "Relative Strength", "Volatilty Filter", or "Normalization".

## 1. Z-Score (Standardization)
**Use:** Measuring how extreme a value is (in Standard Deviations) relative to its mean.
```pinescript
// --- Z-SCORE FUNCTION ---
z_score(src, len) =>
    float mean = ta.sma(src, len)
    float stdDev = ta.stdev(src, len)
    (src - mean) / stdDev

// Usage
float zVal = z_score(close, 20)
bool isExtreme = math.abs(zVal) > 2.0 // 2 Sigma Event
```

## 2. Min-Max Normalization (0-100 Scale)
**Use:** Forcing any indicator (Volume, ATR) into a 0-100 oscillator format.
```pinescript
// --- NORMALIZATION ---
normalize(src, len) =>
    float min = ta.lowest(src, len)
    float max = ta.highest(src, len)
    100 * (src - min) / (max - min)

// Usage: Normalize Volume
float normVol = normalize(volume, 50)
plot(normVol, "Normalized Volume", color.purple)
hline(80, "High Activity", color.red)
```

## 3. Percentile Rank
**Use:** Knowing where the current price sits relative to the last N bars (0% = Low of range, 100% = High).
```pinescript
// --- PERCENTILE RANK ---
percentile_rank(src, len) =>
    ta.percentrank(src, len)

// Usage
float rank = percentile_rank(close, 100)
// rank > 95 means we are at the top 5% of the last 100 candles (Breakout imminent?)
```

## 4. Ehlers Super Smoother (Filters)
**Use:** Removing noise without the lag of an SMA.
```pinescript
// --- EHLERS SUPER SMOOTHER ---
super_smoother(src, len) =>
    float a1 = math.exp(-1.414 * 3.14159 / len)
    float b1 = 2 * a1 * math.cos(1.414 * 180 / len)
    float c2 = b1
    float c3 = -a1 * a1
    float c1 = 1 - c2 - c3
    var float filt = src
    filt := c1 * (src + nz(src[1])) / 2 + c2 * nz(filt[1]) + c3 * nz(filt[2])
    filt
```
