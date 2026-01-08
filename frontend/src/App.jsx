import { useState, useRef, useEffect } from 'react';
import Split from 'react-split';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import CodeEditorPanel from './components/CodeEditorPanel';
import ParticleBackground from './components/ParticleBackground';

function App() {
  // --- STATE WITH PERSISTENCE ---
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeCode, setActiveCode] = useState('// Pine Script v6 Editor Ready...');
  const [activeSymbol, setActiveSymbol] = useState("BINANCE:BTCUSDT"); // Default for Chart & Sim

  // Lazy Load Sessions from LocalStorage
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('quantforge_sessions');
    if (saved) {
      return JSON.parse(saved);
    }
    return [{ id: Date.now(), title: 'New Strategy', messages: [] }];
  });

  const [currentSessionId, setCurrentSessionId] = useState(() => {
    const saved = localStorage.getItem('quantforge_current_id');
    if (saved) {
      return Number(saved);
    }
    return sessions[0].id;
  });

  // --- EFFECT: PERSIST TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem('quantforge_sessions', JSON.stringify(sessions));
    localStorage.setItem('quantforge_current_id', currentSessionId);
  }, [sessions, currentSessionId]);

  // --- EFFECT: LOAD SESSION MESSAGES ---
  useEffect(() => {
    const session = sessions.find(s => s.id === currentSessionId);
    if (session) {
      setMessages(session.messages);
      // Try to find the latest code in history
      const lastCodeMsg = [...session.messages].reverse().find(m => m.role === 'assistant' && typeof m.code === 'string');
      if (lastCodeMsg) setActiveCode(lastCodeMsg.code);
    } else if (sessions.length > 0) {
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
  }, [messages, sessions]);

  // --- ACTIONS ---
  const createNewSession = () => {
    const newId = Date.now();
    const newSession = { id: newId, title: 'New Strategy', messages: [] };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
    setActiveCode('// New Session Ready');
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

  // --- MAIN SEND LOGIC ---
  const handleSend = async (text = input) => {
    if (!text.trim() && !image) return;

    // Detect Symbol Change (@ETH)
    const match = text.match(/@([a-zA-Z0-9]+)/);
    if (match) {
      const symbol = match[1].toUpperCase();
      // Basic mapping logic (could be improved later)
      const fullSymbol = `BINANCE:${symbol}USDT`;
      setActiveSymbol(fullSymbol);
    }

    const newMsg = { role: 'user', content: text, image: image };
    const updatedMessages = [...messages, newMsg];

    setMessages(updatedMessages);
    setInput('');
    setImage(null);
    setLoading(true);

    if (messages.length === 0) {
      updateSessionTitle(currentSessionId, text || "Image Analysis");
    }

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: updatedMessages, image: newMsg.image })
      });

      const data = await response.json();

      let botContent = data.response; // Legacy string (Chat Panel uses this for rendering text)
      let botCode = null;

      if (!botContent && data.error) {
        botContent = `⚠️ **System Error**: ${data.error}`;
      } else if (!botContent) {
        botContent = "⚠️ **Unknown Error**: Received empty response from Cortex.";
      }

      // Phase 3: Structured Data Handling
      if (data.data && data.data.code) {
        botCode = data.data.code;
        setActiveCode(botCode); // UPDATE EDITOR AUTOMATICALLY
      }

      const botMsg = {
        role: 'assistant',
        content: botContent,
        code: botCode, // Store code in history meta-data
        data: data.data // Pass full structured object for clean rendering
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

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
        reader.onload = (event) => { setImage(event.target.result); };
        reader.readAsDataURL(blob);
        return;
      }
    }
  };

  return (
    <div className="app-container flex h-screen w-screen overflow-hidden bg-[var(--bg-deep)] text-white">
      <ParticleBackground />

      {/* SIDEBAR (Leftmost) */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        createNewSession={createNewSession}
        setCurrentSessionId={setCurrentSessionId}
        deleteSession={deleteSession}
      />

      {/* SPLIT SCREEN AREA: Explicit Width Constraint */}
      <div
        className="h-full relative z-10 overflow-hidden min-w-0"
        style={{ width: 'calc(100vw - 280px)' }} // HARD FIX: Force exact remaining width
      >
        <Split
          className="split-container"
          sizes={[35, 65]}
          minSize={300}
          expandToMin={false}
          gutterSize={6}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
        >
          {/* LEFT: CHAT PANEL */}
          <div className="split-panel flex flex-col h-full w-full min-w-0">
            <ChatPanel
              messages={messages}
              loading={loading}
              input={input}
              setInput={setInput}
              image={image}
              setImage={setImage}
              handleSend={handleSend}
              onReportError={handleErrorFix}
              isDragging={isDragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          </div>

          {/* RIGHT: EDITOR PANEL (Code + Chart + Sim) */}
          <div className="split-panel flex flex-col h-full w-full min-w-0">
            <CodeEditorPanel
              code={activeCode}
              setCode={setActiveCode}
              activeSymbol={activeSymbol}
              isResizing={isDragging}
            />
          </div>
        </Split>
      </div>
    </div>
  );
}

export default App;
