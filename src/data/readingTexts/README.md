# Reading Texts - Modular Structure

This directory contains reading comprehension texts for all 12 supported languages, organized using modern coding practices for maintainability and scalability.

## Directory Structure

```
readingTexts/
├── common/              # Shared utilities and translations
│   ├── translations.js  # Common word translations (hello, thanks, yes, no, good)
│   ├── titles.js        # Title/subtitle generators
│   └── helpers.js       # Helper functions for building texts
├── languages/           # Individual language modules
│   ├── english.js       # English reading texts
│   ├── hebrew.js        # Hebrew reading texts
│   └── ...              # Other languages
├── index.js             # Main aggregator (exports readingTextsByLanguage)
└── README.md            # This file
```

## Key Benefits

1. **Modularity**: Each language is in its own file
2. **DRY Principle**: Common translations are defined once
3. **Type Safety**: Consistent structure enforced by helpers
4. **Scalability**: Easy to add new languages or texts
5. **Maintainability**: Changes to one language don't affect others

## How to Add a New Language

### Option 1: Using buildStarterWordTranslations (for common starter words)

```javascript
// languages/newlanguage.js
import { getStarterWordsTitle, getCommonWordsSubtitle } from '../common/titles.js';
import { createReadingText, buildStarterWordTranslations } from '../common/helpers.js';

export const newlanguageReadingTexts = [
  createReadingText({
    id: 'newlanguage-starter-words',
    title: getStarterWordsTitle(5),
    subtitle: getCommonWordsSubtitle('NewLanguage'),
    practiceLanguage: 'newlanguage',
    tokens: [
      { type: 'word', text: 'word1', id: 'hello' },
      { type: 'word', text: 'word2', id: 'thanks' },
      { type: 'word', text: 'word3', id: 'yes' },
      { type: 'word', text: 'word4', id: 'no' },
      { type: 'word', text: 'word5', id: 'good' },
      { type: 'punct', text: '.' }
    ],
    translations: buildStarterWordTranslations('newlanguage', {
      // Add custom variants if needed
      thanks: {
        en: { canonical: 'thanks', variants: ['thanks', 'thank you'] }
      }
    })
  })
];
```

### Option 2: Manual Translations (for custom texts)

```javascript
export const newlanguageReadingTexts = [
  createReadingText({
    id: 'newlanguage-custom-text',
    title: { en: 'Custom Title', ... }, // Provide all 12 languages
    subtitle: { en: 'Custom Subtitle', ... },
    practiceLanguage: 'newlanguage',
    tokens: [
      { type: 'word', text: 'customWord1', id: 'word1' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        word1: { canonical: 'translation', variants: ['translation', 'variant'] }
      },
      // ... provide translations for all 12 app languages
    }
  })
];
```

## Common Translation Constants

Available in `common/translations.js`:
- `HELLO` - Hello/greeting in all 12 languages
- `THANKS` - Thanks/gratitude in all 12 languages
- `YES` - Yes in all 12 languages
- `NO` - No in all 12 languages
- `GOOD` - Good in all 12 languages

## Title Generators

Available in `common/titles.js`:
- `getStarterWordsTitle(count)` - "Starter Words (N)" in all languages
- `getGreetingsTitle(count)` - "Greetings (N)" in all languages
- `getCommonWordsSubtitle(languageName)` - "Common [Language] words" in all languages
- `getGreetingsSubtitle(languageName)` - "Common [Language] greetings" in all languages

## Helper Functions

Available in `common/helpers.js`:
- `createReadingText(config)` - Create a properly structured reading text
- `buildStarterWordTranslations(lang, customs)` - Auto-generate translations for the 5 common starter words
- `mergeTranslations(defaults, customs)` - Merge custom translations with defaults

## Supported App Languages

All texts must provide translations in these 12 languages:
- `en` - English
- `es` - Spanish
- `fr` - French
- `ar` - Arabic
- `pt` - Portuguese
- `ru` - Russian
- `ja` - Japanese
- `zh` - Mandarin Chinese
- `hi` - Hindi
- `bn` - Bengali
- `am` - Amharic
- `he` - Hebrew

## Migration Status

Currently migrated to modular structure:
- ✅ English - Fully modular with helpers
- ✅ Hebrew - Fully modular (2 texts)
- ⏳ Other languages - Still imported from legacy `../readingTexts.js`

To migrate a language, create a new file in `languages/` and update the import in `index.js`.

## Backward Compatibility

The `index.js` file maintains full backward compatibility with existing code that imports from `src/data/readingTexts.js`. The API is identical:

```javascript
// Both work the same:
import { readingTextsByLanguage } from './src/data/readingTexts.js'; // Old
import { readingTextsByLanguage } from './src/data/readingTexts/index.js'; // New
```
