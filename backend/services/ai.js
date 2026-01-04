const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
// IMPORTANT: Expects GEMINI_API_KEY in .env or environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

// AUDIT UPGRADE: Switched to Gemini 3 Flash (Frontier Class, Launched Dec 2025)
// This model is 3x faster than 2.5 Pro and features advanced agentic coding.
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// --- 1. THE ARCHITECT (Smart Context Selector) ---
const CONTEXT_MAP = {
    'quant': ['quant_math_library.md', 'elite_modules_library.md'],
    'stats': ['quant_math_library.md', 'institutional_volume.md'],
    'bot': ['execution_engine.md'],
    'alert': ['execution_engine.md'],
    'automation': ['execution_engine.md'],
    'dashboard': ['ui_mastery_library.md', 'risk_and_dashboard_library.md'],
    'panel': ['ui_mastery_library.md'],
    'table': ['ui_mastery_library.md'],
    'smc': ['modern_indicators_library.md', 'price_action_patterns.md'],
    'ict': ['modern_indicators_library.md', 'price_action_patterns.md'],
    'pattern': ['price_action_patterns.md'],
    'strategy': ['proven_strategies.md', 'risk_and_dashboard_library.md'],
    'risk': ['risk_and_dashboard_library.md', 'psych_risk_library.md'],
    'cycle': ['cycle_time_library.md'],
    'time': ['cycle_time_library.md'],
    'session': ['cycle_time_library.md'],
    'macro': ['macro_economics_library.md'],
    'news': ['macro_economics_library.md'],
    'psych': ['psych_risk_library.md'],
    'mind': ['psych_risk_library.md'],
    'volume': ['institutional_volume.md'],
    'profile': ['institutional_volume.md']
};

const getSmartContext = (userMessage) => {
    try {
        const kbPath = path.join(__dirname, '../../knowledge-base');
        const msgCheck = userMessage.toLowerCase();

        // BASE KNOWLEDGE (Always Loaded)
        let filesToLoad = new Set([
            'pine_v6_reference_full.md', // The Bible
            'proven_strategies.md'       // Templates
        ]);

        // DYNAMIC SELECTION
        for (const [key, files] of Object.entries(CONTEXT_MAP)) {
            if (msgCheck.includes(key)) {
                files.forEach(f => filesToLoad.add(f));
            }
        }

        // Load Files
        let combinedContext = "You are an Expert Pine Script Developer (v6).\n";
        combinedContext += "STRICT RULES: Use 'ta.dmi' (not adx), 'color.from_gradient', and Fixed Tables.\n\n";

        filesToLoad.forEach(file => {
            const filePath = path.join(kbPath, file);
            if (fs.existsSync(filePath)) {
                combinedContext += `--- MODULE: ${file} ---\n${fs.readFileSync(filePath, 'utf-8')}\n\n`;
            }
        });

        return combinedContext;
    } catch (error) {
        console.error("Error reading knowledge base:", error);
        return "";
    }
};

// --- 3. THE AUDITOR (Self-Correction Loop) ---
const auditCode = async (draftResponse) => {
    // Extract code block
    const codeMatch = draftResponse.match(/```pinescript([\s\S]*?)```/);
    if (!codeMatch) return draftResponse; // No code to audit

    const script = codeMatch[1];

    // Audit Prompt
    const auditPrompt = `
    ROLE: You are a Senior Pine Script v6 Auditor.
    TASK: Review the script below for compilation errors.
    
    CHECKLIST:
    1. Is 'ta.adx' used? -> REPLACE WITH 'ta.dmi'.
    2. Are colors using gradients? -> IF NOT, FIX.
    3. Is 'strategy()' using 'process_orders_on_close=true'? -> REQUIRED.
    4. Are inputs properly grouped?
    
    SCRIPT TO AUDIT:
    ${script}
    
    OUTPUT:
    Return the FULLY CORRECTED script inside a \`\`\`pinescript block. 
    If no errors, return the original script.
    `;

    try {
        const verification = await model.generateContent(auditPrompt);
        const verifiedCode = (await verification.response).text();

        // If the auditor returns a valid code block, swap it in.
        const fixedMatch = verifiedCode.match(/```pinescript([\s\S]*?)```/);
        if (fixedMatch) {
            return draftResponse.replace(/```pinescript[\s\S]*?```/, `\`\`\`pinescript${fixedMatch[1]}\`\`\``);
        }
        return draftResponse;
    } catch (e) {
        console.error("Audit failed, returning draft:", e);
        return draftResponse;
    }
};

// --- 2. THE MEMORY VAULT (Active RAG) ---
// --- 2. THE MEMORY VAULT (Active RAG via Cortex) ---
const fetchSemanticMemories = async (userMessage) => {
    try {
        // Call Python Microservice (Updated to POST for Phase 12)
        const response = await fetch('http://localhost:8000/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: userMessage, limit: 3 })
        });
        if (!response.ok) return "";

        const data = await response.json();
        if (data.status !== "success" || !data.matches || data.matches.length === 0) return "";

        let relevantMemories = "";
        data.matches.forEach(match => {
            // match.text is the lesson string
            relevantMemories += `- ${match.text}\n`;
        });

        if (relevantMemories.length > 0) {
            return `\n--- 🧠 ACTIVE MEMORIES (Retrieved from Cortex) ---\n${relevantMemories}\n------------------------------------------------\n`;
        }
        return "";
    } catch (e) {
        console.error("Cortex Search Failed (Is Python running?):", e.message);
        // Fallback or empty
        return "";
    }
};

// --- 4. THE ANTIBODY (Learning Mode + Auto-Correction) ---
const handleErrorFix = async (userMessage, history = []) => {
    console.log("🚑 Immune System Triggered:", userMessage);
    try {
        const isFixRequest = userMessage.includes("FIX_ERROR:");
        let lesson = userMessage.replace(/FIX_ERROR:|LEARN:|ERRO:/gi, "").trim();

        // 1. RECORD LESSON (Cortex + File Backup)
        try {
            // Cortex API
            fetch('http://localhost:8000/learn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // FIX: Cortex expects 'content', not 'text'
                body: JSON.stringify({ content: lesson, category: "user_correction" })
            }).catch(err => console.error("⚠️ Cortex Learn Failed:", err.message));

            // File Backup
            const memoryPath = path.join(__dirname, '../../knowledge-base/lessons_learned.md');
            const timestamp = new Date().toISOString().split('T')[0];
            const newEntry = `\n- [${timestamp}] LESSON: ${lesson}`;
            if (fs.existsSync(memoryPath)) {
                fs.appendFileSync(memoryPath, newEntry);
                console.log("✅ Lesson recorded to Vault.");
            }
        } catch (fileErr) {
            console.error("⚠️ Failed to write lesson to file:", fileErr);
        }

        // 2. GENERATE FIX (If it's a FIX_ERROR request)
        if (isFixRequest) {
            console.log("🛠️ Generating Fix for prompt...");

            // EXTRACT BROKEN CODE FROM HISTORY
            let brokenCodeContext = "N/A - Context not found.";
            if (history && history.length > 0) {
                const lastCodeMsg = [...history].reverse().find(msg =>
                    msg.role === 'assistant' && msg.content.includes("```pinescript")
                );
                if (lastCodeMsg) {
                    const codeMatch = lastCodeMsg.content.match(/```pinescript([\s\S]*?)```/);
                    if (codeMatch) brokenCodeContext = codeMatch[1];
                }
            }

            try {
                const prompt = `
                 ROLE: Expert Pine Script v6 Debugger.
                 TASK: The user reported an error in their v6 script.
                 
                 ERROR DETAILS: "${lesson}"
                 
                 BROKEN CODE CONTEXT:
                 \`\`\`pinescript
                 ${brokenCodeContext}
                 \`\`\`

                 STRICT RULES:
                 1. ALWAYS use //@version=6.
                 2. Use 'ta.dmi()' instead of 'ta.adx()'.
                 3. Use strict boolean checks (no 'na').
                 4. Fix type mismatches explicitly.
                 
                 ACTION:
                 1. Explain WHY this error happened (Briefly in PT-PT).
                 2. GENERATE THE CORRECTED CODE SNIPPET (or full script) in v6.
                 
                 RESPONSE FORMAT (Strict):
                 - **Diagnóstico:** (PT-PT)
                 - **Correção:** (Code Block v6)
                 `;
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (!text) throw new Error("Empty response from AI");
                return text;
            } catch (genError) {
                console.error("AI Generation Failed in Fix:", genError);
                return `⚠️ **Diagnostics Failed.**\nI recorded the error: *"${lesson}"*, but I couldn't generate a code fix right now. Check your API limits or try again.`;
            }
        }

        return `✅ **Immune System Updated.** I have recorded this lesson: "${lesson}".`;
    } catch (e) {
        console.error("❌ Learning/Fix Critical Failure:", e);
        return "⚠️ **System Error:** Critical Failure in Auto-Correct module.";
    }
};

// --- 1.5 THE SCOUT (Market Data Fetcher) ---
const getLiveMarketData = async (userMessage) => {
    // Regex to find likely tickers (e.g. BTC, ETH/USDT, AAPL, EURUSD)
    // Avoids common words like AND, FOR, THE
    // Regex to find likely tickers (e.g. BTC, ETH/USDT, AAPL, EURUSD)
    // Avoids common words like AND, FOR, THE
    // Regex to find EXPLICIT tickers (e.g. @BTC, @ETH/USDT, @AAPL)
    // STRICT MODE: Only matches if prefixed with '@' to prevent false positives like "ON", "FOR"
    const tickerRegex = /@([a-zA-Z0-9\.\-\/]{2,12})/g;

    // We match against the raw message to preserve the '@' context
    const matches = Array.from(userMessage.matchAll(tickerRegex), m => m[1].toUpperCase());

    if (!matches || matches.length === 0) {
        console.log("❌ Market Scout: No explicit tickers (@SYMBOL) found.");
        return "";
    }

    // Pick top candidate (first one)
    const symbol = matches[0];

    console.log(`🔎 Market Scout detected ticker: ${symbol}`);

    try {
        const response = await fetch('http://127.0.0.1:8000/market_scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol: symbol })
        });
        const data = await response.json();
        const marketBlob = `\n--- 📊 LIVE MARKET DATA ---\n${data.data}\n`;
        console.log("✅ Market Scout Data Injection:", marketBlob);
        return marketBlob;
    } catch (e) {
        console.error("Market Scout failed:", e);
        return "";
    }
};

// --- 1.6 THE ARCHITECT (Blueprinter) ---
const generateBlueprint = async (userMessage, context) => {
    // This step focuses PURELY on logic, math, and v6 features. No code yet.
    const blueprintPrompt = `
    ROLE: QuantForge Chief Architect (Pine Script v6 Expert).
    GOAL: Design a robust algorithmic strategy blueprint based on the user request.
    
    CONTEXT:
    ${context}

    USER REQUEST: "${userMessage}"

    TASK:
    1. Analyze the request for implicit requirements (e.g., if user says "Trend", suggest ADX + EMA).
    2. Select specific Pine Script v6 features (e.g., 'request.security_lower_tf', 'table.new', 'input.group').
    3. Define Entry/Exit Logic and Risk Management (Stop Loss/TP).
    4. Check for Repainting Risks.
    5. **CITATION**: You MUST cite the specific Knowledge Base files or concepts used (e.g. "Applying Wyckoff logic from institutional_volume.md").
    
    CRITICAL: IF 'LIVE MARKET DATA' IS PROVIDED IN CONTEXT, YOU MUST USE IT (Mention Price/Volume in Analysis).

    OUTPUT FORMAT (Text Only - Portuguese PT):
    - **Strategy Logic**: ...
    - **Indicators**: ...
    - **V6 Features**: ...
    - **Risk Guard**: ...
    `;

    try {
        const result = await model.generateContent(blueprintPrompt);
        return (await result.response).text();
    } catch (e) {
        console.error("Blueprint Generation Failed:", e);
        return "Standard Analysis applied.";
    }
};

// --- 1.6 THE VISIONARY (Multimodal Architect) ---
const generateBlueprintWithVision = async (userMessage, context, imageBase64) => {
    // Clean Base64 (remove data:image/png;base64, prefix if present)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const visionPrompt = `
    ROLE: expert Quantitative Technical Analyst.
    TASK: Analyze the provided CHART IMAGE and the user request.
    
    USER REQUEST: "${userMessage}"
    
    CONTEXT:
    ${context}

    ACTION:
    1. Identify Patterns (Candlesticks, Chart Patterns, Indicators).
    2. Extract key levels from the image (Support, Resistance).
    3. Formulate a Pine Script v6 Strategy based on this visual data.

    OUTPUT FORMAT (Text Only - Portuguese PT):
    - **Visual Analysis**: What do you see? (e.g., "Double Bottom at level X").
    - **Strategy Logic**: How to trade this?
    - **Indicators**: What indicators to use?
    - **V6 Features**: ...
    - **Risk Guard**: ...
    `;

    try {
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/png"
            }
        };

        const result = await model.generateContent([visionPrompt, imagePart]);
        return (await result.response).text();
    } catch (e) {
        console.error("Vision Generation Failed:", e);
        return "⚠️ Vision Error: Could not analyze image.";
    }
};

// --- 1.8 THE CRITIC (Agentic Reflexion) ---
const reviewCode = async (blueprint, code) => {
    console.log("🕵️ Critic is Reviewing the Code...");
    const prompt = `
    ROLE: Senior QA Engineer & Pine Script v6 Auditor.
    TASK: Review the provided Code against the Blueprint and Pine Script v6 Standards.
    
    BLUEPRINT:
    ${blueprint}

    CODE:
    ${code}

    CHECKLIST:
    1. Does the code compile (No obvious syntax errors)?
    2. Does it use strictly v6 syntax?
    3. Are there any hallucinations (e.g. non-existent tickers or functions)?
    4. Did it follow the Blueprint logic EXACTLY? (If Blueprint asked for EMA, and Code used SMA -> FAIL).

    OUTPUT:
    If PERFECT: Return "PASS".
    If FLAWED: Return "FAIL: [Concise explaination of the error]".
    NOTE: Be extremely pedantic. We want institutional grade code.
    `;

    try {
        const result = await model.generateContent(prompt);
        const verdict = (await result.response).text().trim();
        console.log(`🕵️ Critic Verdict: ${verdict}`);
        return verdict;
    } catch (e) {
        console.error("Critic Failed:", e);
        return "PASS"; // Bypass if critic fails
    }
};

// --- 1.7 THE EDITOR (Smart Diff Patcher) ---
const findLastCodeBlock = (history) => {
    // Scan backwards for the last assistant message with a code block
    for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i];
        if (msg.role === 'assistant') {
            const matches = msg.content.match(/```(?:pinescript|pine)([\s\S]*?)```/i);
            if (matches && matches[1]) {
                return matches[1].trim();
            }
        }
    }
    return null;
};

const generateSmartEdit = async (userRequest, originalCode) => {
    console.log("⚡ The Editor is patching code...");
    const prompt = `
    ROLE: Senior Code Editor.
    TASK: Apply the user's change request to the PREVIOUS CODE.
    CONSTRAINT: Do NOT rewrite the entire logic significantly. Maintain variable names and structure unless explicitely asked to change. Output ONLY the full valid Pine Script v6 code.

    PREVIOUS CODE:
    \`\`\`pinescript
    ${originalCode}
    \`\`\`

    CHANGE REQUEST:
    "${userRequest}"

    OUTPUT FORMAT:
    1. **Análise QuantForge** (PT-PT): Breve confirmação da mudança.
    2. **O Código** (Pine Script v6): O código completo com a alteração.
    3. **Manual de Operações** (Bullets): Pontos inalterados ou nota sobre a mudança.
    `;

    try {
        // ATTEMPT 1: Initial Generation
        const result = await model.generateContent(prompt);
        let finalOutput = (await result.response).text();

        // REFLEXION LOOP (Auto-Fixer)
        // Extract code to review
        const codeMatch = finalOutput.match(/```(?:pinescript|pine)([\s\S]*?)```/i);
        if (codeMatch) {
            const code = codeMatch[1];
            const review = await reviewCode("Smart Edit", code); // Blueprint is not applicable here, so use a default string

            if (review.startsWith("FAIL")) {
                console.log("🛠️ Engineer is fixing the code based on Critic's feedback...");

                const fixPrompt = `
                ROLE: Senior Developer.
                TASK: Fix the code based on the Quality Assurance feedback.

                ORIGINAL CODE:
                ${code}

                QA FEEDBACK (CRITICAL):
                ${review}

                OUTPUT FORMAT:
                Provide ONLY the corrected Full Pine Script v6 Code inside a code block.
                `;

                const fixResult = await model.generateContent(fixPrompt);
                const fixedCode = (await fixResult.response).text();

                // Replace the bad code block with the fixed one in the final output
                finalOutput = finalOutput.replace(codeMatch[0], fixedCode);
                console.log("✅ Code Auto-Corrected.");
            }
        }

        return finalOutput;

    } catch (error) {
        console.error(error);
        return "⚠️ **Neural Collapse**: The Engineer failed to compile the strategy. Please try again.";
    }
};

const generateResponse = async (userMessage, history = [], image = null) => {
    try {
        // CHECK FOR LEARNING COMMAND
        const msgClean = userMessage.trim();
        if (msgClean.toUpperCase().startsWith("LEARN:") ||
            msgClean.toUpperCase().startsWith("ERRO:") ||
            msgClean.toUpperCase().startsWith("FIX_ERROR:")) {
            return handleErrorFix(msgClean, history);
        }

        // STEP 1: SMART CONTEXT & MEMORIES
        const smartContext = getSmartContext(msgClean);
        const activeMemories = await fetchSemanticMemories(msgClean);
        const marketData = await getLiveMarketData(msgClean);

        // STEP 2: THE ARCHITECT (Brainstorming)
        console.log("🧠 Architect is Thinking...");
        let blueprint = "";

        // Initialize simStats in outer scope (Fix for ReferenceError)
        let simStats = "";

        if (image) {
            console.log("👁️ Cortex Vision Active: Analyzing Image...");
            blueprint = await generateBlueprintWithVision(msgClean, smartContext + activeMemories + marketData, image);
        } else {
            // CHECK FOR EDITOR INTENT (Improve/Change/Fix) and CODE CONTEXT
            const editorKeywords = ["improve", "melhora", "change", "muda", "altera", "fix", "corrige", "add", "adiciona", "remove", "tira"];
            const isEditorIntent = editorKeywords.some(kw => msgClean.toLowerCase().includes(kw));
            const lastCode = findLastCodeBlock(history);

            if (isEditorIntent && lastCode) {
                // ROUTE TO EDITOR (Pass Market Data too for context)
                console.log("🧬 routing to THE EDITOR (Smart Patch Mode)");
                return await generateSmartEdit(msgClean + "\nContext:" + marketData, lastCode);
            }

            // DEFAULT: ARCHITECT
            blueprint = await generateBlueprint(msgClean, smartContext + activeMemories + marketData);

            // --- 2.5 THE SIMULATOR (Quantum Sandbox) ---
            // Only trigger if Blueprint exists and it's a Strategy request

            // Define Sandbox logic first to populate simStats
            if (blueprint && (msgClean.includes("strategy") || msgClean.includes("estratégia"))) {
                console.log("🧪 Quantum Sandbox Activated: Running Backtest...");
                try {
                    // 1. Generate Python Logic for Sandbox
                    const simPrompt = `
                    ROLE: Python Backtesting Expert.
                    TASK: Convert the user's strategy idea into a Python 'next()' block for backtesting.py.
                    INPUT: "${msgClean}"
                    
                    STRICT FORMAT:
                    - Use 'self.data.Close' (pandas Series) or 'self.rsi' (pre-calculated).
                    - Use 'self.buy()' and 'self.sell()'.
                    - OUTPUT ONLY THE PYTHON CODE inside a \`\`\`python block.
                    - NO IMPORTS. NO CLASS DEF. JUST THE LOGIC INSIDE 'next()'.
                    - Example:
                    if self.rsi[-1] < 30:
                        self.buy()
                    elif self.rsi[-1] > 70:
                        self.position.close()
                    `;

                    const simGen = await model.generateContent(simPrompt);
                    const simText = (await simGen.response).text();
                    const pyMatch = simText.match(/```python([\s\S]*?)```/);

                    if (pyMatch) {
                        const logicCode = pyMatch[1].trim();
                        // 2. Extract Symbol (Reuse Scout's logic or default to BTC)
                        const symbol = "BTC/USDT"; // Default for now, Scout logic can be reused if extracted

                        // 3. Call Cortex
                        const simReq = await fetch('http://localhost:8000/simulate', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ symbol, logic_code: logicCode, timeframe: '1h' })
                        });

                        const simData = await simReq.json();
                        if (simData.status === "success") {
                            simStats = `
                            \n--- 🧪 SANDBOX VERIFICATION RESULTS (Based on 1 Year Data) ---
                            - Symbol: ${simData.symbol}
                            - Win Rate: ${simData.win_rate}%
                            - ROI: ${simData.return_pct}%
                            - Sharpe Ratio: ${simData.sharpe}
                            - Profit Factor: ${simData.profit_factor}
                            -------------------------------------------------------------
                            `;
                            console.log("✅ Backtest Successful:", simStats);
                        } else {
                            console.warn("⚠️ Simulation Error:", simData.message);
                        }
                    }
                } catch (simErr) {
                    console.error("Sandbox Failed:", simErr.message);
                }
            }

        }

        // STEP 3: THE ENGINEER (Coding)
        const prompt = `
${smartContext}
${activeMemories}
${marketData}
${simStats} 

--- BLUEPRINT (APPROVED LOGIC) ---
${blueprint}

ROLE: Senior Quantitative Developer.
GOAL: Implement the Architect's Blueprint into Institutional Grade Pine Script v6.

MANDATORY INSTRUCTION:
If 'LIVE MARKET DATA' is present above, you MUST explicitly mention the Current Price and Volume in the 'Análise QuantForge' section. 
Use the live volatility data to justify your Stop Loss/TP choices (e.g. "Due to high volatility (ATR), using wider stops").

CRITICAL: If 'SANDBOX VERIFICATION RESULTS' are present in the context, you MUST include a bulleted summary of them (Win Rate, ROI, Sharpe) in the 'Análise QuantForge' section using the exact labels 'Win Rate:', 'Profit Factor:', 'Net Profit:'.
Example: "Win Rate: 65%", "Profit Factor: 1.5", "Net Profit: +12%".
If you do NOT see Sandbox results, estimate them based on theory but mark as "Estimated".

PROCESS:
1.  **READ** the Blueprint above carefully.
2.  **CODE** the strategy in strict Pine Script v6.
    - Use 'ta.dmi' (NOT adx).
    - Use strict types (float, int, bool).
    - Use 'request.security' with dynamic caching if needed.
3.  **DOCUMENT** the manual.

CRITICAL: TOKEN IDENTIFICATION (FAILURE PREVENTION)
- The user input (e.g. '@BTC') is a loose reference. In Code, you MUST use correct TradingView Ticker ID.
- Main Chart: Use 'syminfo.tickerid' (Dynamic).
- request.security: Use FULL FORMAT (e.g. "BINANCE:BTCUSDT", "NASDAQ:AAPL", "OANDA:EURUSD").
- NEVER use short names (e.g. "BTC", "ON") inside 'request.security'. ALWAYS prefix with Exchange.

CRITICAL OUTPUT FORMAT (Strictly enforce this structure for the UI Parser):

1. **Análise QuantForge** (PT-PT)
(Paste the ESSENCE of the Blueprint here. Be professional and concise.)
**Theoretical Basis**: [Cite the concept/library used]
**Metrics Forecast**: Win Rate: ~XX% | Profit Factor: ~X.X | Net Profit: High/Med/Low (Estimate based on logic resiliency)

2. **O Código** (Pine Script v6)
\`\`\`pinescript
// ... code here ...
\`\`\`

3. **Manual de Operações** (Bullets)
- Bullet 1
- Bullet 2
`;

        const result = await model.generateContent(prompt);
        let responseText = await result.response.text();

        // STEP 3: AUDIT LOOP (Self-Correction)
        if (responseText.includes("```pinescript")) {
            console.log("⚡ Auditing Code...");
            responseText = await auditCode(responseText);
        }

        return responseText;

    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate response.");
    }
};

module.exports = { generateResponse };
