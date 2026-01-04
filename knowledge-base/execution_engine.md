# Execution Engine (Automation & Webhooks)

This library governs how QuantForge strategies communicate with the outside world (3Commas, Binance, WunderTrading).
**RULE:** If user asks for "Automation", "Alerts", or "Bot", YOU MUST USE THIS.

## 1. Universal Webhook JSON
**Use:** The industry standard message format for alerts.
```pinescript
// --- ALERT MESSAGE TEMPLATE ---
// Place this inside strategy.entry or strategy.exit 'alert_message' parameter
string alertMsg = '{"ticker": "' + syminfo.ticker + '", "action": "{{strategy.order.action}}", "price": {{close}}, "size": {{strategy.order.contracts}}}'

// Example Entry
if longCondition
    strategy.entry("Long", strategy.long, alert_message=alertMsg)
```

## 2. 3Commas Bot Trigger
**Use:** Triggering a specific DCA bot deal.
```pinescript
// --- 3COMMAS TRIGGER ---
// Requires: message_token, bot_id, email_token in the JSON
string startLong = '{"message_type": "bot", "bot_id": 12345, "email_token": "xyz", "delay_seconds": 0, "pair": "' + syminfo.tickerid + '"}'
string closeLong = '{"message_type": "bot", "bot_id": 12345, "email_token": "xyz", "action": "close_at_market_price"}'

if longCondition
    strategy.entry("Long", strategy.long, alert_message=startLong)
if closeCondition
    strategy.close("Long", alert_message=closeLong)
```

## 3. Tick-Precision Backtesting (The "Magnifier")
**Use:** Simulating realistic fills inside a candle (prevents "Lookahead Bias").
**WARNING:** Slows down calculation. Use only for final verification.
```pinescript
strategy("Quantitative Strategy", overlay=true, 
         calc_on_every_tick=true, 
         process_orders_on_close=true, // Forces analysis of the close price before plotting
         initial_capital=10000)
```

## 4. Dynamic Position Sizing (Risk Based)
**Use:** Calculate lot size based on Stop Loss distance.
```pinescript
// --- DYNAMIC SIZING ---
float riskPerTradeUSD = 100.0 // Risk $100 per trade
float slDistance = math.abs(close - slPrice)
float dynamicQty = riskPerTradeUSD / slDistance

if longCondition
    strategy.entry("Long", strategy.long, qty=dynamicQty)
```
