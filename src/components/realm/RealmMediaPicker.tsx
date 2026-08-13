import React, { useRef } from 'react';
import { Image, Video } from 'lucide-react';

interface RealmMediaPickerProps {
  onPicked: (url: string, type: 'image' | 'video') => void;
}

export const RealmMediaPicker: React.FC<RealmMediaPickerProps> = ({ onPicked }) => {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null, type: 'image' | 'video') => {
    const file = files?.[0];
    if (!file) return;
    onPicked(URL.createObjectURL(file), type);
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => imageRef.current?.click()}
        className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:border-cyan-400 hover:text-cyan-300"
      >
        <Image className="h-4 w-4" /> Picture
      </button>
      <button
        type="button"
        onClick={() => videoRef.current?.click()}
        className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:border-cyan-400 hover:text-cyan-300"
      >
        <Video className="h-4 w-4" /> Video
      </button>
      <input
        ref={imageRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files, 'image')}
      />
      <input
        ref={videoRef}
        hidden
        type="file"
        accept="video/*"
        onChange={(e) => handleFiles(e.target.files, 'video')}
      />
    </div>
  );
};
