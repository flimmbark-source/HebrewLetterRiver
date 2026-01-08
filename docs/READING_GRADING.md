# Reading Grading: Developer Notes

This document describes the public grading API exposed by `src/lib/readingGrader.js`, the
expected payload shapes, edge cases, and how the grading output flows through UI and
storage.

## Public grading API (src/lib/readingGrader.js)

### `gradeWord(typed, wordDef, practiceLanguageId, appLanguageId)`

**Purpose:** Compare a typed word against a canonical word definition (plus variants) and
return the best match.

**Inputs**

- `typed` (`string`): Raw user input (may include apostrophes or other characters).
- `wordDef` (`Object`): Word definition object.
  - Required: `canonical` (`string`).
  - Optional: `variants` (`string[]`).
- `practiceLanguageId` (`string`): Practice language (for optional vowel rules).
- `appLanguageId` (`string`): App language (used for normalization/comparison).

**Output**

Returns an object with:

- `isCorrect` (`boolean`): `true` if `typed` matches any variant after normalization.
- `expected` (`string`): Best matching variant (from `canonical` or `variants`).
- `normalized` (`string`): Normalized representation of the best match.
- `variants` (`string[]`): All acceptable variants.
- `distance` (`number`): Distance metric for the best match (from `findBestVariant`).
- `isAvailable` (`boolean`): `false` when `wordDef` is missing/invalid.

**Error/Unavailable state**

If `wordDef` is missing or has no `canonical`, returns:

```js
{
  isCorrect: false,
  expected: '',
  normalized: '',
  variants: [],
  isAvailable: false
}
```

### `buildGhostSequence(typed, expected, practiceLanguageId, appLanguageId)`

**Purpose:** Generate a per-character “ghost” sequence used by the UI to show
character-level feedback.

**Inputs**

- `typed` (`string`): Raw typed string (used for display).
- `expected` (`string`): Expected canonical string (the best-match variant).
- `practiceLanguageId` (`string`)
- `appLanguageId` (`string`)

**Output**

An array of objects `{ char, cls, phase }` where:

- `char` (`string`): Displayed character (empty string for “extra”).
- `cls` (`'ok' | 'bad' | 'miss' | 'extra'`): Classification.
- `phase` (`'typed' | 'miss'`): When the UI reveals the character.

Behavior notes:

- If `typed` matches `expected` after normalization, the ghost sequence mirrors the
  original typed characters (preserving apostrophes) and every item is `cls: 'ok'`.
- Optional vowels: for languages with optional vowels (e.g., Hebrew/Arabic
  transliteration), the alignment skips expected vowels when the typed char is a
  consonant and the app language differs from the practice language.
- “Extra” typed characters produce `{ char: '', cls: 'extra', phase: 'typed' }`.

### `gradeWithGhostSequence(typed, wordDef, practiceLanguageId, appLanguageId)`

**Purpose:** Composite grading result with ghost sequence and typed grapheme clusters.

**Output**

Returns all fields from `gradeWord` plus:

- `ghostSequence` (`Array<{char, cls, phase}>`): From `buildGhostSequence`.
- `typedChars` (`string[]`): Grapheme clusters of the original typed input.

If the word definition is unavailable (`isAvailable: false`), the result contains an
empty `ghostSequence` and still exposes `typedChars` for UI rendering.

### `calculateWordBoxWidth(typedLength, ghostLength)`

**Purpose:** Utility to size word boxes in the UI based on max of typed/ghost length,
with padding. Returns a numeric character-width value.

## Payloads and expected fields

### Word definition shape

```ts
type WordDefinition = {
  canonical: string;
  variants?: string[];
};
```

`ReadingArea` can merge transliteration variants with meaning translations, so the
`variants` array can include both pronunciation and meaning values.

### Grading result shape

```ts
type GradingResult = {
  isCorrect: boolean;
  expected: string;
  normalized: string;
  variants: string[];
  distance: number;
  isAvailable: boolean;
  ghostSequence: Array<{ char: string; cls: 'ok' | 'bad' | 'miss' | 'extra'; phase: 'typed' | 'miss' }>;
  typedChars: string[];
};
```

### Storage result shape (reading results)

`saveReadingResults` expects an array of objects containing `wordId` and `ghostSequence`.
It computes the overall grade color based on ghost sequence content and stores this per
word attempt.

Stored entries per word are shaped as:

```ts
{
  textId: string;
  color: 'ok' | 'bad' | 'miss' | 'extra';
  ghostSequence: Array<{ char: string; cls: string; phase: string }>;
  timestamp: number;
  isCorrect: boolean;
}
```

## Edge cases to be aware of

- **Empty input:** `ReadingArea` prevents grading when the normalized typed value is
  empty, so `gradeWithGhostSequence` is not called.
- **Unavailable word definition:** `gradeWord` returns `isAvailable: false` with empty
  `expected/variants`, and `gradeWithGhostSequence` returns an empty `ghostSequence`.
- **Script directionality:** `ReadingArea` uses `getTextDirection` for both practice and
  app languages to layout the UI. This affects rendering order, not the grading logic.
- **Locale differences:** Translations are pulled from either `readingText.translations`
  for `appLanguageId` or `TRANSLATION_KEY_MAP[appLanguageId]` as a locale fallback. This
  can change which variants are accepted for grading.
- **Partial matches / alignment:** `buildGhostSequence` aligns typed and expected
  grapheme clusters, inserts missing expected characters (often vowels), and marks extra
  typed characters separately. This is especially noticeable when optional vowels are
  skipped.

## How grading flows into the UI

1. **Word definition resolution (ReadingArea):**
   - `getTranslation()` resolves the word’s translation/transliteration.
   - If transliteration is present, it becomes the canonical grading target, and
     variants combine transliteration variants and meaning variants.
2. **Grading and commit (ReadingArea):**
   - `gradeAndCommit()` calls `gradeWithGhostSequence(typedWord, wordDef, ...)` to get
     `isCorrect`, `ghostSequence`, and `typedChars`.
   - The result updates streak, feeds the committed word history, and builds the
     results payload for the results screen.
3. **Storage (readingResultsStorage):**
   - Once the exercise completes, `saveReadingResults(sectionId, textId,
     practiceLanguageId, completedResults)` persists ghost sequences and overall
     grading colors for dictionary transaction UI.

Key integration points:

- `src/components/ReadingArea.jsx` – grading orchestration (`gradeAndCommit`) and
  results assembly.
- `src/lib/readingResultsStorage.js` – persistent storage and aggregation of grading
  results (overall grade color based on ghost sequence).

## Related files

- `src/lib/readingGrader.js`
- `src/lib/readingUtils.js` (normalization, grapheme clustering, optional vowels)
- `src/components/ReadingArea.jsx`
- `src/lib/readingResultsStorage.js`
