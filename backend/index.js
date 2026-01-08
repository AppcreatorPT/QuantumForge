require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generateResponse } = require('./services/ai');
const cortex = require('./services/CortexService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large image payloads

// Routes
app.get('/', (req, res) => {
    res.send('TradeOS Gemini Backend is running 🚀');
});

app.post('/chat', async (req, res) => {
    try {
        const { message, history, image } = req.body;

        if (!message && !image) {
            return res.status(400).json({ error: 'Message or Image is required' });
        }

        console.log("Processing request:", message || "[Image Only]");
        const aiResponse = await generateResponse(message || "", history || [], image);

        // LEGACY BRIDGE (Phase 2): Support current frontend while exposing JSON
        if (typeof aiResponse === 'object' && aiResponse !== null) {
            const legacyText = `1. **Análise QuantForge**\n${aiResponse.analysis}\n\n2. **O Código**\n\`\`\`pinescript\n${aiResponse.code || "// Código indisponível"}\n\`\`\`\n\n3. **Manual de Operações**\n${aiResponse.manual}`;

            res.json({
                response: legacyText,
                data: aiResponse
            });
        } else {
            res.json({ response: aiResponse });
        }

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// SIMULATION ENDPOINT (Phase 37)
app.post('/simulate', async (req, res) => {
    try {
        const { symbol, code, timeframe } = req.body;

        if (!code) {
            return res.status(400).json({ error: 'Code is required for simulation.' });
        }

        const targetSymbol = symbol || 'BTC/USDT';
        console.log(`[BACKEND] Starting Simulation for ${targetSymbol}...`);

        // Call Python Microservice
        const result = await cortex.simulate(targetSymbol, code, timeframe || '1h');

        if (result) {
            console.log(`[BACKEND] Simulation Complete. WIN: ${result.win_rate}%`);
            res.json(result);
        } else {
            res.status(500).json({ error: 'Simulation Service Returned Null' });
        }

    } catch (error) {
        console.error("Simulation Middleware Error:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
