import { defaultAppLanguageId } from '../data/languages/index.js';
import { getTranslationsForAppLanguage } from '../data/translations/index.js';
import { getWordPack } from '../data/words/index.js';

export const WHOLE_WORD_MODE_ID = 'whole-words';

function buildWordItems(wordPack, translationMap, fallbackMap) {
  if (!wordPack?.words?.length) return [];
  return wordPack.words.map((word) => {
    const translation = translationMap?.[word.id] ?? fallbackMap?.[word.id] ?? word.id;
    return {
      id: word.id,
      symbol: word.native,
      name: translation,
      transliteration: translation,
      pronunciation: translation,
      sound: translation,
      translation,
      type: 'word'
    };
  });
}

export function buildWholeWordMode(practiceLanguageId, appLanguageId = defaultAppLanguageId) {
  const wordPack = getWordPack(practiceLanguageId);
  if (!wordPack) return null;

  const translationMap = getTranslationsForAppLanguage(appLanguageId);
  const fallbackMap =
    appLanguageId === defaultAppLanguageId
      ? translationMap
      : getTranslationsForAppLanguage(defaultAppLanguageId) ?? null;

  const items = buildWordItems(wordPack, translationMap, fallbackMap);
  if (!items.length) return null;

  return {
    mode: {
      id: WHOLE_WORD_MODE_ID,
      label: 'Whole Word River',
      description: 'Match each word to its meaning.',
      noun: 'word',
      type: 'words'
    },
    items,
    wordPack,
    translationMap: translationMap ?? fallbackMap ?? {}
  };
}
