import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useChitter } from '../context/ChitterContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { ChatThreadView } from '../components/chatter/ChatThreadView';
import { RealmView } from '../components/realm/RealmView';
import { ChatterView } from '../components/chatter/ChatterView';
import { ProfileBobView } from '../components/profile/ProfileBobView';
import { SearchModal } from '../components/modals/SearchModal';
import { EditProfileModal } from '../components/modals/EditProfileModal';
import { NewChitModal } from '../components/modals/NewChitModal';
import { SettingsDrawer } from '../components/modals/SettingsDrawer';
import { CameraModal } from '../components/common/CameraModal';
import { OnboardingScreen } from './OnboardingScreen';
import { HomeTab } from '../types';

export const HomeScreen: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    chatItems,
    activeChatId,
    closeChat,
    setSearchOpen,
    setNewChitModalOpen,
    setEditProfileModalOpen,
  } = useChitter();

  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isCameraOpen, setCameraOpen] = useState(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | undefined>(undefined);

  const [isOnboarding, setIsOnboarding] = useState<boolean>(() => {
    try {
      return localStorage.getItem('chitter_onboarding_completed') !== 'true';
    } catch (_) {
      return true;
    }
  });

  const activeChat = chatItems.find((c) => c.id === activeChatId);
  const tabs: HomeTab[] = ['realm', 'chatter', 'profile'];
  const currentIndex = tabs.indexOf(activeTab);
  const pagePosition = useMotionValue(currentIndex);
  const containerRef = useRef<HTMLDivElement>(null);

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
    lastTime: performance.now(),
    velocity: 0,
    isPointerDown: false,
  });

  useEffect(() => {
    const target = tabs.indexOf(activeTab);
    const current = pagePosition.get();
    if (Math.abs(current - target) > 0.01 && !gestureRef.current.isPointerDown) {
      animate(pagePosition, target, { type: 'spring', stiffness: 320, damping: 30 });
    }
  }, [activeTab]);

  const handleSelectTab = (tab: HomeTab) => {
    const targetIdx = tabs.indexOf(tab);
    setActiveTab(tab);
    animate(pagePosition, targetIdx, { type: 'spring', stiffness: 350, damping: 30 });
  };

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
      gesture.velocity = (currentX - gesture.lastX) / dt;
      gesture.lastX = currentX;
      gesture.lastTime = now;
    }

    if (gesture.axis === 'undetermined') {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (Math.hypot(dx, dy) >= 6) {
        if (absDx > absDy * 1.1) {
          gesture.axis = 'horizontal';
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
        } else {
          gesture.axis = 'vertical';
        }
      }
    }

    if (gesture.axis === 'horizontal') {
      const width = containerRef.current?.clientWidth || window.innerWidth || 360;
      const deltaPage = -dx / width;
      let targetPos = gesture.startPos + deltaPage;
      if (targetPos < 0) targetPos *= 0.25;
      else if (targetPos > 2) targetPos = 2 + (targetPos - 2) * 0.25;
      pagePosition.set(targetPos);
    }
  };

  const handlePointerUp = (e?: React.PointerEvent) => {
    const gesture = gestureRef.current;
    if (!gesture.isPointerDown) return;
    gesture.isPointerDown = false;

    if (e && e.currentTarget && gesture.axis === 'horizontal') {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    if (gesture.axis === 'horizontal') {
      const currentPos = pagePosition.get();
      const vel = gesture.velocity;
      let targetIndex = Math.round(currentPos);

      if (vel < -0.35) {
        targetIndex = Math.min(2, Math.floor(gesture.startPos) + 1);
        if (currentPos > 1.2) targetIndex = 2;
      } else if (vel > 0.35) {
        targetIndex = Math.max(0, Math.ceil(gesture.startPos) - 1);
        if (currentPos < 0.8) targetIndex = 0;
      } else {
        targetIndex = Math.min(2, Math.max(0, Math.round(currentPos)));
      }

      animate(pagePosition, targetIndex, {
        type: 'spring',
        stiffness: 340,
        damping: 30,
        velocity: -vel * 3,
      });

      const nextTab = tabs[targetIndex];
      if (nextTab !== activeTab) setActiveTab(nextTab);
    }

    gesture.axis = 'undetermined';
  };

  const containerX = useTransform(pagePosition, (pos) => `-${(pos / 3) * 100}%`);

  const handleCapturePhoto = (photoUrl: string) => {
    setCapturedPhotoUrl(photoUrl);
    setNewChitModalOpen(true);
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  if (isOnboarding) {
    return <OnboardingScreen onComplete={() => setIsOnboarding(false)} />;
  }

  if (activeChat) {
    return (
      <div className="h-full w-full bg-zinc-950">
        <ChatThreadView chat={activeChat} onBack={closeChat} />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col bg-zinc-950 text-white overflow-hidden select-none">
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNewChit={() => setNewChitModalOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.div className="flex h-full w-[300%] will-change-transform" style={{ x: containerX }}>
          <div className="h-full w-1/3 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
            <RealmView
              onOpenNewChit={() => setNewChitModalOpen(true)}
              onOpenCamera={() => setCameraOpen(true)}
            />
          </div>

          <div className="h-full w-1/3 overflow-y-auto" style={{ touchAction: 'pan-y' }}>
            <ChatterView onOpenCamera={() => setCameraOpen(true)} />
          </div>

          <div className="h-full w-1/3 overflow-y-auto pt-2 pb-28" style={{ touchAction: 'pan-y' }}>
            <ProfileBobView
              onOpenEditProfile={() => setEditProfileModalOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </div>
        </motion.div>
      </div>

      <BottomNav
        pagePosition={pagePosition}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenNewChit={() => setNewChitModalOpen(true)}
        onOpenCamera={() => setCameraOpen(true)}
        onRefreshPage={handleRefreshPage}
      />

      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapturePhoto={handleCapturePhoto}
      />

      <SearchModal />
      <EditProfileModal />
      <NewChitModal initialImageUrl={capturedPhotoUrl} />
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        onReplayOnboarding={() => setIsOnboarding(true)}
      />
    </div>
  );
};
