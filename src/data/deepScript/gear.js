/**
 * Deep Script gear/ability definitions.
 *
 * Each gear has a cost (letters to invoke), cooldown, and effect type
 * that the combat engine interprets.
 *
 * @typedef {Object} GearDef
 * @property {string}   id          — Stable identifier
 * @property {string}   name        — Display name
 * @property {string}   icon        — Emoji icon
 * @property {string}   description — What it does
 * @property {string}   type        — Effect type for engine: 'generate' | 'duplicate' | 'reveal' | 'choice' | 'transform' | 'utility'
 * @property {number}   invokeCost  — Number of letters to spend from tray/satchel
 * @property {number}   cooldown    — Turns before reuse (0 = no cooldown)
 * @property {number}   uses        — Max uses per combat (-1 = unlimited)
 * @property {string}   [kitId]     — Starter kit this belongs to (null = shared)
 */

export const gearDefinitions = [
  // --- Scribe gear ---
  {
    id: 'scribe-knife',
    name: 'Scribe Knife',
    icon: '🗡️',
    description: 'Generate 1–2 exact Hebrew letters from the target word.',
    type: 'generate',
    invokeCost: 0,
    cooldown: 2,
    uses: -1,
    kitId: 'scribe',
  },
  {
    id: 'echo-mirror',
    name: 'Echo Mirror',
    icon: '🪞',
    description: 'Duplicate a letter in your tray.',
    type: 'duplicate',
    invokeCost: 1,
    cooldown: 3,
    uses: -1,
    kitId: 'scribe',
  },

  // --- Interpreter gear ---
  {
    id: 'meaning-lantern',
    name: 'Meaning Lantern',
    icon: '🏮',
    description: 'Reveal one correct letter position in the answer track.',
    type: 'reveal',
    invokeCost: 0,
    cooldown: 3,
    uses: 3,
    kitId: 'interpreter',
  },
  {
    id: 'choice-sigil',
    name: 'Choice Sigil',
    icon: '⚜️',
    description: 'Generate a 3-letter choice bundle biased toward useful letters.',
    type: 'choice',
    invokeCost: 0,
    cooldown: 2,
    uses: -1,
    kitId: 'interpreter',
  },

  // --- Rootkeeper gear ---
  {
    id: 'root-lens',
    name: 'Root Lens',
    icon: '🔍',
    description: 'Reveal a likely root letter and mark it in the answer.',
    type: 'reveal',
    invokeCost: 0,
    cooldown: 3,
    uses: 3,
    kitId: 'rootkeeper',
  },
  {
    id: 'rune-tongs',
    name: 'Rune Tongs',
    icon: '🔧',
    description: 'Transform a tray letter into a related letter.',
    type: 'transform',
    invokeCost: 1,
    cooldown: 2,
    uses: -1,
    kitId: 'rootkeeper',
  },

  // --- Shared gear ---
  {
    id: 'ash-brazier',
    name: 'Ash Brazier',
    icon: '🔥',
    description: 'Burn 1 letter to draw another random letter.',
    type: 'utility',
    invokeCost: 0, // burn IS the cost
    cooldown: 1,
    uses: -1,
    kitId: null,
  },
  {
    id: 'satchel-hook',
    name: 'Satchel Hook',
    icon: '🪝',
    description: 'Pull 1 stored letter from Satchel into your Tray.',
    type: 'utility',
    invokeCost: 0,
    cooldown: 0,
    uses: -1,
    kitId: null,
  },
  {
    id: 'reveal-scroll',
    name: 'Reveal Scroll',
    icon: '📜',
    description: 'Reveal one correct answer slot. Single use per combat.',
    type: 'reveal',
    invokeCost: 0,
    cooldown: 0,
    uses: 1,
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
