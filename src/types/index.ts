export type AppScreen = 'splash' | 'welcome' | 'login' | 'signup' | 'home';

export type HomeTab = 'realm' | 'chatter' | 'profile';

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  tagline: string;
  avatarUrl: string;
  chitsCount: number;
  followersCount: number;
  followingCount: number;
  location: string;
  pinnedChitters: PinnedChitter[];
  likedCount: number;
  savedCount: number;
}

export interface PinnedChitter {
  id: string;
  imageUrl: string;
  title: string;
  likesCount: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: { [emoji: string]: number };
}

export interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  avatarUrl: string;
  isGroup?: boolean;
  online?: boolean;
}

export interface RealmPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  timeAgo: string;
  content: string;
  hashtags: string[];
  imageUrl?: string;
  chitsCount: number;
  chitsCountFormatted: string;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
}
