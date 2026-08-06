// Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await register(username, email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#212121] px-4 font-sans text-gray-100">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Sparkles className="h-8 w-8 text-emerald-500" />
          <h2 className="text-2xl font-semibold tracking-tight text-white">Create an account</h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-950/50 border border-red-500/50 p-3 text-xs text-red-300 text-center">
            {typeof error === 'string' ? error : 'Validation failed.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#2f2f2f] px-3.5 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-white/30"
              placeholder="Username"
            />
          </div>

          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#2f2f2f] px-3.5 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-white/30"
              placeholder="Email address"
            />
          </div>

          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#2f2f2f] px-3.5 py-2.5 text-sm text-white placeholder-gray-400 outline-none focus:border-white/30"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Continue'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}