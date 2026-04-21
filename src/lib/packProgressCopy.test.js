import { describe, it, expect } from 'vitest';
import { buildPackProgressCopy } from './packProgressCopy.js';

function makePack(overrides = {}) {
  return {
    id: overrides.id || 'pack-1',
    title: overrides.title || 'Pack 1',
    wordIds: overrides.wordIds || ['w1', 'w2', 'w3'],
    unlockAfter: overrides.unlockAfter ?? null,
    ...overrides,
  };
}

describe('buildPackProgressCopy', () => {
  it('returns New state and baseline labels with no progress', () => {
    const result = buildPackProgressCopy({
      pack: makePack(),
      progress: { totalWords: 3, wordsIntroducedCount: 0 },
      completion: {},
      isUnlocked: true,
    });

    expect(result.stageLabel).toBe('New');
    expect(result.wordsIntroducedLabel).toBe('0 of 3 words introduced');
    expect(result.modesCompleteLabel).toBe('0 of 3 modes complete');
  });

  it('returns Mastered when all modes are complete', () => {
    const result = buildPackProgressCopy({
      pack: makePack(),
      progress: { totalWords: 3, wordsIntroducedCount: 3 },
      completion: {
        bridgeBuilderComplete: true,
        loosePlanksComplete: true,
        deepScriptComplete: true,
      },
      isUnlocked: true,
    });

    expect(result.stageLabel).toBe('Mastered');
    expect(result.modesCompleteLabel).toBe('3 of 3 modes complete');
  });

  it('surfaces suggested reason when unlockAfter exists but gating is not enforced', () => {
    const result = buildPackProgressCopy({
      pack: makePack({ unlockAfter: 'pronouns_02' }),
      progress: { totalWords: 3, wordsIntroducedCount: 0 },
      completion: {},
      isUnlocked: true,
      isGatingEnforced: false,
    });

    expect(result.unlockReasonLabel).toContain('Suggested after');
  });
});
