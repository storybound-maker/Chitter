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

const NAV_ITEMS: HomeTab[] = ['realm', 'chatter', 'profile'];

export const BottomNav: React.FC<BottomNavProps> = ({
  pagePosition,
  activeTab,
  onSelectTab,
}) => {
  // pagePosition is the only source of truth. The bubble follows the same
  // continuous value as the three-panel viewport, so there is no second
  // navigation animation to drift out of sync.
  const bubbleX = useTransform(pagePosition, (pos) => `${pos * 100}%`);
  const bubbleScaleX = useTransform(pagePosition, (pos) => {
    const distanceFromNearest = Math.abs(pos - Math.round(pos));
    return 1 + Math.min(distanceFromNearest, 0.5) * 0.18;
  });
  const bubbleScaleY = useTransform(pagePosition, (pos) => {
    const distanceFromNearest = Math.abs(pos - Math.round(pos));
    return 1 - Math.min(distanceFromNearest, 0.5) * 0.08;
  });
  const glowOpacity = useTransform(pagePosition, (pos) => {
    const distanceFromNearest = Math.abs(pos - Math.round(pos));
    return 0.58 - Math.min(distanceFromNearest, 0.5) * 0.35;
  });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-md px-5 pb-5 pt-2 select-none"
      aria-label="Primary navigation"
    >
      <div className="relative overflow-hidden rounded-[28px] border border-zinc-800/90 bg-black/95 p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 top-1.5 left-1.5 w-[calc(33.333333%-4px)] rounded-[22px] border border-[#00d2ff]/70 bg-[#00d2ff]/12"
          style={{
            x: bubbleX,
            scaleX: bubbleScaleX,
            scaleY: bubbleScaleY,
            transformOrigin: 'center',
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-[22px] bg-[#00d2ff] blur-xl"
            style={{ opacity: glowOpacity }}
          />
          <div className="absolute inset-x-4 bottom-1 h-1 rounded-full bg-[#00d2ff] shadow-[0_0_12px_#00d2ff]" />
        </motion.div>

        <div className="relative z-10 flex items-center">
          <NavButton
            label="Realm"
            active={activeTab === 'realm'}
            onClick={() => onSelectTab('realm')}
          >
            <Globe className="h-6 w-6" strokeWidth={2.2} />
          </NavButton>

          <NavButton
            label="Chatter"
            active={activeTab === 'chatter'}
            onClick={() => onSelectTab('chatter')}
          >
            <MessageSquare className="h-6 w-6" strokeWidth={2.2} />
          </NavButton>

          <NavButton
            label="Profile Bob"
            active={activeTab === 'profile'}
            onClick={() => onSelectTab('profile')}
          >
            <PacmanAvatar size={26} isIconOnly active={activeTab === 'profile'} />
          </NavButton>
        </div>
      </div>
    </nav>
  );
};

const NavButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-current={active ? 'page' : undefined}
    className="relative flex min-w-0 flex-1 items-center justify-center rounded-[22px] py-3 text-white outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00d2ff]"
  >
    <span
      className={`relative flex items-center justify-center transition-[color,filter,transform] duration-150 ${
        active
          ? 'scale-110 text-white drop-shadow-[0_0_10px_rgba(0,210,255,0.65)]'
          : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {children}
    </span>
  </button>
);
