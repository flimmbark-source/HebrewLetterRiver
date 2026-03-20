/**
 * Deep Script floor generator — chamber-based dungeon graph.
 *
 * Generates a connected graph of chambers the player traverses
 * in first-person, replacing the flat choice-node model.
 *
 * Floors are assembled from a randomized "main path" plus optional
 * side branches. The main path always guarantees a multi-room journey
 * from spawn to floor exit (miniboss chamber).
 */

import { getWordsByDifficulty, getMinibossWords } from './words.js';

// ─── Types ──────────────────────────────────────────────────

export const CHAMBER_TYPES = {
  ENTRANCE: 'entrance',
  STANDARD: 'standard',
  COMBAT: 'combat',
  ARCHIVE: 'archive',
  SHRINE: 'shrine',
  EVENT: 'event',
  MINIBOSS: 'miniboss',
};

export const DIRECTIONS = ['north', 'east', 'south', 'west'];

export const OPPOSITE = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

export const TURN_LEFT = {
  north: 'west',
  west: 'south',
  south: 'east',
  east: 'north',
};

export const TURN_RIGHT = {
  north: 'east',
  east: 'south',
  south: 'west',
  west: 'north',
};

// ─── Interactable definitions by chamber type ───────────────

const INTERACTABLE_POOLS = {
  [CHAMBER_TYPES.ENTRANCE]: [
    { type: 'brazier', position: 'left', label: 'Lit Brazier', action: 'flavor', flavorText: 'The brazier casts a warm amber glow across the stone floor. You feel the expedition beginning.' },
    { type: 'note-tablet', position: 'right', label: 'Carved Tablet', action: 'flavor', flavorText: 'Ancient marks etched into the wall. Some resemble Hebrew letters you have studied.' },
  ],
  [CHAMBER_TYPES.STANDARD]: [
    { type: 'brazier', position: 'left', label: 'Brazier', action: 'flavor', flavorText: 'Flickering embers light the chamber walls.' },
    { type: 'cracked-wall', position: 'right', label: 'Cracked Wall', action: 'flavor', flavorText: 'Deep fissures run through the ancient stone. Nothing useful here.' },
    { type: 'note-tablet', position: 'center', label: 'Stone Tablet', action: 'flavor', flavorText: 'A faded inscription, too worn to read completely.' },
    { type: 'statue', position: 'left', label: 'Weathered Statue', action: 'flavor', flavorText: 'A stone figure clutching a scroll. Its face has been worn smooth by time.' },
  ],
  [CHAMBER_TYPES.COMBAT]: [
    { type: 'sigil', position: 'center', label: 'Glowing Sigil', action: 'trigger-combat' },
  ],
  [CHAMBER_TYPES.ARCHIVE]: [
    { type: 'bookshelf', position: 'left', label: 'Ancient Bookshelf', action: 'trigger-archive', archiveReward: 'insight' },
    { type: 'scroll-stand', position: 'center', label: 'Scroll Stand', action: 'trigger-archive', archiveReward: 'clue-hint' },
    { type: 'mural', position: 'right', label: 'Root Mural', action: 'trigger-archive', archiveReward: 'free-letter' },
  ],
  [CHAMBER_TYPES.SHRINE]: [
    { type: 'altar', position: 'center', label: 'Ancient Altar', action: 'trigger-shrine' },
  ],
  [CHAMBER_TYPES.EVENT]: [
    { type: 'chest', position: 'center', label: 'Dusty Chest', action: 'loot' },
    { type: 'statue', position: 'left', label: 'Mysterious Statue', action: 'flavor', flavorText: 'The statue seems to watch you with hollow eyes. A faint warmth emanates from its base.' },
  ],
  [CHAMBER_TYPES.MINIBOSS]: [
    { type: 'sigil', position: 'center', label: 'Guardian Seal', action: 'trigger-combat' },
  ],
};

// Visual themes for each chamber type
export const CHAMBER_THEMES = {
  [CHAMBER_TYPES.ENTRANCE]: 'stone',
  [CHAMBER_TYPES.STANDARD]: 'stone',
  [CHAMBER_TYPES.COMBAT]: 'crypt',
  [CHAMBER_TYPES.ARCHIVE]: 'library',
  [CHAMBER_TYPES.SHRINE]: 'shrine',
  [CHAMBER_TYPES.EVENT]: 'stone',
  [CHAMBER_TYPES.MINIBOSS]: 'crypt',
};

// ─── Chamber factory ────────────────────────────────────────

let chamberIdCounter = 0;

function createChamber(type, payload = {}) {
  const id = `chamber-${++chamberIdCounter}-${type}`;

  // Pick interactables for this chamber type
  const pool = INTERACTABLE_POOLS[type] || [];
  const interactables = pool.map((template, i) => ({
    ...template,
    id: `${id}-obj-${i}`,
    resolved: false,
  }));

  return {
    id,
    type,
    theme: CHAMBER_THEMES[type] || 'stone',
    exits: {}, // { north: chamberId, east: chamberId, ... }
    interactables,
    visited: false,
    resolved: false,
    payload,
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function connect(chambers, fromId, toId, direction) {
  const from = chambers.get(fromId);
  const to = chambers.get(toId);
  if (!from || !to) return false;
  if (from.exits[direction]) return false;

  const opposite = OPPOSITE[direction];
  if (to.exits[opposite]) return false;

  from.exits[direction] = toId;
  to.exits[opposite] = fromId;
  return true;
}

function getOpenDirections(chamber, exclude = null) {
  return DIRECTIONS.filter(dir => !chamber.exits[dir] && dir !== exclude);
}

function connectWithRandomDirection(chambers, fromId, toId, options = {}) {
  const from = chambers.get(fromId);
  const to = chambers.get(toId);
  if (!from || !to) return null;

  const { preferred = null, avoid = null } = options;
  const candidates = getOpenDirections(from, avoid);
  if (candidates.length === 0) return null;

  let order = shuffle(candidates);
  if (preferred && order.includes(preferred)) {
    order = [preferred, ...order.filter(d => d !== preferred)];
  }

  for (const dir of order) {
    if (connect(chambers, fromId, toId, dir)) return dir;
  }
  return null;
}

function buildRandomMainPath(chambers, pathChambers) {
  let previousDirection = null;
  for (let i = 0; i < pathChambers.length - 1; i++) {
    const from = pathChambers[i];
    const to = pathChambers[i + 1];

    // Prefer turning sometimes so the corridor shape varies.
    const preferred = i === 0
      ? DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)]
      : shuffle(DIRECTIONS.filter(d => d !== OPPOSITE[previousDirection]))[0];

    const chosen = connectWithRandomDirection(chambers, from.id, to.id, {
      preferred,
      avoid: previousDirection ? OPPOSITE[previousDirection] : null,
    });

    // Fallback: fully random open direction
    if (!chosen) {
      const fallback = connectWithRandomDirection(chambers, from.id, to.id);
      if (!fallback) {
        throw new Error('Failed to build main path: no available exits.');
      }
      previousDirection = fallback;
    } else {
      previousDirection = chosen;
    }
  }
}

function attachSideChambers(chambers, anchorChambers, sideChambers) {
  for (const side of sideChambers) {
    let placed = false;
    const anchors = shuffle(anchorChambers);

    for (const anchor of anchors) {
      const dir = connectWithRandomDirection(chambers, anchor.id, side.id);
      if (dir) {
        // Occasionally add one extra loop edge from side chamber to another anchor.
        if (Math.random() < 0.25) {
          const loopCandidates = shuffle(anchorChambers.filter(c => c.id !== anchor.id));
          for (const loopTarget of loopCandidates) {
            if (Object.keys(side.exits).length >= DIRECTIONS.length) break;
            const loopDir = connectWithRandomDirection(chambers, side.id, loopTarget.id);
            if (loopDir) break;
          }
        }

        placed = true;
        break;
      }
    }

    if (!placed) {
      // Last-resort connection pass over every chamber.
      const fallbackAnchors = shuffle(Array.from(chambers.values()).filter(c => c.id !== side.id));
      for (const anchor of fallbackAnchors) {
        if (connectWithRandomDirection(chambers, anchor.id, side.id)) {
          placed = true;
          break;
        }
      }
    }

    if (!placed) {
      throw new Error('Failed to attach side chamber: no available exits.');
    }
  }
}

// ─── Floor layout generation ────────────────────────────────

/**
 * Generate a dungeon floor with connected chambers.
 *
 * @param {object} options
 * @param {number} options.combatCount — number of combat chambers (default 3)
 * @param {Object[]} [options.customWords] — optional DS-compatible word pool (for pack-based runs)
 * @param {number} [options.minRoomsBetweenStartAndExit] — minimum chambers between entrance and miniboss
 * @returns {DungeonFloor}
 */
export function generateDungeonFloor({
  combatCount = 3,
  customWords = null,
  minRoomsBetweenStartAndExit = 4,
} = {}) {
  chamberIdCounter = 0;
  const usedWordIds = new Set();

  function pickWord(depth) {
    if (customWords && customWords.length > 0) {
      const candidates = customWords.filter(w => !usedWordIds.has(w.id));
      if (candidates.length === 0) {
        return customWords[Math.floor(Math.random() * customWords.length)];
      }
      const word = candidates[Math.floor(Math.random() * candidates.length)];
      usedWordIds.add(word.id);
      return word;
    }

    let minDiff;
    let maxDiff;
    if (depth <= 1) {
      minDiff = 1;
      maxDiff = 2;
    } else if (depth <= 2) {
      minDiff = 2;
      maxDiff = 3;
    } else {
      minDiff = 3;
      maxDiff = 4;
    }

    const candidates = getWordsByDifficulty(minDiff, maxDiff).filter(w => !usedWordIds.has(w.id));
    if (candidates.length === 0) {
      const fallback = getWordsByDifficulty(minDiff, maxDiff);
      return fallback[Math.floor(Math.random() * fallback.length)];
    }
    const word = candidates[Math.floor(Math.random() * candidates.length)];
    usedWordIds.add(word.id);
    return word;
  }

  // Create all chambers
  const entrance = createChamber(CHAMBER_TYPES.ENTRANCE);
  entrance.visited = true;

  const combatChambers = [];
  for (let i = 0; i < combatCount; i++) {
    const word = pickWord(i);
    combatChambers.push(createChamber(CHAMBER_TYPES.COMBAT, { wordId: word?.id }));
  }

  const archive = createChamber(CHAMBER_TYPES.ARCHIVE, { rewardId: 'clue-hint' });
  const shrine = createChamber(CHAMBER_TYPES.SHRINE);
  const event = createChamber(CHAMBER_TYPES.EVENT, { eventId: 'chest' });

  let bossWord;
  if (customWords && customWords.length > 0) {
    const unusedCustom = customWords
      .filter(w => !usedWordIds.has(w.id))
      .sort((a, b) => b.letters.length - a.letters.length);
    bossWord = unusedCustom[0] || [...customWords].sort((a, b) => b.letters.length - a.letters.length)[0];
    if (bossWord) usedWordIds.add(bossWord.id);
  } else {
    const minibossWords = getMinibossWords();
    bossWord = minibossWords[Math.floor(Math.random() * minibossWords.length)];
  }

  const miniboss = createChamber(CHAMBER_TYPES.MINIBOSS, { wordId: bossWord?.id });

  const chambers = new Map();
  const allChambers = [entrance, ...combatChambers, archive, shrine, event, miniboss];
  for (const chamber of allChambers) {
    chambers.set(chamber.id, chamber);
  }

  // Build a randomized main path from entrance to miniboss.
  const middleCandidates = shuffle([...combatChambers, archive, shrine, event]);
  const desiredMinBetween = Math.max(3, minRoomsBetweenStartAndExit);
  const maxBetween = Math.min(middleCandidates.length, desiredMinBetween + 2);
  const betweenCount = Math.min(
    middleCandidates.length,
    desiredMinBetween + Math.floor(Math.random() * Math.max(1, maxBetween - desiredMinBetween + 1)),
  );

  const mainPathMiddle = middleCandidates.slice(0, betweenCount);
  const sideChambers = middleCandidates.slice(betweenCount);

  const mainPath = [entrance, ...mainPathMiddle, miniboss];
  buildRandomMainPath(chambers, mainPath);

  // Attach any unused chambers as branches/loops off the main path.
  attachSideChambers(chambers, mainPathMiddle.length > 0 ? mainPathMiddle : [entrance], sideChambers);

  return {
    id: `floor-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    chambers,
    startChamberId: entrance.id,
    bossChamberId: miniboss.id,
    chamberCount: chambers.size,
  };
}

// ─── Helpers ────────────────────────────────────────────────

export function getChamberDisplayName(type) {
  switch (type) {
    case CHAMBER_TYPES.ENTRANCE: return 'Entrance Hall';
    case CHAMBER_TYPES.STANDARD: return 'Stone Chamber';
    case CHAMBER_TYPES.COMBAT: return 'Dark Chamber';
    case CHAMBER_TYPES.ARCHIVE: return 'Archive Chamber';
    case CHAMBER_TYPES.SHRINE: return 'Shrine Chamber';
    case CHAMBER_TYPES.EVENT: return 'Quiet Chamber';
    case CHAMBER_TYPES.MINIBOSS: return 'Guardian\'s Chamber';
    default: return 'Chamber';
  }
}

export function getChamberIcon(type) {
  switch (type) {
    case CHAMBER_TYPES.ENTRANCE: return '🚪';
    case CHAMBER_TYPES.STANDARD: return '🪨';
    case CHAMBER_TYPES.COMBAT: return '⚔️';
    case CHAMBER_TYPES.ARCHIVE: return '📚';
    case CHAMBER_TYPES.SHRINE: return '🏛️';
    case CHAMBER_TYPES.EVENT: return '✨';
    case CHAMBER_TYPES.MINIBOSS: return '👁️';
    default: return '❓';
  }
}
