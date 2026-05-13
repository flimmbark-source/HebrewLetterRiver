import { describe, it, expect } from 'vitest';
import { validateBlueprint } from './validateBlueprint.js';
import { COUNT_DOTS_CONCEPT_BY_COUNT, COUNT_DOTS_MAX } from '../visualCueConstants.js';

// Minimal helper that builds a valid-shape identify blueprint with a
// single countDots beat. Tests can then mutate the cue to exercise the
// archetype rules.
function makeBlueprint({ count, conceptId, targetConceptIds }) {
  const concept = conceptId ?? COUNT_DOTS_CONCEPT_BY_COUNT[count];
  const targets = targetConceptIds ?? [concept];
  return {
    packId: 'count_dots_fixture',
    archetype: 'identify',
    domainId: 'numbers',
    goalId: 'identify_basic_numbers',
    packConceptIds: [concept],
    supportConceptIds: ['thank-you'],
    contentContract: {
      vocabularyType: 'cardinal-numbers',
      sceneModel: 'grounded-identification',
      correctnessSource: 'visualCue',
      answerPolicy: 'one-correct-per-beat',
      coverage: 'all-pack-concepts-produced',
      maxBeats: 6,
    },
    beats: [
      {
        id: `identify_${concept}`,
        role: 'choose_or_build_response',
        actionType: 'chooseReply',
        cueLineId: 'friend_how_many',
        visualCue: { type: 'countDots', count, conceptId: concept },
        targetConceptIds: targets,
        options: [
          { id: 'correct', lineId: `player_${concept}`, isCorrect: true },
          { id: 'wrong_home', lineId: 'distractor_i_am_home', isCorrect: false },
        ],
      },
    ],
  };
}

describe('Phase 5: countDots visual cue', () => {
  it('exposes COUNT_DOTS_CONCEPT_BY_COUNT for 1..5', () => {
    expect(COUNT_DOTS_CONCEPT_BY_COUNT[1]).toBe('one');
    expect(COUNT_DOTS_CONCEPT_BY_COUNT[2]).toBe('two');
    expect(COUNT_DOTS_CONCEPT_BY_COUNT[3]).toBe('three');
    expect(COUNT_DOTS_CONCEPT_BY_COUNT[4]).toBe('four');
    expect(COUNT_DOTS_CONCEPT_BY_COUNT[5]).toBe('five');
    expect(COUNT_DOTS_MAX).toBe(5);
  });

  // Note: validating a fully-typed countDots blueprint end-to-end
  // requires the 'one'..'five' concepts to be registered, which is
  // landing in Session 3. For Session 2, the renderer change and
  // unit-level cue checks are sufficient; the concept-id-existence
  // check still guards Session 3's blueprint.

  it('fails when countDots.count is out of supported range', () => {
    // 'one' is not yet a registered concept, so the validator will
    // also report unknown_concept_id; the rule we care about is the
    // count-range rule, which must still fire.
    const bp = makeBlueprint({ count: 6, conceptId: 'six' });
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) => e.code === 'invalid_count_dots_cue' && e.message.includes('between 1 and 5')
      )
    ).toBe(true);
  });

  it('fails when countDots.count is not an integer', () => {
    const bp = makeBlueprint({ count: 2.5, conceptId: 'two-and-a-half' });
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) => e.code === 'invalid_count_dots_cue' && e.message.includes('integer')
      )
    ).toBe(true);
  });

  it('fails when countDots.conceptId does not match COUNT_DOTS_CONCEPT_BY_COUNT', () => {
    // count=3 but conceptId='four' — must report mismatch even if
    // 'four' is otherwise a registered concept later.
    const bp = makeBlueprint({ count: 3, conceptId: 'four', targetConceptIds: ['four'] });
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) =>
          e.code === 'visual_cue_concept_mismatch' && e.message.includes("'three'")
      )
    ).toBe(true);
  });

  it('fails when countDots.conceptId is missing from beat.targetConceptIds', () => {
    const bp = makeBlueprint({ count: 3, conceptId: 'three', targetConceptIds: ['four'] });
    const result = validateBlueprint(bp);
    expect(result.status).toBe('invalid_blueprint');
    expect(
      result.errors.some(
        (e) =>
          e.code === 'visual_cue_concept_mismatch' &&
          e.message.includes('must appear in beat.targetConceptIds')
      )
    ).toBe(true);
  });
});
