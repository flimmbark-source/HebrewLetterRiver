/**
 * Deep Script gear/ability definitions.
 *
 * Each gear has an energy cost, optional tile sockets, cooldown, and effect type.
 *
 * Descriptions use a modular keyword system for compact display:
 *   - `shortDesc`: icon+keyword tokens that fit on ability cards (e.g. "🎲×2 tiles")
 *   - `detailedDescription`: full rules shown on long-press / hover tooltip
 *
 * Keyword glossary (learned once, reused everywhere):
 *   🎲 = random weighted    🎯 = exact / targeted
 *   📋 = copy / duplicate   👁 = reveal slot
 *   🔄 = transform          💀 = sacrifice / burn
 *   🛡 = block / ward       📦 = pick / choose
 *
 * @typedef {Object} GearDef
 * @property {string}   id
 * @property {string}   name
 * @property {string}   icon          — Gear identity emoji
 * @property {string}   shortDesc     — Compact icon+keyword effect (fits ~12 chars)
 * @property {string}   detailedDescription — Full rules (tooltip)
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
    shortDesc: '🎲×2 tiles',
    detailedDescription: 'Generate 2 random tiles. 30% chance each is from the target word.',
    type: 'generate-random',
    energyCost: 1,
    cooldown: 0,
    uses: -1,
    tileSockets: [],
    kitId: 'scribe',
  },
  {
    id: 'echo-mirror',
    name: 'Echo Mirror',
    icon: '🪞',
    shortDesc: '📋 socketed',
    detailedDescription: 'Socket a tile, then activate to create an exact copy in your tray.',
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
    shortDesc: '👁 slot',
    detailedDescription: 'Reveal a random unrevealed letter position. 3 uses per combat.',
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
    shortDesc: '📦 1 of 3',
    detailedDescription: 'Conjure 3 letters (4 with bonus). At least 1 is from the target. Pick one.',
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
    shortDesc: '👁 slot',
    detailedDescription: 'Reveal one unrevealed letter position. 3 uses per combat.',
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
    shortDesc: '🔄 → 🎯50%',
    detailedDescription: 'Socket a tile. It transforms into a target letter (50%) or random Hebrew letter (50%).',
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
    shortDesc: '💀 → 🎲×2',
    detailedDescription: 'Sacrifice socketed tile. Generate 2 random tiles (40% target bias).',
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
    shortDesc: '🛡 block',
    detailedDescription: 'Block the enemy\'s next telegraphed action when your turn ends.',
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
    shortDesc: '👁 slot',
    detailedDescription: 'Reveal one correct answer slot. Single use per combat.',
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
    shortDesc: '💀 → 🎯×1',
    detailedDescription: 'Sacrifice socketed tile. Create 1 exact letter you still need.',
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
