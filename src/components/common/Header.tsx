import React from 'react';
import { Share2, MoreHorizontal } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';

interface HeaderProps {
  onOpenSearch?: () => void;
  onOpenNewChit?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { activeTab, activeChatId } = useChitter();
  if (activeChatId || activeTab !== 'profile') return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-end border-b border-zinc-900/60 bg-zinc-950/80 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigator.share?.({ title: 'Chitter Profile', url: window.location.href })} className="rounded-full bg-zinc-900/80 p-2 text-zinc-300" aria-label="Share profile">
          <Share2 className="h-5 w-5" />
        </button>
        <button onClick={onOpenSettings} className="rounded-full bg-zinc-900/80 p-2 text-zinc-300" aria-label="Settings">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
