import React, { useRef, useState } from 'react';
import {
  motion,
  MotionValue,
  useTransform,
  useVelocity,
  useSpring,
  animate,
  useMotionValue,
} from 'motion/react';
import { Globe, MessageSquare, Plus, Camera, RefreshCw } from 'lucide-react';
import { HomeTab } from '../../types';
import { PacmanAvatar } from './PacmanAvatar';

interface BottomNavProps {
  pagePosition: MotionValue<number>;
  activeTab: HomeTab;
  onSelectTab: (tab: HomeTab) => void;
  onOpenNewChit?: () => void;
  onOpenCamera?: () => void;
  onRefreshPage?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  pagePosition,
  onSelectTab,
  onOpenNewChit,
  onOpenCamera,
  onRefreshPage,
}) => {
  const tabs: HomeTab[] = ['realm', 'chatter', 'profile'];
  const navContainerRef = useRef<HTMLDivElement>(null);
  const realmLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const realmLongPressTriggered = useRef(false);
  const [showRealmQuickActions, setShowRealmQuickActions] = useState(false);

  // Existing liquid navbar physics — intentionally preserved.
  const navContainerX = useMotionValue(0);
  const navContainerScaleX = useMotionValue(1);
  const navContainerScaleY = useMotionValue(1);
  const navContainerSkewX = useMotionValue(0);

  const springNavX = useSpring(navContainerX, { stiffness: 320, damping: 25 });
  const springNavScaleX = useSpring(navContainerScaleX, { stiffness: 320, damping: 25 });
  const springNavScaleY = useSpring(navContainerScaleY, { stiffness: 320, damping: 25 });
  const springNavSkewX = useSpring(navContainerSkewX, { stiffness: 320, damping: 25 });

  const rawVelocity = useVelocity(pagePosition);
  const velocity = useSpring(rawVelocity, { stiffness: 280, damping: 22 });

  const dotLeftPercent = useTransform(
    pagePosition,
    (pos: number) => `${16.666 + (pos / 2) * 66.667}%`
  );

  const dotScaleX = useTransform(velocity, (v) => {
    const speed = Math.abs(v);
    return 1 + Math.min(speed * 0.35, 1.5);
  });

  const dotScaleY = useTransform(velocity, (v) => {
    const speed = Math.abs(v);
    return 1 - Math.min(speed * 0.12, 0.28);
  });

  const dotTransformOrigin = useTransform(velocity, (v) => {
    if (v > 0.05) return '0% 50%';
    if (v < -0.05) return '100% 50%';
    return '50% 50%';
  });

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

  const clearRealmLongPress = () => {
    if (realmLongPressTimer.current) {
      clearTimeout(realmLongPressTimer.current);
      realmLongPressTimer.current = null;
    }
  };

  const handleRealmLongPressStart = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    realmLongPressTriggered.current = false;
    clearRealmLongPress();
    realmLongPressTimer.current = setTimeout(() => {
      realmLongPressTriggered.current = true;
      setShowRealmQuickActions(true);
      try {
        if (navigator.vibrate) navigator.vibrate(40);
      } catch (_) {}
    }, 500);
  };

  const handleRealmLongPressEnd = () => clearRealmLongPress();

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
      clearRealmLongPress();
    }

    const now = performance.now();
    const dt = now - drag.lastTime;
    if (dt > 0) {
      drag.velocity = (currentX - drag.lastX) / dt;
      drag.lastX = currentX;
      drag.lastTime = now;
    }

    const barWidth = navContainerRef.current?.clientWidth || 320;
    const stepPx = barWidth / 2.2;
    const deltaPage = dx / stepPx;
    let targetPagePos = drag.startPagePos + deltaPage;

    if (targetPagePos < 0) targetPagePos *= 0.22;
    else if (targetPagePos > 2) targetPagePos = 2 + (targetPagePos - 2) * 0.22;

    pagePosition.set(targetPagePos);

    const physicalXOffset = Math.max(-42, Math.min(42, dx * 0.25));
    navContainerX.set(physicalXOffset);

    const stretchAmount = Math.min(Math.abs(dx) * 0.0015, 0.14);
    navContainerScaleX.set(1 + stretchAmount);
    navContainerScaleY.set(1 - stretchAmount * 0.45);

    const skewAmount = Math.max(-6, Math.min(6, drag.velocity * -3.5));
    navContainerSkewX.set(skewAmount);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag.isDragging) return;
    drag.isDragging = false;
    clearRealmLongPress();

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}

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
    if (tab === 'realm' && realmLongPressTriggered.current) {
      e.preventDefault();
      e.stopPropagation();
      realmLongPressTriggered.current = false;
      return;
    }
    if (dragRef.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onSelectTab(tab);
  };

  const openRealmAction = (action: 'add' | 'camera' | 'refresh') => {
    setShowRealmQuickActions(false);
    if (action === 'add') onOpenNewChit?.();
    if (action === 'camera') onOpenCamera?.();
    if (action === 'refresh') onRefreshPage?.();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md px-6 pb-6 pt-2 select-none touch-none pointer-events-auto">
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
        <motion.div
          className="absolute bottom-2.5 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_#00d2ff,0_0_20px_rgba(0,210,255,0.6)] pointer-events-none z-20"
          style={{
            left: dotLeftPercent,
            scaleX: dotScaleX,
            scaleY: dotScaleY,
            transformOrigin: dotTransformOrigin,
          }}
        />

        <button
          onClick={(e) => handleTabClick('realm', e)}
          onPointerDown={handleRealmLongPressStart}
          onPointerUp={handleRealmLongPressEnd}
          onPointerCancel={handleRealmLongPressEnd}
          className="relative z-10 flex flex-1 items-center justify-center py-1 transition active:scale-95"
          aria-label="Realm — long press for quick actions"
        >
          <GlobeIconWithProximity pagePosition={pagePosition} tabIndex={0} />
        </button>

        <button
          onClick={(e) => handleTabClick('chatter', e)}
          className="relative z-10 flex flex-1 items-center justify-center py-1 transition active:scale-95"
          aria-label="Chatter"
        >
          <ChatterIconWithProximity pagePosition={pagePosition} tabIndex={1} />
        </button>

        <button
          onClick={(e) => handleTabClick('profile', e)}
          className="relative z-10 flex flex-1 items-center justify-center py-1 transition active:scale-95"
          aria-label="Profile Bob"
        >
          <ProfileIconWithProximity pagePosition={pagePosition} tabIndex={2} />
        </button>

        {showRealmQuickActions && (
          <>
            <div
              className="fixed inset-0 z-[70] bg-black/35"
              onPointerDown={(e) => {
                e.stopPropagation();
                setShowRealmQuickActions(false);
              }}
              aria-hidden="true"
            />
            <div className="fixed bottom-24 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2.5 rounded-3xl border border-zinc-800 bg-black/95 p-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.75)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => openRealmAction('refresh')}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-200 transition hover:border-cyan-400 hover:text-cyan-300 active:scale-90"
                aria-label="Refresh page"
                title="Refresh page"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => openRealmAction('camera')}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/70 bg-zinc-950 text-cyan-300 shadow-[0_0_18px_rgba(0,210,255,0.25)] transition hover:bg-cyan-400 hover:text-black active:scale-90"
                aria-label="Open camera"
                title="Camera"
              >
                <Camera className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => openRealmAction('add')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-400 text-black shadow-[0_0_18px_rgba(0,210,255,0.55)] transition hover:bg-cyan-300 active:scale-90"
                aria-label="Add Chit"
                title="Add"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </nav>
  );
};

const GlobeIconWithProximity: React.FC<{ pagePosition: MotionValue<number>; tabIndex: number }> = ({ pagePosition, tabIndex }) => {
  const proximity = useTransform(pagePosition, (pos: number) => Math.max(0, 1 - Math.abs(pos - tabIndex)));
  const scale = useTransform(proximity, (p: number) => 1 + p * 0.15);
  const activeOpacity = useTransform(proximity, (p: number) => Math.pow(p, 1.5));
  const inactiveOpacity = useTransform(proximity, (p: number) => 1 - Math.pow(p, 1.5));

  return (
    <motion.div style={{ scale }} className="relative flex items-center justify-center h-7 w-7">
      <motion.div style={{ opacity: inactiveOpacity }} className="absolute"><Globe className="h-6 w-6 text-zinc-500" /></motion.div>
      <motion.div style={{ opacity: activeOpacity }} className="absolute"><Globe className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_12px_rgba(0,210,255,0.9)]" /></motion.div>
    </motion.div>
  );
};

const ChatterIconWithProximity: React.FC<{ pagePosition: MotionValue<number>; tabIndex: number }> = ({ pagePosition, tabIndex }) => {
  const proximity = useTransform(pagePosition, (pos: number) => Math.max(0, 1 - Math.abs(pos - tabIndex)));
  const scale = useTransform(proximity, (p: number) => 1 + p * 0.15);
  const activeOpacity = useTransform(proximity, (p: number) => Math.pow(p, 1.5));
  const inactiveOpacity = useTransform(proximity, (p: number) => 1 - Math.pow(p, 1.5));

  return (
    <motion.div style={{ scale }} className="relative flex items-center justify-center h-7 w-7">
      <motion.div style={{ opacity: inactiveOpacity }} className="absolute"><MessageSquare className="h-6 w-6 text-zinc-500" /></motion.div>
      <motion.div style={{ opacity: activeOpacity }} className="absolute"><MessageSquare className="h-6 w-6 text-cyan-300 drop-shadow-[0_0_12px_rgba(0,210,255,0.9)]" /></motion.div>
    </motion.div>
  );
};

const ProfileIconWithProximity: React.FC<{ pagePosition: MotionValue<number>; tabIndex: number }> = ({ pagePosition, tabIndex }) => {
  const proximity = useTransform(pagePosition, (pos: number) => Math.max(0, 1 - Math.abs(pos - tabIndex)));
  const scale = useTransform(proximity, (p: number) => 1 + p * 0.15);
  const activeOpacity = useTransform(proximity, (p: number) => Math.pow(p, 1.5));
  const inactiveOpacity = useTransform(proximity, (p: number) => 1 - Math.pow(p, 1.5));

  return (
    <motion.div style={{ scale }} className="relative flex items-center justify-center h-7 w-7">
      <motion.div style={{ opacity: inactiveOpacity }} className="absolute"><PacmanAvatar size={26} isIconOnly={true} active={false} /></motion.div>
      <motion.div style={{ opacity: activeOpacity }} className="absolute"><PacmanAvatar size={26} isIconOnly={true} active={true} /></motion.div>
    </motion.div>
  );
};
