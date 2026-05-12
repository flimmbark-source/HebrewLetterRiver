import { describe, it, expect } from 'vitest';
import { validateBlueprint } from './validateBlueprint.js';
import { colors_01Blueprint } from '../blueprints/colors_01.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

describe('Phase 2.1: identify archetype rules', () => {
  it('colors_01 passes identify archetype rules', () => {
    const result = validateBlueprint(colors_01Blueprint);
    expect(result.status).toBe('ok');
  });

  it('fails when a packConcept never appears in an answer beat', () => {
    const bp = clone(colors_01Blueprint);
    bp.beats = bp.beats.filter((b) => b.id !== 'identify_yellow');
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) =>
          e.code === 'identify_pack_concept_not_produced' && e.message.includes('yellow')
      )
    ).toBe(true);
  });

  it('fails when there is no chooseReply or buildLine answer beat at all', () => {
    const bp = clone(colors_01Blueprint);
    bp.beats = bp.beats.map((b) => ({ ...b, actionType: 'spotPackWords' }));
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'identify_missing_answer_beat')).toBe(true);
  });

  it('fails when a colorCircle visualCue is missing colorConceptId', () => {
    const bp = clone(colors_01Blueprint);
    bp.beats[0].visualCue = { type: 'colorCircle' };
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'invalid_color_circle_cue')).toBe(true);
  });

  it('fails when a visualCue.type is not supported', () => {
    const bp = clone(colors_01Blueprint);
    bp.beats[0].visualCue = { type: 'mysteryCue' };
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'unsupported_visual_cue_type')).toBe(true);
  });

  it('fails when colorCircle.colorConceptId does not appear in beat.targetConceptIds', () => {
    const bp = clone(colors_01Blueprint);
    const beat = bp.beats.find((b) => b.id === 'identify_red');
    beat.visualCue.colorConceptId = 'blue';
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'visual_cue_concept_mismatch')).toBe(true);
  });
});
