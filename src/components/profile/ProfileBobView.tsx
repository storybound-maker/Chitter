import React, { useState } from 'react';
import { Heart, Bookmark, Settings, ChevronRight, Share2, Grid, Film, Edit3, Sparkles } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';
import { PacmanAvatar } from '../common/PacmanAvatar';

interface ProfileBobViewProps {
  onOpenEditProfile: () => void;
  onOpenSettings: () => void;
}

export const ProfileBobView: React.FC<ProfileBobViewProps> = ({
  onOpenEditProfile,
  onOpenSettings,
}) => {
  const { userProfile } = useChitter();
  const [activeTab, setActiveTab] = useState<'chits' | 'media' | 'liked' | 'saved'>('chits');

  return (
    <div className="flex flex-col pb-28 text-white select-none">
      {/* Cover Banner Header */}
      <div className="relative h-40 w-full overflow-hidden bg-zinc-900 border-b border-zinc-800">
        <img
          src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop"
          alt="Profile Cover"
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        {/* Top Floating Actions */}
        <div className="absolute top-3 right-4 flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `${userProfile.name}'s Bob Profile`, url: window.location.href });
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-zinc-700/80 text-white backdrop-blur-md hover:bg-black/90 transition"
            aria-label="Share Bob"
          >
            <Share2 className="h-4 w-4 text-cyan-400" />
          </button>
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 border border-zinc-700/80 text-white backdrop-blur-md hover:bg-black/90 transition"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Main Profile Info Section overlapping cover */}
      <div className="relative px-4 -mt-16 flex flex-col items-center text-center">
        {/* Large Signature Pacman Avatar */}
        <div className="relative mb-3 p-1 rounded-full bg-zinc-950 border-2 border-cyan-400 shadow-[0_0_24px_rgba(0,210,255,0.4)]">
          <PacmanAvatar
            imageUrl={userProfile.avatarUrl}
            size={100}
            hasStory={true}
            active={true}
          />
        </div>

        {/* User Titles */}
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
          {userProfile.name}
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400 text-black text-[10px] font-black" title="Verified Bob">
            ✓
          </span>
        </h1>
        <p className="text-xs font-semibold text-cyan-400 mt-0.5">
          {userProfile.handle}
        </p>

        {/* Tagline & Location */}
        <p className="mt-2 text-xs font-medium text-zinc-300 max-w-xs leading-relaxed">
          "{userProfile.tagline}"
        </p>
        <div className="mt-1 flex items-center space-x-1.5 text-xs font-semibold text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-cyan-400" />
          <span>{userProfile.location}</span>
        </div>

        {/* Stats Grid */}
        <div className="mt-5 flex w-full max-w-xs items-center justify-around rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-center backdrop-blur-md">
          <div>
            <div className="text-base font-black text-white">{userProfile.chitsCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Chitters</div>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div>
            <div className="text-base font-black text-white">{userProfile.followersCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Followers</div>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div>
            <div className="text-base font-black text-white">{userProfile.followingCount}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Following</div>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-4 flex w-full max-w-sm items-center gap-2.5">
          <button
            onClick={onOpenEditProfile}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-cyan-400/50 bg-cyan-950/40 py-2.5 text-center text-xs font-bold text-cyan-300 transition hover:bg-cyan-900/50 active:scale-[0.98]"
          >
            <Edit3 className="h-3.5 w-3.5 text-cyan-400" />
            Edit Profile
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `${userProfile.name}'s Bob Profile`, url: window.location.href });
              }
            }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 py-2.5 text-center text-xs font-bold text-zinc-200 hover:bg-zinc-800 active:scale-[0.98]"
          >
            <Share2 className="h-3.5 w-3.5 text-zinc-400" />
            Share Bob
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="mt-6 border-b border-zinc-900/80 px-4">
        <div className="flex items-center justify-around text-xs font-bold">
          <button
            onClick={() => setActiveTab('chits')}
            className={`flex items-center gap-1.5 pb-3 transition ${
              activeTab === 'chits'
                ? 'text-cyan-400 border-b-2 border-cyan-400 shadow-[0_2px_10px_rgba(0,210,255,0.4)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Grid className="h-4 w-4" />
            Chits
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-1.5 pb-3 transition ${
              activeTab === 'media'
                ? 'text-cyan-400 border-b-2 border-cyan-400 shadow-[0_2px_10px_rgba(0,210,255,0.4)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Film className="h-4 w-4" />
            Media
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            className={`flex items-center gap-1.5 pb-3 transition ${
              activeTab === 'liked'
                ? 'text-cyan-400 border-b-2 border-cyan-400 shadow-[0_2px_10px_rgba(0,210,255,0.4)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Heart className="h-4 w-4" />
            Liked
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 pb-3 transition ${
              activeTab === 'saved'
                ? 'text-cyan-400 border-b-2 border-cyan-400 shadow-[0_2px_10px_rgba(0,210,255,0.4)]'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            Saved
          </button>
        </div>
      </div>

      {/* Grid of Pinned Chitters & Media */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          {userProfile.pinnedChitters.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 shadow-lg cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-[11px] font-bold text-white">
                <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                <span>{item.likesCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

