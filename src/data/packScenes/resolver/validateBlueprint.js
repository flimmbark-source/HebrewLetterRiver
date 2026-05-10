import { runUniversalBeatRules } from './validationRules.js';
import { choiceArchetype } from '../archetypes/choice.js';
import { requestArchetype } from '../archetypes/request.js';
import { identifyArchetype } from '../archetypes/identify.js';
import { socialExchangeArchetype } from '../archetypes/socialExchange.js';

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

function pushError(errors, code, message, beatId) {
  const out = { code, message };
  if (beatId) out.beatId = beatId;
  errors.push(out);
}

/**
 * Validate a Pack Scene blueprint.
 * Runs:
 *   1. Top-level field presence
 *   2. Universal beat rules (validationRules.js)
 *   3. Archetype-specific rules (archetypes/<archetype>.js)
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
    if (Array.isArray(value) && value.length === 0) {
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

  if (errors.length > 0) {
    return { status: 'invalid_blueprint', errors };
  }
  return { status: 'ok' };
}
