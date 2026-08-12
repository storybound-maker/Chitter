import React, { useState } from 'react';
import { X, Image, Sparkles } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';

export const NewChitModal: React.FC = () => {
  const { isNewChitModalOpen, setNewChitModalOpen, addRealmPost } = useChitter();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('#Chitter #Vibes');
  const [imageUrl, setImageUrl] = useState('');

  if (!isNewChitModalOpen) return null;

  const handlePost = () => {
    if (!content.trim()) return;
    const hashtagList = tags
      .split(' ')
      .map((t) => t.trim())
      .filter((t) => t.startsWith('#'));

    addRealmPost(content, hashtagList, imageUrl.trim() || undefined);
    setContent('');
    setImageUrl('');
    setNewChitModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Create New Chit</h2>
          </div>
          <button
            onClick={() => setNewChitModalOpen(false)}
            className="rounded-full p-1 text-zinc-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 space-y-4">
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What is happening in your realm?"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 text-sm text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none resize-none"
          />

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Hashtags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="#GenV #Basketball"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-cyan-400 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1">Optional Media Image URL</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setImageUrl(
                    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop'
                  )
                }
                className="shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-zinc-400 hover:text-white"
                title="Use Sample Image"
              >
                <Image className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={() => setNewChitModalOpen(false)}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-zinc-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={!content.trim()}
            className="rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-bold text-black disabled:opacity-50 hover:bg-cyan-300"
          >
            Post Chit
          </button>
        </div>
      </div>
    </div>
  );
};
