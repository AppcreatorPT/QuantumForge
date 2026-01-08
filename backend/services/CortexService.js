const CORTEX_URL = 'http://127.0.0.1:8000';

class CortexService {
    constructor() {
        this.baseUrl = CORTEX_URL;
    }

    /**
     * Generic POST wrapper with error handling
     */
    async _post(endpoint, body) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Cortex API Error (${response.status}): ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[CortexService] Failed call to ${endpoint}:`, error.message);
            // Return null to allow graceful fallback in the caller
            return null;
        }
    }

    /**
     * Search for Semantic Memories (RAG)
     * @param {string} query - User message
     * @param {number} limit - Number of matches
     */
    async search(query, limit = 3) {
        return this._post('/search', { query, limit });
    }

    /**
     * Persist a new lesson to the Brain
     * @param {string} content - The lesson text
     * @param {string} category - Category (default: user_correction)
     */
    async learn(content, category = 'user_correction') {
        const result = await this._post('/learn', { content, category });
        if (result && result.status === 'success') {
            console.log(`[CortexService] Learned: "${content.substring(0, 50)}..."`);
            return true;
        }
        return false;
    }

    /**
     * Fetch Live Market Data
     * @param {string} symbol - Ticker (e.g. BTC/USDT)
     */
    async scanMarket(symbol) {
        return this._post('/market_scan', { symbol });
    }

    /**
     * Run Quantum Sandbox Simulation
     * @param {string} symbol 
     * @param {string} logicCode - Python logic for next()
     * @param {string} timeframe 
     */
    async simulate(symbol, logicCode, timeframe = '1h') {
        return this._post('/simulate', { symbol, logic_code: logicCode, timeframe });
    }
}

module.exports = new CortexService();
