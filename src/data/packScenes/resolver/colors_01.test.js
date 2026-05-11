import { describe, it, expect } from 'vitest';
import { validateBlueprint } from './validateBlueprint.js';
import { resolvePackScene } from './resolvePackScene.js';
import { colors_01Blueprint } from '../blueprints/colors_01.js';
import { colors_01Lines } from '../targetLanguages/hebrew/colors_01Lines.js';

function tokenCount(line, conceptId) {
  return (line.tokens || []).filter((t) => t.conceptId === conceptId).length;
}

describe('Phase 3: colors_01 blueprint', () => {
  it('validates', () => {
    const result = validateBlueprint(colors_01Blueprint);
    expect(result.status).toBe('ok');
  });

  it('contains no Hebrew text', () => {
    const serialized = JSON.stringify(colors_01Blueprint);
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  it('uses normalized semantic concept IDs (no bb- prefix)', () => {
    const allConceptIds = [
      ...colors_01Blueprint.packConceptIds,
      ...colors_01Blueprint.supportConceptIds,
      ...colors_01Blueprint.beats.flatMap((b) => b.targetConceptIds || []),
    ];
    for (const id of allConceptIds) {
      expect(id.startsWith('bb-')).toBe(false);
      expect(id.startsWith('bbct-')).toBe(false);
    }
  });

  it('accepts both red+please and blue+please as concept sets', () => {
    const buildBeat = colors_01Blueprint.beats.find((b) => b.id === 'answer_color');
    const sets = buildBeat.acceptedConceptSets.map((s) => [...s].sort().join(','));
    expect(sets).toContain(['red', 'please'].sort().join(','));
    expect(sets).toContain(['blue', 'please'].sort().join(','));
  });
});

describe('Phase 3: colors_01 Hebrew target lines', () => {
  it('seller_color_choice has exactly one red token and one blue token', () => {
    const line = colors_01Lines.seller_color_choice;
    expect(tokenCount(line, 'red')).toBe(1);
    expect(tokenCount(line, 'blue')).toBe(1);
  });

  it('player_red_please has exactly one red token and one please token', () => {
    const line = colors_01Lines.player_red_please;
    expect(tokenCount(line, 'red')).toBe(1);
    expect(tokenCount(line, 'please')).toBe(1);
  });

  it('player_blue_please has exactly one blue token and one please token', () => {
    const line = colors_01Lines.player_blue_please;
    expect(tokenCount(line, 'blue')).toBe(1);
    expect(tokenCount(line, 'please')).toBe(1);
  });

  it('player_thank_you has exactly one thank-you token', () => {
    const line = colors_01Lines.player_thank_you;
    expect(tokenCount(line, 'thank-you')).toBe(1);
  });
});

describe('Phase 3: colors_01 end-to-end resolution', () => {
  it('resolvePackScene returns ok for hebrew + english', () => {
    const result = resolvePackScene({
      packId: 'colors_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
    expect(result.scene.packId).toBe('colors_01');
    expect(result.scene.beats.length).toBe(colors_01Blueprint.beats.length);
  });

  it('buildLine resolves with answerLines and tileBankTokens', () => {
    const { scene } = resolvePackScene({
      packId: 'colors_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const beat = scene.beats.find((b) => b.id === 'answer_color');
    expect(beat.answerLines.length).toBe(2);
    expect(beat.tileBankTokens.length).toBeGreaterThan(0);
    const distractorTiles = beat.tileBankTokens.filter((t) => t.source === 'distractor');
    expect(distractorTiles.length).toBe(2);
  });

  it('chooseReply close_exchange options hydrate from target lines and distractor pool', () => {
    const { scene } = resolvePackScene({
      packId: 'colors_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const beat = scene.beats.find((b) => b.id === 'close_exchange');
    const correct = beat.options.find((o) => o.isCorrect);
    expect(correct.targetText).toBe('תודה.');
    expect(correct.supportText).toBe('Thank you.');
    const wrongHome = beat.options.find((o) => o.id === 'wrong_home');
    expect(wrongHome.targetText).toBe('אני בבית.');
    expect(wrongHome.supportText).toBe('I am at home.');
  });

  it('meaningChoice hydrates from supportMeanings (red_or_blue correct)', () => {
    const { scene } = resolvePackScene({
      packId: 'colors_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const beat = scene.beats.find((b) => b.id === 'understand_color_choice');
    const correct = beat.options.find((o) => o.isCorrect);
    expect(correct.text).toBe('Red or blue?');
  });
});

describe('Phase 3: food_01 regression check', () => {
  it('food_01 still resolves status ok', () => {
    const result = resolvePackScene({
      packId: 'food_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
  });
});
