import { describe, it, expect, beforeEach } from 'vitest';
import {
  combatReducer,
  createCombatState,
  createRunState,
  createLetterTile,
  generateLetters,
  generateChoiceBundle,
  ACTIONS,
  MAX_PRESSURE_DEFAULT,
} from './deepScriptEngine.js';
import { getStarterKit, starterKits } from '../../data/deepScript/starterKits.js';
import { getSharedGear, gearDefinitions } from '../../data/deepScript/gear.js';
import { deepScriptWords, getWordsByDifficulty, getMinibossWords } from '../../data/deepScript/words.js';
import { generateRunMap, ROOM_TYPES } from '../../data/deepScript/roomGenerator.js';
import { generateDungeonFloor, CHAMBER_TYPES, DIRECTIONS, OPPOSITE, TURN_LEFT, TURN_RIGHT } from '../../data/deepScript/floorGenerator.js';
import { upgradeDefinitions, getRandomUpgrades } from '../../data/deepScript/upgrades.js';

// ─── Content Data Validation ────────────────────────────────

describe('Deep Script Content Data', () => {
  it('every word has matching hebrew and letters', () => {
    for (const word of deepScriptWords) {
      const joined = word.letters.join('');
      expect(joined).toBe(word.hebrew);
      expect(word.id).toBeTruthy();
      expect(word.english).toBeTruthy();
      expect(word.transliteration).toBeTruthy();
      expect(word.difficulty).toBeGreaterThanOrEqual(1);
      expect(word.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it('has at least 100 non-miniboss words', () => {
    const regular = deepScriptWords.filter(w => !w.isMiniboss);
    expect(regular.length).toBeGreaterThanOrEqual(100);
  });

  it('has at least 3 minibosses', () => {
    expect(getMinibossWords().length).toBeGreaterThanOrEqual(3);
  });

  it('has words across all 5 difficulty levels', () => {
    for (let d = 1; d <= 5; d++) {
      const words = deepScriptWords.filter(w => w.difficulty === d);
      expect(words.length).toBeGreaterThan(0);
    }
  });

  it('getWordsByDifficulty filters correctly', () => {
    const easy = getWordsByDifficulty(1, 2);
    for (const w of easy) {
      expect(w.difficulty).toBeGreaterThanOrEqual(1);
      expect(w.difficulty).toBeLessThanOrEqual(2);
      expect(w.isMiniboss).toBeFalsy();
    }
  });
});

describe('Starter Kits', () => {
  it('has exactly 3 kits', () => {
    expect(starterKits.length).toBe(3);
  });

  it('each kit has required fields', () => {
    for (const kit of starterKits) {
      expect(kit.id).toBeTruthy();
      expect(kit.name).toBeTruthy();
      expect(kit.health).toBeGreaterThan(0);
      expect(kit.traySize).toBeGreaterThan(0);
      expect(kit.satchelSize).toBeGreaterThan(0);
      expect(kit.gearIds.length).toBeGreaterThan(0);
    }
  });

  it('getStarterKit returns correct kit', () => {
    expect(getStarterKit('scribe').name).toBe('Scribe');
    expect(getStarterKit('nonexistent')).toBeNull();
  });
});

describe('Gear Definitions', () => {
  it('all kit gear IDs reference valid gear', () => {
    for (const kit of starterKits) {
      for (const gId of kit.gearIds) {
        const gear = gearDefinitions.find(g => g.id === gId);
        expect(gear).toBeTruthy();
      }
    }
  });

  it('shared gear has null kitId', () => {
    const shared = getSharedGear();
    expect(shared.length).toBeGreaterThan(0);
    for (const g of shared) {
      expect(g.kitId).toBeNull();
    }
  });
});

describe('Upgrades', () => {
  it('has multiple upgrade options', () => {
    expect(upgradeDefinitions.length).toBeGreaterThanOrEqual(5);
  });

  it('getRandomUpgrades returns correct count and filters owned', () => {
    const all = getRandomUpgrades(3);
    expect(all.length).toBe(3);

    const filtered = getRandomUpgrades(3, [upgradeDefinitions[0].id, upgradeDefinitions[1].id]);
    for (const u of filtered) {
      expect(u.id).not.toBe(upgradeDefinitions[0].id);
      expect(u.id).not.toBe(upgradeDefinitions[1].id);
    }
  });
});

// ─── Room/Run Generation ────────────────────────────────────

describe('Room Generation', () => {
  it('generates a run map with correct structure', () => {
    const map = generateRunMap(6);
    expect(map.length).toBe(7); // 6 rooms + 1 miniboss

    // Last node should be miniboss
    const last = map[map.length - 1];
    expect(last.choices.length).toBe(1);
    expect(last.choices[0].type).toBe(ROOM_TYPES.MINIBOSS);
  });

  it('each non-final node has 2-3 choices', () => {
    const map = generateRunMap(6);
    for (let i = 0; i < map.length - 1; i++) {
      expect(map[i].choices.length).toBeGreaterThanOrEqual(2);
      expect(map[i].choices.length).toBeLessThanOrEqual(3);
    }
  });

  it('every combat room has a wordId', () => {
    const map = generateRunMap(6);
    for (const node of map) {
      for (const room of node.choices) {
        if (room.type === ROOM_TYPES.COMBAT || room.type === ROOM_TYPES.MINIBOSS) {
          expect(room.wordId).toBeTruthy();
        }
      }
    }
  });
});

// ─── Dungeon Floor Generation ──────────────────────────────

describe('Dungeon Floor Generation', () => {
  it('generates a floor with connected chambers', () => {
    const floor = generateDungeonFloor();
    expect(floor.chambers.size).toBeGreaterThanOrEqual(7);
    expect(floor.startChamberId).toBeTruthy();
    expect(floor.bossChamberId).toBeTruthy();
  });

  it('entrance chamber is marked as visited', () => {
    const floor = generateDungeonFloor();
    const entrance = floor.chambers.get(floor.startChamberId);
    expect(entrance.visited).toBe(true);
    expect(entrance.type).toBe(CHAMBER_TYPES.ENTRANCE);
  });

  it('miniboss chamber exists and has a wordId', () => {
    const floor = generateDungeonFloor();
    const boss = floor.chambers.get(floor.bossChamberId);
    expect(boss.type).toBe(CHAMBER_TYPES.MINIBOSS);
    expect(boss.payload.wordId).toBeTruthy();
  });

  it('all chambers have valid exits pointing to existing chambers', () => {
    const floor = generateDungeonFloor();
    for (const [id, chamber] of floor.chambers) {
      for (const [dir, targetId] of Object.entries(chamber.exits)) {
        expect(DIRECTIONS).toContain(dir);
        expect(floor.chambers.has(targetId)).toBe(true);
        // Reciprocal check: target should have exit back
        const target = floor.chambers.get(targetId);
        expect(target.exits[OPPOSITE[dir]]).toBe(id);
      }
    }
  });

  it('combat chambers have wordIds', () => {
    const floor = generateDungeonFloor();
    for (const [, chamber] of floor.chambers) {
      if (chamber.type === CHAMBER_TYPES.COMBAT || chamber.type === CHAMBER_TYPES.MINIBOSS) {
        expect(chamber.payload.wordId).toBeTruthy();
      }
    }
  });

  it('chambers have interactables', () => {
    const floor = generateDungeonFloor();
    for (const [, chamber] of floor.chambers) {
      expect(chamber.interactables).toBeDefined();
      expect(chamber.interactables.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('turn helpers work correctly', () => {
    expect(TURN_LEFT['north']).toBe('west');
    expect(TURN_LEFT['west']).toBe('south');
    expect(TURN_RIGHT['north']).toBe('east');
    expect(TURN_RIGHT['east']).toBe('south');
  });
});

// ─── Combat Engine ──────────────────────────────────────────

describe('Combat State Creation', () => {
  const kit = getStarterKit('scribe');
  const sharedGearIds = getSharedGear().map(g => g.id);

  function makeRunState() {
    const map = generateRunMap(6);
    return createRunState(kit, sharedGearIds, map);
  }

  it('creates valid run state', () => {
    const run = makeRunState();
    expect(run.kitId).toBe('scribe');
    expect(run.health).toBe(kit.health);
    expect(run.gearIds.length).toBeGreaterThan(0);
    expect(run.phase).toBe('room_choice');
  });

  it('creates valid combat state from a word', () => {
    const run = makeRunState();
    const combat = createCombatState('ds-sefer', run);
    expect(combat).not.toBeNull();
    expect(combat.word.hebrew).toBe('ספר');
    expect(combat.answerTrack.length).toBe(3);
    expect(combat.tray.length).toBe(3); // initial generation
    expect(combat.pressure).toBe(0);
    expect(combat.phase).toBe('active');
  });

  it('answer track has correct target letters RTL', () => {
    const run = makeRunState();
    const combat = createCombatState('ds-shalom', run);
    expect(combat.answerTrack[0].targetLetter).toBe('ש');
    expect(combat.answerTrack[1].targetLetter).toBe('ל');
    expect(combat.answerTrack[2].targetLetter).toBe('ו');
    expect(combat.answerTrack[3].targetLetter).toBe('ם');
  });
});

describe('Combat Reducer', () => {
  let combat;
  let runState;

  beforeEach(() => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    runState = createRunState(kit, sharedGearIds, map);
    combat = createCombatState('ds-sefer', runState); // ספר
    // Give specific tiles for predictable testing
    combat.tray = [
      createLetterTile('ס', 'test'),
      createLetterTile('פ', 'test'),
      createLetterTile('ר', 'test'),
      createLetterTile('א', 'test'), // wrong letter
    ];
  });

  it('SELECT_TRAY_TILE selects and deselects', () => {
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    expect(state.selectedTrayTile).toBe(tileId);

    // Deselect
    state = combatReducer(state, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    expect(state.selectedTrayTile).toBeNull();
  });

  it('PLACE_LETTER with correct letter marks slot correct', () => {
    // Select ס (first letter of ספר)
    const tileId = combat.tray[0].id; // ס
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: 0 });

    expect(state.answerTrack[0].correct).toBe(true);
    expect(state.answerTrack[0].placedTile.letter).toBe('ס');
    expect(state.tray.find(t => t.id === tileId)).toBeUndefined();
    // Pressure should decrease (or stay at 0)
    expect(state.pressure).toBe(0);
  });

  it('PLACE_LETTER with wrong letter increases pressure', () => {
    const wrongTileId = combat.tray[3].id; // א (wrong)
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId: wrongTileId });
    state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: 0 });

    expect(state.answerTrack[0].correct).toBe(false);
    expect(state.answerTrack[0].placedTile).toBeNull();
    expect(state.pressure).toBe(1);
    // Wrong tile should be faded
    const fadedTile = state.tray.find(t => t.id === wrongTileId);
    expect(fadedTile.faded).toBe(true);
  });

  it('completing all slots sets phase to victory', () => {
    // Place all 3 letters correctly: ס פ ר
    let state = combat;
    const tiles = [combat.tray[0], combat.tray[1], combat.tray[2]]; // ס, פ, ר

    for (let i = 0; i < 3; i++) {
      state = combatReducer(state, { type: ACTIONS.SELECT_TRAY_TILE, tileId: tiles[i].id });
      state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: i });
    }

    expect(state.phase).toBe('victory');
  });

  it('max pressure sets phase to defeat', () => {
    let state = { ...combat, pressure: combat.maxPressure - 1 };
    const wrongTileId = state.tray[3].id;
    state = combatReducer(state, { type: ACTIONS.SELECT_TRAY_TILE, tileId: wrongTileId });
    state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: 0 });

    expect(state.phase).toBe('defeat');
  });

  it('STOW_LETTER moves tile from tray to satchel', () => {
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.STOW_LETTER });

    expect(state.tray.find(t => t.id === tileId)).toBeUndefined();
    expect(state.satchel.find(t => t.id === tileId)).toBeTruthy();
  });

  it('STOW_LETTER fails for faded tiles', () => {
    combat.tray[0] = { ...combat.tray[0], faded: true };
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.STOW_LETTER });

    // Should not have moved
    expect(state.satchel.length).toBe(0);
  });

  it('BURN_LETTER removes tile and generates new one(s)', () => {
    const tileId = combat.tray[3].id;
    const trayLenBefore = combat.tray.length;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.BURN_LETTER, burnBonus: false });

    expect(state.tray.find(t => t.id === tileId)).toBeUndefined();
    // Should have generated a replacement
    expect(state.tray.length).toBeGreaterThanOrEqual(trayLenBefore - 1);
  });

  it('END_TURN ticks cooldowns and generates letters', () => {
    // Set a gear on cooldown
    const gearId = Object.keys(combat.gearStates)[0];
    combat.gearStates[gearId] = { ...combat.gearStates[gearId], currentCooldown: 2 };

    const state = combatReducer(combat, { type: ACTIONS.END_TURN, genAccuracy: 0 });

    expect(state.turn).toBe(1);
    expect(state.gearStates[gearId].currentCooldown).toBe(1);
    expect(state.tray.length).toBeGreaterThanOrEqual(combat.tray.length);
  });

  it('PICK_CHOICE adds chosen letter to tray', () => {
    combat.choiceBundle = ['א', 'ב', 'ג'];
    const state = combatReducer(combat, { type: ACTIONS.PICK_CHOICE, letter: 'ב' });

    expect(state.choiceBundle).toBeNull();
    expect(state.tray.some(t => t.letter === 'ב')).toBe(true);
  });
});

// ─── Letter Generation ──────────────────────────────────────

describe('Letter Generation', () => {
  it('generateLetters returns correct count', () => {
    const tiles = generateLetters(5, ['א', 'ב', 'ג']);
    expect(tiles.length).toBe(5);
    for (const t of tiles) {
      expect(t.letter).toBeTruthy();
      expect(t.id).toBeTruthy();
    }
  });

  it('generateChoiceBundle returns options', () => {
    const bundle = generateChoiceBundle(3, ['ש', 'ל', 'ם']);
    expect(bundle.length).toBe(3);
  });

  it('generateChoiceBundle with bonus returns extra options', () => {
    const bundle = generateChoiceBundle(3, ['ש', 'ל', 'ם'], 1);
    expect(bundle.length).toBe(4);
  });
});

// ─── Pressure System ────────────────────────────────────────

describe('Pressure System', () => {
  it('correct placement reduces pressure', () => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    const run = createRunState(kit, sharedGearIds, map);
    let combat = createCombatState('ds-esh', run); // אש — 2 letters
    combat.tray = [createLetterTile('א'), createLetterTile('ש')];
    combat.pressure = 3;

    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId: combat.tray[0].id });
    state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: 0 });

    expect(state.pressure).toBe(2); // reduced by 1
  });
});
