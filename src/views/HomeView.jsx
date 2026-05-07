import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useSRS } from '../context/SRSContext.jsx';
import { getFormattedLanguageName } from '../lib/languageUtils.js';
import ProfileEditorModal from '../components/ProfileEditorModal.jsx';
import StreakMilestoneModal from '../components/StreakMilestoneModal.jsx';
import ScenicHomeHero from '../components/home/ScenicHomeHero.jsx';
import ContinueJourneyCard from '../components/home/ContinueJourneyCard.jsx';
import TodayPlanCard from '../components/home/TodayPlanCard.jsx';
import HomeLearningPath from '../components/home/HomeLearningPath.jsx';
import HomeStatsRow from '../components/home/HomeStatsRow.jsx';
import { getHomePrimaryState, getHomeStats, getTodayPlanRows } from '../components/home/homeState.js';
import './HomeViewScenic.css';
import './HomeViewScenicTight.css';

export default function HomeView() {
  const { player, streak, daily, updatePlayerProfile } = useProgress();
  const { statistics } = useSRS();
  const { openGame } = useGame();
  const {
    languageId,
    appLanguageId,
    languageOptions,
    appLanguageOptions,
    selectLanguage,
    selectAppLanguage
  } = useLanguage();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [isProfileEditorOpen, setIsProfileEditorOpen] = React.useState(false);

  const displayLanguageOptions = useMemo(
    () => languageOptions.map((option) => ({ ...option, name: getFormattedLanguageName(option, t) })),
    [languageOptions, t]
  );

  const displayAppLanguageOptions = useMemo(
    () => appLanguageOptions.map((option) => ({ ...option, name: getFormattedLanguageName(option, t) })),
    [appLanguageOptions, t]
  );

  const primaryState = useMemo(
    () => getHomePrimaryState({ player, statistics, daily, streak, openGame, navigate }),
    [player, statistics, daily, streak, openGame, navigate]
  );

  const planRows = useMemo(
    () => getTodayPlanRows({ primaryState, statistics, navigate, openGame }),
    [primaryState, statistics, navigate, openGame]
  );

  const stats = useMemo(
    () => getHomeStats({ statistics, streak, daily }),
    [statistics, streak, daily]
  );

  return (
    <div className="scenic-home">
      <main className="scenic-home__frame stagger-children" aria-label="Letter River home">
        <ScenicHomeHero
          streakDays={streak?.current || 12}
          appLanguageId={appLanguageId}
          practiceLanguageId={languageId}
          appLanguageOptions={displayAppLanguageOptions}
          practiceLanguageOptions={displayLanguageOptions}
          onAppLanguageChange={selectAppLanguage}
          onPracticeLanguageChange={selectLanguage}
          onProfileClick={() => setIsProfileEditorOpen(true)}
        />

        <div className="scenic-home__content">
          <ContinueJourneyCard state={primaryState} />
          <TodayPlanCard rows={planRows} />
          <HomeLearningPath currentStage={primaryState.currentStage} />
          <HomeStatsRow stats={stats} />
        </div>
      </main>

      <ProfileEditorModal
        isOpen={isProfileEditorOpen}
        initialName={player?.name}
        initialAvatar={player?.avatar}
        onClose={() => setIsProfileEditorOpen(false)}
        onSave={(profile) => {
          updatePlayerProfile(profile);
          setIsProfileEditorOpen(false);
        }}
      />
      <StreakMilestoneModal />
    </div>
  );
}
