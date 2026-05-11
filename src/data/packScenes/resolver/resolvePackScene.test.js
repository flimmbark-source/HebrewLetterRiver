import { describe, it, expect } from 'vitest';
import { resolvePackScene } from './resolvePackScene.js';
import { resolveTargetLines } from './resolveTargetLines.js';
import { resolveAppStrings } from './resolveAppStrings.js';
import { resolveBeats } from './resolveBeats.js';
import { validateBlueprint } from './validateBlueprint.js';
import { food_01Blueprint } from '../blueprints/food_01.js';
import { colors_01Blueprint } from '../blueprints/colors_01.js';
import { food_01Lines } from '../targetLanguages/hebrew/food_01Lines.js';
import { colors_01Lines } from '../targetLanguages/hebrew/colors_01Lines.js';
import { beginnerDistractors } from '../distractors/beginnerDistractors.js';

function countConceptTokens(line, conceptId) {
  return (line.tokens || []).filter((token) => token.conceptId === conceptId).length;
}

describe('Phase 2B: data layer integrity', () => {
  it('food_01Blueprint contains no Hebrew text', () => {
    const serialized = JSON.stringify(food_01Blueprint);
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  it('colors_01Blueprint contains no Hebrew text', () => {
    const serialized = JSON.stringify(colors_01Blueprint);
    expect(/[֐-׿]/.test(serialized)).toBe(false);
  });

  it('food_01Lines contains no distractor lines', () => {
    for (const id of Object.keys(food_01Lines)) {
      expect(id.startsWith('distractor_')).toBe(false);
    }
  });

  it('colors_01Lines contains no distractor lines', () => {
    for (const id of Object.keys(colors_01Lines)) {
      expect(id.startsWith('distractor_')).toBe(false);
    }
  });

  it('beginnerDistractors covers every distractor referenced by food_01 and colors_01', () => {
    const referenced = new Set();
    for (const blueprint of [food_01Blueprint, colors_01Blueprint]) {
      for (const beat of blueprint.beats) {
        for (const opt of beat.options || []) {
          if (opt && typeof opt.lineId === 'string' && opt.lineId.startsWith('distractor_')) {
            referenced.add(opt.lineId);
          }
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
  it('succeeds for hebrew food_01 target language', () => {
    const result = resolveTargetLines(food_01Blueprint, 'hebrew');
    expect(result.status).toBe('ok');
    expect(result.targetLines.server_drink_choice).toBeTruthy();
    expect(result.targetLines.player_water_please).toBeTruthy();
  });

  it('succeeds for hebrew colors_01 target language', () => {
    const result = resolveTargetLines(colors_01Blueprint, 'hebrew');
    expect(result.status).toBe('ok');
    expect(result.targetLines.friend_what_color_is_this).toBeTruthy();
    expect(result.targetLines.player_red).toBeTruthy();
    expect(result.targetLines.player_yellow).toBeTruthy();
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
  it('succeeds for english food_01 app language', () => {
    const result = resolveAppStrings(food_01Blueprint, 'english');
    expect(result.status).toBe('ok');
    expect(result.appStrings.supportMeanings.coffee_or_water).toBe('Coffee or water?');
    expect(result.appStrings.lineSupportMeanings.distractor_i_am_home).toBe('I am at home.');
  });

  it('succeeds for english colors_01 app language', () => {
    const result = resolveAppStrings(colors_01Blueprint, 'english');
    expect(result.status).toBe('ok');
    expect(result.appStrings.lineSupportMeanings.player_green).toBe('Green.');
    expect(result.appStrings.shared.conceptDisplayNames.yellow).toBe('yellow');
  });

  it('returns missing_app_strings for unsupported language', () => {
    const result = resolveAppStrings(food_01Blueprint, 'french');
    expect(result.status).toBe('missing_app_strings');
    expect(result.appLanguageId).toBe('french');
  });
});

describe('Phase 2B: resolveBeats', () => {
  function setupFood() {
    const target = resolveTargetLines(food_01Blueprint, 'hebrew');
    const strings = resolveAppStrings(food_01Blueprint, 'english');
    const pool = beginnerDistractors.hebrew;
    return { target, strings, pool };
  }

  function setupColors() {
    const target = resolveTargetLines(colors_01Blueprint, 'hebrew');
    const strings = resolveAppStrings(colors_01Blueprint, 'english');
    const pool = beginnerDistractors.hebrew;
    return { target, strings, pool };
  }

  it('hydrates meaningChoice options from supportMeanings', () => {
    const { target, strings, pool } = setupFood();
    const result = resolveBeats(food_01Blueprint, target.targetLines, pool, strings.appStrings);
    expect(result.status).toBe('ok');
    const beat = result.beats.find((b) => b.actionType === 'meaningChoice');
    expect(beat.options.find((o) => o.id === 'correct').text).toBe('Coffee or water?');
    expect(beat.options.find((o) => o.id === 'correct').isCorrect).toBe(true);
  });

  it('hydrates explicit chooseReply options from targetLines and distractor pool', () => {
    const { target, strings, pool } = setupFood();
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

  it('passes visualCue through resolved colors_01 beats', () => {
    const { target, strings, pool } = setupColors();
    const result = resolveBeats(colors_01Blueprint, target.targetLines, pool, strings.appStrings);
    expect(result.status).toBe('ok');
    const redBeat = result.beats.find((b) => b.id === 'identify_red');
    expect(redBeat.visualCue).toEqual({ type: 'colorCircle', colorConceptId: 'red' });
    expect(redBeat.options.filter((o) => o.isCorrect)).toHaveLength(1);
    expect(redBeat.options.find((o) => o.isCorrect).lineId).toBe('player_red');
  });

  it('attaches supportText from lineSupportMeanings', () => {
    const { target, strings, pool } = setupFood();
    const result = resolveBeats(food_01Blueprint, target.targetLines, pool, strings.appStrings);
    const closeBeat = result.beats.find((b) => b.id === 'close_exchange');
    expect(closeBeat.options.find((o) => o.isCorrect).supportText).toBe('Thank you.');
  });

  it('builds tileBankTokens for buildLine including answer + distractor tiles', () => {
    const { target, strings, pool } = setupFood();
    const result = resolveBeats(food_01Blueprint, target.targetLines, pool, strings.appStrings);
    const beat = result.beats.find((b) => b.id === 'answer_drink');
    expect(beat.answerLines.length).toBe(2);
    const sources = new Set(beat.tileBankTokens.map((t) => t.source));
    expect(sources.has('answer')).toBe(true);
    expect(sources.has('distractor')).toBe(true);
    const distractorTiles = beat.tileBankTokens.filter((t) => t.source === 'distractor');
    expect(distractorTiles.length).toBe(2);
  });

  it('returns invalid_resolved_scene when an option lineId is unresolvable', () => {
    const { target, strings, pool } = setupFood();
    const broken = JSON.parse(JSON.stringify(food_01Blueprint));
    const beat = broken.beats.find((b) => b.id === 'accept_bread');
    beat.options[0].lineId = 'player_does_not_exist';
    const result = resolveBeats(broken, target.targetLines, pool, strings.appStrings);
    expect(result.status).toBe('invalid_resolved_scene');
    expect(result.errors.some((e) => e.code === 'missing_target_line')).toBe(true);
  });
});

describe('Phase 3: colors_01 visual grounded scene', () => {
  it('colors_01 blueprint validates', () => {
    const result = validateBlueprint(colors_01Blueprint);
    expect(result.status).toBe('ok');
  });

  it('colors_01 covers all four pack colors', () => {
    expect(colors_01Blueprint.packConceptIds).toEqual(['red', 'blue', 'green', 'yellow']);
  });

  it('each color identify beat has exactly one correct answer matching its visualCue', () => {
    for (const color of ['red', 'blue', 'green', 'yellow']) {
      const beat = colors_01Blueprint.beats.find((b) => b.id === `identify_${color}`);
      expect(beat.visualCue).toEqual({ type: 'colorCircle', colorConceptId: color });
      expect(beat.options.filter((option) => option.isCorrect)).toEqual([
        { id: color, lineId: `player_${color}`, isCorrect: true },
      ]);
    }
  });

  it('color target lines each contain exactly one matching concept token', () => {
    expect(countConceptTokens(colors_01Lines.player_red, 'red')).toBe(1);
    expect(countConceptTokens(colors_01Lines.player_blue, 'blue')).toBe(1);
    expect(countConceptTokens(colors_01Lines.player_green, 'green')).toBe(1);
    expect(countConceptTokens(colors_01Lines.player_yellow, 'yellow')).toBe(1);
    expect(countConceptTokens(colors_01Lines.player_thank_you, 'thank-you')).toBe(1);
  });
});

describe('Phase 2B: resolvePackScene end-to-end', () => {
  it('returns the final resolved food_01 scene shape', () => {
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

  it('returns the final resolved colors_01 scene shape', () => {
    const result = resolvePackScene({
      packId: 'colors_01',
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });
    expect(result.status).toBe('ok');
    const scene = result.scene;
    expect(scene.packId).toBe('colors_01');
    expect(scene.blueprint.packConceptIds).toEqual(['red', 'blue', 'green', 'yellow']);
    const firstBeat = scene.beats[0];
    expect(firstBeat.id).toBe('identify_red');
    expect(firstBeat.visualCue).toEqual({ type: 'colorCircle', colorConceptId: 'red' });
    expect(firstBeat.options.find((o) => o.isCorrect).targetText).toBe('אדום.');
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
