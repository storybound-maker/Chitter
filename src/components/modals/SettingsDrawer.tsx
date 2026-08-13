import React from 'react';
import { X, Shield, Bell, LogOut, RefreshCw } from 'lucide-react';
import { useChitter } from '../../context/ChitterContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayOnboarding?: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  onReplayOnboarding,
}) => {
  const { logout, userProfile } = useChitter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="h-full w-full max-w-xs border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-zinc-900">
            <h2 className="text-lg font-bold text-white">Chitter Settings</h2>
            <button onClick={onClose} className="rounded-full p-1 text-zinc-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="py-6 space-y-3">
            {/* Menu Sections */}
            <button className="flex w-full items-center space-x-3 rounded-2xl bg-zinc-900/40 p-3 text-left text-sm text-zinc-200 hover:bg-zinc-900">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span>Privacy & Controls</span>
            </button>

            <button className="flex w-full items-center space-x-3 rounded-2xl bg-zinc-900/40 p-3 text-left text-sm text-zinc-200 hover:bg-zinc-900">
              <Bell className="h-4 w-4 text-cyan-400" />
              <span>Push Notifications</span>
            </button>

            {onReplayOnboarding && (
              <button
                onClick={() => {
                  onClose();
                  onReplayOnboarding();
                }}
                className="flex w-full items-center space-x-3 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 p-3 text-left text-sm text-cyan-300 hover:bg-cyan-900/40"
              >
                <RefreshCw className="h-4 w-4 text-cyan-400" />
                <span>Replay Onboarding</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Logout Button */}
        <div className="pt-6 border-t border-zinc-900">
          <div className="mb-4 text-xs text-zinc-500">
            Logged in as <span className="font-bold text-white">{userProfile.handle}</span>
          </div>
          <button
            onClick={async () => {
              onClose();
              await logout();
            }}
            className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-rose-500/10 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

