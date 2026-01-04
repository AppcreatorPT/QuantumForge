import pandas as pd
import ccxt
import yfinance as yf
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("market_data")

def get_market_snapshot(symbol: str):
    # ... (Keep existing get_market_snapshot logic) ...
    symbol = symbol.upper().strip()
    
    # 1. CRYPTO DETECTION
    major_cryptos = ["BTC", "ETH", "SOL", "XRP", "BNB", "ADA", "DOGE", "AVAX", "LINK", "LTC"]
    
    if "/" in symbol or "-PERP" in symbol or symbol in major_cryptos:
        if symbol in major_cryptos:
            symbol = f"{symbol}/USDT"
        return get_crypto_data(symbol)
    
    return get_traditional_data(symbol)

def fetch_candles(symbol: str, timeframe: str = '1h', limit: int = 500):
    """
    Fetches historical OHLCV candles for Backtesting.
    Returns a Pandas DataFrame formatted for 'backtesting.py'.
    """
    symbol = symbol.upper().strip()
    if "/" not in symbol: 
        symbol += "/USDT" # Default to USDT for simplicity in Sandbox 1.0
    
    try:
        exchange = ccxt.binance()
        # Fetch OHLCV
        ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
        
        # Convert to DataFrame
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'Open', 'High', 'Low', 'Close', 'Volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df.set_index('timestamp', inplace=True)
        
        return df
    except Exception as e:
        logger.error(f"Candle Fetch Error: {e}")
        return pd.DataFrame() # Empty on error

def get_crypto_data(symbol):
    # ... (Keep existing get_crypto_data logic) ...
    try:
        exchange = ccxt.binance()
        ticker = exchange.fetch_ticker(symbol)
        
        # Funding Rate (if Perps)
        funding_str = ""
        try:
             if "USDT" in symbol: 
                funding = exchange.fetch_funding_rate(symbol)
                funding_str = f"Funding Rate: {funding['fundingRate']:.6f} ({funding['fundingRate'] * 100 * 3:.4f}% daily)"
        except:
            pass 

        summary = f"""
        LIVE CRYPTO DATA ({symbol}) via Binance:
        - Price: {ticker['last']}
        - 24h Change: {ticker['percentage']}%
        - 24h Volume: {ticker['quoteVolume']}
        - High/Low: {ticker['high']} / {ticker['low']}
        {funding_str}
        """
        return summary
    except Exception as e:
        logger.error(f"CCXT Error: {e}")
        return f"Could not fetch crypto data for {symbol}. Error: {str(e)}"

import os
import requests

def get_traditional_data(symbol):
    # 1. Try Alpha Vantage (Reliable, if Key provided)
    av_key = os.getenv("ALPHAVANTAGE_API_KEY")
    if av_key:
        try:
            url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={av_key}"
            response = requests.get(url)
            data = response.json()
            quote = data.get("Global Quote", {})
            
            if quote and quote.get("05. price"):
                return f"""
        LIVE MARKET DATA ({symbol}) via AlphaVantage:
        - Price: {quote.get('05. price')} USD
        - Change: {quote.get('09. change')}
        - Change %: {quote.get('10. change percent')}
        - Volume: {quote.get('06. volume')}
        """
        except Exception as e:
            logger.error(f"AlphaVantage Error: {e}")

    # 2. Fallback to Yahoo Finance (Free, "Best Effort")
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        price = info.get('currentPrice') or info.get('regularMarketPrice')
        currency = info.get('currency', 'USD')
        name = info.get('shortName', symbol)
        
        if price is None:
             return f"Warning: Market Data for {symbol} unavailable (Yahoo rate limit or invalid ticker)."

        summary = f"""
        LIVE MARKET DATA ({name}) via Yahoo:
        - Price: {price} {currency}
        - Sector: {info.get('sector', 'N/A')}
        - PE Ratio: {info.get('trailingPE', 'N/A')}
        - 52w High: {info.get('fiftyTwoWeekHigh', 'N/A')}
        """
        return summary
    except Exception as e:
        logger.error(f"YFinance Error: {e}")
        return f"Could not fetch market data for {symbol}. Error: {str(e)}"
