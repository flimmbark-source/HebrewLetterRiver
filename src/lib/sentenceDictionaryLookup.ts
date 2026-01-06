import { getReadingTextsForLanguage } from '../data/readingTexts/index.js';
import { getLanguageCode } from './languageUtils.js';
import { normalizeForLanguage } from './readingUtils.js';

export function findDictionaryEntryForWord(wordId, practiceLanguageId, appLanguageId, t) {
  if (!wordId) return null;
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);
  const langCode = getLanguageCode(appLanguageId);

  for (const text of readingTexts) {
    if (!text.tokens) continue;
    const hasWord = text.tokens.some(token => token.type === 'word' && token.id === wordId);
    if (!hasWord) continue;

    const translations = text.translations?.[appLanguageId] || text.translations?.[langCode];
    const canonical = translations?.[wordId]?.canonical;
    const meaningKey = text.meaningKeys?.[wordId];
    const meaning = meaningKey ? t(meaningKey) : null;

    return {
      practiceWord: text.tokens.find(token => token.id === wordId)?.text ?? wordId,
      canonical: canonical ? normalizeForLanguage(canonical, appLanguageId) : null,
      meaning: meaning && meaning !== meaningKey ? meaning : null,
      sourceTitle: text.title?.[langCode] || text.title?.[appLanguageId] || text.id
    };
  }

  return null;
}
