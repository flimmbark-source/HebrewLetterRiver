import { beforeEach, describe, expect, it } from 'vitest';
import {
  JOURNEY_STAGE_ORDER,
  createDefaultJourney,
  normalizeJourney,
  seedJourneyFromLegacyPlayer,
  getJourneyStageStates,
  WORDS_UNLOCK_LETTER_RATIO
} from './learningJourney.js';

function makeLanguagePack(letterCount = 10) {
  return {
    items: Array.from({ length: letterCount }, (_, i) => ({ id: `letter-${i}`, symbol: `L${i}` }))
  };
}

function makePlayerWithPracticedLetters(count) {
  const letters = {};
  for (let i = 0; i < count; i++) {
    letters[`letter-${i}`] = { correct: 3, incorrect: 1 };
  }
  return { letters, totals: { sessions: 0 }, journey: createDefaultJourney() };
}

beforeEach(() => {
  localStorage.clear();
});

describe('normalizeJourney', () => {
  it('returns the default journey for missing input', () => {
    expect(normalizeJourney(null)).toEqual(createDefaultJourney());
  });

  it('always includes letters and drops unknown stages', () => {
    const journey = normalizeJourney({ unlockedStages: ['words', 'bogus'], introsSeen: [] });
    expect(journey.unlockedStages).toEqual(['letters', 'words']);
    expect(journey.introsSeen).toEqual(['letters']);
  });

  it('keeps stages in canonical order', () => {
    const journey = normalizeJourney({ unlockedStages: ['conversation', 'letters', 'words'] });
    expect(journey.unlockedStages).toEqual(['letters', 'words', 'conversation']);
  });
});

describe('seedJourneyFromLegacyPlayer', () => {
  it('seeds only letters for a fresh player', () => {
    const journey = seedJourneyFromLegacyPlayer({ totals: { sessions: 0 }, letters: {} });
    expect(journey.unlockedStages).toEqual(['letters']);
  });

  it('seeds through words for a player past the legacy words threshold', () => {
    const journey = seedJourneyFromLegacyPlayer({ totals: { sessions: 12 }, letters: {} });
    expect(journey.unlockedStages).toEqual(['letters', 'words']);
    // Migrated stages must not trigger intro celebrations
    expect(journey.introsSeen).toEqual(['letters', 'words']);
  });
});

describe('getJourneyStageStates', () => {
  it('locks everything but letters for a fresh player', () => {
    const view = getJourneyStageStates({
      player: makePlayerWithPracticedLetters(0),
      languagePack: makeLanguagePack(10)
    });
    const byId = Object.fromEntries(view.stages.map((s) => [s.id, s]));
    expect(byId.letters.unlocked).toBe(true);
    expect(byId.words.unlocked).toBe(false);
    expect(byId.reading.unlocked).toBe(false);
    expect(byId.conversation.unlocked).toBe(false);
    expect(view.currentStageId).toBe('letters');
  });

  it('unlocks words once enough letters are practiced', () => {
    const letterCount = 10;
    const needed = Math.ceil(letterCount * WORDS_UNLOCK_LETTER_RATIO);
    const view = getJourneyStageStates({
      player: makePlayerWithPracticedLetters(needed),
      languagePack: makeLanguagePack(letterCount)
    });
    const words = view.stages.find((s) => s.id === 'words');
    expect(words.criteriaMet).toBe(true);
    expect(words.unlocked).toBe(true);
    expect(view.currentStageId).toBe('words');
  });

  it('reports unlock progress for a partially practiced alphabet', () => {
    const view = getJourneyStageStates({
      player: makePlayerWithPracticedLetters(3),
      languagePack: makeLanguagePack(10)
    });
    const words = view.stages.find((s) => s.id === 'words');
    expect(words.unlockProgress.current).toBe(3);
    expect(words.unlockProgress.target).toBe(6);
    expect(words.unlocked).toBe(false);
    expect(words.progressLine).toContain('3');
    expect(words.progressLine).toContain('6');
  });

  it('respects the persisted ratchet even when criteria are no longer met', () => {
    const player = {
      ...makePlayerWithPracticedLetters(0),
      journey: { unlockedStages: ['letters', 'words', 'reading'], introsSeen: ['letters'], advancedAt: {} }
    };
    const view = getJourneyStageStates({ player, languagePack: makeLanguagePack(10) });
    const byId = Object.fromEntries(view.stages.map((s) => [s.id, s]));
    expect(byId.words.unlocked).toBe(true);
    expect(byId.reading.unlocked).toBe(true);
    expect(byId.reading.criteriaMet).toBe(false);
    expect(view.currentStageId).toBe('reading');
  });

  it('covers every stage in canonical order', () => {
    const view = getJourneyStageStates({
      player: makePlayerWithPracticedLetters(0),
      languagePack: makeLanguagePack(10)
    });
    expect(view.stages.map((s) => s.id)).toEqual(JOURNEY_STAGE_ORDER);
  });
});
