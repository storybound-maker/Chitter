import React from 'react';
import { Heart, Bookmark, Settings, ChevronRight, Plus, Edit3 } from 'lucide-react';
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

  return (
    <div className="flex flex-col pb-24 text-white">
      {/* Top Main Hero Section */}
      <div className="flex flex-col items-center pt-2 pb-6 px-4">
        {/* Large Signature Pacman Avatar */}
        <div className="relative mb-4">
          <PacmanAvatar imageUrl={userProfile.avatarUrl} size={110} />
        </div>

        {/* User Titles */}
        <h1 className="text-2xl font-black tracking-wide text-white">
          {userProfile.name}
        </h1>
        <p className="text-xs font-semibold text-zinc-400 mt-0.5">
          {userProfile.handle}
        </p>

        {/* Tagline & Location pill */}
        <p className="mt-2 text-xs font-medium text-zinc-300">
          {userProfile.tagline}
        </p>
        <div className="mt-1.5 flex items-center space-x-1 text-xs font-semibold text-zinc-400">
          <span>❤️</span>
          <span>{userProfile.location}</span>
        </div>

        {/* Stats Row */}
        <div className="mt-6 flex w-full max-w-xs items-center justify-around border-y border-zinc-900/80 py-3 text-center">
          <div>
            <div className="text-base font-black text-white">{userProfile.chitsCount}</div>
            <div className="text-[11px] font-medium text-zinc-500">Chitters</div>
          </div>
          <div className="h-6 w-px bg-zinc-900" />
          <div>
            <div className="text-base font-black text-white">{userProfile.followersCount}</div>
            <div className="text-[11px] font-medium text-zinc-500">Followers</div>
          </div>
          <div className="h-6 w-px bg-zinc-900" />
          <div>
            <div className="text-base font-black text-white">{userProfile.followingCount}</div>
            <div className="text-[11px] font-medium text-zinc-500">Following</div>
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-5 flex w-full max-w-sm items-center space-x-2.5">
          <button
            onClick={onOpenEditProfile}
            className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3 text-center text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.98]"
          >
            Edit Profile
          </button>
          <button
            onClick={onOpenEditProfile}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/90 text-white transition hover:bg-zinc-800 active:scale-95"
            aria-label="Add"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Chitter Bio Card */}
      <div className="px-4 mb-6">
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-4">
          <h3 className="text-xs font-bold text-zinc-400">Chitter Bio</h3>
          <p className="mt-1 text-sm font-medium text-zinc-200">{userProfile.bio}</p>
        </div>
      </div>

      {/* Pinned Chitters Grid */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">Pinned Chitters</h2>
          <button className="text-xs font-semibold text-cyan-400 hover:underline">
            See all
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {userProfile.pinnedChitters.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-zinc-900 bg-zinc-900 shadow-lg cursor-pointer"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-xs font-bold text-white">
                <Heart className="h-3.5 w-3.5 fill-white text-white" />
                <span>{item.likesCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings / Navigation List items */}
      <div className="px-4 space-y-2">
        <button className="flex w-full items-center justify-between rounded-2xl border border-zinc-900/60 bg-zinc-900/30 px-4 py-3.5 transition hover:bg-zinc-900/70 active:scale-[0.99]">
          <div className="flex items-center space-x-3">
            <Heart className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold text-white">Liked Chitters</span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-500">
            <span className="text-xs font-medium">{userProfile.likedCount.toLocaleString()}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>

        <button className="flex w-full items-center justify-between rounded-2xl border border-zinc-900/60 bg-zinc-900/30 px-4 py-3.5 transition hover:bg-zinc-900/70 active:scale-[0.99]">
          <div className="flex items-center space-x-3">
            <Bookmark className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold text-white">Saved Chitters</span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-500">
            <span className="text-xs font-medium">{userProfile.savedCount}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={onOpenSettings}
          className="flex w-full items-center justify-between rounded-2xl border border-zinc-900/60 bg-zinc-900/30 px-4 py-3.5 transition hover:bg-zinc-900/70 active:scale-[0.99]"
        >
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-cyan-400" />
            <span className="text-sm font-bold text-white">Settings</span>
          </div>
          <ChevronRight className="h-4 w-4 text-zinc-500" />
        </button>
      </div>
    </div>
  );
};
