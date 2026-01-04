require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { generateResponse } = require('./services/ai');

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
        const { message, history, image } = req.body; // Extract Image

        if (!message && !image) {
            return res.status(400).json({ error: 'Message or Image is required' });
        }

        console.log("Processing request:", message || "[Image Only]");
        // Pass history and image to AI service
        const aiResponse = await generateResponse(message || "", history || [], image);

        res.json({ response: aiResponse });

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
