/**
 * Bridge Builder vocabulary packs — guided progression content.
 *
 * Each pack groups related words into a themed lesson.
 * Packs are ordered for progressive learning — earlier packs unlock first.
 *
 * Structure designed for future glossary integration:
 *   - wordIds reference stable IDs from bridgeBuilderWords
 *   - pack metadata (title, theme, description) can be displayed in glossary groupings
 *
 * @typedef {Object} Pack
 * @property {string}   id           — Stable pack identifier
 * @property {string}   title        — Display title
 * @property {string}   theme        — Theme category
 * @property {string}   description  — Short description for setup screen
 * @property {string[]} wordIds      — Ordered list of word IDs in this pack
 * @property {number}   order        — Sort order for progression path
 * @property {string|null} unlockAfter — Pack ID that must be completed to unlock this one (null = unlocked by default)
 */

export const bridgeBuilderPacks = [
  {
    id: 'greetings_01',
    title: 'Greetings',
    theme: 'greetings',
    description: 'Hello, thank you, and basic courtesy',
    wordIds: ['bb-shalom', 'bb-todah', 'bb-boker-tov', 'bb-layla-tov', 'bb-bevakasha'],
    order: 1,
    unlockAfter: null,
  },
  {
    id: 'pronouns_01',
    title: 'Pronouns',
    theme: 'pronouns',
    description: 'I, you, and basic pronouns',
    wordIds: ['bb-ani', 'bb-atah', 'bb-at'],
    order: 2,
    unlockAfter: 'greetings_01',
  },
  {
    id: 'family_01',
    title: 'Family',
    theme: 'family',
    description: 'Mom, dad, family, and home',
    wordIds: ['bb-ima', 'bb-abba', 'bb-mishpacha', 'bb-bayit'],
    order: 3,
    unlockAfter: 'pronouns_01',
  },
  {
    id: 'food_01',
    title: 'Food & Drink',
    theme: 'food',
    description: 'Bread, water, coffee, and more',
    wordIds: ['bb-lechem', 'bb-mayim', 'bb-cafe', 'bb-tapuach'],
    order: 4,
    unlockAfter: 'family_01',
  },
  {
    id: 'adjectives_01',
    title: 'Adjectives',
    theme: 'adjectives',
    description: 'Good, big, small, beautiful',
    wordIds: ['bb-tov', 'bb-gadol', 'bb-katan', 'bb-yafe'],
    order: 5,
    unlockAfter: 'food_01',
  },
];

/**
 * Get a pack by ID.
 */
export function getPackById(packId) {
  return bridgeBuilderPacks.find(p => p.id === packId) || null;
}

/**
 * Get packs sorted by progression order.
 */
export function getPacksInOrder() {
  return [...bridgeBuilderPacks].sort((a, b) => a.order - b.order);
}
