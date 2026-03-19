# Combat Redesign: Cursed Tiles + Enemy Archetypes

## Summary of Changes

Replace the pressure/tension damage system with **cursed tile damage** as the core loop:
1. Wrong guess → tile becomes **cursed** (still placeable)
2. End of turn → player takes **1 damage per cursed tile** in tray
3. Players manage cursed tiles through existing consume abilities (burn, salvage, transform)
4. Complete the word or die to curse damage

Add **3 enemy archetypes** that interact with this loop by adding threats (never removing player tools):
- **Corruptor** — curses 1 clean tray tile per turn
- **Spawner** — adds junk cursed tiles to your tray
- **Amplifier** — wrong guesses chain-curse additional tiles

---

## Design Intent: Class Identity & Enemy Matchups

### What Makes Each Class's Combat *Feel* Different

The core question for class design: **what is the player's mental model during combat?**

**Scribe — "I am a factory."**
Generate, generate, generate. Place when confident. The Scribe player's anxiety is *tray overflow* — too many tiles, not enough slots. Their turn planning is: "Which abilities generate the most tiles per energy? Do I have space?"

**Interpreter — "I am a gambler with insurance."**
Place aggressively, accept some wrong guesses, Salvage the cursed tiles back. The Interpreter's anxiety is *curse accumulation* — each wrong guess is calculated risk. Their turn planning is: "How many curses can I absorb? Is it worth guessing now to create salvage fuel?"

**Rootkeeper — "I am a farmer."**
Plant seeds, transform tiles, harvest next turn. The Rootkeeper's anxiety is *timing* — seeds need to survive until next turn, Tongs have a cooldown. Their turn planning is: "What's the enemy doing next? Is it safe to invest in seeds? Should I Tongs now or wait?"

### Each Class's Answer to "What Do I Do With Cursed Tiles?"

- **Scribe** — Outpace the curses. Generate so many tiles that you can afford to guess aggressively. Wrong guesses hurt, but you'll find the right letter eventually through volume. Against The Corruptor, Scribe races — against The Amplifier, Scribe struggles (volume means more wrong guesses means more chain-curses).

- **Interpreter** — Recycle the curses. Salvage turns cursed tiles into fuel. The Lantern literally feeds on cursed tiles. Against The Corruptor, Interpreter thrives (more cursed tiles = more salvage material). Against The Spawner, Interpreter also thrives (junk cursed tiles are just more fuel).

- **Rootkeeper** — Avoid the curses. Seeds and Transform let you be more precise with fewer guesses. Plant a seed, Transform a tile into something useful, place with confidence. Against The Amplifier, Rootkeeper thrives (fewer wrong guesses = fewer chain-curses). Against The Spawner, Rootkeeper struggles (precision doesn't help when junk floods your tray).

### Design Constraint

> **Enemies add threats. They never remove player tools.**

Enemies interact with the cursed tile economy by adding problems — more curses, junk tiles, chain reactions. No enemy disables gear, hides reveals, or takes away the player's learning tools. The word is always the honest puzzle. The enemy is the clock.

---

## Step-by-step Implementation

### Step 1: Create `src/data/deepScript/enemies.js` — Enemy archetype definitions

Define 3 enemy types with:
- `id`, `name`, `icon`, `description`
- `intentPattern` — what the enemy does each turn (e.g., Corruptor always curses 1 tile)
- `passive` — ongoing modifier (e.g., Amplifier's chain-curse on wrong guess)
- `minibossVariant` — whether this type can appear as a miniboss (with enhanced values)

Each word in `words.js` will get an optional `enemyType` field. Words without one default to `'corruptor'` (the baseline). Miniboss words get their own enemy type assignments.

### Step 2: Rename `faded` → `cursed` across the codebase

Files to change:
- **`deepScriptEngine.js`**:
  - `createLetterTile()` — rename `faded` param/property to `cursed`
  - `PLACE_LETTER` action — wrong placement sets `cursed: true` instead of `faded: true`
  - `STOW_LETTER` — cursed tiles CAN be stowed (remove the `!tile.faded` guard), since they're still usable
  - `START_TURN` — update auto-stow filter from `!t.faded` to `!t.cursed` (or remove the filter entirely since cursed tiles are valid)
  - `executeEnemyIntent` BURN_TILE/CORRUPT_TILE — update `!t.faded` filters to `!t.cursed`
  - `USE_GEAR` salvage case — update `t.faded` references to `t.cursed`
- **`CombatScreen.jsx`**:
  - Tile CSS class: `ds-inv-tile--faded` → `ds-inv-tile--cursed`
  - `canStow` logic: remove the `!selectedTrayTile.faded` check (cursed tiles can be stowed)
- **`DeepScript.css`**:
  - `.ds-inv-tile--faded` → `.ds-inv-tile--cursed`
  - Restyle: instead of washed-out/transparent, use a threatening visual (dark glow, red tint, cracked appearance)
- **`gear.js`**:
  - Update Lantern's `detailedDescription` from "Un-fade a faded tile" to something like "Consume a cursed tile"
- **`DEEP_SCRIPT.md`**: Update documentation references

### Step 3: Remove the pressure/tension system

Files to change:
- **`deepScriptEngine.js`**:
  - Remove `MAX_PRESSURE_DEFAULT` constant
  - Remove `pressure` and `maxPressure` from `createCombatState()`
  - Remove `checkTensionOverflow()` function entirely
  - Remove pressure increment/decrement from `PLACE_LETTER` (correct placements no longer reduce pressure; wrong placements no longer increase it — the cursed tile IS the punishment)
  - Remove `PRESSURE` from `INTENT_TYPES` and `INTENT_DEFS`
  - Remove pressure-related entries from `rollEnemyIntent()`
  - Remove `pressureRiseRate` from miniboss modifiers
  - Remove `executeEnemyIntent` PRESSURE case
- **`CombatScreen.jsx`**:
  - Remove the entire pressure HUD section (`ds-hud-pressure`)
  - Remove `pressureCritical` state and effect
  - Remove `playPressureWarning` import/usage
- **`DeepScript.css`**:
  - Remove `.ds-hud-pressure*` styles and `ds-pressure-shake` animation
  - Remove `.ds-intent-banner--pressure` style
- **`starterKits.js`**:
  - Remove `reducedPressurePenalty` passive from Interpreter
- **`upgrades.js`**:
  - Remove "Calm Focus" (maxPressure +1) upgrade — no longer relevant

### Step 4: Add end-of-turn cursed tile damage

In **`deepScriptEngine.js`**, `END_TURN` action:
- After enemy intent executes, count cursed tiles in tray
- Deal `cursedCount` damage to player health
- Log the damage: "Cursed tiles deal {n} damage!"
- Check for defeat (health <= 0)

### Step 5: Implement enemy archetypes in the intent system

Replace the current generic `rollEnemyIntent()` with archetype-driven behavior:

- **`deepScriptEngine.js`**:
  - Import enemy definitions from `enemies.js`
  - `createCombatState()` — accept `enemyType` and store it in state
  - New intent types:
    - `CURSE_TILE` — curse 1 random clean tray tile (Corruptor's signature)
    - `SPAWN_CURSED` — add 1-2 junk cursed tiles to tray (Spawner's signature)
    - Keep `BURN_TILE`, `SLOT_LOCK`, `SATCHEL_RAID` as shared secondary intents
    - Remove `CORRUPT_TILE` (replaced by `CURSE_TILE`)
    - Remove `IDLE` (enemies always do something now — the archetype action IS the baseline)
  - `rollEnemyIntent()` — takes `enemyType` instead of just `isMiniboss`, returns intent weighted by archetype
  - Enemy passives applied in `PLACE_LETTER`:
    - Amplifier: on wrong guess, also curse 1 additional random clean tile

- **Archetype intent weights:**
  - **Corruptor**: CURSE_TILE (heavy), BURN_TILE (light), SLOT_LOCK (light after turn 2)
  - **Spawner**: SPAWN_CURSED (heavy), SATCHEL_RAID (light), BURN_TILE (light)
  - **Amplifier**: BURN_TILE (medium), SLOT_LOCK (medium), CURSE_TILE (light) — their passive does most of the cursing

### Step 6: Assign enemy types to words

In **`words.js`**:
- Add `enemyType` field to word definitions
- Distribute across difficulty levels:
  - Difficulty 1-2: mostly Corruptors (baseline, learnable)
  - Difficulty 3: mix of all three
  - Difficulty 4: more Spawners and Amplifiers
  - Minibosses: each gets a distinct type

### Step 7: Update Interpreter's Salvage to work with cursed tiles

The Lantern currently "un-fades" tiles. New behavior:
- **Consume** 1 cursed tray tile (destroy it, removing the damage threat)
- Generate 2 tiles if a cursed tile was consumed, 1 otherwise
- This makes the Interpreter the "curse management" class — they actively want cursed tiles as fuel

### Step 8: Update UI for enemy identity

In **`CombatScreen.jsx`**:
- Show enemy archetype name/icon alongside the word clue
- Intent banner now shows archetype-colored intent (Corruptor = purple, Spawner = green, Amplifier = red)

In **`DeepScript.css`**:
- Add archetype-specific intent banner colors
- Add `.ds-inv-tile--cursed` styling (dark glow, subtle pulse, red/purple tint — clearly dangerous but still readable)

### Step 9: Update upgrades

In **`upgrades.js`**:
- Replace "Calm Focus" (maxPressure +1) with something curse-relevant, e.g.:
  - "Purifying Light" — cursed tiles deal 0.5 damage instead of 1 (or first cursed tile is free each turn)
  - OR "Thick Skin" — reduce end-of-turn curse damage by 1 (min 0)

### Step 10: Update tests

In **`deepScriptEngine.test.js`**:
- Update all tests referencing `faded` → `cursed`
- Update/remove tests referencing `pressure`/`tension`
- Add tests for:
  - End-of-turn cursed tile damage
  - Corruptor intent (curses a clean tile)
  - Spawner intent (adds junk cursed tiles)
  - Amplifier passive (chain-curse on wrong guess)
  - Cursed tiles can still be placed correctly
  - Salvage consumes cursed tiles

### Step 11: Update design doc

Update **`DEEP_SCRIPT.md`** to reflect:
- New core loop (cursed tiles, not pressure)
- Enemy archetypes
- Revised class descriptions

---

## Files Changed (summary)

| File | Changes |
|------|---------|
| `src/data/deepScript/enemies.js` | **NEW** — enemy archetype definitions |
| `src/components/deepScript/deepScriptEngine.js` | Rename faded→cursed, remove pressure, add cursed damage, add enemy archetypes |
| `src/components/deepScript/CombatScreen.jsx` | Remove pressure HUD, update tile classes, show enemy type |
| `src/components/deepScript/DeepScript.css` | Remove pressure styles, rename faded→cursed styles, add archetype colors |
| `src/data/deepScript/gear.js` | Update Lantern description |
| `src/data/deepScript/starterKits.js` | Remove reducedPressurePenalty |
| `src/data/deepScript/upgrades.js` | Replace Calm Focus with curse-relevant upgrade |
| `src/data/deepScript/words.js` | Add enemyType to words |
| `src/components/deepScript/deepScriptEngine.test.js` | Update all tests |
| `src/components/deepScript/DEEP_SCRIPT.md` | Update documentation |
