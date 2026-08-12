import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';

export const EditProfileModal: React.FC = () => {
  const { isEditProfileModalOpen, setEditProfileModalOpen, userProfile, updateUserProfile } =
    useChitter();

  const [name, setName] = useState(userProfile.name);
  const [handle, setHandle] = useState(userProfile.handle);
  const [tagline, setTagline] = useState(userProfile.tagline);
  const [bio, setBio] = useState(userProfile.bio);
  const [location, setLocation] = useState(userProfile.location);
  const [avatarUrl, setAvatarUrl] = useState(userProfile.avatarUrl);

  if (!isEditProfileModalOpen) return null;

  const handleSave = () => {
    updateUserProfile({
      name,
      handle,
      tagline,
      bio,
      location,
      avatarUrl,
    });
    setEditProfileModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
          <h2 className="text-lg font-bold text-white">Edit Profile Bob</h2>
          <button
            onClick={() => setEditProfileModalOpen(false)}
            className="rounded-full p-1 text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Location / Age</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Avatar Image URL</label>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={() => setEditProfileModalOpen(false)}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-bold text-black hover:bg-cyan-300"
          >
            <Check className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
