/**
 * Deep Script gear/ability definitions.
 *
 * Each gear has an energy cost, optional tile sockets, cooldown, and effect type.
 *
 * @typedef {Object} GearDef
 * @property {string}   id          — Stable identifier
 * @property {string}   name        — Display name
 * @property {string}   icon        — Emoji icon
 * @property {string}   description — Short one-line effect text (always visible)
 * @property {string}   detailedDescription — Expanded rules (shown on hover/tap)
 * @property {string}   type        — Effect type: 'generate-random' | 'duplicate' | 'reveal' | 'choice' | 'transform' | 'burn' | 'defend' | 'generate-exact'
 * @property {number}   energyCost  — Energy to spend
 * @property {number}   cooldown    — Turns before reuse (0 = no cooldown)
 * @property {number}   uses        — Max uses per combat (-1 = unlimited)
 * @property {Object[]} tileSockets — Array of { type: 'required'|'empower' } sockets
 * @property {string}   [kitId]     — Starter kit this belongs to (null = shared)
 */

export const gearDefinitions = [
  // --- Scribe gear ---
  {
    id: 'scribe-knife',
    name: 'Scribe Knife',
    icon: '🗡️',
    description: 'Create 2 random tiles (weighted)',
    detailedDescription: 'Generate 2 random consonant tiles. 30% chance each is from the target word.',
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
    description: 'Duplicate a socketed tile',
    detailedDescription: 'Place a tile in the socket, then activate to create an exact copy in your tray.',
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
    name: 'Meaning Lantern',
    icon: '🏮',
    description: 'Reveal one answer slot',
    detailedDescription: 'Illuminate a random unrevealed letter position in the inscription. 3 uses per combat.',
    type: 'reveal',
    energyCost: 2,
    cooldown: 0,
    uses: 3,
    tileSockets: [],
    kitId: 'interpreter',
  },
  {
    id: 'choice-sigil',
    name: 'Choice Sigil',
    icon: '⚜️',
    description: 'Pick 1 from 3–4 letters',
    detailedDescription: 'Conjure a bundle of 3 letters (4 with Interpreter bonus). At least 1 is a target letter. Choose one to keep.',
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
    description: 'Reveal one answer slot',
    detailedDescription: 'Focus on the root structure to reveal one unrevealed letter position. 3 uses per combat.',
    type: 'reveal',
    energyCost: 1,
    cooldown: 0,
    uses: 3,
    tileSockets: [],
    kitId: 'rootkeeper',
  },
  {
    id: 'rune-tongs',
    name: 'Rune Tongs',
    icon: '🔧',
    description: 'Transform socketed tile toward target',
    detailedDescription: 'Place a tile in the socket. It transforms into a random target letter (50% exact match, 50% any Hebrew letter).',
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
    name: 'Ash Brazier',
    icon: '🔥',
    description: 'Burn socketed tile → 2 random tiles',
    detailedDescription: 'Sacrifice a tile from the socket. Generate 2 random replacement tiles (40% target bias).',
    type: 'burn',
    energyCost: 1,
    cooldown: 1,
    uses: -1,
    tileSockets: [{ type: 'required' }],
    kitId: null,
  },
  {
    id: 'ward-stone',
    name: 'Ward Stone',
    icon: '🛡️',
    description: 'Block next enemy intent',
    detailedDescription: 'Raise a protective ward. The enemy\'s telegraphed action is negated or halved when your turn ends.',
    type: 'defend',
    energyCost: 1,
    cooldown: 2,
    uses: -1,
    tileSockets: [],
    kitId: null,
  },
  {
    id: 'reveal-scroll',
    name: 'Reveal Scroll',
    icon: '📜',
    description: 'Reveal one slot (single use)',
    detailedDescription: 'Unroll an ancient scroll to reveal one correct answer slot. Consumed after use.',
    type: 'reveal',
    energyCost: 0,
    cooldown: 0,
    uses: 1,
    tileSockets: [],
    kitId: null,
  },
  {
    id: 'inscription-quill',
    name: 'Inscription Quill',
    icon: '🖋️',
    description: 'Create 1 exact needed letter',
    detailedDescription: 'Burn the socketed tile as ink. Precisely inscribe one letter you still need. Premium precision tool.',
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
