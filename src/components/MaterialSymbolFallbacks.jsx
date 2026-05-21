import React from 'react';

const FALLBACK_ICONS = {
  add: '+',
  arrow_back: '‹',
  arrow_downward: '↓',
  arrow_forward: '›',
  arrow_upward: '↑',
  auto_stories: '📖',
  bolt: '⚡',
  calendar_month: '📅',
  cancel: '✕',
  celebration: '✦',
  check: '✓',
  check_circle: '✓',
  chevron_left: '‹',
  chevron_right: '›',
  close: '×',
  delete: '⌫',
  edit: '✎',
  emoji_events: '🏆',
  error: '!',
  expand_less: '⌃',
  expand_more: '⌄',
  explore: '✦',
  flag: '⚑',
  headset_mic: '🎧',
  hearing: '♪',
  help: '?',
  home: '⌂',
  info: 'i',
  keyboard_arrow_down: '⌄',
  keyboard_arrow_left: '‹',
  keyboard_arrow_right: '›',
  keyboard_arrow_up: '⌃',
  language: '文',
  lightbulb: '✦',
  local_fire_department: '🔥',
  lock: '🔒',
  login: '→',
  logout: '←',
  map: '◇',
  menu: '☰',
  menu_book: '📖',
  mic: '◉',
  more_horiz: '⋯',
  more_vert: '⋮',
  music_note: '♪',
  notifications: '●',
  pause: 'Ⅱ',
  person: '👤',
  play_arrow: '▶',
  psychology: '✦',
  quiz: '?',
  refresh: '↻',
  remove: '−',
  restart_alt: '↻',
  route: '⌁',
  schedule: '◷',
  school: '✦',
  search: '⌕',
  settings: '⚙',
  share: '↗',
  shield: '◆',
  skip_next: '›',
  skip_previous: '‹',
  star: '★',
  stars: '✦',
  target: '◎',
  translate: '文',
  trending_up: '↗',
  undo: '↶',
  videogame_asset: '▶',
  volume_off: '♪',
  volume_up: '♪',
  warning: '!',
  water_drop: '◆',
  waves: '≋',
};

const DEFAULT_FALLBACK = '•';

function normalizeIconName(value) {
  return String(value || '').trim().replace(/\s+/g, '_');
}

function applyMaterialSymbolFallbacks(root = document) {
  root.querySelectorAll?.('.material-symbols-outlined').forEach((element) => {
    const iconName = normalizeIconName(element.dataset.iconName || element.textContent);
    if (!iconName) return;

    element.dataset.iconName = iconName;
    element.dataset.fallbackIcon = FALLBACK_ICONS[iconName] || DEFAULT_FALLBACK;
  });
}

export default function MaterialSymbolFallbacks() {
  React.useEffect(() => {
    applyMaterialSymbolFallbacks();

    const observer = new MutationObserver((mutations) => {
      let shouldApply = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldApply = true;
          break;
        }
        if (mutation.type === 'characterData') {
          shouldApply = true;
          break;
        }
      }

      if (shouldApply) {
        applyMaterialSymbolFallbacks();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    window.addEventListener('load', applyMaterialSymbolFallbacks);

    return () => {
      observer.disconnect();
      window.removeEventListener('load', applyMaterialSymbolFallbacks);
    };
  }, []);

  return null;
}
