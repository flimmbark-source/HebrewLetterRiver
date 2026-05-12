import { describe, it, expect } from 'vitest';
import { validateBlueprint } from './validateBlueprint.js';
import { resolvePackScene } from './resolvePackScene.js';
import { numbers_01Blueprint } from '../blueprints/numbers_01.js';
import { numbers_01Lines } from '../targetLanguages/hebrew/numbers_01Lines.js';
import { COUNT_DOTS_CONCEPT_BY_COUNT } from '../visualCueConstants.js';

function tokenCount(line, conceptId) {
  return (line.tokens || []).filter((t) => t.conceptId === conceptId).length;
}

describe('Phase 6: numbers_01 blueprint (grounded-identification, countDots)', () => {
  it('validates', () => {
    const result = validateBlueprint(numbers_01Blueprint);
    expect(result.status).toBe('ok');
  });

  it('contains no Hebrew text in the blueprint', () => {
    const serialized = JSON.stringify(numbers_01Blueprint);
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  it('declares the grounded-identification contentContract with visualCue source', () => {
    expect(numbers_01Blueprint.contentContract.sceneModel).toBe('grounded-identification');
    expect(numbers_01Blueprint.contentContract.correctnessSource).toBe('visualCue');
    expect(numbers_01Blueprint.contentContract.vocabularyType).toBe('cardinal-numbers');
  });

  it('each identify beat uses a countDots cue whose conceptId matches its count', () => {
    const identifyBeats = numbers_01Blueprint.beats.filter((b) => b.id.startsWith('identify_'));
    expect(identifyBeats.length).toBe(5);
    for (const beat of identifyBeats) {
      expect(beat.visualCue.type).toBe('countDots');
      expect(beat.visualCue.conceptId).toBe(COUNT_DOTS_CONCEPT_BY_COUNT[beat.visualCue.count]);
      expect(beat.targetConceptIds).toContain(beat.visualCue.conceptId);
    }
  });

  it('each identify beat has exactly one correct option', () => {
    const identifyBeats = numbers_01Blueprint.beats.filter((b) => b.id.startsWith('identify_'));
    for (const beat of identifyBeats) {
      const correctCount = beat.options.filter((opt) => opt.isCorrect).length;
      expect(correctCount).toBe(1);
    }
  });

  it('produces every packConcept in at least one answer beat', () => {
    for (const conceptId of numbers_01Blueprint.packConceptIds) {
      const found = numbers_01Blueprint.beats.some(
        (b) => b.actionType === 'chooseReply' && (b.targetConceptIds || []).includes(conceptId)
      );
      expect(found).toBe(true);
    }
  });

  it('stays within contentContract.maxBeats', () => {
    expect(numbers_01Blueprint.beats.length).toBeLessThanOrEqual(
      numbers_01Blueprint.contentContract.maxBeats
    );
  });
});

describe('Phase 6: numbers_01 Hebrew target lines', () => {
  it('each number line has exactly one token tagged with its number concept', () => {
    expect(tokenCount(numbers_01Lines.player_one, 'one')).toBe(1);
    expect(tokenCount(numbers_01Lines.player_two, 'two')).toBe(1);
    expect(tokenCount(numbers_01Lines.player_three, 'three')).toBe(1);
    expect(tokenCount(numbers_01Lines.player_four, 'four')).toBe(1);
    expect(tokenCount(numbers_01Lines.player_five, 'five')).toBe(1);
  });

  it('player_thank_you has exactly one thank-you token', () => {
    expect(tokenCount(numbers_01Lines.player_thank_you, 'thank-you')).toBe(1);
  });

  it('friend_how_many is a single Hebrew token', () => {
    expect(numbers_01Lines.friend_how_many.tokens.length).toBe(1);
    expect(numbers_01Lines.friend_how_many.targetText).toBe('כמה?');
  });
});

describe('Phase 6: numbers_01 end-to-end resolution', () => {
  it('resolvePackScene returns ok for hebrew + english', () => {
    const result = resolvePackScene({
      packId: 'numbers_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
    expect(result.scene.packId).toBe('numbers_01');
    expect(result.scene.beats.length).toBe(numbers_01Blueprint.beats.length);
  });

  it('each identify beat resolves with its countDots cue preserved', () => {
    const { scene } = resolvePackScene({
      packId: 'numbers_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const identifyBeats = scene.beats.filter((b) => b.id.startsWith('identify_'));
    expect(identifyBeats.length).toBe(5);
    for (const beat of identifyBeats) {
      expect(beat.visualCue).not.toBeNull();
      expect(beat.visualCue.type).toBe('countDots');
      expect(beat.visualCue.count).toBeGreaterThanOrEqual(1);
      expect(beat.visualCue.count).toBeLessThanOrEqual(5);
    }
  });

  it('close_exchange resolves with thank_you correct and out-of-scene distractors', () => {
    const { scene } = resolvePackScene({
      packId: 'numbers_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const beat = scene.beats.find((b) => b.id === 'close_exchange');
    const correct = beat.options.find((o) => o.isCorrect);
    expect(correct.targetText).toBe('תודה.');
    expect(correct.supportText).toBe('Thank you.');
    const wrongHome = beat.options.find((o) => o.id === 'wrong_home');
    expect(wrongHome.targetText).toBe('אני בבית.');
  });

  it('does not leak the number answer in the English prompt for identify beats', () => {
    const { scene } = resolvePackScene({
      packId: 'numbers_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const identifyBeats = scene.beats.filter((b) => b.id.startsWith('identify_'));
    for (const beat of identifyBeats) {
      expect(beat.prompt).toBe('');
    }
  });
});

describe('Phase 6: previous packs still resolve', () => {
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
});
