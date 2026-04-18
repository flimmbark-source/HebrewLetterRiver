/**
 * Sentence combat engine — pure state management via reducer.
 *
 * Adapted from the letter-based deepScriptEngine.js for sentence mode.
 * Instead of letter tiles placed into letter slots, the player places
 * word blocks into sentence word slots.
 *
 * Key differences from letter combat:
 *   - Tiles are whole words, not individual letters
 *   - Two generation buttons: pack words and connector words
 *   - Max tray size is 4 (word blocks)
 *   - No energy, no gear, no enemy intents — simpler than word mode
 *   - Victory when all word slots are correctly filled
 *   - Wrong placement returns the block to the tray (no curse mechanic)
 *
 * Reuses the weighted-generation bias concept from the letter engine.
 */

import { nanoid } from 'nanoid/non-secure';

// ─── Constants ──────────────────────────────────────────────

export const SENTENCE_TRAY_SIZE = 4;
const WORD_REPEAT_DECAY_FACTOR = 0.3;

// ─── Word block tile factory ────────────────────────────────

export function createWordTile(word, source = 'pack') {
  return {
    id: `wtile-${nanoid(8)}`,
    word,      // the word string in target script
    source,    // 'pack' | 'connector'
  };
}

// ─── Weighted word selection ────────────────────────────────

function pickWeightedWord(pool, productionCounts = {}) {
  if (!pool || pool.length === 0) return null;

  const weighted = pool.map(word => ({
    word,
    weight: Math.pow(WORD_REPEAT_DECAY_FACTOR, productionCounts[word] || 0),
  }));
  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight <= 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  let roll = Math.random() * totalWeight;
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.word;
  }
  return weighted[weighted.length - 1]?.word || pool[0];
}

// ─── Initial sentence combat state ─────────────────────────

/**
 * Create the initial state for a sentence combat encounter.
 *
 * @param {Object} encounter — a SentenceEncounter from sentenceGenerator
 * @param {Object} runState — expedition run state
 * @returns {Object} — sentence combat state
 */
export function createSentenceCombatState(encounter, runState) {
  if (!encounter) return null;

  const wordSlots = encounter.wordSlots.map((slot, index) => ({
    index,
    targetWord: slot.targetWord,
    meaning: slot.meaning,
    source: slot.source,
    correct: false,
    placedTile: null,
  }));

  // Start with 1 random word in tray
  const initialTiles = [];
  const neededWords = wordSlots.map(s => s.targetWord);
  const neededPackWords = wordSlots.filter(s => s.source === 'pack').map(s => s.targetWord);
  const neededConnectors = wordSlots.filter(s => s.source === 'connector').map(s => s.targetWord);

  // Give one useful starting word
  if (neededPackWords.length > 0) {
    const startWord = neededPackWords[Math.floor(Math.random() * neededPackWords.length)];
    initialTiles.push(createWordTile(startWord, 'pack'));
  } else if (neededConnectors.length > 0) {
    const startWord = neededConnectors[Math.floor(Math.random() * neededConnectors.length)];
    initialTiles.push(createWordTile(startWord, 'connector'));
  }

  return {
    encounterId: encounter.id,
    encounter,
    translation: encounter.translation,
    wordSlots,
    tray: initialTiles,
    maxTraySize: SENTENCE_TRAY_SIZE,
    health: runState?.health ?? 5,
    maxHealth: runState?.maxHealth ?? 5,
    selectedTileId: null,
    phase: 'active', // 'active' | 'victory' | 'defeat'
    log: [],
    wordProductionCounts: {},
    // The two word pools for the buttons
    packWordPool: encounter.packWordPool || [],
    connectorWordPool: encounter.connectorWordPool || [],
    // Metadata for the post-victory breakdown: native word → { transliteration, meaning }
    packWordInfo: encounter.packWordInfo || {},
    languageId: encounter.languageId || 'hebrew',
    wrongGuesses: 0,
  };
}

// ─── Reducer actions ────────────────────────────────────────

export const SENTENCE_ACTIONS = {
  SELECT_TILE: 'SELECT_TILE',
  PLACE_WORD: 'PLACE_WORD',
  GENERATE_WORD: 'GENERATE_WORD',
};

/**
 * Push a tile into the tray, dropping the oldest if full.
 * Returns the new tray and any overflow events.
 */
function pushWordToTray(tray, tile, maxSize) {
  const nextTray = [tile, ...tray];
  const overflow = [];
  while (nextTray.length > maxSize) {
    overflow.push(nextTray.pop());
  }
  return { tray: nextTray, overflow };
}

// ─── Sentence combat reducer ────────────────────────────────

export function sentenceCombatReducer(state, action) {
  if (!state || state.phase !== 'active') return state;

  switch (action.type) {
    case SENTENCE_ACTIONS.SELECT_TILE: {
      return {
        ...state,
        selectedTileId: state.selectedTileId === action.tileId ? null : action.tileId,
      };
    }

    case SENTENCE_ACTIONS.PLACE_WORD: {
      const { slotIndex } = action;
      const tileId = state.selectedTileId;
      if (!tileId) return state;

      const tile = state.tray.find(t => t.id === tileId);
      if (!tile) return state;

      const slot = state.wordSlots[slotIndex];
      if (!slot || slot.correct) return state;

      const isCorrect = tile.word === slot.targetWord;

      if (isCorrect) {
        const newSlots = [...state.wordSlots];
        newSlots[slotIndex] = { ...slot, correct: true, placedTile: tile };

        const newTray = state.tray.filter(t => t.id !== tileId);
        const allPlaced = newSlots.every(s => s.correct);

        return {
          ...state,
          wordSlots: newSlots,
          tray: newTray,
          selectedTileId: null,
          phase: allPlaced ? 'victory' : 'active',
          log: [...state.log, { type: 'correct', word: tile.word, slot: slotIndex }],
        };
      } else {
        // Wrong placement — just deselect, keep tile in tray
        // Increment wrong guesses (used for health penalty in expedition)
        const newWrongGuesses = state.wrongGuesses + 1;
        // Take 1 damage every 3 wrong guesses
        const shouldDamage = newWrongGuesses % 3 === 0;
        const newHealth = shouldDamage ? state.health - 1 : state.health;
        const defeated = newHealth <= 0;

        return {
          ...state,
          selectedTileId: null,
          wrongGuesses: newWrongGuesses,
          health: Math.max(0, newHealth),
          phase: defeated ? 'defeat' : 'active',
          log: [...state.log, {
            type: 'wrong',
            word: tile.word,
            slot: slotIndex,
            message: shouldDamage ? 'Too many wrong guesses — lost a heart!' : 'Wrong word for this slot',
          }],
        };
      }
    }

    case SENTENCE_ACTIONS.GENERATE_WORD: {
      const { source } = action; // 'pack' | 'connector'

      const pool = source === 'pack' ? state.packWordPool : state.connectorWordPool;
      if (!pool || pool.length === 0) return state;

      // Bias toward needed words (reusing the weighted generation concept)
      const neededWords = state.wordSlots
        .filter(s => !s.correct && s.source === source)
        .map(s => s.targetWord);

      let word;
      const boostCorrect = 0.5; // 50% chance to generate a needed word
      if (neededWords.length > 0 && Math.random() < boostCorrect) {
        word = pickWeightedWord(neededWords, state.wordProductionCounts);
      } else {
        word = pickWeightedWord(pool, state.wordProductionCounts);
      }

      if (!word) return state;

      const tile = createWordTile(word, source);
      const { tray, overflow } = pushWordToTray(state.tray, tile, state.maxTraySize);

      const newCounts = { ...state.wordProductionCounts };
      newCounts[word] = (newCounts[word] || 0) + 1;

      const overflowLog = overflow.length > 0
        ? [{ type: 'overflow', message: `${overflow[0].word} fell off the tray` }]
        : [];

      return {
        ...state,
        tray,
        selectedTileId: null,
        wordProductionCounts: newCounts,
        log: [...state.log, ...overflowLog],
      };
    }

    default:
      return state;
  }
}
