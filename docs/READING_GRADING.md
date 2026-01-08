# Reading Grading & Ghost Feedback

This document describes the grading API and how reading practice feedback is computed and wired into the UI.
It is developer-facing and based on the current implementation in `src/lib/readingGrader.js` and related UI/storage helpers.

## Overview

Reading practice grading is responsible for:

- Normalizing user input and matching it against canonical translations plus variants.
- Returning correctness, best-match metadata, and a per-character "ghost" sequence for visual feedback.
- Supporting optional-vowel scripts (Hebrew/Arabic transliteration) so consonant-only input can still align to expected text.
- Persisting results for later review/visualization.

Key modules:

- `src/lib/readingGrader.js` (grading + ghost sequence generation)
- `src/lib/readingUtils.js` (normalization, vowel detection, grapheme splitting)
- `src/components/ReadingArea.jsx` (UI flow + grading integration)
- `src/lib/readingResultsStorage.js` (localStorage persistence)

## Public API (grading)

All grading utilities live in `src/lib/readingGrader.js`.

### `gradeWord(typed, wordDef, practiceLanguageId, appLanguageId)`

**Purpose:** Find the best matching variant and determine correctness.

**Parameters**

- `typed` (`string`): raw user input.
- `wordDef` (`Object`): word definition:
  - `canonical` (`string`, required)
  - `variants` (`string[]`, optional)
- `practiceLanguageId` (`string`): practice language ID (e.g., `hebrew`).
- `appLanguageId` (`string`): UI language ID used for normalization/compare.

**Return shape**

```ts
{
  isCorrect: boolean;
  expected: string;      // best-matching variant
  normalized: string;    // normalized best-match value
  variants: string[];    // canonical + variants list
  distance: number;      // variant distance from typed input
  isAvailable: boolean;  // false if no canonical is provided
}
```

**Unavailable word definition**

If `wordDef` or `wordDef.canonical` is missing, the function returns `isAvailable: false` with empty fields so callers can gracefully handle the missing data.

### `gradeWithGhostSequence(typed, wordDef, practiceLanguageId, appLanguageId)`

**Purpose:** Extend `gradeWord` by adding ghost feedback for UI display.

**Return shape**

```ts
{
  isCorrect: boolean;
  expected: string;
  normalized: string;
  variants: string[];
  distance: number;
  isAvailable: boolean;
  ghostSequence: Array<{ char: string; cls: 'ok' | 'bad' | 'miss' | 'extra'; phase?: 'typed' | 'miss' }>;
  typedChars: string[]; // grapheme clusters from the raw typed input
}
```

If `isAvailable` is false, the ghost sequence is an empty array and `typedChars` still reflect the user input so the UI can show what the learner typed.

### `buildGhostSequence(typed, expected, practiceLanguageId, appLanguageId)`

**Purpose:** Align typed and expected text to create a per-character feedback sequence (ghost row).

Each ghost entry includes:

- `char`: expected character (empty string for `extra` items).
- `cls`:
  - `ok` — correct character
  - `bad` — typed character does not match the expected character
  - `miss` — expected character not typed
  - `extra` — extra typed character with no expected counterpart
- `phase`: used by the UI to control staged reveal (`typed` vs `miss`).

### `calculateWordBoxWidth(typedLength, ghostLength)`

**Purpose:** Compute the visual word box width for the typed and ghost rows.

Returns the max of `typedLength` and `ghostLength`, plus padding.

## Input/Output Payloads

### Word definition payload

```json
{
  "canonical": "shalom",
  "variants": ["shalom", "shalom!", "shalom."]
}
```

### Grading result payload

```json
{
  "isCorrect": false,
  "expected": "shalom",
  "normalized": "shalom",
  "variants": ["shalom", "shalom!", "shalom."],
  "distance": 2,
  "isAvailable": true,
  "ghostSequence": [
    {"char": "s", "cls": "ok", "phase": "typed"},
    {"char": "h", "cls": "ok", "phase": "typed"},
    {"char": "a", "cls": "miss", "phase": "miss"}
  ],
  "typedChars": ["s", "h", "l", "o", "m"]
}
```

## Edge Cases & Expected Behavior

- **Empty input**: UI prevents grading when the normalized input is empty, but the grading helpers accept empty strings. Empty input will produce a ghost sequence of `miss` characters matching the expected word length.
- **Missing word definition**: `gradeWord` returns `isAvailable: false` with empty fields; `gradeWithGhostSequence` returns an empty ghost sequence and the typed graphemes.
- **Optional vowels / consonant-only typing**: For languages with optional vowels, the alignment logic skips expected vowels when the typed character is a consonant and the practice/app languages differ. This allows transliteration-only input to match vocabulary targets.
- **Script directionality**: The UI uses `dir` on the typed and ghost rows so RTL languages render correctly while grading itself is direction-agnostic.
- **Locale differences**: Normalization uses the app language ID, so the same typed input can normalize differently by locale (e.g., diacritics or apostrophes).
- **Partial matches**: The ghost sequence can include a mix of `ok`, `bad`, `miss`, and `extra` states; the UI visualizes this linearly so learners see exactly where mismatches occur.

## UI Wiring (Reading Area)

The grading flow in `src/components/ReadingArea.jsx`:

1. `gradeAndCommit` normalizes the typed word and calls `gradeWithGhostSequence`.
2. The returned result updates streak state and is stored in `committedWords` and `completedResults`.
3. Word box widths are calculated with `calculateWordBoxWidth` to keep typed/ghost rows aligned.
4. When the results modal opens, `saveReadingResults` persists the ghost sequence for dictionary coloring and history.

Key storage helpers in `src/lib/readingResultsStorage.js`:

- `saveReadingResults(sectionId, textId, practiceLanguageId, results)` stores attempts with timestamps.
- `getWordGhostSequence(practiceLanguageId, sectionId, wordId)` fetches the latest ghost sequence.
- `getWordTransactions(practiceLanguageId, sectionId, wordId)` returns the full attempt history.
- `clearAllResults()` wipes the cache (useful for testing).

Ghost sequences are also converted to a single “overall color” (`bad` > `miss` > `extra` > `ok`) to drive summary indicators.
