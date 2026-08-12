import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useChitter } from '../context/ChitterContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { ChatListItem } from '../components/chatter/ChatListItem';
import { ChatThreadView } from '../components/chatter/ChatThreadView';
import { RealmPostCard } from '../components/realm/RealmPostCard';
import { ProfileBobView } from '../components/profile/ProfileBobView';
import { SearchModal } from '../components/modals/SearchModal';
import { EditProfileModal } from '../components/modals/EditProfileModal';
import { NewChitModal } from '../components/modals/NewChitModal';
import { SettingsDrawer } from '../components/modals/SettingsDrawer';
import { HomeTab } from '../types';

export const HomeScreen: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    chatItems,
    activeChatId,
    openChat,
    closeChat,
    realmPosts,
    setSearchOpen,
    setNewChitModalOpen,
    setEditProfileModalOpen,
  } = useChitter();

  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // Active Chat thread view takes over screen when selected
  const activeChat = chatItems.find((c) => c.id === activeChatId);

  // Tab mapping: realm = 0, chatter = 1, profile = 2
  const tabs: HomeTab[] = ['realm', 'chatter', 'profile'];
  const currentIndex = tabs.indexOf(activeTab);

  // Master single source of truth for horizontal navigation (0.0 to 2.0 continuous float)
  const pagePosition = useMotionValue(currentIndex);

  // Viewport container ref
  const containerRef = useRef<HTMLDivElement>(null);

  // Track pointer state for axis-locking & velocity
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    startPos: number;
    axis: 'undetermined' | 'horizontal' | 'vertical';
    lastX: number;
    lastTime: number;
    velocity: number;
    isPointerDown: boolean;
  }>({
    startX: 0,
    startY: 0,
    startPos: currentIndex,
    axis: 'undetermined',
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    isPointerDown: false,
  });

  // Keep pagePosition in sync when activeTab changes externally
  useEffect(() => {
    const target = tabs.indexOf(activeTab);
    const current = pagePosition.get();
    if (Math.abs(current - target) > 0.01 && !gestureRef.current.isPointerDown) {
      animate(pagePosition, target, {
        type: 'spring',
        stiffness: 320,
        damping: 30,
      });
    }
  }, [activeTab]);

  // Handle Tab Selection from BottomNav
  const handleSelectTab = (tab: HomeTab) => {
    const targetIdx = tabs.indexOf(tab);
    setActiveTab(tab);
    animate(pagePosition, targetIdx, {
      type: 'spring',
      stiffness: 350,
      damping: 30,
    });
  };

  // Pointer / Touch Handlers for Axis Locking & Continuous Dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = pagePosition.get();

    gestureRef.current = {
      startX,
      startY,
      startPos,
      axis: 'undetermined',
      lastX: startX,
      lastTime: performance.now(),
      velocity: 0,
      isPointerDown: true,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const dx = currentX - gesture.startX;
    const dy = currentY - gesture.startY;

    const now = performance.now();
    const dt = now - gesture.lastTime;
    if (dt > 0) {
      gesture.velocity = (currentX - gesture.lastX) / dt; // px / ms
      gesture.lastX = currentX;
      gesture.lastTime = now;
    }

    // 1. Direction Locking: Determine whether gesture is Horizontal or Vertical
    if (gesture.axis === 'undetermined') {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (Math.hypot(dx, dy) >= 6) {
        if (absDx > absDy * 1.1) {
          gesture.axis = 'horizontal';
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch (_) {}
        } else {
          gesture.axis = 'vertical';
        }
      }
    }

    // 2. If locked to horizontal, update pagePosition continuously across all 3 panels
    if (gesture.axis === 'horizontal') {
      const width = containerRef.current?.clientWidth || window.innerWidth || 360;
      const deltaPage = -dx / width;
      let targetPos = gesture.startPos + deltaPage;

      // Elastic rubber band effect on overscroll (<0 or >2)
      if (targetPos < 0) {
        targetPos = targetPos * 0.25;
      } else if (targetPos > 2) {
        targetPos = 2 + (targetPos - 2) * 0.25;
      }

      pagePosition.set(targetPos);
    }

    // 3. If locked to vertical, DO NOTHING to pagePosition.
    // Native browser scrolling inside child panel div handles vertical scrolling.
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;
    gesture.isPointerDown = false;

    if (e && e.currentTarget && gesture.axis === 'horizontal') {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    if (gesture.axis === 'horizontal') {
      const currentPos = pagePosition.get();
      const vel = gesture.velocity; // px/ms

      let targetIndex = Math.round(currentPos);

      // Fast swipe gesture detection
      if (vel < -0.35) {
        // Fast swipe left -> advance right
        targetIndex = Math.min(2, Math.floor(gesture.startPos) + 1);
        if (currentPos > 1.2) targetIndex = 2;
      } else if (vel > 0.35) {
        // Fast swipe right -> advance left
        targetIndex = Math.max(0, Math.ceil(gesture.startPos) - 1);
        if (currentPos < 0.8) targetIndex = 0;
      } else {
        // Slow drag -> snap to nearest section
        targetIndex = Math.min(2, Math.max(0, Math.round(currentPos)));
      }

      // Spring physics to settle into target position
      animate(pagePosition, targetIndex, {
        type: 'spring',
        stiffness: 340,
        damping: 30,
        velocity: -vel * 3,
      });

      const nextTab = tabs[targetIndex];
      if (nextTab !== activeTab) {
        setActiveTab(nextTab);
      }
    }

    gesture.axis = 'undetermined';
  };

  // Convert pagePosition float to container translateX percentage (-0% to -200% of single panel width)
  // Since 3 panels wrapper has width = 300%, -pagePosition * (100% / 3) = -pagePosition * 33.333%
  const containerX = useTransform(pagePosition, (pos) => `-${(pos / 3) * 100}%`);

  if (activeChat) {
    return (
      <div className="h-full w-full bg-zinc-950">
        <ChatThreadView chat={activeChat} onBack={closeChat} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-zinc-950 text-white overflow-hidden select-none">
      {/* Header Bar */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNewChit={() => setNewChitModalOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Continuous Panel Viewport Container */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* 300% Width Horizontal Track Container */}
        <motion.div
          className="flex h-full w-[300%] will-change-transform"
          style={{ x: containerX }}
        >
          {/* PANEL 0: REALM */}
          <div
            className="h-full w-1/3 overflow-y-auto px-4 pt-3 pb-28 space-y-4"
            style={{ touchAction: 'pan-y' }}
          >
            {realmPosts.map((post) => (
              <RealmPostCard key={post.id} post={post} />
            ))}
          </div>

          {/* PANEL 1: CHATTER */}
          <div
            className="h-full w-1/3 overflow-y-auto pb-28"
            style={{ touchAction: 'pan-y' }}
          >
            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Recent Conversations ({chatItems.length})
            </div>
            {chatItems.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                onClick={() => openChat(chat.id)}
              />
            ))}
          </div>

          {/* PANEL 2: PROFILE BOB */}
          <div
            className="h-full w-1/3 overflow-y-auto pt-2 pb-28"
            style={{ touchAction: 'pan-y' }}
          >
            <ProfileBobView
              onOpenEditProfile={() => setEditProfileModalOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </div>
        </motion.div>
      </div>

      {/* Fluid Gesture Bottom Navigation Bar */}
      <BottomNav
        pagePosition={pagePosition}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Modals & Drawers */}
      <SearchModal />
      <EditProfileModal />
      <NewChitModal />
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
