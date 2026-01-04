# Pine Script v6 Reference Manual (The Bible)

**Version:** 6.0
**Status:** Primary Source of Truth.
**Directive:** Use this for all syntax, logic, and structural decisions.

---

## PART 1: CORE LANGUAGE & EXECUTION

### 1.1 Execution Model
*   **Historical Bars:** Script calculates on Close of every historical bar.
*   **Real-time Bars:** Script calculates on every *tick* (price update).
*   **`barstate`:**
    *   `barstate.islast`: True if this is the last bar (historical or real-time).
    *   `barstate.isconfirmed`: True if the bar has closed. CRITICAL for avoiding repaint in alerts.
    *   `barstate.isnew`: True on the first tick of a new bar.

### 1.2 Type System & Variables
*   **Types:** `int`, `float`, `bool`, `color`, `string`, `line`, `label`, `box`, `table`, `array`, `map`.
*   **Declaration:**
    *   `t = time` (Series variable, updates every bar).
    *   `var int count = 0` (Initialized ONCE, persists across bars).
    *   `varip int tick_count = 0` (Persists across TICKS, resets on restart).
*   **Casting:** Explicit casting required. `float(10)` or `10.0`.

---

## PART 2: ADVANCED DATA STRUCTURES

### 2.1 Arrays (Dynamic Lists)
*   **Syntax:** `a = array.new_float(0)`
*   **Operations:**
    *   `array.push(a, value)`: Add to end.
    *   `array.get(a, index)`: Read value.
    *   `array.size(a)`: Length.
*   **Use Case:** Tracking last N RSI peaks, storing Pivot levels.
*   **Example:**
    ```pinescript
    var array<float> highs = array.new_float(0)
    if high > high[1]
        array.push(highs, high)
        if array.size(highs) > 10
            array.shift(highs) // Remove oldest
    ```

### 2.2 Maps (Key-Value Pairs) — *Game Changer*
*   **Syntax:** `m = map.new<string, float>()`
*   **Operations:**
    *   `map.put(m, "AAPL", 150.0)`
    *   `map.get(m, "AAPL")`
*   **Use Case:** Storing state per symbol in a scanner, or counting pattern occurrences.

### 2.3 Matrices (Grid Data)
*   **Syntax:** `matrix.new<float>(rows, cols, initial_val)`
*   **Use Case:** Correlation tables, heatmaps, complex coordinate math.

---

## PART 3: TECHNICAL ANALYSIS (TA)

### 3.1 Moving Averages
*   `ta.sma(source, len)`: Simple (No lag correction).
*   `ta.ema(source, len)`: Exponential (Recent price weight).
*   `ta.rma(source, len)`: Running (Used in RSI/ATR).
*   `ta.vwma(source, len)`: Volume Weighted.
*   `ta.alma(source, len, offset, sigma)`: Arnaud Legoux (Smooth & Low Lag).

### 3.2 Oscillators & Volatility
*   `ta.rsi(source, len)`: Returns 0-100.
*   `ta.atr(len)`: Volatility in Price units.
*   `ta.crossover(s1, s2)`: True if s1 crosses OVER s2.
*   `ta.crossunder(s1, s2)`: True if s1 crosses UNDER s2.

---


### 3.3 Missing Built-ins (Helper Functions)
*   **ADX (Manual Check):** `ta.adx` DOES NOT EXIST. Use `ta.dmi()` or this snippet:
    ```pinescript
    [diplus, diminus, adxVal] = ta.dmi(14, 14)
    ```
*   **Supertrend Warning:** `ta.supertrend(factor, len)` requires `float` factor and `int` len.
    *   *Safe Usage:* `ta.supertrend(3.0, int(lenInput))`

---

## PART 4: VISUALS & UI (THE PROTOCOL)

### 4.1 Coordinate Systems (CRITICAL)
*   **Chart Space:** (`bar_index`, `price`). Moves with chart. Use `plot`, `label`, `box`, `line`.
*   **Screen Space:** (`position.*`). Fixed to glass. Use `table` ONLY.

### 4.2 Tables (Dashboards)
**RULE:** ALL Dashboards must be Tables.
```pinescript
var table dash = table.new(position.top_right, 2, 2, bgcolor=color.black)
if barstate.islast
    table.cell(dash, 0, 0, "Metric", text_color=color.white)
    table.cell(dash, 1, 0, "Value", text_color=color.green)
```

### 4.3 Labels (Annotations)
**RULE:** Use for marking specific candles.
```pinescript
label.new(bar_index, high, "H", yloc=yloc.abovebar, style=label.style_label_down)
```

### 4.4 Colors
*   **Gradient:** `color.from_gradient(value, min, max, color.red, color.green)`.
*   **Transparency:** `color.new(color.red, 50)` (50% transp).

---

## PART 5: STRATEGY & RISK

### 5.1 Order Entry
*   `strategy.entry("Long", strategy.long, qty=1, limit=price)`
*   `strategy.entry("Short", strategy.short)`

### 5.2 Order Exit
*   **Simple:** `strategy.close("Long")` (Market exit).
*   **TP/SL:** `strategy.exit("Exit Long", "Long", stop=sl_price, limit=tp_price)`
*   **Trailing:** `strategy.exit(..., trail_points=100, trail_offset=10)`

### 5.3 Risk Management Inputs (Standard)
```pinescript
float riskPerTrade = input.float(1.0, "Risk %", group="Risk")
float slPoints     = input.float(50.0, "Stop Loss Points", group="Risk")
```

---

## PART 6: REQUEST & MULTI-TIMEFRAME

### 6.1 Security (Data from other TF/Symbol)
*   **Function:** `request.security(symbol, timeframe, expression)`
*   **Repainting Prevention:** ALWAYS use `barmerge.lookahead_on` with CAUTION, usually `lookahead_off` for live signals.
*   **Gaps:** `barmerge.gaps_on` uses `na` for missing data (safer).
    ```pinescript
    float dailyClose = request.security(syminfo.tickerid, "D", close, lookahead=barmerge.lookahead_off)
    ```

### 6.2 Dynamic Tickers (v6 Feature)
*   You can now calculate the ticker string dynamically:
    ```pinescript
    string t = "NASDAQ:" + "AAPL"
    float c = request.security(t, "D", close)
    ```

---

## PART 7: SYNTAX DICTIONARY (ANTI-ERROR)

*   ❌ `label.style_labeldown` -> ✅ `label.style_label_down`
*   ❌ `label.style_none` (0) -> ✅ `label.style_none`
*   ❌ `security()` -> ✅ `request.security()`
*   ❌ `study()` -> ✅ `indicator()`
*   ❌ `ta.adx()` -> ✅ `ta.dmi()` (returns [di+, di-, adx])
