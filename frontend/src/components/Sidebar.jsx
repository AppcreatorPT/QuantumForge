import { Sparkles, Plus, MessageSquare, Trash2 } from 'lucide-react';

const Sidebar = ({ sessions, currentSessionId, createNewSession, setCurrentSessionId, deleteSession }) => {
    return (
        <div className="sidebar">
            <h1 className="logo-text">
                <Sparkles size={20} className="logo-highlight" /> QuantForge<span className="logo-highlight">AI</span>
            </h1>
            <button onClick={createNewSession} className="new-chat-btn">
                <Plus size={18} /> New Strategy
            </button>
            <div className="sessions-list" style={{ flex: 1, overflowY: 'auto', marginTop: '10px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-mute)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Strategy Vault</div>
                {sessions.map(s => (
                    <div key={s.id} onClick={() => setCurrentSessionId(s.id)}
                        className={`session-item ${currentSessionId === s.id ? 'active' : ''}`}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflow: 'hidden' }}>
                            <MessageSquare size={14} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{s.title}</span>
                        </div>
                        {sessions.length > 1 && (
                            <Trash2 size={12} className="delete-icon" onClick={(e) => deleteSession(e, s.id)} style={{ opacity: 0.5 }} />
                        )}
                    </div>
                ))}
            </div>
            <div className="status-panel">
                <div className="status-item"><div className="status-dot online"></div><span>System Operational</span></div>
                <div className="status-item"><div className="status-dot online" style={{ background: 'var(--cyber-purple)', boxShadow: '0 0 10px var(--cyber-purple)' }}></div><span>v4.0 Gold</span></div>
            </div>
        </div>
    );
};

export default Sidebar;
