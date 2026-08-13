import React, { useEffect, useRef, useState } from 'react';
import { motion, MotionValue, useTransform, useVelocity, useSpring, animate } from 'motion/react';
import { Camera, Globe, MessageSquare, Plus, RotateCcw, X, Check } from 'lucide-react';
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startPos: 0, moved: false, pointerId: -1 });
  const longPressRef = useRef(false);
  const pressTimerRef = useRef<number | null>(null);

  // The liquid capsule is the draggable object. Its position is the same
  // continuous pagePosition that moves the actual three-screen carousel.
  const liquidCenter = useTransform(pagePosition, (pos) => `${16.666 + (pos / 2) * 66.667}%`);
  const travel = useTransform(pagePosition, (pos) => {
    const clamped = Math.max(0, Math.min(2, pos));
    return Math.min(1, Math.abs(clamped - Math.round(clamped)));
  });
  const liquidWidth = useTransform(travel, [0, 0.12, 0.5], [42, 58, 96]);
  const liquidHeight = useTransform(travel, [0, 0.5], [28, 36]);
  const liquidScaleX = useTransform(velocity, (v) => 1 + Math.min(Math.abs(v) * 0.26, 0.95));
  const liquidScaleY = useTransform(velocity, (v) => 1 - Math.min(Math.abs(v) * 0.05, 0.12));

  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;
    const startCamera = async () => {
      setCameraError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        streamRef.current?.getTracks().forEach((track) => track.stop());
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setCameraError('Camera access is unavailable or permission was denied.');
      }
    };
    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [cameraOpen, facingMode]);

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
      navigator.vibrate?.(12);
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

  // Drag the liquid navigation bar itself. This deliberately lives on the
  // entire black capsule so a drag anywhere on the bar becomes navigation.
  const handleNavPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startPos: pagePosition.get(),
      moved: false,
      pointerId: e.pointerId,
    };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
  };

  const handleNavPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    if (Math.abs(dx) > 4) drag.moved = true;
    if (!drag.moved) return;

    const width = navRef.current?.clientWidth || 320;
    // The three navigation destinations occupy the same horizontal span as
    // the three content pages. Dragging 1/3 of the nav width moves one page.
    let next = drag.startPos - (dx / width) * 2;
    if (next < 0) next *= 0.22;
    if (next > 2) next = 2 + (next - 2) * 0.22;
    pagePosition.set(next);
    e.preventDefault();
  };

  const finishNavDrag = (e?: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (e) {
      try { e.currentTarget.releasePointerCapture(drag.pointerId); } catch (_) {}
    }
    if (!drag.moved) return;

    const current = pagePosition.get();
    const target = Math.max(0, Math.min(2, Math.round(current)));
    animate(pagePosition, target, { type: 'spring', stiffness: 360, damping: 30 });
    onSelectTab((['realm', 'chatter', 'profile'] as HomeTab[])[target]);
  };

  const closeCamera = () => {
    setCameraOpen(false);
    setCapturedImage(null);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;
    canvas.width = video.videoWidth || 1080;
    canvas.height = video.videoHeight || 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
  };

  if (cameraOpen) {
    return (
      <div className="fixed inset-0 z-[70] bg-black">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" className="h-full w-full object-contain" />
        ) : cameraError ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center text-white">
            <Camera className="h-12 w-12 text-cyan-400" />
            <p className="text-sm text-zinc-300">{cameraError}</p>
            <button onClick={closeCamera} className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-black">Close</button>
          </div>
        ) : (
          <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
          <button onClick={closeCamera} className="rounded-full bg-black/60 p-3 text-white backdrop-blur-md" aria-label="Close camera"><X className="h-6 w-6" /></button>
          {!capturedImage && <button onClick={() => setFacingMode((m) => m === 'environment' ? 'user' : 'environment')} className="rounded-full bg-black/60 p-3 text-white backdrop-blur-md" aria-label="Switch camera"><RotateCcw className="h-6 w-6" /></button>}
        </div>
        {capturedImage ? (
          <div className="absolute inset-x-0 bottom-8 flex justify-center gap-3">
            <button onClick={() => setCapturedImage(null)} className="rounded-full bg-black/70 px-6 py-3 font-semibold text-white backdrop-blur-md">Retake</button>
            <button onClick={closeCamera} className="flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 font-bold text-black"><Check className="h-5 w-5" />Done</button>
          </div>
        ) : (
          <button onClick={capturePhoto} className="absolute bottom-8 left-1/2 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white/90 bg-white/10" aria-label="Take photo">
            <span className="h-14 w-14 rounded-full bg-white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md px-6 pb-6 pt-2 select-none">
      <div
        ref={navRef}
        onPointerDown={handleNavPointerDown}
        onPointerMove={handleNavPointerMove}
        onPointerUp={finishNavDrag}
        onPointerCancel={finishNavDrag}
        className="relative flex items-center justify-between rounded-full border border-zinc-900 bg-black/95 px-2 py-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        style={{ touchAction: 'none' }}
      >
        <motion.div aria-hidden="true" className="pointer-events-none absolute bottom-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/15 ring-1 ring-cyan-300/25" style={{ left: liquidCenter, width: liquidWidth, height: liquidHeight, scaleX: liquidScaleX, scaleY: liquidScaleY, transformOrigin: '50% 50%' }} />
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
