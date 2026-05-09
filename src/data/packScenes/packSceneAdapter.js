import { packSceneDefinitions } from './packSceneDefinitions.js';
import { hebrewPackSceneLines } from './languages/hebrew.js';

const linesByLanguage = {
  hebrew: hebrewPackSceneLines,
};

// Maps a packId to the scene ID for that pack.
// Extend this as more scenes are added per pack.
function resolveSceneId(packId) {
  if (packId === 'food_01') return 'food_01.cafe_order_basic';
  return null;
}

/**
 * Returns the full resolved Pack Scene for a given pack and language.
 *
 * @param {string} packId
 * @param {string} practiceLanguageId
 * @returns {{ definition, lines, resolvedMoments, coverage } | null}
 */
export function getPackSceneForPack(packId, practiceLanguageId) {
  const sceneId = resolveSceneId(packId);
  if (!sceneId) return null;

  const definition = packSceneDefinitions[sceneId];
  if (!definition) return null;

  const lines = linesByLanguage[practiceLanguageId];
  if (!lines) return null;

  const resolvedMoments = definition.moments
    .map((moment) => {
      const line = lines[moment.lineId];
      if (!line) return null;
      return { ...moment, line };
    })
    .filter(Boolean);

  return {
    definition,
    lines,
    resolvedMoments,
    coverage: definition.targetConceptIds,
  };
}

/**
 * Converts a Pack Scene line to a shape compatible with existing conversation modules
 * (ListenMeaningChoice, BuildLine) that expect `he`, `tl`, `en`, and `sentenceData`.
 *
 * TODO(pack-scene): Remove Hebrew-shaped compatibility aliases after conversation
 * modules support targetText/supportText directly.
 */
export function packSceneLineToConversationLine(line, lineId) {
  return {
    id: lineId,
    he: line.targetText,       // TODO(pack-scene): compatibility alias — remove when modules support targetText
    tl: line.transliteration,
    en: line.supportText,
    sentenceData: {
      id: lineId,
      hebrew: line.targetText, // TODO(pack-scene): compatibility alias — remove when modules support targetText
      english: line.supportText,
      words: line.tokens.map((token) => ({
        surface: token.text,
        text: token.text,
        hebrew: token.text,    // TODO(pack-scene): compatibility alias
        conceptId: token.conceptId,
      })),
    },
  };
}
