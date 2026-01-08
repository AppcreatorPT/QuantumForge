import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, Check, Play, TrendingUp, AlertTriangle, Code, Activity } from 'lucide-react';

const CodeEditorPanel = ({ code, setCode, activeSymbol = "BINANCE:BTCUSDT", isResizing = false }) => {
    const [activeTab, setActiveTab] = useState('CHART');
    const [copied, setCopied] = useState(false);
    const [simulating, setSimulating] = useState(false);
    const [simResults, setSimResults] = useState(null);
    const [simError, setSimError] = useState(null);

    // AUTO-SWITCH to CODE tab when new code arrives
    useEffect(() => {
        if (code && !code.includes('Pine Script v6 Editor Ready')) {
            setActiveTab('CODE');
        }
    }, [code]);

    // INITIALIZE NATIVE TRADINGVIEW WIDGET
    useEffect(() => {
        if (activeTab !== 'CHART') return;

        const initWidget = () => {
            const container = document.getElementById('tradingview_widget_native');
            if (container && window.TradingView) {
                container.innerHTML = ""; // Clear previous

                // MANUAL HEIGHT CALCULATION
                // Forces the widget to take specific pixel height
                const calcHeight = window.innerHeight - 48; // Full Screen minus Header

                new window.TradingView.widget({
                    "width": "100%",
                    "height": calcHeight,
                    "symbol": activeSymbol,
                    "interval": "60",
                    "timezone": "Etc/UTC",
                    "theme": "dark",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#1e1e1e",
                    "enable_publishing": false,
                    "hide_side_toolbar": false,
                    "allow_symbol_change": true,
                    "container_id": "tradingview_widget_native"
                });
            }
        };

        // Resize Listener to re-init on window change
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (activeTab === 'CHART') initWidget();
            }, 200);
        };
        window.addEventListener('resize', handleResize);

        if (!document.getElementById('tv-script')) {
            const script = document.createElement('script');
            script.id = 'tv-script';
            script.src = 'https://s3.tradingview.com/tv.js';
            script.async = true;
            script.onload = initWidget;
            document.head.appendChild(script);
        } else {
            setTimeout(initWidget, 100);
        }

        return () => window.removeEventListener('resize', handleResize);

    }, [activeTab, activeSymbol]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRun = async () => {
        setSimulating(true);
        setSimResults(null);
        setSimError(null);

        let cleanSymbol = activeSymbol.includes(':') ? activeSymbol.split(':')[1] : activeSymbol;
        if (!cleanSymbol.includes('/')) {
            cleanSymbol = cleanSymbol.replace(/(USDT|USD|EUR|BUSD|DAI)$/, '/$1');
        }

        try {
            const response = await fetch('http://localhost:3000/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: cleanSymbol,
                    code: code,
                    timeframe: '1h'
                })
            });

            const data = await response.json();

            if (data.status === 'success' || data.win_rate !== undefined) {
                setSimResults(data);
            } else {
                setSimError("Simulation Failed");
            }

        } catch (e) {
            console.error(e);
            setSimError("Connection Error");
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="flex flex-col w-full h-full bg-[#1e1e1e] border-l border-[rgba(255,255,255,0.1)]">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 bg-[#121212] border-b border-[rgba(255,255,255,0.1)] h-12 flex-shrink-0">
                <div className="flex items-center gap-1 h-full">
                    <button
                        onClick={() => setActiveTab('CODE')}
                        className={`flex items-center gap-2 px-4 h-full border-b-2 text-xs font-bold tracking-wider transition-colors
                            ${activeTab === 'CODE'
                                ? 'border-[var(--cyber-blue)] text-white bg-[rgba(255,255,255,0.03)]'
                                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-[rgba(255,255,255,0.01)]'}`}
                    >
                        <Code size={14} />
                        EDITOR
                    </button>
                    <button
                        onClick={() => setActiveTab('CHART')}
                        className={`flex items-center gap-2 px-4 h-full border-b-2 text-xs font-bold tracking-wider transition-colors
                            ${activeTab === 'CHART'
                                ? 'border-[var(--cyber-purple)] text-white bg-[rgba(255,255,255,0.03)]'
                                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-[rgba(255,255,255,0.01)]'}`}
                    >
                        <Activity size={14} />
                        CHART
                    </button>
                </div>

                {activeTab === 'CODE' && (
                    <div className="flex items-center gap-2">
                        {simulating && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[rgba(255,255,0,0.1)] border border-[rgba(255,255,0,0.2)]">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                                <span className="text-[10px] text-yellow-200 tracking-wide font-bold">SIMULATING...</span>
                            </div>
                        )}
                        {simResults && (
                            <div className="flex items-center gap-3 px-3 py-1 rounded bg-[rgba(0,255,136,0.05)] border border-[rgba(0,255,136,0.2)] animate-slideInRight">
                                <div className="flex items-center gap-1.5 border-r border-[rgba(255,255,255,0.1)] pr-3">
                                    <TrendingUp size={12} className="text-[var(--cyber-green)]" />
                                    <span className="text-[10px] text-gray-400">WIN RATE</span>
                                    <span className="text-xs font-bold text-[var(--cyber-green)]">{simResults.win_rate}%</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-400">ROI</span>
                                    <span className={`text-xs font-bold ${parseFloat(simResults.return_pct) >= 0 ? 'text-[var(--cyber-green)]' : 'text-red-400'}`}>
                                        {simResults.return_pct}%
                                    </span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleRun}
                            disabled={simulating}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors font-semibold
                            ${simulating
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-[rgba(0,255,136,0.1)] hover:bg-[rgba(0,255,136,0.2)] text-[var(--cyber-green)]'
                                }`}
                        >
                            <Play size={14} className={simulating ? '' : 'fill-current'} />
                            <span>{simulating ? 'Running...' : 'Simulate'}</span>
                        </button>

                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] text-gray-300 text-xs transition-colors"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="block w-full bg-[#131722]" style={{ height: 'calc(100vh - 48px)' }}>
                {activeTab === 'CODE' ? (
                    <Editor
                        height="100%"
                        defaultLanguage="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value)}
                        options={{
                            minimap: { enabled: true },
                            fontSize: 14,
                            fontFamily: "'Fira Code', 'Consolas', monospace",
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16 },
                            lineNumbers: 'on',
                            roundedSelection: false,
                            cursorStyle: 'line',
                        }}
                    />
                ) : (
                    <div
                        id="tradingview_widget_native"
                        className="h-full w-full"
                        style={{ pointerEvents: isResizing ? 'none' : 'auto' }}
                    >
                        {/* Native Widget Injected Here */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeEditorPanel;
