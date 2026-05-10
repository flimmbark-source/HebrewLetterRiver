import { describe, it, expect } from 'vitest';
import { resolvePackScene } from './resolvePackScene.js';
import { resolveTargetLines } from './resolveTargetLines.js';
import { resolveAppStrings } from './resolveAppStrings.js';
import { resolveBeats } from './resolveBeats.js';
import { food_01Blueprint } from '../blueprints/food_01.js';
import { food_01Lines } from '../targetLanguages/hebrew/food_01Lines.js';
import { beginnerDistractors } from '../distractors/beginnerDistractors.js';
import { food_01Strings } from '../appLanguages/english/food_01Strings.js';

describe('Phase 2B: data layer integrity', () => {
  it('food_01Blueprint contains no Hebrew text', () => {
    const serialized = JSON.stringify(food_01Blueprint);
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  it('food_01Lines contains no distractor lines', () => {
    for (const id of Object.keys(food_01Lines)) {
      expect(id.startsWith('distractor_')).toBe(false);
    }
  });

  it('beginnerDistractors covers every distractor referenced by the blueprint', () => {
    const referenced = new Set();
    for (const beat of food_01Blueprint.beats) {
      for (const opt of beat.options || []) {
        if (opt && typeof opt.lineId === 'string' && opt.lineId.startsWith('distractor_')) {
          referenced.add(opt.lineId);
        }
      }
    }
    const pool = beginnerDistractors.hebrew;
    for (const id of referenced) {
      expect(pool[id]).toBeTruthy();
    }
  });
});

describe('Phase 2B: resolveTargetLines', () => {
  it('succeeds for hebrew target language', () => {
    const result = resolveTargetLines(food_01Blueprint, 'hebrew');
    expect(result.status).toBe('ok');
    expect(result.targetLines.server_drink_choice).toBeTruthy();
    expect(result.targetLines.player_water_please).toBeTruthy();
  });

  it('does not require distractor lines from the target-language file', () => {
    const result = resolveTargetLines(food_01Blueprint, 'hebrew');
    expect(result.status).toBe('ok');
    for (const id of Object.keys(result.targetLines)) {
      expect(id.startsWith('distractor_')).toBe(false);
    }
  });

  it('returns missing_target_realization for unsupported language', () => {
    const result = resolveTargetLines(food_01Blueprint, 'spanish');
    expect(result.status).toBe('missing_target_realization');
    expect(result.targetLanguageId).toBe('spanish');
    expect(Array.isArray(result.missingLineIds)).toBe(true);
  });
});

describe('Phase 2B: resolveAppStrings', () => {
  it('succeeds for english app language', () => {
    const result = resolveAppStrings(food_01Blueprint, 'english');
    expect(result.status).toBe('ok');
    expect(result.appStrings.supportMeanings.coffee_or_water).toBe('Coffee or water?');
    expect(result.appStrings.lineSupportMeanings.distractor_i_am_home).toBe('I am at home.');
  });

  it('returns missing_app_strings for unsupported language', () => {
    const result = resolveAppStrings(food_01Blueprint, 'french');
    expect(result.status).toBe('missing_app_strings');
    expect(result.appLanguageId).toBe('french');
  });
});

describe('Phase 2B: resolveBeats', () => {
  function setup() {
    const target = resolveTargetLines(food_01Blueprint, 'hebrew');
    const strings = resolveAppStrings(food_01Blueprint, 'english');
    const pool = beginnerDistractors.hebrew;
    return { target, strings, pool };
  }

  it('hydrates meaningChoice options from supportMeanings', () => {
    const { target, strings, pool } = setup();
    const result = resolveBeats(food_01Blueprint, target.targetLines, pool, strings.appStrings);
    expect(result.status).toBe('ok');
    const beat = result.beats.find((b) => b.actionType === 'meaningChoice');
    expect(beat.options.find((o) => o.id === 'correct').text).toBe('Coffee or water?');
    expect(beat.options.find((o) => o.id === 'correct').isCorrect).toBe(true);
  });

  it('hydrates explicit chooseReply options from targetLines and distractor pool', () => {
    const { target, strings, pool } = setup();
    const result = resolveBeats(food_01Blueprint, target.targetLines, pool, strings.appStrings);
    expect(result.status).toBe('ok');
    const beat = result.beats.find((b) => b.id === 'accept_bread');
    const correct = beat.options.find((o) => o.isCorrect);
    expect(correct.targetText).toBe('כן, לחם בבקשה.');
    expect(correct.supportText).toBe('Yes, bread please.');
    expect(correct.direction).toBe('rtl');
    const wrongHome = beat.options.find((o) => o.id === 'wrong_home');
    expect(wrongHome.targetText).toBe('אני בבית.');
    expect(wrongHome.supportText).toBe('I am at home.');
  });

  it('attaches supportText from lineSupportMeanings', () => {
    const { target, strings, pool } = setup();
    const result = resolveBeats(food_01Blueprint, target.targetLines, pool, strings.appStrings);
    const closeBeat = result.beats.find((b) => b.id === 'close_exchange');
    expect(closeBeat.options.find((o) => o.isCorrect).supportText).toBe('Thank you.');
  });

  it('builds tileBankTokens for buildLine including answer + distractor tiles', () => {
    const { target, strings, pool } = setup();
    const result = resolveBeats(food_01Blueprint, target.targetLines, pool, strings.appStrings);
    const beat = result.beats.find((b) => b.id === 'answer_drink');
    expect(beat.answerLines.length).toBe(2);
    const sources = new Set(beat.tileBankTokens.map((t) => t.source));
    expect(sources.has('answer')).toBe(true);
    expect(sources.has('distractor')).toBe(true);
    // domain exclusions on the policy: ['cafe', 'food_ordering']. None of the
    // distractor pool entries are in 'cafe'/'food_ordering' so two should appear.
    const distractorTiles = beat.tileBankTokens.filter((t) => t.source === 'distractor');
    expect(distractorTiles.length).toBe(2);
  });

  it('returns invalid_resolved_scene when an option lineId is unresolvable', () => {
    const { target, strings, pool } = setup();
    const broken = JSON.parse(JSON.stringify(food_01Blueprint));
    const beat = broken.beats.find((b) => b.id === 'accept_bread');
    beat.options[0].lineId = 'player_does_not_exist';
    const result = resolveBeats(broken, target.targetLines, pool, strings.appStrings);
    expect(result.status).toBe('invalid_resolved_scene');
    expect(result.errors.some((e) => e.code === 'missing_target_line')).toBe(true);
  });
});

describe('Phase 2B: resolvePackScene end-to-end', () => {
  it('returns the final resolved scene shape', () => {
    const result = resolvePackScene({
      packId: 'food_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
    const scene = result.scene;
    expect(scene.packId).toBe('food_01');
    expect(scene.targetLanguageId).toBe('hebrew');
    expect(scene.appLanguageId).toBe('english');
    expect(scene.directionConfig.cueDirection).toBe('rtl');
    expect(scene.directionConfig.promptDirection).toBe('ltr');
    expect(Array.isArray(scene.beats)).toBe(true);
    expect(scene.beats.length).toBe(food_01Blueprint.beats.length);

    const buildBeat = scene.beats.find((b) => b.actionType === 'buildLine');
    expect(buildBeat).toMatchObject({
      id: expect.any(String),
      role: expect.any(String),
      actionType: 'buildLine',
      prompt: expect.any(String),
      targetConceptIds: expect.any(Array),
      answerLines: expect.any(Array),
      tileBankTokens: expect.any(Array),
    });
    expect(buildBeat.acceptedConceptSets).toBeTruthy();
  });

  it('returns missing_blueprint for unknown packId', () => {
    const result = resolvePackScene({
      packId: 'unknown_pack',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('missing_blueprint');
  });

  it('returns missing_target_realization for unsupported target language', () => {
    const result = resolvePackScene({
      packId: 'food_01',
      targetLanguageId: 'spanish',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('missing_target_realization');
  });

  it('returns missing_app_strings for unsupported app language', () => {
    const result = resolvePackScene({
      packId: 'food_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'french',
    });
    expect(result.status).toBe('missing_app_strings');
  });
});
