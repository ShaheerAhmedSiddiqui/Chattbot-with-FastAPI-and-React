import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/client';
import { 
  MessageSquareCode, Plus, LogOut, Send, 
  Bot, User, MessageSquare, Loader2, Trash2,
  Sparkles, ShieldCheck, Zap, Layers, ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Section reference hooks for landing page scroll targeting
  const homeRef = useRef(null);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (elementRef) => {
    elementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const fetchSessions = async (selectFirst = false) => {
    try {
      const response = await API.get('/sessions/');
      setSessions(response.data);
      if (selectFirst && response.data.length > 0 && !currentSessionId) {
        // Keeps user on home screen dashboard on initial launch instead of auto-forcing into chat #1
        setCurrentSessionId(null);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const fetchMessages = async (sessionId) => {
    if (!sessionId) return;
    setIsMessagesLoading(true);
    try {
      const response = await API.get(`/messages/${sessionId}`);
      setMessages(response.data);
    } catch (err) {
      console.error("Error fetching dialogue logs:", err);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(false);
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  const handleCreateSession = async () => {
    try {
      const title = `Chat session #${sessions.length + 1}`;
      const response = await API.post('/sessions/', { title });
      setSessions([response.data, ...sessions]);
      setCurrentSessionId(response.data.id);
    } catch (err) {
      console.error("Failed to initialize session:", err);
    }
  };

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    try {
      await API.delete(`/sessions/${sessionId}`);
      const updated = sessions.filter(s => s.id !== sessionId);
      setSessions(updated);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(updated.length > 0 ? updated[0].id : null);
      }
    } catch (err) {
      console.error("Failed deleting session context:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentSessionId || isSending) return;

    const userText = inputMessage;
    setInputMessage('');
    setIsSending(true);

    const optimisticUserMsg = {
      id: Date.now(),
      session_id: currentSessionId,
      sender: 'USER',
      content: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticUserMsg]);

    try {
      const response = await API.post('/messages/', {
        session_id: currentSessionId,
        content: userText
      });
      setMessages(prev => [...prev, response.data]);
    } catch (err) {
      console.error("Communication failure with AI engine:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="flex h-full w-80 flex-col border-r border-slate-900 bg-slate-900/40 backdrop-blur-sm">
        {/* Brand Header / Home Button */}
        <div 
          onClick={() => setCurrentSessionId(null)}
          className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-900 cursor-pointer hover:bg-slate-900/20 transition"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md">
            <MessageSquareCode className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">NexusAI Dashboard</span>
        </div>

        {/* Action Control: New Thread */}
        <div className="p-4">
          <button 
            onClick={handleCreateSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800/60 hover:border-slate-700/80 py-2.5 text-xs font-medium tracking-wide transition duration-150 hover:bg-slate-800/40 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4 text-indigo-400" />
            New Conversation
          </button>
        </div>

        {/* Dynamic Context History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          {isSessionsLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-600" /></div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-xs text-slate-600 pt-8 font-mono">No active threads logged.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={`group flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-medium cursor-pointer transition duration-150 ${
                  currentSessionId === session.id 
                    ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border-l-2 border-indigo-500 text-slate-200' 
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className={`h-4 w-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-indigo-400' : 'text-slate-600'}`} />
                  <span className="truncate">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-rose-400 rounded transition duration-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Identity Profile Footer */}
        <div className="flex h-16 items-center justify-between border-t border-slate-900 bg-slate-950/40 px-5 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 uppercase font-bold text-indigo-400">
              {user?.username?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-300 truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-500 hover:text-rose-400 transition duration-150 rounded-lg hover:bg-slate-900/50"
            title="Log out Profile"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ================= RIGHT CHAT MODULE / HOME VIEW ================= */}
      <main className="flex h-full flex-1 flex-col bg-slate-950 overflow-y-auto">
        {currentSessionId ? (
          <>
            {/* Thread Active Header Banner */}
            <header className="flex h-16 items-center px-8 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-10">
              <div className="flex flex-col">
                <h3 className="text-xs font-semibold text-slate-200">
                  {sessions.find(s => s.id === currentSessionId)?.title || "Active Discussion"}
                </h3>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-0.5 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected to Gemini Flash Engine
                </p>
              </div>
            </header>

            {/* Conversation Core Timeline Stream */}
            <div className="flex-1 px-8 py-6 space-y-6">
              {isMessagesLoading ? (
                <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-4 max-w-3xl xl:max-w-4xl mx-auto ${msg.sender.toUpperCase() === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender.toUpperCase() !== 'USER' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 shadow-sm">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] ${
                      msg.sender.toUpperCase() === 'USER' 
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md' 
                        : 'bg-slate-900/80 text-slate-300 border border-slate-800/80 rounded-bl-none whitespace-pre-wrap'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.sender.toUpperCase() === 'USER' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isSending && (
                <div className="flex gap-4 max-w-3xl mx-auto items-center justify-start animate-pulse">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
                    <Bot className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="rounded-2xl px-4 py-2.5 text-xs text-slate-500 bg-slate-900/40 border border-slate-800/40 rounded-bl-none font-mono">
                    Gemini is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Conversational Input Frame Box Area */}
            <footer className="p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent sticky bottom-0">
              <form onSubmit={handleSendMessage} className="max-w-3xl xl:max-w-4xl mx-auto relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isSending}
                  placeholder="Type a message or ask something technical..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 py-3.5 pl-5 pr-14 text-sm text-slate-200 placeholder-slate-600 transition duration-200 outline-none focus:border-indigo-500 focus:bg-slate-900/60 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white transition duration-150 hover:bg-indigo-500 active:scale-[0.95] disabled:bg-slate-800 disabled:text-slate-600 disabled:pointer-events-none shadow-md shadow-indigo-600/10"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          /* ================= INTEGRATED APP HOMEPAGE SCREEN ================= */
          <div ref={homeRef} className="flex flex-col w-full relative">
            
            {/* Dynamic Interactive Navigation Header Bar */}
            <nav className="flex h-16 w-full items-center justify-between px-12 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold font-mono tracking-widest uppercase text-slate-300">Nexus.Core</span>
              </div>
              <div className="flex items-center gap-8 text-xs font-medium text-slate-400">
                <button onClick={() => scrollToSection(featuresRef)} className="hover:text-indigo-400 transition">Features</button>
                <button onClick={() => scrollToSection(aboutRef)} className="hover:text-indigo-400 transition">About Engine</button>
                <span className="text-slate-800">|</span>
                <span className="text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded border border-slate-800">Authenticated: {user?.username}</span>
              </div>
            </nav>

            {/* Main Aesthetic Hero Canvas Panel */}
            <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative min-h-[70vh]">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />
              
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 mb-6 shadow-xl">
                <Bot className="h-5 w-5" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400 sm:text-5xl max-w-2xl leading-tight">
                Next-Gen Intellect Workspace Environment.
              </h1>
              <p className="text-sm text-slate-400 max-w-lg mt-4 leading-relaxed font-sans">
                NexusAI unites reactive client context states with FastAPI asynchronous persistence layers, delivering real-time LLM execution arrays optimized for deep engineering routines.
              </p>
              
              <div className="mt-8 flex items-center gap-4">
                <button 
                  onClick={handleCreateSession}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-150 hover:bg-indigo-500 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" /> Initialize Workspace Stream
                </button>
                <button 
                  onClick={() => scrollToSection(featuresRef)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 px-5 py-3 text-xs font-semibold text-slate-300 transition duration-150 hover:bg-slate-800/60"
                >
                  Explore Capabilities <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                </button>
              </div>
            </section>

            {/* Feature Logs Core Presentation Grid */}
            <section ref={featuresRef} className="px-12 py-20 border-t border-slate-900 bg-slate-900/10 scroll-mt-16">
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase font-mono">Platform Capabilities</h2>
                  <p className="text-xl font-semibold text-slate-200 mt-2">Engineered Under Strict Structural Parameters</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 hover:border-slate-800/80 transition group">
                    <Zap className="h-5 w-5 text-amber-400 mb-4 group-hover:scale-110 transition" />
                    <h3 className="text-sm font-semibold text-slate-200">Asynchronous Speed</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">Built on FastAPI async/await drivers paired with client optimistic rendering systems for zero layout input lag.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 hover:border-slate-800/80 transition group">
                    <ShieldCheck className="h-5 w-5 text-emerald-400 mb-4 group-hover:scale-110 transition" />
                    <h3 className="text-sm font-semibold text-slate-200">Isolate Security Layer</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">Strict data session isolation keys prevent context mixing. Your query boundaries remain entirely your own.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 hover:border-slate-800/80 transition group">
                    <Layers className="h-5 w-5 text-indigo-400 mb-4 group-hover:scale-110 transition" />
                    <h3 className="text-sm font-semibold text-slate-200">Persistent Enums</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">Structured relational history maps conversation state parameters smoothly without text validation breakdown hazards.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* About System Pipeline Core Section */}
            <section ref={aboutRef} className="px-12 py-20 border-t border-slate-900 bg-slate-950/60 scroll-mt-16">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-xs font-bold tracking-widest text-violet-400 uppercase font-mono">About the Architecture</h2>
                <h3 className="text-xl font-semibold text-slate-200 mt-2">Connected directly to Gemini Flash Core Engines</h3>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed font-sans max-w-xl mx-auto">
                  NexusAI leverages the official Google GenAI pipeline protocols to ensure high-fidelity context preservation. The stack transforms real-time message tables, matches them cleanly into the LLM system prompt array, and automatically coordinates user vs. model roles smoothly.
                </p>
                <div className="mt-8 flex justify-center gap-8 text-[11px] font-mono text-slate-500">
                  <div>BACKEND // <span className="text-slate-300">FastAPI & Python</span></div>
                  <div>DATABASE // <span className="text-slate-300">PostgreSQL Relational</span></div>
                  <div>CLIENT UI // <span className="text-slate-300">React & Tailwind</span></div>
                </div>
              </div>
            </section>

            {/* Simple Platform Footer */}
            <footer className="w-full text-center py-8 text-[10px] text-slate-700 font-mono border-t border-slate-900 mt-auto bg-slate-950">
              Fast AI APPLICATION PLATFORM ENGINE // SYSTEM ACTIVE & AUTHENTICATED
            </footer>

          </div>
        )}
      </main>
    </div>
  );
}