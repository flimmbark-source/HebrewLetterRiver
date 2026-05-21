import React, { useEffect, useMemo, useState } from 'react';
import LetterRiverBrand from '../LetterRiverBrand.jsx';
import riverHero from '../../assets/vocab-journey/river-valley-hero.webp';
import cafeArt from '../../assets/vocab-journey/cafe-words-art.webp';
import bridgeArt from '../../assets/vocab-journey/bridge-builder-art.webp';
import riverPathMap from '../../assets/vocab-journey/river-path-map.webp';
import {
  getCurrentJourneyPack,
  getJourneyStops,
  getPackWordPreview,
  getPackLearningStage,
  getRecommendedJourneyAction,
  getJourneyStats,
} from './vocabJourneyModel.js';
import './VocabJourneyPanel.css';
import './VocabJourneyMobileTray.css';
import './VocabJourneyWordPopup.css';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { loadBridgeBuilderWords } from '../../data/bridgeBuilder/words/index.js';
import Icon from '../Icon.jsx';


function localizeStageInfo(stageInfo, t) {
  const stageLabelKeys = {
    'Not started': 'bridgeBuilder.vocabJourney.stageNotStarted',
    Complete: 'bridgeBuilder.vocabJourney.statusComplete',
    'Ready for challenge': 'bridgeBuilder.vocabJourney.stageReadyForChallenge',
    'Strengthening memory': 'bridgeBuilder.vocabJourney.stageStrengtheningMemory',
    'Learning meanings': 'bridgeBuilder.vocabJourney.stageLearningMeanings',
    'New pack': 'bridgeBuilder.vocabJourney.stageNewPack'
  };

  const stepLabelKeys = {
    first_look: 'bridgeBuilder.vocabJourney.stageFirstLook',
    meaning: 'bridgeBuilder.vocabJourney.stageMeaning',
    review: 'bridgeBuilder.vocabJourney.stageReview',
    challenge: 'bridgeBuilder.vocabJourney.stageChallenge'
  };

  return {
    ...stageInfo,
    label: t(stageLabelKeys[stageInfo?.label] || 'bridgeBuilder.vocabJourney.stageNotStarted', stageInfo?.label || 'Not started'),
    steps: (stageInfo?.steps || []).map((step) => ({
      ...step,
      label: t(stepLabelKeys[step.id] || 'bridgeBuilder.vocabJourney.stageNotStarted', step.label)
    }))
  };
}

function localizeRecommendedAction(action, t) {
  if (!action) return action;
  const isStart = action.ctaLabel?.toLowerCase().startsWith('start');

  if (action.method === 'loose_planks') {
    return {
      ...action,
      title: t('bridgeBuilder.vocabJourney.actionLoosePlanksTitle', action.title),
      subtitle: t('bridgeBuilder.vocabJourney.actionLoosePlanksSubtitle', action.subtitle),
      ctaLabel: t('bridgeBuilder.vocabJourney.actionContinueLoosePlanks', action.ctaLabel)
    };
  }

  if (action.method === 'deep_script') {
    return {
      ...action,
      title: t('bridgeBuilder.vocabJourney.actionDeepScriptTitle', action.title),
      subtitle: t('bridgeBuilder.vocabJourney.actionDeepScriptSubtitle', action.subtitle),
      ctaLabel: t('bridgeBuilder.vocabJourney.actionContinueDeepScript', action.ctaLabel)
    };
  }

  if (action.method === 'review') {
    return {
      ...action,
      title: t('bridgeBuilder.vocabJourney.actionReviewTitle', action.title),
      subtitle: t('bridgeBuilder.vocabJourney.actionReviewSubtitle', action.subtitle),
      ctaLabel: t('bridgeBuilder.vocabJourney.actionReviewPack', action.ctaLabel)
    };
  }

  return {
    ...action,
    title: t('bridgeBuilder.vocabJourney.actionBridgeTitle', action.title),
    subtitle: t('bridgeBuilder.vocabJourney.actionBridgeSubtitle', action.subtitle),
    ctaLabel: isStart
      ? t('bridgeBuilder.vocabJourney.actionStartBridge', action.ctaLabel)
      : t('bridgeBuilder.vocabJourney.actionContinueBridge', action.ctaLabel)
  };
}

function getStopStatusLabel(status, t) {
  if (status === 'Open') return t('bridgeBuilder.vocabJourney.statusOpenPath', 'Open path');
  if (status === 'Locked') return t('bridgeBuilder.vocabJourney.statusLocked', 'Locked');
  if (status === 'Complete') return t('bridgeBuilder.vocabJourney.statusComplete', 'Complete');
  if (status === 'Current') return t('bridgeBuilder.vocabJourney.statusCurrent', 'Current');
  return status;
}

function WordChips({ items, t, isMissingPackMapping, languageId = 'hebrew' }) {
  const [selectedWordId, setSelectedWordId] = useState(null);
  const direction = languageId === 'hebrew' || languageId === 'arabic' ? 'rtl' : 'ltr';
  const selectedWord = items.find((word) => word.id === selectedWordId);

  useEffect(() => {
    setSelectedWordId(null);
  }, [items]);

  return (
    <div className="vj-word-chips" dir={direction}>
      {items.length === 0 ? (
        <div style={{ padding: '8px', color: '#999', fontSize: '0.875rem' }}>
          {isMissingPackMapping
            ? t('bridgeBuilder.vocabJourney.missingPackContent', 'Content for this pack is not available in the selected practice language yet.')
            : t('bridgeBuilder.vocabJourney.loadingWords', 'Loading words...')}
        </div>
      ) : (
        items.map((word) => (
          <span key={word.id} className="vj-word-chip-wrap">
            <button
              type="button"
              className={`vj-word-chip ${selectedWordId === word.id ? 'vj-word-chip--active' : ''}`}
              onClick={() => setSelectedWordId((current) => current === word.id ? null : word.id)}
              aria-expanded={selectedWordId === word.id}
            >
              {word.native}
            </button>
            {selectedWord?.id === word.id && (
              <span className="vj-word-popover" dir="ltr" role="tooltip">
                {word.transliteration && <strong>{word.transliteration}</strong>}
                {word.translation && <small>{word.translation}</small>}
                {!word.transliteration && !word.translation && <small>{t('bridgeBuilder.vocabJourney.wordDetailsUnavailable', 'Details unavailable')}</small>}
              </span>
            )}
          </span>
        ))
      )}
    </div>
  );
}

function SheetProgress({ steps, t }) {
  return (
    <div className="vj-sheet-progress" aria-label={t('bridgeBuilder.vocabJourney.packLearningProgress', 'Pack learning progress')}>
      {steps.map((step, index) => (
        <div key={step.id} className="vj-sheet-progress-step">
          <span className={`vj-sheet-progress-node ${step.complete ? 'is-complete' : ''}`}>
            {step.complete ? <Icon name="check" /> : index + 1}
          </span>
          <span className="vj-sheet-progress-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}

function CurrentPackDetailSheet({
  t,
  isOpen,
  onClose,
  wordPreviewItems,
  missingPackMapping,
  languageId,
  localizedPackTitle,
  localizedPackDescription,
  stage,
  recommendedAction,
  onLaunchRecommended,
  onLaunchBridgeBuilder,
  onLaunchLoosePlanks,
  onLaunchReadContext,
  packSceneComplete,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="vj-sheet-backdrop" onClick={onClose}>
      <section
        className="vj-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={t('bridgeBuilder.vocabJourney.packDetails', 'Pack details')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vj-sheet-handle" />
        <div className="vj-sheet-hero">
          <img src={cafeArt} alt="" loading="lazy" />
          <div className="vj-sheet-hero-fade" />
          <button type="button" className="vj-sheet-nav-btn vj-sheet-nav-btn--left" onClick={onClose} aria-label={t('bridgeBuilder.vocabJourney.closePackDetails', 'Close pack details')}>
            <Icon name="arrow_back" />
          </button>
          <button type="button" className="vj-sheet-nav-btn vj-sheet-nav-btn--right" aria-label={t('bridgeBuilder.vocabJourney.savePack', 'Save pack')}>
            <Icon name="bookmark" />
          </button>
        </div>

        <header className="vj-sheet-title-block">
          <h2>{localizedPackTitle}</h2>
          <p>{localizedPackDescription || t('bridgeBuilder.vocabJourney.continueLearningWords', 'Continue learning new words.')}</p>
        </header>

        <WordChips items={wordPreviewItems} t={t} isMissingPackMapping={missingPackMapping} languageId={languageId} />
        <SheetProgress steps={stage.steps} t={t} />

        <div className="vj-recommended">
          <h3>{t('bridgeBuilder.vocabJourney.recommendedNext', 'Recommended next')}</h3>
          <button type="button" className="vj-recommended-card" onClick={onLaunchRecommended}>
            <img src={bridgeArt} alt="" loading="lazy" />
            <span className="vj-recommended-copy">
              <strong>{recommendedAction.title}</strong>
              <small>{recommendedAction.subtitle}</small>
            </span>
            <span className="vj-orange-circle"><Icon name="chevron_right" /></span>
          </button>
        </div>

        <div className="vj-option-list">
          <h3>{t('bridgeBuilder.vocabJourney.moreWaysToLearn', 'More ways to learn')}</h3>
          <button type="button" className="vj-option" onClick={onLaunchBridgeBuilder}>
            <span className="vj-option-icon vj-option-icon--orange"><Icon name="architecture" filled /></span>
            <span><strong>{t('bridgeBuilder.vocabJourney.optionBridgeBuilderTitle', 'Learn — Bridge Builder')}</strong><small>{t('bridgeBuilder.vocabJourney.optionBridgeBuilderSubtitle', 'Build vocabulary with guided lessons.')}</small></span>
            <Icon name="chevron_right" />
          </button>
          <button type="button" className="vj-option" onClick={onLaunchLoosePlanks}>
            <span className="vj-option-icon vj-option-icon--teal"><Icon name="view_stream" filled /></span>
            <span><strong>{t('bridgeBuilder.vocabJourney.optionLoosePlanksTitle', 'Strengthen — Loose Planks')}</strong><small>{t('bridgeBuilder.vocabJourney.optionLoosePlanksSubtitle', 'Reinforce with targeted practice.')}</small></span>
            <Icon name="chevron_right" />
          </button>
          <button type="button" className="vj-option" onClick={onLaunchReadContext}>
            <span className="vj-option-icon vj-option-icon--blue"><Icon name="menu_book" filled /></span>
            <span>
              <strong>{t('bridgeBuilder.vocabJourney.optionReadTitle', 'Read in Context')}</strong>
              <small>
                {packSceneComplete
                  ? t('bridgeBuilder.vocabJourney.readInContextDone', 'Scene complete — play again anytime.')
                  : t('bridgeBuilder.vocabJourney.optionReadSubtitle', 'Practice this pack in sentence context.')}
              </small>
            </span>
            {packSceneComplete && (
              <span className="vj-row-done" aria-label={t('bridgeBuilder.vocabJourney.packSceneDone', 'Completed')}>
                <Icon name="check_circle" filled />
              </span>
            )}
            <Icon name="chevron_right" />
          </button>
        </div>
      </section>
    </div>
  );
}

function sortPackItems(packItems = []) {
  return [...packItems].sort((a, b) => (a.pack?.order ?? 0) - (b.pack?.order ?? 0));
}

function getPackItemState(packItem, currentPackId, t) {
  if (!packItem?.unlocked) {
    return {
      status: t('bridgeBuilder.vocabJourney.packStatusLocked', 'Locked'),
      action: '🔒',
      modifier: 'locked',
      disabled: true,
    };
  }

  if (packItem.pack?.id === currentPackId) {
    return {
      status: t('bridgeBuilder.vocabJourney.packStatusCurrent', 'Current'),
      action: t('bridgeBuilder.vocabJourney.packActionContinue', 'Continue'),
      modifier: 'current',
      disabled: false,
    };
  }

  if (packItem.progress?.completed) {
    return {
      status: t('bridgeBuilder.vocabJourney.packStatusComplete', 'Complete'),
      action: t('bridgeBuilder.vocabJourney.packActionReview', 'Review'),
      modifier: 'complete',
      disabled: false,
    };
  }

  return {
    status: t('bridgeBuilder.vocabJourney.packStatusNext', 'Next'),
    action: t('bridgeBuilder.vocabJourney.packActionStart', 'Start'),
    modifier: 'next',
    disabled: false,
  };
}

function getCompactPackItems(packItems, currentPackId) {
  if (packItems.length <= 3) return packItems;
  const currentIndex = packItems.findIndex((item) => item.pack?.id === currentPackId);

  if (currentIndex <= 1) return packItems.slice(0, 3);
  if (currentIndex >= packItems.length - 2) return packItems.slice(-3);
  return packItems.slice(currentIndex - 1, currentIndex + 2);
}

function PackTrayRow({ packItem, index, currentPackId, t, onSelectPack, compact = false }) {
  const state = getPackItemState(packItem, currentPackId, t);
  const pack = packItem.pack;
  const localizedTitle = t(`packs.${pack.id}.title`, pack.title);
  const showStatus = !compact || state.modifier === 'current';

  return (
    <button
      type="button"
      className={`vj-pack-tray-row vj-pack-tray-row--${state.modifier} ${compact ? 'vj-pack-tray-row--compact' : ''}`}
      onClick={() => {
        if (!state.disabled && onSelectPack) onSelectPack(pack.id);
      }}
      disabled={state.disabled}
    >
      <span className="vj-pack-tray-index">{index + 1}</span>
      <span className="vj-pack-tray-title">{localizedTitle}</span>
      {showStatus && <span className="vj-pack-tray-status">{compact ? state.status : state.action}</span>}
    </button>
  );
}

function SectionPackTray({
  sectionItem,
  currentPackId,
  t,
  onSelectPack,
  expanded,
  onToggleExpanded,
}) {
  if (!sectionItem) return null;

  const packItems = sortPackItems(sectionItem.packData || []);
  const compactItems = getCompactPackItems(packItems, currentPackId);
  const hiddenCount = Math.max(0, packItems.length - compactItems.length);
  const sectionTitle = t(`bridgeBuilder.sections.${sectionItem.section.id}.title`, sectionItem.section.title);

  if (expanded) {
    return (
      <section className="vj-pack-drawer vj-pack-drawer--attached" aria-label={t('bridgeBuilder.vocabJourney.sectionPackDrawer', '{{section}} packs', { section: sectionTitle })}>
        <header className="vj-pack-drawer-header">
          <div>
            <h3>{t('bridgeBuilder.vocabJourney.sectionPackCount', '{{section}} · {{count}} packs', { section: sectionTitle, count: packItems.length })}</h3>
            <p>{t('bridgeBuilder.vocabJourney.pickPackInSection', 'Pick a pack from this section.')}</p>
          </div>
          <button type="button" className="vj-pack-drawer-close" onClick={onToggleExpanded} aria-label={t('common.close', 'Close')}>
            <Icon name="close" />
          </button>
        </header>
        <div className="vj-pack-drawer-list">
          {packItems.map((packItem, index) => (
            <PackTrayRow
              key={packItem.pack.id}
              packItem={packItem}
              index={index}
              currentPackId={currentPackId}
              t={t}
              onSelectPack={onSelectPack}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="vj-pack-tray vj-pack-tray--attached" aria-label={t('bridgeBuilder.vocabJourney.sectionPackTray', 'Packs in {{section}}', { section: sectionTitle })}>
      <h3>{t('bridgeBuilder.vocabJourney.packsInSection', 'Packs in {{section}}', { section: sectionTitle })}</h3>
      <div className="vj-pack-tray-list">
        {compactItems.map((packItem) => {
          const index = packItems.findIndex((item) => item.pack?.id === packItem.pack?.id);
          return (
            <PackTrayRow
              key={packItem.pack.id}
              packItem={packItem}
              index={index}
              currentPackId={currentPackId}
              t={t}
              onSelectPack={onSelectPack}
              compact
            />
          );
        })}
      </div>
      {hiddenCount > 0 && (
        <button type="button" className="vj-pack-tray-more" onClick={onToggleExpanded}>
          <span className="vj-pack-tray-more-label">{t('bridgeBuilder.vocabJourney.showAllPacks', 'Show all packs')}</span>
          <span className="vj-pack-tray-more-count">{packItems.length}</span>
        </button>
      )}
    </section>
  );
}

function PathStopButton({ stop, locked, statusLabel, t, onPress }) {
  return (
    <button type="button" className="vj-path-stop-action" onClick={onPress} disabled={locked}>
      <span className="vj-path-icon">
        <Icon name={locked ? 'lock' : stop.icon} filled />
      </span>
      <span className="vj-path-copy">
        <strong>{t(`bridgeBuilder.sections.${stop.id}.title`, stop.title)}</strong>
        <small>{statusLabel}</small>
      </span>
      {locked
        ? <Icon name="lock" />
        : stop.status === 'Complete'
          ? <Icon name="check_circle" className="vj-path-check" filled />
          : <Icon name="chevron_right" />}
    </button>
  );
}

export default function VocabJourneyPanel({
  sectionData,
  activePackId,
  languageId: languageIdProp,
  dueReviewCount,
  weakReviewCount,
  onSelectPack,
  onLaunchPackMethod,
  onReview,
  onOpenBrowse,
}) {
  const { t } = useLocalization();
  const { languageId: selectedPracticeLanguageId } = useLanguage();
  const languageId = languageIdProp || selectedPracticeLanguageId || 'hebrew';
  const [previewWordsReady, setPreviewWordsReady] = useState(languageId === 'hebrew');
  const [isPackTrayExpanded, setIsPackTrayExpanded] = useState(false);
  const [focusedSectionId, setFocusedSectionId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (languageId === 'hebrew') {
      setPreviewWordsReady(true);
      return undefined;
    }

    setPreviewWordsReady(false);
    loadBridgeBuilderWords(languageId)
      .then(() => {
        if (!cancelled) setPreviewWordsReady(true);
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.warn('[vocabJourney] Failed to load preview words for selected language', { languageId, error });
        }
        if (!cancelled) setPreviewWordsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [languageId]);

  const currentPackData = useMemo(() => getCurrentJourneyPack(sectionData, activePackId), [sectionData, activePackId]);
  const currentPack = currentPackData?.pack;
  const currentProgress = currentPackData?.progress;
  const localizedPackTitle = currentPack ? t(`packs.${currentPack.id}.title`, currentPack.title) : '';
  const localizedPackDescription = currentPack ? t(`packs.${currentPack.id}.description`, currentPack.description || '') : '';
  const currentCompletion = currentPackData?.completion;

  const currentPackSectionId = useMemo(() => {
    if (!currentPack) return null;
    return sectionData.find((sectionItem) =>
      (sectionItem.packData || []).some((packItem) => packItem.pack?.id === currentPack.id)
    )?.section?.id || null;
  }, [currentPack, sectionData]);

  useEffect(() => {
    if (currentPackSectionId) setFocusedSectionId(currentPackSectionId);
  }, [currentPackSectionId, currentPack?.id]);

  const activePathSectionId = focusedSectionId || currentPackSectionId;
  const selectedSectionItem = useMemo(() => {
    if (activePathSectionId) {
      const focusedSection = sectionData.find((sectionItem) => sectionItem.section?.id === activePathSectionId);
      if (focusedSection) return focusedSection;
    }
    return sectionData.find((sectionItem) => sectionItem.unlocked) || sectionData[0] || null;
  }, [activePathSectionId, sectionData]);

  useEffect(() => {
    setIsPackTrayExpanded(false);
  }, [selectedSectionItem?.section?.id]);

  const journeyStops = useMemo(() => getJourneyStops(sectionData, activePackId), [sectionData, activePackId]);
  const preview = useMemo(() => {
    if (!previewWordsReady) return { words: [], items: [], usedFallback: false, missingPackMapping: false };
    return getPackWordPreview(currentPack, languageId);
  }, [currentPack, languageId, previewWordsReady]);
  const displayWords = preview.words || [];
  const displayWordItems = preview.items || displayWords.map((word) => ({ id: word, native: word, transliteration: '', translation: '' }));
  const missingPackMapping = preview.missingPackMapping;

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    console.log('[language-debug][VocabJourneyPanel]', {
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      appLanguage: (window.__LETTER_RIVER_LAST_APP_LANG__ || 'unknown'),
      practiceLanguage: languageId,
      requestedPackLanguage: languageId,
      previewWordsReady,
      resolvedPackId: currentPack?.id ?? null,
      focusedSectionId,
      resolvedWordsCount: displayWords.length,
      usedFallbackContent: preview.usedFallback,
      missingPackMapping
    });
  }, [languageId, previewWordsReady, currentPack?.id, focusedSectionId, displayWords.length, preview.usedFallback, missingPackMapping]);

  const stageInfo = useMemo(() => getPackLearningStage(currentProgress, currentCompletion), [currentProgress, currentCompletion]);
  const localizedStageInfo = useMemo(() => localizeStageInfo(stageInfo, t), [stageInfo, t]);
  const recommendedAction = useMemo(() => getRecommendedJourneyAction(currentProgress, currentCompletion), [currentProgress, currentCompletion]);
  const localizedRecommendedAction = useMemo(() => localizeRecommendedAction(recommendedAction, t), [recommendedAction, t]);
  const journeyStats = useMemo(() => getJourneyStats(sectionData), [sectionData]);
  const [isPackSheetOpen, setIsPackSheetOpen] = useState(false);

  if (!currentPack) {
    return (
      <section className="vj-shell" aria-label={t('bridgeBuilder.vocabJourney.title', 'Vocabulary Journey')}>
        <div className="vj-hero" style={{ backgroundImage: `url(${riverHero})` }}>
          <div className="vj-hero-scrim" />
          <div className="vj-brand-row"><LetterRiverBrand label={t('app.brand.name', 'Letter River')} className="vj-brand" /></div>
          <div className="vj-hero-copy"><h1>{t('bridgeBuilder.vocabJourney.title', 'Vocabulary Journey')}</h1><p>{t('bridgeBuilder.vocabJourney.startPath', 'Start your learning path')}</p></div>
        </div>
        <div className="vj-main-grid" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>{t('bridgeBuilder.vocabJourney.noPacks', 'No packs available yet.')}</p>
          <button type="button" className="vj-main-cta" onClick={onOpenBrowse}><Icon name="arrow_forward" filled /><span>{t('bridgeBuilder.vocabJourney.allPacks', 'All Packs')}</span></button>
        </div>
      </section>
    );
  }

  return (
    <section className="vj-shell" aria-label={t('bridgeBuilder.vocabJourney.title', 'Vocabulary Journey')}>
      <div className="vj-hero" style={{ backgroundImage: `url(${riverHero})` }}>
        <div className="vj-hero-scrim" />
        <div className="vj-brand-row">
          <LetterRiverBrand label={t('app.brand.name', 'Letter River')} className="vj-brand" />
          <div className="vj-streak-pill"><Icon name="auto_stories" filled /><span>{journeyStats.completedPacks}</span></div>
        </div>

        <div className="vj-hero-copy">
          <h1>{t('bridgeBuilder.vocabJourney.title', 'Vocabulary Journey')}</h1>
          <p>{t('bridgeBuilder.vocabJourney.currentSectionProgress', '{{section}} · {{percent}}% complete', {
            section: journeyStats.currentSectionTitle,
            percent: journeyStats.overallProgressPct
          })}</p>
        </div>

        <article
          className="vj-current-card vj-current-card--clickable"
          role="button"
          tabIndex={0}
          aria-label={t('bridgeBuilder.vocabJourney.openDetailsFor', 'Open details for {{title}}', { title: localizedPackTitle })}
          onClick={() => setIsPackSheetOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setIsPackSheetOpen(true);
            }
          }}
        >
          <div className="vj-card-copy">
            <span className="vj-badge">{t('bridgeBuilder.vocabJourney.currentPack', 'Current Pack')}</span>
            <h2>{localizedPackTitle}</h2>
            <p className="vj-learn-line"><Icon name="eco" filled />{t('bridgeBuilder.vocabJourney.learnEverydayWords', 'Learn {{count}} everyday words', { count: currentPack.targetsNewCount || currentPack.wordIds?.length || 8 })}</p>
            <p className="vj-goal-line">{t('bridgeBuilder.vocabJourney.currentGoal', 'Press for more details')}</p>
            <p className="vj-card-details-hint"><Icon name="expand_more" />{t('bridgeBuilder.vocabJourney.tapForPackDetails', 'Tap for pack details')}</p>
            <button
              type="button"
              className="vj-main-cta"
              onClick={(event) => {
                event.stopPropagation();
                onLaunchPackMethod(currentPack, recommendedAction.method);
              }}
            >
              <Icon name="conversion_path" filled /><span>{localizedRecommendedAction.ctaLabel}</span><Icon name="chevron_right" />
            </button>
          </div>
          <img className="vj-cafe-art" src={cafeArt} alt="" loading="lazy" />
        </article>
      </div>

      <div className="vj-main-grid">
        <aside className="vj-river-path" style={{ backgroundImage: `url(${riverPathMap})` }}>
          <div className="vj-path-overlay">
            {journeyStops.map((stop) => {
              const locked = stop.status === 'Locked';
              const isCurrentPackStop = stop.status === 'Current';
              const isFocusedStop = activePathSectionId ? stop.id === activePathSectionId : isCurrentPackStop;
              const statusLabel = isFocusedStop && isCurrentPackStop
                ? getStopStatusLabel('Current', t)
                : getStopStatusLabel(stop.status === 'Current' ? 'Open' : stop.status, t);
              const showSectionPacks = isFocusedStop && selectedSectionItem?.section?.id === stop.id;
              const pressStop = () => {
                if (!locked) {
                  setFocusedSectionId(stop.id);
                  setIsPackTrayExpanded(false);
                }
              };

              return (
                <div
                  key={stop.id}
                  className={`vj-path-stop ${isFocusedStop ? 'vj-path-stop--current' : ''} ${locked ? 'vj-path-stop--locked' : ''} ${showSectionPacks ? 'vj-path-stop--with-packs' : ''}`}
                >
                  {showSectionPacks ? (
                    <div className="vj-active-section-card">
                      <PathStopButton stop={stop} locked={locked} statusLabel={statusLabel} t={t} onPress={pressStop} />
                      <SectionPackTray
                        sectionItem={selectedSectionItem}
                        currentPackId={currentPack.id}
                        t={t}
                        onSelectPack={onSelectPack}
                        expanded={isPackTrayExpanded}
                        onToggleExpanded={() => setIsPackTrayExpanded((value) => !value)}
                      />
                    </div>
                  ) : (
                    <PathStopButton stop={stop} locked={locked} statusLabel={statusLabel} t={t} onPress={pressStop} />
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
      <CurrentPackDetailSheet
        t={t}
        isOpen={isPackSheetOpen}
        onClose={() => setIsPackSheetOpen(false)}
        wordPreviewItems={displayWordItems}
        missingPackMapping={missingPackMapping}
        languageId={languageId}
        localizedPackTitle={localizedPackTitle}
        localizedPackDescription={localizedPackDescription}
        stage={localizedStageInfo}
        recommendedAction={localizedRecommendedAction}
        onLaunchRecommended={() => onLaunchPackMethod(currentPack, recommendedAction.method)}
        onLaunchBridgeBuilder={() => onLaunchPackMethod(currentPack, 'bridge_builder')}
        onLaunchLoosePlanks={() => onLaunchPackMethod(currentPack, 'loose_planks')}
        onLaunchReadContext={() => onLaunchPackMethod(currentPack, 'read_context')}
        packSceneComplete={currentCompletion?.packSceneComplete || false}
      />
    </section>
  );
}
