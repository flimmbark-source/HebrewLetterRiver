import { runUniversalBeatRules } from './validationRules.js';
import { choiceArchetype } from '../archetypes/choice.js';
import { requestArchetype } from '../archetypes/request.js';
import { identifyArchetype } from '../archetypes/identify.js';
import { socialExchangeArchetype } from '../archetypes/socialExchange.js';
import { isKnownConceptId } from '../concepts.js';
import {
  SCENE_MODEL_ARCHETYPE_MAP,
  KNOWN_CORRECTNESS_SOURCES,
  KNOWN_ANSWER_POLICIES,
  KNOWN_COVERAGE_POLICIES,
  MACHINE_CHECKED_CONTRACT_FIELDS,
} from '../contentContract.js';

const ARCHETYPES = {
  [choiceArchetype.id]: choiceArchetype,
  [requestArchetype.id]: requestArchetype,
  [identifyArchetype.id]: identifyArchetype,
  [socialExchangeArchetype.id]: socialExchangeArchetype,
};

const REQUIRED_TOP_LEVEL_FIELDS = [
  'packId',
  'archetype',
  'domainId',
  'goalId',
  'beats',
  'packConceptIds',
  'supportConceptIds',
];

// Fields that are required to be present but may legitimately be empty arrays.
// e.g. supportConceptIds: [] is valid for scenes that need no borrowed support vocabulary.
const FIELDS_ALLOWING_EMPTY_ARRAY = new Set(['supportConceptIds']);

function pushError(errors, code, message, beatId) {
  const out = { code, message };
  if (beatId) out.beatId = beatId;
  errors.push(out);
}

function collectReferencedConceptIds(blueprint) {
  // Returns array of { conceptId, where } so error messages can be specific.
  const refs = [];
  const push = (conceptId, where) => {
    if (typeof conceptId === 'string' && conceptId.length > 0) {
      refs.push({ conceptId, where });
    }
  };

  for (const id of blueprint.packConceptIds || []) push(id, 'packConceptIds');
  for (const id of blueprint.supportConceptIds || []) push(id, 'supportConceptIds');

  for (const beat of blueprint.beats || []) {
    if (!beat || typeof beat !== 'object') continue;
    const where = `beat ${beat.id || '?'}`;
    for (const id of beat.targetConceptIds || []) push(id, `${where}.targetConceptIds`);
    if (beat.visualCue) {
      if (beat.visualCue.colorConceptId) push(beat.visualCue.colorConceptId, `${where}.visualCue.colorConceptId`);
      if (beat.visualCue.conceptId) push(beat.visualCue.conceptId, `${where}.visualCue.conceptId`);
      if (beat.visualCue.objectConceptId) push(beat.visualCue.objectConceptId, `${where}.visualCue.objectConceptId`);
    }
    for (const set of beat.acceptedConceptSets || []) {
      if (Array.isArray(set)) {
        for (const id of set) push(id, `${where}.acceptedConceptSets`);
      }
    }
    for (const seq of beat.acceptedConceptSequences || []) {
      if (Array.isArray(seq)) {
        for (const id of seq) push(id, `${where}.acceptedConceptSequences`);
      }
    }
  }
  return refs;
}

function validateContentContract(blueprint, errors) {
  const contract = blueprint.contentContract;
  if (!contract || typeof contract !== 'object') {
    pushError(errors, 'missing_content_contract', 'Blueprint is missing required contentContract');
    return;
  }

  for (const field of MACHINE_CHECKED_CONTRACT_FIELDS) {
    if (contract[field] === undefined || contract[field] === null || contract[field] === '') {
      pushError(errors, 'missing_contract_field', `contentContract is missing required field: ${field}`);
    }
  }

  if (contract.sceneModel) {
    const allowedArchetypes = SCENE_MODEL_ARCHETYPE_MAP[contract.sceneModel];
    if (!allowedArchetypes) {
      pushError(
        errors,
        'unknown_scene_model',
        `contentContract.sceneModel '${contract.sceneModel}' is not registered`
      );
    } else if (blueprint.archetype && !allowedArchetypes.includes(blueprint.archetype)) {
      pushError(
        errors,
        'scene_model_archetype_mismatch',
        `contentContract.sceneModel '${contract.sceneModel}' is not allowed for archetype '${blueprint.archetype}'`
      );
    }
  }

  if (contract.correctnessSource && !KNOWN_CORRECTNESS_SOURCES.has(contract.correctnessSource)) {
    pushError(
      errors,
      'unknown_correctness_source',
      `contentContract.correctnessSource '${contract.correctnessSource}' is not registered`
    );
  }

  if (contract.answerPolicy && !KNOWN_ANSWER_POLICIES.has(contract.answerPolicy)) {
    pushError(
      errors,
      'unknown_answer_policy',
      `contentContract.answerPolicy '${contract.answerPolicy}' is not registered`
    );
  }

  if (contract.coverage && !KNOWN_COVERAGE_POLICIES.has(contract.coverage)) {
    pushError(
      errors,
      'unknown_coverage_policy',
      `contentContract.coverage '${contract.coverage}' is not registered`
    );
  }

  if (contract.maxBeats !== undefined && contract.maxBeats !== null) {
    if (!Number.isInteger(contract.maxBeats) || contract.maxBeats <= 0) {
      pushError(
        errors,
        'invalid_max_beats',
        'contentContract.maxBeats must be a positive integer'
      );
    } else if (Array.isArray(blueprint.beats) && blueprint.beats.length > contract.maxBeats) {
      pushError(
        errors,
        'too_many_beats',
        `Blueprint has ${blueprint.beats.length} beats but contentContract.maxBeats is ${contract.maxBeats}`
      );
    }
  }
}

function validateConceptIdsExist(blueprint, errors) {
  const refs = collectReferencedConceptIds(blueprint);
  const reported = new Set();
  for (const { conceptId, where } of refs) {
    if (isKnownConceptId(conceptId)) continue;
    const key = `${conceptId}@${where}`;
    if (reported.has(key)) continue;
    reported.add(key);
    pushError(
      errors,
      'unknown_concept_id',
      `Unknown concept id '${conceptId}' referenced from ${where}`
    );
  }
}

/**
 * Validate a Pack Scene blueprint.
 * Runs:
 *   1. Top-level field presence
 *   2. Universal beat rules (validationRules.js)
 *   3. Archetype-specific rules (archetypes/<archetype>.js)
 *   4. contentContract structure + scene-model/archetype coherence
 *   5. Concept ID existence (every referenced id must be in concepts.js)
 *
 * @param {object} blueprint
 * @returns {{ status: 'ok' } | { status: 'invalid_blueprint', errors: Array<{code, message, beatId?}> }}
 */
export function validateBlueprint(blueprint) {
  const errors = [];

  if (!blueprint || typeof blueprint !== 'object') {
    return {
      status: 'invalid_blueprint',
      errors: [{ code: 'missing_blueprint', message: 'Blueprint is missing or not an object' }],
    };
  }

  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    const value = blueprint[field];
    if (value === undefined || value === null) {
      pushError(errors, 'missing_field', `Blueprint is missing required field: ${field}`);
      continue;
    }
    if (Array.isArray(value) && value.length === 0 && !FIELDS_ALLOWING_EMPTY_ARRAY.has(field)) {
      pushError(errors, 'empty_field', `Blueprint field ${field} cannot be empty`);
    }
  }

  if (Array.isArray(blueprint.beats)) {
    const seenIds = new Set();
    for (const beat of blueprint.beats) {
      if (!beat || typeof beat !== 'object') {
        pushError(errors, 'invalid_beat', 'Beat entry is not an object');
        continue;
      }
      if (!beat.id) {
        pushError(errors, 'missing_beat_id', 'Beat is missing an id');
      } else if (seenIds.has(beat.id)) {
        pushError(errors, 'duplicate_beat_id', `Duplicate beat id: ${beat.id}`, beat.id);
      } else {
        seenIds.add(beat.id);
      }

      const beatErrors = runUniversalBeatRules(beat);
      for (const e of beatErrors) errors.push(e);
    }
  }

  if (blueprint.archetype) {
    const archetype = ARCHETYPES[blueprint.archetype];
    if (!archetype) {
      pushError(errors, 'unknown_archetype', `Unknown archetype: ${blueprint.archetype}`);
    } else {
      for (const rule of archetype.rules) {
        const ruleErrors = rule(blueprint) || [];
        for (const e of ruleErrors) errors.push(e);
      }
    }
  }

  validateContentContract(blueprint, errors);
  validateConceptIdsExist(blueprint, errors);

  if (errors.length > 0) {
    return { status: 'invalid_blueprint', errors };
  }
  return { status: 'ok' };
}
