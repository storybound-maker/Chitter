import React, { createContext, useContext, useState } from 'react';
import {
  INITIAL_CHAT_ITEMS,
  INITIAL_MESSAGES,
  INITIAL_REALM_POSTS,
  INITIAL_USER_PROFILE,
} from '../constants/mockData';
import { authService } from '../services/firebase';
import {
  AppScreen,
  ChatItem,
  ChatMessage,
  HomeTab,
  RealmPost,
  UserProfile,
} from '../types';

interface ChitterContextType {
  currentScreen: AppScreen;
  activeTab: HomeTab;
  activeChatId: string | null;
  userProfile: UserProfile;
  chatItems: ChatItem[];
  messages: { [chatId: string]: ChatMessage[] };
  realmPosts: RealmPost[];
  isSearchOpen: boolean;
  searchQuery: string;
  isNewChitModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  
  // Navigation actions
  setScreen: (screen: AppScreen) => void;
  setActiveTab: (tab: HomeTab) => void;
  openChat: (chatId: string) => void;
  closeChat: () => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setNewChitModalOpen: (open: boolean) => void;
  setEditProfileModalOpen: (open: boolean) => void;

  // Data Actions
  sendMessage: (chatId: string, text: string, replyTo?: ChatMessage) => void;
  toggleLikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  addRealmPost: (content: string, hashtags: string[], imageUrl?: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  
  // Auth Actions
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, handle: string) => Promise<void>;
  logout: () => Promise<void>;
}

const ChitterContext = createContext<ChitterContextType | undefined>(undefined);

export const ChitterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [activeTab, setActiveTab] = useState<HomeTab>('chatter');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [chatItems, setChatItems] = useState<ChatItem[]>(INITIAL_CHAT_ITEMS);
  const [messages, setMessages] = useState<{ [chatId: string]: ChatMessage[] }>(
    INITIAL_MESSAGES
  );
  const [realmPosts, setRealmPosts] = useState<RealmPost[]>(INITIAL_REALM_POSTS);

  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChitModalOpen, setNewChitModalOpen] = useState(false);
  const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);

  // Chat Actions
  const openChat = (chatId: string) => {
    setActiveChatId(chatId);
    // Clear unread count
    setChatItems((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const closeChat = () => {
    setActiveChatId(null);
  };

  const sendMessage = (chatId: string, text: string, replyTo?: ChatMessage) => {
    if (!text.trim()) return;

    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      chatId,
      senderId: userProfile.id,
      senderName: userProfile.name,
      senderAvatar: userProfile.avatarUrl,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            text: replyTo.text,
            senderName: replyTo.senderName,
          }
        : undefined,
    };

    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), newMsg],
    }));

    // Update last message in chat list
    setChatItems((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: text.trim(),
              time: 'Just now',
            }
          : c
      )
    );
  };

  // Realm Post Actions
  const toggleLikePost = (postId: string) => {
    setRealmPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newLiked = !p.isLiked;
          const newCount = newLiked ? p.chitsCount + 1 : p.chitsCount - 1;
          return {
            ...p,
            isLiked: newLiked,
            chitsCount: newCount,
            chitsCountFormatted:
              newCount >= 1000 ? `${(newCount / 1000).toFixed(1)}K` : `${newCount}`,
          };
        }
        return p;
      })
    );
  };

  const toggleSavePost = (postId: string) => {
    setRealmPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  const addRealmPost = (content: string, hashtags: string[], imageUrl?: string) => {
    const newPost: RealmPost = {
      id: `post_${Date.now()}`,
      authorName: userProfile.name,
      authorHandle: userProfile.handle,
      authorAvatar: userProfile.avatarUrl,
      timeAgo: 'Just now',
      content,
      hashtags,
      imageUrl,
      chitsCount: 0,
      chitsCountFormatted: '0',
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
    };

    setRealmPosts((prev) => [newPost, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      chitsCount: prev.chitsCount + 1,
    }));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  };

  // Auth
  const login = async (email: string, pass: string) => {
    await authService.loginWithEmail(email, pass);
    setUserProfile((prev) => ({ ...prev, name: email.split('@')[0] }));
    setCurrentScreen('home');
  };

  const signup = async (email: string, pass: string, name: string, handle: string) => {
    await authService.signUpWithEmail(email, pass, name);
    setUserProfile((prev) => ({
      ...prev,
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
    }));
    setCurrentScreen('home');
  };

  const logout = async () => {
    await authService.signOut();
    setCurrentScreen('welcome');
  };

  return (
    <ChitterContext.Provider
      value={{
        currentScreen,
        activeTab,
        activeChatId,
        userProfile,
        chatItems,
        messages,
        realmPosts,
        isSearchOpen,
        searchQuery,
        isNewChitModalOpen,
        isEditProfileModalOpen,
        setScreen: setCurrentScreen,
        setActiveTab,
        openChat,
        closeChat,
        setSearchOpen,
        setSearchQuery,
        setNewChitModalOpen,
        setEditProfileModalOpen,
        sendMessage,
        toggleLikePost,
        toggleSavePost,
        addRealmPost,
        updateUserProfile,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </ChitterContext.Provider>
  );
};

export const useChitter = () => {
  const context = useContext(ChitterContext);
  if (!context) {
    throw new Error('useChitter must be used within a ChitterProvider');
  }
  return context;
};
