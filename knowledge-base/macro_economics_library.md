# Macro Economics & Correlation Library
**Version:** 2.0 (Pine Script v6)
**Tags:** #Macro #DXY #VIX #RiskManagement

This module enables the AI to build "Context-Aware" strategies that filter trades based on global market conditions.

## 1. The Dollar Index (DXY) Filter
**Theory:** When the US Dollar gets stronger (DXY Up), Assets (Crypto/Stocks) usually go down.
**Logic:** Only buy Crypto if DXY is in a downtrend.

```pinescript
// Fetch DXY Data
string dxy_ticker = "TVC:DXY"
float dxy_close = request.security(dxy_ticker, timeframe.period, close)
float dxy_ema = request.security(dxy_ticker, timeframe.period, ta.ema(close, 200))

// Filter: Risk On if Dollar is Weak
bool dollar_weak = dxy_close < dxy_ema
```

## 2. VIX Volatility Regime (Risk Off)
**Theory:** High VIX (> 20 or 30) means fear. Algos de-risk.
**Logic:** Tighten stops or stop trading if VIX is spiking.

```pinescript
string vix_ticker = "CBOE:VIX"
float vix = request.security(vix_ticker, timeframe.period, close)

bool high_volatility_regime = vix > 25.0
bool extreme_fear = vix > 35.0
```

## 3. Bond Yields (US10Y)
**Theory:** Rising yields hurt Growth Stocks and Crypto.
**Logic:** Check US10Y Trend.

```pinescript
string bond_ticker = "TVC:US10Y"
float us10y = request.security(bond_ticker, timeframe.period, close)
```

## 4. Correlation Coefficient
**Theory:** Check if the asset is currently moving WITH or AGAINST the SPX500.

```pinescript
string benchmark = "SP:SPX"
float bench_close = request.security(benchmark, timeframe.period, close)
float corr = ta.correlation(close, bench_close, 20)

// Signals
bool decoupling = corr < 0.2 // Asset doing its own thing
bool highly_correlated = corr > 0.8
```

## 5. Risk On / Risk Off Composite
A merged signal to define the global regime.

```pinescript
bool risk_on = (dxy_close < dxy_ema) and (vix < 20.0)
bgcolor(risk_on ? color.new(color.green, 90) : na, title="Risk On Background")
```
