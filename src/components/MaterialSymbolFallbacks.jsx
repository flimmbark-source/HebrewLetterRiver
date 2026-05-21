import React from 'react';

const FALLBACK_ICONS = {
  add: '+',
  arrow_back: '<',
  arrow_downward: 'v',
  arrow_forward: '>',
  arrow_upward: '^',
  auto_stories: 'B',
  calendar_month: 'C',
  cancel: 'x',
  chat_bubble: 'o',
  check: 'v',
  check_circle: 'v',
  chevron_left: '<',
  chevron_right: '>',
  close: 'x',
  delete: 'x',
  edit: '/',
  error: '!',
  event_available: 'v',
  expand_less: '^',
  expand_more: 'v',
  flag: 'F',
  foundation: '#',
  help: '?',
  home: 'H',
  info: 'i',
  keyboard_arrow_down: 'v',
  keyboard_arrow_left: '<',
  keyboard_arrow_right: '>',
  keyboard_arrow_up: '^',
  landscape: '^',
  language: 'A',
  lock: 'L',
  login: '>',
  logout: '<',
  map: 'M',
  menu: '=',
  menu_book: 'B',
  mic: 'o',
  more_horiz: '...',
  more_vert: ':',
  music_note: '~',
  notifications: 'o',
  pause: 'II',
  person: 'P',
  play_arrow: '>',
  quiz: '?',
  refresh: 'R',
  remove: '-',
  restart_alt: 'R',
  route: '~',
  schedule: 'T',
  search: '?',
  share: '^',
  shield: 'S',
  skip_next: '>',
  skip_previous: '<',
  target: 'o',
  translate: 'A',
  trending_up: '^',
  undo: '<',
  videogame_asset: '>',
  volume_off: '~',
  volume_up: '~',
  warning: '!',
  water_drop: 'd',
  waves: '~',
};

function normalizeIconName(value) {
  return String(value || '').trim().replace(/\s+/g, '_');
}

function applyMaterialSymbolFallbacks(root = document) {
  root.querySelectorAll?.('.material-symbols-outlined').forEach((element) => {
    const iconName = normalizeIconName(element.dataset.iconName || element.textContent);
    if (!iconName) return;

    element.dataset.iconName = iconName;
    element.dataset.fallbackIcon = FALLBACK_ICONS[iconName] || '';
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
