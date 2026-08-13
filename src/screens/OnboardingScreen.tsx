import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { MessageSquare, Globe, ChevronRight, Sparkles, User, ArrowRight } from 'lucide-react';
import { PacmanAvatar } from '../components/common/PacmanAvatar';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tag: string;
}

const SLIDES: SlideData[] = [
  {
    id: 0,
    title: "Let's Chatter",
    subtitle: "Share thoughts, moments and conversations.",
    icon: <MessageSquare className="h-10 w-10 text-cyan-400" />,
    tag: "CHATTER",
  },
  {
    id: 1,
    title: "Explore realms",
    subtitle: "Find conversations and moments across different realms.",
    icon: <Globe className="h-10 w-10 text-cyan-400" />,
    tag: "REALM",
  },
  {
    id: 2,
    title: "Bob who?",
    subtitle: "Meet your Bob and make Chitter yours.",
    icon: <Sparkles className="h-10 w-10 text-cyan-400" />,
    tag: "CHITTER BOB",
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  // Swipe handle dragging for "Enough chatter!"
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [0, 180], [1, 0.4]);
  const dragScale = useTransform(dragX, [0, 180], [1, 1.05]);
  const trackRef = useRef<HTMLDivElement>(null);

  // Timer for story progress
  useEffect(() => {
    const durationMs = 4500;
    const intervalMs = 50;
    const step = (intervalMs / durationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide((s) => s + 1);
            return 0;
          } else {
            // Stay on last slide at 100%
            return 100;
          }
        }
        return prev + step;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleNextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide((prev) => prev + 1);
      setProgress(0);
    } else {
      handleComplete();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('chitter_onboarding_completed', 'true');
    } catch (_) {}
    onComplete();
  };

  // Drag logic for "Enough chatter!" slider button
  const handleDragEnd = () => {
    const currentX = dragX.get();
    const trackWidth = trackRef.current?.clientWidth || 280;
    const maxDrag = trackWidth - 60; // pill size

    if (currentX > maxDrag * 0.6) {
      handleComplete();
    } else {
      dragX.set(0);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-black text-white overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />

      {/* Top 3 Story / Segmentation Progress Bars */}
      <div className="relative z-20 flex gap-2 px-6 pt-10 pb-4">
        {SLIDES.map((slide, idx) => {
          let barProgress = 0;
          if (idx < currentSlide) barProgress = 100;
          else if (idx === currentSlide) barProgress = progress;

          return (
            <div
              key={slide.id}
              onClick={() => {
                setCurrentSlide(idx);
                setProgress(0);
              }}
              className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800 cursor-pointer"
            >
              <div
                className="h-full bg-cyan-400 shadow-[0_0_8px_#00d2ff] transition-all duration-75 ease-linear"
                style={{ width: `${barProgress}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Header Badge */}
      <div className="relative z-20 flex items-center justify-between px-6 py-2">
        <div className="flex items-center gap-2 rounded-full bg-zinc-900/90 border border-zinc-800/80 px-3 py-1 text-xs font-semibold text-cyan-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          {SLIDES[currentSlide].tag}
        </div>
        <button
          onClick={handleComplete}
          className="text-xs font-medium text-zinc-400 hover:text-white transition px-2 py-1"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Touch Area (Left side = Prev, Right side = Next) */}
      <div className="relative z-20 flex-1 flex flex-col justify-between px-6 pt-4 pb-6">
        <div
          className="absolute inset-0 z-10 flex"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < rect.width * 0.35) {
              handlePrevSlide();
            } else {
              handleNextSlide();
            }
          }}
        >
          <div className="w-1/3 h-full cursor-pointer" />
          <div className="w-2/3 h-full cursor-pointer" />
        </div>

        {/* Animated Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="pointer-events-none relative z-0 flex flex-col items-center justify-center flex-1 text-center py-6"
          >
            {/* Slide Graphic Container */}
            <div className="relative mb-8 flex h-52 w-52 items-center justify-center">
              {/* Animated Outer Orbit Ring */}
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-[spin_12s_linear_infinite]" />
              <div className="absolute inset-3 rounded-full border border-cyan-400/30" />

              {/* Dynamic Graphic Content per Slide */}
              {currentSlide === 0 && (
                <div className="relative flex items-center justify-center">
                  <div className="absolute -left-10 top-0">
                    <PacmanAvatar
                      imageUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop"
                      size={54}
                      hasStory={true}
                    />
                  </div>
                  <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,210,255,0.4)]">
                    <MessageSquare className="h-10 w-10 text-cyan-300" />
                  </div>
                  <div className="absolute -right-10 bottom-0">
                    <PacmanAvatar
                      imageUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"
                      size={54}
                      hasStory={true}
                    />
                  </div>
                </div>
              )}

              {currentSlide === 1 && (
                <div className="relative flex items-center justify-center">
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-black border border-cyan-400/80 shadow-[0_0_40px_rgba(0,210,255,0.35)]">
                    <Globe className="h-14 w-14 text-cyan-400 animate-pulse" />
                  </div>
                  {/* Floating Realm Nodes */}
                  <div className="absolute -top-4 -right-2">
                    <PacmanAvatar
                      imageUrl="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop"
                      size={42}
                    />
                  </div>
                  <div className="absolute -bottom-4 -left-2">
                    <PacmanAvatar
                      imageUrl="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop"
                      size={42}
                    />
                  </div>
                </div>
              )}

              {currentSlide === 2 && (
                <div className="relative flex flex-col items-center justify-center">
                  <div className="relative p-2 rounded-full border-2 border-cyan-400 bg-cyan-950/40 shadow-[0_0_36px_rgba(0,210,255,0.5)]">
                    <PacmanAvatar
                      imageUrl="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop"
                      size={96}
                      hasStory={true}
                      active={true}
                    />
                  </div>
                  <span className="mt-3 rounded-full bg-cyan-400/10 px-3 py-0.5 text-xs font-bold text-cyan-300 border border-cyan-400/30">
                    PAC-MAN CUTOUT BOB
                  </span>
                </div>
              )}
            </div>

            {/* Title & Short Description */}
            <h1 className="text-3xl font-black tracking-tight text-white mb-2">
              {SLIDES[currentSlide].title}
            </h1>
            <p className="max-w-xs text-sm text-zinc-400 leading-relaxed font-normal">
              {SLIDES[currentSlide].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Interactive Action: "Enough chatter!" SWIPE TO PROCEED */}
        <div className="relative z-30 pt-4 pb-2">
          <div
            ref={trackRef}
            className="relative flex h-16 w-full items-center rounded-full border border-zinc-800 bg-zinc-950/90 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-lg overflow-hidden"
          >
            {/* Background text / guide */}
            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold tracking-wider text-zinc-400 pointer-events-none pl-8">
              <span>Enough chatter!</span>
              <div className="ml-2 flex items-center text-cyan-400/70">
                <ChevronRight className="h-4 w-4 animate-pulse" />
                <ChevronRight className="h-4 w-4 -ml-2 animate-pulse delay-75" />
                <ChevronRight className="h-4 w-4 -ml-2 animate-pulse delay-150" />
              </div>
            </div>

            {/* Physical Draggable Swipe Handle Pill */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 220 }}
              dragElastic={0.1}
              dragSnapToOrigin={false}
              onDragEnd={handleDragEnd}
              style={{ x: dragX, opacity: dragOpacity, scale: dragScale }}
              onClick={() => {
                // Tap fallback to complete onboarding
                handleComplete();
              }}
              className="relative z-10 flex h-13 w-28 cursor-grab active:cursor-grabbing items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(0,210,255,0.6)] touch-none"
            >
              <span className="text-xs tracking-wider uppercase font-black mr-1">SWIPE</span>
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </div>
          <p className="mt-2 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
            Drag handle right to start
          </p>
        </div>
      </div>
    </div>
  );
};
