const fetch = require('node-fetch');

async function testSandbox() {
    console.log("🧪 Testing Cortex Sandbox Connection...");

    // Simple Golden Cross Logic
    const logicCode = `
if len(self.data.Close) > 20:
    # SMA 10 vs SMA 20
    sma1 = self.data.Close[-20:].mean() # Simple proxy
    price = self.data.Close[-1]
    
    if price > sma1 and not self.position:
        self.buy()
    elif price < sma1 and self.position:
        self.position.close()
    `;

    try {
        const response = await fetch('http://localhost:8000/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                symbol: 'BTC/USDT',
                logic_code: logicCode,
                timeframe: '1h'
            })
        });

        if (!response.ok) {
            console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response Body:", text);
            return;
        }

        const data = await response.json();
        console.log("✅ Cortex Response:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("❌ Connection Failed:", error.message);
        console.log("Make sure 'py cortex/main.py' is running on port 8000!");
    }
}

testSandbox();
