import { useState, useRef, useEffect } from 'react';
import { Cpu, ShieldCheck, Zap, FileCode, User, Bot, Activity } from 'lucide-react';
import Sidebar from './components/Sidebar';
import CodeBlock from './components/CodeBlock'; // Added based on instruction's code edit snippet
import AssistantMessage from './components/AssistantMessage';
import InputArea from './components/InputArea';
import ParticleBackground from './components/ParticleBackground';
import DropZone from './components/DropZone';

// SUGGESTIONS DATA
const SUGGESTIONS = [
  { icon: <Cpu size={24} />, title: 'Deep Strategy', prompt: 'Create a multi-frame trend strategy with ADX filter.' },
  { icon: <ShieldCheck size={24} />, title: 'Risk Guard', prompt: 'Add dynamic Position Sizing based on ATR volatility.' },
  { icon: <Zap size={24} />, title: 'Quick Fix', prompt: 'Why is my "strategy.exit" not triggering correctly?' },
  { icon: <FileCode size={24} />, title: 'V6 Upgrade', prompt: 'Convert this v5 script to strictly typed v6 code.' }
];

function App() {
  // --- STATE WITH PERSISTENCE ---
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null); // Base64 Image
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Lazy Load Sessions from LocalStorage
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('quantforge_sessions');
    if (saved) {
      return JSON.parse(saved);
    }
    return [{ id: Date.now(), title: 'New Strategy', messages: [] }];
  });

  // Lazy Load Current Session ID
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const saved = localStorage.getItem('quantforge_current_id');
    if (saved) {
      return Number(saved);
    }
    return sessions[0].id; // Fallback to first session
  });

  const messagesEndRef = useRef(null);

  // --- EFFECT: PERSIST TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem('quantforge_sessions', JSON.stringify(sessions));
    localStorage.setItem('quantforge_current_id', currentSessionId);
  }, [sessions, currentSessionId]);

  // --- EFFECT: SCROLL ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  // --- EFFECT: LOAD SESSION MESSAGES ---
  useEffect(() => {
    const session = sessions.find(s => s.id === currentSessionId);
    if (session) {
      setMessages(session.messages);
    } else if (sessions.length > 0) {
      // Fallback if current ID invalid
      setMessages(sessions[0].messages);
      setCurrentSessionId(sessions[0].id);
    }
  }, [currentSessionId, sessions]);

  // --- EFFECT: STRATEGY ACTIONS (REMIX) ---
  useEffect(() => {
    const handleAction = (e) => {
      const { type, title } = e.detail;
      let prompt = "";
      if (type === 'OPTIMIZE') prompt = `Take the strategy "${title}" and OPTIMIZE parameters for higher Win Rate. Run a Sandbox Simulation to verify.`;
      if (type === 'REMIX') prompt = `Create a creative VARIATION of the strategy "${title}". Add a new filter or logic twist.`;
      if (type === 'AGGRESSIVE') prompt = `Make the strategy "${title}" MORE AGGRESSIVE. Increase leverage/risk, tighten stops, target higher ROI.`;

      if (prompt) handleSend(prompt);
    };

    window.addEventListener('strategy-action', handleAction);
    return () => window.removeEventListener('strategy-action', handleAction);
  }, [messages, sessions]); // Re-bind if state changes relevantly, though handleSend is closure-dependent

  // --- ACTIONS ---
  const createNewSession = () => {
    const newId = Date.now();
    const newSession = { id: newId, title: 'New Strategy', messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
  };

  const deleteSession = (e, id) => {
    e.stopPropagation();
    if (sessions.length === 1) {
      setSessions([{ id: Date.now(), title: 'New Strategy', messages: [] }]);
      return;
    }
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    if (currentSessionId === id) setCurrentSessionId(newSessions[0].id);
  };

  const updateSessionTitle = (id, firstMessage) => {
    const title = firstMessage.split(' ').slice(0, 4).join(' ') + '...';
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: title } : s));
  };

  const handleErrorFix = (line, msg) => {
    const command = `FIX_ERROR: Line ${line} - ${msg}`;
    handleSend(command);
  };

  const handleSend = async (text = input) => {
    if (!text.trim() && !image) return;

    const newMsg = { role: 'user', content: text, image: image }; // Store image in local history
    const updatedMessages = [...messages, newMsg];

    setMessages(updatedMessages);
    setInput('');
    setImage(null); // Clear image after send
    setLoading(true);

    // Update session title if first message
    if (messages.length === 0) {
      updateSessionTitle(currentSessionId, text || "Image Analysis");
    }

    try {
      // Send History for Context-Aware Fixes (and Image if present)
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: updatedMessages, image: newMsg.image })
      });

      const data = await response.json();

      let botContent = data.response;
      if (!botContent && data.error) {
        botContent = `⚠️ **System Error**: ${data.error}`;
      } else if (!botContent) {
        botContent = "⚠️ **Unknown Error**: Received empty response from Cortex.";
      }

      const botMsg = { role: 'assistant', content: botContent };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // Persist to session
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: finalMessages } : s));

    } catch (error) {
      console.error(error);
      const errorMsg = { role: 'assistant', content: "⚠️ **Connection Error**: Cortex is unreachable. Is the backend running?" };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // --- DRAG & DROP HANDLERS ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setImage(event.target.result);
        };
        reader.readAsDataURL(blob);
        return; // processed
      }
    }
  };

  return (
    <div className="app-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ParticleBackground />
      <DropZone visible={isDragging} />
      {/* SIDEBAR */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        createNewSession={createNewSession}
        setCurrentSessionId={setCurrentSessionId}
        deleteSession={deleteSession}
      />

      {/* MAIN CHAT */}
      <div className="chat-area">
        {messages.length === 0 ? (
          <div className="welcome-container">
            <div className="welcome-header" style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: '20px', background: 'hsla(270, 85%, 70%, 0.1)', color: 'var(--cyber-purple)', fontSize: '11px', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '1px', border: '1px solid hsla(270, 85%, 70%, 0.2)', textTransform: 'uppercase' }}>
                Ready to Forge
              </div>
              <h2 className="text-gradient" style={{ fontSize: '48px', marginBottom: '10px' }}>QuantForge AI</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '16px' }}>Institutional Grade Pine Script Architect.</p>
            </div>
            <div className="cards-grid" style={{ marginTop: '40px' }}>
              {SUGGESTIONS.map((card, idx) => (
                <div key={idx} className="suggestion-card" onClick={() => handleSend(card.prompt)}>
                  <div className="card-icon">{card.icon}</div>
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-prompt">{card.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-row ${msg.role}`}>
                  <div className="message-content-wrapper" style={{ display: 'flex', gap: '16px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', width: '100%' }}>
                    <div className={`avatar ${msg.role}`}>
                      {msg.role === 'user' ? <User size={20} color="#fff" /> : <Bot size={20} color="var(--cyber-green)" />}
                    </div>
                    <div className={`message-bubble ${msg.role === 'user' ? 'user' : ''}`}>
                      {msg.role === 'user' ? (
                        <div>{msg.content}</div>
                      ) : (
                        <AssistantMessage content={msg.content} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message-row assistant">
                  <div className="message-content-wrapper" style={{ display: 'flex', gap: '16px' }}>
                    <div className="avatar assistant"><Bot size={20} color="var(--cyber-green)" /></div>
                    <div className="glass-panel" style={{ padding: '12px 24px', borderRadius: '12px', borderBottomLeftRadius: '4px' }}>
                      <div className="scanner-container">
                        <div className="scanner-bar" style={{ animationDelay: '0s' }}></div>
                        <div className="scanner-bar" style={{ animationDelay: '0.2s' }}></div>
                        <div className="scanner-bar" style={{ animationDelay: '0.4s' }}></div>
                        <span className="scanner-text" style={{ marginLeft: '12px' }}>PROCESSING...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* INPUT AREA */}
        <InputArea
          input={input}
          setInput={setInput}
          image={image}
          setImage={setImage}
          loading={loading}
          handleSend={handleSend}
          onReportError={handleErrorFix}
        />
      </div>
    </div>
  );
}

export default App;
