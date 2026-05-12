import { hebrewTargetLines } from './hebrew/index.js';

const TARGET_LINES_BY_LANGUAGE = {
  hebrew: hebrewTargetLines,
};

export function getTargetLinesForPack(targetLanguageId, packId) {
  const byPack = TARGET_LINES_BY_LANGUAGE[targetLanguageId];
  if (!byPack) return null;
  return byPack[packId] || null;
}

export function hasTargetLanguage(targetLanguageId) {
  return Boolean(TARGET_LINES_BY_LANGUAGE[targetLanguageId]);
}
