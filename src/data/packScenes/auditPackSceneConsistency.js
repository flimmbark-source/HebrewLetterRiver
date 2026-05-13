// Pack Scene / Bridge Builder consistency audit.
//
// For each registered Pack Scene, this audit confirms:
//
//   1. Every wordId in the consolidated Bridge Builder pack has an
//      entry in bridgeWordConceptMap[packId].
//   2. Every concept those wordIds map to appears in
//      blueprint.packConceptIds.
//   3. blueprint.packConceptIds contains no stale concepts — i.e. no
//      concept that does not correspond to any wordId in the
//      consolidated pack.
//
// supportConceptIds are intentionally ignored. They cover linguistic
// glue (please, yes, thank-you, etc.) that does not need to come from
// the pack itself.

import { bridgeWordConceptMap } from './bridgeWordConceptMap.js';
import { bridgeBuilderPacks } from '../bridgeBuilderPackConsolidation.js';
import { getBlueprintForPack, listBlueprintPackIds } from './blueprintRegistry.js';

function getConsolidatedPack(packId) {
  return bridgeBuilderPacks.find((pack) => pack.id === packId) || null;
}

function err(code, message, extras = {}) {
  return { code, message, ...extras };
}

/**
 * Audit a single Pack Scene against its consolidated Bridge Builder pack.
 *
 * @param {string} packId
 * @returns {{ status: 'ok' } | { status: 'inconsistent', errors: Array }}
 */
export function auditPackSceneForPack(packId) {
  const errors = [];

  const blueprint = getBlueprintForPack(packId);
  if (!blueprint) {
    errors.push(err('missing_blueprint', `No blueprint registered for pack '${packId}'`, { packId }));
    return { status: 'inconsistent', errors };
  }

  const pack = getConsolidatedPack(packId);
  if (!pack) {
    errors.push(
      err('missing_consolidated_pack', `No consolidated Bridge Builder pack found for '${packId}'`, {
        packId,
      })
    );
    return { status: 'inconsistent', errors };
  }

  const wordMap = bridgeWordConceptMap[packId];
  if (!wordMap) {
    errors.push(
      err(
        'missing_word_concept_map',
        `bridgeWordConceptMap has no entry for pack '${packId}'`,
        { packId }
      )
    );
    return { status: 'inconsistent', errors };
  }

  const wordIds = pack.wordIds || [];
  const mappedConcepts = new Set();

  for (const wordId of wordIds) {
    const conceptId = wordMap[wordId];
    if (!conceptId) {
      errors.push(
        err(
          'unmapped_word_id',
          `Bridge Builder wordId '${wordId}' in pack '${packId}' has no entry in bridgeWordConceptMap`,
          { packId, wordId }
        )
      );
      continue;
    }
    mappedConcepts.add(conceptId);
  }

  const blueprintPackConcepts = new Set(blueprint.packConceptIds || []);

  for (const conceptId of mappedConcepts) {
    if (!blueprintPackConcepts.has(conceptId)) {
      errors.push(
        err(
          'missing_pack_concept_in_blueprint',
          `Concept '${conceptId}' is mapped from a wordId in pack '${packId}' but is missing from blueprint.packConceptIds`,
          { packId, conceptId }
        )
      );
    }
  }

  for (const conceptId of blueprintPackConcepts) {
    if (!mappedConcepts.has(conceptId)) {
      errors.push(
        err(
          'stale_pack_concept_in_blueprint',
          `Concept '${conceptId}' appears in blueprint.packConceptIds for pack '${packId}' but is not produced by any wordId in the consolidated pack`,
          { packId, conceptId }
        )
      );
    }
  }

  if (errors.length > 0) {
    return { status: 'inconsistent', errors };
  }
  return { status: 'ok' };
}

/**
 * Audit every registered Pack Scene blueprint.
 *
 * @returns {{ status: 'ok' } | { status: 'inconsistent', errors: Array }}
 */
export function auditAllRegisteredPackScenes() {
  const errors = [];
  for (const packId of listBlueprintPackIds()) {
    const result = auditPackSceneForPack(packId);
    if (result.status !== 'ok') {
      for (const e of result.errors) errors.push(e);
    }
  }
  if (errors.length > 0) {
    return { status: 'inconsistent', errors };
  }
  return { status: 'ok' };
}
