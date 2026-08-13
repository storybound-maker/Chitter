import React, { useRef } from 'react';
import {
  motion,
  MotionValue,
  useTransform,
  useVelocity,
  useSpring,
  animate,
  useMotionValue,
} from 'motion/react';
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
  const tabs: HomeTab[] = ['realm', 'chatter', 'profile'];
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Physical motion values for elastic deformation of the rounded navbar container
  const navContainerX = useMotionValue(0);
  const navContainerScaleX = useMotionValue(1);
  const navContainerScaleY = useMotionValue(1);
  const navContainerSkewX = useMotionValue(0);

  // Smooth springs for elastic return to standard shape
  const springNavX = useSpring(navContainerX, { stiffness: 320, damping: 25 });
  const springNavScaleX = useSpring(navContainerScaleX, { stiffness: 320, damping: 25 });
  const springNavScaleY = useSpring(navContainerScaleY, { stiffness: 320, damping: 25 });
  const springNavSkewX = useSpring(navContainerSkewX, { stiffness: 320, damping: 25 });

  // Velocity derived from continuous pagePosition for liquid dot stretch
  const rawVelocity = useVelocity(pagePosition);
  const velocity = useSpring(rawVelocity, { stiffness: 280, damping: 22 });

  // 1. Continuous Horizontal Position for the Light-Blue Dot across 3 slot centers:
  // Slot positions: Realm = 16.666%, Chatter = 50.000%, Profile = 83.333%
  const dotLeftPercent = useTransform(
    pagePosition,
    (pos: number) => `${16.666 + (pos / 2) * 66.667}%`
  );

  // 2. Liquid Dot Stretch Effect along X-axis
  const dotScaleX = useTransform(velocity, (v) => {
    const speed = Math.abs(v);
    return 1 + Math.min(speed * 0.35, 1.5);
  });

  // 3. Subtle Liquid Squash along Y-axis
  const dotScaleY = useTransform(velocity, (v) => {
    const speed = Math.abs(v);
    return 1 - Math.min(speed * 0.12, 0.28);
  });

  // 4. Directional transform origin for dot stretch
  const dotTransformOrigin = useTransform(velocity, (v) => {
    if (v > 0.05) return '0% 50%';
    if (v < -0.05) return '100% 50%';
    return '50% 50%';
  });

  // Pointer drag state for physical navbar controller
  const dragRef = useRef<{
    isDragging: boolean;
    hasMoved: boolean;
    startX: number;
    startPagePos: number;
    lastX: number;
    lastTime: number;
    velocity: number;
  }>({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startPagePos: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const startX = e.clientX;
    const startPagePos = pagePosition.get();

    dragRef.current = {
      isDragging: true,
      hasMoved: false,
      startX,
      startPagePos,
      lastX: startX,
      lastTime: performance.now(),
      velocity: 0,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.isDragging) return;

    const currentX = e.clientX;
    const dx = currentX - drag.startX;

    if (Math.abs(dx) > 6) {
      drag.hasMoved = true;
    }

    const now = performance.now();
    const dt = now - drag.lastTime;
    if (dt > 0) {
      drag.velocity = (currentX - drag.lastX) / dt;
      drag.lastX = currentX;
      drag.lastTime = now;
    }

    // Convert pixel dx into pagePosition change
    const barWidth = navContainerRef.current?.clientWidth || 320;
    const stepPx = barWidth / 2.2;
    const deltaPage = dx / stepPx;
    let targetPagePos = drag.startPagePos + deltaPage;

    // Resistance past boundaries
    if (targetPagePos < 0) {
      targetPagePos = targetPagePos * 0.22;
    } else if (targetPagePos > 2) {
      targetPagePos = 2 + (targetPagePos - 2) * 0.22;
    }

    // Direct 1:1 update of master continuous pagePosition
    pagePosition.set(targetPagePos);

    // PHYSICAL NAVBAR CONTAINER DEFORMATION
    // Translate container in direction of drag
    const physicalXOffset = Math.max(-42, Math.min(42, dx * 0.25));
    navContainerX.set(physicalXOffset);

    // Elastic horizontal stretching and vertical squishing
    const stretchAmount = Math.min(Math.abs(dx) * 0.0015, 0.14);
    navContainerScaleX.set(1 + stretchAmount);
    navContainerScaleY.set(1 - stretchAmount * 0.45);

    // Liquid skew
    const skewAmount = Math.max(-6, Math.min(6, drag.velocity * -3.5));
    navContainerSkewX.set(skewAmount);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.isDragging) return;
    drag.isDragging = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

    // Spring physical navbar container back to standard shape and position
    navContainerX.set(0);
    navContainerScaleX.set(1);
    navContainerScaleY.set(1);
    navContainerSkewX.set(0);

    if (drag.hasMoved) {
      const currentPos = pagePosition.get();
      const vel = drag.velocity;

      let targetIndex = Math.round(currentPos);
      if (vel > 0.35) {
        targetIndex = Math.min(2, Math.floor(drag.startPagePos) + 1);
        if (currentPos > 1.2) targetIndex = 2;
      } else if (vel < -0.35) {
        targetIndex = Math.max(0, Math.ceil(drag.startPagePos) - 1);
        if (currentPos < 0.8) targetIndex = 0;
      } else {
        targetIndex = Math.min(2, Math.max(0, Math.round(currentPos)));
      }

      animate(pagePosition, targetIndex, {
        type: 'spring',
        stiffness: 340,
        damping: 30,
        velocity: vel * 3,
      });

      onSelectTab(tabs[targetIndex]);
    }
  };

  const handleTabClick = (tab: HomeTab, e: React.MouseEvent) => {
    if (dragRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onSelectTab(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md px-6 pb-6 pt-2 select-none touch-none pointer-events-auto">
      {/* Draggable Liquid Black Rounded Navbar Container */}
      <motion.div
        ref={navContainerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex items-center justify-between rounded-full border border-zinc-900 bg-black px-2 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.95)] backdrop-blur-xl touch-none cursor-grab active:cursor-grabbing will-change-transform"
        style={{
          x: springNavX,
          scaleX: springNavScaleX,
          scaleY: springNavScaleY,
          skewX: springNavSkewX,
        }}
      >
        {/* Continuous Liquid Light-Blue Active Dot */}
        <motion.div
          className="absolute bottom-2.5 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_#00d2ff,0_0_20px_rgba(0,210,255,0.6)] pointer-events-none z-20"
          style={{
            left: dotLeftPercent,
            scaleX: dotScaleX,
            scaleY: dotScaleY,
            transformOrigin: dotTransformOrigin,
          }}
        />

        {/* 1. REALM TAB (Position 0) */}
        <button
          onClick={(e) => handleTabClick('realm', e)}
          className="relative z-10 flex flex-1 items-center justify-center py-1 transition active:scale-95"
          aria-label="Realm"
        >
          <GlobeIconWithProximity pagePosition={pagePosition} tabIndex={0} />
        </button>

        {/* 2. CHATTER TAB (Position 1) */}
        <button
          onClick={(e) => handleTabClick('chatter', e)}
          className="relative z-10 flex flex-1 items-center justify-center py-1 transition active:scale-95"
          aria-label="Chatter"
        >
          <ChatterIconWithProximity pagePosition={pagePosition} tabIndex={1} />
        </button>

        {/* 3. PROFILE BOB TAB (Position 2) */}
        <button
          onClick={(e) => handleTabClick('profile', e)}
          className="relative z-10 flex flex-1 items-center justify-center py-1 transition active:scale-95"
          aria-label="Profile Bob"
        >
          <ProfileIconWithProximity pagePosition={pagePosition} tabIndex={2} />
        </button>
      </motion.div>
    </nav>
  );
};

// Continuous Proximity Icons (GPU-accelerated dual icon crossfade and scale)
const GlobeIconWithProximity: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
}> = ({ pagePosition, tabIndex }) => {
  const proximity = useTransform(pagePosition, (pos: number) => {
    return Math.max(0, 1 - Math.abs(pos - tabIndex));
  });

  const scale = useTransform(proximity, (p: number) => 1 + p * 0.15);
  const activeOpacity = useTransform(proximity, (p: number) => Math.pow(p, 1.5));
  const inactiveOpacity = useTransform(proximity, (p: number) => 1 - Math.pow(p, 1.5));

  return (
    <motion.div style={{ scale }} className="relative flex items-center justify-center h-7 w-7">
      <motion.div style={{ opacity: inactiveOpacity }} className="absolute">
        <Globe className="h-6 w-6 text-zinc-500" />
      </motion.div>
      <motion.div style={{ opacity: activeOpacity }} className="absolute">
        <Globe className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_12px_rgba(0,210,255,0.9)]" />
      </motion.div>
    </motion.div>
  );
};

const ChatterIconWithProximity: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
}> = ({ pagePosition, tabIndex }) => {
  const proximity = useTransform(pagePosition, (pos: number) => {
    return Math.max(0, 1 - Math.abs(pos - tabIndex));
  });

  const scale = useTransform(proximity, (p: number) => 1 + p * 0.15);
  const activeOpacity = useTransform(proximity, (p: number) => Math.pow(p, 1.5));
  const inactiveOpacity = useTransform(proximity, (p: number) => 1 - Math.pow(p, 1.5));

  return (
    <motion.div style={{ scale }} className="relative flex items-center justify-center h-7 w-7">
      <motion.div style={{ opacity: inactiveOpacity }} className="absolute">
        <MessageSquare className="h-6 w-6 text-zinc-500" />
      </motion.div>
      <motion.div style={{ opacity: activeOpacity }} className="absolute">
        <MessageSquare className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_12px_rgba(0,210,255,0.9)]" />
      </motion.div>
    </motion.div>
  );
};

const ProfileIconWithProximity: React.FC<{
  pagePosition: MotionValue<number>;
  tabIndex: number;
}> = ({ pagePosition, tabIndex }) => {
  const proximity = useTransform(pagePosition, (pos: number) => {
    return Math.max(0, 1 - Math.abs(pos - tabIndex));
  });

  const scale = useTransform(proximity, (p: number) => 1 + p * 0.15);
  const activeOpacity = useTransform(proximity, (p: number) => Math.pow(p, 1.5));
  const inactiveOpacity = useTransform(proximity, (p: number) => 1 - Math.pow(p, 1.5));

  return (
    <motion.div style={{ scale }} className="relative flex items-center justify-center h-7 w-7">
      <motion.div style={{ opacity: inactiveOpacity }} className="absolute">
        <PacmanAvatar size={26} isIconOnly={true} active={false} />
      </motion.div>
      <motion.div style={{ opacity: activeOpacity }} className="absolute">
        <PacmanAvatar size={26} isIconOnly={true} active={true} />
      </motion.div>
    </motion.div>
  );
};


