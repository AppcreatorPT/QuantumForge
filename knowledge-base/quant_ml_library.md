# Quantitative Machine Learning (Pine Script)
**Version:** 2.0 (Pine Script v6)
**Tags:** #MachineLearning #KNN #KernelRegression #Quant

This module provides mathematical frameworks for implementing ML algorithms directly in Pine Script.

## 1. K-Nearest Neighbors (KNN)
KNN classifies the current market state based on similarity to historical states (Feature Vectors).

### Logic
1. Define **Features** (e.g., RSI, Volatility, Volume).
2. Calculate Eucledian Distance between Current Features and Historical Features (previous bars).
3. Select the `k` nearest historical bars.
4. Predict direction based on what happened *after* those historical bars.

### Pine Script v6 Snippet (KNN Core)
```pinescript
// Calculate Distance
math.dist(float f1, float f2) =>
    math.sqrt(math.pow(f1 - f2, 2))

// Feature Vectors
float f_rsi = ta.rsi(close, 14)
float f_vol = ta.atr(14)

// Loop through history (simplified)
// Real implementation requires arrays to store training data
int k_neighbors = 5
float[] distances = array.new_float(0)
// ... logic to populate distances ...
```

## 2. Kernel Regression (Nadaraya-Watson Estimator)
A non-parametric way to estimate the underlying trend by smoothing price with a kernel function (usually Gaussian).

### Logic
- **Window**: Lookback period (bandwidth).
- **Weighting**: Recent prices and prices close to the "center" of the distribution get higher weights.

### Pine Script v6 Snippet (Rational Quadratic Kernel)
```pinescript
float h = 8.0 // Bandwidth
float r = 8.0 // Relative Weight
int src_idx = 0
float y_hat = 0.0
float w_sum = 0.0

for i = 0 to 50
    float w = math.pow(1 + (math.pow(i, 2) / (2 * math.pow(h, 2) * r)), -r)
    y_hat += close[i] * w
    w_sum += w

float kernel_smooth = y_hat / w_sum
plot(kernel_smooth, "Nadaraya-Watson", color=color.orange, linewidth=2)
```

## 3. Lorentzian Distance (Classification)
Used in the famous "Lorentzian Classification" indicator. It's distinct from Eucledian distance as it handles outliers differently in high-dimensional space.

### Formula
$d(x, y) = \sum \ln(1 + |x_i - y_i|)$

### Pine Script Implementation
```pinescript
// Lorentzian Distance Function
f_lorentzian(float s1, float s2) =>
    math.log(1 + math.abs(s1 - s2))

// Aggregating distances across multiple features
float dist = f_lorentzian(f_rsi, f_rsi[10]) + f_lorentzian(f_adx, f_adx[10])
```

## 4. Normalization (Min-Max)
Crucial for ML. All inputs (features) must be scaled to the same range (usually 0-1) to avoid one large indicator dominating the distance calculation.

```pinescript
f_normalize(float src, int len) =>
    float mn = ta.lowest(src, len)
    float mx = ta.highest(src, len)
    (src - mn) / (mx - mn)
```
