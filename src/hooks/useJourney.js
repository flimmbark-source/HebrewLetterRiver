import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { getJourneyStageStates } from '../lib/learningJourney.js';

/**
 * useJourney — the React-facing view of the learning journey.
 *
 * Combines the deterministic unlock evaluation (lib/learningJourney.js) with
 * the persisted ratchet in player.journey:
 *  - stages whose criteria are newly met get persisted as unlocked
 *  - a stage that is unlocked but whose intro was never shown surfaces as
 *    `pendingIntroStage` so the home screen can show the celebration modal.
 */
export function useJourney() {
  const { player, unlockJourneyStages, markJourneyIntroSeen } = useProgress();
  const { t, languagePack } = useLocalization();
  // Pack completions live in localStorage outside React state; bump this to
  // re-evaluate after a skill-check test-out or on demand.
  const [refreshToken, setRefreshToken] = useState(0);

  const journeyView = useMemo(
    () => getJourneyStageStates({ player, languagePack, t }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [player, languagePack, t, refreshToken]
  );

  // Ratchet: persist any stage whose live criteria are met but which isn't
  // stored as unlocked yet, so progress never re-locks a stage.
  useEffect(() => {
    const newlyMet = journeyView.stages
      .filter((stage) => stage.criteriaMet && !stage.persistedUnlocked)
      .map((stage) => stage.id);
    if (newlyMet.length > 0) {
      unlockJourneyStages(newlyMet);
    }
  }, [journeyView, unlockJourneyStages]);

  const pendingIntroStage = useMemo(
    () => journeyView.stages.find((stage) => stage.unlocked && !stage.introSeen) ?? null,
    [journeyView]
  );

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  return useMemo(
    () => ({
      stages: journeyView.stages,
      currentStageId: journeyView.currentStageId,
      pendingIntroStage,
      markJourneyIntroSeen,
      unlockJourneyStages,
      refresh
    }),
    [journeyView, pendingIntroStage, markJourneyIntroSeen, unlockJourneyStages, refresh]
  );
}
