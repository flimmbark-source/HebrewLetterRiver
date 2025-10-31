# Hebrew Letter River Codebase Guide

This document gives Codex (and other automated contributors) a quick reference for how the project is structured and how different parts of the app fit together. Use it as a map before editing code so that changes stay consistent with the existing architecture.

## Project overview

- **Stack:** [Vite](https://vitejs.dev/) + React 18 with JSX modules (`type: module`) and Tailwind CSS for styling.
- **Purpose:** An educational "river" game that helps players learn Hebrew letters and vowels. The React app renders views, while the game itself is managed by an imperative canvas/DOM controller in `src/game/game.js`.
- **Primary entry point:** `src/main.jsx` renders `<App />` inside React Router's `<BrowserRouter />`.

Useful npm scripts:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Build the production bundle. |
| `npm run preview` | Preview the production build with Vite. |

## High-level React tree

`App.jsx` composes the top-level providers and router:

1. `ToastProvider` → handles temporary notifications.
2. `LanguageProvider` → stores the player's chosen practice and interface language IDs.
3. `LocalizationProvider` → loads the appropriate language packs and dictionaries based on `LanguageContext`.
4. `ProgressProvider` → persists player progress, badges, streaks, and daily tasks; reacts to events from the game engine.
5. `GameProvider` → hosts the modal/portal that mounts the canvas-based game UI.
6. The component tree renders navigation (`Home`, `Learn`, `Daily`, `Achievements`) via `react-router-dom`.

Because of this nesting, many hooks in the views expect their companion context to be available. If you add a new view, wrap it with the same providers to keep functionality intact.

## Key directories

### `src/context`

| File | Responsibility |
| --- | --- |
| `GameContext.jsx` | Manages visibility of the game overlay, forwards options to `setupGame`, and exposes `openGame`/`closeGame` helpers. Relies on `LocalizationContext` for translated strings and passes language metadata to the game engine. |
| `LanguageContext.jsx` | Stores both the "practice" language (content of the game) and the "interface" language (UI copy). Persists selections in `localStorage`. |
| `LocalizationContext.jsx` | Loads language packs via `loadLanguage` and dictionaries through `i18n/index.js`, exposing a `t` helper for translating keys. |
| `ProgressContext.jsx` | Hydrates/saves player state (stars, letters, badges, streaks, dailies). Normalizes stats based on the active language pack and listens for events from the game engine (via `eventBus`). |
| `ToastContext.jsx` | Shows dismissible toasts with Tailwind styling. |

These contexts cooperate tightly. For example, `ProgressContext` depends on `LocalizationContext` for translated copy and on `LanguageContext` to scope progress to the selected practice language. Update them carefully—changes in one context usually require updates elsewhere.

### `src/game`

- `game.js` exposes `setupGame({ languagePack, translate, dictionary, onReturnToMenu, ... })`. It renders the actual game by manipulating DOM nodes inside the portal provided by `GameContext`. It publishes progress/achievement events through the event bus (`lib/eventBus.js`) and expects the host React app to handle persistence and UI chrome.

When editing the game logic, keep in mind that it runs outside React. Side effects should be communicated via the shared event bus or callbacks passed from `GameProvider`.

### `src/views`

- `HomeView.jsx`: Dashboard that introduces the river theme and starts the game in various modes.
- `LearnView.jsx`: Language catalogue showing consonants, vowels, and practice suggestions. Uses `LanguageContext` and `LocalizationContext` heavily.
- `DailyView.jsx`: Shows generated daily tasks and progress bars (fed by `ProgressContext`).
- `AchievementsView.jsx`: Lists badges and stats, also driven by `ProgressContext`.

Views consume context hooks instead of accessing storage directly. Follow that pattern to keep state centralized.

### `src/data`

- `languages/*.js` define language packs (Hebrew default plus optional packs for other locales). Each pack exports consonants, vowel markers, syllable bases, practice modes, and metadata such as font classes or dictionary IDs.
- `badges.json` describes badge tiers. `dailyTemplates.json` holds the templates used to generate daily tasks.

`LanguageContext` stores only language IDs. `loadLanguage` (see below) turns those IDs into the rich data required by the game and UI.

### `src/lib`

| File | Summary |
| --- | --- |
| `languageLoader.js` | Builds complete language packs: clones consonants, synthesizes vowel combinations, and maps items by ID/symbol for lookup. |
| `storage.js` | Thin wrapper around `localStorage` for saving/loading JSON state with error handling. |
| `time.js` | Utility for Jerusalem time calculations (daily resets, streak tracking). |
| `eventBus.js` | Simple publish/subscribe helper used by the game to notify React code about in-game events. |
| `celebration.js` | Launches canvas-confetti animations when achievements unlock. |

### `src/i18n`

`index.js` eagerly loads all `*.json` dictionaries with Vite's `import.meta.glob`. Each dictionary should specify `language.id` metadata; if not, the filename becomes the ID. `LocalizationContext` calls `getDictionary(appLanguageId)` and exposes a `t(key, replacements)` helper that supports `dot.separated.keys` and `{{token}}` replacement.

### `src/styles`

Tailwind is configured in `tailwind.config.js`. Global overrides live in `src/index.css` and `src/styles/main.css`. Custom language fonts are usually attached via `language-font-*` class names referenced in language metadata.

## Communication between React and the game engine

1. React shows a modal/portal (`GameProvider`).
2. `setupGame` mounts the imperative UI into `#game-container` and registers event listeners.
3. The game fires events like `session:complete` or `progress:update` on the shared event bus.
4. `ProgressContext` listens for those events to update persistent state and trigger toasts/confetti.
5. Views re-render based on the updated context state.

When making changes that cross this boundary, update both sides: adjust emitted event names/payloads in `game.js` and the subscribers inside `ProgressContext` or other modules.

## Adding features safely

- **Translations:** Add keys to the dictionaries in `src/i18n/*.json`. Use `t('path.to.key')` in components. Provide fallback English if possible.
- **Language packs:** Create a new file in `src/data/languages`, export metadata, and register it in `index.js`. Ensure `metadata.fontClass` references a CSS class that sets an appropriate font.
- **Persistent state:** Prefer extending `ProgressContext` so the storage format stays consistent. Update `hydratePlayer`/`saveState` logic and migration steps when introducing new fields.
- **Game modes:** Extend the language pack's `practiceModes` and update `LearnView`/`HomeView` UI to surface the new mode. If the underlying gameplay changes, modify `setupGame` and confirm events remain compatible.

## Scripts and utilities

- `scripts/translate-dictionaries.mjs` is a Node script intended to batch-translate the dictionary JSON files using the OpenAI API. It relies on `undici` (already in dependencies). Check the script before running to ensure API keys and rate limits are configured.

## Testing checklist before committing

1. `npm run lint` – *not currently defined*. Run `npm run build` instead to catch syntax errors.
2. `npm run build` – ensures the Vite build succeeds.
3. Launch `npm run dev` locally to verify the game overlay still loads and events propagate.

Keep this guide handy when making structural changes so Codex has context on where to place new code and which modules are responsible for what.
