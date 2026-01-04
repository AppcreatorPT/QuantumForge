import React, { useState, useEffect } from 'react';
import { X, Wand2, ChevronRight, ChevronLeft, Info, Check, BrainCircuit, Activity, ShieldAlert } from 'lucide-react';

const StrategyWizard = ({ onClose, onGenerate }) => {
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState('forward'); // for animation class

    // BUILDER STATE (More detailed now)
    const [build, setBuild] = useState({
        type: 'Trend Following',
        indicators: [], // Array of objects { name: 'RSI', params: { length: 14 } }
        exit: 'Fixed Target',
        exitParams: { rr: 2.0 },
        risk: 'Fixed %',
        riskParams: { value: 1.0 }
    });

    // Helper to add/remove indicator
    const toggleIndicator = (name, defaultParams) => {
        const exists = build.indicators.find(i => i.name === name);
        if (exists) {
            setBuild({ ...build, indicators: build.indicators.filter(i => i.name !== name) });
        } else {
            setBuild({ ...build, indicators: [...build.indicators, { name, params: defaultParams }] });
        }
    };

    // Helper to update param of an indicator
    const updateIndicatorParam = (name, paramKey, val) => {
        setBuild({
            ...build,
            indicators: build.indicators.map(i =>
                i.name === name ? { ...i, params: { ...i.params, [paramKey]: val } } : i
            )
        });
    };

    const nextStep = () => { setDirection('forward'); setStep(s => s + 1); };
    const prevStep = () => { setDirection('back'); setStep(s => s - 1); };

    // LIVE SENTENCE GENERATOR
    const generateSentence = () => {
        let text = `I want a **${build.type}** strategy`;

        if (build.indicators.length > 0) {
            const indText = build.indicators.map(i => {
                // Formatting: RSI (14)
                const params = Object.values(i.params).join(', ');
                return `${i.name}${params ? ` (${params})` : ''}`;
            }).join(' + ');
            text += ` using **${indText}**`;
        } else {
            text += ` using **Price Action**`;
        }

        text += `. Exit via **${build.exit}**`;
        text += ` managing risk with **${build.risk}** model.`;
        return text;
    };

    const handleFinalGenerate = () => {
        const prompt = `${generateSentence()} 
        
        STRICT REQUIREMENTS:
        - Use Pine Script v6.
        - Add comments explaining every logic block.
        - Ensure ${build.risk} logic is implemented correctly.
        - Cite 'QuantForge Community' logic where applicable.`;

        onGenerate(prompt);
        onClose();
    };

    // --- RENDERERS ---

    const renderTooltip = (text) => (
        <div className="wizard-tooltip-trigger" style={{ position: 'relative', display: 'inline-flex', marginLeft: '5px' }}>
            <Info size={12} color="var(--text-dim)" />
            <div className="wizard-tooltip">{text}</div>
        </div>
    );

    const renderStep1 = () => (
        <div className={direction === 'forward' ? 'wizard-step-enter' : 'wizard-step-back'}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <BrainCircuit size={40} color="var(--cyber-purple)" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: 0, fontSize: '20px' }}>What is the Core Concept?</h3>
                <p style={{ color: '#888', fontSize: '13px' }}>Define the market philosophy.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {['Trend Following', 'Mean Reversion', 'Breakout', 'Scalping'].map(type => (
                    <div key={type} onClick={() => setBuild({ ...build, type })}
                        className={`glass-panel hover-scale`}
                        style={{
                            padding: '15px', borderRadius: '12px', cursor: 'pointer',
                            border: build.type === type ? '1px solid var(--cyber-green)' : '1px solid transparent',
                            background: build.type === type ? 'hsla(145, 95%, 65%, 0.1)' : 'transparent'
                        }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: build.type === type ? '#fff' : '#aaa' }}>{type}</div>
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                            {type === 'Trend Following' && "Ride the wave. Buy high, sell higher."}
                            {type === 'Mean Reversion' && "Bet against extremes. Elastic effect."}
                            {type === 'Breakout' && "Explosion from consolidation."}
                            {type === 'Scalping' && "Fast, small profits. High frequency."}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className={direction === 'forward' ? 'wizard-step-enter' : 'wizard-step-back'}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Activity size={40} color="var(--cyber-blue)" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: 0, fontSize: '20px' }}>The Logic Engine</h3>
                <p style={{ color: '#888', fontSize: '13px' }}>Select indicators and tune them.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                {[
                    { name: 'RSI', param: { length: 14 } },
                    { name: 'MACD', param: { fast: 12, slow: 26 } },
                    { name: 'EMA Cross', param: { fast: 9, slow: 21 } },
                    { name: 'Bollinger', param: { len: 20, mult: 2 } },
                    { name: 'SuperTrend', param: { factor: 3 } },
                    { name: 'ATR', param: { len: 14 } }
                ].map(item => {
                    const isSelected = build.indicators.find(i => i.name === item.name);
                    return (
                        <div key={item.name} onClick={() => toggleIndicator(item.name, item.param)}
                            style={{
                                padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', textAlign: 'center',
                                border: isSelected ? '1px solid var(--cyber-blue)' : '1px solid rgba(255,255,255,0.1)',
                                background: isSelected ? 'rgba(0, 216, 255, 0.1)' : 'rgba(0,0,0,0.2)',
                                color: isSelected ? '#fff' : '#888'
                            }}>
                            {item.name}
                        </div>
                    );
                })}
            </div>

            {/* PARAM TUNING SECTION */}
            {build.indicators.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', marginBottom: '10px' }}>Tune Parameters</div>
                    {build.indicators.map(ind => (
                        <div key={ind.name} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--cyber-blue)' }}>{ind.name}</span>
                                <span style={{ color: '#888' }}>Length: {ind.params.length || ind.params.len || ind.params.fast || 'Default'}</span>
                            </div>
                            {/* DEMO SLIDER FOR LENGTH/FAST if applicable */}
                            {(ind.params.length !== undefined || ind.params.len !== undefined) && (
                                <input type="range" min="2" max="50"
                                    className="wizard-input-range"
                                    value={ind.params.length || ind.params.len}
                                    onChange={(e) => updateIndicatorParam(ind.name, ind.params.length ? 'length' : 'len', parseInt(e.target.value))}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className={direction === 'forward' ? 'wizard-step-enter' : 'wizard-step-back'}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <ShieldAlert size={40} color="var(--cyber-green)" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: 0, fontSize: '20px' }}>Risk Management</h3>
                <p style={{ color: '#888', fontSize: '13px' }}>Protect the capital.</p>
            </div>

            {/* EXIT STRATEGY */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Exit Logic</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                    {['Fixed Target', 'Trailing Stop', 'Indicator Reversal'].map(ex => (
                        <div key={ex} onClick={() => setBuild({ ...build, exit: ex })}
                            style={{
                                padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
                                background: build.exit === ex ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: build.exit === ex ? '1px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                                color: build.exit === ex ? '#fff' : '#666'
                            }}>{ex}</div>
                    ))}
                </div>
            </div>

            {/* POSITION SIZING */}
            <div>
                <label style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>
                    Position Sizing {renderTooltip("How much to bet per trade.")}
                </label>
                <div style={{ marginTop: '8px' }}>
                    <select value={build.risk} onChange={(e) => setBuild({ ...build, risk: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid #333' }}>
                        <option>Fixed % Equity</option>
                        <option>Fixed Lot Size</option>
                        <option>Kelly Criterion (Advanced)</option>
                    </select>
                </div>
                {build.risk === 'Kelly Criterion (Advanced)' && (
                    <div style={{ marginTop: '5px', fontSize: '11px', color: 'var(--cyber-green)' }}>
                        ⚠️ Adapts size based on win probability. High Risk/Reward.
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className={direction === 'forward' ? 'wizard-step-enter' : 'wizard-step-back'}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Wand2 size={40} color="#fff" style={{ marginBottom: '10px' }} />
                <h3 style={{ margin: 0, fontSize: '20px' }}>Blueprint Ready</h3>
                <p style={{ color: '#888', fontSize: '13px' }}>Review your "Active Sentence".</p>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)' }}>
                {/* ACTIVE SENTENCE DISPLAY */}
                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#ddd' }} dangerouslySetInnerHTML={{
                    __html: generateSentence().replace(/\*\*(.*?)\*\*/g, '<span style="color: var(--cyber-green); font-weight:bold;">$1</span>')
                }} />
            </div>

            <div style={{ marginTop: '30px' }}>
                <button onClick={handleFinalGenerate}
                    className="hover-scale"
                    style={{
                        width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                        background: 'linear-gradient(90deg, var(--cyber-purple), var(--cyber-blue))',
                        color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                        boxShadow: '0 0 20px rgba(138, 43, 226, 0.4)'
                    }}>
                    <Wand2 size={20} />
                    MANIFEST STRATEGY
                </button>
            </div>
        </div>
    );

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <div className="glass-panel" style={{
                width: '500px', minHeight: '500px', padding: '30px', borderRadius: '24px',
                border: '1px solid var(--border-glass)',
                background: 'linear-gradient(145deg, rgba(20,20,30,0.95), rgba(10,10,15,0.98))',
                boxShadow: '0 0 50px rgba(138, 43, 226, 0.15)',
                position: 'relative', display: 'flex', flexDirection: 'column'
            }}>
                {/* HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} style={{
                                width: '30px', height: '4px', borderRadius: '2px',
                                background: step >= s ? 'var(--cyber-purple)' : '#333',
                                transition: 'all 0.3s'
                            }} />
                        ))}
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X color="#666" /></button>
                </div>

                {/* CONTENT AREA */}
                <div style={{ flex: 1 }}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </div>

                {/* FOOTER NAV */}
                {step < 4 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {step > 1 ? (
                            <button onClick={prevStep} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <ChevronLeft size={16} /> Back
                            </button>
                        ) : <div></div>}

                        <button onClick={nextStep}
                            style={{
                                background: 'var(--text-main)', color: '#000', border: 'none',
                                padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '5px'
                            }}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StrategyWizard;
