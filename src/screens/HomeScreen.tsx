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
  const { activeTab, setActiveTab, chatItems, activeChatId, openChat, closeChat, realmPosts, setSearchOpen, setNewChitModalOpen, setEditProfileModalOpen } = useChitter();
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const activeChat = chatItems.find((c) => c.id === activeChatId);
  const tabs: HomeTab[] = ['realm', 'chatter', 'profile'];
  const currentIndex = tabs.indexOf(activeTab);
  const pagePosition = useMotionValue(currentIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const gestureRef = useRef({ startX: 0, startY: 0, startPos: currentIndex, axis: 'undetermined' as 'undetermined' | 'horizontal' | 'vertical', lastX: 0, lastTime: 0, velocity: 0, isPointerDown: false });
  const barDragRef = useRef({ active: false, startPos: 0 });

  useEffect(() => {
    const target = tabs.indexOf(activeTab);
    const current = pagePosition.get();
    if (Math.abs(current - target) > 0.01 && !gestureRef.current.isPointerDown && !barDragRef.current.active) {
      animate(pagePosition, target, { type: 'spring', stiffness: 320, damping: 30 });
    }
  }, [activeTab]);

  const handleSelectTab = (tab: HomeTab) => {
    const targetIdx = tabs.indexOf(tab);
    setActiveTab(tab);
    animate(pagePosition, targetIdx, { type: 'spring', stiffness: 350, damping: 30 });
  };

  // Page drag: used for horizontal swipes on content. The navbar has its own
  // physical drag path below, but both write to the exact same pagePosition.
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    gestureRef.current = { startX: e.clientX, startY: e.clientY, startPos: pagePosition.get(), axis: 'undetermined', lastX: e.clientX, lastTime: performance.now(), velocity: 0, isPointerDown: true };
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;
    const dx = e.clientX - gesture.startX;
    const dy = e.clientY - gesture.startY;
    const now = performance.now();
    const dt = now - gesture.lastTime;
    if (dt > 0) { gesture.velocity = (e.clientX - gesture.lastX) / dt; gesture.lastX = e.clientX; gesture.lastTime = now; }
    if (gesture.axis === 'undetermined' && Math.hypot(dx, dy) >= 6) {
      gesture.axis = Math.abs(dx) > Math.abs(dy) * 1.1 ? 'horizontal' : 'vertical';
      if (gesture.axis === 'horizontal') { try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {} }
    }
    if (gesture.axis === 'horizontal') {
      const width = containerRef.current?.clientWidth || window.innerWidth || 360;
      let next = gesture.startPos - dx / width;
      if (next < 0) next *= 0.25;
      else if (next > 2) next = 2 + (next - 2) * 0.25;
      pagePosition.set(next);
      e.preventDefault();
    }
  };
  const handlePointerUp = (e?: React.PointerEvent) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;
    gesture.isPointerDown = false;
    if (e && gesture.axis === 'horizontal') { try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {} }
    if (gesture.axis === 'horizontal') {
      const current = pagePosition.get();
      const vel = gesture.velocity;
      let target = Math.round(current);
      if (vel < -0.35) target = Math.min(2, Math.floor(gesture.startPos) + 1);
      else if (vel > 0.35) target = Math.max(0, Math.ceil(gesture.startPos) - 1);
      target = Math.max(0, Math.min(2, target));
      animate(pagePosition, target, { type: 'spring', stiffness: 340, damping: 30, velocity: -vel * 3 });
      if (tabs[target] !== activeTab) setActiveTab(tabs[target]);
    }
    gesture.axis = 'undetermined';
  };

  // This is the important path: dragging the literal rounded navbar sends its
  // pixel displacement here. No second animation or tab state is involved.
  const handleBarDragStart = () => {
    barDragRef.current = { active: true, startPos: pagePosition.get() };
    try { pagePosition.stop(); } catch (_) {}
  };
  const handleBarDrag = (deltaX: number) => {
    if (!barDragRef.current.active) return;
    const navWidth = Math.max(240, Math.min(420, window.innerWidth - 48));
    let next = barDragRef.current.startPos - (deltaX / navWidth) * 2;
    if (next < 0) next *= 0.18;
    if (next > 2) next = 2 + (next - 2) * 0.18;
    pagePosition.set(next);
  };
  const handleBarDragEnd = () => {
    if (!barDragRef.current.active) return;
    barDragRef.current.active = false;
    const target = Math.max(0, Math.min(2, Math.round(pagePosition.get())));
    animate(pagePosition, target, { type: 'spring', stiffness: 390, damping: 31 });
    setActiveTab(tabs[target]);
  };

  const containerX = useTransform(pagePosition, (pos) => `-${(pos / 3) * 100}%`);

  if (activeChat) return <div className="h-full w-full bg-zinc-950"><ChatThreadView chat={activeChat} onBack={closeChat} /></div>;

  return (
    <div className="relative flex h-full w-full flex-col bg-zinc-950 text-white overflow-hidden select-none">
      <Header onOpenSearch={() => setSearchOpen(true)} onOpenNewChit={() => setNewChitModalOpen(true)} onOpenSettings={() => setSettingsOpen(true)} />
      <div ref={containerRef} className="relative flex-1 overflow-hidden" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
        <motion.div className="flex h-full w-[300%] will-change-transform" style={{ x: containerX }}>
          <div className="h-full w-1/3 overflow-y-auto px-4 pt-3 pb-28 space-y-4" style={{ touchAction: 'pan-y' }}>{realmPosts.map((post) => <RealmPostCard key={post.id} post={post} />)}</div>
          <div className="h-full w-1/3 overflow-y-auto pb-28" style={{ touchAction: 'pan-y' }}><div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Recent Conversations ({chatItems.length})</div>{chatItems.map((chat) => <ChatListItem key={chat.id} chat={chat} onClick={() => openChat(chat.id)} />)}</div>
          <div className="h-full w-1/3 overflow-y-auto pt-2 pb-28" style={{ touchAction: 'pan-y' }}><ProfileBobView onOpenEditProfile={() => setEditProfileModalOpen(true)} onOpenSettings={() => setSettingsOpen(true)} /></div>
        </motion.div>
      </div>
      <BottomNav pagePosition={pagePosition} activeTab={activeTab} onSelectTab={handleSelectTab} onBarDragStart={handleBarDragStart} onBarDrag={handleBarDrag} onBarDragEnd={handleBarDragEnd} />
      <SearchModal /><EditProfileModal /><NewChitModal /><SettingsDrawer isOpen={isSettingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};
