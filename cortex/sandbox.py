from backtesting import Backtest, Strategy
from backtesting.lib import crossover
import pandas_ta as ta
from market_data import fetch_candles
import traceback

class DynamicStrategy(Strategy):
    # These will be dynamically set or used by the injected logic
    n1 = 10
    n2 = 20

    def init(self):
        # Default Indicators (Can be overridden by logic if complex)
        # We pre-calculate common ones for safety
        self.sma1 = self.I(ta.sma, self.data.Close, self.n1)
        self.sma2 = self.I(ta.sma, self.data.Close, self.n2)
        self.rsi = self.I(ta.rsi, self.data.Close, 14)

    def next(self):
        # This method is replaced dynamically by run_simulation
        pass

def run_simulation(symbol, logic_code, timeframe='1h'):
    """
    Runs a backtest on the given symbol using the injected logic_code.
    """
    print(f"SANDBOX: Starting Simulation for {symbol}...")
    
    # 1. Fetch Data
    df = fetch_candles(symbol, timeframe, limit=500)
    if df.empty:
        return {"status": "error", "message": "No Data Found"}

    # 2. Define Custom Strategy Class with User Logic
    # We subclass Strategy locally to avoid state pollution
    class UserStrategy(Strategy):
        def init(self):
            # STANDARD TOOLBELT (Pre-Calculated for AI Logic)
            # 1. Moving Averages
            self.sma_fast = self.I(ta.sma, pd.Series(self.data.Close), 14)
            self.sma_slow = self.I(ta.sma, pd.Series(self.data.Close), 28)
            self.ema_fast = self.I(ta.ema, pd.Series(self.data.Close), 9)
            self.ema_slow = self.I(ta.ema, pd.Series(self.data.Close), 21)

            # 2. Momentum
            self.rsi = self.I(ta.rsi, pd.Series(self.data.Close), 14)
            
            # 3. Volatility (Bollinger Bands)
            # Note: pandas_ta returns a DataFrame for BBANDS, we need to extract columns carefully
            # For simplicity in Backtesting.py, we wrap a helper or use discrete calls if needed
            # Here we assume a simple TA-Lib wrapper or we construct manually for safety
            self.bb_upper = self.I(lambda x: ta.bbands(pd.Series(x), length=20, std=2)['BBU_20_2.0'], self.data.Close)
            self.bb_lower = self.I(lambda x: ta.bbands(pd.Series(x), length=20, std=2)['BBL_20_2.0'], self.data.Close)

            # 4. Trend (MACD)
            self.macd = self.I(lambda x: ta.macd(pd.Series(x), fast=12, slow=26, signal=9)['MACD_12_26_9'], self.data.Close)
            self.macd_signal = self.I(lambda x: ta.macd(pd.Series(x), fast=12, slow=26, signal=9)['MACDs_12_26_9'], self.data.Close)

            # 5. ATR
            self.atr = self.I(ta.atr, pd.Series(self.data.High), pd.Series(self.data.Low), pd.Series(self.data.Close), 14)
            
        def next(self):
            # INJECTED LOGIC EXECUTION
            # The logic_code string is expected to be a valid python block 
            # that operates on 'self' (e.g. if self.rsi > 70: self.sell())
            try:
                exec(logic_code, {'self': self, 'crossover': crossover})
            except Exception as e:
                pass # Runtime error in logic (skip candle)

    # 3. Validation Safety Check
    if "import" in logic_code or "os." in logic_code:
        return {"status": "error", "message": "Unsafe Code Detected"}

    try:
        # 4. Run Backtest
        # Increased cash to 1M to allow trading high-priced assets like BTC
        bt = Backtest(df, UserStrategy, cash=1_000_000, commission=.002)
        stats = bt.run()
        
        # 5. Extract Metrics & Sanitize NaNs
        def clean(val):
            import math
            if isinstance(val, (int, float)) and (math.isnan(val) or math.isinf(val)):
                return 0
            return val

        result = {
            "status": "success",
            "symbol": symbol,
            "return_pct": clean(round(stats['Return [%]'], 2)),
            "win_rate": clean(round(stats['Win Rate [%]'], 2)),
            "trades": clean(stats['# Trades']),
            "sharpe": clean(round(stats['Sharpe Ratio'], 2)),
            "profit_factor": clean(round(stats['Profit Factor'], 2))
        }
        print(f"Backtest Successful: {result}")
        return result

    except Exception as e:
        print(f"Sandbox Crash: {e}")
        traceback.print_exc()
        return {"status": "error", "message": str(e)}

import pandas as pd # Needed for init self.I calls inside UserStrategy
