import React, { useRef, useState } from 'react';
import { motion, MotionValue, useTransform, useVelocity, useSpring } from 'motion/react';
import { Camera, Globe, MessageSquare, Plus } from 'lucide-react';
import { HomeTab } from '../../types';
import { PacmanAvatar } from './PacmanAvatar';

interface BottomNavProps {
  pagePosition: MotionValue<number>;
  activeTab: HomeTab;
  onSelectTab: (tab: HomeTab) => void;
  onOpenNewChit: () => void;
  onOpenCamera: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  pagePosition,
  onSelectTab,
  onOpenNewChit,
  onOpenCamera,
}) => {
  const rawVelocity = useVelocity(pagePosition);
  const velocity = useSpring(rawVelocity, { stiffness: 260, damping: 24 });
  const [realmActionsOpen, setRealmActionsOpen] = useState(false);
  const longPressRef = useRef(false);
  const pressTimerRef = useRef<number | null>(null);

  // The liquid is positioned in the SAME 0..2 coordinate system as the page.
  const liquidCenter = useTransform(pagePosition, (pos) => `${16.666 + (pos / 2) * 66.667}%`);
  const fractionalMotion = useTransform(pagePosition, (pos) => {
    const nearest = Math.round(Math.max(0, Math.min(2, pos)));
    return Math.min(1, Math.abs(pos - nearest));
  });
  const liquidWidth = useTransform(fractionalMotion, [0, 0.15, 0.5], [38, 54, 86]);
  const liquidScaleX = useTransform(velocity, (v) => 1 + Math.min(Math.abs(v) * 0.22, 0.85));
  const liquidScaleY = useTransform(velocity, (v) => 1 - Math.min(Math.abs(v) * 0.05, 0.12));
  const liquidBlur = useTransform(velocity, (v) => Math.min(Math.abs(v) * 1.2, 5));

  const clearPressTimer = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleRealmPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    longPressRef.current = false;
    clearPressTimer();
    pressTimerRef.current = window.setTimeout(() => {
      longPressRef.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(12);
      setRealmActionsOpen(true);
    }, 520);
  };

  const handleRealmPointerUp = () => {
    clearPressTimer();
    if (!longPressRef.current) onSelectTab('realm');
    longPressRef.current = false;
  };

  const handleRealmPointerCancel = () => {
    clearPressTimer();
    longPressRef.current = false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md px-6 pb-6 pt-2 select-none">
      <div className="relative flex items-center justify-between rounded-full border border-zinc-900 bg-black/95 px-2 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        {/* This is the navigation element that changes shape during the drag.
            It is deliberately a liquid capsule, not a second independent dot animation. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 left-0 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/15 ring-1 ring-cyan-300/25"
          style={{
            left: liquidCenter,
            width: liquidWidth,
            scaleX: liquidScaleX,
            scaleY: liquidScaleY,
            filter: useTransform(liquidBlur, (b) => `blur(${b}px)`),
            transformOrigin: '50% 50%',
          }}
        />

        {/* Small light-blue dot remains visible at rest, while the liquid bar expands around it. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2.5 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_#00d2ff,0_0_18px_rgba(0,210,255,0.65)] z-20"
          style={{ left: liquidCenter, scaleX: liquidScaleX }}
        />

        <button
          onPointerDown={handleRealmPointerDown}
          onPointerUp={handleRealmPointerUp}
          onPointerCancel={handleRealmPointerCancel}
          onPointerLeave={handleRealmPointerCancel}
          className="relative z-30 flex flex-1 items-center justify-center py-1 active:scale-95"
          aria-label="Realm"
        >
          <Globe className="h-6 w-6 text-zinc-300" />
        </button>

        <button
          onClick={() => onSelectTab('chatter')}
          className="relative z-30 flex flex-1 items-center justify-center py-1 active:scale-95"
          aria-label="Chatter"
        >
          <motion.span
            className="text-zinc-300"
            style={{ scale: useTransform(pagePosition, (pos) => 1 + Math.max(0, 1 - Math.abs(pos - 1)) * 0.16) }}
          >
            <MessageSquare className="h-6 w-6" />
          </motion.span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className="relative z-30 flex flex-1 items-center justify-center py-1 active:scale-95"
          aria-label="Profile Bob"
        >
          <motion.span
            style={{ scale: useTransform(pagePosition, (pos) => 1 + Math.max(0, 1 - Math.abs(pos - 2)) * 0.16) }}
          >
            <PacmanAvatar size={26} isIconOnly active={false} />
          </motion.span>
        </button>

        {realmActionsOpen && (
          <>
            <button
              aria-label="Close Realm actions"
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setRealmActionsOpen(false)}
            />
            <div className="absolute bottom-[calc(100%+14px)] left-0 z-50 flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  setRealmActionsOpen(false);
                  onOpenCamera();
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-black text-cyan-300 shadow-[0_8px_24px_rgba(0,0,0,.5)] transition hover:scale-105"
                aria-label="Open Realm camera"
              >
                <Camera className="h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  setRealmActionsOpen(false);
                  onOpenNewChit();
                }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400 text-black shadow-[0_8px_24px_rgba(0,210,255,.25)] transition hover:scale-105"
                aria-label="Create Realm post"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
