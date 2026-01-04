// MOCKING THE SCOUT LOGIC
const getLiveMarketData = async (userMessage) => {
    console.log("--- TEST START: Input = '" + userMessage + "' ---");

    const tickerRegex = /\b[a-zA-Z]{2,6}(?:\/[a-zA-Z]{2,6})?\b/g;
    const commonWords = [
        "AND", "FOR", "THE", "WITH", "USE", "ADD", "NOT", "BUY", "SELL", "NOW", "HOW", "WHAT", "WHY", "WHO", "CAN", "GET", "SET", "YES", "BOT", "API", "APP", // English
        "FAZ", "COM", "SEM", "PARA", "POR", "VAI", "TEM", "UMA", "DAS", "DOS", "NOS", "SER", "VER", "TER", "UM", "DE", "DA", "DO", "OS", "AS", "AO", "NA", "NO", "EM", "QUE", "SE", "SOU", "EU", "TU", "ELE", "ELA", // Portuguese
        "SCRIPT", "CODE", "DATA", "LIVE", "TEST", "DEMO", "LOGIC", "INPUT", "OUTPUT", "PLOT", "COLOR", "TITLE", "OVERLAY", // Code terms
        "EMA", "SMA", "RSI", "MACD", "ATR", "ADX", "DMI", "OBV", "VWAP", "BB", "KC", "STOCH", "CCI", "MFI", "ROC", "TRIX", "SAR", "PVT", "SOS", "CHOC", "BOS", "FVG", "ORDER", "BLOCK", "LIQUIDITY" // Technical Analysis
    ];

    const matches = userMessage.toUpperCase().match(tickerRegex);
    if (!matches) {
        console.log("❌ Market Scout: No ticker candidates found in message.");
        return "";
    }
    console.log("Raw Matches:", matches);

    const candidates = matches.filter(w => !commonWords.includes(w));
    if (candidates.length === 0) {
        console.log("❌ Market Scout: All matches were common words.");
        return "";
    }

    // Pick top candidate (first one)
    const symbol = candidates[0];
    console.log(`🔎 Market Scout detected ticker: ${symbol}`);

    // MOCK FETCH
    if (symbol === "BTC") {
        console.log("✅ Market Scout Data Injection: [MOCK DATA FOR BTC]");
    } else {
        console.log(`⚠️ Mock Fetch: Would ask Python for '${symbol}'`);
    }
};

// TEST CASES
getLiveMarketData("Faz um script de scalping para BTC");
getLiveMarketData("Strategy for ETH/USDT");
getLiveMarketData("Hello world");
