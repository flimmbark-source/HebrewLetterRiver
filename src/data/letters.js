import { loadLanguage } from '../lib/languageLoader.js';

const languagePack = loadLanguage();

export const letters = (languagePack.items ?? []).map((item) => ({
  id: item.id,
  hebrew: item.symbol ?? item.id,
  name: item.name ?? item.id
}));

export const letterMap = letters.reduce((acc, letter) => {
  acc[letter.id] = letter;
  acc[letter.hebrew] = letter;
  return acc;
}, {});
