import hebrewPack from './hebrew.js';

export const languagePacks = {
  [hebrewPack.id]: hebrewPack
};

export const defaultLanguageId = hebrewPack.id;

export function getLanguageDefinition(languageId) {
  return languagePacks[languageId] ?? null;
}
