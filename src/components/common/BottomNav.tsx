import React from 'react';
import { motion, MotionValue, useTransform } from 'motion/react';
import { Globe, MessageSquare } from 'lucide-react';
import { HomeTab } from '../../types';
import { PacmanAvatar } from './PacmanAvatar';

interface BottomNavProps {
  pagePosition: MotionValue<number>;
  activeTab: HomeTab;
  onSelectTab: (tab: HomeTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  pagePosition,
  activeTab,
  onSelectTab,
}) => {
  // Continuous horizontal offset for the active capsule bubble (0% to 200%)
  const bubbleX = useTransform(pagePosition, (pos) => `${pos * 100}%`);

  // Transform scale slightly when overscrolling
  const bubbleScale = useTransform(pagePosition, (pos) => {
    if (pos < 0) return 1 + pos * 0.15;
    if (pos > 2) return 1 - (pos - 2) * 0.15;
    return 1;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md px-6 pb-6 pt-2 select-none">
      <div className="relative flex items-center justify-between rounded-full border border-zinc-800/90 bg-black p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        {/* Organic Light-Blue Active Capsule Bubble */}
        <motion.div
          className="absolute top-1.5 bottom-1.5 w-1/3 rounded-full border border-cyan-400/40 bg-cyan-500/15 shadow-[0_0_22px_rgba(0,210,255,0.38)] backdrop-blur-md pointer-events-none"
          style={{
            x: bubbleX,
            scale: bubbleScale,
          }}
        >
          {/* Light-Blue Active Accent Dot */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-3.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00d2ff]" />
        </motion.div>

        {/* 1. REALM TAB (Position 0) */}
        <button
          onClick={() => onSelectTab('realm')}
          className="relative z-10 flex flex-1 items-center justify-center py-2.5 transition active:scale-95"
          aria-label="Realm"
        >
          <GlobeIconWithProximity pagePosition={pagePosition} tabIndex={0} active={activeTab === 'realm'} />
        </button>

        {/* 2. CHATTER TAB (Position 1) */}
        <button
          onClick={() => onSelectTab('chatter')}
          className="relative z-10 flex flex-1 items-center justify-center py-2.5 transition active:scale-95"
          aria-label="Chatter"
        >
          <ChatterIconWithProximity pagePosition={pagePosition} tabIndex={1} active={activeTab === 'chatter'} />
        </button>

        {/* 3. PROFILE BOB TAB (Position 2) */}
        <button
          onClick={() => onSelectTab('profile')}
          className="relative z-10 flex flex-1 items-center justify-center py-2.5 transition active:scale-95"
          aria-label="Profile Bob"
        >
          <ProfileIconWithProximity pagePosition={pagePosition} tabIndex={2} active={activeTab === 'profile'} />
        </button>
      </div>
    </nav>
  );
};

// Helper subcomponents for continuous proximity color highlights
const GlobeIconWithProximity: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
  active: boolean;
}> = ({ pagePosition, tabIndex, active }) => {
  const scale = useTransform(pagePosition, (pos) => {
    const proximity = 1 - Math.min(1, Math.abs(pos - tabIndex));
    return 1 + proximity * 0.12;
  });

  const colorClass = active ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(0,210,255,0.8)]' : 'text-zinc-500 hover:text-zinc-300';

  return (
    <motion.div style={{ scale }}>
      <Globe className={`h-6 w-6 transition-colors duration-150 ${colorClass}`} />
    </motion.div>
  );
};

const ChatterIconWithProximity: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
  active: boolean;
}> = ({ pagePosition, tabIndex, active }) => {
  const scale = useTransform(pagePosition, (pos) => {
    const proximity = 1 - Math.min(1, Math.abs(pos - tabIndex));
    return 1 + proximity * 0.12;
  });

  const colorClass = active ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(0,210,255,0.8)]' : 'text-zinc-500 hover:text-zinc-300';

  return (
    <motion.div style={{ scale }}>
      <MessageSquare className={`h-6 w-6 transition-colors duration-150 ${colorClass}`} />
    </motion.div>
  );
};

const ProfileIconWithProximity: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
  active: boolean;
}> = ({ pagePosition, tabIndex, active }) => {
  const scale = useTransform(pagePosition, (pos) => {
    const proximity = 1 - Math.min(1, Math.abs(pos - tabIndex));
    return 1 + proximity * 0.12;
  });

  return (
    <motion.div style={{ scale }}>
      <PacmanAvatar size={26} isIconOnly={true} active={active} />
    </motion.div>
  );
};
