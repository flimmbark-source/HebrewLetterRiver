/**
 * Deep Script gear/ability definitions.
 *
 * Design principle: the card's visual elements (sockets, energy diamonds,
 * cooldown badges) already communicate most mechanics. The `shortDesc` text
 * only needs to state the OUTCOME — what the player gets. How to use it
 * (socketing, activating) is implied by the UI affordances.
 *
 * Outcome icons (used in shortDesc):
 *   ▨  = random tile       ★  = exact needed tile
 *
 * @typedef {Object} GearDef
 * @property {string}   id
 * @property {string}   name
 * @property {string}   icon          — Gear identity emoji
 * @property {string}   shortDesc     — Outcome text for card face (~8 chars max)
 * @property {string}   detailedDescription — One-line quality/odds note (tooltip)
 * @property {string}   type
 * @property {number}   energyCost
 * @property {number}   cooldown
 * @property {number}   uses          — -1 = unlimited
 * @property {Object[]} tileSockets
 * @property {string}   [kitId]
 */

export const gearDefinitions = [
  // --- Scribe gear ---
  {
    id: 'scribe-knife',
    name: 'Scribe Knife',
    icon: '🗡️',
    shortDesc: '+2 ▨ (30%)',
    detailedDescription: '30% chance each tile is from the target word.',
    type: 'generate-random',
    energyCost: 2,
    cooldown: 0,
    uses: -1,
    tileSockets: [],
    kitId: 'scribe',
  },
  {
    id: 'echo-mirror',
    name: 'Echo Mirror',
    icon: '🪞',
    shortDesc: 'Copy ×2',
    detailedDescription: 'Produces 2 copies of the socketed tile.',
    type: 'duplicate',
    energyCost: 1,
    cooldown: 2,
    uses: -1,
    tileSockets: [{ type: 'required' }],
    kitId: 'scribe',
  },

  // --- Interpreter gear ---
  {
    id: 'meaning-lantern',
    name: 'Lantern',
    icon: '🏮',
    shortDesc: 'Reveal',
    detailedDescription: 'Shows a random unrevealed slot.',
    type: 'reveal',
    energyCost: 2,
    cooldown: 0,
    uses: 3,
    tileSockets: [],
    kitId: 'interpreter',
  },
  {
    id: 'choice-sigil',
    name: 'Sigil',
    icon: '⚜️',
    shortDesc: 'Pick 1/3',
    detailedDescription: 'At least 1 is a target letter.',
    type: 'choice',
    energyCost: 2,
    cooldown: 2,
    uses: -1,
    tileSockets: [],
    kitId: 'interpreter',
  },

  // --- Rootkeeper gear ---
  {
    id: 'root-lens',
    name: 'Root Lens',
    icon: '🔍',
    shortDesc: 'Reveal',
    detailedDescription: 'Shows a random unrevealed slot.',
    type: 'reveal',
    energyCost: 1,
    cooldown: 0,
    uses: 3,
    tileSockets: [],
    kitId: 'rootkeeper',
  },
  {
    id: 'rune-tongs',
    name: 'Tongs',
    icon: '🔧',
    shortDesc: 'Reforge (50%)',
    detailedDescription: '50% exact target letter, 50% random.',
    type: 'transform',
    energyCost: 1,
    cooldown: 1,
    uses: -1,
    tileSockets: [{ type: 'required' }],
    kitId: 'rootkeeper',
  },

  // --- Shared gear ---
  {
    id: 'ash-brazier',
    name: 'Brazier',
    icon: '🔥',
    shortDesc: '+2 ▨ (40%)',
    detailedDescription: '40% chance each tile is from the target word.',
    type: 'burn',
    energyCost: 1,
    cooldown: 1,
    uses: -1,
    tileSockets: [{ type: 'required' }],
    kitId: null,
  },
  {
    id: 'ward-stone',
    name: 'Ward',
    icon: '🛡️',
    shortDesc: 'Block',
    detailedDescription: 'Negates the next enemy action.',
    type: 'defend',
    energyCost: 1,
    cooldown: 2,
    uses: -1,
    tileSockets: [],
    kitId: null,
  },
  {
    id: 'reveal-scroll',
    name: 'Scroll',
    icon: '📜',
    shortDesc: 'Reveal',
    detailedDescription: 'Single use per combat.',
    type: 'reveal',
    energyCost: 0,
    cooldown: 0,
    uses: 1,
    tileSockets: [],
    kitId: null,
  },
  {
    id: 'inscription-quill',
    name: 'Quill',
    icon: '🖋️',
    shortDesc: '+1 ★',
    detailedDescription: 'Guaranteed letter you still need.',
    type: 'generate-exact',
    energyCost: 3,
    cooldown: 3,
    uses: -1,
    tileSockets: [{ type: 'required' }],
    kitId: null,
  },
];

export function getGearById(id) {
  return gearDefinitions.find(g => g.id === id) || null;
}

export function getGearForKit(kitId) {
  return gearDefinitions.filter(g => g.kitId === kitId || g.kitId === null);
}

export function getSharedGear() {
  return gearDefinitions.filter(g => g.kitId === null);
}
