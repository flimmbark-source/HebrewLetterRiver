import { describe, it, expect } from 'vitest';
import { validateResolvedScene } from './validateResolvedScene.js';

const PACK_CONCEPT_BLUEPRINT = { packConceptIds: ['coffee', 'water', 'bread'] };

describe('Phase 3.1: distractor concept-overlap validation', () => {
  it('flags a chooseReply distractor-pool option that contains a pack concept', () => {
    const beats = [
      {
        id: 'beat_x',
        actionType: 'chooseReply',
        options: [
          {
            id: 'correct',
            lineId: 'player_thank_you',
            isCorrect: true,
            targetText: 'תודה.',
            tokens: [{ text: 'תודה.', conceptId: 'thank-you' }],
          },
          {
            id: 'leaky',
            lineId: 'distractor_water_too',
            isCorrect: false,
            targetText: 'מים גם.',
            tokens: [{ text: 'מים', conceptId: 'water' }, { text: 'גם.' }],
          },
        ],
      },
    ];
    const result = validateResolvedScene(beats, PACK_CONCEPT_BLUEPRINT);
    expect(result.status).toBe('invalid_resolved_scene');
    expect(
      result.errors.some(
        (e) => e.code === 'distractor_concept_leak' && e.message.includes('water')
      )
    ).toBe(true);
  });

  it('does NOT flag same-category pack options that are wrong-but-not-distractor', () => {
    // A grounded-identification beat where the wrong options are real
    // pack-target lines (e.g. player_blue, player_green) rather than
    // distractor-pool lines. The visualCue establishes correctness.
    const beats = [
      {
        id: 'identify_coffee',
        actionType: 'chooseReply',
        options: [
          {
            id: 'correct',
            lineId: 'player_coffee',
            isCorrect: true,
            targetText: 'קפה.',
            tokens: [{ text: 'קפה.', conceptId: 'coffee' }],
          },
          {
            id: 'wrong_water',
            lineId: 'player_water',
            isCorrect: false,
            targetText: 'מים.',
            tokens: [{ text: 'מים.', conceptId: 'water' }],
          },
        ],
      },
    ];
    const result = validateResolvedScene(beats, PACK_CONCEPT_BLUEPRINT);
    expect(result.status).toBe('ok');
  });

  it('flags a buildLine distractor tile that contains a pack concept', () => {
    const beats = [
      {
        id: 'beat_build',
        actionType: 'buildLine',
        answerLines: [
          {
            id: 'player_coffee_please',
            tokens: [{ text: 'קפה', conceptId: 'coffee' }, { text: 'בבקשה.', conceptId: 'please' }],
          },
        ],
        tileBankTokens: [
          { text: 'קפה', conceptId: 'coffee', source: 'answer' },
          { text: 'בבקשה.', conceptId: 'please', source: 'answer' },
          { text: 'מים', conceptId: 'water', source: 'distractor', distractorLineId: 'distractor_water' },
        ],
      },
    ];
    const result = validateResolvedScene(beats, PACK_CONCEPT_BLUEPRINT);
    expect(result.status).toBe('invalid_resolved_scene');
    expect(result.errors.some((e) => e.code === 'distractor_concept_leak')).toBe(true);
  });

  it('accepts a clean buildLine tile bank with non-pack distractors', () => {
    const beats = [
      {
        id: 'beat_build',
        actionType: 'buildLine',
        answerLines: [
          {
            id: 'player_coffee_please',
            tokens: [{ text: 'קפה', conceptId: 'coffee' }, { text: 'בבקשה.', conceptId: 'please' }],
          },
        ],
        tileBankTokens: [
          { text: 'קפה', conceptId: 'coffee', source: 'answer' },
          { text: 'בבקשה.', conceptId: 'please', source: 'answer' },
          { text: 'אבא', source: 'distractor', distractorLineId: 'distractor_my_father' },
        ],
      },
    ];
    const result = validateResolvedScene(beats, PACK_CONCEPT_BLUEPRINT);
    expect(result.status).toBe('ok');
  });
});
