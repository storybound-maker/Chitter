import React from 'react';
import { Search, Settings, Share2, MoreHorizontal, Plus } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNewChit?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNewChit,
  onOpenSettings,
}) => {
  const { activeTab, activeChatId } = useChitter();

  if (activeChatId) return null; // Chat thread renders its own header

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-900/60 bg-zinc-950/80 px-4 py-3 backdrop-blur-md">
      {activeTab === 'profile' ? (
        <div className="flex w-full items-center justify-end">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Chitter Profile', url: window.location.href });
                }
              }}
              className="rounded-full bg-zinc-900/80 p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white active:scale-95"
              aria-label="Share profile"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={onOpenSettings}
              className="rounded-full bg-zinc-900/80 p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white active:scale-95"
              aria-label="Settings"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex w-full items-center space-x-3">
          {/* Search Trigger Input Box */}
          <button
            onClick={onOpenSearch}
            className="group flex flex-1 items-center space-x-3 rounded-full border border-zinc-800/80 bg-zinc-900/80 px-4 py-2.5 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800/90 active:scale-[0.99]"
          >
            <Search className="h-4 w-4 text-zinc-400 transition group-hover:text-cyan-400" />
            <span className="text-sm font-medium text-zinc-400">
              {activeTab === 'chatter' ? 'Search Chats' : 'Search Realms'}
            </span>
          </button>

          {/* New Post Button in Realm */}
          {activeTab === 'realm' && onOpenNewChit && (
            <button
              onClick={onOpenNewChit}
              className="flex items-center justify-center rounded-full bg-cyan-400 p-2.5 text-black shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 active:scale-95"
              title="Create Chit"
            >
              <Plus className="h-5 w-5 font-bold" />
            </button>
          )}

          {/* Settings gear icon in Chatter */}
          {activeTab === 'chatter' && (
            <button
              onClick={onOpenSettings}
              className="rounded-full border border-zinc-800/60 bg-zinc-900/80 p-2.5 text-zinc-300 transition hover:bg-zinc-800 hover:text-white active:scale-95"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </header>
  );
};
