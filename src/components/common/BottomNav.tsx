import React, { useEffect, useRef, useState } from 'react';
import { motion, MotionValue, useTransform, useVelocity, useSpring } from 'motion/react';
import { Camera, Globe, MessageSquare, Plus, RotateCcw, X } from 'lucide-react';
import { HomeTab } from '../../types';
import { PacmanAvatar } from './PacmanAvatar';
import { useChitter } from '../../context/ChitterContext';

interface BottomNavProps {
  pagePosition: MotionValue<number>;
  activeTab: HomeTab;
  onSelectTab: (tab: HomeTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ pagePosition, onSelectTab }) => {
  const { setNewChitModalOpen } = useChitter();
  const rawVelocity = useVelocity(pagePosition);
  const velocity = useSpring(rawVelocity, { stiffness: 260, damping: 24 });
  const [realmActionsOpen, setRealmActionsOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const longPressRef = useRef(false);
  const pressTimerRef = useRef<number | null>(null);

  // The NAV BAR ITSELF is the reactive object. Its center uses the same 0..2
  // pagePosition as the content; fractional positions make the bar stretch.
  const liquidCenter = useTransform(pagePosition, (pos) => `${16.666 + (pos / 2) * 66.667}%`);
  const travel = useTransform(pagePosition, (pos) => {
    const clamped = Math.max(0, Math.min(2, pos));
    return Math.min(1, Math.abs(clamped - Math.round(clamped)));
  });
  const liquidWidth = useTransform(travel, [0, 0.12, 0.5], [38, 52, 92]);
  const liquidHeight = useTransform(travel, [0, 0.5], [26, 32]);
  const liquidScaleX = useTransform(velocity, (v) => 1 + Math.min(Math.abs(v) * 0.22, 0.85));
  const liquidScaleY = useTransform(velocity, (v) => 1 - Math.min(Math.abs(v) * 0.05, 0.12));

  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;
    const startCamera = async () => {
      setCameraError(null);
      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      } catch { setCameraError('Camera access is unavailable or permission was denied.'); }
    };
    startCamera();
    return () => { cancelled = true; streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };
  }, [cameraOpen, facingMode]);

  const clearPressTimer = () => {
    if (pressTimerRef.current !== null) { window.clearTimeout(pressTimerRef.current); pressTimerRef.current = null; }
  };

  const handleRealmPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    longPressRef.current = false;
    clearPressTimer();
    pressTimerRef.current = window.setTimeout(() => {
      longPressRef.current = true;
      navigator.vibrate?.(12);
      setRealmActionsOpen(true);
    }, 520);
  };

  const handleRealmPointerUp = () => {
    clearPressTimer();
    if (!longPressRef.current) onSelectTab('realm');
    longPressRef.current = false;
  };

  const handleRealmPointerCancel = () => { clearPressTimer(); longPressRef.current = false; };
  const closeCamera = () => { setCameraOpen(false); streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; };

  if (cameraOpen) {
    return (
      <div className="fixed inset-0 z-[70] bg-black">
        {cameraError ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center text-white"><Camera className="h-12 w-12 text-cyan-400" /><p className="text-sm text-zinc-300">{cameraError}</p><button onClick={closeCamera} className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-black">Close</button></div>
        ) : <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <button onClick={closeCamera} className="rounded-full bg-black/60 p-3 text-white backdrop-blur-md"><X className="h-6 w-6" /></button>
          <button onClick={() => setFacingMode((m) => m === 'environment' ? 'user' : 'environment')} className="rounded-full bg-black/60 p-3 text-white backdrop-blur-md" aria-label="Switch camera"><RotateCcw className="h-6 w-6" /></button>
        </div>
        <div className="absolute inset-x-0 bottom-8 flex justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/90 bg-white/10"><div className="h-11 w-11 rounded-full bg-white" /></div></div>
      </div>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md px-6 pb-6 pt-2 select-none">
      <div className="relative flex items-center justify-between rounded-full border border-zinc-900 bg-black/95 px-2 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <motion.div aria-hidden="true" className="pointer-events-none absolute bottom-2 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/15 ring-1 ring-cyan-300/25" style={{ left: liquidCenter, width: liquidWidth, height: liquidHeight, scaleX: liquidScaleX, scaleY: liquidScaleY, transformOrigin: '50% 50%' }} />
        <motion.div aria-hidden="true" className="pointer-events-none absolute bottom-2.5 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_#00d2ff,0_0_18px_rgba(0,210,255,0.65)] z-20" style={{ left: liquidCenter, scaleX: liquidScaleX }} />

        <button onPointerDown={handleRealmPointerDown} onPointerUp={handleRealmPointerUp} onPointerCancel={handleRealmPointerCancel} onPointerLeave={handleRealmPointerCancel} className="relative z-30 flex flex-1 items-center justify-center py-1 active:scale-95" aria-label="Realm"><motion.span style={{ scale: useTransform(pagePosition, (pos) => 1 + Math.max(0, 1 - Math.abs(pos)) * 0.18) }}><Globe className="h-6 w-6 text-zinc-300" /></motion.span></button>
        <button onClick={() => onSelectTab('chatter')} className="relative z-30 flex flex-1 items-center justify-center py-1 active:scale-95" aria-label="Chatter"><motion.span style={{ scale: useTransform(pagePosition, (pos) => 1 + Math.max(0, 1 - Math.abs(pos - 1)) * 0.18) }}><MessageSquare className="h-6 w-6 text-zinc-300" /></motion.span></button>
        <button onClick={() => onSelectTab('profile')} className="relative z-30 flex flex-1 items-center justify-center py-1 active:scale-95" aria-label="Profile Bob"><motion.span style={{ scale: useTransform(pagePosition, (pos) => 1 + Math.max(0, 1 - Math.abs(pos - 2)) * 0.18) }}><PacmanAvatar size={26} isIconOnly active={false} /></motion.span></button>

        {realmActionsOpen && (
          <>
            <button aria-label="Close Realm actions" className="fixed inset-0 z-20 cursor-default" onClick={() => setRealmActionsOpen(false)} />
            <div className="absolute bottom-[calc(100%+14px)] left-[16.666%] z-50 flex -translate-x-1/2 flex-col items-center gap-3">
              <button onClick={() => { setRealmActionsOpen(false); setCameraOpen(true); }} className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-black text-cyan-300 shadow-[0_8px_24px_rgba(0,0,0,.5)] transition hover:scale-105" aria-label="Open Realm camera"><Camera className="h-5 w-5" /></button>
              <button onClick={() => { setRealmActionsOpen(false); setNewChitModalOpen(true); }} className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400 text-black shadow-[0_8px_24px_rgba(0,210,255,.25)] transition hover:scale-105" aria-label="Create Realm post"><Plus className="h-6 w-6" /></button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
