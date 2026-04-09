import React, { useEffect, useRef } from 'react';

/**
 * GuidedFirstSession no longer auto-launches the game.
 * It simply marks onboarding as complete and the user can click Play manually.
 */
export default function GuidedFirstSession({ onComplete }) {
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    // Mark onboarding as complete without launching the game
    // User can now click Play button manually when ready
    if (onComplete) {
      onComplete(null);
    }
  }, [onComplete]);

  return null;
}
