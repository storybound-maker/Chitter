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

const NAV_ITEMS: { tab: HomeTab; label: string; index: number }[] = [
  { tab: 'realm', label: 'Realm', index: 0 },
  { tab: 'chatter', label: 'Chatter', index: 1 },
  { tab: 'profile', label: 'Profile Bob', index: 2 },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  pagePosition,
  activeTab,
  onSelectTab,
}) => {
  // IMPORTANT: pagePosition is read directly while the finger is moving.
  // Nothing here waits for activeTab to change, so the indicator and icon
  // emphasis react continuously during the drag itself.
  const dotX = useTransform(pagePosition, (pos) => `${pos * 100}%`);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 mx-auto w-full max-w-md px-5 pb-5 pt-2 select-none"
      aria-label="Primary navigation"
    >
      <div className="relative rounded-[28px] border border-zinc-800/90 bg-black/95 p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl">
        <div className="relative z-10 flex items-center">
          {NAV_ITEMS.map(({ tab, label, index }) => (
            <NavButton
              key={tab}
              label={label}
              tab={tab}
              index={index}
              pagePosition={pagePosition}
              active={activeTab === tab}
              onClick={() => onSelectTab(tab)}
            >
              {tab === 'realm' && <Globe className="h-6 w-6" strokeWidth={2.2} />}
              {tab === 'chatter' && <MessageSquare className="h-6 w-6" strokeWidth={2.2} />}
              {tab === 'profile' && (
                <PacmanAvatar size={26} isIconOnly active={activeTab === 'profile'} />
              )}
            </NavButton>
          ))}
        </div>

        {/* The indicator is a DOT, not a capsule. Its x position is the exact
            same continuous navigation coordinate used by the content canvas. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 left-1.5 flex h-2 w-[calc(33.333333%-4px)] items-center justify-center"
          style={{ x: dotX }}
        >
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-[#00d2ff]"
            style={{
              boxShadow: '0 0 7px #00d2ff, 0 0 14px rgba(0,210,255,0.7)',
            }}
          />
        </motion.div>
      </div>
    </nav>
  );
};

const NavButton: React.FC<{
  label: string;
  tab: HomeTab;
  index: number;
  pagePosition: MotionValue<number>;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, tab, index, pagePosition, active, onClick, children }) => {
  // Continuous distance from this icon to the current finger/page position.
  // This makes the navbar visibly react before the gesture is released.
  const distance = useTransform(pagePosition, (pos) => Math.abs(pos - index));
  const scale = useTransform(distance, [0, 0.5, 1], [1.12, 1.04, 1]);
  const opacity = useTransform(distance, [0, 0.75, 1], [1, 0.82, 0.55]);
  const glow = useTransform(distance, [0, 0.75, 1], [0.75, 0.2, 0]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className="relative flex min-w-0 flex-1 items-center justify-center rounded-[22px] py-3 text-white outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#00d2ff]"
    >
      <motion.span
        className="relative flex items-center justify-center text-white"
        style={{
          scale,
          opacity,
          filter: useTransform(glow, (value) => `drop-shadow(0 0 ${Math.round(value * 10)}px rgba(0,210,255,${value}))`),
        }}
      >
        {children}
      </motion.span>
    </button>
  );
};
