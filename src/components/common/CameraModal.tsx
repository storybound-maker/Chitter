import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  X,
  RotateCw,
  Sparkles,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Type,
  Smile,
  Sliders,
  Crop,
  Layers,
} from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePhoto: (photoUrl: string, caption?: string) => void;
}

type EditorFilter = 'normal' | 'cyan' | 'noir' | 'vivid' | 'retro';

const FILTER_PRESETS: { id: EditorFilter; label: string; css: string }[] = [
  { id: 'normal', label: 'Normal', css: 'none' },
  { id: 'cyan', label: 'Cyan Glow', css: 'hue-rotate(180deg) saturate(1.8) brightness(1.05)' },
  { id: 'noir', label: 'Noir', css: 'grayscale(1) contrast(1.4) brightness(0.95)' },
  { id: 'vivid', label: 'Cyber', css: 'saturate(2.2) contrast(1.15) hue-rotate(20deg)' },
  { id: 'retro', label: 'Retro', css: 'sepia(0.65) hue-rotate(310deg) saturate(1.4)' },
];

const STICKERS = ['⚡ FEELING FUNNY', '🔥 CHITTER VIBES', '🌀 BOB LIFE', '💬 REAL TALK'];

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapturePhoto,
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Editor states
  const [selectedFilter, setSelectedFilter] = useState<EditorFilter>('normal');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');
  const [rotationDeg, setRotationDeg] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize MediaStream when modal opens or camera flips
  useEffect(() => {
    if (!isOpen || capturedImage) return;

    let currentStream: MediaStream | null = null;
    setErrorMsg(null);

    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera hardware access API not supported in this browser environment.');
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1440 } },
          audio: false,
        });

        currentStream = newStream;
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err: any) {
        console.warn('Camera access failed:', err);
        setErrorMsg('Camera access is needed to use Chitter Camera.');
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, facingMode, capturedImage]);

  // Clean up stream on close
  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setSelectedFilter('normal');
    setSelectedSticker(null);
    setCaptionText('');
    setRotationDeg(0);
    setErrorMsg(null);
    onClose();
  };

  // Flip Camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Take Snapshot from video stream onto canvas
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 960;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror if front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);

      // Stop camera stream during editing
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    }
  };

  // Fallback File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm and Use Photo
  const handleUsePhoto = () => {
    if (!capturedImage) return;

    // Apply Filter, Rotation, Sticker, Caption on a composite canvas before exporting
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Filter
        const activeFilter = FILTER_PRESETS.find((f) => f.id === selectedFilter);
        if (activeFilter && activeFilter.css !== 'none') {
          ctx.filter = activeFilter.css;
        }

        // Rotate
        if (rotationDeg !== 0) {
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotationDeg * Math.PI) / 180);
          ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);
        } else {
          ctx.drawImage(img, 0, 0);
        }

        // Reset filter for text / sticker
        ctx.filter = 'none';

        // Render Sticker if selected
        if (selectedSticker) {
          ctx.font = 'bold 32px sans-serif';
          ctx.fillStyle = '#00d2ff';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 12;
          ctx.fillText(selectedSticker, 40, canvas.height - 120);
        }

        // Render Caption if present
        if (captionText) {
          ctx.font = '28px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.9)';
          ctx.shadowBlur = 10;
          ctx.fillText(captionText, 40, canvas.height - 60);
        }

        const finalDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        onCapturePhoto(finalDataUrl, captionText);
        handleClose();
      }
    };
    img.src = capturedImage;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none"
      >
        {/* Hidden File Input Fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* TOP BAR */}
        <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-white hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="text-sm font-bold tracking-wider uppercase text-cyan-400">
            {capturedImage ? 'Chitter Photo Editor' : 'Chitter Camera'}
          </span>

          {!capturedImage && !errorMsg ? (
            <button
              onClick={toggleFacingMode}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900/80 text-white hover:bg-zinc-800 transition"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* MAIN VIEWPORT */}
        <div className="relative flex-1 flex items-center justify-center bg-zinc-950 overflow-hidden">
          {/* CAMERA FEED OR CAPTURED PHOTO */}
          {!capturedImage ? (
            errorMsg ? (
              /* CAMERA PERMISSION / HARDWARE ERROR CARD */
              <div className="flex max-w-sm flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-950 text-cyan-400 border border-cyan-400/40">
                  <Camera className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Camera Unavailable</h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{errorMsg}</p>
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => {
                      setErrorMsg(null);
                      setFacingMode('user');
                    }}
                    className="flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-black shadow-[0_0_15px_#00d2ff]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
                  >
                    <ImageIcon className="h-4 w-4 text-cyan-400" />
                    Choose Photo from Device
                  </button>
                </div>
              </div>
            ) : (
              /* LIVE CAMERA PREVIEW */
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`h-full w-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />
            )
          ) : (
            /* CAPTURED IMAGE EDITOR PREVIEW */
            <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured Preview"
                className="max-h-full max-w-full object-contain transition-all duration-200"
                style={{
                  filter: FILTER_PRESETS.find((f) => f.id === selectedFilter)?.css || 'none',
                  transform: `rotate(${rotationDeg}deg)`,
                }}
              />

              {/* STICKER OVERLAY */}
              {selectedSticker && (
                <div className="absolute bottom-20 left-6 z-10 rounded-lg bg-black/70 border border-cyan-400/80 px-3 py-1.5 text-sm font-black text-cyan-400 shadow-[0_0_15px_rgba(0,210,255,0.5)]">
                  {selectedSticker}
                </div>
              )}

              {/* CAPTION OVERLAY */}
              {captionText && (
                <div className="absolute bottom-8 left-6 right-6 z-10 rounded-lg bg-black/80 p-2.5 text-sm font-medium text-white shadow-lg border border-zinc-800">
                  {captionText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="relative z-20 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
          {!capturedImage ? (
            /* LIVE CAMERA SHUTTER & GALLERY FALLBACK */
            <div className="flex items-center justify-around">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                title="Upload Photo"
              >
                <ImageIcon className="h-5 w-5" />
              </button>

              {/* LARGE SHUTTER BUTTON */}
              <button
                onClick={takeSnapshot}
                disabled={!!errorMsg}
                className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-cyan-400 p-1.5 transition active:scale-95 disabled:opacity-40"
              >
                <div className="h-full w-full rounded-full bg-cyan-400 shadow-[0_0_20px_#00d2ff] group-active:bg-cyan-300" />
              </button>

              <div className="w-12" />
            </div>
          ) : (
            /* PHOTO EDITOR TOOLBAR & CONFIRM BUTTONS */
            <div className="space-y-4">
              {/* FILTER / STYLER SELECTOR */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {FILTER_PRESETS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                      selectedFilter === f.id
                        ? 'bg-cyan-400 text-black shadow-[0_0_10px_#00d2ff]'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* STICKER SELECTOR */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {STICKERS.map((st) => (
                  <button
                    key={st}
                    onClick={() =>
                      setSelectedSticker((prev) => (prev === st ? null : st))
                    }
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition ${
                      selectedSticker === st
                        ? 'bg-cyan-950 border border-cyan-400 text-cyan-300'
                        : 'bg-zinc-900/80 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* CAPTION INPUT & ROTATE */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  className="flex-1 rounded-full bg-zinc-900 border border-zinc-800 px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => setRotationDeg((deg) => (deg + 90) % 360)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
                  title="Rotate Photo"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>

              {/* ACTION BUTTONS: RETAKE vs USE PHOTO */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  onClick={() => {
                    setCapturedImage(null);
                    setSelectedFilter('normal');
                    setSelectedSticker(null);
                    setCaptionText('');
                  }}
                  className="flex-1 rounded-full bg-zinc-900 border border-zinc-800 py-3 text-xs font-bold text-zinc-300 hover:bg-zinc-800 transition"
                >
                  Retake
                </button>
                <button
                  onClick={handleUsePhoto}
                  className="flex-1 flex items-center justify-center gap-2 rounded-full bg-cyan-400 py-3 text-xs font-black text-black shadow-[0_0_20px_#00d2ff] hover:bg-cyan-300 transition"
                >
                  <Check className="h-4 w-4" />
                  Use Photo / Post
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
