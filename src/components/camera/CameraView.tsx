import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

interface CameraViewProps {
  onClose: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError('Camera access is unavailable or permission was denied.');
      }
    };
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [facingMode]);

  return (
    <div className="fixed inset-0 z-[70] bg-black">
      {error ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center text-white">
          <Camera className="h-12 w-12 text-cyan-400" />
          <p className="text-sm text-zinc-300">{error}</p>
          <button onClick={onClose} className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-black">Close</button>
        </div>
      ) : (
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-5">
        <button onClick={onClose} className="pointer-events-auto rounded-full bg-black/60 p-3 text-white backdrop-blur-md">
          <X className="h-6 w-6" />
        </button>
        <button
          onClick={() => setFacingMode((mode) => (mode === 'environment' ? 'user' : 'environment'))}
          className="pointer-events-auto rounded-full bg-black/60 p-3 text-white backdrop-blur-md"
          aria-label="Switch camera"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-8 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white/90 bg-white/10 backdrop-blur-sm">
          <div className="h-11 w-11 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
};
