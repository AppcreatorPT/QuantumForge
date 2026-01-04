//@version=6
indicator("The Hydra v6 [TradeOS]", overlay=true)

// =============================================================================
// 1. CONFIGURATION (Dynamic Inputs)
// =============================================================================
string tickerListStr = input.text_area("BTCUSD, ETHUSD, SOLUSD, AAPL, TSLA", "Assets (Comma Separated)", group="Hydra Core")
int mapLookback      = input.int(200, "Trend Lookback (SMA)", group="Hydra Core")

// =============================================================================
// 2. V6 DYNAMIC PROCESSING
// =============================================================================
// Feature: Using str.split to create an array of tickers from a single string
string[] tickers = str.split(tickerListStr, ",")

// Prepare Data Structure (Arrays to hold results)
// We use arrays because the number of tickers is dynamic (v6 power)
float[] prices    = array.new_float(0)
float[] trends    = array.new_float(0)
bool[]  isBullish = array.new_bool(0)

// LOOP: This was impossible to do cleanly in v5 with dynamic string inputs for security
for i = 0 to array.size(tickers) - 1
    string t = str.trim(array.get(tickers, i)) // Clean spaces
    
    // v6 FEATURE: Dynamic Ticker in request.security
    // In v5, 't' matching a dynamic series often caused compilation issues or required tuples
    // In v6, this is native and stable.
    [d_close, d_sma] = request.security(t, timeframe.period, [close, ta.sma(close, mapLookback)], ignore_invalid_symbol=true)
    
    array.push(prices, d_close)
    array.push(trends, d_sma)
    array.push(isBullish, d_close > d_sma)

// =============================================================================
// 3. V6 DASHBOARD (Strict Typography)
// =============================================================================
var table dash = table.new(position.top_right, 3, array.size(tickers) + 1, bgcolor=color.new(color.black, 20), border_width=1)

if barstate.islast
    // Header
    table.cell(dash, 0, 0, "Asset", text_color=color.white, text_formatting=text.format_bold)
    table.cell(dash, 1, 0, "Price", text_color=color.white, text_formatting=text.format_bold)
    table.cell(dash, 2, 0, "Trend", text_color=color.white, text_formatting=text.format_bold)

    // Rows
    for i = 0 to array.size(tickers) - 1
        string t = str.trim(array.get(tickers, i))
        float p  = array.get(prices, i)
        bool bull = array.get(isBullish, i)
        
        // v6 FEATURE: Integer Text Size (e.g., 12) + Text Formatting
        color statusColor = bull ? color.green : color.red
        string statusIcon = bull ? "🚀" : "🔻"
        
        table.cell(dash, 0, i + 1, t, text_color=color.white, text_size=12)
        table.cell(dash, 1, i + 1, str.tostring(p, "#.##"), text_color=color.gray, text_size=12)
        table.cell(dash, 2, i + 1, statusIcon, text_color=statusColor, text_formatting=text.format_bold, text_size=14)

// =============================================================================
// 4. MAIN CHART LOGIC (Context Aware)
// =============================================================================
// v6 Feature: syminfo.main_tickerid helps keep context if we were doing complex things
plot(ta.sma(close, mapLookback), "Main Trend", color=color.blue, linewidth=2)
