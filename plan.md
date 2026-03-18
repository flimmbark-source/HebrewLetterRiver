# Deep Script Combat Refactor Plan — Roguelike Battle System

## Audit Summary: What Must Change

### Current Turn Flow (BROKEN)
- No energy system. Player can use gear freely if off cooldown.
- END_TURN = tick cooldowns + generate 2 free random tiles. Tiles appear for free every turn.
- No enemy. Pressure only rises from wrong placements. Nothing happens between turns.
- No strategic tension: the optimal play is always "use gear when ready, end turn to get more tiles."

### Current Resource Model (BROKEN)
- **Pressure** (0→5): goes up on wrong placement, down on correct. This is a lose condition, not a resource.
- **Tiles**: generated for free at combat start (3 tiles) and every end turn (2 tiles). Surplus.
- **Gear**: cooldown + limited uses. But Scribe Knife has 0 cost and generates EXACT target letters.
- **No energy**. No per-turn budget. No cost/benefit tradeoffs per action.

### Current Gear (BROKEN philosophy)
| Gear | Problem |
|---|---|
| Scribe Knife | FREE exact target letters. Eliminates the puzzle. |
| Echo Mirror | 1 tile cost to duplicate. Decent but no energy cost. |
| Ash Brazier | Free burn with 1-turn cooldown. Too cheap. |
| Meaning Lantern | Free reveal, 3 uses. OK but no energy cost. |
| Choice Sigil | Free 3-letter bundle. Guaranteed target letter. |
| Root Lens | Free reveal, 3 uses. Same as Lantern. |
| Rune Tongs | 1 tile cost to transform. No energy cost. |
| Reveal Scroll | Free reveal, 1 use. Fine as a consumable. |
| Satchel Hook | Free retrieve, no cooldown. Trivial. |

### Current Enemy Behavior (NONEXISTENT)
- No enemy actions between turns.
- No intent telegraph.
- Pressure only rises from player mistakes.

### Current Ability UI (TOO SMALL)
- Gear buttons are 50px wide with 8px name text, ellipsis truncation.
- Costs not visible. Effect not visible. Hover-only tooltips.
- No tile cost sockets visible anywhere.

---

## Refactor Plan

### Phase 1: Engine — New Combat Model (`deepScriptEngine.js`)

#### 1A. Add Energy System
- New state fields: `energy: number`, `maxEnergy: number` (default 3)
- Start of each turn: energy resets to maxEnergy
- All actions cost energy (see gear rework below)
- **Remove free tile generation from END_TURN entirely**
- Tiles come only from player actions (Scribe Knife, burn replacement, etc.)

#### 1B. Add Enemy Intent System
- New state fields:
  - `enemyIntent: { type: string, value: number, description: string }`
  - `enemyIntentPool: string[]` (possible intents for this encounter)
- Intent types (MVP):
  - `pressure` — Add +1 or +2 pressure
  - `burn_tile` — Remove a random tray tile
  - `corrupt_tile` — Fade a random tray tile (make it faded/useless)
  - `slot_lock` — Temporarily lock a random unfilled slot for 1 turn
  - `satchel_raid` — Remove a random satchel tile
  - `idle` — Enemy does nothing (breather turn)
- Intent is rolled at combat start and after each enemy execution
- **Roll function**: `rollEnemyIntent(turn, isMiniboss)` — weighted random, escalates with turn count

#### 1C. Rework Turn Flow in Reducer
- **New action: `START_TURN`** — gain energy, clear slot locks, roll next intent if first turn
- **Rework `END_TURN`**:
  1. Enemy executes current intent (apply effects)
  2. Roll new enemy intent for next turn
  3. Tick gear cooldowns
  4. Increment turn counter
  5. Check defeat (pressure >= max)
  6. **NO free tile generation**
- **New action: `EXECUTE_ENEMY_INTENT`** (called internally by END_TURN)

#### 1D. Add Defensive Action
- New shared gear: **Ward Stone** (replaces Satchel Hook as shared gear)
  - Cost: 1 energy
  - Effect: Block/reduce the enemy's next intent
  - Cooldown: 2 turns
  - When used: sets `state.warded = true`; on END_TURN, if warded, enemy intent effect is halved or negated

#### 1E. Rework All Gear with Energy Costs

| Gear | New Cost | New Effect | Cooldown |
|---|---|---|---|
| **Scribe Knife** | 1 energy | Generate 2 random consonant tiles (weighted toward target letters at 30% accuracy) | 0 |
| **Echo Mirror** | 1 energy + 1 tile | Duplicate selected tile | 2 |
| **Ash Brazier** | 1 energy + 1 tile (socketed) | Burn socketed tile → generate 2 random tiles (40% accuracy) | 1 |
| **Meaning Lantern** | 2 energy | Reveal one unrevealed slot | 3 uses |
| **Choice Sigil** | 2 energy | Show 3-4 letter bundle, pick one (1 guaranteed target) | 2 |
| **Root Lens** | 1 energy | Reveal one unrevealed slot | 3 uses |
| **Rune Tongs** | 1 energy + 1 tile | Transform selected tile into a random target letter (50% exact, 50% random) | 1 |
| **Reveal Scroll** | 0 energy | Reveal one slot (consumable, 1 use) | 0 |
| **Ward Stone** (NEW, replaces Satchel Hook) | 1 energy | Block/reduce next enemy intent | 2 |

New premium exact generator (added to shared gear):
| **Inscription Quill** (NEW) | 3 energy + 1 burned tile | Generate 1 exact needed target letter | 3 |

#### 1F. Add Tile Socket Model to Gear State
- Each gear definition gains: `tileSockets: [{ type: 'required' | 'empower', filled: null }]`
- Ash Brazier: 1 required socket (tile to burn)
- Echo Mirror: already uses selected tile, but now show socket
- Rune Tongs: 1 required socket (tile to transform)
- Inscription Quill: 1 required socket (tile to burn as cost)
- New reducer action: `SOCKET_TILE` — place selected tile into a gear's socket
- New reducer action: `UNSOCKET_TILE` — remove tile from socket back to tray
- `USE_GEAR` checks sockets are filled before activating

#### 1G. State Shape Changes Summary
```js
// New fields in combat state:
energy: 3,
maxEnergy: 3,
enemyIntent: { type: 'pressure', value: 1, description: '+1 Pressure' },
warded: false,
slotLocks: [], // array of slot indices temporarily locked
gearStates: {
  [gearId]: {
    currentCooldown, usesRemaining, effectiveCooldown,
    sockets: [{ type: 'required'|'empower', tileId: null }]  // NEW
  }
}
```

### Phase 2: Gear & Starter Kit Data (`gear.js`, `starterKits.js`)

- Update all gear definitions with `energyCost` field and `tileSockets` array
- Replace `satchel-hook` with `ward-stone`
- Add `inscription-quill` to shared gear
- Scribe Knife type changes from `generate` (exact) to `generate-random`
- Update starter kit shared gear references
- Keep kit identities intact (Scribe = generation, Interpreter = choices/reveals, Rootkeeper = transforms)

### Phase 3: Combat Screen UI (`CombatScreen.jsx`)

#### 3A. Enemy Intent Banner
- New section between top HUD and viewport (or overlaid on encounter sigil area)
- Always visible, large text: enemy icon + intent description + value
- Example: "🗡️ +2 Pressure" or "🔥 Burn 1 Tile"
- Pulses red when dangerous, dim when idle
- If warded, show shield icon overlay

#### 3B. Energy Display
- Add energy pips/bar to top HUD next to health
- Show current/max (e.g., 3 diamond icons, filled = available)
- Prominent position — player must always see remaining energy

#### 3C. Ability Cards (Replace Hotbar)
- Replace 50px hotbar slots with full ability cards
- Each card: ~90-110px wide, ~120px tall
- Layout: horizontally scrollable row at bottom, replacing tiny hotbar
- Card content (always visible):
  - Top: Icon (24px) + Name (12px bold)
  - Middle: Energy cost badge (diamond icon + number) + Tile socket slots
  - Bottom: One-line effect description (10px)
- Tile sockets: 32×36px outlined squares matching tile size
  - Red outline = required, Gold outline = empower/optional
  - Filled = show letter inside, empty = dashed outline
  - Click to place selected tile into socket
- Ready state: gold border glow when all requirements met
- Disabled state: greyed if insufficient energy or on cooldown
- Cooldown: overlay number

#### 3D. Revised Bottom HUD Layout
- Remove old hotbar + inventory side-by-side
- New layout (top to bottom within bottom area):
  1. **Tray** — horizontal row of tiles (same style, maybe slightly larger)
  2. **Satchel** — small row beside/below tray
  3. **Ability Cards** — horizontal scrollable row
  4. **End Turn button** — prominent, right-aligned or centered below abilities

#### 3E. Slot Lock Visuals
- Locked slots show a lock icon overlay and are not clickable
- Cleared at start of next turn

### Phase 4: CSS (`DeepScript.css`)

- New `.ds-ability-card` styles (larger card with sections)
- New `.ds-ability-socket` styles (outlined tile slots)
- New `.ds-energy-bar` styles (diamond pips)
- New `.ds-intent-banner` styles (top area, animated)
- New `.ds-slot--locked` styles
- Update `.ds-bottom-hud` layout for new structure
- Remove old `.ds-hotbar-slot` (50px) styles

### Phase 5: Tests (`deepScriptEngine.test.js`)

Update existing tests and add new ones:
- Energy: START_TURN grants energy, actions consume energy, cannot act without energy
- Enemy intent: intent appears at start, executes on END_TURN, new intent rolls
- Ward: blocks/reduces intent
- Tile sockets: SOCKET_TILE, UNSOCKET_TILE, USE_GEAR checks sockets
- Scribe Knife: no longer generates exact letters
- Slot locks: applied by enemy, cleared on START_TURN
- Turn flow: START_TURN → actions → END_TURN → enemy → next turn

---

## File Change Summary

| File | Change Type |
|---|---|
| `deepScriptEngine.js` | Major rewrite: energy, intent, sockets, turn flow |
| `gear.js` | Update all gear: add energyCost, tileSockets, rework types |
| `starterKits.js` | Update shared gear list (swap satchel-hook → ward-stone) |
| `CombatScreen.jsx` | Major rewrite: intent banner, energy bar, ability cards, sockets |
| `DeepScript.css` | Major additions: ability cards, sockets, intent, energy styles |
| `deepScriptEngine.test.js` | Update + expand for new mechanics |

## Scope Control
- Keep letter placement FREE (no energy cost to place correct letters)
- Keep satchel stow/retrieve as free actions (no energy cost)
- Keep burn as a sub-action of Ash Brazier (not a free standalone action anymore)
- Miniboss: harder intents, more pressure, same structure
- Do NOT add: mana, insight, multiple enemy types, animations beyond CSS
