export const COLORS = {
  background: '#09090b',
  surface: '#121215',
  surfaceElevated: '#1c1c22',
  surfaceHover: '#262630',
  border: '#27272a',
  borderLight: '#3f3f46',
  
  // Signature Accents
  primaryCyan: '#00d2ff',
  primaryCyanGlow: 'rgba(0, 210, 255, 0.25)',
  accentRed: '#ff2a5f',
  accentPurple: '#a855f7',
  
  // Typography
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Status
  online: '#10b981',
  unreadBadge: '#00d2ff',
  unreadBadgeText: '#000000',
};

export const NAVIGATION_TABS = [
  { id: 'realm', label: 'Realm', icon: 'globe' },
  { id: 'chatter', label: 'Chatter', icon: 'chat' },
  { id: 'profile', label: 'Profile Bob', icon: 'pacman' },
] as const;
