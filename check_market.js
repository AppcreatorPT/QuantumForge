// Native fetch

async function test() {
    try {
        console.log("Testing connection to Cortex Market Module...");
        const response = await fetch('http://127.0.0.1:8000/market_scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol: "BTC/USDT" })
        });
        const data = await response.json();
        console.log("SUCCESS:", data);
    } catch (error) {
        console.error("FAILURE:", error);
    }
}

test();
