import requests
import json

url = "http://localhost:3000/simulate"
payload = {
    "symbol": "BTC/USDT",
    "timeframe": "1h",
    "code": """def next(self):
    # Buy if RSI < 30 (Simple Test Strategy)
    if self.data.Close[-1] > self.data.Open[-1]: 
        self.buy()
    elif self.data.Close[-1] < self.data.Open[-1]:
        self.sell()
"""
}
headers = {"Content-Type": "application/json"}

try:
    print("🚀 Testing Simulation Endpoint...")
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Status 200 OK")
        print(f"Stats: {data}")
        
        if "win_rate" in data:
             print("✅ Simulation Success! Result received.")
        else:
             print("⚠️ Data missing expected keys.")
             
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"❌ Exception: {e}")
