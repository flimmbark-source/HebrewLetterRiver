import { describe, expect, it } from 'vitest';
import { formatEstimatedMinutes, matchesGoal, matchesQuery, sortPackData } from './bridgeBuilderSetupHelpers.js';

describe('bridgeBuilderSetupHelpers', () => {
  it('formats estimated minutes with a 1 minute floor', () => {
    expect(formatEstimatedMinutes(30)).toBe('1 min');
    expect(formatEstimatedMinutes(125)).toBe('2 min');
  });

  it('matches goal filters', () => {
    const pack = { goalTags: ['connect-ideas'] };
    expect(matchesGoal(pack, 'all')).toBe(true);
    expect(matchesGoal(pack, 'connect-ideas')).toBe(true);
    expect(matchesGoal(pack, 'ask-questions')).toBe(false);
  });

  it('matches query against relevant metadata', () => {
    const pack = {
      title: 'Basic Connectors',
      description: 'However, so, but',
      primaryType: 'connector',
      difficultyBand: 'Core',
      goalTags: ['connect-ideas'],
    };
    expect(matchesQuery(pack, 'connector')).toBe(true);
    expect(matchesQuery(pack, 'ideas')).toBe(true);
    expect(matchesQuery(pack, 'weather')).toBe(false);
  });

  it('sorts by time and difficulty', () => {
    const data = [
      { pack: { order: 2, estimatedTimeSec: 180, difficultyBand: 'Advanced' } },
      { pack: { order: 1, estimatedTimeSec: 60, difficultyBand: 'Starter' } },
      { pack: { order: 3, estimatedTimeSec: 120, difficultyBand: 'Core' } },
    ];
    expect(sortPackData(data, 'time').map(p => p.pack.estimatedTimeSec)).toEqual([60, 120, 180]);
    expect(sortPackData(data, 'difficulty').map(p => p.pack.difficultyBand)).toEqual(['Starter', 'Core', 'Advanced']);
  });
});
