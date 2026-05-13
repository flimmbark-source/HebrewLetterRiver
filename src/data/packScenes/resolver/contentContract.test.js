import { describe, it, expect } from 'vitest';
import { validateBlueprint } from './validateBlueprint.js';
import { food_01Blueprint } from '../blueprints/food_01.js';
import { colors_01Blueprint } from '../blueprints/colors_01.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

describe('Phase 1.1-1.4: contentContract validation', () => {
  it('food_01 carries a contentContract with the expected sceneModel', () => {
    expect(food_01Blueprint.contentContract.sceneModel).toBe('transactional-choice');
    expect(food_01Blueprint.contentContract.correctnessSource).toBe('conversational-fit');
  });

  it('colors_01 carries a contentContract with the expected sceneModel', () => {
    expect(colors_01Blueprint.contentContract.sceneModel).toBe('grounded-identification');
    expect(colors_01Blueprint.contentContract.correctnessSource).toBe('visualCue');
  });

  it('fails when contentContract is missing', () => {
    const bp = clone(food_01Blueprint);
    delete bp.contentContract;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'missing_content_contract')).toBe(true);
  });

  it('fails when a machine-checked contract field is missing', () => {
    const bp = clone(food_01Blueprint);
    delete bp.contentContract.sceneModel;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) => e.code === 'missing_contract_field' && e.message.includes('sceneModel')
      )
    ).toBe(true);
  });

  it('fails when sceneModel is not registered', () => {
    const bp = clone(food_01Blueprint);
    bp.contentContract.sceneModel = 'imaginary-model';
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'unknown_scene_model')).toBe(true);
  });

  it('fails when sceneModel does not match the archetype', () => {
    const bp = clone(food_01Blueprint);
    bp.contentContract.sceneModel = 'grounded-identification';
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'scene_model_archetype_mismatch')).toBe(true);
  });

  it('fails when correctnessSource is not registered', () => {
    const bp = clone(food_01Blueprint);
    bp.contentContract.correctnessSource = 'gut-feeling';
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'unknown_correctness_source')).toBe(true);
  });

  it('fails when answerPolicy is not registered', () => {
    const bp = clone(food_01Blueprint);
    bp.contentContract.answerPolicy = 'flip-a-coin';
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'unknown_answer_policy')).toBe(true);
  });

  it('fails when coverage is not registered', () => {
    const bp = clone(food_01Blueprint);
    bp.contentContract.coverage = 'half-the-words';
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'unknown_coverage_policy')).toBe(true);
  });

  it('fails when maxBeats is exceeded', () => {
    const bp = clone(colors_01Blueprint);
    bp.contentContract.maxBeats = 1;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'too_many_beats')).toBe(true);
  });

  it('fails when maxBeats is not a positive integer', () => {
    const bp = clone(food_01Blueprint);
    bp.contentContract.maxBeats = 0;
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'invalid_max_beats')).toBe(true);
  });
});

describe('Phase 1.1: concept id existence validation', () => {
  it('fails when packConceptIds contains an unknown concept id', () => {
    const bp = clone(food_01Blueprint);
    bp.packConceptIds = [...bp.packConceptIds, 'unicorn'];
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) => e.code === 'unknown_concept_id' && e.message.includes('unicorn')
      )
    ).toBe(true);
  });

  it('fails when a beat targetConceptIds contains an unknown concept id', () => {
    const bp = clone(food_01Blueprint);
    bp.beats[0].targetConceptIds = ['coffee', 'imaginary-concept'];
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) => e.code === 'unknown_concept_id' && e.message.includes('imaginary-concept')
      )
    ).toBe(true);
  });

  it('fails when a buildLine acceptedConceptSet contains an unknown id', () => {
    const bp = clone(food_01Blueprint);
    const beat = bp.beats.find((b) => b.actionType === 'buildLine');
    beat.acceptedConceptSets = [['coffee', 'mystery']];
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) => e.code === 'unknown_concept_id' && e.message.includes('mystery')
      )
    ).toBe(true);
  });

  it('fails when a visualCue colorConceptId is unknown', () => {
    const bp = clone(colors_01Blueprint);
    bp.beats[0].visualCue = { type: 'colorCircle', colorConceptId: 'magenta' };
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) => e.code === 'unknown_concept_id' && e.message.includes('magenta')
      )
    ).toBe(true);
  });
});
