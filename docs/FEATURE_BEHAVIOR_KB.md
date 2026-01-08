# Feature Behavior Knowledge Base

This knowledge base summarizes core feature behavior and links to primary implementation files.

## Reading Mode (Word-by-Word)

**User flow**

1. User enters a module and launches reading practice from `ModuleCard`.
2. `ReadingArea` loads the reading text, shows a practice word, and accepts typed input.
3. On submit, grading runs and the result is displayed as typed + ghost rows.
4. On completion, a results modal summarizes outcomes and results are persisted for later dictionary colorization.

**Primary implementation files**

- `src/components/ModuleCard.jsx` (entry point into `ReadingArea` for vocab/grammar/sentence practice)
- `src/components/ReadingArea.jsx` (UI flow, word navigation, grading integration)
- `src/data/readingTexts/index.js` (reading text lookup)
- `src/lib/readingGrader.js` (grading + ghost sequence)
- `src/lib/readingResultsStorage.js` (history persistence)

## Grading Flow (Ghost Feedback)

**User flow**

1. `ReadingArea` normalizes typed input and calls `gradeWithGhostSequence`.
2. Grading selects the best variant and produces a ghost sequence for feedback.
3. Word widths are calculated to align typed/ghost rows.
4. Results are stored in `completedResults` and persisted when the results modal opens.

**Primary implementation files**

- `src/lib/readingGrader.js`
- `src/lib/readingUtils.js`
- `src/components/ReadingArea.jsx`
- `src/lib/readingResultsStorage.js`

## SRS Review

**User flow**

1. The SRS context initializes and loads progress for the active language.
2. Review queues are derived using SM-2 scheduling and priority weighting.
3. When a review is graded, SM-2 updates ease factor and interval, sets due dates, and stores results.

**Primary implementation files**

- `src/context/SRSContext.jsx` (SRS state, review actions, persistence wiring)
- `src/lib/SRSEngine.js` (SM-2 scheduling logic)
- `src/lib/db.js` (IndexedDB storage for SRS progress)

## Daily Tasks

**User flow**

1. Daily tasks are hydrated and normalized on load (titles, descriptions, reward stars).
2. Templates are mapped to localized strings and dynamic replacements (e.g., letter names, constraint labels).
3. Completion and reward claiming updates the daily task state.

**Primary implementation files**

- `src/context/ProgressContext.jsx` (daily task hydration, normalization, reward flow)
- `src/data/dailyTemplates.json` (task templates + i18n keys)
- `src/lib/db.js` (daily quest storage)

## Achievements

**User flow**

1. Badge definitions load from `badges.json`.
2. Progress updates increase badge progress, determine tier upgrades, and queue rewards.
3. Rewards can be claimed and converted into star gains.

**Primary implementation files**

- `src/context/ProgressContext.jsx` (badge progress tracking, reward claiming)
- `src/data/badges.json` (badge definitions and tier requirements)
- `src/lib/db.js` (badge storage)

## Error States & Recovery Guidance

### Offline or unavailable TTS

- The TTS service warns when the browser speech API is unavailable or if playback fails.
- `ReadingArea` resumes the TTS engine when the page becomes visible and stops playback on unmount.

**Primary implementation files**

- `src/lib/ttsService.js`
- `src/components/ReadingArea.jsx`
- `src/components/SpeakButton.jsx`

### Missing translations

- `ReadingArea` logs warnings when translations are missing and falls back to practice text/entries when possible.
- If no translation is found, it returns `null` and the UI can display fallback values.

**Primary implementation files**

- `src/components/ReadingArea.jsx`
- `src/data/readingTexts/index.js`

### Grading mismatches or missing word definitions

- `gradeWord` returns `isAvailable: false` when no canonical word exists.
- `gradeWithGhostSequence` outputs an empty ghost sequence when grading is unavailable, but still shows typed characters.

**Primary implementation files**

- `src/lib/readingGrader.js`

## Learning Logic Summaries

### SRS scheduling (SM-2)

- Ease factor is updated with the SM-2 formula.
- Grade < 3 resets the interval to 0; grade 3 uses a conservative multiplier.
- First successful review is 1 day, second is 6 days, subsequent reviews multiply by ease factor with an easy bonus on grade 5.
- Due dates are computed in days and stored per item.

**Primary implementation files**

- `src/lib/SRSEngine.js`

### Progress tracking

- Player progress includes stars, streaks, and badge progress (stored in local state + persistence).
- Daily task rewards and badge rewards both feed the star total.

**Primary implementation files**

- `src/context/ProgressContext.jsx`
- `src/lib/storage.js`
- `src/lib/db.js`

