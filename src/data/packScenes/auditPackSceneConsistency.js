// Pack Scene / Vocab Pack consistency audit.
//
// For every registered Pack Scene, resolves the matching Bridge Builder pack's
// consolidated wordIds, maps them to Pack Scene concept IDs via
// BRIDGE_WORD_TO_PACK_SCENE_CONCEPT, and compares the result against the
// blueprint's packConceptIds.
//
// Error codes:
//   missing_bridge_pack          — no Bridge Builder pack matches the packId
//   missing_word_concept_mapping — a wordId has no entry in the concept map
//   missing_pack_concept         — blueprint is missing a concept the pack has
//   stale_pack_concept           — blueprint lists a concept the pack no longer has
//
// Usage (real-world):  auditPackSceneConsistency()
// Usage (override):    auditPackSceneConsistency({ getBlueprintFn, getPackFn })

import { listBlueprintPackIds, getBlueprintForPack } from './blueprintRegistry.js';
import { getConsolidatedPackById } from '../bridgeBuilderPackConsolidation.js';
import { BRIDGE_WORD_TO_PACK_SCENE_CONCEPT } from './bridgeWordConceptMap.js';

/**
 * @param {object} [options]
 * @param {Function} [options.getBlueprintFn]  packId → blueprint  (default: registry)
 * @param {Function} [options.getPackFn]       packId → consolidated pack  (default: consolidation)
 * @param {object}   [options.conceptMap]      wordId → conceptId  (default: BRIDGE_WORD_TO_PACK_SCENE_CONCEPT)
 * @param {string[]} [options.packIds]         limit audit to these IDs  (default: all registered)
 * @returns {Array<AuditResult>}
 */
export function auditPackSceneConsistency({
  getBlueprintFn = getBlueprintForPack,
  getPackFn = getConsolidatedPackById,
  conceptMap = BRIDGE_WORD_TO_PACK_SCENE_CONCEPT,
  packIds = null,
} = {}) {
  const ids = packIds ?? listBlueprintPackIds();
  const results = [];

  for (const packId of ids) {
    const blueprint = getBlueprintFn(packId);
    const pack = getPackFn(packId);

    if (!pack) {
      results.push({
        packId,
        status: 'missing_bridge_pack',
        errors: [{ code: 'missing_bridge_pack', packId }],
        wordIds: [],
        mappedConceptIds: [],
        blueprintConceptIds: blueprint?.packConceptIds ?? [],
      });
      continue;
    }

    const errors = [];
    const mappedConceptIds = [];
    const conceptToWordId = {};

    for (const wordId of pack.wordIds || []) {
      if (!(wordId in conceptMap)) {
        errors.push({ code: 'missing_word_concept_mapping', packId, wordId });
      } else {
        const conceptId = conceptMap[wordId];
        if (!mappedConceptIds.includes(conceptId)) {
          mappedConceptIds.push(conceptId);
          conceptToWordId[conceptId] = wordId;
        }
      }
    }

    if (errors.length > 0) {
      results.push({
        packId,
        status: 'mapping_error',
        errors,
        wordIds: pack.wordIds,
        mappedConceptIds,
        blueprintConceptIds: blueprint?.packConceptIds ?? [],
      });
      continue;
    }

    const mappedSet = new Set(mappedConceptIds);
    const blueprintSet = new Set(blueprint?.packConceptIds ?? []);

    for (const conceptId of mappedSet) {
      if (!blueprintSet.has(conceptId)) {
        errors.push({
          code: 'missing_pack_concept',
          packId,
          conceptId,
          sourceWordId: conceptToWordId[conceptId],
        });
      }
    }

    for (const conceptId of blueprintSet) {
      if (!mappedSet.has(conceptId)) {
        errors.push({ code: 'stale_pack_concept', packId, conceptId });
      }
    }

    results.push({
      packId,
      status: errors.length > 0 ? 'mismatch' : 'ok',
      errors,
      wordIds: pack.wordIds,
      mappedConceptIds,
      blueprintConceptIds: blueprint?.packConceptIds ?? [],
    });
  }

  return results;
}
