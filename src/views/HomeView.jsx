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
import {
  getCurrentHomeStage,
  getHomeStateForStage,
  getHomeStats,
  getTodayPlanRows
} from '../components/home/homeState.js';
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
  const { t, languagePack } = useLocalization();
  const navigate = useNavigate();
  const [isProfileEditorOpen, setIsProfileEditorOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.classList.add('scenic-home-route');
    return () => document.body.classList.remove('scenic-home-route');
  }, []);

  const currentStage = useMemo(
    () => getCurrentHomeStage({ player, statistics }),
    [player, statistics]
  );

  const [selectedStage, setSelectedStage] = React.useState(currentStage);

  React.useEffect(() => {
    setSelectedStage(currentStage);
  }, [currentStage, languageId]);

  const displayLanguageOptions = useMemo(
    () => languageOptions.map((option) => ({ ...option, name: getFormattedLanguageName(option, t) })),
    [languageOptions, t]
  );

  const displayAppLanguageOptions = useMemo(
    () => appLanguageOptions.map((option) => ({ ...option, name: getFormattedLanguageName(option, t) })),
    [appLanguageOptions, t]
  );

  const practiceLanguageName = useMemo(() => {
    const selectedOption = displayLanguageOptions.find((option) => option.id === languageId);
    return selectedOption?.name ?? languagePack?.name ?? languageId;
  }, [displayLanguageOptions, languageId, languagePack]);

  const primaryState = useMemo(
    () => getHomeStateForStage({
      selectedStage,
      player,
      statistics,
      daily,
      streak,
      languagePack,
      practiceLanguageName,
      t,
      openGame,
      navigate
    }),
    [selectedStage, player, statistics, daily, streak, languagePack, practiceLanguageName, t, openGame, navigate]
  );

  const planRows = useMemo(
    () => getTodayPlanRows({ primaryState, statistics, navigate, openGame, t }),
    [primaryState, statistics, navigate, openGame, t]
  );

  const stats = useMemo(
    () => getHomeStats({ statistics, streak, daily, t }),
    [statistics, streak, daily, t]
  );

  return (
    <div className="scenic-home">
      <main className="scenic-home__frame stagger-children" aria-label={t('home.scenic.brand', 'Letter River')}>
        <ScenicHomeHero
          streakDays={streak?.current || 12}
          appLanguageId={appLanguageId}
          practiceLanguageId={languageId}
          appLanguageOptions={displayAppLanguageOptions}
          practiceLanguageOptions={displayLanguageOptions}
          onAppLanguageChange={selectAppLanguage}
          onPracticeLanguageChange={selectLanguage}
          onProfileClick={() => setIsProfileEditorOpen(true)}
          t={t}
        />

        <div className="scenic-home__content">
          <ContinueJourneyCard state={primaryState} t={t} />
          <TodayPlanCard rows={planRows} t={t} />
          <HomeLearningPath
            currentStage={currentStage}
            selectedStage={selectedStage}
            onSelectStage={setSelectedStage}
            t={t}
          />
          <HomeStatsRow stats={stats} t={t} />
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
