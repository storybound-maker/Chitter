import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
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

const TABS: HomeTab[] = ['realm', 'chatter', 'profile'];
const MIN_POSITION = 0;
const MAX_POSITION = TABS.length - 1;
const AXIS_LOCK_DISTANCE = 10;
const AXIS_LOCK_BIAS = 1.12;

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
  const activeChat = chatItems.find((chat) => chat.id === activeChatId);
  const currentIndex = Math.max(0, TABS.indexOf(activeTab));

  // One continuous value controls both the horizontal canvas and the navbar.
  const pagePosition = useMotionValue(currentIndex);
  const viewportRef = useRef<HTMLDivElement>(null);

  const gestureRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    startPosition: currentIndex,
    axis: 'undetermined' as 'undetermined' | 'horizontal' | 'vertical',
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    active: false,
  });

  useEffect(() => {
    const target = TABS.indexOf(activeTab);
    if (target < 0 || gestureRef.current.active) return;

    const current = pagePosition.get();
    if (Math.abs(current - target) > 0.001) {
      animate(pagePosition, target, {
        type: 'spring',
        stiffness: 420,
        damping: 34,
        mass: 0.8,
      });
    }
  }, [activeTab, pagePosition]);

  const selectTab = (tab: HomeTab) => {
    const target = TABS.indexOf(tab);
    if (target < 0) return;

    setActiveTab(tab);
    animate(pagePosition, target, {
      type: 'spring',
      stiffness: 420,
      damping: 34,
      mass: 0.8,
    });
  };

  const finishGesture = (e?: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture.active) return;

    if (e && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    gesture.active = false;

    if (gesture.axis === 'horizontal') {
      const position = pagePosition.get();
      const velocity = gesture.velocityX;
      let target = Math.round(position);

      // A quick intentional swipe can advance one panel. A longer drag can
      // naturally cross multiple panels because position itself is continuous.
      if (Math.abs(velocity) > 0.45) {
        target = velocity < 0
          ? Math.ceil(position)
          : Math.floor(position);
      }

      target = Math.max(MIN_POSITION, Math.min(MAX_POSITION, target));

      animate(pagePosition, target, {
        type: 'spring',
        stiffness: 390,
        damping: 32,
        mass: 0.85,
        velocity: -velocity * 5,
      });

      const nextTab = TABS[target];
      if (nextTab !== activeTab) setActiveTab(nextTab);
    }

    gestureRef.current.axis = 'undetermined';
    gestureRef.current.pointerId = -1;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const current = pagePosition.get();
    gestureRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startPosition: current,
      axis: 'undetermined',
      lastX: e.clientX,
      lastTime: performance.now(),
      velocityX: 0,
      active: true,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current;
    if (!gesture.active || gesture.pointerId !== e.pointerId) return;

    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    const now = performance.now();
    const dt = now - gesture.lastTime;
    if (dt > 0) {
      gesture.velocityX = (e.clientX - gesture.lastX) / dt;
      gesture.lastX = e.clientX;
      gesture.lastTime = now;
    }

    // Do not decide the axis until there is enough movement to avoid noisy
    // diagonal gestures. Once chosen, the axis cannot change for this gesture.
    if (gesture.axis === 'undetermined' && Math.hypot(dx, dy) >= AXIS_LOCK_DISTANCE) {
      gesture.axis = absDx > absDy * AXIS_LOCK_BIAS ? 'horizontal' : 'vertical';

      if (gesture.axis === 'horizontal') {
        // Stop the browser from treating a horizontal touch as a page gesture.
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    }

    if (gesture.axis !== 'horizontal') return;

    e.preventDefault();

    const width = viewportRef.current?.clientWidth || window.innerWidth || 360;
    const rawPosition = gesture.startPosition - dx / width;

    // Small elastic resistance at the two ends of the canvas.
    let nextPosition = rawPosition;
    if (rawPosition < MIN_POSITION) {
      nextPosition = MIN_POSITION + (rawPosition - MIN_POSITION) * 0.22;
    } else if (rawPosition > MAX_POSITION) {
      nextPosition = MAX_POSITION + (rawPosition - MAX_POSITION) * 0.22;
    }

    pagePosition.set(nextPosition);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => finishGesture(e);

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => finishGesture(e);

  // A position of 0/1/2 means the left edge of Realm/Chatter/Profile is at
  // the viewport. Because the track is exactly 300% wide, one panel is 1/3.
  const trackX = useTransform(pagePosition, (position) => `${-(position / 3) * 100}%`);

  if (activeChat) {
    return (
      <div className="h-full w-full bg-zinc-950">
        <ChatThreadView chat={activeChat} onBack={closeChat} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-zinc-950 text-white select-none">
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNewChit={() => setNewChitModalOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <motion.div
          className="flex h-full w-[300%] will-change-transform"
          style={{ x: trackX }}
        >
          <section
            aria-label="Realm"
            className="h-full w-1/3 overflow-y-auto overscroll-contain px-4 pb-28 pt-3 space-y-4"
            style={{ touchAction: 'pan-y' }}
          >
            {realmPosts.map((post) => (
              <RealmPostCard key={post.id} post={post} />
            ))}
          </section>

          <section
            aria-label="Chatter"
            className="h-full w-1/3 overflow-y-auto overscroll-contain pb-28"
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
          </section>

          <section
            aria-label="Profile Bob"
            className="h-full w-1/3 overflow-y-auto overscroll-contain pb-28 pt-2"
            style={{ touchAction: 'pan-y' }}
          >
            <ProfileBobView
              onOpenEditProfile={() => setEditProfileModalOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </section>
        </motion.div>
      </div>

      <BottomNav
        pagePosition={pagePosition}
        activeTab={activeTab}
        onSelectTab={selectTab}
      />

      <SearchModal />
      <EditProfileModal />
      <NewChitModal />
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
};
