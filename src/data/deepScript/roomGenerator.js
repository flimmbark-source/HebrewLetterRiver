/**
 * Deep Script room/run generation.
 *
 * Generates a sequence of room choices for a run.
 * Each node offers 2-3 rooms to pick from.
 */

import { getWordsByDifficulty, getMinibossWords } from './words.js';

/** Room type constants */
export const ROOM_TYPES = {
  COMBAT: 'combat',
  ARCHIVE: 'archive',
  SHRINE: 'shrine',
  MINIBOSS: 'miniboss',
};

/**
 * Archive room reward types.
 */
export const ARCHIVE_REWARDS = [
  { id: 'free-letter', name: 'Letter Fragment', icon: '✉️', description: 'Gain a useful letter in your satchel.' },
  { id: 'heal', name: 'Rest & Recover', icon: '💚', description: 'Restore 1 health.' },
  { id: 'clue-hint', name: 'Ancient Scroll', icon: '📜', description: 'Next combat starts with a revealed letter.' },
  { id: 'insight', name: 'Dusty Tome', icon: '📖', description: 'Gain insight into a word family.' },
];

/**
 * Create a room node.
 */
function createRoom(type, depth, extra = {}) {
  return {
    id: `room-${depth}-${type}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    depth,
    ...extra,
  };
}

/**
 * Pick a random word appropriate for the given depth.
 * Depth 0-2 = difficulty 1-2, depth 3-4 = difficulty 2-3, depth 5+ = difficulty 3-4
 */
function pickWordForDepth(depth, usedWordIds) {
  let minDiff, maxDiff;
  if (depth <= 2) { minDiff = 1; maxDiff = 2; }
  else if (depth <= 4) { minDiff = 2; maxDiff = 3; }
  else { minDiff = 3; maxDiff = 4; }

  const candidates = getWordsByDifficulty(minDiff, maxDiff).filter(w => !usedWordIds.has(w.id));
  if (candidates.length === 0) {
    // Fallback: allow repeats
    return getWordsByDifficulty(minDiff, maxDiff)[Math.floor(Math.random() * getWordsByDifficulty(minDiff, maxDiff).length)];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Generate a full run map.
 * Returns an array of "choice nodes" — each node has 2-3 room options.
 * The final node is always the miniboss.
 *
 * @param {number} roomCount — Number of rooms before the miniboss (default 6)
 * @returns {Array<{ depth: number, choices: Array }>}
 */
export function generateRunMap(roomCount = 6) {
  const nodes = [];
  const usedWordIds = new Set();

  for (let depth = 0; depth < roomCount; depth++) {
    const choices = [];
    const numChoices = depth === 0 ? 2 : (Math.random() < 0.4 ? 3 : 2);

    // Ensure variety: at least one combat room per node
    const types = ['combat'];

    // Add archive/shrine based on depth
    if (depth >= 1 && depth % 2 === 1) {
      types.push('archive');
    } else if (depth >= 2 && depth % 3 === 0) {
      types.push('shrine');
    }

    // Fill remaining slots with combat
    while (types.length < numChoices) {
      if (depth >= 2 && Math.random() < 0.3 && !types.includes('shrine')) {
        types.push('shrine');
      } else if (Math.random() < 0.4 && !types.includes('archive')) {
        types.push('archive');
      } else {
        types.push('combat');
      }
    }

    // Shuffle
    types.sort(() => Math.random() - 0.5);

    for (const type of types) {
      if (type === 'combat') {
        const word = pickWordForDepth(depth, usedWordIds);
        if (word) usedWordIds.add(word.id);
        choices.push(createRoom(ROOM_TYPES.COMBAT, depth, { wordId: word?.id }));
      } else if (type === 'archive') {
        const reward = ARCHIVE_REWARDS[Math.floor(Math.random() * ARCHIVE_REWARDS.length)];
        choices.push(createRoom(ROOM_TYPES.ARCHIVE, depth, { rewardId: reward.id }));
      } else if (type === 'shrine') {
        choices.push(createRoom(ROOM_TYPES.SHRINE, depth));
      }
    }

    nodes.push({ depth, choices });
  }

  // Final node: miniboss
  const minibossWord = getMinibossWords()[0];
  nodes.push({
    depth: roomCount,
    choices: [createRoom(ROOM_TYPES.MINIBOSS, roomCount, { wordId: minibossWord?.id })],
  });

  return nodes;
}

/**
 * Get display info for a room type.
 */
export function getRoomDisplayInfo(type) {
  switch (type) {
    case ROOM_TYPES.COMBAT:
      return { name: 'Combat', icon: '⚔️', color: '#dc2626', description: 'Face a word enemy.' };
    case ROOM_TYPES.ARCHIVE:
      return { name: 'Archive', icon: '📚', color: '#2563eb', description: 'Study and gain rewards.' };
    case ROOM_TYPES.SHRINE:
      return { name: 'Shrine', icon: '🏛️', color: '#7c3aed', description: 'Choose a permanent upgrade.' };
    case ROOM_TYPES.MINIBOSS:
      return { name: 'Guardian', icon: '👁️', color: '#b91c1c', description: 'Face the floor guardian.' };
    default:
      return { name: 'Unknown', icon: '❓', color: '#6b7280', description: '' };
  }
}
