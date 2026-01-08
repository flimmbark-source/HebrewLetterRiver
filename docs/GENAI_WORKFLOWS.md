# GenAI Translation & Content Workflows

This document summarizes the translation and content-generation workflows defined in `scripts/translate-dictionaries.mjs` and `scripts/generateCafeTalkLexiconsWithDeepL.mjs`, plus related verification tooling.

## Overview

The repository includes two automation scripts that use external translation services:

1. **Dictionary translation** (Google Translate API) for UI strings.
2. **Cafe Talk lexicon generation** (DeepL API) for language-specific vocabulary lists.

Neither workflow uses a prompt-based LLM; they use structured API calls with controlled inputs.

## Workflow: Dictionary Translation

**Script:** `scripts/translate-dictionaries.mjs`

### Request specification

- **Source data**: `src/i18n/en.json` is cloned and flattened into dot-path entries.
- **Non-translatable keys**: Paths in `nonTranslatablePaths` (e.g., `language.id`) are left untouched.
- **Placeholder masking**: `{{ ... }}` tokens are replaced with `__PLACEHOLDER_X__` before translation and restored after translation to preserve runtime formatting.
- **Translation API**: `https://translate.googleapis.com/translate_a/single` with parameters:
  - `sl=en`, `tl=<language code>`, `dt=t`, `q=<masked string>`
- **Concurrency**: Controlled by `TRANSLATE_CONCURRENCY` (default 5).

### Output behavior

- Strings are written back into a cloned dictionary structure.
- Language pack overrides are applied (e.g., introductions and mode labels).
- Existing translated dictionaries, when present, are merged so manual edits take precedence.

### Verification steps

- Placeholder masking and restoration (ensures tokens survive translation).
- Fallback to the original English string if a translation request fails.
- Use the translation audit script (see below) to detect suspicious or untranslated entries.

## Workflow: Cafe Talk Lexicon Generation (DeepL)

**Script:** `scripts/generateCafeTalkLexiconsWithDeepL.mjs`

### Request specification

- **Source data**: `src/data/readingTexts/cafeTalk/cafeTalkCanonical.js` word list.
- **DeepL API**: POST to `https://api-free.deepl.com/v2/translate` with batch up to 50 entries.
- **Contextualization**: `prepareForTranslation` adds punctuation or capitalization for discourse markers and question words to improve translation quality.
- **Post-processing**: `postProcessTranslation` removes punctuation and standardizes casing.
- **Key handling**: `DEEPL_AUTH_KEY` is read from environment; never logged.

### Output behavior

- Results are written to `src/data/readingTexts/cafeTalk/lexicon/<language>.js` with stable key ordering.
- Languages unsupported by DeepL are skipped with warnings.

### Verification steps

- The script logs a per-language summary and batch progress.
- Manual review is expected for skipped languages or when DeepL support is missing.

## Verification & Validation Tooling

**Translation audit**: `audit-translations.js`

- Detects untranslated strings by comparing target dictionaries to `en.json`.
- Flags entries that still appear to be English.
- Performs spot checks against the MyMemory API for high-priority strings (titles, labels, descriptions) to highlight mismatches.
- Writes reports into `translation-reports/`.

## Cross-Model Comparison Strategy

Current automated cross-model comparison is limited to the translation audit workflow:

- **Primary translation source**: Google Translate (dictionary workflow) or DeepL (lexicon workflow).
- **Secondary check**: MyMemory API comparisons in `audit-translations.js` for a limited set of high-priority strings.

There is **no automated cross-model validation** for the Cafe Talk lexicon generator at this time. If a stricter rubric is required, consider:

- Spot-checking DeepL outputs against another model/service for a subset of high-impact words.
- Verifying that the output lexicon preserves expected casing and punctuation rules.

## Suggested Validation Rubric (Manual/QA)

When reviewing machine-generated translations:

- **Placeholder integrity**: Ensure all `{{ }}` tokens are preserved.
- **Meaning retention**: Check key onboarding, navigation, and instructional strings first.
- **Script consistency**: Confirm language-appropriate casing, punctuation, and diacritics.
- **Fallback safety**: Confirm untranslated entries remain in English rather than partial corruption.

