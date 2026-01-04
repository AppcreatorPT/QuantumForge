# UI Mastery Library (Interface Engineering)

This file contains "God Mode" patterns for Pine Script UI.
**Problem:** Users confuse Chart Positioning (bar_index) with Screen Positioning (position.top_right).
**Solution:** Use these snippet templates strictly.

## 1. Professional Dashboard (Fixed Position)
**Use:** For stats, win rates, or status panels. NEVER use labels for this.
```pinescript
// --- DASHBOARD SETUP ---
// 1. Define Position Input
string dashPos = input.string("Top Right", "Position", options=["Top Right", "Bottom Right", "Bottom Left"], group="UI")

// 2. Map String to Pine Constant
var string pos = dashPos == "Top Right" ? position.top_right : dashPos == "Bottom Right" ? position.bottom_right : position.bottom_left

// 3. Create Table (Once)
var table dash = table.new(pos, 2, 4, bgcolor=color.new(color.black, 40), border_width=1, border_color=color.gray)

// 4. Populate (On Last Bar Only to save performance)
if barstate.islast
    table.cell(dash, 0, 0, "Strategy", text_color=color.white, text_size=size.small)
    table.cell(dash, 1, 0, "Active", text_color=color.green, text_size=size.small)
    
    table.cell(dash, 0, 1, "Win Rate", text_color=color.white)
    table.cell(dash, 1, 1, str.tostring(strategy.wintrades / strategy.closedtrades * 100, "#.##") + "%", text_color=color.yellow)
```

## 2. Watermark (Static Screen Text)
**Use:** Branding that stays in the corner.
```pinescript
// --- WATERMARK ---
// Tip: Use a table with 1 cell for a perfect static watermark.
var table watermark = table.new(position.bottom_right, 1, 1)
if barstate.islast
    table.cell(watermark, 0, 0, "QuantForge AI", text_color=color.new(color.white, 80), text_size=size.huge)
```

## 3. Dynamic Labels (Floating near Price)
**Use:** For "Buy" signals or "Stop Loss" levels on the chart.
**Key:** `yloc.price` or `yloc.abovebar`.
```pinescript
// --- SIGNAL LABEL ---
if longCondition
    // Style: label.style_label_up means the point is below the text (good for Buy signals below bar)
    label.new(bar_index, low, text="BUY", yloc=yloc.belowbar, color=color.green, style=label.style_label_up, textcolor=color.white)

// --- PRICE LEVEL LABEL ---
// Style: label.style_none just shows text
label.new(bar_index + 5, close, text="Price: " + str.tostring(close), color=color.new(color.white, 100), style=label.style_none, textcolor=color.white)
```

## 4. Input Groups (Clean Settings)
**Use:** Organize inputs so the user isn't overwhelmed.
```pinescript
// --- GROUPS ---
// group="Main Settings", group="Risk Management", group="UI / Visuals"
int  len    = input.int(14, "Length", group="Main Settings")
bool show   = input.bool(true, "Show Labels?", group="UI / Visuals")
color col   = input.color(color.blue, "Line Color", group="UI / Visuals")
```
