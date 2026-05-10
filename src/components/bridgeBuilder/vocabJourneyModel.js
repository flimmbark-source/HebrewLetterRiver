/**
 * Vocabulary Journey View Model
 *
 * Helper functions that derive UI-ready data from Bridge Builder state.
 * Converts raw pack/progress/completion data into journey visualization data.
 */

import { getBridgeBuilderWordsSync } from '../../data/bridgeBuilder/words/index.js';
import { getPackWordIds } from '../../data/journeyPackRegistry.js';

const LAST_JOURNEY_PACK_KEY = 'bbs_last_journey_pack_id';

function readRememberedPackId() {
  try {
    return typeof window !== 'undefined'
      ? window.localStorage.getItem(LAST_JOURNEY_PACK_KEY)
      : null;
  } catch (error) {
    return null;
  }
}

function writeRememberedPackId(packId) {
  if (!packId) return;
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LAST_JOURNEY_PACK_KEY, packId);
    }
  } catch (error) {
    // Ignore storage failures.
  }
}

function getDefaultJourneyPack(allPackData) {
  const unlockedIncomplete = allPackData.find(
    (item) => item.unlocked && !item.progress.completed
  );
  if (unlockedIncomplete) return unlockedIncomplete;

  const unlocked = allPackData.find((item) => item.unlocked);
  if (unlocked) return unlocked;

  return allPackData[0] || null;
}

function findUnlockedPack(allPackData, packId) {
  if (!packId) return null;
  const item = allPackData.find((packItem) => packItem.pack?.id === packId);
  if (!item || !item.unlocked) return null;
  return item;
}

/**
 * Get the current pack to display on the journey screen.
 * Priority:
 * 1. A non-default activePackId, which means the player selected a pack in this session
 * 2. A remembered selected pack from localStorage
 * 3. The active/default pack passed in by setup
 * 4. First unlocked incomplete pack
 * 5. First unlocked pack
 * 6. First pack (even if locked)
 */
export function getCurrentJourneyPack(sectionData, activePackId) {
  const allPackData = sectionData.flatMap((section) => section.packData);
  const defaultPack = getDefaultJourneyPack(allPackData);
  const rememberedPack = findUnlockedPack(allPackData, readRememberedPackId());

  if (activePackId) {
    const active = allPackData.find((item) => item.pack.id === activePackId);
    if (active) {
      const activeIsDefault = active.pack?.id === defaultPack?.pack?.id;
      if (!activeIsDefault) {
        writeRememberedPackId(active.pack.id);
        return active;
      }
      if (rememberedPack) return rememberedPack;
      if (active.unlocked) writeRememberedPackId(active.pack.id);
      return active;
    }
  }

  if (rememberedPack) return rememberedPack;
  if (defaultPack?.unlocked) writeRememberedPackId(defaultPack.pack.id);
  return defaultPack;
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

  const resolvedActivePackId = getCurrentJourneyPack(sectionData, activePackId)?.pack?.id || activePackId;

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

  return sectionData.map((sectionItem) => {
    const { section, sectionProgress, unlocked, packData } = sectionItem;
    const { packsCompleted, totalPacks } = sectionProgress;

    const containsActivePack = packData.some(
      (packItem) => packItem.pack?.id === resolvedActivePackId
    );

    let status = 'Open';
    if (!unlocked) {
      status = 'Locked';
    } else if (packsCompleted >= totalPacks && totalPacks > 0) {
      status = 'Complete';
    } else if (containsActivePack) {
      status = 'Current';
    }

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

function getWordNativeText(word) {
  return word?.hebrew || word?.nativeScript || word?.script || word?.word || word?.target || word?.transliteration || '?';
}

function getWordTranslation(word) {
  return word?.translation || word?.english || word?.meaning || word?.definition || '';
}

/**
 * Get word preview for a pack — 6-8 display words with tap details.
 * Uses actual word data from the data layer if available.
 */
export function getPackWordPreview(pack, languageId = 'hebrew') {
  if (!pack || !pack.wordIds || pack.wordIds.length === 0) {
    return { words: [], items: [], usedFallback: false, missingPackMapping: false };
  }

  try {
    const languageWordPool = getBridgeBuilderWordsSync(languageId);
    const wordPool = Array.isArray(languageWordPool) ? languageWordPool : [];
    const wordMap = new Map(wordPool.map((word) => [word.id, word]));
    const resolvedWordIds = getPackWordIds(languageId, pack.id);
    const words = resolvedWordIds.map((id) => wordMap.get(id)).filter(Boolean);

    if (words.length > 0) {
      const items = words.slice(0, 8).map((word) => ({
        id: word.id,
        native: getWordNativeText(word),
        transliteration: word.transliteration || '',
        translation: getWordTranslation(word),
      }));

      return {
        words: items.map((item) => item.native),
        items,
        usedFallback: false,
        missingPackMapping: false
      };
    }

    if (import.meta.env.DEV) {
      console.warn('[vocabJourney] Missing pack mapping for language', {
        languageId,
        packId: pack.id,
        missingWordIds: getPackWordIds(languageId, pack.id)
      });
    }

    return { words: [], items: [], usedFallback: false, missingPackMapping: true };
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn('[vocabJourney] Failed to resolve pack preview', { languageId, packId: pack?.id, error: e });
    }
    return { words: [], items: [], usedFallback: false, missingPackMapping: true };
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

  const firstIncomplete = steps.findIndex((s) => !s.complete);
  if (firstIncomplete >= 0) {
    steps[firstIncomplete].current = true;
  }

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
