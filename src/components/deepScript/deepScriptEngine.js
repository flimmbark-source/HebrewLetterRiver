/**
 * Deep Script combat engine — pure state management via reducer.
 *
 * Turn flow:
 *   START_TURN  → gain energy, clear slot locks
 *   Player acts → spend energy, manage tiles, place letters
 *   END_TURN    → enemy executes telegraphed intent, roll new intent,
 *                  tick cooldowns, increment turn, check defeat
 *
 * All game logic is handled through dispatched actions.
 * The engine is framework-agnostic; React integration is via useReducer.
 */

import { getWordById, allDeepScriptLetters } from '../../data/deepScript/words.js';
import { getGearById } from '../../data/deepScript/gear.js';

// ─── Constants ──────────────────────────────────────────────

export const MAX_PRESSURE_DEFAULT = 2;
export const TRAY_SIZE_DEFAULT = 6;
export const SATCHEL_SIZE_DEFAULT = 3;
export const MAX_ENERGY_DEFAULT = 3;

// ─── Enemy Intent Types ─────────────────────────────────────

export const INTENT_TYPES = {
  IDLE: 'idle',
  PRESSURE: 'pressure',
  BURN_TILE: 'burn_tile',
  CORRUPT_TILE: 'corrupt_tile',
  SLOT_LOCK: 'slot_lock',
  SATCHEL_RAID: 'satchel_raid',
};

const INTENT_DEFS = {
  [INTENT_TYPES.IDLE]:         { icon: '💤', label: 'Idle',           description: 'The sigil rests.' },
  [INTENT_TYPES.PRESSURE]:     { icon: '🗡️', label: 'Pressure',      description: (v) => `+${v} Tension` },
  [INTENT_TYPES.BURN_TILE]:    { icon: '🔥', label: 'Burn Tile',     description: 'Destroy a random tray tile.' },
  [INTENT_TYPES.CORRUPT_TILE]: { icon: '💀', label: 'Corrupt',       description: 'Fade a random tray tile.' },
  [INTENT_TYPES.SLOT_LOCK]:    { icon: '🔒', label: 'Slot Lock',     description: 'Lock a random slot for 1 turn.' },
  [INTENT_TYPES.SATCHEL_RAID]: { icon: '💨', label: 'Satchel Raid',  description: 'Discard a random satchel tile.' },
};

export function getIntentDisplay(intent) {
  if (!intent) return { icon: '?', label: '?', description: '?' };
  const def = INTENT_DEFS[intent.type] || INTENT_DEFS[INTENT_TYPES.IDLE];
  const desc = typeof def.description === 'function' ? def.description(intent.value) : def.description;
  return { icon: def.icon, label: def.label, description: desc };
}

/**
 * Roll a random enemy intent. Escalates with turn count.
 */
export function rollEnemyIntent(turn, isMiniboss) {
  // Weight pools — later turns are harsher
  const pool = [];
  // Always possible
  pool.push({ type: INTENT_TYPES.PRESSURE, value: 1, weight: 3 });
  pool.push({ type: INTENT_TYPES.BURN_TILE, value: 1, weight: 2 });
  pool.push({ type: INTENT_TYPES.CORRUPT_TILE, value: 1, weight: 2 });

  if (turn >= 1) {
    pool.push({ type: INTENT_TYPES.SLOT_LOCK, value: 1, weight: 1 });
  }
  if (turn >= 2) {
    pool.push({ type: INTENT_TYPES.SATCHEL_RAID, value: 1, weight: 1 });
    pool.push({ type: INTENT_TYPES.PRESSURE, value: 2, weight: 1 });
  }

  // Breather turns — less likely as turns progress
  if (turn < 3) {
    pool.push({ type: INTENT_TYPES.IDLE, value: 0, weight: 2 });
  } else {
    pool.push({ type: INTENT_TYPES.IDLE, value: 0, weight: 1 });
  }

  // Miniboss: heavier attacks
  if (isMiniboss) {
    pool.push({ type: INTENT_TYPES.PRESSURE, value: 2, weight: 2 });
    pool.push({ type: INTENT_TYPES.SLOT_LOCK, value: 1, weight: 2 });
  }

  // Weighted random selection
  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const entry of pool) {
    r -= entry.weight;
    if (r <= 0) {
      return { type: entry.type, value: entry.value };
    }
  }
  return pool[0]; // fallback
}

// ─── Letter tile factory ────────────────────────────────────

let tileIdCounter = 0;
export function createLetterTile(letter, source = 'generated', faded = false) {
  return {
    id: `tile-${++tileIdCounter}`,
    letter,
    source,
    faded,
  };
}

// ─── Helper: generate letters ───────────────────────────────

/**
 * Generate N random Hebrew letters, biased toward the target word.
 * @param {number} count
 * @param {string[]} targetLetters — letters of the target word
 * @param {number} accuracy — 0-1, chance each letter is from target
 * @returns {Object[]} array of LetterTile
 */
export function generateLetters(count, targetLetters, accuracy = 0.3) {
  const tiles = [];
  for (let i = 0; i < count; i++) {
    let letter;
    if (Math.random() < accuracy) {
      letter = targetLetters[Math.floor(Math.random() * targetLetters.length)];
    } else {
      letter = allDeepScriptLetters[Math.floor(Math.random() * allDeepScriptLetters.length)];
    }
    tiles.push(createLetterTile(letter));
  }
  return tiles;
}

/**
 * Generate a choice bundle: N letters to choose from, biased toward useful ones.
 */
export function generateChoiceBundle(count, targetLetters, bonusCount = 0) {
  const total = count + bonusCount;
  const options = [];
  // At least 1 useful letter
  options.push(targetLetters[Math.floor(Math.random() * targetLetters.length)]);
  for (let i = 1; i < total; i++) {
    if (Math.random() < 0.5) {
      options.push(targetLetters[Math.floor(Math.random() * targetLetters.length)]);
    } else {
      options.push(allDeepScriptLetters[Math.floor(Math.random() * allDeepScriptLetters.length)]);
    }
  }
  return options.sort(() => Math.random() - 0.5);
}

// ─── Initial combat state factory ───────────────────────────

export function createCombatState(wordId, runState) {
  const word = getWordById(wordId);
  if (!word) return null;

  const answerTrack = word.letters.map((letter, index) => ({
    index,
    targetLetter: letter,
    placedTile: null,
    revealed: false,
    correct: false,
    locked: false, // slot lock from enemy
  }));

  // Apply startReveal upgrade
  const startReveals = runState.upgrades?.startReveal || 0;
  if (startReveals > 0) {
    const unrevealed = answerTrack.filter(s => !s.revealed);
    for (let i = 0; i < Math.min(startReveals, unrevealed.length); i++) {
      const slot = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      slot.revealed = true;
    }
  }

  // Apply rootkeeper passive: chance to reveal a root letter
  if (runState.passives?.rootRevealChance && Math.random() < runState.passives.rootRevealChance) {
    const unrevealed = answerTrack.filter(s => !s.revealed);
    if (unrevealed.length > 0) {
      unrevealed[Math.floor(Math.random() * unrevealed.length)].revealed = true;
    }
  }

  // Generate initial letters for tray — small starting hand
  const accuracy = 0.3 + (runState.passives?.generateBonus || 0);
  const initialLetters = generateLetters(3, word.letters, accuracy);

  // Build gear states with socket tracking
  const gearStates = {};
  for (const gearId of runState.gearIds) {
    const gear = getGearById(gearId);
    if (gear) {
      const cd = Math.max(gear.cooldown - (runState.upgrades?.cooldownReduction || 0), gear.cooldown === 0 ? 0 : 1);
      gearStates[gearId] = {
        currentCooldown: 0,
        usesRemaining: gear.uses,
        effectiveCooldown: cd,
        sockets: (gear.tileSockets || []).map(s => ({ type: s.type, tileId: null })),
      };
    }
  }

  // Energy
  const maxEnergy = runState.maxEnergy || MAX_ENERGY_DEFAULT;

  // Roll first enemy intent
  const firstIntent = rollEnemyIntent(0, word.isMiniboss || false);

  // Health tracked locally for tension attack damage
  const health = runState.health || runState.maxHealth || 3;
  const maxHealth = runState.maxHealth || 3;

  return {
    wordId: word.id,
    word,
    answerTrack,
    tray: initialLetters,
    satchel: [],
    pressure: 0,
    maxPressure: (runState.upgrades?.maxPressure || 0) + MAX_PRESSURE_DEFAULT,
    health,
    maxHealth,
    turn: 0,
    energy: maxEnergy,
    maxEnergy,
    enemyIntent: firstIntent,
    warded: false,
    gearStates,
    choiceBundle: null,
    selectedTrayTile: null,
    selectedSatchelTile: null,
    phase: 'active',         // 'active' | 'victory' | 'defeat'
    log: [],
    isMiniboss: word.isMiniboss || false,
    minibossModifiers: word.isMiniboss ? {
      pressureRiseRate: 2,
      firstWrongCorrupts: true,
      hiddenSlot: true,
    } : null,
  };
}

// ─── Reducer actions ────────────────────────────────────────

export const ACTIONS = {
  GENERATE_LETTERS: 'GENERATE_LETTERS',
  PLACE_LETTER: 'PLACE_LETTER',
  STOW_LETTER: 'STOW_LETTER',
  RETRIEVE_FROM_SATCHEL: 'RETRIEVE_FROM_SATCHEL',
  USE_GEAR: 'USE_GEAR',
  SOCKET_TILE: 'SOCKET_TILE',
  UNSOCKET_TILE: 'UNSOCKET_TILE',
  SELECT_TRAY_TILE: 'SELECT_TRAY_TILE',
  SELECT_SATCHEL_TILE: 'SELECT_SATCHEL_TILE',
  PICK_CHOICE: 'PICK_CHOICE',
  START_TURN: 'START_TURN',
  END_TURN: 'END_TURN',
  DISMISS_LOG: 'DISMISS_LOG',
};

// ─── Tension overflow — deals damage and resets pressure ─────

function checkTensionOverflow(state) {
  if (state.pressure < state.maxPressure) return state;
  // Tension attack: deal 1 damage (miniboss deals 2), reset pressure
  const damage = state.isMiniboss ? 2 : 1;
  const newHealth = state.health - damage;
  const defeated = newHealth <= 0;
  return {
    ...state,
    pressure: 0,
    health: Math.max(0, newHealth),
    phase: defeated ? 'defeat' : state.phase,
    log: [...state.log, { type: 'tension', message: `Tension burst! You take ${damage} damage!` }],
  };
}

// ─── Execute enemy intent ───────────────────────────────────

function executeEnemyIntent(state) {
  const intent = state.enemyIntent;
  if (!intent) return state;

  // If warded, negate/halve the intent
  if (state.warded) {
    return {
      ...state,
      warded: false,
      log: [...state.log, { type: 'ward', message: 'Ward Stone absorbed the enemy attack!' }],
    };
  }

  switch (intent.type) {
    case INTENT_TYPES.IDLE:
      return state;

    case INTENT_TYPES.PRESSURE: {
      const newPressure = state.pressure + intent.value;
      const afterPressure = {
        ...state,
        pressure: newPressure,
        log: [...state.log, { type: 'enemy', message: `Enemy adds +${intent.value} tension!` }],
      };
      return checkTensionOverflow(afterPressure);
    }

    case INTENT_TYPES.BURN_TILE: {
      const nonFaded = state.tray.filter(t => !t.faded);
      if (nonFaded.length === 0) return state;
      const target = nonFaded[Math.floor(Math.random() * nonFaded.length)];
      return {
        ...state,
        tray: state.tray.filter(t => t.id !== target.id),
        log: [...state.log, { type: 'enemy', message: `Enemy burned your ${target.letter} tile!` }],
      };
    }

    case INTENT_TYPES.CORRUPT_TILE: {
      const nonFaded = state.tray.filter(t => !t.faded);
      if (nonFaded.length === 0) return state;
      const target = nonFaded[Math.floor(Math.random() * nonFaded.length)];
      return {
        ...state,
        tray: state.tray.map(t => t.id === target.id ? { ...t, faded: true } : t),
        log: [...state.log, { type: 'enemy', message: `Enemy corrupted your ${target.letter} tile!` }],
      };
    }

    case INTENT_TYPES.SLOT_LOCK: {
      const lockable = state.answerTrack.filter(s => !s.correct && !s.locked);
      if (lockable.length === 0) return state;
      const target = lockable[Math.floor(Math.random() * lockable.length)];
      const newTrack = state.answerTrack.map(s =>
        s.index === target.index ? { ...s, locked: true } : s
      );
      return {
        ...state,
        answerTrack: newTrack,
        log: [...state.log, { type: 'enemy', message: 'Enemy locked a slot!' }],
      };
    }

    case INTENT_TYPES.SATCHEL_RAID: {
      if (state.satchel.length === 0) return state;
      const target = state.satchel[Math.floor(Math.random() * state.satchel.length)];
      return {
        ...state,
        satchel: state.satchel.filter(t => t.id !== target.id),
        log: [...state.log, { type: 'enemy', message: `Enemy raided your satchel! Lost ${target.letter}.` }],
      };
    }

    default:
      return state;
  }
}

// ─── Combat reducer ─────────────────────────────────────────

export function combatReducer(state, action) {
  if (!state || state.phase !== 'active') return state;

  switch (action.type) {
    case ACTIONS.SELECT_TRAY_TILE: {
      return {
        ...state,
        selectedTrayTile: state.selectedTrayTile === action.tileId ? null : action.tileId,
        selectedSatchelTile: null,
      };
    }

    case ACTIONS.SELECT_SATCHEL_TILE: {
      return {
        ...state,
        selectedSatchelTile: state.selectedSatchelTile === action.tileId ? null : action.tileId,
        selectedTrayTile: null,
      };
    }

    case ACTIONS.PLACE_LETTER: {
      const { slotIndex } = action;
      const tileId = state.selectedTrayTile || state.selectedSatchelTile;
      if (!tileId) return state;

      const fromTray = state.tray.find(t => t.id === tileId);
      const fromSatchel = state.satchel.find(t => t.id === tileId);
      const tile = fromTray || fromSatchel;
      if (!tile) return state;

      const slot = state.answerTrack[slotIndex];
      if (!slot || slot.placedTile || slot.locked) return state;

      const isCorrect = tile.letter === slot.targetLetter;

      if (isCorrect) {
        const newTrack = [...state.answerTrack];
        newTrack[slotIndex] = { ...slot, placedTile: tile, correct: true };

        const newTray = fromTray ? state.tray.filter(t => t.id !== tileId) : state.tray;
        const newSatchel = fromSatchel ? state.satchel.filter(t => t.id !== tileId) : state.satchel;
        const allPlaced = newTrack.every(s => s.correct);

        return {
          ...state,
          answerTrack: newTrack,
          tray: newTray,
          satchel: newSatchel,
          selectedTrayTile: null,
          selectedSatchelTile: null,
          pressure: Math.max(0, state.pressure - 1),
          phase: allPlaced ? 'victory' : 'active',
          log: [...state.log, { type: 'correct', letter: tile.letter, slot: slotIndex }],
        };
      } else {
        const pressureInc = state.isMiniboss && state.minibossModifiers?.pressureRiseRate
          ? state.minibossModifiers.pressureRiseRate
          : 1;
        const newPressure = state.pressure + pressureInc;
        const fadedTile = { ...tile, faded: true };
        let newTray = fromTray
          ? state.tray.map(t => t.id === tileId ? fadedTile : t)
          : [...state.tray, fadedTile];
        const newSatchel = fromSatchel ? state.satchel.filter(t => t.id !== tileId) : state.satchel;

        const afterWrong = {
          ...state,
          tray: newTray,
          satchel: newSatchel,
          pressure: newPressure,
          selectedTrayTile: null,
          selectedSatchelTile: null,
          log: [...state.log, { type: 'wrong', letter: tile.letter, slot: slotIndex }],
        };
        return checkTensionOverflow(afterWrong);
      }
    }

    case ACTIONS.STOW_LETTER: {
      const tileId = state.selectedTrayTile;
      if (!tileId) return state;

      const tile = state.tray.find(t => t.id === tileId);
      if (!tile || tile.faded) return state;

      const satchelMax = state.maxSatchelSize || SATCHEL_SIZE_DEFAULT;
      if (state.satchel.length >= satchelMax) return state;

      return {
        ...state,
        tray: state.tray.filter(t => t.id !== tileId),
        satchel: [...state.satchel, tile],
        selectedTrayTile: null,
        log: [...state.log, { type: 'stow', letter: tile.letter }],
      };
    }

    case ACTIONS.RETRIEVE_FROM_SATCHEL: {
      const tileId = state.selectedSatchelTile;
      if (!tileId) return state;

      const tile = state.satchel.find(t => t.id === tileId);
      if (!tile) return state;

      const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
      if (state.tray.length >= trayMax) return state;

      return {
        ...state,
        satchel: state.satchel.filter(t => t.id !== tileId),
        tray: [...state.tray, tile],
        selectedSatchelTile: null,
        log: [...state.log, { type: 'retrieve', letter: tile.letter }],
      };
    }

    case ACTIONS.GENERATE_LETTERS: {
      const { letters } = action;
      const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
      const spaceLeft = trayMax - state.tray.length;
      const toAdd = letters.slice(0, spaceLeft);

      return {
        ...state,
        tray: [...state.tray, ...toAdd],
        log: state.log,
      };
    }

    case ACTIONS.SOCKET_TILE: {
      const { gearId, socketIndex } = action;
      const tileId = state.selectedTrayTile || state.selectedSatchelTile;
      if (!tileId) return state;

      const gs = state.gearStates[gearId];
      if (!gs || !gs.sockets[socketIndex]) return state;
      if (gs.sockets[socketIndex].tileId) return state; // already filled

      const fromTray = state.tray.find(t => t.id === tileId);
      const fromSatchel = state.satchel.find(t => t.id === tileId);
      const tile = fromTray || fromSatchel;
      if (!tile) return state;

      const newSockets = gs.sockets.map((s, i) =>
        i === socketIndex ? { ...s, tileId, tileLetter: tile.letter } : s
      );
      const newGearStates = {
        ...state.gearStates,
        [gearId]: { ...gs, sockets: newSockets },
      };
      const newTray = fromTray ? state.tray.filter(t => t.id !== tileId) : state.tray;
      const newSatchel = fromSatchel ? state.satchel.filter(t => t.id !== tileId) : state.satchel;

      return {
        ...state,
        gearStates: newGearStates,
        tray: newTray,
        satchel: newSatchel,
        selectedTrayTile: null,
        selectedSatchelTile: null,
      };
    }

    case ACTIONS.UNSOCKET_TILE: {
      const { gearId, socketIndex } = action;
      const gs = state.gearStates[gearId];
      if (!gs || !gs.sockets[socketIndex]) return state;

      const { tileId, tileLetter } = gs.sockets[socketIndex];
      if (!tileId || !tileLetter) return state;

      // Return tile to tray
      const restoredTile = createLetterTile(tileLetter, 'socketed');
      const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
      const newTray = state.tray.length < trayMax
        ? [...state.tray, restoredTile]
        : state.tray;

      const newSockets = gs.sockets.map((s, i) =>
        i === socketIndex ? { ...s, tileId: null, tileLetter: null } : s
      );
      const newGearStates = {
        ...state.gearStates,
        [gearId]: { ...gs, sockets: newSockets },
      };

      return {
        ...state,
        gearStates: newGearStates,
        tray: newTray,
      };
    }

    case ACTIONS.USE_GEAR: {
      const { gearId, runState } = action;
      const gearDef = getGearById(gearId);
      const gearState = state.gearStates[gearId];
      if (!gearDef || !gearState) return state;
      if (gearState.currentCooldown > 0) return state;
      if (gearState.usesRemaining === 0) return state;

      // Check energy cost
      if (state.energy < gearDef.energyCost) return state;

      // Check sockets are filled (required sockets must have tiles)
      const requiredSocketsFilled = gearState.sockets
        .filter(s => s.type === 'required')
        .every(s => s.tileId !== null);
      if (!requiredSocketsFilled && gearState.sockets.some(s => s.type === 'required')) return state;

      // Pay energy
      let newEnergy = state.energy - gearDef.energyCost;

      // Collect socketed tiles (they've already been removed from tray)
      const socketedTiles = gearState.sockets
        .filter(s => s.tileId !== null)
        .map(s => ({ tileId: s.tileId, letter: s.tileLetter }));

      // Clear sockets after use
      const newSockets = gearState.sockets.map(s => ({ ...s, tileId: null, tileLetter: null }));

      // Update gear state
      const newGearStates = {
        ...state.gearStates,
        [gearId]: {
          ...gearState,
          currentCooldown: gearState.effectiveCooldown,
          usesRemaining: gearState.usesRemaining > 0 ? gearState.usesRemaining - 1 : -1,
          sockets: newSockets,
        },
      };

      const targetLetters = state.word.letters;
      const genAccuracy = 0.3 + (runState?.passives?.generateBonus || 0);
      let updates = {
        gearStates: newGearStates,
        energy: newEnergy,
        tray: [...state.tray],
        satchel: [...state.satchel],
        selectedTrayTile: null,
        selectedSatchelTile: null,
      };

      switch (gearDef.type) {
        case 'generate-random': {
          // Scribe Knife: 2 random tiles, weighted toward target
          const newTiles = generateLetters(2, targetLetters, genAccuracy);
          const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
          const space = trayMax - updates.tray.length;
          updates.tray = [...updates.tray, ...newTiles.slice(0, space)];
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: `Generated ${Math.min(newTiles.length, space)} random tile(s)` }];
          break;
        }
        case 'duplicate': {
          // Echo Mirror: duplicate the socketed tile
          const socketedTile = socketedTiles[0];
          if (socketedTile?.letter) {
            const dupe = createLetterTile(socketedTile.letter, 'duplicate');
            const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
            if (updates.tray.length < trayMax) {
              updates.tray = [...updates.tray, dupe];
            }
            // Also return the original tile to tray
            const original = createLetterTile(socketedTile.letter, 'socketed');
            if (updates.tray.length < trayMax) {
              updates.tray = [...updates.tray, original];
            }
          }
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Duplicated letter' }];
          break;
        }
        case 'reveal': {
          const unrevealed = state.answerTrack.filter(s => !s.revealed && !s.correct);
          if (unrevealed.length > 0) {
            const slot = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            const newTrack = state.answerTrack.map(s =>
              s.index === slot.index ? { ...s, revealed: true } : s
            );
            updates.answerTrack = newTrack;
          }
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Revealed a letter position' }];
          break;
        }
        case 'choice': {
          const bonusCount = runState?.passives?.bonusChoiceCount || 0;
          const bundle = generateChoiceBundle(3, targetLetters, bonusCount);
          updates.choiceBundle = bundle;
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Choose a letter' }];
          break;
        }
        case 'transform': {
          // Rune Tongs: transform the socketed tile into a target-biased letter
          const socketedTile = socketedTiles[0];
          if (socketedTile) {
            const isExact = Math.random() < 0.5;
            const remaining = targetLetters.filter((l, i) => !state.answerTrack[i].correct);
            let newLetter;
            if (isExact && remaining.length > 0) {
              newLetter = remaining[Math.floor(Math.random() * remaining.length)];
            } else {
              newLetter = allDeepScriptLetters[Math.floor(Math.random() * allDeepScriptLetters.length)];
            }
            const transformedTile = createLetterTile(newLetter, 'transform');
            const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
            if (updates.tray.length < trayMax) {
              updates.tray = [...updates.tray, transformedTile];
            }
          }
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Transformed letter' }];
          break;
        }
        case 'burn': {
          // Ash Brazier: burn socketed tile, generate 2 random
          const burnAccuracy = 0.4 + (runState?.passives?.generateBonus || 0);
          const newTiles = generateLetters(2, targetLetters, burnAccuracy);
          const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
          const space = trayMax - updates.tray.length;
          updates.tray = [...updates.tray, ...newTiles.slice(0, space)];
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: `Burned tile → ${Math.min(newTiles.length, space)} new tile(s)` }];
          break;
        }
        case 'defend': {
          // Ward Stone: set warded
          updates.warded = true;
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Ward raised! Next enemy action will be blocked.' }];
          break;
        }
        case 'generate-exact': {
          // Inscription Quill: generate 1 exact needed letter
          const remaining = targetLetters.filter((l, i) => !state.answerTrack[i].correct);
          if (remaining.length > 0) {
            const exactLetter = remaining[Math.floor(Math.random() * remaining.length)];
            const tile = createLetterTile(exactLetter, 'gear');
            const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
            if (updates.tray.length < trayMax) {
              updates.tray = [...updates.tray, tile];
            }
          }
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Inscribed an exact letter' }];
          break;
        }
        default:
          break;
      }

      return { ...state, ...updates };
    }

    case ACTIONS.PICK_CHOICE: {
      const { letter } = action;
      if (!state.choiceBundle) return state;

      const tile = createLetterTile(letter, 'choice');
      const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
      const newTray = state.tray.length < trayMax ? [...state.tray, tile] : state.tray;

      return {
        ...state,
        tray: newTray,
        choiceBundle: null,
        log: [...state.log, { type: 'choice', letter }],
      };
    }

    case ACTIONS.START_TURN: {
      // Gain energy and clear slot locks
      const newTrack = state.answerTrack.map(s => ({ ...s, locked: false }));
      return {
        ...state,
        energy: state.maxEnergy,
        answerTrack: newTrack,
        log: [],
      };
    }

    case ACTIONS.END_TURN: {
      // 1. Enemy executes telegraphed intent
      let newState = executeEnemyIntent(state);
      if (newState.phase === 'defeat') return newState;

      // 2. Tick gear cooldowns
      const newGearStates = {};
      for (const [id, gs] of Object.entries(newState.gearStates)) {
        // Also clear sockets on turn end
        newGearStates[id] = {
          ...gs,
          currentCooldown: Math.max(0, gs.currentCooldown - 1),
          sockets: gs.sockets.map(s => ({ ...s, tileId: null, tileLetter: null })),
        };
      }

      // 3. Roll new enemy intent
      const nextIntent = rollEnemyIntent(newState.turn + 1, newState.isMiniboss);

      // 4. Increment turn
      return {
        ...newState,
        turn: newState.turn + 1,
        gearStates: newGearStates,
        enemyIntent: nextIntent,
        energy: 0, // energy depleted; START_TURN will refill
        warded: false,
      };
    }

    case ACTIONS.DISMISS_LOG: {
      return { ...state, log: [] };
    }

    default:
      return state;
  }
}

// ─── Run state management ───────────────────────────────────

export function createRunState(kit, sharedGearIds, runMap) {
  return {
    kitId: kit.id,
    kit,
    health: kit.health,
    maxHealth: kit.health,
    traySize: kit.traySize,
    satchelSize: kit.satchelSize,
    maxEnergy: kit.maxEnergy || MAX_ENERGY_DEFAULT,
    gearIds: [...kit.gearIds, ...sharedGearIds],
    passives: { ...kit.passives },
    upgrades: {},
    roomIndex: 0,
    runMap,
    roomsCompleted: 0,
    combatsWon: 0,
    wordsCompleted: [],
    phase: 'room_choice',
    currentRoom: null,
    insightNextCombat: false,
  };
}
