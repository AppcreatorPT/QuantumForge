# Crypto Market Mechanics Library
**Version:** 2.0 (Pine Script v6)
**Tags:** #Crypto #Futures #Funding #OpenInterest

This module provides logic for trading Perpetual Futures, focusing on derivative data rather than just spot price.

## 1. Funding Rates
**Theory:** Funding fees maximize pain. Positive Funding = Longs pay Shorts (Expect Drop). Negative Funding = Shorts pay Longs (Expect Pump).
**Logic:** Contra-trade extreme funding.

```pinescript
// Fetch Aggregated Funding Rate (Binance/Bybit average usually needed, using Binance for proxy)
string funding_ticker = "BINANCE:BTCUSDT.P" // Example ticker, depends on data source
// Note: TV native support for aggregated funding is limited, often requires external indicator or specific ticker
// Using a placeholder variable for logic
float funding_rate = request.security("BINANCE:BTCUSDT_FUNDING", timeframe.period, close) 

bool crowded_longs = funding_rate > 0.01 // > 0.01% per 8h is high
bool crowded_shorts = funding_rate < -0.01 // Potential Short Squeeze
```

## 2. Open Interest (OI)
**Theory:** 
- Price UP + OI UP = Strong Trend.
- Price UP + OI DOWN = Short Covering (Weakness).

```pinescript
string oi_ticker = "BINANCE:BTCUSDT_OI" // Check symbol in TV
float oi = request.security(oi_ticker, timeframe.period, close)
float oi_ma = ta.sma(oi, 20)

bool trend_confirmed = close > close[1] and oi > oi_ma
bool measure_squeeze = close > close[1] and oi < oi[1] // Price up on dropping participation
```

## 3. Cumulative Volume Delta (CVD)
**Theory:** Divergence between Price and Delta (Aggressive Buyers/Sellers).
**Logic:** Price makes Lower Low, CVD makes Higher Low (Absorption).

```pinescript
// Requires specific data feed or calculation based on Up/Down Volume
float bull_vol = close > open ? volume : 0
float bear_vol = close < open ? volume : 0
// Approximate CVD
var float cvd = 0.0
cvd := cvd + (bull_vol - bear_vol)

plot(cvd, "Cumulative Volume Delta", color=color.yellow)
```

## 4. Liquidation Cascade Detection
**Theory:** Massive volume spike with very large wick = Forced Liquidations.

```pinescript
float body_size = math.abs(close - open)
float wick_size = (high - low) - body_size
bool liquidation_candle = wick_size > (body_size * 3) and volume > ta.sma(volume, 20) * 3
plotshape(liquidation_candle, "Liq Wick", shape.xcross)
```
