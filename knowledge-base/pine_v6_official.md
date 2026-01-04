# Pine Script® v6 Official Reference
**Version:** 6.0 (November 2024)
**Source:** Official TradingView Documentation (Scraped Dec 2025)

## 1. Top New Features (The "Game Changers")

### 1.1 Dynamic Requests (`request.*`)
In v6, you can finally use **series strings** for tickers within `request.security()`, `request.earnings()`, etc.
*   **Old (v5):** Ticker had to be a "simple string" (known at compile time).
*   **New (v6):** Ticker can change per bar.
*   **Scope Power:** You can now call `request` functions inside **loops**, **if-blocks**, and **library functions**.

```pinescript
// v6 Example: Dynamic Request inside a loop
tickerList = array.from("AAPL", "MSFT", "TSLA")
for t in tickerList
    float c = request.security(t, "D", close)
```

### 1.2 Text Formatting & Typography
*   **Typography:** Sizes for labels/boxes can now be **integers** (points) instead of just constants. `size=12` is valid.
*   **Format:** New constants `text.format_bold`, `text.format_italic`.

```pinescript
label.new(bar_index, high, "Bold Text", text_formatting = text.format_bold)
```

### 1.3 Strategy Improvements
*   **Trimming:** When a strategy hits the 9000 orders limit, it **auto-trims** old orders instead of crashing.
*   **Margin:** Default `margin_long` and `margin_short` is now **100%** (was 0).

---

## 2. Breaking Changes (Migration Guide)

### 2.1 The "Strict Boolean" Rule
*   **Rule:** `bool` can ONLY be `true` or `false`. It can NEVER be `na`.
*   **Impact:** `na(myBool)` will throw a compilation error.
*   **Fix:** Initialize booleans explicitly: `bool myFilter = false` (not `na`).

### 2.2 Short-Circuit Operators
*   `and` / `or` are now lazy.
*   If `A` is false in `A and B`, `B` is **not evaluated**.
    *   *Warning:* If `B` had a side effect (like `label.new`), it won't happen!

### 2.3 Strict Types
*   No implicit casting from `float` to `int` in many places. Use `int()` cast.
*   Negative array indexing is now supported: `array.get(a, -1)` gets the last element.

---

## 3. Best Practices v6

### 3.1 Context Awareness
New built-ins to keep track of the main chart context even inside request calls:
*   `syminfo.main_tickerid`
*   `timeframe.main_period`

### 3.2 Array Manipulation
Use negative indices for cleaner code:
*   Old: `array.get(id, array.size(id) - 1)`
*   New: `array.get(id, -1)`
