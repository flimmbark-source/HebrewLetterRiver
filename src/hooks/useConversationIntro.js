import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  hasShownModuleWordInSession,
  isModuleWordIntroduced,
  markModuleWordsShownInSession
} from '../lib/introducedModuleWordStorage';
import { getConversationWordMeanings } from '../lib/conversationWordLookup';

/**
 * Hook for managing sentence introduction pop-ups in conversation practice.
 *
 * This is a specialized version of useSentenceIntro that uses the conversation-specific
 * word meanings from sentenceMeaningsLookup.
 *
 * @param {Object} options
 * @param {Object} options.line - ConversationLine with sentenceData
 * @param {boolean} options.enabled - Whether to enable the intro popup (default: true)
 *
 * @returns {Object} { shouldShow, showPopup, openPopup, closePopup, popupProps }
 */
export function useConversationIntro({
  line,
  moduleId,
  enabled = true
} = {}) {
  console.log('[useConversationIntro] HOOK CALLED with:', {
    lineId: line?.id,
    sentenceId: line?.sentenceData?.id,
    moduleId,
    enabled,
    hasLine: !!line,
    hasSentenceData: !!line?.sentenceData,
    hasWords: !!line?.sentenceData?.words
  });

  const [showPopup, setShowPopup] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  // Extract word pairs from conversation line
  const wordPairs = useMemo(() => {
    if (!line?.sentenceData) {
      console.log('[useConversationIntro] No line or sentence data:', line);
      return [];
    }

    const pairs = getConversationWordMeanings(line);

    // Cap at 8 pairs for manageability
    return pairs.slice(0, 8);
  }, [line]);

  // Determine if popup should be shown
  const unseenWordPairs = useMemo(() => {
    if (!moduleId) return [];
    return wordPairs.filter((pair) => {
      const wordId = pair.wordId || pair.hebrew;
      return (
        !isModuleWordIntroduced(moduleId, wordId) &&
        !hasShownModuleWordInSession(moduleId, wordId)
      );
    });
  }, [moduleId, wordPairs]);

  const shouldShow = useMemo(() => {
    console.log('[useConversationIntro] Checking shouldShow:', {
      enabled,
      moduleId,
      wordPairsLength: wordPairs.length,
      unseenWordPairsLength: unseenWordPairs.length
    });

    if (!enabled || !moduleId) return false;
    if (wordPairs.length === 0) return false;
    if (unseenWordPairs.length === 0) return false;
    return true;
  }, [enabled, moduleId, wordPairs.length, unseenWordPairs.length]);

  // Reset hasChecked when line/sentence changes
  useEffect(() => {
    setHasChecked(false);
  }, [line?.sentenceData?.id, moduleId]);

  // Auto-show popup on mount if needed
  useEffect(() => {
    const sentenceId = line?.sentenceData?.id;
    console.log('[useConversationIntro] Auto-show effect:', { hasChecked, shouldShow, sentenceId });

    if (!hasChecked && shouldShow) {
      console.log('[useConversationIntro] ✅ SHOWING POPUP for sentence:', sentenceId);
      setHasChecked(true);
      setShowPopup(true);
      if (moduleId && unseenWordPairs.length > 0) {
        markModuleWordsShownInSession(
          moduleId,
          unseenWordPairs.map((pair) => pair.wordId || pair.hebrew)
        );
      }
    }
  }, [hasChecked, shouldShow, line?.sentenceData?.id, moduleId, unseenWordPairs]);

  const handleShowPopup = useCallback(() => {
    setShowPopup(true);
    if (moduleId && unseenWordPairs.length > 0) {
      markModuleWordsShownInSession(
        moduleId,
        unseenWordPairs.map((pair) => pair.wordId || pair.hebrew)
      );
    }
  }, [moduleId, unseenWordPairs]);

  const handleHidePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  const handleComplete = useCallback((stats) => {
    // Storage is handled by SentenceIntroPopup
    // This callback is for any additional logic needed by the parent
  }, []);

  const result = {
    shouldShow,
    showPopup: showPopup && unseenWordPairs.length > 0,
    openPopup: handleShowPopup,
    closePopup: handleHidePopup,
    popupProps: {
      sentenceId: line?.sentenceData?.id,
      sentenceText: line?.he || line?.sentenceData?.hebrew,
      wordPairs: unseenWordPairs,
      moduleId,
      trackingMode: 'moduleWords',
      onClose: handleHidePopup,
      onComplete: handleComplete
    }
  };

  console.log('[useConversationIntro] Returning:', {
    shouldShow: result.shouldShow,
    showPopup: result.showPopup,
    wordPairsCount: unseenWordPairs.length
  });

  return result;
}
