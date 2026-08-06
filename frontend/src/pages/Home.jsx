import { Link } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen w-screen bg-[#212121] font-sans text-gray-100">
      
      {/* NAVBAR */}
      <nav className="flex h-16 w-full items-center justify-between px-6 md:px-12 border-b border-white/10 bg-[#171717]">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-500" />
          <span className="font-semibold text-sm tracking-wide text-white">FastAI ChattApp</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <Link to="/login" className="flex items-center gap-1.5 text-gray-300 hover:text-white transition">
            <LogIn className="h-4 w-4" /> Log in
          </Link>
          <Link to="/register" className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-black hover:bg-gray-200 transition font-semibold">
            <UserPlus className="h-4 w-4" /> Sign up
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-white leading-tight">
          Get answers. Find inspiration. Be more productive.
        </h1>
        <p className="text-base text-gray-400 max-w-xl mt-6">
          Free to use. Easy to try. Just start asking questions to generate code, ideas, and detailed responses.
        </p>
        
        <div className="mt-8 flex items-center gap-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-gray-200 transition">
            Start Chatting <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}