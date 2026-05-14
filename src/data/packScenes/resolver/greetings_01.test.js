import { describe, it, expect } from 'vitest';
import { validateBlueprint } from './validateBlueprint.js';
import { resolvePackScene } from './resolvePackScene.js';
import { auditPackSceneForPack, auditAllRegisteredPackScenes } from '../auditPackSceneConsistency.js';
import { greetings_01Blueprint } from '../blueprints/greetings_01.js';
import { greetings_01Lines } from '../targetLanguages/hebrew/greetings_01Lines.js';
import { bridgeWordConceptMap } from '../bridgeWordConceptMap.js';

function tokenCount(line, conceptId) {
  return (line.tokens || []).filter((t) => t.conceptId === conceptId).length;
}

// ─── Blueprint structure ───────────────────────────────────────────────────────

describe('greetings_01 blueprint structure', () => {
  it('validates', () => {
    const result = validateBlueprint(greetings_01Blueprint);
    expect(result.status).toBe('ok');
  });

  it('contains no Hebrew text in the blueprint', () => {
    const serialized = JSON.stringify(greetings_01Blueprint);
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  it('uses normalized semantic concept IDs (no bb- or bbct- prefix)', () => {
    const allConceptIds = [
      ...greetings_01Blueprint.packConceptIds,
      ...greetings_01Blueprint.supportConceptIds,
      ...greetings_01Blueprint.beats.flatMap((b) => b.targetConceptIds || []),
    ];
    for (const id of allConceptIds) {
      expect(id.startsWith('bb-')).toBe(false);
      expect(id.startsWith('bbct-')).toBe(false);
    }
  });

  it('declares the social-exchange contentContract', () => {
    expect(greetings_01Blueprint.contentContract.sceneModel).toBe('social-exchange');
    expect(greetings_01Blueprint.contentContract.correctnessSource).toBe('mixed');
    expect(greetings_01Blueprint.contentContract.vocabularyType).toBe('social-greeting-courtesy');
  });

  it('has exactly 5 beats', () => {
    expect(greetings_01Blueprint.beats.length).toBe(5);
  });

  it('every pack concept appears in a meaningful answer beat', () => {
    for (const conceptId of greetings_01Blueprint.packConceptIds) {
      const found = greetings_01Blueprint.beats.some(
        (b) =>
          b.actionType === 'chooseReply' &&
          (b.targetConceptIds || []).includes(conceptId)
      );
      expect(found).toBe(true);
    }
  });

  it('stays within contentContract.maxBeats', () => {
    expect(greetings_01Blueprint.beats.length).toBeLessThanOrEqual(
      greetings_01Blueprint.contentContract.maxBeats
    );
  });

  it('each beat has exactly one correct option', () => {
    for (const beat of greetings_01Blueprint.beats) {
      const correctCount = beat.options.filter((o) => o.isCorrect).length;
      expect(correctCount).toBe(1);
    }
  });
});

// ─── dayPart visualCue beats ───────────────────────────────────────────────────

describe('greetings_01 dayPart visual cue beats', () => {
  it('say_good_morning has a dayPart:morning visualCue', () => {
    const beat = greetings_01Blueprint.beats.find((b) => b.id === 'say_good_morning');
    expect(beat.visualCue).not.toBeNull();
    expect(beat.visualCue.type).toBe('dayPart');
    expect(beat.visualCue.dayPart).toBe('morning');
  });

  it('say_good_night has a dayPart:night visualCue', () => {
    const beat = greetings_01Blueprint.beats.find((b) => b.id === 'say_good_night');
    expect(beat.visualCue).not.toBeNull();
    expect(beat.visualCue.type).toBe('dayPart');
    expect(beat.visualCue.dayPart).toBe('night');
  });

  it('say_good_morning targetConceptIds includes good-morning (matches dayPart)', () => {
    const beat = greetings_01Blueprint.beats.find((b) => b.id === 'say_good_morning');
    expect(beat.targetConceptIds).toContain('good-morning');
  });

  it('say_good_night targetConceptIds includes good-night (matches dayPart)', () => {
    const beat = greetings_01Blueprint.beats.find((b) => b.id === 'say_good_night');
    expect(beat.targetConceptIds).toContain('good-night');
  });

  it('say_good_morning does not include player_hello as a wrong option', () => {
    const beat = greetings_01Blueprint.beats.find((b) => b.id === 'say_good_morning');
    const optionLineIds = beat.options.map((o) => o.lineId);
    expect(optionLineIds).not.toContain('player_hello');
  });

  it('say_good_night does not include player_hello as a wrong option', () => {
    const beat = greetings_01Blueprint.beats.find((b) => b.id === 'say_good_night');
    const optionLineIds = beat.options.map((o) => o.lineId);
    expect(optionLineIds).not.toContain('player_hello');
  });
});

// ─── Option set fairness ───────────────────────────────────────────────────────

describe('greetings_01 option set fairness', () => {
  it('respond_with_hello does not include good-morning or good-night as wrong options', () => {
    const beat = greetings_01Blueprint.beats.find((b) => b.id === 'respond_with_hello');
    const optionLineIds = beat.options.map((o) => o.lineId);
    expect(optionLineIds).not.toContain('player_good_morning');
    expect(optionLineIds).not.toContain('player_good_night');
  });

  it('say_you_are_welcome does not include player_thank_you (matching-not-meaning trap)', () => {
    const beat = greetings_01Blueprint.beats.find((b) => b.id === 'say_you_are_welcome');
    const optionLineIds = beat.options.map((o) => o.lineId);
    expect(optionLineIds).not.toContain('player_thank_you');
  });
});

// ─── dayPart validation errors ────────────────────────────────────────────────

describe('greetings_01 dayPart validation rules', () => {
  it('fails when dayPart is missing', () => {
    const bad = {
      ...greetings_01Blueprint,
      beats: [
        {
          id: 'say_good_morning',
          role: 'choose_or_build_response',
          actionType: 'chooseReply',
          cueLineId: 'friend_hello',
          visualCue: { type: 'dayPart' },
          targetConceptIds: ['good-morning'],
          options: [{ id: 'player_good_morning', lineId: 'player_good_morning', isCorrect: true }],
        },
      ],
    };
    const result = validateBlueprint(bad);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'invalid_day_part_cue')).toBe(true);
  });

  it('fails when dayPart is an unsupported value', () => {
    const bad = {
      ...greetings_01Blueprint,
      beats: [
        {
          id: 'say_good_morning',
          role: 'choose_or_build_response',
          actionType: 'chooseReply',
          cueLineId: 'friend_hello',
          visualCue: { type: 'dayPart', dayPart: 'afternoon' },
          targetConceptIds: ['good-morning'],
          options: [{ id: 'player_good_morning', lineId: 'player_good_morning', isCorrect: true }],
        },
      ],
    };
    const result = validateBlueprint(bad);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'invalid_day_part_cue')).toBe(true);
  });

  it('fails when dayPart concept is not in targetConceptIds', () => {
    const bad = {
      ...greetings_01Blueprint,
      beats: [
        {
          id: 'say_good_morning',
          role: 'choose_or_build_response',
          actionType: 'chooseReply',
          cueLineId: 'friend_hello',
          visualCue: { type: 'dayPart', dayPart: 'morning' },
          targetConceptIds: ['hello'],
          options: [{ id: 'player_hello', lineId: 'player_hello', isCorrect: true }],
        },
      ],
    };
    const result = validateBlueprint(bad);
    expect(result.status).toBe('invalid_blueprint');
    expect(result.errors.some((e) => e.code === 'visual_cue_concept_mismatch')).toBe(true);
  });

  it('validates when dayPart is well-formed', () => {
    const good = {
      ...greetings_01Blueprint,
      packConceptIds: ['good-morning'],
      supportConceptIds: [],
      beats: [
        {
          id: 'say_good_morning',
          role: 'choose_or_build_response',
          actionType: 'chooseReply',
          cueLineId: 'friend_hello',
          visualCue: { type: 'dayPart', dayPart: 'morning' },
          targetConceptIds: ['good-morning'],
          options: [{ id: 'player_good_morning', lineId: 'player_good_morning', isCorrect: true }],
        },
      ],
    };
    const result = validateBlueprint(good);
    expect(result.status).toBe('ok');
  });
});

// ─── Hebrew target lines ───────────────────────────────────────────────────────

describe('greetings_01 Hebrew target lines', () => {
  it('each pack-concept player line has exactly one token tagged with its concept', () => {
    expect(tokenCount(greetings_01Lines.player_hello, 'hello')).toBe(1);
    expect(tokenCount(greetings_01Lines.player_good_morning, 'good-morning')).toBe(1);
    expect(tokenCount(greetings_01Lines.player_thank_you, 'thank-you')).toBe(1);
    expect(tokenCount(greetings_01Lines.player_you_are_welcome, 'you-are-welcome')).toBe(1);
    expect(tokenCount(greetings_01Lines.player_good_night, 'good-night')).toBe(1);
  });

  it('each player line uses the correct Hebrew word', () => {
    expect(greetings_01Lines.player_hello.targetText).toBe('שלום!');
    expect(greetings_01Lines.player_good_morning.targetText).toBe('בוקר טוב!');
    expect(greetings_01Lines.player_thank_you.targetText).toBe('תודה!');
    expect(greetings_01Lines.player_you_are_welcome.targetText).toBe('בבקשה!');
    expect(greetings_01Lines.player_good_night.targetText).toBe('לילה טוב!');
  });

  it('friend_goodbye is להתראות (not שלום, to prevent goodbye-reading activation)', () => {
    expect(greetings_01Lines.friend_goodbye.targetText).toBe('להתראות!');
  });

  it('friend_here_you_go is הנה! (not a greeting or courtesy word)', () => {
    expect(greetings_01Lines.friend_here_you_go.targetText).toBe('הנה!');
  });

  it('player lines are tagged with their speaker', () => {
    expect(greetings_01Lines.player_hello.speaker).toBe('player');
    expect(greetings_01Lines.player_good_morning.speaker).toBe('player');
    expect(greetings_01Lines.player_thank_you.speaker).toBe('player');
    expect(greetings_01Lines.player_you_are_welcome.speaker).toBe('player');
    expect(greetings_01Lines.player_good_night.speaker).toBe('player');
  });
});

// ─── Bridge word concept map ───────────────────────────────────────────────────

describe('greetings_01 bridge word concept map', () => {
  it('bb-bevakasha maps to you-are-welcome, not please', () => {
    expect(bridgeWordConceptMap.greetings_01['bb-bevakasha']).toBe('you-are-welcome');
    expect(bridgeWordConceptMap.greetings_01['bb-bevakasha']).not.toBe('please');
  });

  it('bb-shalom maps to hello, not goodbye or peace', () => {
    expect(bridgeWordConceptMap.greetings_01['bb-shalom']).toBe('hello');
    expect(bridgeWordConceptMap.greetings_01['bb-shalom']).not.toBe('goodbye');
    expect(bridgeWordConceptMap.greetings_01['bb-shalom']).not.toBe('peace');
  });

  it('bb-todah maps to thank-you', () => {
    expect(bridgeWordConceptMap.greetings_01['bb-todah']).toBe('thank-you');
  });

  it('bb-boker-tov maps to good-morning', () => {
    expect(bridgeWordConceptMap.greetings_01['bb-boker-tov']).toBe('good-morning');
  });

  it('bb-layla-tov maps to good-night', () => {
    expect(bridgeWordConceptMap.greetings_01['bb-layla-tov']).toBe('good-night');
  });

  it('greetings_01 packConceptIds exactly match the mapped consolidated wordIds', () => {
    const result = auditPackSceneForPack('greetings_01');
    expect(result.status).toBe('ok');
  });
});

// ─── End-to-end resolution ─────────────────────────────────────────────────────

describe('greetings_01 end-to-end resolution', () => {
  it('resolvePackScene returns ok for hebrew + english', () => {
    const result = resolvePackScene({
      packId: 'greetings_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
    expect(result.scene.packId).toBe('greetings_01');
    expect(result.scene.beats.length).toBe(greetings_01Blueprint.beats.length);
  });

  it('say_good_morning resolves with dayPart:morning visualCue preserved', () => {
    const { scene } = resolvePackScene({
      packId: 'greetings_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const beat = scene.beats.find((b) => b.id === 'say_good_morning');
    expect(beat.visualCue).not.toBeNull();
    expect(beat.visualCue.type).toBe('dayPart');
    expect(beat.visualCue.dayPart).toBe('morning');
  });

  it('say_good_night resolves with dayPart:night visualCue preserved', () => {
    const { scene } = resolvePackScene({
      packId: 'greetings_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const beat = scene.beats.find((b) => b.id === 'say_good_night');
    expect(beat.visualCue).not.toBeNull();
    expect(beat.visualCue.type).toBe('dayPart');
    expect(beat.visualCue.dayPart).toBe('night');
  });

  it('no English prompt reveals the answer before action', () => {
    const { scene } = resolvePackScene({
      packId: 'greetings_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    for (const beat of scene.beats) {
      expect(beat.prompt).toBe('');
    }
  });

  it('resolved beats carry correct Hebrew text for each pack concept', () => {
    const { scene } = resolvePackScene({
      packId: 'greetings_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const expected = {
      respond_with_hello: 'שלום!',
      say_good_morning: 'בוקר טוב!',
      say_thank_you: 'תודה!',
      say_you_are_welcome: 'בבקשה!',
      say_good_night: 'לילה טוב!',
    };
    for (const beat of scene.beats) {
      const correct = beat.options.find((o) => o.isCorrect);
      expect(correct.targetText).toBe(expected[beat.id]);
    }
  });

  it('resolved options carry English support meanings', () => {
    const { scene } = resolvePackScene({
      packId: 'greetings_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    const beat = scene.beats.find((b) => b.id === 'respond_with_hello');
    const correct = beat.options.find((o) => o.isCorrect);
    expect(correct.supportText).toBe('Hello!');
  });
});

// ─── Consistency audit ─────────────────────────────────────────────────────────

describe('greetings_01 consistency audit', () => {
  it('consistency audit passes for all registered scenes', () => {
    const result = auditAllRegisteredPackScenes();
    expect(result.status).toBe('ok');
  });
});

// ─── Regression: previous packs still resolve ─────────────────────────────────

describe('greetings_01 regression: previous packs still resolve', () => {
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

  it('everyday_objects_01 still resolves status ok', () => {
    const result = resolvePackScene({ packId: 'everyday_objects_01', targetLanguageId: 'hebrew', appLanguageId: 'english' });
    expect(result.status).toBe('ok');
  });
});
