import { useState, useRef, useEffect } from 'react';

import { Activity, Image as ImageIcon, X, Sparkles, Send, Wand2 } from 'lucide-react';
import SmartMentionMenu from './SmartMentionMenu';
import StrategyWizard from './StrategyWizard';

const InputArea = ({
    input, setInput,
    image, setImage,
    loading,
    handleSend,
    onReportError
}) => {
    const [showErrorForm, setShowErrorForm] = useState(false);
    const [errorLine, setErrorLine] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const textareaRef = useRef(null);

    // MENTION STATE
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionFilter, setMentionFilter] = useState('');
    const [mentionPos, setMentionPos] = useState({ x: 0, y: 0 });

    // WIZARD STATE
    const [showWizard, setShowWizard] = useState(false);

    const handleWizardGenerate = (prompt) => {
        setInput(prompt);
        // Optionally auto-send? Or let user review. Let's let user review.
        setTimeout(() => textareaRef.current.focus(), 100);
    };

    const submitError = () => {
        onReportError(errorLine, errorMsg);
        setShowErrorForm(false);
        setErrorLine('');
        setErrorMsg('');
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInput(val);

        // Detect @
        const cursorIndex = e.target.selectionStart;
        const textBeforeCursor = val.slice(0, cursorIndex);
        const lastAt = textBeforeCursor.lastIndexOf('@');

        if (lastAt !== -1 && (cursorIndex - lastAt) < 20) {
            // Check if there's a space AFTER the @ (which invalidates it)
            // But we allow typing...
            const query = textBeforeCursor.slice(lastAt + 1);
            if (!query.includes(' ')) { // Only allow single word query
                setMentionOpen(true);
                setMentionFilter(query);

                // Hacky positioning (Better would be using a hidden div mirror)
                // For MVP, placing it above the input box
                const rect = textareaRef.current.getBoundingClientRect();
                setMentionPos({ x: rect.left + 20, y: rect.top });
                return;
            }
        }
        setMentionOpen(false);
    };

    const handleMentionSelect = (symbol) => {
        // Replace @filter with [Symbol]
        const cursorIndex = textareaRef.current.selectionStart;
        const textBeforeCursor = input.slice(0, cursorIndex);
        const lastAt = textBeforeCursor.lastIndexOf('@');

        const prefix = input.slice(0, lastAt);
        const suffix = input.slice(cursorIndex);

        const newVal = `${prefix}[${symbol}]${suffix}`; // Inject formatted symbol
        setInput(newVal);
        setMentionOpen(false);

        // Re-focus
        setTimeout(() => textareaRef.current.focus(), 10);
    };

    return (
        <div className="input-area">
            {/* ERROR REPORTING FORM */}
            {showErrorForm && (
                <div className="glass-panel" style={{
                    maxWidth: '1000px', margin: '0 auto 10px auto',
                    border: '1px solid #ff5555', borderRadius: '12px', padding: '20px',
                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <label style={{ fontSize: '11px', color: '#ff5555', fontWeight: 'bold' }}>LINE(S)</label>
                        <input type="text" value={errorLine} onChange={e => setErrorLine(e.target.value)} placeholder="10-15"
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #ff5555', borderRadius: '6px', padding: '8px', color: '#fff' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 4 }}>
                        <label style={{ fontSize: '11px', color: '#ff5555', fontWeight: 'bold' }}>ERROR MESSAGE</label>
                        <input type="text" value={errorMsg} onChange={e => setErrorMsg(e.target.value)} placeholder="Error details..."
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #ff5555', borderRadius: '6px', padding: '8px', color: '#fff' }} />
                    </div>
                    <button onClick={submitError} style={{ marginTop: '20px', background: '#ff5555', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>FIX</button>
                </div>
            )}

            {/* IMAGE PREVIEW UI */}
            {image && (
                <div style={{
                    maxWidth: '1000px', margin: '0 auto 10px auto',
                    display: 'flex', alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '8px 12px', borderRadius: '8px',
                    border: '1px solid var(--border-glass)'
                }}>
                    <ImageIcon size={14} style={{ marginRight: '8px', color: 'var(--neon-green)' }} />
                    <span style={{ fontSize: '12px', color: '#fff', marginRight: '10px', flex: 1 }}>Image Attached</span>
                    <button onClick={() => setImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 }}>
                        <X size={14} color="#ff5f56" />
                    </button>
                </div>
            )}

            {/* MAIN INPUT */}
            <div className="input-container glass-panel">
                <button onClick={() => setShowWizard(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--cyber-purple)', marginRight: '4px' }} title="Strategy Wizard">
                    <Wand2 size={20} />
                </button>
                <button onClick={() => setShowErrorForm(!showErrorForm)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: showErrorForm ? '#ff5555' : 'var(--text-dim)' }} title="Report Error">
                    <Activity size={20} />
                </button>
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(input);
                        }
                    }}
                    onPaste={(e) => {
                        const items = e.clipboardData.items;
                        for (let i = 0; i < items.length; i++) {
                            if (items[i].type.indexOf('image') !== -1) {
                                const blob = items[i].getAsFile();
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    setImage(event.target.result);
                                };
                                reader.readAsDataURL(blob);
                            }
                        }
                    }}
                    placeholder="Ask Cortex (or Paste Image)..."
                    className="chat-input"
                />
                <button onClick={() => handleSend(input)} className="send-btn" disabled={loading}>
                    {loading ? <Sparkles size={18} className="spin" /> : <Send size={18} />}
                </button>
            </div>
            <div className="footer-text" style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-mute)', marginTop: '8px' }}>
                QuantForge AI v4.0 | Powered by Cortex
            </div>

            {mentionOpen && (
                <SmartMentionMenu
                    filter={mentionFilter}
                    onSelect={handleMentionSelect}
                    position={mentionPos}
                />
            )}

            {/* WIZARD MODAL */}
            {showWizard && (
                <StrategyWizard
                    onClose={() => setShowWizard(false)}
                    onGenerate={handleWizardGenerate}
                />
            )}
        </div>
    );
};

export default InputArea;
