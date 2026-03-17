# Deep Script Exploration Layer — Refactor Plan

## Phase 1: Audit — Why It Still Reads As Menu Selection

The current exploration is a linear array of "choice nodes," each offering 2-3 room cards. Problems:

1. **No spatial model** — `generateRunMap()` returns a flat array of `{ depth, choices[] }`. There's no concept of chambers, exits, connections, or direction. The player picks from a list, not a place.

2. **No persistence** — Once a room is chosen from a node, the node is consumed and the player advances `roomIndex++`. There's no revisiting, no map, no sense of "I was here."

3. **No in-world interaction** — `RoomChoiceScreen` renders room cards with type/icon/description. There are no doors, hotspots, objects, or environmental elements to click. It's a categorized menu.

4. **No orientation/movement** — No concept of facing direction, turning, or moving forward. The player doesn't traverse space.

5. **Combat/archive/shrine are menu categories, not discovered places** — You pick "Archive" from a card list. You don't walk into a chamber and find a bookshelf.

6. **Navigation bar still visible** — The bottom nav bar from `App.jsx` is visible during Deep Script. The `ds-mode` class uses `position: fixed; inset: 0; z-index: 50` which covers it, but DeepScriptMode renders inside `BridgeBuilderView` which sits inside the Shell layout. The nav bar condition `!(isGameVisible && isGameRunning)` doesn't apply to Deep Script since it's not using GameContext.

---

## Phase 2: Concrete Exploration Refactor Plan

### A. Nav Bar Fix

In `App.jsx`, the bottom nav hides when `isGameVisible && isGameRunning`. Deep Script doesn't use GameContext. Two options:
- **Option 1**: Add a `deepScriptActive` signal to hide nav
- **Option 2**: Since `ds-mode` is `position: fixed; z-index: 50`, and the nav is inside the normal flow, the nav is already covered. But to be clean, add a body class `in-deep-script` and check it alongside `in-conversation-practice`.

**Chosen: Option 2** — mirror the existing `in-conversation-practice` pattern. DeepScriptMode adds/removes `in-deep-script` class on `document.body`.

### B. Dungeon Floor Data Model

Replace `generateRunMap()` (flat array of choice nodes) with a chamber-based floor generator.

**New file: `src/data/deepScript/floorGenerator.js`**

```
DungeonFloor {
  id: string
  chambers: Map<string, Chamber>
  startChamberId: string
  bossChamberId: string
}

Chamber {
  id: string
  type: 'standard' | 'combat' | 'archive' | 'shrine' | 'event' | 'miniboss'
  exits: { north?: chamberId, east?: chamberId, south?: chamberId, west?: chamberId }
  interactables: Interactable[]
  visited: boolean
  resolved: boolean  // encounter/event completed
  payload: {         // type-specific data
    wordId?: string
    rewardId?: string
    eventId?: string
  }
  theme: 'stone' | 'library' | 'shrine' | 'crypt' | 'hall'
}

Interactable {
  id: string
  type: 'door' | 'bookshelf' | 'altar' | 'brazier' | 'statue' | 'chest' | 'sigil' | 'scroll' | 'mural'
  position: 'left' | 'center' | 'right' | 'back-left' | 'back-right'
  label: string
  action: 'exit' | 'inspect' | 'trigger-combat' | 'trigger-archive' | 'trigger-shrine' | 'loot' | 'flavor'
  exitDirection?: string  // for doors
  resolved: boolean
  data?: any
}
```

**Floor generation**: A 7-chamber floor laid out as a simple graph:
- Entrance (standard) — connects to 2-3 chambers
- 2-3 combat chambers
- 1 archive chamber
- 1 shrine chamber
- 1 miniboss chamber (only accessible after clearing at least 2 combats or visiting enough rooms)
- Optional: 1 event/standard chamber

The graph is small enough to navigate in ~10-15 minutes but large enough to feel like exploration.

### C. Exploration State

**New state in DeepScriptMode:**

```
explorationState {
  floor: DungeonFloor
  currentChamberId: string
  facing: 'north' | 'east' | 'south' | 'west'
  discoveredChambers: Set<string>
  inspecting: Interactable | null  // currently inspected object
  transitioning: boolean           // room transition animation
  combatsCleared: number
  bossUnlocked: boolean
}
```

### D. Exploration Components

1. **ExplorationScreen.jsx** — replaces RoomChoiceScreen
   - Renders the dungeon viewport with current chamber
   - Shows doors/exits based on chamber.exits and player facing
   - Shows interactables positioned in the room
   - Action bar at bottom: Turn Left, Forward (if exit ahead), Turn Right
   - Clicking doors/exits triggers room transition
   - Clicking interactables opens inspect or triggers events

2. **ChamberScene.jsx** — renders the first-person room view
   - Different visual themes per chamber type
   - Positions interactable hotspots in the viewport
   - Shows doors for available exits relative to facing direction
   - Ambient elements (torches, fog, light variation by theme)

3. **ChamberHotspot.jsx** — clickable in-world object
   - Positioned within the viewport
   - Hover state with label tooltip
   - Click triggers action (inspect, loot, trigger encounter)

4. **InspectPanel.jsx** — overlay for inspecting objects
   - Shows object description, lore text, or reward
   - "Take" / "Read" / "Pray" action button
   - Close/back button

5. **MinimapPanel.jsx** — small discovered-rooms indicator
   - Shows visited chambers as nodes
   - Current chamber highlighted
   - Connections shown as lines
   - Fits in a corner of the HUD

6. **RoomTransition.jsx** — brief transition overlay
   - Fade/slide when moving between chambers
   - ~300ms, keeps the illusion of movement

### E. Exploration Verbs (Action Bar)

Bottom of viewport:
- **⟲ Turn Left** — rotates facing 90° CCW
- **⬆ Forward** — moves to chamber in current facing direction (disabled if no exit)
- **⟳ Turn Right** — rotates facing 90° CW

Hotspot clicks:
- **Door/Arch** → move to connected chamber
- **Bookshelf/Scroll/Mural** → open inspect panel with archive content
- **Altar/Statue** → open inspect panel with shrine content
- **Sigil/Apparition** → trigger combat
- **Chest/Brazier** → one-time loot/reward

### F. Chamber Types & Content

| Type | Interactables | Trigger |
|------|--------------|---------|
| Standard | Brazier, cracked wall, note tablet | Flavor text, small clues |
| Combat | Enemy sigil (center), maybe a chest after clearing | Clicking sigil or auto on entry → combat |
| Archive | Bookshelf, scroll stand, mural | Clicking object → archive reward flow |
| Shrine | Altar (center), candles | Clicking altar → shrine upgrade flow |
| Miniboss | Large sigil, boss apparition, locked gate (until prerequisites met) | Clicking → boss combat |
| Event | Statue, mysterious chest | Risk/reward choice |

### G. Integration with Existing Systems

- **Combat**: When triggered, switch to CombatScreen (unchanged). On return, mark chamber as resolved.
- **Archive**: When triggered, show ArchiveScreen or inline inspect panel. On return, mark resolved.
- **Shrine**: When triggered, show ShrineScreen. On return, mark resolved.
- **Run state**: Still tracked in DeepScriptMode. Health, gear, upgrades all persist.
- **Win condition**: Defeat the miniboss chamber's encounter.
- **Lose condition**: Health reaches 0 (same as before).

### H. Flow Change in DeepScriptMode

Current: `kit_select → room_choice → combat/archive/shrine → room_choice → ... → end`
New: `kit_select → exploration (move/turn/inspect/trigger) → combat/archive/shrine → back to exploration → ... → end`

The `running` phase now defaults to `exploration` instead of `room_choice`. Combat/archive/shrine are entered from exploration and return to exploration.

---

## Phase 3: Implementation Order

1. Fix nav bar hiding (body class pattern)
2. Create `floorGenerator.js` with chamber graph generation
3. Create `ChamberScene.jsx` — first-person room renderer
4. Create `ChamberHotspot.jsx` — clickable in-world objects
5. Create `InspectPanel.jsx` — inspection overlay
6. Create `MinimapPanel.jsx` — discovered rooms indicator
7. Create `ExplorationScreen.jsx` — orchestrator replacing RoomChoiceScreen
8. Update `DeepScriptMode.jsx` — new exploration state management
9. Update `deepScriptEngine.js` — add `createRunState` changes for floor model
10. Add exploration CSS to `DeepScript.css`
11. Update tests for new floor generator
12. Build, test, commit, push

## Phase 4: Polish

- Room transition animations (fade/slide between chambers)
- Distinct visual themes per chamber type (stone, library, shrine, crypt)
- Torch/light variation
- Hotspot hover glow effects
- Chamber-specific ambient details
- Minimap visual polish
