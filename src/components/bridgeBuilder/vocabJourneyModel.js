/**
 * Vocabulary Journey View Model
 *
 * Helper functions that derive UI-ready data from Bridge Builder state.
 * Converts raw pack/progress/completion data into journey visualization data.
 */

import { getWordsByIds } from '../../data/bridgeBuilderWords.js';
import { getBridgeBuilderWordsSync } from '../../data/bridgeBuilder/words/index.js';


const CURATED_PACK_WORD_IDS = {
  russian: {
    greetings_01: ['bb-ru-yes', 'bb-ru-no', 'bb-ru-but', 'bb-ru-we', 'bb-ru-you'],
    pronouns_01: ['bb-ru-he', 'bb-ru-she', 'bb-ru-we'],
    family_01: ['bb-ru-family', 'bb-ru-friend', 'bb-ru-house'],
    food_01: ['bb-ru-food', 'bb-ru-water', 'bb-ru-coffee']
  }
};

function resolveCuratedPackWords(languageId, pack, wordMap) {
  const ids = CURATED_PACK_WORD_IDS[languageId]?.[pack.id] || [];
  return ids.map((id) => wordMap.get(id)).filter(Boolean);
}

/**
 * Get the current pack to display on the journey screen.
 * Priority:
 * 1. The pack matching activePackId (if provided and unlocked)
 * 2. First unlocked incomplete pack
 * 3. First unlocked pack
 * 4. First pack (even if locked)
 */
export function getCurrentJourneyPack(sectionData, activePackId) {
  const allPackData = sectionData.flatMap((section) => section.packData);

  // Priority 1: activePackId
  if (activePackId) {
    const active = allPackData.find((item) => item.pack.id === activePackId);
    if (active) return active;
  }

  // Priority 2: first unlocked incomplete
  const unlockedIncomplete = allPackData.find(
    (item) => item.unlocked && !item.progress.completed
  );
  if (unlockedIncomplete) return unlockedIncomplete;

  // Priority 3: first unlocked
  const unlocked = allPackData.find((item) => item.unlocked);
  if (unlocked) return unlocked;

  // Priority 4: first pack (even if locked)
  return allPackData[0] || null;
}

/**
 * Get journey stops (sections) for the river path visualization.
 * Returns an array of section-level journey stops with progress tracking.
 */
export function getJourneyStops(sectionData, activePackId) {
  const STOP_ICONS = {
    foundations: 'school',
    daily_life: 'home',
    people_social: 'groups',
    meaning_builders: 'auto_stories',
    cafe_talk: 'coffee',
  };
  // Helper to find the representative pack for a section
  const getRepresentativePackId = (sectionItem) => {
    const packData = sectionItem.packData || [];

    const firstUnlockedIncomplete = packData.find(
      (item) => item.unlocked && !item.progress?.completed
    );

    if (firstUnlockedIncomplete?.pack?.id) {
      return firstUnlockedIncomplete.pack.id;
    }

    const firstUnlocked = packData.find((item) => item.unlocked);
    return firstUnlocked?.pack?.id || null;
  };

  return sectionData.map((sectionItem, index) => {
    const { section, sectionProgress, unlocked, packData } = sectionItem;
    const { packsCompleted, totalPacks } = sectionProgress;

    // Check if this section contains the active pack
    const containsActivePack = packData.some(
      (packItem) => packItem.pack?.id === activePackId
    );

    // Determine status
    let status = 'Open';
    if (!unlocked) {
      status = 'Locked';
    } else if (packsCompleted >= totalPacks && totalPacks > 0) {
      status = 'Complete';
    } else if (containsActivePack) {
      status = 'Current';
    }

    // Calculate progress percentage
    const progressPct = totalPacks > 0 ? (packsCompleted / totalPacks) * 100 : 0;
    const representativePackId = getRepresentativePackId(sectionItem);

    return {
      id: section.id,
      title: section.title,
      description: section.description,
      status,
      progressPct: Math.round(progressPct),
      packsCompleted,
      totalPacks,
      representativePackId,
      icon: STOP_ICONS[section.id] || 'category',
    };
  });
}

/**
 * Get word preview for a pack — 6-8 display words.
 * Uses actual word data from the data layer if available.
 */
export function getPackWordPreview(pack, languageId = 'hebrew') {
  if (!pack || !pack.wordIds || pack.wordIds.length === 0) {
    return { words: [], usedFallback: false, missingPackMapping: false };
  }

  try {
    const languageWordPool = getBridgeBuilderWordsSync(languageId);
    const wordPool = Array.isArray(languageWordPool) ? languageWordPool : [];
    const wordMap = new Map(wordPool.map((word) => [word.id, word]));
    const directWords = pack.wordIds.map((id) => wordMap.get(id)).filter(Boolean);
    const curatedWords = resolveCuratedPackWords(languageId, pack, wordMap);
    const words = directWords.length > 0 ? directWords : curatedWords;

    if (words.length > 0) {
      return {
        words: words.slice(0, 8).map((w) => w.hebrew || w.nativeScript || w.transliteration || '?'),
        usedFallback: false,
        missingPackMapping: false
      };
    }

    if (import.meta.env.DEV) {
      console.warn('[vocabJourney] Missing pack mapping for language', {
        languageId,
        packId: pack.id,
        missingWordIds: pack.wordIds
      });
    }

    return { words: [], usedFallback: false, missingPackMapping: true };
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[vocabJourney] Failed to resolve pack preview', { languageId, packId: pack?.id, error: e });
    }
    return { words: [], usedFallback: false, missingPackMapping: true };
  }
}

/**
 * Get learning stage for a pack with progress tracking.
 * Returns stage label and step-by-step progress.
 */
export function getPackLearningStage(packProgress, packCompletion) {
  if (!packProgress || !packCompletion) {
    return {
      label: 'Not started',
      steps: [
        { id: 'first_look', label: 'First Look', complete: false, current: true },
        { id: 'meaning', label: 'Meaning', complete: false, current: false },
        { id: 'review', label: 'Review', complete: false, current: false },
        { id: 'challenge', label: 'Challenge', complete: false, current: false },
      ],
    };
  }

  const { wordsIntroducedCount, totalWords } = packProgress;
  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = packCompletion;

  // Compute step completion
  const steps = [
    {
      id: 'first_look',
      label: 'First Look',
      complete: wordsIntroducedCount > 0 || bridgeBuilderComplete,
      current: false,
    },
    {
      id: 'meaning',
      label: 'Meaning',
      complete: bridgeBuilderComplete,
      current: false,
    },
    {
      id: 'review',
      label: 'Review',
      complete: loosePlanksComplete,
      current: false,
    },
    {
      id: 'challenge',
      label: 'Challenge',
      complete: deepScriptComplete,
      current: false,
    },
  ];

  // Mark first incomplete as current
  const firstIncomplete = steps.findIndex((s) => !s.complete);
  if (firstIncomplete >= 0) {
    steps[firstIncomplete].current = true;
  }

  // Compute overall label
  let label = 'Not started';
  if (deepScriptComplete) {
    label = 'Complete';
  } else if (loosePlanksComplete) {
    label = 'Ready for challenge';
  } else if (bridgeBuilderComplete) {
    label = 'Strengthening memory';
  } else if (wordsIntroducedCount > 0) {
    label = 'Learning meanings';
  } else if (totalWords > 0) {
    label = 'New pack';
  }

  return { label, steps };
}

/**
 * Get the recommended next action for a pack.
 * Determines which game mode is best based on completion state.
 */
export function getRecommendedJourneyAction(packProgress, packCompletion) {
  if (!packProgress || !packCompletion) {
    return {
      method: 'vocab',
      mode: 'Bridge Builder',
      title: 'Bridge Builder',
      subtitle: 'Best for first seeing the word, sound, and meaning.',
      ctaLabel: 'Start: Bridge Builder',
    };
  }

  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = packCompletion;

  // Priority order: Bridge Builder → Loose Planks → Deep Script → Review
  if (!bridgeBuilderComplete) {
    return {
      method: 'vocab',
      mode: 'Bridge Builder',
      title: 'Bridge Builder',
      subtitle: 'Best for first seeing the word, sound, and meaning.',
      ctaLabel: 'Continue: Bridge Builder',
    };
  }

  if (!loosePlanksComplete) {
    return {
      method: 'loose_planks',
      mode: 'Loose Planks',
      title: 'Strengthen — Loose Planks',
      subtitle: 'Reinforce with targeted practice.',
      ctaLabel: 'Continue: Loose Planks',
    };
  }

  if (!deepScriptComplete) {
    return {
      method: 'deep_script',
      mode: 'Deep Script',
      title: 'Challenge — Deep Script',
      subtitle: 'Test depth with writing and recall.',
      ctaLabel: 'Continue: Deep Script',
    };
  }

  // All complete — offer review
  return {
    method: 'review',
    mode: 'Review',
    title: 'Review',
    subtitle: 'Keep these words fresh.',
    ctaLabel: 'Review this pack',
  };
}

/**
 * Get overall journey statistics.
 * Used for the hero section progress display.
 */
export function getJourneyStats(sectionData) {
  const allPackData = sectionData.flatMap((s) => s.packData);

  const totalPacks = allPackData.length;
  const completedPacks = allPackData.filter((pd) => pd.progress.completed).length;
  const unlockedPacks = allPackData.filter((pd) => pd.unlocked).length;

  const overallProgressPct =
    totalPacks > 0 ? Math.round((completedPacks / totalPacks) * 100) : 0;

  // Find current section (first unlocked incomplete)
  const currentSection = sectionData.find(
    (sd) =>
      sd.unlocked &&
      sd.packData.some((pd) => pd.unlocked && !pd.progress.completed)
  );
  const currentSectionTitle = currentSection?.section.title || 'Your Journey';

  return {
    totalPacks,
    completedPacks,
    unlockedPacks,
    overallProgressPct,
    currentSectionTitle,
  };
}

/**
 * Get completion level for a pack (full, partial, or none).
 * Used for determining visual state.
 */
export function getCompletionLevel(completion) {
  if (!completion) return 'none';
  const { loosePlanksComplete, deepScriptComplete } = completion;
  if (loosePlanksComplete && deepScriptComplete) return 'full';
  if (loosePlanksComplete || deepScriptComplete) return 'partial';
  return 'none';
}
