import React, { useRef, useEffect } from 'react';
import { User, Bot, Cpu, ShieldCheck, Zap, FileCode } from 'lucide-react';
import AssistantMessage from './AssistantMessage';
import InputArea from './InputArea';
import DropZone from './DropZone';

const SUGGESTIONS = [
    { icon: <Cpu size={24} />, title: 'Deep Strategy', prompt: 'Create a multi-frame trend strategy with ADX filter.' },
    { icon: <ShieldCheck size={24} />, title: 'Risk Guard', prompt: 'Add dynamic Position Sizing based on ATR volatility.' },
    { icon: <Zap size={24} />, title: 'Quick Fix', prompt: 'Why is my "strategy.exit" not triggering correctly?' },
    { icon: <FileCode size={24} />, title: 'V6 Upgrade', prompt: 'Convert this v5 script to strictly typed v6 code.' }
];

const ChatPanel = ({
    messages,
    loading,
    input,
    setInput,
    image,
    setImage,
    handleSend,
    onReportError,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop
}) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => { scrollToBottom(); }, [messages, loading]);

    return (
        <div
            className="h-full flex flex-col relative"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <DropZone visible={isDragging} />

            {/* MESSAGE LIST AREA */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                        <div className="text-center mb-8 animate-fade-in-up">
                            <div className="inline-flex px-3 py-1 rounded-full bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] text-[var(--cyber-purple)] text-[11px] font-bold tracking-widest uppercase mb-4">
                                Ready to Forge
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-3">QuantForge AI</h2>
                            <p className="text-[var(--text-dim)] text-base">Institutional Grade Pine Script Architect.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                            {SUGGESTIONS.map((card, idx) => (
                                <div
                                    key={idx}
                                    className="suggestion-card group"
                                    onClick={() => handleSend(card.prompt)}
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    <div className="card-icon group-hover:scale-110 transition-transform">{card.icon}</div>
                                    <h3 className="card-title">{card.title}</h3>
                                    <p className="card-prompt">{card.prompt}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto w-full space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message-row ${msg.role}`}>
                                <div className={`flex gap-4 w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* AVATAR */}
                                    <div className={`avatar ${msg.role} flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-[#333]' : 'bg-[rgba(0,255,136,0.1)]'}`}>
                                        {msg.role === 'user' ? <User size={16} color="#fff" /> : <Bot size={16} color="var(--cyber-green)" />}
                                    </div>

                                    {/* BUBBLE */}
                                    <div className={`message-bubble ${msg.role === 'user' ? 'user bg-[#2a2a2a]' : 'flex-1 min-w-0'}`}>
                                        {msg.role === 'user' ? (
                                            <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                        ) : (
                                            <AssistantMessage content={msg.content} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* LOADING STATE */}
                        {loading && (
                            <div className="message-row assistant">
                                <div className="flex gap-4">
                                    <div className="avatar assistant flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(0,255,136,0.1)] flex items-center justify-center">
                                        <Bot size={16} color="var(--cyber-green)" />
                                    </div>
                                    <div className="glass-panel px-6 py-4 rounded-xl border-b-0 rounded-bl-none">
                                        <div className="scanner-container">
                                            <div className="scanner-bar delay-0"></div>
                                            <div className="scanner-bar delay-[0.2s]"></div>
                                            <div className="scanner-bar delay-[0.4s]"></div>
                                            <span className="scanner-text ml-3 text-xs tracking-widest text-[var(--cyber-green)]">PROCESSING...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* INPUT AREA */}
            <div className="p-4 bg-[rgba(10,10,12,0.8)] backdrop-blur-md border-t border-[rgba(255,255,255,0.05)]">
                <div className="max-w-3xl mx-auto">
                    <InputArea
                        input={input}
                        setInput={setInput}
                        image={image}
                        setImage={setImage}
                        loading={loading}
                        handleSend={handleSend}
                        onReportError={onReportError}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;
