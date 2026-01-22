import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  isSentenceIntroduced,
  hasShownInSession,
  markShownInSession
} from '../lib/introducedSentenceStorage';
import { getConversationWordMeanings } from '../lib/conversationWordLookup';
import { isWordSeen } from '../lib/seenWordsStorage';

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
  enabled = true
} = {}) {
  console.log('[useConversationIntro] HOOK CALLED with:', {
    lineId: line?.id,
    sentenceId: line?.sentenceData?.id,
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
    console.log('[useConversationIntro] Extracted word pairs:', pairs);

    // Filter out words that have already been seen
    const unseenPairs = pairs.filter(pair => !isWordSeen(pair.wordId));
    console.log('[useConversationIntro] Filtered to unseen pairs:', unseenPairs);

    // Cap at 8 pairs for manageability
    return unseenPairs.slice(0, 8);
  }, [line]);

  // Determine if popup should be shown
  const shouldShow = useMemo(() => {
    const sentenceId = line?.sentenceData?.id;

    console.log('[useConversationIntro] Checking shouldShow:', {
      enabled,
      sentenceId,
      wordPairsLength: wordPairs.length,
      isIntroduced: sentenceId ? isSentenceIntroduced(sentenceId) : 'no-id',
      hasShownInSession: sentenceId ? hasShownInSession(sentenceId) : 'no-id'
    });

    if (!enabled || !sentenceId) return false;
    if (wordPairs.length === 0) return false;
    if (isSentenceIntroduced(sentenceId)) return false;
    if (hasShownInSession(sentenceId)) return false;
    return true;
  }, [enabled, line?.sentenceData?.id, wordPairs.length]);

  // Reset hasChecked when line/sentence changes
  useEffect(() => {
    setHasChecked(false);
  }, [line?.sentenceData?.id]);

  // Auto-show popup on mount if needed
  useEffect(() => {
    const sentenceId = line?.sentenceData?.id;
    console.log('[useConversationIntro] Auto-show effect:', { hasChecked, shouldShow, sentenceId });

    if (!hasChecked && shouldShow) {
      console.log('[useConversationIntro] ✅ SHOWING POPUP for sentence:', sentenceId);
      setHasChecked(true);
      setShowPopup(true);
      if (sentenceId) {
        markShownInSession(sentenceId);
      }
    }
  }, [hasChecked, shouldShow, line?.sentenceData?.id]);

  const handleShowPopup = useCallback(() => {
    setShowPopup(true);
    const sentenceId = line?.sentenceData?.id;
    if (sentenceId) {
      markShownInSession(sentenceId);
    }
  }, [line?.sentenceData?.id]);

  const handleHidePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  const handleComplete = useCallback((stats) => {
    // Storage is handled by SentenceIntroPopup
    // This callback is for any additional logic needed by the parent
  }, []);

  const result = {
    shouldShow,
    showPopup: showPopup && wordPairs.length > 0,
    openPopup: handleShowPopup,
    closePopup: handleHidePopup,
    popupProps: {
      sentenceId: line?.sentenceData?.id,
      sentenceText: line?.he || line?.sentenceData?.hebrew,
      wordPairs,
      onClose: handleHidePopup,
      onComplete: handleComplete
    }
  };

  console.log('[useConversationIntro] Returning:', {
    shouldShow: result.shouldShow,
    showPopup: result.showPopup,
    wordPairsCount: wordPairs.length
  });

  return result;
}
