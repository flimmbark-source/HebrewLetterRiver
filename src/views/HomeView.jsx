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

export default function HomeView() {
  const { player, streak, daily, updatePlayerProfile } = useProgress();
  const { statistics } = useSRS();
  const { openGame } = useGame();
  const { languageId, languageOptions } = useLanguage();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [isProfileEditorOpen, setIsProfileEditorOpen] = React.useState(false);

  const learningLabel = useMemo(() => {
    const option = languageOptions.find((entry) => entry.id === languageId);
    const name = option ? getFormattedLanguageName(option, t) : languageId;
    return `${t('home.scenic.learning', 'Learning')} ${name}`;
  }, [languageId, languageOptions, t]);

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
          learningLabel={learningLabel}
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
