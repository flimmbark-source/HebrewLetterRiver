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
    position: null, // { x, y } assigned during floor-plan construction
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

function coordKey(x, y) {
  return `${x},${y}`;
}

function stepFrom(position, direction) {
  if (!position) return null;
  switch (direction) {
    case 'north': return { x: position.x, y: position.y - 1 };
    case 'south': return { x: position.x, y: position.y + 1 };
    case 'east': return { x: position.x + 1, y: position.y };
    case 'west': return { x: position.x - 1, y: position.y };
    default: return null;
  }
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

  const {
    preferred = null,
    avoid = null,
    positions = null,
    occupied = null,
  } = options;

  if (positions && !positions.has(fromId)) return null;
  const candidates = getOpenDirections(from, avoid);
  if (candidates.length === 0) return null;

  let order = shuffle(candidates);
  if (preferred && order.includes(preferred)) {
    order = [preferred, ...order.filter(d => d !== preferred)];
  }

  for (const dir of order) {
    if (positions) {
      const fromPos = positions.get(fromId);
      const targetPos = stepFrom(fromPos, dir);
      if (!targetPos) continue;
      const targetKey = coordKey(targetPos.x, targetPos.y);
      const existingToPos = positions.get(toId);

      if (existingToPos) {
        if (existingToPos.x !== targetPos.x || existingToPos.y !== targetPos.y) {
          continue;
        }
      } else if (occupied?.has(targetKey)) {
        continue;
      }

      if (connect(chambers, fromId, toId, dir)) {
        if (!existingToPos) {
          positions.set(toId, targetPos);
          occupied?.set(targetKey, toId);
          to.position = targetPos;
        }
        return dir;
      }
      continue;
    }

    if (connect(chambers, fromId, toId, dir)) return dir;
  }
  return null;
}

function buildRandomMainPath(chambers, pathChambers, positions, occupied) {
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
      positions,
      occupied,
    });

    // Fallback: fully random open direction
    if (!chosen) {
      const fallback = connectWithRandomDirection(chambers, from.id, to.id, { positions, occupied });
      if (!fallback) {
        throw new Error('Failed to build main path: no available exits.');
      }
      previousDirection = fallback;
    } else {
      previousDirection = chosen;
    }
  }
}

function attachSideChambers(chambers, anchorChambers, sideChambers, positions, occupied) {
  for (const side of sideChambers) {
    let placed = false;
    const anchors = shuffle(anchorChambers);

    for (const anchor of anchors) {
      const dir = connectWithRandomDirection(chambers, anchor.id, side.id, { positions, occupied });
      if (dir) {
        // Occasionally add one extra loop edge from side chamber to another anchor.
        if (Math.random() < 0.25) {
          const loopCandidates = shuffle(anchorChambers.filter(c => c.id !== anchor.id));
          for (const loopTarget of loopCandidates) {
            if (Object.keys(side.exits).length >= DIRECTIONS.length) break;
            const loopDir = connectWithRandomDirection(chambers, side.id, loopTarget.id, { positions, occupied });
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
        if (connectWithRandomDirection(chambers, anchor.id, side.id, { positions, occupied })) {
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

function getChamberDegree(chamber) {
  return Object.keys(chamber.exits).length;
}

function hasPathBetween(chambers, startId, targetId) {
  if (startId === targetId) return true;
  const queue = [startId];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const chamberId = queue.shift();
    const chamber = chambers.get(chamberId);
    if (!chamber) continue;

    for (const nextId of Object.values(chamber.exits)) {
      if (nextId === targetId) return true;
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push(nextId);
      }
    }
  }

  return false;
}

function shortestPathLength(chambers, startId, targetId) {
  if (startId === targetId) return 0;
  const queue = [{ id: startId, dist: 0 }];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const current = queue.shift();
    const chamber = chambers.get(current.id);
    if (!chamber) continue;

    for (const nextId of Object.values(chamber.exits)) {
      if (nextId === targetId) return current.dist + 1;
      if (!visited.has(nextId)) {
        visited.add(nextId);
        queue.push({ id: nextId, dist: current.dist + 1 });
      }
    }
  }

  return -1;
}

function reinforceNoDeadEnds(chambers, protectedIds = new Set(), routeConstraint = null) {
  // Repeatedly patch cul-de-sacs by adding an extra connection where possible.
  for (let pass = 0; pass < 5; pass++) {
    let changed = false;

    const leaves = Array.from(chambers.values()).filter(chamber => {
      if (protectedIds.has(chamber.id)) return false;
      return getChamberDegree(chamber) <= 1;
    });

    if (leaves.length === 0) break;

    for (const leaf of shuffle(leaves)) {
      if (getChamberDegree(leaf) > 1) continue;

      const existingNeighbors = new Set(Object.values(leaf.exits));
      const candidates = shuffle(Array.from(chambers.values()).filter(candidate => {
        if (candidate.id === leaf.id) return false;
        if (existingNeighbors.has(candidate.id)) return false;
        if (getOpenDirections(candidate).length === 0) return false;
        return true;
      }));

      for (const candidate of candidates) {
        const connectedDir = connectWithRandomDirection(chambers, leaf.id, candidate.id);
        if (!connectedDir) continue;

        const routeStillValid = !routeConstraint
          || shortestPathLength(chambers, routeConstraint.startId, routeConstraint.targetId) >= routeConstraint.minLength;

        if (routeStillValid) {
          changed = true;
          break;
        }

        // Undo connection if it accidentally shortcuts the guaranteed route.
        const oppositeDir = OPPOSITE[connectedDir];
        delete leaf.exits[connectedDir];
        delete candidate.exits[oppositeDir];
      }
    }

    if (!changed) break;
  }
}

function ensureNoIsolatedChambers(chambers, preferredAnchorId = null) {
  const isolated = Array.from(chambers.values()).filter(chamber => getChamberDegree(chamber) === 0);
  if (isolated.length === 0) return;

  for (const chamber of isolated) {
    const candidates = shuffle(Array.from(chambers.values()).filter(candidate => {
      if (candidate.id === chamber.id) return false;
      if (getOpenDirections(candidate).length === 0) return false;
      return true;
    }));

    if (preferredAnchorId) {
      const preferred = candidates.find(c => c.id === preferredAnchorId);
      if (preferred) {
        const dir = connectWithRandomDirection(chambers, chamber.id, preferred.id);
        if (dir) continue;
      }
    }

    for (const candidate of candidates) {
      const dir = connectWithRandomDirection(chambers, chamber.id, candidate.id);
      if (dir) break;
    }
  }
}

function assertFloorSafety(chambers, entranceId, minibossId, minRouteLength) {
  const entranceToBoss = shortestPathLength(chambers, entranceId, minibossId);
  if (entranceToBoss < minRouteLength) {
    throw new Error('Invalid floor: entrance-to-exit route is shorter than required.');
  }

  for (const chamber of chambers.values()) {
    if (!hasPathBetween(chambers, chamber.id, minibossId)) {
      throw new Error('Invalid floor: chamber cannot reach miniboss exit.');
    }
  }

  for (const chamber of chambers.values()) {
    if (chamber.id === entranceId || chamber.id === minibossId) continue;
    if (getChamberDegree(chamber) <= 1) {
      throw new Error('Invalid floor: non-endpoint chamber is a dead end.');
    }
  }
}

function buildFloorPlan(chambers, positions, startId, bossId) {
  const planRooms = [];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const chamber of chambers.values()) {
    const pos = positions.get(chamber.id);
    if (!pos) continue;
    minX = Math.min(minX, pos.x);
    maxX = Math.max(maxX, pos.x);
    minY = Math.min(minY, pos.y);
    maxY = Math.max(maxY, pos.y);
    chamber.position = { ...pos };
    planRooms.push({
      id: chamber.id,
      type: chamber.type,
      x: pos.x,
      y: pos.y,
      exits: { ...chamber.exits },
      isStart: chamber.id === startId,
      isBoss: chamber.id === bossId,
    });
  }

  return {
    rooms: planRooms,
    bounds: { minX, maxX, minY, maxY },
  };
}

// ─── Floor layout generation ────────────────────────────────

const FLOOR_PLAN_TEMPLATES = {
  8: {
    start: 0,
    boss: 5,
    nodes: [
      { x: 0, y: 0 }, // 0 start
      { x: 1, y: 0 }, // 1
      { x: 2, y: 0 }, // 2
      { x: 2, y: 1 }, // 3
      { x: 3, y: 1 }, // 4
      { x: 4, y: 1 }, // 5 boss
      { x: 1, y: 1 }, // 6
      { x: 3, y: 0 }, // 7
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], // main route
      [1, 6], [6, 3], [2, 7], [7, 4], // side loops
    ],
  },
  9: {
    start: 0,
    boss: 5,
    nodes: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 0 }, { x: 4, y: 0 },
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
      [1, 6], [6, 3], [2, 7], [7, 4], [7, 8], [8, 5],
    ],
  },
  10: {
    start: 0,
    boss: 5,
    nodes: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 1 },
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
      [1, 6], [6, 3], [2, 7], [7, 4], [7, 8], [8, 5],
      [0, 9], [9, 6],
    ],
  },
  11: {
    start: 0,
    boss: 5,
    nodes: [
      { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 1 }, { x: 3, y: -1 },
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
      [1, 6], [6, 3], [2, 7], [7, 4], [7, 8], [8, 5],
      [0, 9], [9, 6], [2, 10], [10, 7],
    ],
  },
};

function directionBetween(fromPos, toPos) {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  if (dx === 1 && dy === 0) return 'east';
  if (dx === -1 && dy === 0) return 'west';
  if (dx === 0 && dy === 1) return 'south';
  if (dx === 0 && dy === -1) return 'north';
  return null;
}

function buildTemplateLayout(chambers, entrance, miniboss) {
  const template = FLOOR_PLAN_TEMPLATES[chambers.size];
  if (!template) {
    throw new Error(`No floor plan template defined for ${chambers.size} chambers.`);
  }
  const rotations = [0, 90, 180, 270];
  const transforms = [];
  for (const rotation of rotations) {
    for (const mirrorX of [false, true]) {
      const transformedNodes = template.nodes.map(node => {
        let { x, y } = node;
        if (mirrorX) x = -x;
        switch (rotation) {
          case 90:
            return { x: -y, y: x };
          case 180:
            return { x: -x, y: -y };
          case 270:
            return { x: y, y: -x };
          default:
            return { x, y };
        }
      });

      let score = 0;

      // Strongly avoid forcing initial progression through the back exit.
      const startDirections = template.edges
        .filter(([from]) => from === template.start)
        .map(([from, to]) => directionBetween(transformedNodes[from], transformedNodes[to]));
      if (startDirections.length > 0 && startDirections.every(dir => dir === 'south')) {
        score += 100;
      }

      // Prefer forward/side progression on the authored main route.
      const MAIN_ROUTE_EDGE_COUNT = 5;
      for (let i = 0; i < Math.min(MAIN_ROUTE_EDGE_COUNT, template.edges.length); i++) {
        const [from, to] = template.edges[i];
        const dir = directionBetween(transformedNodes[from], transformedNodes[to]);
        if (dir === 'south') score += 10;
      }

      transforms.push({ transformedNodes, score });
    }
  }

  const minScore = Math.min(...transforms.map(t => t.score));
  const bestTransforms = transforms.filter(t => t.score === minScore);
  const transformedNodes = bestTransforms[Math.floor(Math.random() * bestTransforms.length)].transformedNodes;

  const middle = shuffle(Array.from(chambers.values()).filter(ch => ch.id !== entrance.id && ch.id !== miniboss.id));
  const chamberByNode = new Map();
  chamberByNode.set(template.start, entrance);
  chamberByNode.set(template.boss, miniboss);

  const assignableNodeIndices = template.nodes
    .map((_, idx) => idx)
    .filter(idx => idx !== template.start && idx !== template.boss);

  assignableNodeIndices.forEach((nodeIdx, i) => {
    chamberByNode.set(nodeIdx, middle[i]);
  });

  const positions = new Map();
  for (const [nodeIdx, chamber] of chamberByNode.entries()) {
    const pos = transformedNodes[nodeIdx];
    chamber.position = { ...pos };
    positions.set(chamber.id, { ...pos });
  }

  for (const [fromIdx, toIdx] of template.edges) {
    const fromChamber = chamberByNode.get(fromIdx);
    const toChamber = chamberByNode.get(toIdx);
    const fromPos = transformedNodes[fromIdx];
    const toPos = transformedNodes[toIdx];
    const dir = directionBetween(fromPos, toPos);
    if (!dir) {
      throw new Error('Invalid floor plan template edge: nodes are not cardinally adjacent.');
    }
    const didConnect = connect(chambers, fromChamber.id, toChamber.id, dir);
    if (!didConnect) {
      throw new Error('Failed to connect chambers from floor plan template.');
    }
  }

  return positions;
}

/**
 * Generate a dungeon floor with connected chambers.
 *
 * @param {object} options
 * @param {number} options.combatCount — number of combat chambers (default 3)
 * @param {Object[]} [options.customWords] — optional DS-compatible word pool (for pack-based runs)
 * @param {Set<string>|string[]} [options.excludeWordIds] — optional word IDs to avoid on this floor when possible
 * @param {number} [options.minRoomsBetweenStartAndExit] — minimum chambers between entrance and miniboss
 * @returns {DungeonFloor}
 */
export function generateDungeonFloor({
  combatCount = 3,
  customWords = null,
  excludeWordIds = null,
  minRoomsBetweenStartAndExit = 4,
} = {}) {
  const excludedIds = excludeWordIds instanceof Set ? excludeWordIds : new Set(excludeWordIds || []);
  const minRouteLength = Math.max(1, minRoomsBetweenStartAndExit + 1);
  let lastError = null;

  for (let attempt = 0; attempt < 20; attempt++) {
    chamberIdCounter = 0;
    const usedWordIds = new Set();

    function pickWord(depth) {
      if (customWords && customWords.length > 0) {
        const preferredCandidates = customWords.filter(w => !usedWordIds.has(w.id) && !excludedIds.has(w.id));
        if (preferredCandidates.length > 0) {
          const word = preferredCandidates[Math.floor(Math.random() * preferredCandidates.length)];
          usedWordIds.add(word.id);
          return word;
        }

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

    try {
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

        const preferredBoss = unusedCustom.filter(w => !excludedIds.has(w.id));
        bossWord = preferredBoss[0]
          || unusedCustom[0]
          || [...customWords].sort((a, b) => b.letters.length - a.letters.length)[0];
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
      // Use shared authored floor-plan templates for both endless and pack runs.
      const positions = buildTemplateLayout(chambers, entrance, miniboss);

      // Safety assertion: every chamber must reach exit and non-endpoints must not be dead ends.
      assertFloorSafety(chambers, entrance.id, miniboss.id, minRouteLength);
      const floorPlan = buildFloorPlan(chambers, positions, entrance.id, miniboss.id);

      return {
        id: `floor-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        chambers,
        floorPlan,
        startChamberId: entrance.id,
        bossChamberId: miniboss.id,
        chamberCount: chambers.size,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(lastError?.message || 'Failed to generate a safe dungeon floor.');
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
