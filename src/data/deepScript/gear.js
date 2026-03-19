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
    detailedDescription: 'Generate 2 tiles. Each tile has a 30% chance to come from the target word.',
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
    detailedDescription: 'Create 2 copies of the socketed tile and return the original tile to your tray.',
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
    shortDesc: 'Cursed→+2 ▨',
    detailedDescription: 'Consume 1 cursed tray tile if present. Generate 2 tiles if consumed, otherwise generate 1 (40% target chance).',
    type: 'salvage',
    energyCost: 1,
    cooldown: 0,
    uses: -1,
    tileSockets: [],
    kitId: 'interpreter',
  },
  {
    id: 'choice-sigil',
    name: 'Sigil',
    icon: '⚜️',
    shortDesc: 'Choose 1 of 3',
    detailedDescription: 'Create 3 letter options and add your chosen letter to the tray (at least one option is a target letter).',
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
    shortDesc: '+1 now, +1 next',
    detailedDescription: 'Generate 1 tile now (30% target chance) and plant a seed that blooms into 1 tile at next turn start (60% target chance).',
    type: 'germinate',
    energyCost: 1,
    cooldown: 0,
    uses: -1,
    tileSockets: [],
    kitId: 'rootkeeper',
  },
  {
    id: 'rune-tongs',
    name: 'Tongs',
    icon: '🔧',
    shortDesc: '50% ★ / 50% ▨',
    detailedDescription: 'Transform the socketed tile into either an exact needed letter (50%) or a random letter (50%).',
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
    detailedDescription: 'Consume the socketed tile and generate 2 new tiles (40% target chance each). Energy cost increases by 1 per use this turn.',
    type: 'burn',
    energyCost: 1,
    cooldown: 0,
    uses: -1,
    escalatingCost: true,
    tileSockets: [{ type: 'required' }],
    kitId: null,
  },
  {
    id: 'ward-stone',
    name: 'Ward',
    icon: '🛡️',
    shortDesc: 'Block next intent',
    detailedDescription: 'Raise a ward that negates the next enemy intent.',
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
    shortDesc: 'Reveal 1 slot',
    detailedDescription: 'Reveal one unrevealed answer slot. Single use per combat.',
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
    detailedDescription: 'Generate one exact letter that is still needed in the answer.',
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
