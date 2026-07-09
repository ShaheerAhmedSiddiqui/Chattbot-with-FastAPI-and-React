import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/client';
import { 
  MessageSquareCode, Plus, LogOut, Send, 
  Bot, User, MessageSquare, Loader2, Trash2, Menu, X
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
  
  // Mobile Sidebar Toggle State
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const fetchSessions = async () => {
    try {
      const response = await API.get('/sessions/');
      setSessions(response.data);
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
    fetchSessions();
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
      setIsMobileOpen(false); // Close menu on mobile after picking
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 relative">
      
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ================= SIDEBAR (WITH MOBILE SLIDE TRANSITIONS) ================= */}
      <aside className={`fixed md:sticky inset-y-0 left-0 z-50 flex h-full w-80 flex-col border-r border-slate-900 bg-slate-900 md:bg-slate-900/40 backdrop-blur-sm transform transition-transform duration-300 md:transform-none ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md">
              <MessageSquareCode className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm tracking-wide text-slate-200">NexusAI Dashboard</span>
          </div>
          {/* Close button inside mobile menu */}
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Control: New Thread */}
        <div className="p-4">
          <button 
            onClick={handleCreateSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 border border-slate-800/60 hover:border-slate-700/80 py-2.5 text-xs font-medium tracking-wide transition hover:bg-slate-800/40"
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
                onClick={() => {
                  setCurrentSessionId(session.id);
                  setIsMobileOpen(false); // Auto-hide menu on click
                }}
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
                  className="opacity-0 group-hover:opacity-100 md:opacity-100 p-1 text-slate-600 hover:text-rose-400 rounded transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Profile Footer */}
        <div className="flex h-16 items-center justify-between border-t border-slate-900 bg-slate-950/40 px-5 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 border border-slate-700 uppercase font-bold text-indigo-400">
              {user?.username?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-300 truncate">{user?.username}</p>
            </div>
          </div>
          <button onClick={logout} className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900/50">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* ================= MAIN CHAT MODULE VIEW ================= */}
      <main className="flex h-full flex-1 flex-col bg-slate-950 overflow-hidden">
        
        {/* Dynamic Top Workspace Navbar Header */}
        <header className="flex h-16 items-center justify-between md:justify-start px-6 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md z-10">
          {/* Mobile Menu Action Toggle Button */}
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 -ml-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:scale-95"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex flex-col md:ml-2 text-right md:text-left">
            <h3 className="text-xs font-semibold text-slate-200">
              {sessions.find(s => s.id === currentSessionId)?.title || "Select or Build a Thread Workspace"}
            </h3>
          </div>
        </header>

        {/* Conversation Core Timeline Stream */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-thin">
          {currentSessionId ? (
            <>
              {isMessagesLoading ? (
                <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 md:gap-4 max-w-3xl xl:max-w-4xl mx-auto ${msg.sender.toUpperCase() === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender.toUpperCase() !== 'USER' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-2.5 text-xs md:text-sm leading-relaxed max-w-[85%] ${
                      msg.sender.toUpperCase() === 'USER' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-900/80 text-slate-300 border border-slate-800/80 rounded-bl-none whitespace-pre-wrap'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              
              {isSending && (
                <div className="flex gap-4 max-w-3xl mx-auto items-center justify-start animate-pulse">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
                    <Bot className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="rounded-2xl px-4 py-2 text-xs text-slate-500 bg-slate-900/40 border border-slate-800/40 rounded-bl-none font-mono">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <MessageSquare className="h-10 w-10 text-slate-800 mb-4 stroke-[1.5]" />
              <h4 className="text-sm font-medium text-slate-400">No Thread Active</h4>
              <p className="text-xs text-slate-600 max-w-xs mt-1">Select an existing thread from the sidebar list or spin up a new instance context.</p>
              <button onClick={handleCreateSession} className="md:hidden mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
                Create Session
              </button>
            </div>
          )}
        </div>

        {/* Conversational Input Frame Box Area */}
        {currentSessionId && (
          <footer className="p-4 md:p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
            <form onSubmit={handleSendMessage} className="max-w-3xl xl:max-w-4xl mx-auto relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSending}
                placeholder="Ask something technical..."
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/40 py-3.5 pl-4 pr-12 text-xs md:text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white disabled:bg-slate-800 disabled:text-slate-600"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </footer>
        )}
      </main>
    </div>
  );
}