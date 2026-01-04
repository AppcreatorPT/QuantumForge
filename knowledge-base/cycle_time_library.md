# Time, Cycles & Session Library
**Version:** 2.0 (Pine Script v6)
**Tags:** #Time #Sessions #Fourier #Cycles

This module teaches the AI that "When" is as important as "What".

## 1. Session Ranges (ICT Killzones)
**Theory:** Markets move differently during Asia (Range), London (Trend/Reversal), and NY (Continuation/Reversal).

```pinescript
// Define Sessions (UTC-5 for NY)
string sess_asia = "1800-0000:1234567"
string sess_london = "0200-0500:1234567"
string sess_ny = "0700-1000:1234567"

bool in_asia = time(timeframe.period, sess_asia) > 0
bool in_london = time(timeframe.period, sess_london) > 0
bool in_ny = time(timeframe.period, sess_ny) > 0

bgcolor(in_london ? color.new(color.blue, 90) : na, title="London Killzone")
```

## 2. The "Judas Swing"
**Theory:** A false move at the opening of a session (usually London) to trap traders before the real move.
**Logic:** Price breaks Asian High, then reverses immediately.

```pinescript
// Capture Asian Range High/Low
var float asia_high = na
var float asia_low = na
if in_asia
    asia_high := math.max(nz(asia_high, high), high)
    asia_low := math.min(nz(asia_low, low), low)

// Detect Judas (London breaks Asia High then closes below)
bool judas_long_trap = in_london and high > asia_high and close < asia_high
```

## 3. Fourier Transform (Cycle Detection)
**Theory:** Prices oscillate in cycles. Fourier Transform extracts the dominant frequency.
**Note:** Simplified for Pine Script performance.

```pinescript
int N = 64 // Window size
float pi = 3.14159265359

// Calculate Goertzel Algorithm (Single Frequency Power) for a period P
f_power(src, P) =>
    float omega = (2 * pi) / P
    float cosine = math.cos(omega)
    float sine = math.sin(omega)
    float coeff = 2 * cosine
    float q1 = 0.0
    float q2 = 0.0
    for i = 0 to N-1
        float q0 = coeff * q1 - q2 + src[i]
        q2 := q1
        q1 := q0
    // Magnitude
    math.sqrt(q1*q1 + q2*q2 - q1*q2*coeff)

// Scan for cycles
float power_20 = f_power(close, 20)
float power_50 = f_power(close, 50)
// If Power 20 is max, dominant cycle is ~20 bars.
```

## 4. Seasonality (Day of Week)
**Theory:** "Turnaround Tuesday", "Crypto Weekend Pump".

```pinescript
int dow = dayofweek
bool is_monday = dow == dayofweek.monday
bool is_friday = dow == dayofweek.friday

// Filter: Don't open new trades on Friday after 12 PM
bool no_trade_zone = is_friday and hour >= 12
```
