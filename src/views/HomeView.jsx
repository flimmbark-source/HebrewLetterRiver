import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useSRS } from '../context/SRSContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useJourney } from '../hooks/useJourney.js';
import { TEST_OUT_PASS_RATIO } from '../lib/learningJourney.js';
import { applyQuizMastery } from '../lib/quizMastery.js';
import { getFormattedLanguageName } from '../lib/languageUtils.js';
import { bridgeBuilderWords } from '../data/bridgeBuilderWords.js';
import { allSentences } from '../data/sentences/index.ts';
import ProfileEditorModal from '../components/ProfileEditorModal.jsx';
import StreakMilestoneModal from '../components/StreakMilestoneModal.jsx';
import StageIntroModal from '../components/StageIntroModal.jsx';
import SkillCheckScreen from '../components/SkillCheckScreen.jsx';
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

/** Skill-check make-up per locked stage: test the skills the stage builds on. */
const TEST_OUT_QUESTION_TYPES = {
  words: ['letter'],
  reading: ['letter', 'vocab'],
  conversation: ['vocab', 'sentence']
};

export default function HomeView() {
  const { player, streak, daily, updatePlayerProfile } = useProgress();
  const { statistics } = useSRS();
  const { openGame } = useGame();
  const { addToast } = useToast();
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
  const journey = useJourney();
  const [isProfileEditorOpen, setIsProfileEditorOpen] = React.useState(false);
  const [infoStageId, setInfoStageId] = React.useState(null);
  const [testOutStageId, setTestOutStageId] = React.useState(null);

  React.useEffect(() => {
    document.body.classList.add('scenic-home-route');
    return () => document.body.classList.remove('scenic-home-route');
  }, []);

  const currentStage = useMemo(
    () => getCurrentHomeStage({ player, statistics, journey }),
    [player, statistics, journey]
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

  const sharedHomeStateArgs = {
    journey,
    player,
    statistics,
    daily,
    streak,
    languagePack,
    practiceLanguageName,
    t,
    openGame,
    navigate,
    onTestOut: setTestOutStageId,
    onShowStageInfo: setInfoStageId
  };

  const primaryState = useMemo(
    () => getHomeStateForStage({
      ...sharedHomeStateArgs,
      selectedStage
    }),
    [selectedStage, journey, player, statistics, daily, streak, languagePack, practiceLanguageName, t, openGame, navigate]
  );

  const actualTodayState = useMemo(
    () => getHomeStateForStage({
      ...sharedHomeStateArgs,
      selectedStage: currentStage
    }),
    [currentStage, journey, player, statistics, daily, streak, languagePack, practiceLanguageName, t, openGame, navigate]
  );

  const planRows = useMemo(
    () => getTodayPlanRows({ primaryState: actualTodayState, statistics, navigate, openGame, t }),
    [actualTodayState, statistics, navigate, openGame, t]
  );

  const stats = useMemo(
    () => getHomeStats({ statistics, streak, daily, t }),
    [statistics, streak, daily, t]
  );

  // ─── Stage intro / graduation modal ───
  const infoStage = useMemo(
    () => journey.stages.find((stage) => stage.id === infoStageId) ?? null,
    [journey.stages, infoStageId]
  );
  const unlockStage = journey.pendingIntroStage;
  const showUnlockModal = Boolean(unlockStage) && !infoStageId && !testOutStageId;

  const startStage = React.useCallback(
    (stageId) => {
      if (stageId === 'letters') {
        openGame({ autostart: false });
      } else if (stageId === 'words') {
        navigate('/bridge');
      } else {
        navigate('/read');
      }
    },
    [openGame, navigate]
  );

  // ─── Test-out skill check for locked stages ───
  const testOutVocabWords = useMemo(
    () => bridgeBuilderWords.filter((word) => word.difficulty <= 2),
    []
  );
  const testOutSentences = useMemo(
    () => allSentences.filter((sentence) => sentence.difficulty === 1),
    []
  );

  const handleTestOutComplete = React.useCallback(
    ({ score, total, breakdown, evidence }) => {
      const stageId = testOutStageId;
      setTestOutStageId(null);
      if (!stageId || !total) return;
      if (score / total >= TEST_OUT_PASS_RATIO) {
        // Credit the demonstrated knowledge, then open the stage.
        applyQuizMastery(evidence, breakdown);
        journey.unlockJourneyStages([stageId]);
        journey.refresh();
        addToast({
          title: t('journey.testOut.passedTitle', 'You passed!'),
          description: t('journey.testOut.passedBody', 'The next stage is now unlocked.'),
          icon: '🎉',
          tone: 'success'
        });
      } else {
        addToast({
          title: t('journey.testOut.failedTitle', 'Not quite yet'),
          description: t('journey.testOut.failedBody', 'Keep practicing — you will get there soon.'),
          icon: '💪'
        });
      }
    },
    [testOutStageId, journey, addToast, t]
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
            journey={journey}
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

      <StageIntroModal
        stage={infoStage}
        mode="info"
        isOpen={Boolean(infoStage)}
        onClose={() => setInfoStageId(null)}
        onStart={infoStage?.unlocked ? () => startStage(infoStage.id) : undefined}
        t={t}
      />
      <StageIntroModal
        stage={unlockStage}
        mode="unlock"
        isOpen={showUnlockModal}
        onClose={() => unlockStage && journey.markJourneyIntroSeen(unlockStage.id)}
        onStart={() => {
          if (!unlockStage) return;
          journey.markJourneyIntroSeen(unlockStage.id);
          startStage(unlockStage.id);
        }}
        t={t}
      />

      {testOutStageId && (
        <SkillCheckScreen
          questionTypes={TEST_OUT_QUESTION_TYPES[testOutStageId] ?? ['letter']}
          vocabWords={testOutVocabWords}
          sentences={testOutSentences}
          onComplete={handleTestOutComplete}
          onSkip={() => setTestOutStageId(null)}
        />
      )}
    </div>
  );
}
