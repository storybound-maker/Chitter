import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, LogIn } from 'lucide-react';
import { useChitter } from '../context/ChitterContext';

export const LoginScreen: React.FC = () => {
  const { setScreen, login } = useChitter();
  const [email, setEmail] = useState('tyrell@chitter.app');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch {
      // Keep provider/Firebase implementation details out of the user-facing UI.
      setError('We couldn’t sign you in. Check your email and password and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-between bg-zinc-950 p-6 text-white">
      <div>
        <button
          onClick={() => setScreen('welcome')}
          className="mb-8 flex items-center space-x-2 pt-2 text-sm font-semibold text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <h1 className="text-3xl font-black text-white">Welcome Back</h1>
        <p className="mt-1 text-xs text-zinc-400">Sign in to access your Chatter & Realm.</p>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs font-semibold text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tyrell@chitter.app"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-zinc-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center space-x-2 rounded-2xl bg-cyan-400 py-3.5 text-center text-sm font-bold text-black shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In to Chitter</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="pb-6 text-center text-xs text-zinc-500">
        Don't have an account?{' '}
        <button onClick={() => setScreen('signup')} className="font-bold text-cyan-400 hover:underline">
          Sign Up
        </button>
      </div>
    </div>
  );
};
