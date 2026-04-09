import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { on } from '../lib/eventBus.js';
import { saveState } from '../lib/storage.js';

/**
 * GuidedFirstSession auto-launches Letter River with beginner-friendly settings.
 * It listens for the game session complete event and calls onComplete when done.
 * If the user navigates away, the parent flow marks onboarding as complete.
 */
export default function GuidedFirstSession({ onComplete }) {
  const { openGame, isVisible } = useGame();
  const hasLaunchedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (hasLaunchedRef.current) return;
    hasLaunchedRef.current = true;

    // Save beginner-friendly game settings temporarily
    try {
      const saved = localStorage.getItem('gameSettings');
      const settings = saved ? JSON.parse(saved) : {};
      const guidedSettings = {
        ...settings,
        showIntroductions: true,
        slowRiver: true,
        startingLetters: 2,
        guidedSession: true
      };
      localStorage.setItem('gameSettings', JSON.stringify(guidedSettings));
      window.dispatchEvent(new Event('gameSettingsChanged'));
    } catch (err) {
      console.warn('Failed to set guided session settings', err);
    }

    // Open Letter River with autostart
    openGame({ autostart: true });
  }, [openGame]);

  // Listen for session complete
  useEffect(() => {
    const off = on('game:session-complete', (payload) => {
      // Restore normal settings
      try {
        const saved = localStorage.getItem('gameSettings');
        const settings = saved ? JSON.parse(saved) : {};
        delete settings.guidedSession;
        delete settings.startingLetters;
        localStorage.setItem('gameSettings', JSON.stringify(settings));
        window.dispatchEvent(new Event('gameSettingsChanged'));
      } catch (err) {
        console.warn('Failed to restore settings', err);
      }

      saveState('onboarding.guidedSessionData', {
        lettersLearned: payload?.uniqueLetters ?? 0,
        starsEarned: payload?.stars ?? 0,
        completedAt: new Date().toISOString()
      });

      onCompleteRef.current(payload);
    });

    return off;
  }, []);

  // If the game becomes not visible after having been launched, it means the user
  // closed the game manually — treat as completion
  useEffect(() => {
    if (hasLaunchedRef.current && !isVisible) {
      // Small delay to avoid racing with session-complete event
      const timer = setTimeout(() => {
        if (hasLaunchedRef.current) {
          hasLaunchedRef.current = false; // prevent double-fire
          // Restore normal settings
          try {
            const saved = localStorage.getItem('gameSettings');
            const settings = saved ? JSON.parse(saved) : {};
            delete settings.guidedSession;
            delete settings.startingLetters;
            localStorage.setItem('gameSettings', JSON.stringify(settings));
            window.dispatchEvent(new Event('gameSettingsChanged'));
          } catch (err) {
            console.warn('Failed to restore settings', err);
          }
          onCompleteRef.current(null);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // This component is invisible — the game UI is handled by GameContext
  return null;
}
