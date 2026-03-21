/**
 * Deep Script combat engine — pure state management via reducer.
 *
 * Turn flow:
 *   START_TURN  → gain energy, clear slot locks
 *   Player acts → spend energy, manage tiles, place letters
 *                → wrong letter placement triggers telegraphed enemy intent
 *   END_TURN    → cursed damage, tick cooldowns, increment turn, check defeat
 *
 * All game logic is handled through dispatched actions.
 * The engine is framework-agnostic; React integration is via useReducer.
 */

import { getWordById, allDeepScriptLetters } from '../../data/deepScript/words.js';
import { getGearById } from '../../data/deepScript/gear.js';
import { getEnemyDef, ENEMY_TYPES } from '../../data/deepScript/enemies.js';
import { nanoid } from 'nanoid/non-secure';

// ─── Constants ──────────────────────────────────────────────

export const TRAY_SIZE_DEFAULT = 6;
export const SATCHEL_SIZE_DEFAULT = 3;
export const REALTIME_TICK_MS_DEFAULT = 250;

// ─── Enemy Intent Types ─────────────────────────────────────

export const INTENT_TYPES = {
  CURSE_TILE: 'curse_tile',
  SPAWN_CURSED: 'spawn_cursed',
  BURN_TILE: 'burn_tile',
  SLOT_LOCK: 'slot_lock',
  SATCHEL_RAID: 'satchel_raid',
};

const INTENT_DEFS = {
  [INTENT_TYPES.CURSE_TILE]:   { icon: '💀', label: 'Curse' },
  [INTENT_TYPES.SPAWN_CURSED]: { icon: '🕷️', label: 'Spawn' },
  [INTENT_TYPES.BURN_TILE]:    { icon: '🔥', label: 'Buff', description: 'Increases next action amount' },
  [INTENT_TYPES.SLOT_LOCK]:    { icon: '⚔️', label: 'Attack', description: 'Deals damage' },
  [INTENT_TYPES.SATCHEL_RAID]: { icon: '🌀', label: 'Jinx', description: 'Adds cooldown delay to random abilities' },
};

export function getIntentDisplay(intent) {
  if (!intent) return { icon: '?', label: '?', value: 0, description: '' };
  const def = INTENT_DEFS[intent.type] || { icon: '?', label: '?', description: '' };
  return { icon: def.icon, label: def.label, value: intent.value || 1, description: def.description || '' };
}

/**
 * Roll a random enemy intent based on enemy archetype.
 */
export function rollEnemyIntent(turn, isMiniboss, enemyType = ENEMY_TYPES.CORRUPTOR) {
  const enemyDef = getEnemyDef(enemyType);
  const pool = [];

  for (const [intentKey, config] of Object.entries(enemyDef.intentWeights)) {
    if (config.minTurn && turn < config.minTurn) continue;
    const type = INTENT_TYPES[intentKey];
    if (!type) continue;
    const weight = config.weight;

    // Base value from archetype config, scaled up for miniboss or late turns
    let value = config.value || 1;
    if (isMiniboss) value += 1;
    if (turn >= 4) value += 1;

    pool.push({ type, value, weight });
  }

  if (pool.length === 0) {
    return { type: INTENT_TYPES.CURSE_TILE, value: 1 };
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

// Re-export for external use
export { ENEMY_TYPES };

// ─── Letter tile factory ────────────────────────────────────

export function createLetterTile(letter, source = 'generated', cursed = false) {
  return {
    id: `tile-${nanoid(8)}`,
    letter,
    source,
    cursed,
  };
}

function addTilesToTrayWithOverflow(state, tilesToAdd = []) {
  const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
  let nextTray = [...state.tray];
  let overflowCursed = 0;
  const producedTileIds = [];

  for (const tile of tilesToAdd) {
    nextTray.push(tile);
    producedTileIds.push(tile.id);
    while (nextTray.length > trayMax) {
      const pushedOff = nextTray.shift();
      if (pushedOff?.cursed) overflowCursed += 1;
    }
  }

  return { nextTray, overflowCursed, producedTileIds };
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
        turnUses: 0,
      };
    }
  }

  const weaponDef = runState.kit?.basicWeapon || null;
  const weaponChargesMax = Math.max(1, weaponDef?.charges || 1);

  // Determine enemy type
  const enemyType = word.enemyType || ENEMY_TYPES.CORRUPTOR;
  const enemyDef = getEnemyDef(enemyType);

  // Roll first enemy intent
  const firstIntent = rollEnemyIntent(0, word.isMiniboss || false, enemyType);

  // Health tracked locally for curse damage
  const health = runState.health || runState.maxHealth || 3;
  const maxHealth = runState.maxHealth || 3;

  return {
    wordId: word.id,
    word,
    answerTrack,
    tray: initialLetters,
    satchel: [],
    health,
    maxHealth,
    turn: 0,
    enemyType,
    enemyDef,
    enemyIntent: firstIntent,
    warded: false,
    gearStates,
    pendingSeeds: [],
    choiceBundle: null,
    selectedTrayTile: null,
    selectedSatchelTile: null,
    phase: 'active',         // 'active' | 'victory' | 'defeat'
    log: [],
    isMiniboss: word.isMiniboss || false,
    pendingIntentBuff: 0,
    confusedGearCosts: {},
    cooldownReduction: runState.upgrades?.cooldownReduction || 0,
    nowMs: 0,
    basicWeapon: weaponDef
      ? {
          ...weaponDef,
          chargeCount: weaponChargesMax,
          chargeCountMax: weaponChargesMax,
          cooldownRemainingMs: 0,
          nextFireMs: weaponDef.cooldownMs || 2500,
          powerUpRemainingMs: 0,
        }
      : null,
    lastProducedTileIds: [],
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
  REALTIME_TICK: 'REALTIME_TICK',
  DISMISS_LOG: 'DISMISS_LOG',
};

// ─── Execute enemy intent ───────────────────────────────────

function executeEnemyIntent(state) {
  const intent = state.enemyIntent;
  if (!intent) return state;
  const pendingIntentBuff = state.pendingIntentBuff || 0;
  const effectiveValue = Math.max(1, (intent.value || 1) + pendingIntentBuff);

  // If warded, negate/halve the intent
  if (state.warded) {
    return {
      ...state,
      warded: false,
      pendingIntentBuff: 0,
      log: [...state.log, { type: 'ward', message: 'Ward Stone absorbed the enemy attack!' }],
    };
  }

  switch (intent.type) {
    case INTENT_TYPES.CURSE_TILE: {
      let tray = [...state.tray];
      let cursed = 0;
      for (let i = 0; i < effectiveValue; i++) {
        const clean = tray.filter(t => !t.cursed);
        if (clean.length === 0) break;
        const target = clean[Math.floor(Math.random() * clean.length)];
        tray = tray.map(t => t.id === target.id ? { ...t, cursed: true } : t);
        cursed++;
      }
      if (cursed === 0) return state;
      return {
        ...state,
        tray,
        pendingIntentBuff: 0,
        log: [...state.log, { type: 'enemy', message: `Cursed ${cursed} tile(s)!` }],
      };
    }

    case INTENT_TYPES.SPAWN_CURSED: {
      const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
      const spawned = [];
      for (let i = 0; i < effectiveValue; i++) {
        if (state.tray.length + spawned.length >= trayMax) break;
        const junkLetter = allDeepScriptLetters[Math.floor(Math.random() * allDeepScriptLetters.length)];
        spawned.push(createLetterTile(junkLetter, 'spawned', true));
      }
      if (spawned.length === 0) return state;
      return {
        ...state,
        tray: [...state.tray, ...spawned],
        pendingIntentBuff: 0,
        log: [...state.log, { type: 'enemy', message: `Spawned ${spawned.length} cursed tile(s)!` }],
      };
    }

    case INTENT_TYPES.BURN_TILE: {
      return {
        ...state,
        pendingIntentBuff: effectiveValue,
        log: [...state.log, { type: 'enemy', message: `Buffed next action by +${effectiveValue}!` }],
      };
    }

    case INTENT_TYPES.SLOT_LOCK: {
      const newHealth = state.health - effectiveValue;
      const defeated = newHealth <= 0;
      return {
        ...state,
        health: Math.max(0, newHealth),
        phase: defeated ? 'defeat' : state.phase,
        pendingIntentBuff: 0,
        log: [...state.log, { type: 'enemy', message: `Attacked for ${effectiveValue} damage!` }],
      };
    }

    case INTENT_TYPES.SATCHEL_RAID: {
      const gearIds = Object.keys(state.gearStates);
      const targetedCount = Math.min(effectiveValue, gearIds.length);
      if (targetedCount === 0) return { ...state, pendingIntentBuff: 0 };
      const shuffled = [...gearIds].sort(() => Math.random() - 0.5);
      const targeted = shuffled.slice(0, targetedCount);
      const confusedGearCosts = { ...state.confusedGearCosts };
      for (const gearId of targeted) {
        confusedGearCosts[gearId] = (Math.floor(Math.random() * 3) + 1) * 1000;
      }
      return {
        ...state,
        confusedGearCosts,
        pendingIntentBuff: 0,
        log: [...state.log, { type: 'enemy', message: `Jinxed ${targeted.length} abilit${targeted.length === 1 ? 'y' : 'ies'} with cooldown delay!` }],
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
          phase: allPlaced ? 'victory' : 'active',
          log: [...state.log, { type: 'correct', letter: tile.letter, slot: slotIndex }],
        };
      } else {
        const cursedTile = { ...tile, cursed: true };
        let newTray = fromTray
          ? state.tray.map(t => t.id === tileId ? cursedTile : t)
          : [...state.tray, cursedTile];
        const newSatchel = fromSatchel ? state.satchel.filter(t => t.id !== tileId) : state.satchel;

        const logEntries = [...state.log, { type: 'wrong', letter: tile.letter, slot: slotIndex }];

        // Amplifier passive: chain-curse 1 additional clean tile on wrong guess
        if (state.enemyDef?.passive === 'chainCurse') {
          const cleanTiles = newTray.filter(t => !t.cursed);
          if (cleanTiles.length > 0) {
            const chainTarget = cleanTiles[Math.floor(Math.random() * cleanTiles.length)];
            newTray = newTray.map(t => t.id === chainTarget.id ? { ...t, cursed: true } : t);
            logEntries.push({ type: 'enemy', message: `Chain curse! ${chainTarget.letter} is also cursed!` });
          }
        }

        const mistakeState = {
          ...state,
          tray: newTray,
          satchel: newSatchel,
          selectedTrayTile: null,
          selectedSatchelTile: null,
          log: logEntries,
        };

        // Enemy intent now triggers on player mistakes (wrong letter placements),
        // not at END_TURN.
        let newState = executeEnemyIntent(mistakeState);
        if (newState.phase === 'defeat') return newState;

        // Roll a fresh telegraphed intent after each triggered enemy action.
        const nextIntent = rollEnemyIntent(newState.turn, newState.isMiniboss, newState.enemyType);
        return {
          ...newState,
          enemyIntent: nextIntent,
        };
      }
    }

    case ACTIONS.STOW_LETTER: {
      const tileId = state.selectedTrayTile;
      if (!tileId) return state;

      const tile = state.tray.find(t => t.id === tileId);
      if (!tile) return state;

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
      const { nextTray, overflowCursed, producedTileIds } = addTilesToTrayWithOverflow(state, letters);
      const health = Math.max(0, state.health - overflowCursed);

      return {
        ...state,
        tray: nextTray,
        health,
        phase: health <= 0 ? 'defeat' : state.phase,
        lastProducedTileIds: producedTileIds,
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

      // Check sockets are filled (required sockets must have tiles)
      const requiredSocketsFilled = gearState.sockets
        .filter(s => s.type === 'required')
      .every(s => s.tileId !== null);
      if (!requiredSocketsFilled && gearState.sockets.some(s => s.type === 'required')) return state;

      // Collect socketed tiles (they've already been removed from tray)
      const socketedTiles = gearState.sockets
        .filter(s => s.tileId !== null)
        .map(s => ({ tileId: s.tileId, letter: s.tileLetter }));

      // Clear sockets after use
      const newSockets = gearState.sockets.map(s => ({ ...s, tileId: null, tileLetter: null }));

      // Update gear state (track per-turn usage for escalating cost)
      const newGearStates = {
        ...state.gearStates,
        [gearId]: {
          ...gearState,
          currentCooldown: gearState.effectiveCooldown + (state.confusedGearCosts?.[gearId] || 0) / 1000,
          usesRemaining: gearState.usesRemaining > 0 ? gearState.usesRemaining - 1 : -1,
          sockets: newSockets,
          turnUses: 0,
        },
      };

      const targetLetters = state.word.letters;
      const genAccuracy = 0.3 + (runState?.passives?.generateBonus || 0);
      let updates = {
        gearStates: newGearStates,
        tray: [...state.tray],
        satchel: [...state.satchel],
        selectedTrayTile: null,
        selectedSatchelTile: null,
        lastProducedTileIds: [],
      };

      switch (gearDef.type) {
        case 'generate-random': {
          // Scribe Knife: 2 random tiles, weighted toward target
          const newTiles = generateLetters(2, targetLetters, genAccuracy);
          const { nextTray, overflowCursed, producedTileIds } = addTilesToTrayWithOverflow({ ...state, tray: updates.tray }, newTiles);
          updates.tray = nextTray;
          updates.lastProducedTileIds = producedTileIds;
          updates.health = Math.max(0, (state.health - overflowCursed));
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: `Generated ${newTiles.length} random tile(s)` }];
          break;
        }
        case 'duplicate': {
          // Echo Mirror: produce 2 copies of the socketed tile
          const socketedTile = socketedTiles[0];
          if (socketedTile?.letter) {
            const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
            const duplicateTiles = [];
            for (let i = 0; i < 2; i++) {
              const copy = createLetterTile(socketedTile.letter, 'duplicate');
              if (updates.tray.length < trayMax) duplicateTiles.push(copy);
            }
            // Also return the original tile to tray
            const original = createLetterTile(socketedTile.letter, 'socketed');
            duplicateTiles.push(original);
            const { nextTray, overflowCursed, producedTileIds } = addTilesToTrayWithOverflow({ ...state, tray: updates.tray }, duplicateTiles);
            updates.tray = nextTray;
            updates.lastProducedTileIds = producedTileIds;
            updates.health = Math.max(0, (state.health - overflowCursed));
          }
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Produced 2 copies' }];
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
        case 'salvage': {
          // Interpreter's Lantern: consume 1 cursed tray tile + generate tile(s).
          // If a cursed tile was consumed, generate 2 tiles; otherwise 1.
          const cursedIdx = updates.tray.findIndex(t => t.cursed);
          let salvaged = false;
          if (cursedIdx !== -1) {
            updates.tray = updates.tray.filter((_, i) => i !== cursedIdx);
            salvaged = true;
          }
          const salvageCount = salvaged ? 2 : 1;
          const salvageAccuracy = 0.4 + (runState?.passives?.generateBonus || 0);
          const salvageTiles = generateLetters(salvageCount, targetLetters, salvageAccuracy);
          const { nextTray, overflowCursed, producedTileIds } = addTilesToTrayWithOverflow({ ...state, tray: updates.tray }, salvageTiles);
          updates.tray = nextTray;
          updates.lastProducedTileIds = producedTileIds;
          updates.health = Math.max(0, (state.health - overflowCursed));
          updates.log = [...state.log, {
            type: 'gear', name: gearDef.name,
            message: salvaged
              ? `Consumed a cursed tile + ${salvageCount} new tile(s)`
              : 'Generated 1 tile',
          }];
          break;
        }
        case 'germinate': {
          // Rootkeeper's Root Lens: generate 1 tile now (30%) + plant a seed
          // that blooms into 1 tile (60%) at START of next turn.
          // Tempo decision: delayed tile is vulnerable to enemy burn/corrupt.
          const sproutAccuracy = 0.3 + (runState?.passives?.generateBonus || 0);
          const sproutTiles = generateLetters(1, targetLetters, sproutAccuracy);
          const { nextTray, overflowCursed, producedTileIds } = addTilesToTrayWithOverflow({ ...state, tray: updates.tray }, sproutTiles);
          updates.tray = nextTray;
          updates.lastProducedTileIds = producedTileIds;
          updates.health = Math.max(0, (state.health - overflowCursed));
          // Plant seed for next turn bloom
          const seedAccuracy = 0.6 + (runState?.passives?.generateBonus || 0);
          updates.pendingSeeds = [
            ...(state.pendingSeeds || []),
            { accuracy: seedAccuracy, targetLetters: [...targetLetters] },
          ];
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: '+1 tile now, seed planted 🌱' }];
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
            const { nextTray, overflowCursed, producedTileIds } = addTilesToTrayWithOverflow({ ...state, tray: updates.tray }, [transformedTile]);
            updates.tray = nextTray;
            updates.lastProducedTileIds = producedTileIds;
            updates.health = Math.max(0, (state.health - overflowCursed));
          }
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Transformed letter' }];
          break;
        }
        case 'burn': {
          // Ash Brazier: burn socketed tile, generate 2 random
          const burnAccuracy = 0.4 + (runState?.passives?.generateBonus || 0);
          const newTiles = generateLetters(2, targetLetters, burnAccuracy);
          const { nextTray, overflowCursed, producedTileIds } = addTilesToTrayWithOverflow({ ...state, tray: updates.tray }, newTiles);
          updates.tray = nextTray;
          updates.lastProducedTileIds = producedTileIds;
          updates.health = Math.max(0, (state.health - overflowCursed));
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: `Burned tile → ${newTiles.length} new tile(s)` }];
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
            const { nextTray, overflowCursed, producedTileIds } = addTilesToTrayWithOverflow({ ...state, tray: updates.tray }, [tile]);
            updates.tray = nextTray;
            updates.lastProducedTileIds = producedTileIds;
            updates.health = Math.max(0, (state.health - overflowCursed));
          }
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Inscribed an exact letter' }];
          break;
        }
        default:
          break;
      }

      const merged = { ...state, ...updates };
      if (typeof merged.health === 'number' && merged.health <= 0) {
        merged.health = 0;
        merged.phase = 'defeat';
      }
      return merged;
    }

    case ACTIONS.PICK_CHOICE: {
      const { letter } = action;
      if (!state.choiceBundle) return state;

      const tile = createLetterTile(letter, 'choice');
      const { nextTray, overflowCursed, producedTileIds } = addTilesToTrayWithOverflow(state, [tile]);
      const health = Math.max(0, state.health - overflowCursed);

      return {
        ...state,
        tray: nextTray,
        health,
        phase: health <= 0 ? 'defeat' : state.phase,
        lastProducedTileIds: producedTileIds,
        choiceBundle: null,
        log: [...state.log, { type: 'choice', letter }],
      };
    }

    case ACTIONS.REALTIME_TICK: {
      const dtMs = Math.max(1, action.dtMs || REALTIME_TICK_MS_DEFAULT);
      const gearStates = {};
      for (const [id, gs] of Object.entries(state.gearStates)) {
        gearStates[id] = {
          ...gs,
          currentCooldown: Math.max(0, gs.currentCooldown - (dtMs / 1000)),
        };
      }

      let nextState = {
        ...state,
        nowMs: state.nowMs + dtMs,
        gearStates,
        lastProducedTileIds: [],
      };

      if (!state.basicWeapon) return nextState;

      const weapon = { ...state.basicWeapon };
      let timer = weapon.nextFireMs - dtMs;
      let health = nextState.health;
      let tray = [...nextState.tray];
      let produced = [];

      while (timer <= 0) {
        if (weapon.chargeCount <= 0) {
          weapon.cooldownRemainingMs = Math.max(0, weapon.cooldownRemainingMs + timer);
          timer += weapon.cooldownMs;
          if (weapon.cooldownRemainingMs <= 0) {
            weapon.chargeCount = weapon.chargeCountMax;
            weapon.cooldownRemainingMs = 0;
          }
          continue;
        }

        const boosted = weapon.powerUpRemainingMs > 0;
        const lettersPerShot = weapon.lettersPerShot + (boosted ? (weapon.powerUp?.lettersBonus || 0) : 0);
        const exactBoost = boosted ? (weapon.powerUp?.exactChanceBonus || 0) : 0;
        const accuracy = Math.min(0.95, weapon.exactLetterChance + exactBoost);
        const generated = generateLetters(lettersPerShot, state.word.letters, accuracy)
          .map((tile) => ({ ...tile, source: 'weapon' }));
        const trayResult = addTilesToTrayWithOverflow({ ...nextState, tray }, generated);
        tray = trayResult.nextTray;
        produced = [...produced, ...trayResult.producedTileIds];
        health = Math.max(0, health - trayResult.overflowCursed);
        weapon.chargeCount -= 1;

        if (weapon.chargeCount <= 0) {
          weapon.cooldownRemainingMs = weapon.cooldownMs;
        }
        timer += weapon.cooldownMs;
      }

      weapon.nextFireMs = timer;
      weapon.powerUpRemainingMs = Math.max(0, weapon.powerUpRemainingMs - dtMs);

      return {
        ...nextState,
        tray,
        health,
        phase: health <= 0 ? 'defeat' : nextState.phase,
        basicWeapon: weapon,
        lastProducedTileIds: produced,
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
