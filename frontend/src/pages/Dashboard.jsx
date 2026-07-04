import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/client';
import { 
  MessageSquareCode, Plus, LogOut, Send, 
  Bot, User, MessageSquare, Loader2, Trash2 
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
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Fetch all chat threads for the logged-in user
  const fetchSessions = async (selectFirst = false) => {
    try {
      const response = await API.get('/sessions/');
      setSessions(response.data);
      if (selectFirst && response.data.length > 0 && !currentSessionId) {
        setCurrentSessionId(response.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  // Fetch sequential messages for the active session thread
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
    fetchSessions(true);
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      fetchMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  // Create a brand new conversational container
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

  // Delete a historical thread container cleanly
  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation(); // Avoid triggering thread selection click
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

  // Send a fresh message prompt out to FastAPI + Gemini
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentSessionId || isSending) return;

    const userText = inputMessage;
    setInputMessage('');
    setIsSending(true);

    // Optimistically update UI with the user's message immediately
    const optimisticUserMsg = {
      id: Date.now(),
      session_id: currentSessionId,
      sender: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticUserMsg]);

    try {
      const response = await API.post('/messages/', {
        session_id: currentSessionId,
        content: userText
      });
      // Append final backend confirmation (which replaces/updates state with official bot payload)
      setMessages(prev => [...prev, response.data]);
    } catch (err) {
      console.error("Communication failure with AI engine:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="flex h-full w-80 flex-col border-r border-slate-200 bg-white">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-200">
            <MessageSquareCode className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-wide text-slate-800">FAST AI Dashboard</span>
        </div>

        {/* Action Control: New Thread */}
        <div className="p-4">
          <button 
            onClick={handleCreateSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-medium tracking-wide text-white transition duration-150 hover:bg-slate-800 active:scale-[0.99] shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </button>
        </div>

        {/* Dynamic Context History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          {isSessionsLoading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-xs text-slate-400 pt-8 font-mono">No active threads logged.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setCurrentSessionId(session.id)}
                className={`group flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-medium cursor-pointer transition duration-150 ${
                  currentSessionId === session.id 
                    ? 'bg-indigo-50 border-l-2 border-indigo-500 text-indigo-700' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <MessageSquare className={`h-4 w-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                  <span className="truncate">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition duration-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Identity Profile Footer */}
        <div className="flex h-16 items-center justify-between border-t border-slate-100 bg-white px-5 ">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 border border-indigo-200 uppercase font-bold text-indigo-600">
              {user?.username?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-700 truncate text-sm">{user?.username}</p>
              <p className="text-slate-500 truncate text-sm">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-500 transition duration-150 rounded-lg hover:bg-slate-50"
            title="Log out Profile"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ================= RIGHT CHAT MODULE ================= */}
      <main className="flex h-full flex-1 flex-col bg-slate-50">
        {currentSessionId ? (
          <>
            {/* Thread Active Header Banner */}
            <header className="flex h-16 items-center px-8 border-b border-slate-200 bg-white/70 backdrop-blur-md">
              <div className="flex flex-col">
                <h3 className="text-xs font-semibold text-slate-800">
                  {sessions.find(s => s.id === currentSessionId)?.title || "Active Discussion"}
                </h3>
                <p className="text-[10px] text-emerald-600 flex items-center gap-1.5 mt-0.5 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected to Gemini Flash Engine
                </p>
              </div>
            </header>

            {/* Conversation Core Timeline Stream */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-none">
              {isMessagesLoading ? (
                <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-4 max-w-3xl xl:max-w-4xl mx-auto animate-fade-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-sm shadow-indigo-200">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] ${
                      msg.sender === 'user' 
                        ? 'bg-indigo-600 text-white selection:bg-indigo-800 rounded-br-none shadow-md shadow-indigo-100' 
                        : 'bg-white text-slate-600 border border-slate-200 rounded-bl-none whitespace-pre-wrap shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.sender === 'user' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {/* Animated Loading/Streaming State bubble */}
              {isSending && (
                <div className="flex gap-4 max-w-3xl mx-auto items-center justify-start animate-pulse">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-sm shadow-indigo-200">
                    <Bot className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="rounded-2xl px-4 py-2.5 text-xs text-slate-400 bg-white border border-slate-200 rounded-bl-none font-mono shadow-sm">
                    Gemini is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Conversational Input Frame Box Area */}
            <footer className="p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
              <form onSubmit={handleSendMessage} className="max-w-3xl xl:max-w-4xl mx-auto relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isSending}
                  placeholder="Type a message or ask something technical..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-5 pr-14 text-sm text-slate-700 placeholder-slate-400 shadow-sm shadow-slate-200/60 transition duration-200 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white transition duration-150 hover:opacity-90 active:scale-[0.95] disabled:bg-slate-200 disabled:bg-none disabled:text-slate-400 disabled:pointer-events-none shadow-md shadow-indigo-200"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </footer>
          </>
        ) : (
          /* Empty Active Selection Fallback Canvas Dashboard Welcome screen */
          <div className="flex h-full flex-col items-center justify-center text-center p-8 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-300/20 blur-[160px] pointer-events-none" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white mb-5 shadow-lg shadow-indigo-200 animate-bounce">
              <Bot className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-medium text-slate-800">Welcome to your workspace AI, {user?.username}</h1>
            <p className="text-xs text-slate-500 max-w-sm mt-2 leading-relaxed">
              Initialize a clean discussion thread or pick an active window in your left session context history log to begin.
            </p>
            <button 
              onClick={handleCreateSession}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-medium text-white shadow-lg shadow-indigo-200 transition duration-150 hover:opacity-90 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" /> Start New Session
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
