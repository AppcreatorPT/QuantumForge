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
            # Pre-calc common indicators using pandas_ta wrapper for Backtesting.py
            # Note: Backtesting.py requires indicators to be wrapped in self.I
            self.rsi = self.I(ta.rsi, pd.Series(self.data.Close), 14)
            self.sma_fast = self.I(ta.sma, pd.Series(self.data.Close), 14)
            self.sma_slow = self.I(ta.sma, pd.Series(self.data.Close), 28)
            
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
