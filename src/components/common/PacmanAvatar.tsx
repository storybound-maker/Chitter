import React from 'react';

interface PacmanAvatarProps {
  imageUrl?: string;
  size?: number; // size in pixels e.g. 36, 48, 120
  className?: string;
  isIconOnly?: boolean; // For tab bar icon
  active?: boolean;
  hasStory?: boolean;
  showRing?: boolean;
}

export const PacmanAvatar: React.FC<PacmanAvatarProps> = ({
  imageUrl,
  size = 48,
  className = '',
  isIconOnly = false,
  active = false,
  hasStory = false,
  showRing = false,
}) => {
  const sizePx = `${size}px`;

  if (isIconOnly) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-colors duration-200 ${
            active ? 'text-cyan-400' : 'text-zinc-500'
          }`}
        >
          {/* Circular Pac-man shape with missing wedge on right */}
          <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C15.0113 22 17.7027 20.6698 19.5397 18.5586L12 12L19.5397 5.44141C17.7027 3.33022 15.0113 2 12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // Polygon clipping out a missing wedge (Pac-Man mouth shape) on the right edge
  // Points: Top-left(0,0), Top-right(100,0), Wedge-upper(100,32), Center-pivot(58,50), Wedge-lower(100,68), Bottom-right(100,100), Bottom-left(0,100)
  const clipPathStyle = {
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 32%, 58% 50%, 100% 68%, 100% 100%, 0% 100%)',
    WebkitClipPath: 'polygon(0% 0%, 100% 0%, 100% 32%, 58% 50%, 100% 68%, 100% 100%, 0% 100%)',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: sizePx, height: sizePx }}
    >
      {/* Outer Cyan Story Ring if enabled */}
      {(hasStory || showRing) && (
        <div
          className="absolute -inset-1 rounded-full border-2 border-cyan-400/90 shadow-[0_0_10px_rgba(0,210,255,0.4)] pointer-events-none"
          style={clipPathStyle}
        />
      )}

      {/* Main Avatar Profile Container */}
      <div
        className="relative h-full w-full overflow-hidden rounded-full bg-zinc-900 shadow-md transition-transform duration-200"
        style={clipPathStyle}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Chitter Bob"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-cyan-400">
            BOB
          </div>
        )}
      </div>

      {/* Small Active Cyan Dot indicator */}
      {active && (
        <span className="absolute bottom-0 left-0 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-black shadow-[0_0_8px_#00d2ff]" />
      )}
    </div>
  );
};

