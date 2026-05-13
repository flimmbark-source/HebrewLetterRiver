import { describe, it, expect } from 'vitest';
import { food_01Blueprint } from '../blueprints/food_01.js';
import { food_01Lines } from '../targetLanguages/hebrew/food_01Lines.js';
import { validateBlueprint } from './validateBlueprint.js';
import { resolvePackScene } from './resolvePackScene.js';
import { resolveBeats } from './resolveBeats.js';
import { resolveTargetLines } from './resolveTargetLines.js';
import { resolveAppStrings } from './resolveAppStrings.js';
import { beginnerDistractors } from '../distractors/beginnerDistractors.js';
import { isKnownConceptId } from '../concepts.js';

function tokenCount(line, conceptId) {
  return (line.tokens || []).filter((t) => t.conceptId === conceptId).length;
}

// 1. food_01 resolves ok for Hebrew + English
describe('food_01 scene resolution', () => {
  it('resolves ok for hebrew target language and english app language', () => {
    const result = resolvePackScene({
      packId: 'food_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
    expect(result.scene.packId).toBe('food_01');
    expect(result.scene.targetLanguageId).toBe('hebrew');
    expect(result.scene.appLanguageId).toBe('english');
  });

  // 2. food_01 blueprint contains no Hebrew text
  it('blueprint contains no Hebrew text', () => {
    const serialized = JSON.stringify(food_01Blueprint);
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  // 3. food_01 packConceptIds exactly include coffee, water, bread, apple, food
  it('packConceptIds exactly cover coffee, water, bread, apple, food', () => {
    expect(food_01Blueprint.packConceptIds).toEqual(
      expect.arrayContaining(['coffee', 'water', 'bread', 'apple', 'food'])
    );
    expect(food_01Blueprint.packConceptIds).toHaveLength(5);
  });

  // 4. Every packConceptId appears in a meaningful answer or target beat
  it('every packConceptId appears in a meaningful answer or target beat', () => {
    for (const conceptId of food_01Blueprint.packConceptIds) {
      const inAnswerBeat = food_01Blueprint.beats.some(
        (b) =>
          (b.actionType === 'buildLine' || b.actionType === 'chooseReply') &&
          (b.targetConceptIds || []).includes(conceptId)
      );
      const inSpotBeat = food_01Blueprint.beats.some(
        (b) =>
          b.actionType === 'spotPackWords' &&
          (b.targetConceptIds || []).includes(conceptId)
      );
      expect(inAnswerBeat || inSpotBeat).toBe(true);
    }
  });

  // 5. server_snack_choice has exactly one bread token and one apple token
  it('server_snack_choice has exactly one bread token and one apple token', () => {
    expect(tokenCount(food_01Lines.server_snack_choice, 'bread')).toBe(1);
    expect(tokenCount(food_01Lines.server_snack_choice, 'apple')).toBe(1);
  });

  // 6. player_apple_please has exactly one apple token and one please token
  it('player_apple_please has exactly one apple token and one please token', () => {
    expect(tokenCount(food_01Lines.player_apple_please, 'apple')).toBe(1);
    expect(tokenCount(food_01Lines.player_apple_please, 'please')).toBe(1);
  });

  // 7. player_yes_food_please has exactly one food token, one yes token, and one please token
  it('player_yes_food_please has exactly one food token, one yes token, and one please token', () => {
    expect(tokenCount(food_01Lines.player_yes_food_please, 'food')).toBe(1);
    expect(tokenCount(food_01Lines.player_yes_food_please, 'yes')).toBe(1);
    expect(tokenCount(food_01Lines.player_yes_food_please, 'please')).toBe(1);
  });

  // 8. answer_snack buildLine has answerLines and tileBankTokens
  it('answer_snack buildLine resolves with answerLines and tileBankTokens', () => {
    const target = resolveTargetLines(food_01Blueprint, 'hebrew');
    const strings = resolveAppStrings(food_01Blueprint, 'english');
    const pool = beginnerDistractors.hebrew;
    expect(target.status).toBe('ok');
    expect(strings.status).toBe('ok');
    const result = resolveBeats(food_01Blueprint, target.targetLines, pool, strings.appStrings);
    expect(result.status).toBe('ok');
    const beat = result.beats.find((b) => b.id === 'answer_snack');
    expect(beat).toBeTruthy();
    expect(Array.isArray(beat.answerLines) && beat.answerLines.length).toBeTruthy();
    expect(Array.isArray(beat.tileBankTokens) && beat.tileBankTokens.length).toBeTruthy();
  });

  // 9. Recap can only list pack concepts: coffee, water, bread, apple, food
  it('packConceptIds used for recap contains only the five food/drink concepts', () => {
    const allowedConcepts = new Set(['coffee', 'water', 'bread', 'apple', 'food']);
    for (const conceptId of food_01Blueprint.packConceptIds) {
      expect(allowedConcepts.has(conceptId)).toBe(true);
    }
  });

  // 10. food_01 does not reference unknown concept IDs
  it('does not reference unknown concept IDs', () => {
    const result = validateBlueprint(food_01Blueprint);
    expect(result.status).toBe('ok');
    const unknownErrors = (result.errors || []).filter((e) => e.code === 'unknown_concept_id');
    expect(unknownErrors).toHaveLength(0);
  });

  // 11. distractor leak validation still passes
  it('distractor leak validation passes (no pack concept leaked into distractors)', () => {
    const { scene } = resolvePackScene({
      packId: 'food_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    // If scene resolves ok, validateResolvedScene already ran inside resolvePackScene
    expect(scene).toBeTruthy();
    // Confirm no distractor option tokens contain pack concept IDs
    const packConceptSet = new Set(food_01Blueprint.packConceptIds);
    for (const beat of scene.beats) {
      if (beat.actionType === 'chooseReply') {
        for (const opt of beat.options || []) {
          if (opt.lineId && opt.lineId.startsWith('distractor_')) {
            for (const token of opt.tokens || []) {
              expect(packConceptSet.has(token.conceptId)).toBe(false);
            }
          }
        }
      }
      if (beat.actionType === 'buildLine') {
        for (const tile of beat.tileBankTokens || []) {
          if (tile.source === 'distractor') {
            expect(packConceptSet.has(tile.conceptId)).toBe(false);
          }
        }
      }
    }
  });

  // 12. colors_01 and numbers_01 still resolve ok
  it('colors_01 still resolves ok', () => {
    const result = resolvePackScene({
      packId: 'colors_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
  });

  it('numbers_01 still resolves ok', () => {
    const result = resolvePackScene({
      packId: 'numbers_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
  });
});
