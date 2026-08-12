import React from 'react';
import { motion, MotionValue, useTransform, useVelocity, useSpring } from 'motion/react';
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
  onSelectTab,
}) => {
  // Derive velocity from pagePosition motion value for liquid stretching dynamics
  const rawVelocity = useVelocity(pagePosition);
  const velocity = useSpring(rawVelocity, { stiffness: 280, damping: 22 });

  // 1. Continuous Horizontal Offset for the Dot across 3 slots:
  // Slot centers: Realm = 16.666%, Chatter = 50.000%, Profile = 83.333%
  const dotLeftPercent = useTransform(
    pagePosition,
    (pos) => `${16.666 + (pos / 2) * 66.667}%`
  );

  // 2. Liquid Stretch Effect along X-axis based on velocity
  const scaleX = useTransform(velocity, (v) => {
    const speed = Math.abs(v);
    // Expand dot width up to 2.6x during fast drag / rapid tap transition
    return 1 + Math.min(speed * 0.35, 1.6);
  });

  // 3. Subtle Liquid Squash along Y-axis during stretch
  const scaleY = useTransform(velocity, (v) => {
    const speed = Math.abs(v);
    return 1 - Math.min(speed * 0.12, 0.3);
  });

  // 4. Directional transform origin (stretch forward in direction of travel)
  const transformOrigin = useTransform(velocity, (v) => {
    if (v > 0.05) return '0% 50%'; // Stretching to right
    if (v < -0.05) return '100% 50%'; // Stretching to left
    return '50% 50%'; // Centered at rest
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md px-6 pb-6 pt-2 select-none">
      <div className="relative flex items-center justify-between rounded-full border border-zinc-900 bg-black px-2 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        {/* Continuous Liquid / Elastic Light-Blue Dot */}
        <motion.div
          className="absolute bottom-2.5 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_#00d2ff,0_0_20px_rgba(0,210,255,0.6)] pointer-events-none z-20"
          style={{
            left: dotLeftPercent,
            scaleX,
            scaleY,
            transformOrigin,
          }}
        />

        {/* 1. REALM TAB (Position 0) */}
        <button
          onClick={() => onSelectTab('realm')}
          className="relative z-10 flex flex-1 items-center justify-center py-1 transition active:scale-95"
          aria-label="Realm"
        >
          <GlobeIconWithProximity pagePosition={pagePosition} tabIndex={0} />
        </button>

        {/* 2. CHATTER TAB (Position 1) */}
        <button
          onClick={() => onSelectTab('chatter')}
          className="relative z-10 flex flex-1 items-center justify-center py-1 transition active:scale-95"
          aria-label="Chatter"
        >
          <ChatterIconWithProximity pagePosition={pagePosition} tabIndex={1} />
        </button>

        {/* 3. PROFILE BOB TAB (Position 2) */}
        <button
          onClick={() => onSelectTab('profile')}
          className="relative z-10 flex flex-1 items-center justify-center py-1 transition active:scale-95"
          aria-label="Profile Bob"
        >
          <ProfileIconWithProximity pagePosition={pagePosition} tabIndex={2} />
        </button>
      </div>
    </nav>
  );
};

// Continuous Proximity Icons (Colors, Scale & Glow Interpolate Smoothly)
const GlobeIconWithProximity: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
}> = ({ pagePosition, tabIndex }) => {
  const proximity = useTransform(pagePosition, (pos) => {
    return Math.max(0, 1 - Math.abs(pos - tabIndex));
  });

  const scale = useTransform(proximity, (p) => 1 + p * 0.14);
  const opacity = useTransform(proximity, (p) => 0.5 + p * 0.5);

  return (
    <motion.div style={{ scale, opacity }} className="relative">
      <GlobeIconWithProximityColor pagePosition={pagePosition} tabIndex={tabIndex} />
    </motion.div>
  );
};

const GlobeIconWithProximityColor: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
}> = ({ pagePosition, tabIndex }) => {
  const colorClass = useTransform(pagePosition, (pos) => {
    const prox = Math.max(0, 1 - Math.abs(pos - tabIndex));
    if (prox > 0.6) return 'text-cyan-300 drop-shadow-[0_0_12px_rgba(0,210,255,0.85)]';
    if (prox > 0.2) return 'text-zinc-300';
    return 'text-zinc-500';
  });

  // Render with dynamic className wrapper
  const [currentClass, setCurrentClass] = React.useState('text-cyan-300');

  React.useEffect(() => {
    return colorClass.on('change', (v) => setCurrentClass(v));
  }, [colorClass]);

  return <Globe className={`h-6 w-6 transition-colors duration-100 ${currentClass}`} />;
};

const ChatterIconWithProximity: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
}> = ({ pagePosition, tabIndex }) => {
  const proximity = useTransform(pagePosition, (pos) => {
    return Math.max(0, 1 - Math.abs(pos - tabIndex));
  });

  const scale = useTransform(proximity, (p) => 1 + p * 0.14);
  const opacity = useTransform(proximity, (p) => 0.5 + p * 0.5);

  const colorClass = useTransform(pagePosition, (pos) => {
    const prox = Math.max(0, 1 - Math.abs(pos - tabIndex));
    if (prox > 0.6) return 'text-cyan-300 drop-shadow-[0_0_12px_rgba(0,210,255,0.85)]';
    if (prox > 0.2) return 'text-zinc-300';
    return 'text-zinc-500';
  });

  const [currentClass, setCurrentClass] = React.useState('text-zinc-500');

  React.useEffect(() => {
    return colorClass.on('change', (v) => setCurrentClass(v));
  }, [colorClass]);

  return (
    <motion.div style={{ scale, opacity }}>
      <MessageSquare className={`h-6 w-6 transition-colors duration-100 ${currentClass}`} />
    </motion.div>
  );
};

const ProfileIconWithProximity: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
}> = ({ pagePosition, tabIndex }) => {
  const proximity = useTransform(pagePosition, (pos) => {
    return Math.max(0, 1 - Math.abs(pos - tabIndex));
  });

  const scale = useTransform(proximity, (p) => 1 + p * 0.14);
  const opacity = useTransform(proximity, (p) => 0.5 + p * 0.5);

  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    return proximity.on('change', (p) => setIsActive(p > 0.5));
  }, [proximity]);

  return (
    <motion.div style={{ scale, opacity }}>
      <PacmanAvatar size={26} isIconOnly={true} active={isActive} />
    </motion.div>
  );
};

