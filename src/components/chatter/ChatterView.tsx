import React, { useState } from 'react';
import { Search, Archive, Edit3, Lock, MessageSquare } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';
import { ChatListItem } from './ChatListItem';
import { PacmanAvatar } from '../common/PacmanAvatar';

interface ChatterViewProps {
  onOpenCamera: () => void;
}

const STORY_BOBS = [
  { id: 'sb1', name: 'Ava Collins', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
  { id: 'sb2', name: 'Ethan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
  { id: 'sb3', name: 'Zoe Carter', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop' },
  { id: 'sb4', name: 'Mila Harper', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop' },
  { id: 'sb5', name: 'Santiago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop' },
];

export const ChatterView: React.FC<ChatterViewProps> = ({ onOpenCamera }) => {
  const { chatItems, openChat, searchQuery, setSearchQuery } = useChitter();
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');

  const filteredChats = chatItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'unread') return item.unreadCount > 0;
    if (filter === 'groups') return item.isGroup;
    return true;
  });

  return (
    <div className="relative min-h-full pb-28 text-white select-none">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-md px-4 py-3 border-b border-zinc-900/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 border border-cyan-400/40">
              <MessageSquare className="h-4 w-4" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">Chatter</h2>
          </div>

          <button className="flex items-center gap-1 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-400 hover:text-white">
            <Archive className="h-3.5 w-3.5" />
            Archive
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages or Bobs..."
            className="w-full rounded-full bg-zinc-900/90 border border-zinc-800/80 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        {/* Active Story Bobs Carousel (Reference Image 2 Section 1) */}
        <div className="flex items-center space-x-3.5 overflow-x-auto no-scrollbar pt-1 pb-1">
          {STORY_BOBS.map((story) => (
            <div
              key={story.id}
              onClick={onOpenCamera}
              className="flex flex-col items-center space-y-1 shrink-0 cursor-pointer group"
            >
              <PacmanAvatar
                imageUrl={story.avatar}
                size={48}
                hasStory={true}
              />
              <span className="text-[10px] font-medium text-zinc-400 group-hover:text-cyan-300 transition max-w-[56px] truncate text-center">
                {story.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-900/40 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full font-bold transition ${
            filter === 'all'
              ? 'bg-cyan-400 text-black shadow-[0_0_10px_#00d2ff]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded-full font-bold transition ${
            filter === 'unread'
              ? 'bg-cyan-400 text-black shadow-[0_0_10px_#00d2ff]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('groups')}
          className={`px-3 py-1 rounded-full font-bold transition ${
            filter === 'groups'
              ? 'bg-cyan-400 text-black shadow-[0_0_10px_#00d2ff]'
              : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          Groups
        </button>
      </div>

      {/* Message Items List */}
      <div className="divide-y divide-zinc-900/40">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              onClick={() => openChat(chat.id)}
            />
          ))
        ) : (
          <div className="p-8 text-center text-xs text-zinc-500">
            No chats found matching search
          </div>
        )}
      </div>

      {/* Floating Compose Action Button */}
      <div className="fixed bottom-24 right-6 z-30">
        <button
          onClick={onOpenCamera}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 text-black shadow-[0_0_20px_#00d2ff] transition hover:bg-cyan-300 active:scale-90"
          title="Compose Message or Photo"
        >
          <Edit3 className="h-5 w-5 font-bold" />
        </button>
      </div>
    </div>
  );
};
