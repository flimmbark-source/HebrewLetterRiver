import { describe, it, expect } from 'vitest';
import {
  getRecommendedPack,
  getPreviewPacks,
  getRemainingCount,
  getPackButtonLabel,
  PREVIEW_LIMIT,
  formatEstimatedMinutes,
  matchesGoal,
  matchesQuery,
  sortPackData,
} from './bridgeBuilderSetupHelpers.js';

function makePack(id, overrides = {}) {
  return {
    pack: { id, title: id, wordIds: ['w1', 'w2', 'w3'], ...overrides.pack },
    progress: {
      wordsIntroducedCount: 0,
      wordsLearnedCount: 0,
      totalWords: 3,
      completed: false,
      ...overrides.progress,
    },
    unlocked: overrides.unlocked !== undefined ? overrides.unlocked : true,
    completion: {
      bridgeBuilderComplete: false,
      loosePlanksComplete: false,
      deepScriptComplete: false,
      ...overrides.completion,
    },
  };
}

describe('getRecommendedPack', () => {
  it('prefers an in-progress pack over a new pack', () => {
    const packs = [
      makePack('a'),
      makePack('b', { progress: { wordsIntroducedCount: 2, totalWords: 3, completed: false } }),
      makePack('c'),
    ];
    const result = getRecommendedPack(packs);
    expect(result.pack.id).toBe('b');
  });

  it('falls back to first pack when nothing is in progress', () => {
    const packs = [makePack('a'), makePack('b'), makePack('c')];
    const result = getRecommendedPack(packs);
    expect(result.pack.id).toBe('a');
  });
});

describe('getPreviewPacks', () => {
  it('returns up to PREVIEW_LIMIT - 1 packs excluding the recommended one', () => {
    const packs = [makePack('a'), makePack('b'), makePack('c'), makePack('d'), makePack('e')];
    const preview = getPreviewPacks(packs, 'a', PREVIEW_LIMIT);
    expect(preview.length).toBe(PREVIEW_LIMIT - 1);
    expect(preview.map(p => p.pack.id)).toEqual(['b', 'c']);
  });
});

describe('getRemainingCount', () => {
  it('returns 0 when section exactly matches preview limit', () => {
    const packs = Array.from({ length: PREVIEW_LIMIT }, (_, i) => makePack(`p${i}`));
    expect(getRemainingCount(packs, PREVIEW_LIMIT)).toBe(0);
  });
});

describe('getPackButtonLabel', () => {
  it('returns expected labels', () => {
    expect(getPackButtonLabel({ wordsIntroducedCount: 2, totalWords: 5, completed: false })).toBe('Continue');
    expect(getPackButtonLabel({ wordsIntroducedCount: 0, totalWords: 5, completed: false })).toBe('Play');
    expect(getPackButtonLabel({ wordsIntroducedCount: 5, totalWords: 5, completed: true })).toBe('Play');
  });
});

describe('new metadata helper behavior', () => {
  it('formats estimated minutes with a 1-minute floor', () => {
    expect(formatEstimatedMinutes(30)).toBe('1 min');
    expect(formatEstimatedMinutes(125)).toBe('2 min');
  });

  it('matches goals and query text', () => {
    const pack = {
      title: 'Basic Connectors',
      description: 'However, so, but',
      primaryType: 'connector',
      difficultyBand: 'Core',
      goalTags: ['connect-ideas'],
    };
    expect(matchesGoal(pack, 'connect-ideas')).toBe(true);
    expect(matchesGoal(pack, 'ask-questions')).toBe(false);
    expect(matchesQuery(pack, 'connector')).toBe(true);
    expect(matchesQuery(pack, 'weather')).toBe(false);
  });

  it('sorts pack data by time and difficulty', () => {
    const data = [
      { pack: { order: 2, estimatedTimeSec: 180, difficultyBand: 'Advanced' } },
      { pack: { order: 1, estimatedTimeSec: 60, difficultyBand: 'Starter' } },
      { pack: { order: 3, estimatedTimeSec: 120, difficultyBand: 'Core' } },
    ];
    expect(sortPackData(data, 'time').map(p => p.pack.estimatedTimeSec)).toEqual([60, 120, 180]);
    expect(sortPackData(data, 'difficulty').map(p => p.pack.difficultyBand)).toEqual(['Starter', 'Core', 'Advanced']);
  });
});
