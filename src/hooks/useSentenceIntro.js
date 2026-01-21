import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  isSentenceIntroduced,
  hasShownInSession,
  markShownInSession
} from '../lib/introducedSentenceStorage';
import { findDictionaryEntryForWord } from '../lib/sentenceDictionaryLookup';

/**
 * Hook for managing sentence introduction pop-ups.
 *
 * This hook:
 * - Determines if a sentence needs introduction
 * - Extracts word pairs from the sentence using the contextual dictionary
 * - Provides pop-up state and handlers
 * - Enforces session-level guards
 *
 * @param {Object} options
 * @param {Object} options.sentence - Sentence object with id, words, hebrew, etc.
 * @param {string} options.practiceLanguageId - Practice language (e.g., 'hebrew')
 * @param {string} options.appLanguageId - App language (e.g., 'en')
 * @param {Function} options.t - Translation function
 * @param {boolean} options.enabled - Whether to enable the intro popup (default: true)
 *
 * @returns {Object} { shouldShow, showPopup, hidePopup, popupProps }
 */
export function useSentenceIntro({
  sentence,
  practiceLanguageId = 'hebrew',
  appLanguageId = 'en',
  t = (key) => key,
  enabled = true
} = {}) {
  const [showPopup, setShowPopup] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Extract word pairs from sentence
  const wordPairs = useMemo(() => {
    if (!sentence?.words) return [];

    const pairs = [];
    const seenMeanings = new Map();

    sentence.words.forEach((word) => {
      // Skip words without dictionary entries
      if (!word.wordId) return;

      const entry = findDictionaryEntryForWord(
        word.wordId,
        practiceLanguageId,
        appLanguageId,
        t
      );

      if (!entry?.meaning) return;

      const hebrew = word.surface || word.hebrew;
      let meaning = entry.meaning;

      // Handle duplicate meanings by adding disambiguators
      if (seenMeanings.has(meaning)) {
        const count = seenMeanings.get(meaning) + 1;
        seenMeanings.set(meaning, count);
        meaning = `${meaning} (${count})`;
      } else {
        seenMeanings.set(meaning, 1);
      }

      pairs.push({
        hebrew,
        meaning,
        wordId: word.wordId
      });
    });

    // Cap at 8 pairs for manageability
    return pairs.slice(0, 8);
  }, [sentence, practiceLanguageId, appLanguageId, t]);

  // Determine if popup should be shown
  const shouldShow = useMemo(() => {
    if (!enabled || !sentence?.id) return false;
    if (wordPairs.length === 0) return false;
    if (isSentenceIntroduced(sentence.id)) return false;
    if (hasShownInSession(sentence.id)) return false;
    return true;
  }, [enabled, sentence?.id, wordPairs.length]);

  // Auto-show popup on mount if needed
  useEffect(() => {
    if (!hasChecked && shouldShow) {
      setHasChecked(true);
      setShowPopup(true);
      if (sentence?.id) {
        markShownInSession(sentence.id);
      }
    }
  }, [hasChecked, shouldShow, sentence?.id]);

  const handleShowPopup = useCallback(() => {
    setShowPopup(true);
    if (sentence?.id) {
      markShownInSession(sentence.id);
    }
  }, [sentence?.id]);

  const handleHidePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  const handleComplete = useCallback((stats) => {
    // Storage is handled by SentenceIntroPopup
    // This callback is for any additional logic needed by the parent
  }, []);

  return {
    shouldShow,
    showPopup: showPopup && wordPairs.length > 0,
    openPopup: handleShowPopup,
    closePopup: handleHidePopup,
    popupProps: {
      sentenceId: sentence?.id,
      sentenceText: sentence?.hebrew,
      wordPairs,
      onClose: handleHidePopup,
      onComplete: handleComplete
    }
  };
}

/**
 * Helper function to manually check if a sentence needs introduction
 * (without using the hook)
 */
export function checkSentenceNeedsIntro(sentenceId) {
  if (!sentenceId) return false;
  if (isSentenceIntroduced(sentenceId)) return false;
  if (hasShownInSession(sentenceId)) return false;
  return true;
}
