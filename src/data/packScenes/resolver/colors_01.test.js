import { describe, it, expect } from 'vitest';
import { validateBlueprint } from './validateBlueprint.js';
import { resolvePackScene } from './resolvePackScene.js';
import { colors_01Blueprint } from '../blueprints/colors_01.js';
import { colors_01Lines } from '../targetLanguages/hebrew/colors_01Lines.js';

function tokenCount(line, conceptId) {
  return (line.tokens || []).filter((t) => t.conceptId === conceptId).length;
}

describe('Phase 3: colors_01 blueprint (grounded-identification)', () => {
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

  it('declares the grounded-identification contentContract', () => {
    expect(colors_01Blueprint.contentContract.sceneModel).toBe('grounded-identification');
    expect(colors_01Blueprint.contentContract.correctnessSource).toBe('visualCue');
  });

  it('produces every packConcept in at least one answer beat', () => {
    for (const conceptId of colors_01Blueprint.packConceptIds) {
      const found = colors_01Blueprint.beats.some(
        (b) => b.actionType === 'chooseReply' && (b.targetConceptIds || []).includes(conceptId)
      );
      expect(found).toBe(true);
    }
  });

  it('each identify beat has exactly one correct option', () => {
    const identifyBeats = colors_01Blueprint.beats.filter((b) => b.id.startsWith('identify_'));
    for (const beat of identifyBeats) {
      const correctCount = beat.options.filter((opt) => opt.isCorrect).length;
      expect(correctCount).toBe(1);
    }
  });

  it('each identify beat visualCue.colorConceptId matches the target concept', () => {
    const identifyBeats = colors_01Blueprint.beats.filter((b) => b.id.startsWith('identify_'));
    for (const beat of identifyBeats) {
      expect(beat.visualCue.type).toBe('colorCircle');
      expect(beat.targetConceptIds).toContain(beat.visualCue.colorConceptId);
    }
  });
});

describe('Phase 3: colors_01 Hebrew target lines', () => {
  it('each color line has exactly one token tagged with its color concept', () => {
    expect(tokenCount(colors_01Lines.player_red, 'red')).toBe(1);
    expect(tokenCount(colors_01Lines.player_blue, 'blue')).toBe(1);
    expect(tokenCount(colors_01Lines.player_green, 'green')).toBe(1);
    expect(tokenCount(colors_01Lines.player_yellow, 'yellow')).toBe(1);
  });

  it('player_thank_you has exactly one thank-you token', () => {
    expect(tokenCount(colors_01Lines.player_thank_you, 'thank-you')).toBe(1);
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

  it('each identify beat resolves with the colorCircle visualCue preserved', () => {
    const { scene } = resolvePackScene({
      packId: 'colors_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const identifyBeats = scene.beats.filter((b) => b.id.startsWith('identify_'));
    expect(identifyBeats.length).toBe(4);
    for (const beat of identifyBeats) {
      expect(beat.visualCue).not.toBeNull();
      expect(beat.visualCue.type).toBe('colorCircle');
    }
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
