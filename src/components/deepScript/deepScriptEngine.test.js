import { describe, it, expect, beforeEach } from 'vitest';
import {
  combatReducer,
  createCombatState,
  createRunState,
  createLetterTile,
  generateLetters,
  generateChoiceBundle,
  ACTIONS,
  MAX_ENERGY_DEFAULT,
  INTENT_TYPES,
  ENEMY_TYPES,
  rollEnemyIntent,
  getIntentDisplay,
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
      expect(kit.maxEnergy).toBeGreaterThan(0);
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

  it('all gear has energyCost and tileSockets fields', () => {
    for (const gear of gearDefinitions) {
      expect(gear.energyCost).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(gear.tileSockets)).toBe(true);
    }
  });

  it('scribe knife is generate-random not generate', () => {
    const knife = gearDefinitions.find(g => g.id === 'scribe-knife');
    expect(knife.type).toBe('generate-random');
  });

  it('ward stone exists as shared defensive gear', () => {
    const ward = gearDefinitions.find(g => g.id === 'ward-stone');
    expect(ward).toBeTruthy();
    expect(ward.type).toBe('defend');
    expect(ward.kitId).toBeNull();
  });

  it('inscription quill exists as shared precision gear', () => {
    const quill = gearDefinitions.find(g => g.id === 'inscription-quill');
    expect(quill).toBeTruthy();
    expect(quill.type).toBe('generate-exact');
    expect(quill.energyCost).toBe(3);
    expect(quill.tileSockets.length).toBe(1);
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
    expect(map.length).toBe(7);
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
    expect(run.maxEnergy).toBe(kit.maxEnergy);
    expect(run.gearIds.length).toBeGreaterThan(0);
    expect(run.phase).toBe('room_choice');
  });

  it('creates valid combat state from a word', () => {
    const run = makeRunState();
    const combat = createCombatState('ds-sefer', run);
    expect(combat).not.toBeNull();
    expect(combat.word.hebrew).toBe('ספר');
    expect(combat.answerTrack.length).toBe(3);
    expect(combat.tray.length).toBe(3);
    expect(combat.phase).toBe('active');
    expect(combat.energy).toBe(kit.maxEnergy);
    expect(combat.maxEnergy).toBe(kit.maxEnergy);
    expect(combat.enemyIntent).toBeTruthy();
    expect(combat.warded).toBe(false);
    expect(combat.enemyType).toBeTruthy();
    expect(combat.enemyDef).toBeTruthy();
  });

  it('combat state has gear states with sockets', () => {
    const run = makeRunState();
    const combat = createCombatState('ds-sefer', run);
    for (const gearId of run.gearIds) {
      const gs = combat.gearStates[gearId];
      expect(gs).toBeTruthy();
      expect(Array.isArray(gs.sockets)).toBe(true);
    }
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

    state = combatReducer(state, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    expect(state.selectedTrayTile).toBeNull();
  });

  it('PLACE_LETTER with correct letter marks slot correct', () => {
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: 0 });

    expect(state.answerTrack[0].correct).toBe(true);
    expect(state.answerTrack[0].placedTile.letter).toBe('ס');
    expect(state.tray.find(t => t.id === tileId)).toBeUndefined();
  });

  it('PLACE_LETTER with wrong letter curses the tile', () => {
    const wrongTileId = combat.tray[3].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId: wrongTileId });
    state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: 0 });

    expect(state.answerTrack[0].correct).toBe(false);
    expect(state.answerTrack[0].placedTile).toBeNull();
    const cursedTile = state.tray.find(t => t.id === wrongTileId);
    expect(cursedTile.cursed).toBe(true);
  });

  it('PLACE_LETTER on locked slot does nothing', () => {
    combat.answerTrack[0] = { ...combat.answerTrack[0], locked: true };
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: 0 });
    expect(state.answerTrack[0].correct).toBe(false);
    expect(state.tray.length).toBe(combat.tray.length);
  });

  it('completing all slots sets phase to victory', () => {
    let state = combat;
    const tiles = [combat.tray[0], combat.tray[1], combat.tray[2]];

    for (let i = 0; i < 3; i++) {
      state = combatReducer(state, { type: ACTIONS.SELECT_TRAY_TILE, tileId: tiles[i].id });
      state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: i });
    }

    expect(state.phase).toBe('victory');
  });

  it('END_TURN cursed tiles deal damage', () => {
    combat.tray = [
      createLetterTile('א', 'test', true),  // cursed
      createLetterTile('ב', 'test', true),  // cursed
      createLetterTile('ג', 'test'),         // clean
    ];
    combat.health = 5;
    combat.enemyIntent = { type: INTENT_TYPES.BURN_TILE, value: 1 }; // burns 1 clean tile
    // After burn: 2 cursed remain → 2 damage
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    expect(state.health).toBe(3);
  });

  it('END_TURN cursed tile damage can cause defeat', () => {
    combat.tray = [
      createLetterTile('א', 'test', true),
      createLetterTile('ב', 'test', true),
    ];
    combat.health = 1;
    combat.enemyIntent = { type: INTENT_TYPES.SLOT_LOCK, value: 1 };
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    expect(state.phase).toBe('defeat');
    expect(state.health).toBe(0);
  });

  it('STOW_LETTER moves tile from tray to satchel', () => {
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.STOW_LETTER });

    expect(state.tray.find(t => t.id === tileId)).toBeUndefined();
    expect(state.satchel.find(t => t.id === tileId)).toBeTruthy();
  });

  it('STOW_LETTER works for cursed tiles', () => {
    combat.tray[0] = { ...combat.tray[0], cursed: true };
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.STOW_LETTER });

    expect(state.satchel.length).toBe(1);
    expect(state.satchel[0].cursed).toBe(true);
  });

  it('END_TURN ticks cooldowns and executes enemy intent', () => {
    const gearId = Object.keys(combat.gearStates)[0];
    combat.gearStates[gearId] = { ...combat.gearStates[gearId], currentCooldown: 2 };
    // Force a known intent that doesn't change tray count
    combat.enemyIntent = { type: INTENT_TYPES.SLOT_LOCK, value: 1 };

    const state = combatReducer(combat, { type: ACTIONS.END_TURN });

    expect(state.turn).toBe(1);
    expect(state.gearStates[gearId].currentCooldown).toBe(1);
    // New intent should be rolled
    expect(state.enemyIntent).toBeTruthy();
    expect(state.energy).toBe(0); // energy depleted after END_TURN
  });

  it('END_TURN does not generate free tiles', () => {
    combat.enemyIntent = { type: INTENT_TYPES.SLOT_LOCK, value: 1 };
    const trayBefore = combat.tray.length;
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    // No free tile generation — tray should not grow (no cursed tiles = no damage)
    expect(state.tray.length).toBeLessThanOrEqual(trayBefore);
  });

  it('PICK_CHOICE adds chosen letter to tray', () => {
    combat.choiceBundle = ['א', 'ב', 'ג'];
    const state = combatReducer(combat, { type: ACTIONS.PICK_CHOICE, letter: 'ב' });

    expect(state.choiceBundle).toBeNull();
    expect(state.tray.some(t => t.letter === 'ב')).toBe(true);
  });
});

// ─── Energy System ──────────────────────────────────────────

describe('Energy System', () => {
  let combat;
  let runState;

  beforeEach(() => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    runState = createRunState(kit, sharedGearIds, map);
    combat = createCombatState('ds-sefer', runState);
    combat.maxTraySize = runState.traySize;
    combat.maxSatchelSize = runState.satchelSize;
  });

  it('combat starts with full energy', () => {
    expect(combat.energy).toBe(combat.maxEnergy);
    expect(combat.maxEnergy).toBe(runState.maxEnergy);
  });

  it('START_TURN refills energy', () => {
    combat.energy = 0;
    const state = combatReducer(combat, { type: ACTIONS.START_TURN });
    expect(state.energy).toBe(combat.maxEnergy);
  });

  it('START_TURN clears slot locks', () => {
    combat.answerTrack[0] = { ...combat.answerTrack[0], locked: true };
    const state = combatReducer(combat, { type: ACTIONS.START_TURN });
    expect(state.answerTrack[0].locked).toBe(false);
  });

  it('USE_GEAR spends energy', () => {
    combat.energy = 3;
    const state = combatReducer(combat, {
      type: ACTIONS.USE_GEAR,
      gearId: 'scribe-knife',
      runState,
    });
    // Scribe knife costs 2 energy
    expect(state.energy).toBe(1);
  });

  it('USE_GEAR fails with insufficient energy', () => {
    combat.energy = 0;
    const state = combatReducer(combat, {
      type: ACTIONS.USE_GEAR,
      gearId: 'scribe-knife',
      runState,
    });
    // Should not change — not enough energy
    expect(state.energy).toBe(0);
    expect(state.tray.length).toBe(combat.tray.length);
  });
});

// ─── Enemy Intent System ────────────────────────────────────

describe('Enemy Intent', () => {
  let combat;
  let runState;

  beforeEach(() => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    runState = createRunState(kit, sharedGearIds, map);
    combat = createCombatState('ds-sefer', runState);
    combat.maxTraySize = runState.traySize;
    combat.maxSatchelSize = runState.satchelSize;
    combat.tray = [
      createLetterTile('ס', 'test'),
      createLetterTile('פ', 'test'),
      createLetterTile('ר', 'test'),
    ];
  });

  it('combat starts with an enemy intent', () => {
    expect(combat.enemyIntent).toBeTruthy();
    expect(combat.enemyIntent.type).toBeTruthy();
  });

  it('rollEnemyIntent returns valid intent for each archetype', () => {
    for (const type of Object.values(ENEMY_TYPES)) {
      const intent = rollEnemyIntent(0, false, type);
      expect(intent.type).toBeTruthy();
      expect(Object.values(INTENT_TYPES)).toContain(intent.type);
    }
  });

  it('getIntentDisplay returns icon, label, and value', () => {
    const display = getIntentDisplay({ type: INTENT_TYPES.CURSE_TILE, value: 2 });
    expect(display.icon).toBeTruthy();
    expect(display.label).toBeTruthy();
    expect(display.value).toBe(2);
  });

  it('END_TURN executes curse_tile intent', () => {
    combat.enemyIntent = { type: INTENT_TYPES.CURSE_TILE, value: 1 };
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    const cursedCount = state.tray.filter(t => t.cursed).length;
    expect(cursedCount).toBe(1);
  });

  it('END_TURN executes spawn_cursed intent', () => {
    combat.enemyIntent = { type: INTENT_TYPES.SPAWN_CURSED, value: 1 };
    combat.maxTraySize = 10;
    const trayBefore = combat.tray.length;
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    expect(state.tray.length).toBeGreaterThan(trayBefore);
    const spawned = state.tray.filter(t => t.source === 'spawned');
    expect(spawned.length).toBeGreaterThan(0);
    expect(spawned.every(t => t.cursed)).toBe(true);
  });

  it('END_TURN executes burn_tile intent', () => {
    combat.enemyIntent = { type: INTENT_TYPES.BURN_TILE, value: 1 };
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    expect(state.tray.length).toBe(2); // one removed
  });

  it('intent value scales: curse_tile ×2 curses two tiles', () => {
    combat.enemyIntent = { type: INTENT_TYPES.CURSE_TILE, value: 2 };
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    const cursedCount = state.tray.filter(t => t.cursed).length;
    expect(cursedCount).toBe(2);
  });

  it('END_TURN executes slot_lock intent', () => {
    combat.enemyIntent = { type: INTENT_TYPES.SLOT_LOCK, value: 1 };
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    const lockedCount = state.answerTrack.filter(s => s.locked).length;
    expect(lockedCount).toBe(1);
  });

  it('ward blocks enemy intent', () => {
    combat.enemyIntent = { type: INTENT_TYPES.CURSE_TILE, value: 1 };
    combat.warded = true;
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    const cursedCount = state.tray.filter(t => t.cursed).length;
    expect(cursedCount).toBe(0); // warded = blocked
    expect(state.warded).toBe(false);
  });

  it('END_TURN rolls new intent after execution', () => {
    combat.enemyIntent = { type: INTENT_TYPES.SLOT_LOCK, value: 1 };
    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    expect(state.enemyIntent).toBeTruthy();
  });
});

// ─── Tile Sockets ───────────────────────────────────────────

describe('Tile Sockets', () => {
  let combat;
  let runState;

  beforeEach(() => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    runState = createRunState(kit, sharedGearIds, map);
    combat = createCombatState('ds-sefer', runState);
    combat.maxTraySize = runState.traySize;
    combat.maxSatchelSize = runState.satchelSize;
    combat.tray = [
      createLetterTile('ס', 'test'),
      createLetterTile('פ', 'test'),
    ];
  });

  it('SOCKET_TILE moves tile from tray to gear socket', () => {
    // echo-mirror has 1 required socket
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.SOCKET_TILE, gearId: 'echo-mirror', socketIndex: 0 });

    expect(state.gearStates['echo-mirror'].sockets[0].tileId).toBe(tileId);
    expect(state.gearStates['echo-mirror'].sockets[0].tileLetter).toBe('ס');
    expect(state.tray.find(t => t.id === tileId)).toBeUndefined();
    expect(state.selectedTrayTile).toBeNull();
  });

  it('UNSOCKET_TILE returns tile to tray', () => {
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.SOCKET_TILE, gearId: 'echo-mirror', socketIndex: 0 });

    state = combatReducer(state, { type: ACTIONS.UNSOCKET_TILE, gearId: 'echo-mirror', socketIndex: 0 });

    expect(state.gearStates['echo-mirror'].sockets[0].tileId).toBeNull();
    // Tile is returned to tray (as a new tile with same letter)
    expect(state.tray.some(t => t.letter === 'ס')).toBe(true);
  });

  it('USE_GEAR with sockets consumes socketed tile', () => {
    // Socket a tile into echo-mirror, then use it
    const tileId = combat.tray[0].id;
    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId });
    state = combatReducer(state, { type: ACTIONS.SOCKET_TILE, gearId: 'echo-mirror', socketIndex: 0 });

    state = combatReducer(state, {
      type: ACTIONS.USE_GEAR,
      gearId: 'echo-mirror',
      runState,
    });

    // Socket should be cleared after use
    expect(state.gearStates['echo-mirror'].sockets[0].tileId).toBeNull();
    // Tray should contain the original + duplicate (echo mirror returns both)
    expect(state.tray.some(t => t.letter === 'ס')).toBe(true);
  });

  it('USE_GEAR fails if required sockets are empty', () => {
    // echo-mirror needs a tile socketed
    const stateBefore = { ...combat };
    const state = combatReducer(combat, {
      type: ACTIONS.USE_GEAR,
      gearId: 'echo-mirror',
      runState,
    });

    // Should not have activated — energy unchanged
    expect(state.energy).toBe(stateBefore.energy);
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

// ─── Cursed Tile Damage System ───────────────────────────────

describe('Cursed Tile Damage', () => {
  it('no cursed tiles means no damage on END_TURN', () => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    const run = createRunState(kit, sharedGearIds, map);
    let combat = createCombatState('ds-esh', run);
    combat.tray = [createLetterTile('א'), createLetterTile('ש')];
    combat.health = 3;
    combat.enemyIntent = { type: INTENT_TYPES.SLOT_LOCK, value: 1 };

    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    expect(state.health).toBe(3); // no cursed tiles, no damage
  });

  it('cursed tiles deal 1 damage each on END_TURN', () => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    const run = createRunState(kit, sharedGearIds, map);
    let combat = createCombatState('ds-esh', run);
    combat.tray = [
      createLetterTile('א', 'test', true),
      createLetterTile('ש', 'test', true),
      createLetterTile('ב', 'test'),
    ];
    combat.health = 5;
    combat.enemyIntent = { type: INTENT_TYPES.SLOT_LOCK, value: 1 };

    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    expect(state.health).toBe(3); // 2 cursed tiles → 2 damage
  });

  it('amplifier passive chain-curses on wrong guess', () => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    const run = createRunState(kit, sharedGearIds, map);
    // Use a word with amplifier enemy type
    let combat = createCombatState('ds-ruach', run); // wind — amplifier
    combat.tray = [
      createLetterTile('ב', 'test'), // wrong letter
      createLetterTile('ג', 'test'), // potential chain target
      createLetterTile('ד', 'test'), // potential chain target
    ];

    let state = combatReducer(combat, { type: ACTIONS.SELECT_TRAY_TILE, tileId: combat.tray[0].id });
    state = combatReducer(state, { type: ACTIONS.PLACE_LETTER, slotIndex: 0 });

    const cursedCount = state.tray.filter(t => t.cursed).length;
    // Wrong guess curses the placed tile (1) + amplifier chain-curse (1) = 2
    expect(cursedCount).toBe(2);
  });
});

// ─── Ward Stone (Defensive Ability) ─────────────────────────

describe('Ward Stone', () => {
  let combat;
  let runState;

  beforeEach(() => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    runState = createRunState(kit, sharedGearIds, map);
    combat = createCombatState('ds-sefer', runState);
    combat.maxTraySize = runState.traySize;
    combat.maxSatchelSize = runState.satchelSize;
    combat.tray = [
      createLetterTile('ס', 'test'),
      createLetterTile('פ', 'test'),
    ];
  });

  it('USE_GEAR ward-stone sets warded flag', () => {
    const state = combatReducer(combat, {
      type: ACTIONS.USE_GEAR,
      gearId: 'ward-stone',
      runState,
    });
    expect(state.warded).toBe(true);
    expect(state.energy).toBe(combat.energy - 1);
  });

  it('warded state blocks curse intent on END_TURN', () => {
    combat.warded = true;
    combat.enemyIntent = { type: INTENT_TYPES.CURSE_TILE, value: 1 };

    const state = combatReducer(combat, { type: ACTIONS.END_TURN });
    const cursedCount = state.tray.filter(t => t.cursed).length;
    expect(cursedCount).toBe(0); // blocked
    expect(state.warded).toBe(false); // consumed
  });
});

// ─── Satchel Auto-Fill ─────────────────────────────────────

describe('Satchel Auto-Fill', () => {
  let combat;
  let runState;

  beforeEach(() => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    runState = createRunState(kit, sharedGearIds, map);
    combat = createCombatState('ds-sefer', runState);
    combat.maxTraySize = runState.traySize;
    combat.maxSatchelSize = runState.satchelSize;
  });

  it('START_TURN auto-stows tray tiles to satchel', () => {
    combat.tray = [
      createLetterTile('א', 'test'),
      createLetterTile('ב', 'test'),
    ];
    combat.satchel = [];
    const state = combatReducer(combat, { type: ACTIONS.START_TURN });
    expect(state.satchel.length).toBe(2);
    expect(state.tray.length).toBe(0);
  });

  it('START_TURN respects satchel capacity when auto-filling', () => {
    combat.tray = [
      createLetterTile('א', 'test'),
      createLetterTile('ב', 'test'),
      createLetterTile('ג', 'test'),
      createLetterTile('ד', 'test'),
    ];
    combat.satchel = [createLetterTile('ה', 'test')];
    // satchel capacity is 3, already has 1, so only 2 more should fit
    const state = combatReducer(combat, { type: ACTIONS.START_TURN });
    expect(state.satchel.length).toBe(3);
    expect(state.tray.length).toBe(0);
  });

  it('START_TURN auto-stows cursed tiles too', () => {
    combat.tray = [
      createLetterTile('א', 'test', true), // cursed
      createLetterTile('ב', 'test'),
    ];
    combat.satchel = [];
    const state = combatReducer(combat, { type: ACTIONS.START_TURN });
    expect(state.satchel.length).toBe(2); // both stowed, including cursed
  });

  it('START_TURN logs auto-stow message', () => {
    combat.tray = [createLetterTile('א', 'test')];
    combat.satchel = [];
    const state = combatReducer(combat, { type: ACTIONS.START_TURN });
    expect(state.log.length).toBe(1);
    expect(state.log[0].message).toContain('Auto-stowed');
  });
});

// ─── Ash Brazier Escalating Cost ───────────────────────────

describe('Ash Brazier Escalating Cost', () => {
  let combat;
  let runState;

  beforeEach(() => {
    const kit = getStarterKit('scribe');
    const sharedGearIds = getSharedGear().map(g => g.id);
    const map = generateRunMap(6);
    runState = createRunState(kit, sharedGearIds, map);
    combat = createCombatState('ds-sefer', runState);
    combat.maxTraySize = runState.traySize;
    combat.maxSatchelSize = runState.satchelSize;
    combat.energy = 10; // plenty of energy for testing
    combat.maxEnergy = 10;
  });

  it('ash brazier has no cooldown', () => {
    // Socket a tile first
    const tile = createLetterTile('א', 'test');
    combat.tray = [tile];
    combat.selectedTrayTile = tile.id;
    let state = combatReducer(combat, { type: ACTIONS.SOCKET_TILE, gearId: 'ash-brazier', socketIndex: 0 });

    // Use it
    state = combatReducer(state, { type: ACTIONS.USE_GEAR, gearId: 'ash-brazier', runState });
    expect(state.gearStates['ash-brazier'].currentCooldown).toBe(0);
  });

  it('ash brazier costs 1 energy on first use, 2 on second', () => {
    // First use
    const tile1 = createLetterTile('א', 'test');
    combat.tray = [tile1];
    combat.selectedTrayTile = tile1.id;
    let state = combatReducer(combat, { type: ACTIONS.SOCKET_TILE, gearId: 'ash-brazier', socketIndex: 0 });
    state = combatReducer(state, { type: ACTIONS.USE_GEAR, gearId: 'ash-brazier', runState });
    expect(state.energy).toBe(9); // 10 - 1
    expect(state.gearStates['ash-brazier'].turnUses).toBe(1);

    // Second use
    const tile2 = createLetterTile('ב', 'test');
    state.tray = [...state.tray, tile2];
    state.selectedTrayTile = tile2.id;
    state = combatReducer(state, { type: ACTIONS.SOCKET_TILE, gearId: 'ash-brazier', socketIndex: 0 });
    state = combatReducer(state, { type: ACTIONS.USE_GEAR, gearId: 'ash-brazier', runState });
    expect(state.energy).toBe(7); // 9 - 2
    expect(state.gearStates['ash-brazier'].turnUses).toBe(2);
  });

  it('ash brazier turnUses resets on START_TURN', () => {
    combat.gearStates['ash-brazier'].turnUses = 3;
    const state = combatReducer(combat, { type: ACTIONS.START_TURN });
    expect(state.gearStates['ash-brazier'].turnUses).toBe(0);
  });

  it('ash brazier fails if escalated cost exceeds energy', () => {
    combat.energy = 2;
    combat.gearStates['ash-brazier'].turnUses = 2; // cost would be 1+2=3
    const tile = createLetterTile('א', 'test');
    combat.tray = [tile];
    combat.selectedTrayTile = tile.id;
    let state = combatReducer(combat, { type: ACTIONS.SOCKET_TILE, gearId: 'ash-brazier', socketIndex: 0 });
    state = combatReducer(state, { type: ACTIONS.USE_GEAR, gearId: 'ash-brazier', runState });
    // Should not have changed energy — cost 3 > energy 2
    expect(state.energy).toBe(2);
  });
});
