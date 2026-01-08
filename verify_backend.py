import requests
import json

url = "http://localhost:3000/chat"
payload = {"message": "Analisa @BTC"}
headers = {"Content-Type": "application/json"}

try:
    print("Testing Backend...")
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Status 200 OK")
        
        if "data" in data and "analysis" in data["data"]:
            print("✅ JSON Structure Valid (Phase 2)")
            print(f"Analysis Preview: {data['data']['analysis'][:50]}...")
        else:
            print("⚠️ Legacy Response Only (or Parse Failed)")
            print(f"Keys received: {data.keys()}")
            
        print("Response received successfully.")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"❌ Exception: {e}")
