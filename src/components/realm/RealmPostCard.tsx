import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';
import { RealmPost } from '../../types';
import { PacmanAvatar } from '../common/PacmanAvatar';
import { useChitter } from '../../context/ChitterContext';

interface RealmPostCardProps {
  post: RealmPost;
}

export const RealmPostCard: React.FC<RealmPostCardProps> = ({ post }) => {
  const { toggleLikePost, toggleSavePost } = useChitter();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<string[]>([
    'That ending was unbelievable!',
    'No way, ep 6 is going to be even crazier.',
  ]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([...comments, commentText.trim()]);
    setCommentText('');
  };

  return (
    <article className="mb-4 rounded-3xl border border-zinc-900/80 bg-zinc-950 p-4 shadow-xl">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <PacmanAvatar imageUrl={post.authorAvatar} size={40} />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">{post.authorName}</span>
              <span className="text-xs text-zinc-500">• {post.timeAgo}</span>
            </div>
            <span className="text-xs text-zinc-400">{post.authorHandle}</span>
          </div>
        </div>

        <button className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-white">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Post Text & Hashtags */}
      <div className="pb-3 text-sm leading-relaxed text-zinc-200 whitespace-pre-line">
        {post.content}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {post.hashtags.map((tag, i) => (
              <span key={i} className="font-semibold text-cyan-400 hover:underline cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media Image Card */}
      {post.imageUrl && (
        <div className="relative mb-3 overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900 max-h-80">
          <img
            src={post.imageUrl}
            alt="Realm Chit"
            className="w-full h-full object-cover transition duration-300 hover:scale-[1.02]"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-1 text-zinc-400">
        <div className="flex items-center space-x-5">
          {/* Like / Chit button */}
          <button
            onClick={() => toggleLikePost(post.id)}
            className={`flex items-center space-x-1.5 transition active:scale-90 ${
              post.isLiked ? 'text-rose-500' : 'hover:text-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-rose-500' : ''}`} />
            <span className="text-xs font-semibold">{post.chitsCountFormatted} Chits</span>
          </button>

          {/* Comments button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1.5 transition hover:text-white active:scale-90"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs font-semibold">{post.commentsCount + comments.length - 2}</span>
          </button>

          {/* Shares button */}
          <button className="flex items-center space-x-1.5 transition hover:text-white active:scale-90">
            <Share2 className="h-5 w-5" />
            <span className="text-xs font-semibold">{post.sharesCount}</span>
          </button>
        </div>

        {/* Bookmark / Save button */}
        <button
          onClick={() => toggleSavePost(post.id)}
          className={`p-1.5 transition active:scale-90 ${
            post.isSaved ? 'text-cyan-400' : 'hover:text-white'
          }`}
        >
          <Bookmark className={`h-5 w-5 ${post.isSaved ? 'fill-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Inline Comments Section */}
      {showComments && (
        <div className="mt-3 border-t border-zinc-900 pt-3 text-xs space-y-2">
          {comments.map((c, i) => (
            <div key={i} className="rounded-xl bg-zinc-900/60 p-2.5 text-zinc-300">
              <span className="font-bold text-white mr-1.5">User:</span> {c}
            </div>
          ))}

          <form onSubmit={handleAddComment} className="flex space-x-2 pt-1">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-cyan-400 px-3 py-1.5 font-bold text-black text-xs hover:bg-cyan-300"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </article>
  );
};
