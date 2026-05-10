import { describe, it, expect } from 'vitest';
import { validateBlueprint } from './validateBlueprint.js';
import { food_01Blueprint } from '../blueprints/food_01.js';
import { runUniversalBeatRules } from './validationRules.js';
import { choiceArchetype } from '../archetypes/choice.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

describe('Phase 2A: validateBlueprint', () => {
  it('accepts the food_01 blueprint as ok', () => {
    const result = validateBlueprint(food_01Blueprint);
    expect(result.status).toBe('ok');
  });

  it('food_01 blueprint contains no Hebrew target text', () => {
    const serialized = JSON.stringify(food_01Blueprint);
    // Reject any Hebrew code points (U+0590..U+05FF)
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  it('fails when packId is removed', () => {
    const bp = clone(food_01Blueprint);
    delete bp.packId;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'missing_field' && e.message.includes('packId'))).toBe(true);
  });

  it('fails when packConceptIds is removed', () => {
    const bp = clone(food_01Blueprint);
    delete bp.packConceptIds;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.message.includes('packConceptIds'))).toBe(true);
  });

  it('fails when supportConceptIds is removed', () => {
    const bp = clone(food_01Blueprint);
    delete bp.supportConceptIds;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.message.includes('supportConceptIds'))).toBe(true);
  });

  it('fails when meaningChoice has no targetConceptIds', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'meaningChoice');
    delete beat.targetConceptIds;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'missing_target_concepts')).toBe(true);
  });

  it('fails when buildLine has no answerLineIds', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'buildLine');
    delete beat.answerLineIds;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'missing_answer_line_ids')).toBe(true);
  });

  it('fails when buildLine has neither acceptedConceptSets nor acceptedConceptSequences', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'buildLine');
    delete beat.acceptedConceptSets;
    delete beat.acceptedConceptSequences;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'missing_accepted_concepts')).toBe(true);
  });

  it('fails when chooseReply has both options and replyDistractorPolicy', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'chooseReply');
    beat.replyDistractorPolicy = { count: 2 };
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'conflicting_reply_source')).toBe(true);
  });

  it('fails when chooseReply has neither options nor replyDistractorPolicy', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'chooseReply');
    delete beat.options;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'missing_reply_source')).toBe(true);
  });

  it('fails when notice_options beat has only 1 targetConceptId', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.role === 'notice_options');
    beat.targetConceptIds = ['coffee'];
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'notice_options_too_few_concepts')).toBe(true);
  });

  it('fails when chooseReply has more than one correct option', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'chooseReply');
    beat.options = beat.options.map((opt) => ({ ...opt, isCorrect: true }));
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'invalid_correct_count')).toBe(true);
  });

  it('fails when chooseReply has no correct option', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'chooseReply');
    beat.options = beat.options.map((opt) => ({ ...opt, isCorrect: false }));
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'invalid_correct_count')).toBe(true);
  });

  it('fails when buildLine has replyDistractorPolicy', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'buildLine');
    beat.replyDistractorPolicy = { count: 2 };
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'misplaced_distractor_policy')).toBe(true);
  });

  it('fails when chooseReply has tileDistractorPolicy', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'chooseReply');
    beat.tileDistractorPolicy = { count: 2 };
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'misplaced_distractor_policy')).toBe(true);
  });

  it('fails when spotPackWords has a tileDistractorPolicy', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'spotPackWords');
    beat.tileDistractorPolicy = { count: 2 };
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'misplaced_distractor_policy')).toBe(true);
  });

  it('fails on unknown archetype', () => {
    const bp = clone(food_01Blueprint);
    bp.archetype = 'unknown_archetype';
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'unknown_archetype')).toBe(true);
  });
});

describe('Phase 2A: rule wiring', () => {
  it('runUniversalBeatRules is callable and returns errors for a bad beat', () => {
    const errors = runUniversalBeatRules({ id: 'x', actionType: 'meaningChoice' });
    expect(Array.isArray(errors)).toBe(true);
    expect(errors.some((e) => e.code === 'missing_target_concepts')).toBe(true);
  });

  it('choiceArchetype rules are callable and detect a missing notice_options beat', () => {
    const blueprint = { beats: [{ id: 'a', role: 'choose_or_build_response' }] };
    const errors = choiceArchetype.rules.flatMap((rule) => rule(blueprint));
    expect(errors.some((e) => e.code === 'missing_notice_options')).toBe(true);
  });
});
