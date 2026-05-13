import { describe, it, expect } from 'vitest';
import { shopping_01Blueprint } from '../blueprints/shopping_01.js';
import { shopping_01Lines } from '../targetLanguages/hebrew/shopping_01Lines.js';
import { validateBlueprint } from './validateBlueprint.js';
import { resolvePackScene } from './resolvePackScene.js';
import { bridgeWordConceptMap } from '../bridgeWordConceptMap.js';
import { bridgeBuilderPacks } from '../../bridgeBuilderPackConsolidation.js';
import { auditPackSceneForPack } from '../auditPackSceneConsistency.js';

function tokenCount(line, conceptId) {
  return (line.tokens || []).filter((t) => t.conceptId === conceptId).length;
}

describe('shopping_01 blueprint', () => {
  it('validates', () => {
    const result = validateBlueprint(shopping_01Blueprint);
    expect(result.status).toBe('ok');
  });

  it('contains no Hebrew text in the blueprint', () => {
    const serialized = JSON.stringify(shopping_01Blueprint);
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  it('declares the transactional-choice contentContract with conversational-fit source', () => {
    expect(shopping_01Blueprint.contentContract.sceneModel).toBe('transactional-choice');
    expect(shopping_01Blueprint.contentContract.correctnessSource).toBe('conversational-fit');
    expect(shopping_01Blueprint.contentContract.vocabularyType).toBe('transactional-shopping');
  });

  it('packConceptIds exactly cover money, store, how-much, bag, buy, pay', () => {
    expect(shopping_01Blueprint.packConceptIds).toEqual(
      expect.arrayContaining(['money', 'store', 'how-much', 'bag', 'buy', 'pay'])
    );
    expect(shopping_01Blueprint.packConceptIds).toHaveLength(6);
  });

  it('does not use the concept id "kamah" or "how-many"', () => {
    const serialized = JSON.stringify(shopping_01Blueprint);
    expect(serialized.includes('"kamah"')).toBe(false);
    expect(serialized.includes('"how-many"')).toBe(false);
  });

  it('every packConceptId appears in a meaningful answer or target beat', () => {
    for (const conceptId of shopping_01Blueprint.packConceptIds) {
      const inAnswerBeat = shopping_01Blueprint.beats.some(
        (b) =>
          (b.actionType === 'buildLine' || b.actionType === 'chooseReply') &&
          ((b.targetConceptIds || []).includes(conceptId) ||
            (b.acceptedConceptSets || []).some((set) => set.includes(conceptId)))
      );
      const inSpotBeat = shopping_01Blueprint.beats.some(
        (b) =>
          b.actionType === 'spotPackWords' &&
          (b.targetConceptIds || []).includes(conceptId)
      );
      expect(inAnswerBeat || inSpotBeat).toBe(true);
    }
  });

  it('stays within contentContract.maxBeats', () => {
    expect(shopping_01Blueprint.beats.length).toBeLessThanOrEqual(
      shopping_01Blueprint.contentContract.maxBeats
    );
  });

  it('does not reference unknown concept IDs', () => {
    const result = validateBlueprint(shopping_01Blueprint);
    const unknownErrors = (result.errors || []).filter((e) => e.code === 'unknown_concept_id');
    expect(unknownErrors).toHaveLength(0);
  });

  it('buy and pay are never wrong-option foils for each other', () => {
    // Walk every chooseReply beat. If the beat's correct option carries
    // 'buy' or 'pay', no wrong option line may carry the opposite concept.
    for (const beat of shopping_01Blueprint.beats) {
      if (beat.actionType !== 'chooseReply') continue;
      const wrongOptions = (beat.options || []).filter((o) => !o.isCorrect);
      const correctOption = (beat.options || []).find((o) => o.isCorrect);
      if (!correctOption) continue;

      const correctLine = shopping_01Lines[correctOption.lineId];
      if (!correctLine) continue;
      const correctConcepts = new Set(
        (correctLine.tokens || []).map((t) => t.conceptId).filter(Boolean)
      );

      const opposite = correctConcepts.has('buy')
        ? 'pay'
        : correctConcepts.has('pay')
        ? 'buy'
        : null;
      if (!opposite) continue;

      for (const wrong of wrongOptions) {
        const wrongLine = shopping_01Lines[wrong.lineId];
        if (!wrongLine) continue; // distractor lines aren't in shopping_01Lines
        const wrongConcepts = new Set(
          (wrongLine.tokens || []).map((t) => t.conceptId).filter(Boolean)
        );
        expect(wrongConcepts.has(opposite)).toBe(false);
      }
    }
  });
});

describe('shopping_01 Hebrew target lines', () => {
  it('clerk_shop_money_line carries store and money tokens', () => {
    expect(tokenCount(shopping_01Lines.clerk_shop_money_line, 'store')).toBe(1);
    expect(tokenCount(shopping_01Lines.clerk_shop_money_line, 'money')).toBe(1);
  });

  it('player_yes_to_buy carries yes and buy tokens', () => {
    expect(tokenCount(shopping_01Lines.player_yes_to_buy, 'yes')).toBe(1);
    expect(tokenCount(shopping_01Lines.player_yes_to_buy, 'buy')).toBe(1);
  });

  it('player_how_much carries exactly one how-much token', () => {
    expect(tokenCount(shopping_01Lines.player_how_much, 'how-much')).toBe(1);
    expect(shopping_01Lines.player_how_much.targetText).toBe('כמה?');
  });

  it('player_to_pay carries exactly one pay token', () => {
    expect(tokenCount(shopping_01Lines.player_to_pay, 'pay')).toBe(1);
  });

  it('player_bag_please carries bag and please tokens', () => {
    expect(tokenCount(shopping_01Lines.player_bag_please, 'bag')).toBe(1);
    expect(tokenCount(shopping_01Lines.player_bag_please, 'please')).toBe(1);
  });

  it('player_thank_you carries exactly one thank-you token', () => {
    expect(tokenCount(shopping_01Lines.player_thank_you, 'thank-you')).toBe(1);
  });
});

describe('shopping_01 end-to-end resolution', () => {
  it('resolvePackScene returns ok for hebrew + english', () => {
    const result = resolvePackScene({
      packId: 'shopping_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
    expect(result.scene.packId).toBe('shopping_01');
    expect(result.scene.beats.length).toBe(shopping_01Blueprint.beats.length);
  });

  it('chooseReply options hydrate with target text and direction', () => {
    const { scene } = resolvePackScene({
      packId: 'shopping_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const chooseBeats = scene.beats.filter((b) => b.actionType === 'chooseReply');
    expect(chooseBeats.length).toBeGreaterThan(0);
    for (const beat of chooseBeats) {
      expect(beat.options.length).toBeGreaterThan(0);
      for (const opt of beat.options) {
        expect(typeof opt.targetText).toBe('string');
        expect(opt.targetText.length).toBeGreaterThan(0);
        expect(opt.direction).toBe('rtl');
      }
    }
  });

  it('buildLine beat has answerLines and tileBankTokens', () => {
    const { scene } = resolvePackScene({
      packId: 'shopping_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const beat = scene.beats.find((b) => b.id === 'ask_how_much');
    expect(beat).toBeTruthy();
    expect(beat.actionType).toBe('buildLine');
    expect(Array.isArray(beat.answerLines) && beat.answerLines.length).toBeTruthy();
    expect(Array.isArray(beat.tileBankTokens) && beat.tileBankTokens.length).toBeTruthy();
  });

  it('recap would show only money, store, how-much, bag, buy, pay (no support concepts)', () => {
    const allowed = new Set(['money', 'store', 'how-much', 'bag', 'buy', 'pay']);
    for (const conceptId of shopping_01Blueprint.packConceptIds) {
      expect(allowed.has(conceptId)).toBe(true);
    }
    // Confirm support concepts (please, yes, thank-you, want, and) stay out of packConceptIds.
    for (const supportId of shopping_01Blueprint.supportConceptIds) {
      expect(shopping_01Blueprint.packConceptIds.includes(supportId)).toBe(false);
    }
  });

  it('distractor leak validation passes (no pack concept leaked into distractors)', () => {
    const { scene } = resolvePackScene({
      packId: 'shopping_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const packConceptSet = new Set(shopping_01Blueprint.packConceptIds);
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
});

describe('shopping_01 consistency with consolidated Bridge Builder pack', () => {
  it('packConceptIds exactly match mapped consolidated wordIds', () => {
    const pack = bridgeBuilderPacks.find((p) => p.id === 'shopping_01');
    expect(pack).toBeTruthy();

    const mapped = new Set(
      pack.wordIds.map((wordId) => bridgeWordConceptMap.shopping_01[wordId]).filter(Boolean)
    );
    const blueprintSet = new Set(shopping_01Blueprint.packConceptIds);

    expect(mapped).toEqual(blueprintSet);
  });

  it('bb-kamah maps to how-much in shopping_01', () => {
    expect(bridgeWordConceptMap.shopping_01['bb-kamah']).toBe('how-much');
  });

  it('passes auditPackSceneForPack', () => {
    expect(auditPackSceneForPack('shopping_01').status).toBe('ok');
  });
});

describe('previous packs still resolve after shopping_01 registration', () => {
  it('food_01 still resolves status ok', () => {
    const result = resolvePackScene({
      packId: 'food_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
  });

  it('colors_01 still resolves status ok', () => {
    const result = resolvePackScene({
      packId: 'colors_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
  });

  it('numbers_01 still resolves status ok', () => {
    const result = resolvePackScene({
      packId: 'numbers_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
  });
});
