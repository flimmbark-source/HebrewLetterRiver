import React from 'react';
import {
  Award,
  ChevronRight,
  Flame,
  Home,
  Lock,
  Play,
  Settings,
  User,
  Waves,
} from 'lucide-react';

const MATERIAL_ICON_MAP = {
  chevron_right: ChevronRight,
  emoji_events: Award,
  home: Home,
  local_fire_department: Flame,
  lock: Lock,
  person: User,
  play_arrow: Play,
  settings: Settings,
  videogame_asset: Play,
  waves: Waves,
};

export default function Icon({
  name,
  children,
  className = '',
  size = 24,
  strokeWidth = 2.4,
  filled = false,
  fallback = null,
  ...props
}) {
  const iconName = name || children;
  const SvgIcon = MATERIAL_ICON_MAP[iconName];

  if (SvgIcon) {
    return (
      <SvgIcon
        aria-hidden="true"
        className={`app-icon ${className}`.trim()}
        size={size}
        strokeWidth={strokeWidth}
        fill={filled ? 'currentColor' : 'none'}
        {...props}
      />
    );
  }

  if (fallback) return fallback;

  return (
    <span
      className={`material-symbols-outlined ${className}`.trim()}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}
      aria-hidden="true"
      {...props}
    >
      {iconName}
    </span>
  );
}
