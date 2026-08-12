import React from 'react';

interface PacmanAvatarProps {
  imageUrl?: string;
  size?: number; // size in pixels e.g. 36, 48, 120
  className?: string;
  isIconOnly?: boolean; // For tab bar icon
  active?: boolean;
}

export const PacmanAvatar: React.FC<PacmanAvatarProps> = ({
  imageUrl,
  size = 48,
  className = '',
  isIconOnly = false,
  active = false,
}) => {
  // Pacman mouth cutout angle SVG path calculation
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
            active ? 'text-white' : 'text-slate-400'
          }`}
        >
          {/* Circular shape with mouth open right */}
          <path
            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C15.0113 22 17.7027 20.6698 19.5397 18.5586L12 12L19.5397 5.44141C17.7027 3.33022 15.0113 2 12 2Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`relative inline-block overflow-hidden rounded-full border-2 border-zinc-800/80 shadow-lg ${className}`}
      style={{ width: sizePx, height: sizePx }}
    >
      {/* Background Image */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Avatar"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-white">
          CH
        </div>
      )}

      {/* SVG Overlay to mask the Pacman mouth cutout on the right edge */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dark wedge cutout representing the Pacman mouth cut */}
        <polygon points="100,50 62,28 62,72" fill="#09090b" />
      </svg>
    </div>
  );
};
