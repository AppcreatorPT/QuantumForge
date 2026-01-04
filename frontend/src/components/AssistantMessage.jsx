import ReactMarkdown from 'react-markdown';
import { Sparkles, FileCode, ListChecks, Check } from 'lucide-react';
import CodeBlock from './CodeBlock';
import StrategyCard from './StrategyCard';

const AssistantMessage = ({ content }) => {
    // safety guard
    if (!content) return null;

    // 1. SPLIT CONTENT
    const parts = { analysis: "", code: "", manual: "" };

    const analysisMatch = content.match(/1\.\s*\*\*Análise QuantForge\*\*\s*\(PT-PT\)\s*([\s\S]*?)(?=2\.\s*\*\*O Código\*\*|$)/i);
    const codeMatch = content.match(/2\.\s*\*\*O Código\*\*\s*\(Pine Script v6\)\s*([\s\S]*?)(?=3\.\s*\*\*Manual|$)/i);
    const manualMatch = content.match(/3\.\s*\*\*Manual de Operações\*\*\s*\(Bullets\)\s*([\s\S]*)/i);

    if (!analysisMatch && !codeMatch) {
        return (
            <ReactMarkdown components={{ code: CodeBlock }}>{content}</ReactMarkdown>
        );
    }

    if (analysisMatch) parts.analysis = analysisMatch[1].trim();
    if (codeMatch) parts.code = codeMatch[1].trim();
    if (manualMatch) parts.manual = manualMatch[1].trim();

    // 2. EXTRACT METRICS (Simple Regex)
    const extractMetrics = (text) => {
        const wr = text.match(/Win Rate[:\s]*([\d\.]+%?)/i);
        const pf = text.match(/Profit Factor[:\s]*([\d\.]+)/i);
        const np = text.match(/Net Profit[:\s]*([\$€£]?[\d\.\,]+%?)/i);
        if (wr || pf) {
            return {
                winRate: wr ? wr[1] : null,
                profitFactor: pf ? pf[1] : null,
                netProfit: np ? np[1] : null
            };
        }
        return null;
    };
    const metrics = extractMetrics(content);

    return (
        <div style={{ width: '100%', maxWidth: '850px' }}>
            {/* CARD ALWAYS ON TOP IF METRICS FOUND */}
            {metrics && (
                <StrategyCard
                    winRate={metrics.winRate}
                    profitFactor={metrics.profitFactor}
                    netProfit={metrics.netProfit}
                />
            )}
            {parts.analysis && (
                <div className="analysis-panel">
                    <div className="analysis-header"><Sparkles size={14} /> Insight QuantForge</div>
                    <ReactMarkdown components={{ code: CodeBlock }}>{parts.analysis}</ReactMarkdown>
                </div>
            )}
            {parts.code && (
                <div className="code-hero-container">
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--cyber-blue)', fontSize: '12px', fontWeight: 'bold' }}>
                            <FileCode size={14} /> PINE SCRIPT v6
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-mute)' }}>STRICT MODE</div>
                    </div>
                    <div style={{ margin: '-20px 0' }}>
                        <ReactMarkdown components={{ code: CodeBlock }}>{parts.code}</ReactMarkdown>
                    </div>
                </div>
            )}
            {parts.manual && (
                <div className="manual-widget">
                    <div className="manual-header"><ListChecks size={16} /> Protocolo Operacional</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {parts.manual.split('\n').filter(line => line.trim().length > 0).map((line, idx) => {
                            const cleanLine = line.replace(/^-\s*/, '').replace(/^\*\s*/, '');
                            if (!cleanLine) return null;
                            return (
                                <div key={idx} className="manual-item">
                                    <div className="manual-check"><Check size={10} strokeWidth={4} /></div>
                                    <div dangerouslySetInnerHTML={{ __html: cleanLine.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-main)">$1</strong>') }}></div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssistantMessage;
