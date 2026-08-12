import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, AtSign, CheckCircle2 } from 'lucide-react';
import { useChitter } from '../context/ChitterContext';

export const SignUpScreen: React.FC = () => {
  const { setScreen, signup } = useChitter();
  const [name, setName] = useState('Tyrell');
  const [handle, setHandle] = useState('tyrell.hyde');
  const [email, setEmail] = useState('tyrell@chitter.app');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !handle) {
      setError('Please complete all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signup(email, password, name, handle);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-zinc-950 p-6 text-white justify-between overflow-y-auto">
      <div>
        <button
          onClick={() => setScreen('welcome')}
          className="flex items-center space-x-2 text-sm font-semibold text-zinc-400 hover:text-white pt-2 mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <h1 className="text-3xl font-black text-white">Create Account</h1>
        <p className="text-xs text-zinc-400 mt-1">Claim your Chitter handle and join the realm.</p>

        {error && (
          <div className="mt-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Display Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tyrell"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Chitter Handle</label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="tyrell.hyde"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-cyan-400 font-semibold focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
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
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Password</label>
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
            className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-cyan-400 py-3.5 text-center text-sm font-bold text-black shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Create Chitter Account</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="py-4 text-center text-xs text-zinc-500">
        Already registered?{' '}
        <button onClick={() => setScreen('login')} className="font-bold text-cyan-400 hover:underline">
          Sign In
        </button>
      </div>
    </div>
  );
};
