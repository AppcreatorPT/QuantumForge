import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ children, className }) => {
    const [copied, setCopied] = useState(false);
    const code = String(children).replace(/\n$/, '');
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const isText = language === 'text';

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([code], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `flux_strat_${Date.now()}.pine`;
        document.body.appendChild(element);
        element.click();
    };

    if (!className?.includes('inline') && !isText) {
        return (
            <div className="code-block-container">
                <div className="code-header">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></span>
                        <span className="code-lang" style={{ color: '#8be9fd', fontWeight: 'bold', fontSize: '11px', marginLeft: '8px' }}>{language.toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleDownload} className="copy-btn" title="Download .pine">
                            <Download size={14} color="#bd93f9" />
                        </button>
                        <button onClick={handleCopy} className="copy-btn" title="Copy Code">
                            {copied ? <Check size={14} color="#50fa7b" /> : <Copy size={14} color="#f8f8f2" />}
                        </button>
                    </div>
                </div>
                <SyntaxHighlighter
                    language={language === 'pinescript' || language === 'pine' ? 'javascript' : language}
                    style={dracula}
                    customStyle={{ margin: 0, padding: '20px', background: 'transparent', fontSize: '13px', lineHeight: '1.6' }}
                    wrapLongLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        );
    }

    // For inline code or simple text blocks WITHOUT the header bloat
    if (isText && !className?.includes('inline')) {
        return (
            <div className="text-block-container" style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }}>
                <code style={{ fontFamily: 'monospace', color: '#e0e0e0', whiteSpace: 'pre-wrap' }}>{code}</code>
            </div>
        );
    }

    return <code className="inline-code">{children}</code>;
};

export default CodeBlock;
