import ar from './ar.json';
import bn from './bn.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import he from './he.json';
import hi from './hi.json';
import ja from './ja.json';
import pt from './pt.json';
import ru from './ru.json';
import zh from './zh.json';

const wordPacksByIso = {
  ar,
  bn,
  en,
  es,
  fr,
  he,
  hi,
  ja,
  pt,
  ru,
  zh
};

const languageIdToIsoCode = {
  arabic: 'ar',
  bengali: 'bn',
  english: 'en',
  french: 'fr',
  hebrew: 'he',
  hindi: 'hi',
  japanese: 'ja',
  mandarin: 'zh',
  portuguese: 'pt',
  russian: 'ru',
  spanish: 'es'
};

export function getWordPack(languageId) {
  const isoCode = languageIdToIsoCode[languageId];
  if (!isoCode) return null;
  return wordPacksByIso[isoCode] ?? null;
}

export function getWordPackByIso(isoCode) {
  return wordPacksByIso[isoCode] ?? null;
}

export const supportedWordLanguages = Object.keys(languageIdToIsoCode);
