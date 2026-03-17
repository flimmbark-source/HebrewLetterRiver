/**
 * Deep Script combat engine — pure state management via reducer.
 *
 * All game logic is handled through dispatched actions.
 * The engine is framework-agnostic; React integration is via useReducer.
 */

import { getWordById, allDeepScriptLetters } from '../../data/deepScript/words.js';
import { getGearById } from '../../data/deepScript/gear.js';

// ─── Constants ──────────────────────────────────────────────

export const MAX_PRESSURE_DEFAULT = 5;
export const TRAY_SIZE_DEFAULT = 6;
export const SATCHEL_SIZE_DEFAULT = 3;

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
export function generateLetters(count, targetLetters, accuracy = 0.5) {
  const tiles = [];
  for (let i = 0; i < count; i++) {
    let letter;
    if (Math.random() < accuracy) {
      // Pick from target word letters
      letter = targetLetters[Math.floor(Math.random() * targetLetters.length)];
    } else {
      // Pick from all Hebrew letters
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

  // Generate initial letters for tray
  const accuracy = 0.4 + (runState.upgrades?.genAccuracy || 0);
  const initialLetters = generateLetters(3, word.letters, accuracy);

  // Build gear states
  const gearStates = {};
  for (const gearId of runState.gearIds) {
    const gear = getGearById(gearId);
    if (gear) {
      const cd = Math.max(gear.cooldown - (runState.upgrades?.cooldownReduction || 0), gear.cooldown === 0 ? 0 : 1);
      gearStates[gearId] = {
        currentCooldown: 0,
        usesRemaining: gear.uses,
        effectiveCooldown: cd,
      };
    }
  }

  return {
    wordId: word.id,
    word,
    answerTrack,
    tray: initialLetters,
    satchel: [],
    pressure: 0,
    maxPressure: (runState.upgrades?.maxPressure || 0) + MAX_PRESSURE_DEFAULT,
    turn: 0,
    gearStates,
    choiceBundle: null,      // active choice bundle (array of letters or null)
    selectedTrayTile: null,  // ID of selected tray tile
    selectedSatchelTile: null,
    phase: 'active',         // 'active' | 'victory' | 'defeat'
    log: [],                 // action log for feedback
    isMiniboss: word.isMiniboss || false,
    minibossModifiers: word.isMiniboss ? {
      pressureRiseRate: 2,        // pressure rises faster
      firstWrongCorrupts: true,   // first wrong letter gets corrupted
      hiddenSlot: true,           // one slot starts hidden
    } : null,
  };
}

// ─── Reducer actions ────────────────────────────────────────

export const ACTIONS = {
  GENERATE_LETTERS: 'GENERATE_LETTERS',
  PLACE_LETTER: 'PLACE_LETTER',
  STOW_LETTER: 'STOW_LETTER',
  RETRIEVE_FROM_SATCHEL: 'RETRIEVE_FROM_SATCHEL',
  BURN_LETTER: 'BURN_LETTER',
  USE_GEAR: 'USE_GEAR',
  SELECT_TRAY_TILE: 'SELECT_TRAY_TILE',
  SELECT_SATCHEL_TILE: 'SELECT_SATCHEL_TILE',
  PICK_CHOICE: 'PICK_CHOICE',
  END_TURN: 'END_TURN',
  DISMISS_LOG: 'DISMISS_LOG',
};

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

      // Find tile in tray or satchel
      const fromTray = state.tray.find(t => t.id === tileId);
      const fromSatchel = state.satchel.find(t => t.id === tileId);
      const tile = fromTray || fromSatchel;
      if (!tile) return state;

      const slot = state.answerTrack[slotIndex];
      if (!slot || slot.placedTile) return state;

      const isCorrect = tile.letter === slot.targetLetter;

      if (isCorrect) {
        // Correct placement
        const newTrack = [...state.answerTrack];
        newTrack[slotIndex] = { ...slot, placedTile: tile, correct: true };

        const newTray = fromTray ? state.tray.filter(t => t.id !== tileId) : state.tray;
        const newSatchel = fromSatchel ? state.satchel.filter(t => t.id !== tileId) : state.satchel;

        // Check victory
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
        // Wrong placement — pressure increases, letter becomes faded
        const pressureInc = state.isMiniboss && state.minibossModifiers?.pressureRiseRate
          ? state.minibossModifiers.pressureRiseRate
          : 1;
        const newPressure = state.pressure + pressureInc;

        // Faded tile goes back to tray
        const fadedTile = { ...tile, faded: true };
        let newTray = fromTray
          ? state.tray.map(t => t.id === tileId ? fadedTile : t)
          : [...state.tray, fadedTile];
        const newSatchel = fromSatchel ? state.satchel.filter(t => t.id !== tileId) : state.satchel;

        // Check defeat
        const defeated = newPressure >= state.maxPressure;

        return {
          ...state,
          tray: newTray,
          satchel: newSatchel,
          pressure: newPressure,
          selectedTrayTile: null,
          selectedSatchelTile: null,
          phase: defeated ? 'defeat' : 'active',
          log: [...state.log, { type: 'wrong', letter: tile.letter, slot: slotIndex }],
        };
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

    case ACTIONS.BURN_LETTER: {
      const tileId = state.selectedTrayTile;
      if (!tileId) return state;

      const tile = state.tray.find(t => t.id === tileId);
      if (!tile) return state;

      const newTray = state.tray.filter(t => t.id !== tileId);

      // Burn effect: generate 1 new random letter (or 2 with upgrade)
      const burnCount = action.burnBonus ? 2 : 1;
      const newLetters = generateLetters(burnCount, state.word.letters, 0.4);
      const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
      const spaceLeft = trayMax - newTray.length;
      const lettersToAdd = newLetters.slice(0, spaceLeft);

      return {
        ...state,
        tray: [...newTray, ...lettersToAdd],
        selectedTrayTile: null,
        log: [...state.log, { type: 'burn', letter: tile.letter, gained: lettersToAdd.map(t => t.letter) }],
      };
    }

    case ACTIONS.GENERATE_LETTERS: {
      const { letters } = action; // array of LetterTile
      const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
      const spaceLeft = trayMax - state.tray.length;
      const toAdd = letters.slice(0, spaceLeft);

      // If tray overflows, pressure +1
      const overflow = letters.length > spaceLeft;
      const newPressure = overflow ? state.pressure + 1 : state.pressure;

      return {
        ...state,
        tray: [...state.tray, ...toAdd],
        pressure: newPressure,
        log: overflow
          ? [...state.log, { type: 'overflow', message: 'Tray overflowed!' }]
          : state.log,
      };
    }

    case ACTIONS.USE_GEAR: {
      const { gearId, runState } = action;
      const gearDef = getGearById(gearId);
      const gearState = state.gearStates[gearId];
      if (!gearDef || !gearState) return state;
      if (gearState.currentCooldown > 0) return state;
      if (gearState.usesRemaining === 0) return state;

      // Pay invoke cost (burn selected tiles)
      let newTray = [...state.tray];
      let newSatchel = [...state.satchel];
      if (gearDef.invokeCost > 0) {
        const selectedId = state.selectedTrayTile;
        if (!selectedId) return state;
        newTray = newTray.filter(t => t.id !== selectedId);
      }

      // Apply gear effect
      const newGearStates = {
        ...state.gearStates,
        [gearId]: {
          ...gearState,
          currentCooldown: gearState.effectiveCooldown,
          usesRemaining: gearState.usesRemaining > 0 ? gearState.usesRemaining - 1 : -1,
        },
      };

      const accuracy = 0.5 + (runState?.upgrades?.genAccuracy || 0);
      const targetLetters = state.word.letters;
      let updates = {
        gearStates: newGearStates,
        tray: newTray,
        satchel: newSatchel,
        selectedTrayTile: null,
        selectedSatchelTile: null,
      };

      switch (gearDef.type) {
        case 'generate': {
          // Scribe Knife: 1-2 exact target letters
          const count = Math.random() < 0.5 ? 2 : 1;
          const exact = [];
          const remaining = targetLetters.filter((l, i) => !state.answerTrack[i].correct);
          for (let i = 0; i < count; i++) {
            if (remaining.length > 0) {
              exact.push(createLetterTile(remaining[Math.floor(Math.random() * remaining.length)], 'gear'));
            }
          }
          const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
          const space = trayMax - updates.tray.length;
          updates.tray = [...updates.tray, ...exact.slice(0, space)];
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: `Generated ${exact.length} letter(s)` }];
          break;
        }
        case 'duplicate': {
          // Echo Mirror: duplicate selected tray tile
          const selectedId = state.selectedTrayTile;
          const tile = state.tray.find(t => t.id === selectedId);
          if (tile) {
            const dupe = createLetterTile(tile.letter, 'duplicate');
            const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
            if (updates.tray.length < trayMax) {
              updates.tray = [...updates.tray, dupe];
            }
          }
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Duplicated letter' }];
          break;
        }
        case 'reveal': {
          // Reveal a correct slot
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
          // Choice Sigil: show choice bundle
          const bonusCount = runState?.passives?.bonusChoiceCount || 0;
          const bundle = generateChoiceBundle(3, targetLetters, bonusCount);
          updates.choiceBundle = bundle;
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Choose a letter' }];
          break;
        }
        case 'transform': {
          // Rune Tongs: transform selected letter
          const selectedId = state.selectedTrayTile;
          const tile = updates.tray.find(t => t.id === selectedId);
          if (tile) {
            // Transform to a random target letter
            const newLetter = targetLetters[Math.floor(Math.random() * targetLetters.length)];
            updates.tray = updates.tray.map(t =>
              t.id === selectedId ? { ...t, letter: newLetter, source: 'transform' } : t
            );
          }
          updates.log = [...state.log, { type: 'gear', name: gearDef.name, message: 'Transformed letter' }];
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

    case ACTIONS.END_TURN: {
      // Advance turn: tick cooldowns, generate new letters, apply pressure if needed
      const newGearStates = {};
      for (const [id, gs] of Object.entries(state.gearStates)) {
        newGearStates[id] = {
          ...gs,
          currentCooldown: Math.max(0, gs.currentCooldown - 1),
        };
      }

      const accuracy = 0.35 + (action.genAccuracy || 0);
      const newLetters = generateLetters(2, state.word.letters, accuracy);
      const trayMax = state.maxTraySize || TRAY_SIZE_DEFAULT;
      const space = trayMax - state.tray.length;
      const toAdd = newLetters.slice(0, space);

      const overflow = newLetters.length > space && space < 2;
      const pressureInc = overflow ? 1 : 0;
      const newPressure = state.pressure + pressureInc;
      const defeated = newPressure >= state.maxPressure;

      return {
        ...state,
        turn: state.turn + 1,
        gearStates: newGearStates,
        tray: [...state.tray, ...toAdd],
        pressure: newPressure,
        phase: defeated ? 'defeat' : 'active',
        log: overflow
          ? [...state.log, { type: 'overflow', message: 'Tray pressure building!' }]
          : state.log,
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

/**
 * Create initial run state from a starter kit and run map.
 * Kit and shared gear IDs are passed in to avoid circular imports.
 *
 * @param {Object} kit — starter kit object
 * @param {string[]} sharedGearIds — IDs of shared gear
 * @param {Array} runMap — generated run map
 */
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
    phase: 'room_choice', // 'room_choice' | 'combat' | 'archive' | 'shrine' | 'victory' | 'defeat'
    currentRoom: null,
    insightNextCombat: false, // from archive "clue-hint" reward
  };
}
