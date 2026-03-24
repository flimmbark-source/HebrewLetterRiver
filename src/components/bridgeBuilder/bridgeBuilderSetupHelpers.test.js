import { describe, it, expect } from 'vitest';
import {
  getRecommendedPack,
  getPreviewPacks,
  getRemainingCount,
  getPackButtonLabel,
  PREVIEW_LIMIT,
} from './bridgeBuilderSetupHelpers.js';

/* ─── Test data factory ──────────────────────────────────── */

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

/* ─── getRecommendedPack ─────────────────────────────────── */

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

  it('skips completed packs when choosing in-progress', () => {
    const packs = [
      makePack('a', { progress: { wordsIntroducedCount: 3, totalWords: 3, completed: true } }),
      makePack('b', { progress: { wordsIntroducedCount: 1, totalWords: 3, completed: false } }),
    ];
    const result = getRecommendedPack(packs);
    expect(result.pack.id).toBe('b');
  });

  it('returns null for empty pack list', () => {
    expect(getRecommendedPack([])).toBeNull();
  });

  it('returns null when all packs are locked', () => {
    const packs = [makePack('a', { unlocked: false }), makePack('b', { unlocked: false })];
    expect(getRecommendedPack(packs)).toBeNull();
  });
});

/* ─── getPreviewPacks ────────────────────────────────────── */

describe('getPreviewPacks', () => {
  it('returns up to PREVIEW_LIMIT - 1 packs excluding the recommended one', () => {
    const packs = [makePack('a'), makePack('b'), makePack('c'), makePack('d'), makePack('e')];
    const preview = getPreviewPacks(packs, 'a', PREVIEW_LIMIT);
    expect(preview.length).toBe(PREVIEW_LIMIT - 1);
    expect(preview.map(p => p.pack.id)).toEqual(['b', 'c']);
  });

  it('respects a custom limit', () => {
    const packs = [makePack('a'), makePack('b'), makePack('c'), makePack('d')];
    const preview = getPreviewPacks(packs, 'a', 2);
    expect(preview.length).toBe(1);
    expect(preview[0].pack.id).toBe('b');
  });

  it('returns fewer packs if section is small', () => {
    const packs = [makePack('a'), makePack('b')];
    const preview = getPreviewPacks(packs, 'a', PREVIEW_LIMIT);
    expect(preview.length).toBe(1);
    expect(preview[0].pack.id).toBe('b');
  });
});

/* ─── getRemainingCount ──────────────────────────────────── */

describe('getRemainingCount', () => {
  it('computes correct remaining count', () => {
    const packs = Array.from({ length: 8 }, (_, i) => makePack(`p${i}`));
    expect(getRemainingCount(packs, PREVIEW_LIMIT)).toBe(8 - PREVIEW_LIMIT);
  });

  it('returns 0 when section fits within preview', () => {
    const packs = [makePack('a'), makePack('b')];
    expect(getRemainingCount(packs, PREVIEW_LIMIT)).toBe(0);
  });

  it('returns 0 when section exactly matches preview limit', () => {
    const packs = Array.from({ length: PREVIEW_LIMIT }, (_, i) => makePack(`p${i}`));
    expect(getRemainingCount(packs, PREVIEW_LIMIT)).toBe(0);
  });
});

/* ─── getPackButtonLabel ─────────────────────────────────── */

describe('getPackButtonLabel', () => {
  it('returns "Continue" for in-progress packs', () => {
    expect(getPackButtonLabel({ wordsIntroducedCount: 2, totalWords: 5, completed: false })).toBe('Continue');
  });

  it('returns "Play" for new packs', () => {
    expect(getPackButtonLabel({ wordsIntroducedCount: 0, totalWords: 5, completed: false })).toBe('Play');
  });

  it('returns "Play" for completed packs (replay)', () => {
    expect(getPackButtonLabel({ wordsIntroducedCount: 5, totalWords: 5, completed: true })).toBe('Play');
  });
});
