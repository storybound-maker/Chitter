import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { ArrowLeft, Send, CornerUpLeft, Image, Mic, X, MoreVertical, Phone, Video } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';
import { ChatItem, ChatMessage } from '../../types';
import { PacmanAvatar } from '../common/PacmanAvatar';

interface ChatThreadViewProps {
  chat: ChatItem;
  onBack: () => void;
}

export const ChatThreadView: React.FC<ChatThreadViewProps> = ({ chat, onBack }) => {
  const { messages, sendMessage, userProfile } = useChitter();
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

  const chatMessages = messages[chat.id] || [];

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(chat.id, text, replyingTo || undefined);
    setText('');
    setReplyingTo(null);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-white">
      {/* Header Bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <PacmanAvatar imageUrl={chat.avatarUrl} size={38} />
          <div>
            <div className="text-base font-bold text-white">{chat.name}</div>
            <div className="text-xs text-emerald-400">
              {chat.online ? 'Online' : 'Active recently'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-zinc-400">
          <button className="rounded-full p-2 hover:bg-zinc-900 hover:text-white">
            <Phone className="h-4 w-4" />
          </button>
          <button className="rounded-full p-2 hover:bg-zinc-900 hover:text-white">
            <Video className="h-4 w-4" />
          </button>
          <button className="rounded-full p-2 hover:bg-zinc-900 hover:text-white">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="my-2 text-center text-xs font-semibold text-zinc-600">
          Encrypted with Chitter Security • Today
        </div>

        {chatMessages.map((msg) => (
          <SwipeableMessageItem
            key={msg.id}
            message={msg}
            onSwipeToReply={(m) => setReplyingTo(m)}
          />
        ))}
      </div>

      {/* Active Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/90 px-4 py-2">
          <div className="flex items-center space-x-2 overflow-hidden text-xs">
            <CornerUpLeft className="h-4 w-4 text-cyan-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-cyan-400">
                Replying to {replyingTo.senderName}:
              </span>{' '}
              <span className="text-zinc-300">{replyingTo.text}</span>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="rounded-full p-1 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input Box Bar */}
      <div className="border-t border-zinc-900 bg-zinc-950 p-3 pb-6">
        <div className="flex items-center space-x-2">
          <button className="rounded-full bg-zinc-900 p-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <Image className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${chat.name}...`}
            className="flex-1 rounded-full border border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none"
          />

          {text.trim() ? (
            <button
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 text-black transition hover:bg-cyan-300 active:scale-95 shadow-md shadow-cyan-500/20"
            >
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <button className="rounded-full bg-zinc-900 p-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Gesture-driven Swipe-to-Reply Item Component
interface SwipeableMessageItemProps {
  message: ChatMessage;
  onSwipeToReply: (msg: ChatMessage) => void;
}

const SwipeableMessageItem: React.FC<SwipeableMessageItemProps> = ({
  message,
  onSwipeToReply,
}) => {
  const x = useMotionValue(0);
  const replyIconOpacity = useTransform(x, [0, 40], [0, 1]);
  const replyIconScale = useTransform(x, [0, 50], [0.5, 1.2]);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 45) {
      onSwipeToReply(message);
    }
  };

  return (
    <div className="relative flex items-center">
      {/* Dynamic Reply Icon appearing as message swipes right */}
      <motion.div
        style={{ opacity: replyIconOpacity, scale: replyIconScale }}
        className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-cyan-400"
      >
        <CornerUpLeft className="h-5 w-5" />
      </motion.div>

      {/* Swipeable Message Bubble Container */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 70 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className={`flex w-full ${message.isMe ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-md transition-all ${
            message.isMe
              ? 'rounded-br-none bg-cyan-500 text-black font-medium'
              : 'rounded-bl-none bg-zinc-900 text-white border border-zinc-800/80'
          }`}
        >
          {message.replyTo && (
            <div
              className={`mb-1.5 rounded border-l-2 px-2 py-1 text-xs ${
                message.isMe
                  ? 'border-black/40 bg-black/10 text-zinc-900'
                  : 'border-cyan-400 bg-zinc-800 text-zinc-300'
              }`}
            >
              <div className="font-semibold">{message.replyTo.senderName}</div>
              <div className="truncate">{message.replyTo.text}</div>
            </div>
          )}

          <p className="leading-relaxed">{message.text}</p>
          <span
            className={`mt-1 block text-[10px] text-right font-medium ${
              message.isMe ? 'text-black/60' : 'text-zinc-500'
            }`}
          >
            {message.timestamp}
          </span>
        </div>
      </motion.div>
    </div>
  );
};
