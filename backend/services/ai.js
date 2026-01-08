const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cortex = require('./CortexService');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");
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
        let filesToLoad = new Set(['pine_v6_reference_full.md', 'proven_strategies.md']);

        for (const [key, files] of Object.entries(CONTEXT_MAP)) {
            if (msgCheck.includes(key)) {
                files.forEach(f => filesToLoad.add(f));
            }
        }

        let combinedContext = "You are an Expert Pine Script Developer (v6).\nSTRICT RULES: Use 'ta.dmi' (not adx), 'color.from_gradient', and Fixed Tables.\n\n";

        const fs = require('fs');
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
    const codeMatch = draftResponse.match(/```pinescript([\s\S]*?)```/);
    if (!codeMatch) return draftResponse;

    const script = codeMatch[1];
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
    
    OUTPUT: Return the FULLY CORRECTED script inside a \`\`\`pinescript block. If no errors, return original.
    `;

    try {
        const verification = await model.generateContent(auditPrompt);
        const verifiedCode = (await verification.response).text();
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

// --- 2. THE MEMORY VAULT ---
const fetchSemanticMemories = async (userMessage) => {
    try {
        const data = await cortex.search(userMessage, 3);
        if (!data || data.status !== "success" || !data.matches || data.matches.length === 0) return "";
        let relevantMemories = "";
        data.matches.forEach(match => { relevantMemories += `- ${match.text}\n`; });
        if (relevantMemories.length > 0) return `\n--- 🧠 ACTIVE MEMORIES ---\n${relevantMemories}\n------------------------------------------------\n`;
        return "";
    } catch (e) {
        console.error("Memory Fetch Error:", e.message);
        return "";
    }
};

// --- 4. THE ANTIBODY ---
const handleErrorFix = async (userMessage, history = []) => {
    console.log("🚑 Immune System Triggered:", userMessage);
    try {
        const isFixRequest = userMessage.includes("FIX_ERROR:");
        let lesson = userMessage.replace(/FIX_ERROR:|LEARN:|ERRO:/gi, "").trim();

        await cortex.learn(lesson, "user_correction");

        if (isFixRequest) {
            console.log("🛠️ Generating Fix for prompt...");
            let brokenCodeContext = "N/A - Context not found.";
            if (history && history.length > 0) {
                const lastCodeMsg = [...history].reverse().find(msg => msg.role === 'assistant' && msg.content.includes("```pinescript"));
                if (lastCodeMsg) {
                    const codeMatch = lastCodeMsg.content.match(/```pinescript([\s\S]*?)```/);
                    if (codeMatch) brokenCodeContext = codeMatch[1];
                }
            }

            try {
                const prompt = `
                 ROLE: Expert Pine Script v6 Debugger.
                 TASK: The user reported an error.
                 ERROR: "${lesson}"
                 BROKEN CODE: \`\`\`pinescript${brokenCodeContext}\`\`\`
                 ACTION: 1. Explain WHY. 2. GENERATE CORRECTED CODE.
                 RESPONSE FORMAT (Strict):
                 - **Diagnóstico:** (PT-PT)
                 - **Correção:** (Code Block v6)
                 `;
                const result = await model.generateContent(prompt);
                return (await result.response).text();
            } catch (genError) {
                return `⚠️ **Diagnostics Failed.** Error recorded.`;
            }
        }
        return `✅ **Immune System Updated.** Lesson recorded: "${lesson}".`;
    } catch (e) {
        console.error("❌ Learning Error:", e);
        return "⚠️ **System Error:** Auto-Correct failure.";
    }
};

// --- 1.5 THE SCOUT ---
const getLiveMarketData = async (userMessage) => {
    const tickerRegex = /@([a-zA-Z0-9\.\-\/]{2,12})/g;
    const matches = Array.from(userMessage.matchAll(tickerRegex), m => m[1].toUpperCase());
    if (!matches || matches.length === 0) return "";
    const symbol = matches[0];
    const data = await cortex.scanMarket(symbol);
    if (data && data.data) return `\n--- 📊 LIVE MARKET DATA ---\n${data.data}\n`;
    return "";
};

// --- 1.6 THE ARCHITECT ---
const generateBlueprint = async (userMessage, context) => {
    const blueprintPrompt = `
    ROLE: QuantForge Chief Architect (Pine Script v6 Expert).
    GOAL: Design a robust algorithmic strategy blueprint based on the user request.
    CONTEXT: ${context}
    USER REQUEST: "${userMessage}"
    TASK: Analyze implicit reqs, select V6 features, define logic/risk. CITE sources. Use Live Data if present.
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
        return "Standard Analysis applied.";
    }
};

const generateBlueprintWithVision = async (userMessage, context, imageBase64) => {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const visionPrompt = `
    ROLE: expert Quantitative Technical Analyst.
    TASK: Analyze the provided CHART IMAGE and the user request.
    USER REQUEST: "${userMessage}"
    CONTEXT: ${context}
    OUTPUT FORMAT (Text Only - Portuguese PT):
    - **Visual Analysis**: What do you see?
    - **Strategy Logic**: How to trade this?
    - **Indicators**: What indicators to use?
    - **V6 Features**: ...
    - **Risk Guard**: ...
    `;
    try {
        const imagePart = { inlineData: { data: base64Data, mimeType: "image/png" } };
        const result = await model.generateContent([visionPrompt, imagePart]);
        return (await result.response).text();
    } catch (e) {
        return "⚠️ Vision Error: Could not analyze image.";
    }
};

// --- 1.7 THE EDITOR ---
const findLastCodeBlock = (history) => {
    for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i];
        if (msg.role === 'assistant') {
            const matches = msg.content.match(/```(?:pinescript|pine)([\s\S]*?)```/i);
            if (matches && matches[1]) return matches[1].trim();
        }
    }
    return null;
};

const generateSmartEdit = async (userRequest, originalCode) => {
    console.log("⚡ The Editor is patching code...");
    const prompt = `
    ROLE: Senior Code Editor.
    TASK: Apply the user's change request to the PREVIOUS CODE.
    CONSTRAINT: Do NOT rewrite, only patch. Output ONLY valid Pine Script v6.
    PREVIOUS CODE: \`\`\`pinescript${originalCode}\`\`\`
    CHANGE REQUEST: "${userRequest}"
    OUTPUT FORMAT:
    1. **Análise QuantForge** (PT-PT): Breve confirmação.
    2. **O Código** (Pine Script v6): Código completo.
    3. **Manual de Operações** (Bullets): Notas.
    `;
    try {
        const result = await model.generateContent(prompt);
        return (await result.response).text();
    } catch (error) {
        return "⚠️ **Neural Collapse**: Edit failed.";
    }
};

// --- 1.9 THE PARSER (Structured Output - Robust v2.1) ---
const parseResponse = (responseText, marketData, simStats) => {
    const structure = {
        analysis: "Análise indisponível. Verifique o log do sistema.",
        code: "// Erro no parser do código.",
        manual: "Consulte o histórico.",
        marketData: marketData || null,
        backtestResults: simStats || null,
        raw: responseText // Always return raw for debugging fallback
    };

    try {
        // ROBUST REGEX (Case Insensitive, Flexible Headers)
        // Match "1. Análise" OR "**Análise**" etc.
        const analysisMatch = responseText.match(/(?:1\.|#|__|\*\*)?\s*(?:Análise|Analysis)(?:.*?)[\r\n]([^]*?)(?=(?:2\.|#|__|\*\*)?\s*(?:O Código|The Code|Code))/i);
        const codeMatch = responseText.match(/(?:2\.|#|__|\*\*)?\s*(?:O Código|The Code|Code)[^]*?```(?:pinescript|pine)([^]*?)```[^]*?(?=(?:3\.|#|__|\*\*)?\s*(?:Manual|Instructions))/i);
        const manualMatch = responseText.match(/(?:3\.|#|__|\*\*)?\s*(?:Manual|Instructions|Operações)(?:.*?)[\r\n]([^]*?)$/i);

        if (analysisMatch) {
            structure.analysis = analysisMatch[1].trim();
        } else {
            // Fallback: If no headers found, try to take everything before the code block
            const splitByCode = responseText.split(/```(?:pinescript|pine)/i);
            if (splitByCode.length > 1) {
                structure.analysis = splitByCode[0].replace(/(?:1\.|#|__|\*\*)?\s*(?:Análise|Analysis).*/i, "").trim();
            }
        }

        if (codeMatch && codeMatch[1]) {
            structure.code = codeMatch[1].trim();
        } else {
            // Fallback: Just look for ANY pinescript block
            const fallbackCode = responseText.match(/```(?:pinescript|pine)([^]*?)```/i);
            if (fallbackCode) structure.code = fallbackCode[1].trim();
        }

        if (manualMatch) {
            structure.manual = manualMatch[1].trim();
        } else {
            // Fallback: Everything after the last code block
            const parts = responseText.split(/```/);
            if (parts.length > 2) {
                structure.manual = parts[parts.length - 1].trim();
            }
        }

    } catch (e) {
        console.error("Parser Critical Failure:", e);
        // Desperate Fallback: Return raw text as analysis
        structure.analysis = responseText;
    }
    return structure;
};

// --- MAIN GENERATOR ---
const generateResponse = async (userMessage, history = [], image = null) => {
    try {
        const msgClean = userMessage.trim();

        if (msgClean.toUpperCase().startsWith("LEARN:") ||
            msgClean.toUpperCase().startsWith("ERRO:") ||
            msgClean.startsWith("FIX_ERROR:")) {
            const fixResult = await handleErrorFix(msgClean, history);
            return {
                analysis: fixResult,
                code: null,
                manual: null,
                marketData: null,
                backtestResults: null,
                raw: fixResult
            };
        }

        const smartContext = getSmartContext(msgClean);
        const activeMemories = await fetchSemanticMemories(msgClean);
        const marketData = await getLiveMarketData(msgClean);

        console.log("🧠 Architect is Thinking...");
        let blueprint = "";
        let simStats = "";

        if (image) {
            blueprint = await generateBlueprintWithVision(msgClean, smartContext + activeMemories + marketData, image);
        } else {
            const editorKeywords = ["improve", "melhora", "change", "muda", "altera", "fix", "corrige", "add", "adiciona", "remove", "tira", "make", "faz", "optimize", "otimiza", "create", "cria", "update", "atualiza", "set", "use"];
            const isEditorIntent = editorKeywords.some(kw => msgClean.toLowerCase().includes(kw));
            const lastCode = findLastCodeBlock(history);

            if (isEditorIntent && lastCode) {
                console.log("🧬 routing to THE EDITOR");
                const editResponse = await generateSmartEdit(msgClean + "\nContext:" + marketData, lastCode);

                // Debug Log for Editor
                console.log("--- RAW EDITOR RESPONSE ---");
                console.log(editResponse.substring(0, 500) + "...");
                return parseResponse(editResponse, marketData, null);
            }

            blueprint = await generateBlueprint(msgClean, smartContext + activeMemories + marketData);

            if (blueprint && (msgClean.includes("strategy") || msgClean.includes("estratégia") || isEditorIntent)) { // Relaxed SIM trigger
                console.log("🧪 Quantum Sandbox Activated...");
                try {
                    const simPrompt = `
                    ROLE: Python Backtesting Expert.
                    TASK: Convert the strategy idea into Python logic for the 'next()' function of 'backtesting.py'.
                    INPUT IDEA: "${msgClean}"
                    AVAILABLE DATA: self.data.Close, self.data.High, self.data.Low, self.data.Open
                    AVAILABLE INDICATORS: 
                    - self.rsi (14)
                    - self.sma_fast (14), self.sma_slow (28)
                    - self.ema_fast (9), self.ema_slow (21)
                    - self.bb_upper, self.bb_lower (20, 2)
                    - self.macd, self.macd_signal (12, 26, 9)
                    
                    OUTPUT: ONLY the Python code block for the logic inside 'next()'. Use 'self.buy()' and 'self.sell()'.
                    Example:
                    \`\`\`python
                    if self.rsi[-1] < 30 and self.data.Close[-1] > self.sma_fast[-1]:
                        self.buy()
                    elif self.rsi[-1] > 70:
                        self.position.close()
                    \`\`\`
                    `;
                    const simGen = await model.generateContent(simPrompt);
                    const simText = (await simGen.response).text();
                    const pyMatch = simText.match(/```python([\s\S]*?)```/);
                    if (pyMatch) {
                        const logicCode = pyMatch[1].trim();
                        const simData = await cortex.simulate("BTC/USDT", logicCode, '1h');
                        if (simData && simData.status === "success") {
                            simStats = `\nWin Rate: ${simData.win_rate}% | ROI: ${simData.return_pct}% | Sharpe: ${simData.sharpe}`;
                            console.log("✅ Backtest Successful:", simStats);
                        }
                    }
                } catch (e) {
                    console.error("Sandbox Failed:", e.message);
                }
            }
        }

        const prompt = `
${smartContext}
${activeMemories}
${marketData}
${simStats}
--- BLUEPRINT ---
${blueprint}

ROLE: Senior Quantitative Developer.
GOAL: Implement in Pine Script v6.

MANDATORY:
- Cite Live Data and Sandbox Results if present.
- Use 'syminfo.tickerid'.
- Use FULL FORMAT for request.security.

CRITICAL OUTPUT FORMAT (Strict):
1. **Análise QuantForge** (PT-PT) ...
2. **O Código** (Pine Script v6) \`\`\`pinescript ... \`\`\`
3. **Manual de Operações** (Bullets) ...
        `;

        const result = await model.generateContent(prompt);
        let responseText = await result.response.text();

        // Audit
        if (responseText.includes("```pinescript")) {
            console.log("⚡ Auditing Code...");
            responseText = await auditCode(responseText);
        }

        // --- DEBUG LOG START ---
        console.log("--- RAW AI RESPONSE (START) ---");
        console.log(responseText.substring(0, 500)); // Log first 500 chars to avoid terminal spam
        console.log("--- RAW AI RESPONSE (END) ---");
        // --- DEBUG LOG END ---

        return parseResponse(responseText, marketData, simStats);

    } catch (error) {
        console.error("Gemini API Error:", error);
        return {
            analysis: "Erro Crítico.",
            code: null,
            marketData: null,
            error: error.message
        };
    }
};

module.exports = { generateResponse };
