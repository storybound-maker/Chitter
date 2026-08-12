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
  // pagePosition is the single continuous coordinate shared with the content.
  // The indicator moves one third of the navbar for every page-position unit.
  const indicatorX = useTransform(pagePosition, (pos) => `${pos * (100 / NAV_ITEMS.length)}%`);

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

        {/* Full-width coordinate layer: x=0/33.33/66.66% now matches the
            three navigation slots exactly. This fixes the previous mismatch
            where the dot travelled the entire navbar width for one page. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1.5 bottom-1.5 h-2"
          style={{ x: indicatorX }}
        >
          <div className="flex h-full w-1/3 items-center justify-center">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-[#00d2ff]"
              style={{
                boxShadow: '0 0 7px #00d2ff, 0 0 14px rgba(0,210,255,0.7)',
              }}
            />
          </div>
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
