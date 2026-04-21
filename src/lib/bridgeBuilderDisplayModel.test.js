import { describe, it, expect } from 'vitest';
import {
  getPackDisplayModel,
  getSectionDisplayModel,
  buildDisplayModel,
  PACK_STATUS,
  getSectionMeta,
  SECTION_META,
} from './bridgeBuilderDisplayModel.js';

function makePack(id, overrides = {}) {
  return {
    id,
    sectionId: overrides.sectionId || 'foundations',
    title: overrides.title || id,
    theme: overrides.theme || 'misc',
    description: overrides.description || 'desc',
    wordIds: overrides.wordIds || ['w1', 'w2', 'w3'],
    order: overrides.order ?? 1,
    unlockAfter: overrides.unlockAfter ?? null,
    primaryType: overrides.primaryType || 'mixed',
    goalTags: overrides.goalTags || ['sound-natural'],
    difficultyBand: overrides.difficultyBand || 'Core',
    estimatedTimeSec: overrides.estimatedTimeSec ?? 180,
    targetsNewCount: overrides.targetsNewCount ?? 3,
    supportReviewCount: overrides.supportReviewCount ?? 0,
    whyItMatters: overrides.whyItMatters || 'Because it matters',
  };
}

function completion(overrides = {}) {
  return {
    bridgeBuilderComplete: false,
    loosePlanksComplete: false,
    deepScriptComplete: false,
    ...overrides,
  };
}

describe('getPackDisplayModel', () => {
  it('returns NEW status for an untouched unlocked pack', () => {
    const pack = makePack('p1');
    const m = getPackDisplayModel(pack, {
      allWordProgress: {},
      packCompletions: {},
      isUnlocked: true,
    });
    expect(m.status).toBe(PACK_STATUS.NEW);
    expect(m.ctaLabel).toBe('Start');
    expect(m.progressLabel).toBe('0 of 3 words introduced');
    expect(m.unlockReason).toBeNull();
  });

  it('returns LOCKED with an unlock reason when gated', () => {
    const pack = makePack('p2', { unlockAfter: 'p1' });
    const m = getPackDisplayModel(pack, { isUnlocked: false });
    expect(m.status).toBe(PACK_STATUS.LOCKED);
    expect(m.ctaLabel).toBe('Why locked');
    expect(m.progressLabel).toBe('Locked');
    expect(m.unlockReason).toMatch(/unlock/i);
  });

  it('returns INTRODUCED when some words have been taught but no mode is complete', () => {
    const pack = makePack('p3');
    const m = getPackDisplayModel(pack, {
      allWordProgress: {
        w1: { wordId: 'w1', masteryStage: 'meaning_taught', meaningIntroduced: true },
      },
      packCompletions: {},
      isUnlocked: true,
    });
    expect(m.status).toBe(PACK_STATUS.INTRODUCED);
    expect(m.ctaLabel).toBe('Continue');
    expect(m.progressLabel).toBe('1 of 3 words introduced');
  });

  it('returns LEARNED when bridge-builder mode is complete', () => {
    const pack = makePack('p4');
    const m = getPackDisplayModel(pack, {
      allWordProgress: {},
      packCompletions: { p4: completion({ bridgeBuilderComplete: true }) },
      isUnlocked: true,
    });
    expect(m.status).toBe(PACK_STATUS.LEARNED);
    expect(m.modeCompletion).toEqual({ bridgeBuilder: true, loosePlanks: false, deepScript: false });
    expect(m.ctaLabel).toBe('Practice');
  });

  it('returns MASTERED when both tracks are complete', () => {
    const pack = makePack('p5');
    const m = getPackDisplayModel(pack, {
      allWordProgress: {},
      packCompletions: {
        p5: completion({ bridgeBuilderComplete: true, deepScriptComplete: true }),
      },
      isUnlocked: true,
    });
    expect(m.status).toBe(PACK_STATUS.MASTERED);
    expect(m.ctaLabel).toBe('Practice');
  });

  it('bumps cta to Review when a mastered pack has due words', () => {
    const pack = makePack('p6');
    const m = getPackDisplayModel(pack, {
      allWordProgress: {},
      packCompletions: {
        p6: completion({ bridgeBuilderComplete: true, deepScriptComplete: true }),
      },
      dueReviewWordIdSet: new Set(['w1']),
      isUnlocked: true,
    });
    expect(m.status).toBe(PACK_STATUS.MASTERED);
    expect(m.isReviewDue).toBe(true);
    expect(m.reviewDueCount).toBe(1);
    expect(m.ctaLabel).toBe('Review');
  });

  it('surfaces sentenceReady and quizKnown flags from storage', () => {
    const pack = makePack('p7');
    const m = getPackDisplayModel(pack, {
      allWordProgress: {
        w2: { wordId: 'w2', masteryStage: 'new', quizKnown: true },
      },
      packCompletions: {
        p7: completion({ sentenceReady: true, quizMastered: true }),
      },
      isUnlocked: true,
    });
    expect(m.sentenceReady).toBe(true);
    expect(m.quizPassed).toBe(true);
    expect(m.quizKnown).toBe(true);
  });

  it('throws on an invalid pack shape', () => {
    expect(() => getPackDisplayModel({}, {})).toThrow();
  });
});

describe('getSectionDisplayModel', () => {
  const section = {
    id: 'foundations',
    title: 'Foundations',
    description: 'desc',
    order: 1,
    packIds: ['p1', 'p2', 'p3', 'p4'],
  };

  it('aggregates counts from pack models', () => {
    const packs = [
      makePack('p1', { wordIds: ['a1', 'a2', 'a3'] }),
      makePack('p2', { wordIds: ['b1', 'b2', 'b3'] }),
      makePack('p3', { wordIds: ['c1', 'c2', 'c3'] }),
      makePack('p4', { wordIds: ['d1', 'd2', 'd3'] }),
    ];
    const m = getSectionDisplayModel(section, {
      packs,
      allWordProgress: {
        a1: { wordId: 'a1', masteryStage: 'meaning_taught', meaningIntroduced: true },
      },
      packCompletions: {
        p3: completion({ bridgeBuilderComplete: true }),
        p4: completion({ bridgeBuilderComplete: true, deepScriptComplete: true }),
      },
      isUnlocked: true,
    });
    expect(m.totalPacks).toBe(4);
    expect(m.masteredCount).toBe(1);
    expect(m.learnedCount).toBe(1);
    expect(m.startedCount).toBe(1);
    expect(m.completedCount).toBe(2);
    expect(m.progressPercent).toBe(25);
  });

  it('selects currentPack as the first in-progress pack', () => {
    const packs = [
      makePack('p1', { title: 'Alpha' }),
      makePack('p2', { title: 'Beta' }),
    ];
    const m = getSectionDisplayModel(section, {
      packs,
      allWordProgress: {
        w1: { wordId: 'w1', masteryStage: 'meaning_taught', meaningIntroduced: true },
      },
      packCompletions: {},
      isUnlocked: true,
    });
    // p1 has w1 introduced — becomes the current
    expect(m.currentPack?.id).toBe('p1');
    expect(m.recommendedPack?.id).toBe('p1');
  });

  it('falls back to first actionable pack when nothing is in-progress', () => {
    const packs = [
      makePack('p1'),
      makePack('p2'),
    ];
    const m = getSectionDisplayModel(section, {
      packs,
      allWordProgress: {},
      packCompletions: {},
      isUnlocked: true,
    });
    expect(m.currentPack?.id).toBe('p1');
  });

  it('emits a nextUnlockLabel when section is locked', () => {
    const packs = [makePack('p1')];
    const m = getSectionDisplayModel(section, {
      packs,
      isUnlocked: false,
      previousSection: { id: 'prior', title: 'Prior' },
    });
    expect(m.nextUnlockLabel).toBe('Complete Prior to unlock');
    expect(m.previewPacks[0].status).toBe(PACK_STATUS.LOCKED);
  });

  it('limits previewPacks to previewLimit and computes remaining', () => {
    const packs = [
      makePack('p1'),
      makePack('p2'),
      makePack('p3'),
      makePack('p4'),
      makePack('p5'),
    ];
    const m = getSectionDisplayModel(section, {
      packs,
      previewLimit: 3,
      isUnlocked: true,
    });
    expect(m.previewPacks).toHaveLength(3);
    expect(m.remainingCount).toBe(2);
  });

  it('uses section meta icon/accent', () => {
    const packs = [makePack('p1')];
    const m = getSectionDisplayModel(section, { packs, isUnlocked: true });
    expect(m.icon).toBe(SECTION_META.foundations.icon);
    expect(m.accent).toBe(SECTION_META.foundations.accent);
  });
});

describe('getSectionMeta', () => {
  it('falls back to a default for unknown section ids', () => {
    expect(getSectionMeta('not_a_real_section')).toEqual({ icon: 'category', accent: 'primary' });
  });
});

describe('buildDisplayModel', () => {
  it('walks sections in order, wiring previous-section unlock copy', () => {
    const sections = [
      { id: 'foundations', title: 'Foundations', description: 'a', order: 1, packIds: ['p1'] },
      { id: 'daily_life',  title: 'Daily Life',  description: 'b', order: 2, packIds: ['p2'] },
    ];
    const packsBySection = {
      foundations: [makePack('p1', { sectionId: 'foundations' })],
      daily_life:  [makePack('p2', { sectionId: 'daily_life' })],
    };
    const result = buildDisplayModel({
      sections,
      getPacksForSection: (id) => packsBySection[id],
      allWordProgress: {},
      packCompletions: {},
      isSectionUnlocked: (s) => s.id !== 'daily_life',
    });
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].isUnlocked).toBe(true);
    expect(result.sections[1].isUnlocked).toBe(false);
    expect(result.sections[1].nextUnlockLabel).toBe('Complete Foundations to unlock');
    expect(result.packsById.p1.status).toBe(PACK_STATUS.NEW);
    expect(result.packsById.p2.status).toBe(PACK_STATUS.LOCKED);
  });
});
