import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useChitter } from '../context/ChitterContext';
import { PacmanAvatar } from '../components/common/PacmanAvatar';

export const SplashScreen: React.FC = () => {
  const { setScreen } = useChitter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen('welcome');
    }, 2200);
    return () => clearTimeout(timer);
  }, [setScreen]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950 px-6 text-white select-none">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-6">
          {/* Glowing Aura Ring */}
          <div className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          <PacmanAvatar size={96} isIconOnly={true} active={true} />
        </div>

        <h1 className="text-4xl font-black tracking-widest text-white">CHITTER</h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          Chatter • Realm • Profile Bob
        </p>

        {/* Loading Bar */}
        <div className="mt-12 h-1 w-32 overflow-hidden rounded-full bg-zinc-900">
          <motion.div
            className="h-full bg-cyan-400 shadow-[0_0_12px_#00d2ff]"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};
