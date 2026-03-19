/**
 * Deep Script shrine upgrades — chosen during Shrine rooms.
 *
 * @typedef {Object} UpgradeDef
 * @property {string} id          — Stable identifier
 * @property {string} name        — Display name
 * @property {string} icon        — Emoji icon
 * @property {string} description — What it does
 * @property {string} effect      — Engine effect key
 * @property {*}      value       — Effect value
 */

export const upgradeDefinitions = [
  {
    id: 'larger-satchel',
    name: 'Deeper Satchel',
    icon: '🎒',
    description: 'Satchel holds 1 more letter.',
    effect: 'satchelSize',
    value: 1,
  },
  {
    id: 'extra-tray',
    name: 'Wider Tray',
    icon: '📐',
    description: 'Tray holds 1 more letter.',
    effect: 'traySize',
    value: 1,
  },
  {
    id: 'curse-ward',
    name: 'Thick Skin',
    icon: '🧘',
    description: 'Reduce end-of-turn curse damage by 1 (minimum 0).',
    effect: 'curseDamageReduction',
    value: 1,
  },
  {
    id: 'heal',
    name: 'Ancient Balm',
    icon: '💚',
    description: 'Restore 2 health.',
    effect: 'heal',
    value: 2,
  },
  {
    id: 'better-generation',
    name: 'Sharpened Quill',
    icon: '🪶',
    description: 'Letter generation is more likely to produce target letters.',
    effect: 'genAccuracy',
    value: 0.15,
  },
  {
    id: 'burn-upgrade',
    name: 'Phoenix Ash',
    icon: '🔥',
    description: 'Burning a letter now generates 2 new letters instead of 1.',
    effect: 'burnBonus',
    value: true,
  },
  {
    id: 'reduced-cooldown',
    name: 'Quick Hands',
    icon: '⚡',
    description: 'All gear cooldowns reduced by 1 (minimum 1).',
    effect: 'cooldownReduction',
    value: 1,
  },
  {
    id: 'insight-bonus',
    name: 'Scholar\'s Eye',
    icon: '👁️',
    description: 'Start each combat with 1 answer slot revealed.',
    effect: 'startReveal',
    value: 1,
  },
];

/**
 * Get N random upgrades for a shrine, avoiding duplicates of already-owned upgrades.
 */
export function getRandomUpgrades(count, ownedUpgradeIds = []) {
  const available = upgradeDefinitions.filter(u => !ownedUpgradeIds.includes(u.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
