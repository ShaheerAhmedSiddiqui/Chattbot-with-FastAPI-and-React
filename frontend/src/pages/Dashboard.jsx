import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/client';
import { 
  Plus, LogOut, ArrowUp, 
  Sparkles, Loader2, Trash2, Menu, X, MessageSquare
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
      const title = `New chat`;
      const response = await API.post('/sessions/', { title });
      setSessions([response.data, ...sessions]);
      setCurrentSessionId(response.data.id);
      setIsMobileOpen(false);
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#212121] font-sans text-token-text-primary text-gray-100">
      
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:sticky inset-y-0 left-0 z-50 flex h-full w-[260px] flex-col bg-[#171717] transform transition-transform duration-200 md:transform-none ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* Sidebar Header / New Chat */}
        <div className="flex items-center justify-between p-3">
          <button 
            onClick={handleCreateSession}
            className="flex flex-1 items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-[#212121] transition"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New chat
            </span>
          </button>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden ml-2 p-2 text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Context History List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {isSessionsLoading ? (
            <div className="flex h-20 items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-gray-500" /></div>
          ) : sessions.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-500">No chat history.</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => {
                  setCurrentSessionId(session.id);
                  setIsMobileOpen(false);
                }}
                className={`group flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm cursor-pointer transition ${
                  currentSessionId === session.id 
                    ? 'bg-[#212121] text-white' 
                    : 'text-gray-300 hover:bg-[#212121]/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="truncate text-xs font-normal">{session.title}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-white transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-white/10 p-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white text-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="font-medium text-xs text-gray-200 truncate">{user?.name || 'User'}</span>
          </div>
          <button onClick={logout} className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-[#212121]">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex h-full flex-1 flex-col bg-[#212121] relative overflow-hidden">
        
        {/* Top Minimal Navbar */}
        <header className="flex h-14 items-center justify-between px-4 border-b border-white/5 bg-[#212121]">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:bg-[#2f2f2f]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-gray-200 flex items-center gap-1.5">
              FastAI <span className="text-xs text-gray-400 font-normal">2.0</span>
            </h1>
          </div>
        </header>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto px-4 md:px-0 scrollbar-thin">
          {currentSessionId ? (
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              {isMessagesLoading ? (
                <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-gray-500" /></div>
              ) : (
                messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-4 text-sm md:text-base leading-7 ${
                      msg.sender.toUpperCase() === 'USER' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender.toUpperCase() === 'USER' ? (
                      <div className="bg-[#2f2f2f] text-gray-100 rounded-3xl px-5 py-2.5 max-w-[80%]">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="flex gap-4 w-full">
                        <div className="h-7 w-7 rounded-full border border-white/10 bg-[#212121] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 text-gray-200 whitespace-pre-wrap pt-0.5">
                          {msg.content}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isSending && (
                <div className="flex gap-4 w-full text-sm">
                  <div className="h-7 w-7 rounded-full border border-white/10 bg-[#212121] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
                  </div>
                  <div className="text-gray-400 pt-1">Thinking...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center p-6">
              <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center mb-4 bg-[#2f2f2f]">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-medium text-white">What can I help with today?</h2>
            </div>
          )}
        </div>

        {/* Floating Input Pill */}
        {currentSessionId && (
          <footer className="p-4 bg-[#212121]">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
              <div className="relative flex items-center bg-[#2f2f2f] rounded-3xl border border-white/5 focus-within:border-white/20">
                <textarea
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  disabled={isSending}
                  placeholder="Message ChatGPT..."
                  className="w-full bg-transparent py-3.5 pl-5 pr-12 text-sm md:text-base text-gray-100 placeholder-gray-400 outline-none resize-none max-h-36 overflow-y-auto"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending}
                  className="absolute right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black disabled:bg-[#676767] disabled:text-[#212121] transition"
                >
                  <ArrowUp className="h-4 w-4 stroke-[3]" />
                </button>
              </div>
            </form>
          </footer>
        )}
      </main>
    </div>
  );
}