import React from 'react';
import { ChatItem } from '../../types';
import { PacmanAvatar } from '../common/PacmanAvatar';

interface ChatListItemProps {
  chat: ChatItem;
  onClick: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ chat, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center justify-between border-b border-zinc-900/40 px-4 py-3.5 transition hover:bg-zinc-900/40 active:bg-zinc-900/80"
    >
      <div className="flex items-center space-x-3.5">
        {/* Avatar with Pacman Cutout styling */}
        <div className="relative">
          <PacmanAvatar imageUrl={chat.avatarUrl} size={48} />
          {chat.online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
          )}
        </div>

        {/* Name and Last Message */}
        <div className="flex flex-col">
          <span className="text-base font-bold text-white transition group-hover:text-cyan-300">
            {chat.name}
          </span>
          <span className="line-clamp-1 max-w-[210px] text-sm text-zinc-400">
            {chat.lastMessage}
          </span>
        </div>
      </div>

      {/* Timestamp & Unread Badge */}
      <div className="flex flex-col items-end space-y-1.5">
        <span className="text-xs text-zinc-500 font-medium">{chat.time}</span>
        {chat.unreadCount > 0 ? (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-cyan-400 px-1.5 text-xs font-bold text-black shadow-[0_0_10px_rgba(0,210,255,0.4)]">
            {chat.unreadCount}
          </span>
        ) : (
          <div className="h-5" />
        )}
      </div>
    </div>
  );
};
