/**
 * Deep Script floor generator — chamber-based dungeon graph.
 *
 * Generates a small connected graph of chambers the player traverses
 * in first-person, replacing the flat choice-node model.
 *
 * A floor has 7-9 chambers arranged in a grid-like graph with
 * N/E/S/W exits connecting them.
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
    payload, // { wordId, rewardId, eventId }
  };
}

// ─── Connect two chambers ───────────────────────────────────

function connect(chambers, fromId, toId, direction) {
  const from = chambers.get(fromId);
  const to = chambers.get(toId);
  if (!from || !to) return;

  from.exits[direction] = toId;
  to.exits[OPPOSITE[direction]] = fromId;
}

// ─── Floor layout generation ────────────────────────────────

/**
 * Generate a dungeon floor with connected chambers.
 *
 * Layout strategy: place chambers on a small grid, then connect adjacent ones.
 * This creates a small explorable space with multiple paths.
 *
 * @param {object} options
 * @param {number} options.combatCount — number of combat chambers (default 3)
 * @returns {DungeonFloor}
 */
export function generateDungeonFloor({ combatCount = 3 } = {}) {
  chamberIdCounter = 0;
  const usedWordIds = new Set();

  // Define the floor layout on a 3x3 grid
  // We'll place chambers at specific grid positions and connect them
  //
  // Grid positions (row, col):
  //   (0,1) = top center
  //   (1,0) = mid left    (1,1) = mid center    (1,2) = mid right
  //   (2,0) = bot left    (2,1) = bot center     (2,2) = bot right
  //
  // Entrance is always at (2,1) — bottom center
  // Miniboss is always at (0,1) — top center
  //
  // The player must navigate upward through the dungeon.

  // Pick words for combat chambers
  function pickWord(depth) {
    let minDiff, maxDiff;
    if (depth <= 1) { minDiff = 1; maxDiff = 2; }
    else if (depth <= 2) { minDiff = 2; maxDiff = 3; }
    else { minDiff = 3; maxDiff = 4; }

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
  entrance.visited = true; // player starts here

  // Combat chambers
  const combatChambers = [];
  for (let i = 0; i < combatCount; i++) {
    const word = pickWord(i);
    combatChambers.push(createChamber(CHAMBER_TYPES.COMBAT, { wordId: word?.id }));
  }

  // Special chambers
  const archive = createChamber(CHAMBER_TYPES.ARCHIVE, { rewardId: 'clue-hint' });
  const shrine = createChamber(CHAMBER_TYPES.SHRINE);
  const event = createChamber(CHAMBER_TYPES.EVENT, { eventId: 'chest' });

  // Miniboss
  const minibossWords = getMinibossWords();
  const bossWord = minibossWords[Math.floor(Math.random() * minibossWords.length)];
  const miniboss = createChamber(CHAMBER_TYPES.MINIBOSS, { wordId: bossWord?.id });

  // Build chambers map
  const chambers = new Map();
  const allChambers = [entrance, ...combatChambers, archive, shrine, event, miniboss];
  for (const c of allChambers) {
    chambers.set(c.id, c);
  }

  // Assign grid positions and connect
  // Layout (randomized within constraints):
  //
  //        [miniboss]
  //     [c2] [shrine] [archive]
  //     [c0] [event]  [c1]
  //          [entrance]
  //
  // This gives a clear upward progression with branching

  // Shuffle combat chambers for variety
  const shuffled = [...combatChambers].sort(() => Math.random() - 0.5);

  // Grid assignment
  const grid = {
    '2,1': entrance,
    '1,0': shuffled[0],
    '1,1': event,
    '1,2': shuffled[1] || archive,
    '0,0': shuffled[2] || shrine,
    '0,1': shrine.id === (shuffled[2] || shrine).id ? miniboss : shrine,
    '0,2': archive.id === (shuffled[1] || archive).id ? event : archive,
  };

  // Simpler approach: deterministic layout with some shuffle
  // Row 2 (bottom): entrance
  // Row 1 (middle): combat0, event/standard, combat1
  // Row 0 (top): combat2/archive, shrine, archive/miniboss

  // Let's do a cleaner approach: place and connect explicitly
  const layout = [];

  // Bottom row
  layout.push({ chamber: entrance, row: 2, col: 1 });

  // Middle row
  layout.push({ chamber: shuffled[0], row: 1, col: 0 });
  layout.push({ chamber: event, row: 1, col: 1 });
  layout.push({ chamber: shuffled[1], row: 1, col: 2 });

  // Top row
  layout.push({ chamber: archive, row: 0, col: 0 });
  layout.push({ chamber: miniboss, row: 0, col: 1 });
  layout.push({ chamber: shrine, row: 0, col: 2 });

  // If we have a 3rd combat chamber, replace the event
  if (shuffled[2]) {
    // Add it somewhere — replace event position or add a connector
    // For simplicity, make the event a sub-chamber connected to combat0
    layout.push({ chamber: shuffled[2], row: 2, col: 0 });
  }

  // Build position lookup
  const posMap = new Map();
  for (const entry of layout) {
    posMap.set(`${entry.row},${entry.col}`, entry.chamber);
  }

  // Connect adjacent chambers (N/S for rows, E/W for columns)
  for (const entry of layout) {
    const { chamber, row, col } = entry;

    // North connection (row - 1, same col)
    const north = posMap.get(`${row - 1},${col}`);
    if (north && !chamber.exits.north) {
      connect(chambers, chamber.id, north.id, 'north');
    }

    // East connection (same row, col + 1)
    const east = posMap.get(`${row},${col + 1}`);
    if (east && !chamber.exits.east) {
      connect(chambers, chamber.id, east.id, 'east');
    }
  }

  // Ensure miniboss is reachable — add a direct connection from event to miniboss
  // if not already connected
  if (!event.exits.north) {
    connect(chambers, event.id, miniboss.id, 'north');
  }

  return {
    id: `floor-${Date.now()}`,
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
