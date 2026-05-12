import { packSceneDefinitions } from './packSceneDefinitions.js';
import { hebrewPackSceneLines } from './languages/hebrew.js';

const linesByLanguage = {
  hebrew: hebrewPackSceneLines,
};

function resolveSceneId(packId) {
  if (packId === 'food_01') return 'food_01.cafe_order_basic';
  return null;
}

/**
 * Returns the full resolved Pack Scene for a given pack and language.
 * Each resolved beat has:
 *   activeLine — the line being produced/understood
 *   cueLine    — the prior line providing context (null for opening beats)
 *
 * @param {string} packId
 * @param {string} practiceLanguageId
 * @returns {{ definition, lines, resolvedBeats, coverage } | null}
 */
export function getPackSceneForPack(packId, practiceLanguageId) {
  const sceneId = resolveSceneId(packId);
  if (!sceneId) return null;

  const definition = packSceneDefinitions[sceneId];
  if (!definition) return null;

  const lines = linesByLanguage[practiceLanguageId];
  if (!lines) return null;

  const resolvedBeats = definition.beats
    .map((beat) => {
      const activeLine = lines[beat.activeLineId];
      if (!activeLine) return null;
      const cueLine = beat.cueLineId ? (lines[beat.cueLineId] ?? null) : null;
      return { ...beat, activeLine, cueLine };
    })
    .filter(Boolean);

  return {
    definition,
    lines,
    resolvedBeats,
    coverage: definition.targetConceptIds,
  };
}

/**
 * Converts a Pack Scene line to the shape BuildLine expects.
 *
 * TODO(pack-scene): Remove after BuildLine supports targetText/supportText directly.
 */
export function packSceneLineToConversationLine(line, lineId) {
  return {
    id: lineId,
    he: line.targetText,
    tl: line.transliteration,
    en: line.supportText,
    sentenceData: {
      id: lineId,
      hebrew: line.targetText,
      english: line.supportText,
      words: line.tokens.map((token) => ({
        surface: token.text,
        text: token.text,
        hebrew: token.text,
        conceptId: token.conceptId,
      })),
    },
  };
}
