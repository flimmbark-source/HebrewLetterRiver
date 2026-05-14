import { describe, it, expect } from 'vitest';
import { validateBlueprint } from './validateBlueprint.js';
import { resolvePackScene } from './resolvePackScene.js';
import { everyday_objects_01Blueprint } from '../blueprints/everyday_objects_01.js';
import { everyday_objects_01Lines } from '../targetLanguages/hebrew/everyday_objects_01Lines.js';

function tokenCount(line, conceptId) {
  return (line.tokens || []).filter((t) => t.conceptId === conceptId).length;
}

describe('everyday_objects_01 blueprint (grounded-identification, objectGlyph)', () => {
  it('validates', () => {
    const result = validateBlueprint(everyday_objects_01Blueprint);
    expect(result.status).toBe('ok');
  });

  it('contains no Hebrew text in the blueprint', () => {
    const serialized = JSON.stringify(everyday_objects_01Blueprint);
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  it('uses normalized semantic concept IDs (no bb- or bbct- prefix)', () => {
    const allConceptIds = [
      ...everyday_objects_01Blueprint.packConceptIds,
      ...everyday_objects_01Blueprint.supportConceptIds,
      ...everyday_objects_01Blueprint.beats.flatMap((b) => b.targetConceptIds || []),
    ];
    for (const id of allConceptIds) {
      expect(id.startsWith('bb-')).toBe(false);
      expect(id.startsWith('bbct-')).toBe(false);
    }
  });

  it('declares the grounded-identification contentContract with visualCue source', () => {
    expect(everyday_objects_01Blueprint.contentContract.sceneModel).toBe('grounded-identification');
    expect(everyday_objects_01Blueprint.contentContract.correctnessSource).toBe('visualCue');
    expect(everyday_objects_01Blueprint.contentContract.vocabularyType).toBe('concrete-everyday-objects');
  });

  it('each identify beat uses an objectGlyph cue whose objectConceptId matches its target', () => {
    const identifyBeats = everyday_objects_01Blueprint.beats.filter((b) =>
      b.id.startsWith('identify_')
    );
    expect(identifyBeats.length).toBe(5);
    for (const beat of identifyBeats) {
      expect(beat.visualCue.type).toBe('objectGlyph');
      expect(typeof beat.visualCue.objectConceptId).toBe('string');
      expect(beat.targetConceptIds).toContain(beat.visualCue.objectConceptId);
    }
  });

  it('each identify beat has exactly one correct option', () => {
    const identifyBeats = everyday_objects_01Blueprint.beats.filter((b) =>
      b.id.startsWith('identify_')
    );
    for (const beat of identifyBeats) {
      const correctCount = beat.options.filter((opt) => opt.isCorrect).length;
      expect(correctCount).toBe(1);
    }
  });

  it('the correct option for each identify beat matches the objectGlyph concept', () => {
    const identifyBeats = everyday_objects_01Blueprint.beats.filter((b) =>
      b.id.startsWith('identify_')
    );
    for (const beat of identifyBeats) {
      const correct = beat.options.find((o) => o.isCorrect);
      expect(correct.id).toBe(beat.visualCue.objectConceptId);
    }
  });

  it('produces every packConcept in at least one answer beat', () => {
    for (const conceptId of everyday_objects_01Blueprint.packConceptIds) {
      const found = everyday_objects_01Blueprint.beats.some(
        (b) => b.actionType === 'chooseReply' && (b.targetConceptIds || []).includes(conceptId)
      );
      expect(found).toBe(true);
    }
  });

  it('stays within contentContract.maxBeats', () => {
    expect(everyday_objects_01Blueprint.beats.length).toBeLessThanOrEqual(
      everyday_objects_01Blueprint.contentContract.maxBeats
    );
  });

  it('all five pack concepts appear as options on every identify beat', () => {
    const identifyBeats = everyday_objects_01Blueprint.beats.filter((b) =>
      b.id.startsWith('identify_')
    );
    for (const beat of identifyBeats) {
      const optionIds = beat.options.map((o) => o.id);
      for (const conceptId of everyday_objects_01Blueprint.packConceptIds) {
        expect(optionIds).toContain(conceptId);
      }
    }
  });
});

describe('everyday_objects_01 objectGlyph validation rules', () => {
  it('fails when objectGlyph is missing objectConceptId', () => {
    const bad = {
      ...everyday_objects_01Blueprint,
      beats: [
        {
          id: 'identify_book',
          role: 'choose_or_build_response',
          actionType: 'chooseReply',
          cueLineId: 'friend_what_is_this',
          visualCue: { type: 'objectGlyph' },
          targetConceptIds: ['book'],
          options: [{ id: 'correct', lineId: 'player_book', isCorrect: true }],
        },
      ],
    };
    const result = validateBlueprint(bad);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'invalid_object_glyph_cue')).toBe(true);
  });

  it('fails when objectGlyph.objectConceptId is not in beat.targetConceptIds', () => {
    const bad = {
      ...everyday_objects_01Blueprint,
      beats: [
        {
          id: 'identify_book',
          role: 'choose_or_build_response',
          actionType: 'chooseReply',
          cueLineId: 'friend_what_is_this',
          visualCue: { type: 'objectGlyph', objectConceptId: 'phone' },
          targetConceptIds: ['book'],
          options: [{ id: 'correct', lineId: 'player_book', isCorrect: true }],
        },
      ],
    };
    const result = validateBlueprint(bad);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'visual_cue_concept_mismatch')).toBe(true);
  });
});

describe('everyday_objects_01 Hebrew target lines', () => {
  it('each object line has exactly one token tagged with its concept', () => {
    expect(tokenCount(everyday_objects_01Lines.player_book, 'book')).toBe(1);
    expect(tokenCount(everyday_objects_01Lines.player_phone, 'phone')).toBe(1);
    expect(tokenCount(everyday_objects_01Lines.player_table, 'table')).toBe(1);
    expect(tokenCount(everyday_objects_01Lines.player_door, 'door')).toBe(1);
    expect(tokenCount(everyday_objects_01Lines.player_thing, 'thing')).toBe(1);
  });

  it('player_thank_you has exactly one thank-you token', () => {
    expect(tokenCount(everyday_objects_01Lines.player_thank_you, 'thank-you')).toBe(1);
  });

  it('friend_what_is_this is the correct Hebrew cue', () => {
    expect(everyday_objects_01Lines.friend_what_is_this.targetText).toBe('מה זה?');
    expect(everyday_objects_01Lines.friend_what_is_this.speaker).toBe('friend');
  });

  it('each object line uses the correct Hebrew word', () => {
    expect(everyday_objects_01Lines.player_book.targetText).toBe('ספר.');
    expect(everyday_objects_01Lines.player_phone.targetText).toBe('טלפון.');
    expect(everyday_objects_01Lines.player_table.targetText).toBe('שולחן.');
    expect(everyday_objects_01Lines.player_door.targetText).toBe('דלת.');
    expect(everyday_objects_01Lines.player_thing.targetText).toBe('דבר.');
  });
});

describe('everyday_objects_01 end-to-end resolution', () => {
  it('resolvePackScene returns ok for hebrew + english', () => {
    const result = resolvePackScene({
      packId: 'everyday_objects_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
    expect(result.scene.packId).toBe('everyday_objects_01');
    expect(result.scene.beats.length).toBe(everyday_objects_01Blueprint.beats.length);
  });

  it('each identify beat resolves with its objectGlyph cue preserved', () => {
    const { scene } = resolvePackScene({
      packId: 'everyday_objects_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const identifyBeats = scene.beats.filter((b) => b.id.startsWith('identify_'));
    expect(identifyBeats.length).toBe(5);
    for (const beat of identifyBeats) {
      expect(beat.visualCue).not.toBeNull();
      expect(beat.visualCue.type).toBe('objectGlyph');
      expect(typeof beat.visualCue.objectConceptId).toBe('string');
    }
  });

  it('does not leak the object name in the English prompt for identify beats', () => {
    const { scene } = resolvePackScene({
      packId: 'everyday_objects_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const identifyBeats = scene.beats.filter((b) => b.id.startsWith('identify_'));
    for (const beat of identifyBeats) {
      expect(beat.prompt).toBe('');
    }
  });

  it('close_exchange resolves with thank_you correct and out-of-scene distractors', () => {
    const { scene } = resolvePackScene({
      packId: 'everyday_objects_01',
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

  it('resolved identify beats carry the correct Hebrew word as the correct option', () => {
    const { scene } = resolvePackScene({
      packId: 'everyday_objects_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const expectedCorrect = {
      identify_book: 'ספר.',
      identify_phone: 'טלפון.',
      identify_table: 'שולחן.',
      identify_door: 'דלת.',
      identify_thing: 'דבר.',
    };
    for (const beat of scene.beats.filter((b) => b.id.startsWith('identify_'))) {
      const correct = beat.options.find((o) => o.isCorrect);
      expect(correct.targetText).toBe(expectedCorrect[beat.id]);
    }
  });
});

describe('everyday_objects_01 regression: previous packs still resolve', () => {
  it('food_01 still resolves status ok', () => {
    const result = resolvePackScene({ packId: 'food_01', targetLanguageId: 'hebrew', appLanguageId: 'english' });
    expect(result.status).toBe('ok');
  });

  it('colors_01 still resolves status ok', () => {
    const result = resolvePackScene({ packId: 'colors_01', targetLanguageId: 'hebrew', appLanguageId: 'english' });
    expect(result.status).toBe('ok');
  });

  it('numbers_01 still resolves status ok', () => {
    const result = resolvePackScene({ packId: 'numbers_01', targetLanguageId: 'hebrew', appLanguageId: 'english' });
    expect(result.status).toBe('ok');
  });

  it('shopping_01 still resolves status ok', () => {
    const result = resolvePackScene({ packId: 'shopping_01', targetLanguageId: 'hebrew', appLanguageId: 'english' });
    expect(result.status).toBe('ok');
  });
});
