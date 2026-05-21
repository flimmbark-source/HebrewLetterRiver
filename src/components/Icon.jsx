import React from 'react';
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Dumbbell,
  Flame,
  Gamepad2,
  Home,
  Landmark,
  Lock,
  Map,
  MessageCircle,
  Mountain,
  Play,
  RefreshCw,
  Route,
  Search,
  Settings,
  Shield,
  Star,
  Target,
  TrendingUp,
  User,
  Waves,
} from 'lucide-react';

const MATERIAL_ICON_MAP = {
  auto_stories: BookOpen,
  calendar_month: CalendarCheck,
  center_focus_strong: Target,
  check_circle: CalendarCheck,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  event_available: CalendarCheck,
  expand_less: ChevronUp,
  expand_more: ChevronDown,
  explore: Compass,
  fitness_center: Dumbbell,
  foundation: Landmark,
  emoji_events: Award,
  home: Home,
  keyboard_arrow_down: ChevronDown,
  keyboard_arrow_left: ChevronLeft,
  keyboard_arrow_right: ChevronRight,
  keyboard_arrow_up: ChevronUp,
  landscape: Mountain,
  local_fire_department: Flame,
  lock: Lock,
  map: Map,
  menu_book: BookOpen,
  person: User,
  play_arrow: Play,
  restart_alt: RefreshCw,
  route: Route,
  search: Search,
  settings: Settings,
  shield: Shield,
  star: Star,
  stars: Star,
  target: Target,
  task_alt: BadgeCheck,
  trending_up: TrendingUp,
  videogame_asset: Gamepad2,
  waves: Waves,
  chat_bubble: MessageCircle,
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
