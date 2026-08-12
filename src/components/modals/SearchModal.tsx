import React from 'react';
import { X, Search, MessageSquare, Globe, User } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';
import { PacmanAvatar } from '../common/PacmanAvatar';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    chatItems,
    realmPosts,
    openChat,
  } = useChitter();

  if (!isSearchOpen) return null;

  const query = searchQuery.toLowerCase().trim();

  const filteredChats = chatItems.filter((c) =>
    c.name.toLowerCase().includes(query) || c.lastMessage.toLowerCase().includes(query)
  );

  const filteredPosts = realmPosts.filter(
    (p) =>
      p.content.toLowerCase().includes(query) ||
      p.authorName.toLowerCase().includes(query) ||
      p.hashtags.some((t) => t.toLowerCase().includes(query))
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 p-4 backdrop-blur-xl animate-fade-in">
      {/* Search Header */}
      <div className="flex items-center space-x-3 pb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Chitter (chats, realms, hashtags)..."
            autoFocus
            className="w-full rounded-full border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setSearchOpen(false)}
          className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pt-2">
        {/* Chats Results */}
        {filteredChats.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center space-x-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chats</span>
            </h3>
            <div className="space-y-1.5">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    openChat(chat.id);
                    setSearchOpen(false);
                  }}
                  className="flex cursor-pointer items-center space-x-3 rounded-2xl bg-zinc-900/60 p-3 hover:bg-zinc-900"
                >
                  <PacmanAvatar imageUrl={chat.avatarUrl} size={40} />
                  <div>
                    <div className="font-bold text-white text-sm">{chat.name}</div>
                    <div className="text-xs text-zinc-400">{chat.lastMessage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Realm Posts Results */}
        {filteredPosts.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center space-x-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
              <Globe className="h-3.5 w-3.5" />
              <span>Realms</span>
            </h3>
            <div className="space-y-2">
              {filteredPosts.map((post) => (
                <div key={post.id} className="rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-xs text-cyan-400">{post.authorName}</span>
                    <span className="text-[10px] text-zinc-500">• {post.timeAgo}</span>
                  </div>
                  <p className="text-xs text-zinc-200 line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!filteredChats.length && !filteredPosts.length && (
          <div className="pt-12 text-center text-sm text-zinc-500">
            No results found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
