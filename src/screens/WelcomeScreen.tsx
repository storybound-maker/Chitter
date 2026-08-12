import React from 'react';
import { motion } from 'motion/react';
import { useChitter } from '../context/ChitterContext';
import { ArrowRight, MessageSquare, Globe, User } from 'lucide-react';
import { PacmanAvatar } from '../components/common/PacmanAvatar';

export const WelcomeScreen: React.FC = () => {
  const { setScreen } = useChitter();

  return (
    <div className="flex h-full w-full flex-col justify-between bg-zinc-950 p-6 text-white">
      {/* Top Brand Logo */}
      <div className="pt-8 flex items-center space-x-3">
        <PacmanAvatar size={40} isIconOnly={true} active={true} />
        <span className="text-2xl font-black tracking-widest text-white">CHITTER</span>
      </div>

      {/* Center Hero Messaging */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="my-auto space-y-6"
      >
        <h2 className="text-3xl font-black leading-tight text-white">
          Private Chats.
          <br />
          <span className="text-cyan-400">Shared Realms.</span>
          <br />
          Your Identity.
        </h2>

        <p className="text-sm leading-relaxed text-zinc-400 max-w-xs">
          Discover a social messaging experience designed around gesture-driven fluidity, private Chatter, community Realms, and Profile Bob.
        </p>

        {/* Concept Highlights */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-3 rounded-2xl border border-zinc-900 bg-zinc-900/40 p-3">
            <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">CHATTER</div>
              <div className="text-[11px] text-zinc-400">Private & group messaging with gesture actions</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-2xl border border-zinc-900 bg-zinc-900/40 p-3">
            <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-400">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">REALM</div>
              <div className="text-[11px] text-zinc-400">Community discovery feed & chit posts</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-2xl border border-zinc-900 bg-zinc-900/40 p-3">
            <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">PROFILE BOB</div>
              <div className="text-[11px] text-zinc-400">Your distinctive social identity</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Action Triggers */}
      <div className="pb-6 space-y-3">
        <button
          onClick={() => setScreen('signup')}
          className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-cyan-400 py-4 text-center text-sm font-bold text-black shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 active:scale-[0.98]"
        >
          <span>Get Started</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={() => setScreen('login')}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 py-4 text-center text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98]"
        >
          I already have an account
        </button>

        <button
          onClick={() => setScreen('home')}
          className="block w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-300 pt-1"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};
