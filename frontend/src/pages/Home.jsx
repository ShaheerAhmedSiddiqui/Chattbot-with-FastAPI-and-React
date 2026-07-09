import { Link } from 'react-router-dom';
import { 
  MessageSquareCode, Sparkles, ShieldCheck, Zap, Layers, ChevronRight, LogIn, UserPlus
} from 'lucide-react';

export default function Home() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 font-sans text-slate-100 overflow-x-hidden">
      
      {/* ================= NAVBAR ================= */}
      <nav className="flex h-16 w-full items-center justify-between px-6 md:px-12 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md">
            <MessageSquareCode className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-wide bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">FAST AI</span>
        </div>

        <div className="flex items-center gap-6 md:gap-8 text-xs font-medium text-slate-400">
          <button onClick={() => scrollToSection('about')} className="hover:text-indigo-400 transition hidden sm:inline-block">About</button>
          <button onClick={() => scrollToSection('features')} className="hover:text-indigo-400 transition hidden sm:inline-block">Features</button>
          <span className="text-slate-800 hidden sm:inline-block">|</span>
          <Link to="/login" className="flex items-center gap-1.5 hover:text-slate-200 transition">
            <LogIn className="h-3.5 w-3.5" /> Login
          </Link>
          <Link to="/register" className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-600/10">
            <UserPlus className="h-3.5 w-3.5" /> Register
          </Link>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 relative min-h-[75vh]">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[160px] pointer-events-none" />
        
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 mb-6 shadow-xl">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400 sm:text-6xl max-w-3xl leading-tight">
          Next-Gen AI Chat Workspace
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-xl mt-6 leading-relaxed">
          FAST AI unites fluid client state structures with an asynchronous FastAPI engine, delivering high-speed contextual completions backed by Google Gemini.
        </p>
        
        <div className="mt-10 flex items-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition duration-150 hover:bg-indigo-500 active:scale-[0.98]">
            Launch Workspace <ChevronRight className="h-4 w-4" />
          </Link>
          <button 
            onClick={() => scrollToSection('features')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 px-5 py-3 text-xs font-semibold text-slate-300 transition duration-150 hover:bg-slate-800/60"
          >
            Explore Capabilities
          </button>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="px-6 md:px-12 py-24 border-t border-slate-900 bg-slate-900/10 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-400 uppercase font-mono">Platform Capabilities</h2>
            <p className="text-2xl font-semibold text-slate-200 mt-2">Engineered Under Strict Parameters</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 hover:border-slate-800/80 transition group">
              <Zap className="h-5 w-5 text-amber-400 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-sm font-semibold text-slate-200">Asynchronous Pipelines</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Built on FastAPI async architecture paired with client optimistic state updates for immediate UI responses.</p>
            </div>
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 hover:border-slate-800/80 transition group">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-sm font-semibold text-slate-200">Granular Security</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Rigorous multi-tenant session verification locks down endpoints. Your chats remain accessible only to you.</p>
            </div>
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 hover:border-slate-800/80 transition group">
              <Layers className="h-5 w-5 text-indigo-400 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-sm font-semibold text-slate-200">State Persistence</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">Fully structured database records map historical logs dynamically into the LLM system context.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about" className="px-6 md:px-12 py-24 border-t border-slate-900 bg-slate-950/60 scroll-mt-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xs font-bold tracking-widest text-violet-400 uppercase font-mono">About the System</h2>
          <h3 className="text-2xl font-semibold text-slate-200 mt-2">Connected directly to Gemini Flash Core Engines</h3>
          <p className="text-xs md:text-sm text-slate-400 mt-4 leading-relaxed max-w-xl mx-auto">
            FAST AI provides high-performance model integrations. By combining strict backend serialization layers with an unopinionated client frame layout, users experience clean conversation flow loops safely.
          </p>
        </div>
      </section>

      <footer className="w-full text-center py-8 text-[10px] text-slate-700 font-mono border-t border-slate-900 bg-slate-950">
        FAST AI APPLICATION PLATFORM // DISTRIBUTED WORKSPACE ENVIRONMENT
      </footer>
    </div>
  );
}