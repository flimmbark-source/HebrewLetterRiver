# Deep Script — Dungeon Crawler Hebrew Learning Mode

## What is Deep Script?

Deep Script is a dungeon-crawler-inspired roguelike game mode where enemies appear as English/transliteration clues and the player defeats them by constructing the correct Hebrew word from individual letter tiles. It combines constrained resource management with Hebrew learning.

## Core Loop

1. **Choose a starter kit** (Scribe, Interpreter, or Rootkeeper)
2. **Navigate rooms** — pick from 2-3 room options each floor
3. **Combat rooms** — solve Hebrew word puzzles under pressure
4. **Archive rooms** — gain rewards (healing, letters, clue hints)
5. **Shrine rooms** — choose permanent upgrades
6. **Defeat the Guardian** (miniboss) to win the run

## Combat Model

### Spaces
- **Answer Track** — Fixed slots (RTL) matching the target Hebrew word
- **Tray** — Active workspace holding generated letters (default 6 slots)
- **Satchel** — Small reserve storage (default 3 slots)

### Core Verbs
- **Place** — Put a letter from Tray/Satchel into an Answer Track slot
- **Stow** — Move a Tray letter into Satchel for later
- **Burn** — Discard a letter to generate a new one
- **Invoke** — Spend letters to power gear abilities
- **End Turn** — Draw new letters, tick cooldowns

### Pressure System
- Wrong placements increase pressure (0→max, default max=5)
- Correct placements decrease pressure by 1
- At max pressure, the player loses the combat (loses 1 HP)
- Wrong letters become "faded" (limited utility)

## File Structure

```
src/
├── data/deepScript/
│   ├── words.js          — Word content (25 words + 1 miniboss)
│   ├── starterKits.js    — 3 starter kit definitions
│   ├── gear.js           — Gear/ability definitions
│   ├── upgrades.js       — Shrine upgrade definitions
│   └── roomGenerator.js  — Run map generation
├── components/deepScript/
│   ├── deepScriptEngine.js      — Combat reducer + state factories
│   ├── deepScriptEngine.test.js — 31 tests
│   ├── DeepScriptMode.jsx       — Top-level orchestrator
│   ├── KitSelectScreen.jsx      — Starter kit selection
│   ├── RoomChoiceScreen.jsx     — Room navigation
│   ├── CombatScreen.jsx         — Core combat gameplay
│   ├── ArchiveScreen.jsx        — Archive reward room
│   ├── ShrineScreen.jsx         — Upgrade selection room
│   ├── RunEndScreen.jsx         — Victory/defeat summary
│   ├── RunStatusBar.jsx         — Health/kit/progress HUD
│   ├── DeepScript.css           — All Deep Script styles
│   └── DEEP_SCRIPT.md           — This file
```

## How to Add New Words

Edit `src/data/deepScript/words.js`. Add an entry to the `deepScriptWords` array:

```js
{
  id: 'ds-your-word',       // unique ID, prefix with ds-
  hebrew: 'שלום',            // consonantal spelling, no niqqud
  letters: ['ש', 'ל', 'ו', 'ם'],  // individual letters, must join to hebrew
  transliteration: 'shalom',
  english: 'peace',
  difficulty: 3,             // 1-5
  tags: ['abstract'],        // category tags
  root: 'שלם',              // optional 3-letter root
}
```

## How to Add New Starter Kits

Edit `src/data/deepScript/starterKits.js`. Add to the `starterKits` array:

```js
{
  id: 'your-kit',
  name: 'Kit Name',
  icon: '🎯',
  description: 'Short description',
  flavor: 'Longer flavor text',
  health: 5,
  traySize: 6,
  satchelSize: 3,
  gearIds: ['gear-id-1', 'gear-id-2'],  // must exist in gear.js
  passives: { /* custom passive keys */ },
}
```

## How to Add New Gear

Edit `src/data/deepScript/gear.js`. Add to `gearDefinitions`:

```js
{
  id: 'your-gear',
  name: 'Gear Name',
  icon: '⚡',
  description: 'What it does',
  type: 'generate',  // generate | duplicate | reveal | choice | transform | utility
  invokeCost: 0,     // letters to spend
  cooldown: 2,       // turns between uses
  uses: -1,          // -1 = unlimited
  kitId: 'scribe',   // or null for shared
}
```

Then add the effect logic in `deepScriptEngine.js` under the `USE_GEAR` action handler.

## How to Add New Room Types

1. Add the type constant in `roomGenerator.js` → `ROOM_TYPES`
2. Add display info in `getRoomDisplayInfo()`
3. Add room generation logic in `generateRunMap()`
4. Create a new screen component (e.g., `NewRoomScreen.jsx`)
5. Wire it into `DeepScriptMode.jsx`'s room routing logic

## Known MVP Limitations

- No meta-progression between runs (in-session only)
- No niqqud/vowel marks
- 25 regular words + 1 miniboss (enough for demo, not a full curriculum)
- No animation/sound effects (can reuse existing `celebration.js` and TTS)
- The "Satchel Hook" gear uses the retrieve action rather than a custom mechanic
- Archive "free-letter" and "insight" rewards are simplified
- No difficulty scaling based on player performance
- Room generation is semi-random, not fully curated paths

## Architecture Decisions

- **useReducer for combat state** — Pure reducer keeps logic testable and predictable
- **Data files separate from components** — Words, kits, gear, upgrades are all in `/data/deepScript/`
- **No new Context providers** — Run state is managed locally in `DeepScriptMode.jsx`
- **CSS follows existing BEM-inspired patterns** — All classes prefixed with `ds-`
- **Entry point via Bridge Builder setup** — No new route needed, keeps nav simple
- **No new dependencies added** — Uses only existing React + project patterns

## Next Best Expansion Steps

1. **More words** — Expand to 100+ words with difficulty curve
2. **Sound effects** — Tap/place/burn sounds using Web Audio API
3. **Animations** — Letter placement, pressure changes, victory celebrations
4. **Meta-progression** — Track words learned across runs, unlock new kits
5. **More room types** — Shop, puzzle, event rooms
6. **More gear** — Expand each kit to 3-4 unique abilities
7. **SRS integration** — Feed combat results into the existing SRS engine
8. **Multiple floors** — Chain multiple bosses with increasing difficulty
9. **Niqqud mode** — Advanced mode with vowel marks
10. **Multiplayer/leaderboard** — Compare run scores
