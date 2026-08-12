import React, { useState } from 'react';
import { Wifi, Signal, Battery, Smartphone, Maximize2 } from 'lucide-react';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({ children }) => {
  const [isFrameEnabled, setIsFrameEnabled] = useState(true);

  if (!isFrameEnabled) {
    return (
      <div className="relative h-screen w-screen bg-black overflow-hidden flex flex-col justify-center items-center">
        <div className="h-full w-full max-w-md relative bg-zinc-950">
          <button
            onClick={() => setIsFrameEnabled(true)}
            className="fixed top-3 right-3 z-50 flex items-center space-x-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-300 shadow-xl backdrop-blur-md hover:text-white"
          >
            <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
            <span>Mobile Frame</span>
          </button>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 p-2 sm:p-6 overflow-hidden">
      {/* Top Toggle Controls */}
      <div className="fixed top-3 right-3 z-50 flex items-center space-x-2">
        <button
          onClick={() => setIsFrameEnabled(false)}
          className="flex items-center space-x-1.5 rounded-full border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs text-zinc-300 shadow-xl backdrop-blur-md hover:text-white active:scale-95"
        >
          <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>Full Screen</span>
        </button>
      </div>

      {/* Realistic Mobile Device Container */}
      <div className="relative flex h-full max-h-[850px] w-full max-w-[400px] flex-col overflow-hidden rounded-[48px] border-[10px] border-zinc-800/90 bg-zinc-950 shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-zinc-700/50">
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-0 left-0 right-0 z-50 flex h-10 items-center justify-between px-7 pt-2 pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
          {/* Status Bar Time (9:41 matching reference photos) */}
          <span className="text-xs font-bold tracking-tight text-white">9:41</span>

          {/* Notch Pill */}
          <div className="h-4 w-24 rounded-full bg-black ring-1 ring-zinc-800/80" />

          {/* Status Bar Indicators */}
          <div className="flex items-center space-x-1.5 text-white">
            <Signal className="h-3 w-3 fill-white text-white" />
            <Wifi className="h-3 w-3" />
            <Battery className="h-3.5 w-3.5 fill-white text-white" />
          </div>
        </div>

        {/* Screen Content Wrapper */}
        <div className="relative flex-1 pt-8 overflow-hidden bg-zinc-950">
          {children}
        </div>

        {/* Home Bar Indicator Line */}
        <div className="pointer-events-none absolute bottom-1.5 left-1/2 z-50 h-1 w-32 -translate-x-1/2 rounded-full bg-zinc-600/80" />
      </div>
    </div>
  );
};
