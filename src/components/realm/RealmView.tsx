import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Plus, Camera, Sparkles, Flame, Users, Bell } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';
import { RealmPostCard } from './RealmPostCard';
import { PacmanAvatar } from '../common/PacmanAvatar';

interface RealmViewProps {
  onOpenNewChit: () => void;
  onOpenCamera: () => void;
}

const MOCK_REALM_STORIES = [
  { id: '1', name: 'Irma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop', live: true },
  { id: '2', name: 'Amanda', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop', live: false },
  { id: '3', name: 'Luiz', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop', live: false },
  { id: '4', name: 'Nina', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop', live: false },
  { id: '5', name: 'Izaa', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop', live: false },
];

export const RealmView: React.FC<RealmViewProps> = ({
  onOpenNewChit,
  onOpenCamera,
}) => {
  const { realmPosts, userProfile } = useChitter();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'trending' | 'bobs'>('all');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // LONG PRESS HANDLERS FOR REALM GLOBE
  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => {
      try {
        if (navigator.vibrate) navigator.vibrate(40);
      } catch (_) {}
      setShowQuickActions(true);
    }, 420);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="relative min-h-full pb-28 text-white select-none">
      {/* Realm Sub-Header & Globe Control */}
      <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md px-4 py-3 border-b border-zinc-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Interactive Realm Globe Icon with Long-Press Handler */}
            <div className="relative">
              <div
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onClick={() => {
                  if (!showQuickActions) {
                    // Normal tap feedback
                  }
                }}
                className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-cyan-950/80 border border-cyan-400/60 shadow-[0_0_15px_rgba(0,210,255,0.3)] transition active:scale-90 hover:border-cyan-300"
                title="Press and hold for Quick Actions"
              >
                <Globe className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition" />
              </div>

              {/* Floating Action Bubbles on Long Press */}
              <AnimatePresence>
                {showQuickActions && (
                  <>
                    {/* Backdrop dismiss */}
                    <div
                      className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
                      onClick={() => setShowQuickActions(false)}
                    />

                    <div className="absolute left-0 top-12 z-50 flex flex-col items-center gap-3">
                      {/* UPPER BUBBLE: CAMERA */}
                      <motion.button
                        initial={{ opacity: 0, y: 20, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                        onClick={() => {
                          setShowQuickActions(false);
                          onOpenCamera();
                        }}
                        className="group flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border-2 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(0,210,255,0.6)] hover:bg-cyan-400 hover:text-black transition"
                        title="Open Chitter Camera"
                      >
                        <Camera className="h-6 w-6" />
                      </motion.button>

                      {/* LOWER BUBBLE: ADD POST */}
                      <motion.button
                        initial={{ opacity: 0, y: 10, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.05 }}
                        onClick={() => {
                          setShowQuickActions(false);
                          onOpenNewChit();
                        }}
                        className="group flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-black shadow-[0_0_20px_#00d2ff] hover:bg-cyan-300 transition"
                        title="New Realm Chit"
                      >
                        <Plus className="h-6 w-6 font-bold" />
                      </motion.button>
                    </div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                Chitter Realm
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  LIVE
                </span>
              </h2>
              <p className="text-[11px] text-zinc-500 font-medium">Hold globe for quick post/camera</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenNewChit}
              className="flex items-center justify-center rounded-full bg-cyan-400 px-3 py-1.5 text-xs font-black text-black shadow-[0_0_12px_#00d2ff] hover:bg-cyan-300 active:scale-95 transition"
            >
              <Plus className="h-3.5 w-3.5 mr-1 font-extrabold" />
              Chit
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              activeCategory === 'all'
                ? 'bg-cyan-400 text-black shadow-[0_0_10px_#00d2ff]'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            All Realms
          </button>
          <button
            onClick={() => setActiveCategory('trending')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
              activeCategory === 'trending'
                ? 'bg-cyan-400 text-black shadow-[0_0_10px_#00d2ff]'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            Trending
          </button>
          <button
            onClick={() => setActiveCategory('bobs')}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition ${
              activeCategory === 'bobs'
                ? 'bg-cyan-400 text-black shadow-[0_0_10px_#00d2ff]'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Babagang
          </button>
        </div>
      </div>

      {/* Top Active Stories Carousel (Reference 1 Middle Screen Inspiration) */}
      <div className="px-4 pt-3 pb-2 border-b border-zinc-900/60">
        <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-1">
          {/* User's Add Story Bob */}
          <div
            onClick={onOpenCamera}
            className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer group"
          >
            <div className="relative">
              <PacmanAvatar
                imageUrl={userProfile.avatarUrl}
                size={52}
                showRing={true}
              />
              <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-black font-extrabold text-[10px] ring-2 ring-black">
                +
              </span>
            </div>
            <span className="text-[11px] font-semibold text-cyan-400">Your Bob</span>
          </div>

          {/* Mock Realm Story Bobs */}
          {MOCK_REALM_STORIES.map((story) => (
            <div
              key={story.id}
              className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer group"
            >
              <div className="relative">
                <PacmanAvatar
                  imageUrl={story.avatar}
                  size={52}
                  hasStory={true}
                />
                {story.live && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-rose-500 px-1.5 py-0.2 text-[8px] font-black uppercase text-white ring-2 ring-black">
                    LIVE
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-zinc-300 group-hover:text-white">
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Realm Posts Feed */}
      <div className="px-4 pt-4 space-y-4">
        {realmPosts.map((post) => (
          <RealmPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
