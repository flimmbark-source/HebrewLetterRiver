import { getTargetLinesForPack } from '../targetLanguages/index.js';

function isDistractorLineId(id) {
  return typeof id === 'string' && id.startsWith('distractor_');
}

function collectRequiredLineIds(blueprint) {
  const ids = new Set();
  for (const beat of blueprint.beats || []) {
    if (beat.cueLineId && !isDistractorLineId(beat.cueLineId)) {
      ids.add(beat.cueLineId);
    }
    if (beat.activeLineId && !isDistractorLineId(beat.activeLineId)) {
      ids.add(beat.activeLineId);
    }
    if (Array.isArray(beat.answerLineIds)) {
      for (const id of beat.answerLineIds) {
        if (id && !isDistractorLineId(id)) ids.add(id);
      }
    }
    if (beat.correctLineId && !isDistractorLineId(beat.correctLineId)) {
      ids.add(beat.correctLineId);
    }
    if (Array.isArray(beat.options)) {
      for (const opt of beat.options) {
        if (opt && opt.lineId && !isDistractorLineId(opt.lineId)) {
          ids.add(opt.lineId);
        }
      }
    }
  }
  return Array.from(ids);
}

/**
 * Resolve all non-distractor target-language lines required by a blueprint.
 *
 * @returns {{ status: 'ok', targetLines: Object } |
 *           { status: 'missing_target_realization', packId, targetLanguageId, missingLineIds: string[] }}
 */
export function resolveTargetLines(blueprint, targetLanguageId) {
  const packId = blueprint.packId;
  const linesByPack = getTargetLinesForPack(targetLanguageId, packId);
  const required = collectRequiredLineIds(blueprint);

  if (!linesByPack) {
    return {
      status: 'missing_target_realization',
      packId,
      targetLanguageId,
      missingLineIds: required,
    };
  }

  const targetLines = {};
  const missing = [];
  for (const id of required) {
    const line = linesByPack[id];
    if (!line) {
      missing.push(id);
    } else {
      targetLines[id] = line;
    }
  }

  if (missing.length > 0) {
    return {
      status: 'missing_target_realization',
      packId,
      targetLanguageId,
      missingLineIds: missing,
    };
  }

  return { status: 'ok', targetLines };
}

export const __testing = { collectRequiredLineIds };
