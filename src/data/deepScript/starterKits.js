/**
 * Deep Script starter kits (classes).
 *
 * Each kit defines:
 * - identity (name, description, icon)
 * - starting stats (health, tray size, satchel size)
 * - starting gear (ability IDs)
 * - passive bonuses
 *
 * @typedef {Object} StarterKit
 * @property {string}   id          — Stable identifier
 * @property {string}   name        — Display name
 * @property {string}   icon        — Emoji icon
 * @property {string}   description — Short description
 * @property {string}   flavor      — Flavor text for character select
 * @property {number}   health      — Starting health
 * @property {number}   traySize    — Starting tray capacity
 * @property {number}   satchelSize — Starting satchel capacity
 * @property {string[]} gearIds     — Starting ability/gear IDs
 * @property {Object}   passives    — Passive bonuses
 */

export const starterKits = [
  {
    id: 'scribe',
    name: 'Scribe',
    icon: '✒️',
    description: 'Reliable letter generation. Straightforward and dependable.',
    flavor: 'The Scribe shapes letters with care and precision, calling forth exactly what is needed.',
    health: 5,
    traySize: 6,
    satchelSize: 3,
    gearIds: ['scribe-knife', 'echo-mirror'],
    passives: {
      exactLetterBonus: true,    // generates exact letters more often
      burnDrawChance: 0.4,       // 40% chance to draw after burn
    },
  },
  {
    id: 'interpreter',
    name: 'Interpreter',
    icon: '🔮',
    description: 'Better clues and choice bundles. Forgiving of mistakes.',
    flavor: 'The Interpreter reads meaning between letters, divining patterns where others see chaos.',
    health: 6,
    traySize: 6,
    satchelSize: 3,
    gearIds: ['meaning-lantern', 'choice-sigil'],
    passives: {
      reducedPressurePenalty: true, // wrong placements give +1 pressure instead of +2
      bonusChoiceCount: 1,          // choice bundles offer 1 extra option
    },
  },
  {
    id: 'rootkeeper',
    name: 'Rootkeeper',
    icon: '🌿',
    description: 'Pattern-based transforms. Higher skill ceiling.',
    flavor: 'The Rootkeeper tends ancient roots, coaxing letters to shift form and reveal hidden connections.',
    health: 4,
    traySize: 7,
    satchelSize: 3,
    gearIds: ['root-lens', 'rune-tongs'],
    passives: {
      transformBonus: true,       // transforms have wider letter pool
      rootRevealChance: 0.3,      // 30% chance to auto-reveal a root letter at combat start
    },
  },
];

export function getStarterKit(id) {
  return starterKits.find(k => k.id === id) || null;
}
