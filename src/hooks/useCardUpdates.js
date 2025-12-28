import { useEffect, useState, useCallback } from 'react';

/**
 * Hook to track card content updates
 * Shows green stroke on cards with changed content since last view
 * Removes stroke when navigating away from page
 */
export function useCardUpdates(cardId, currentValue) {
  const [isUpdated, setIsUpdated] = useState(false);
  const storageKey = `card_last_seen_${cardId}`;

  useEffect(() => {
    // Get last seen value from localStorage
    const lastSeen = localStorage.getItem(storageKey);
    const lastSeenValue = lastSeen ? JSON.parse(lastSeen) : null;

    // Compare current value with last seen
    if (lastSeenValue !== null && JSON.stringify(currentValue) !== JSON.stringify(lastSeenValue)) {
      setIsUpdated(true);
    } else {
      setIsUpdated(false);
    }

    // Mark as seen when component unmounts (user navigates away)
    return () => {
      localStorage.setItem(storageKey, JSON.stringify(currentValue));
      setIsUpdated(false);
    };
  }, [cardId, currentValue, storageKey]);

  const markAsSeen = useCallback(() => {
    localStorage.setItem(storageKey, JSON.stringify(currentValue));
    setIsUpdated(false);
  }, [storageKey, currentValue]);

  return { isUpdated, markAsSeen };
}
