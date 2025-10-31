import hebrewPack from './hebrew.js';
import englishPack from './english.js';
import mandarinPack from './mandarin.js';
import hindiPack from './hindi.js';
import spanishPack from './spanish.js';
import frenchPack from './french.js';
import arabicPack from './arabic.js';
import bengaliPack from './bengali.js';
import portuguesePack from './portuguese.js';
import russianPack from './russian.js';
import japanesePack from './japanese.js';

export const languagePacks = {
  [hebrewPack.id]: hebrewPack,
  [englishPack.id]: englishPack,
  [mandarinPack.id]: mandarinPack,
  [hindiPack.id]: hindiPack,
  [spanishPack.id]: spanishPack,
  [frenchPack.id]: frenchPack,
  [arabicPack.id]: arabicPack,
  [bengaliPack.id]: bengaliPack,
  [portuguesePack.id]: portuguesePack,
  [russianPack.id]: russianPack,
  [japanesePack.id]: japanesePack
};

export const defaultLanguageId = hebrewPack.id;

export function getLanguageDefinition(languageId) {
  return languagePacks[languageId] ?? null;
}
