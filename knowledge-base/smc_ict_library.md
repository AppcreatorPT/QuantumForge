# Smart Money Concepts (SMC) & ICT Library
**Version:** 2.0 (Pine Script v6)
**Tags:** #SMC #ICT #OrderBlock #FVG #Liquidity

This module provides the core logic for detecting "Smart Money" footprints in Pine Script v6.

## 1. Fair Value Gaps (FVG)
A Fair Value Gap is a three-candle pattern where the wicks of candle 1 and candle 3 do not overlap, leaving an imbalance in candle 2.

### Logic (Bullish FVG)
- Candle 1 High < Candle 3 Low
- The gap area is between Candle 1 High and Candle 3 Low.

### Pine Script v6 Implementation
```pinescript
// Detect Bullish FVG
float fvg_high = low[0]
float fvg_low = high[2]
bool is_bull_fvg = (low[0] > high[2]) and (close[1] > open[1])

// Detect Bearish FVG
float fvg_bear_high = low[2]
float fvg_bear_low = high[0]
bool is_bear_fvg = (high[0] < low[2]) and (close[1] < open[1])

// Visualizing
if is_bull_fvg
    box.new(bar_index[2], fvg_low, bar_index[0], fvg_high, bgcolor=color.new(color.green, 80), border_color=na)
```

## 2. Order Blocks (OB)
An Order Block is typically the last down-candle before a strong impulsive up-move (Bullish OB) that breaks market structure.

### Logic (Bullish OB)
1. Identify a Swing Low.
2. The last Bearish Candle before the sequence of Bullish Candles that broke a prior Swing High.
3. The body of the OB should be tested (mitigated) later.

### Pine Script v6 Implementation
```pinescript
// Simple Order Block Detection
var box[] ob_boxes = array.new_box()

if ta.crossover(close, ta.highest(high, 5)[1]) // Impulse Move
    // Look back for the last red candle
    int ob_index = 0
    for i = 1 to 5
        if close[i] < open[i]
            ob_index := i
            break
            
    if ob_index > 0
        box.new(bar_index[ob_index], high[ob_index], bar_index, low[ob_index], bgcolor=color.new(color.blue, 70))
```

## 3. Market Structure Shift (MSS) / Change of Character (ChoCh)
A reversal signal where price fails to make a Lower Low (in a downtrend) and instead breaks the previous Lower High.

### Logic
- **Uptrend:** Price makes Higher Highs (HH) and Higher Lows (HL).
- **MSS (Bearish):** Price breaks below the last HL.

```pinescript
int length = 5
float h_high = ta.highest(high, length)
float l_low = ta.lowest(low, length)

var float last_hl = na
if high > h_high[1] // New High
    last_hl := low[1] // The low that created this high

bool mss_bearish = ta.crossunder(close, last_hl)
plotshape(mss_bearish, "MSS", shape.labeldown, location.abovebar, color.red, text="MSS")
```

## 4. Liquidity Grabs (Turtle Soups)
Price sweeps a major swing high/low by a few ticks to trigger stops, then reverses vigorously.

### Logic
- Price `low` goes below `low[x]` but `close` finishes above `low[x]`.
- This indicates "Stop Hunting".

```pinescript
int liq_len = 20
float swing_low = ta.lowest(low, liq_len)[1]
bool sweep = low < swing_low and close > swing_low
plotshape(sweep, "Liquidity Grab", shape.diamond, location.belowbar, color.yellow)
```

## 5. Premium vs Discount Arrays
Buying in Discount (below 50% of the dealing range) and Selling in Premium (above 50%).

```pinescript
// Defined by recent Swing High and Swing Low
float range_high = ta.highest(high, 50)
float range_low = ta.lowest(low, 50)
float equilibrium = (range_high + range_low) / 2

bool in_premium = close > equilibrium
bool in_discount = close < equilibrium
```
