import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { getSectionsInOrder } from '../../data/bridgeBuilderSections.js';
import { getPacksBySection, getPackById } from '../../data/bridgeBuilderPacks.js';
import {
  getAllWordProgress,
  isPackUnlocked,
  isSectionUnlocked,
  getDueReviewWordIds,
  getWeakWordIds,
  getAllPackCompletions,
} from '../../lib/bridgeBuilderStorage.js';
import { getRecommendedSessionForPack } from '../../data/bridgeBuilderSessions.js';
import { emit } from '../../lib/eventBus.js';
import {
  getPackButtonLabel,
  GOAL_FILTERS,
  formatEstimatedMinutes,
  matchesGoal,
  matchesQuery,
  sortPackData,
} from './bridgeBuilderSetupHelpers.js';
import {
  buildDisplayModel,
  getSectionMeta,
} from '../../lib/bridgeBuilderDisplayModel.js';
import SkillCheckScreen from '../SkillCheckScreen.jsx';
import { bridgeBuilderWords, getWordsByIds } from '../../data/bridgeBuilderWords.js';
import { allSentences } from '../../data/sentences/index.ts';
import { applyQuizMastery } from '../../lib/quizMastery.js';
import { getLanguageName } from '../../lib/vocabLanguageAdapter.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getPackVisualTokens } from '../../lib/packVisualTokens.js';
import { buildPackProgressCopy } from '../../lib/packProgressCopy.js';
import './BridgeBuilderSetup.css';

// Quiz vocab pool: difficulty ≤ 2 words, computed once at module load
const QUIZ_VOCAB_WORDS = bridgeBuilderWords.filter((w) => w.difficulty <= 2);
// Quiz sentence pool: difficulty-1 sentences
const QUIZ_SENTENCES = allSentences.filter((s) => s.difficulty === 1);

/* ─── Section visual metadata ──────────────────────────────── */
// Moved to src/lib/bridgeBuilderDisplayModel.js — see SECTION_META / getSectionMeta.
// Both the current setup screen and the future section-hub UI render
// through that single source.

/* ─── Game mode resolver ─────────────────────────────────── */

function resolveGameMode(completion, modeOverride) {
  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = completion;
  if (modeOverride) return modeOverride;
  if (bridgeBuilderComplete && loosePlanksComplete && !deepScriptComplete) return 'deep_script';
  if (bridgeBuilderComplete && !loosePlanksComplete) return 'loose_planks';
  return 'bridge_builder';
}

/* ─── Last-used study method persistence ─────────────────── */

const LAST_METHOD_KEY = 'bbs_last_study_method';

function getLastStudyMethods() {
  try { return JSON.parse(localStorage.getItem(LAST_METHOD_KEY) || '{}'); }
  catch { return {}; }
}

function setLastStudyMethod(packId, method) {
  const all = getLastStudyMethods();
  all[packId] = method;
  try { localStorage.setItem(LAST_METHOD_KEY, JSON.stringify(all)); } catch {}
}

/* ─── Node state ─────────────────────────────────────────── */

function getCompletionLevel(completion) {
  const { loosePlanksComplete, deepScriptComplete } = completion || {};
  if (loosePlanksComplete && deepScriptComplete) return 'full';
  if (loosePlanksComplete || deepScriptComplete) return 'partial';
  return 'none';
}

function getNodeState(progress, unlocked, isCurrent, completion) {
  if (!unlocked) return 'locked';
  if (getCompletionLevel(completion) === 'full') return 'completed';
  if (isCurrent || progress.wordsIntroducedCount > 0) return 'current';
  return 'upcoming';
}

function QuestPackTile({ pack, progress, unlocked, isCurrent, isSelected, onToggle, accent, completion, status, dueReviewCount = 0, packIndex, totalPacks }) {
  const defaultCompletion = { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
  const comp = completion || defaultCompletion;
  const state = getNodeState(progress, unlocked, isCurrent, comp);

  const nodeCls = `bbs-quest-tile bbs-quest-tile--${state} bbs-quest-tile--${accent}`;
  const stateLabel = !unlocked
    ? 'Suggested later'
    : dueReviewCount > 0
      ? 'Review'
      : status === 'mastered'
        ? 'Done'
        : isCurrent
          ? 'Current'
          : '';
  const ariaLabel = stateLabel
    ? `Pack ${packIndex + 1} of ${totalPacks}, ${pack.title}, ${stateLabel}`
    : `Pack ${packIndex + 1} of ${totalPacks}, ${pack.title}`;

  return (
    <button
      type="button"
      className={isSelected ? `${nodeCls} bbs-quest-tile--selected` : nodeCls}
      onClick={() => unlocked && onToggle(pack.id)}
      disabled={!unlocked}
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-current={isCurrent ? 'step' : undefined}
    >
      <span className="bbs-quest-tile-top">
        <span className="bbs-quest-tile-index">{packIndex + 1}</span>
        {stateLabel && <span className={`bbs-quest-pill bbs-quest-pill--${state}`}>{stateLabel}</span>}
      </span>
      <span className="bbs-quest-tile-main">
        <span className="bbs-quest-tile-title" dir="auto">{pack.title}</span>
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════
   SVG connector between two adjacent nodes
   ═══════════════════════════════════════════════════════════ */

function SelectedPackPanel({ packModel, accent = 'primary', onLaunch, onQuizLaunch }) {
  if (!packModel) return null;
  const pack = packModel.pack;
  const wordsLabel = `${pack.wordIds.length} words`;
  const started = (packModel.progress?.wordsIntroducedCount || 0) > 0
    || packModel.status === 'started'
    || packModel.status === 'introduced'
    || packModel.status === 'learned'
    || packModel.status === 'mastered'
    || packModel.status === 'review';
  const sentenceReady = !!(packModel.completion?.sentenceReady || packModel.sentenceReady);
  const canQuickCheck = pack.wordIds.length >= 3;

  const mainAction = started
    ? { label: 'Continue this pack', subtitle: 'Guided word matching for these words.', button: 'Continue' }
    : { label: 'Learn this pack', subtitle: 'Guided word matching for these words.', button: 'Start' };

  const quickCheckAction = sentenceReady
    ? {
      label: 'Ready for Sentence Mode',
      subtitle: 'This pack can now appear in sentence practice.',
      button: 'Check again',
      disabled: !canQuickCheck,
      done: true,
    }
    : {
      label: 'I already know these',
      subtitle: 'Pass the quick check so this pack can appear in Sentence Mode.',
      button: 'Check',
      disabled: !canQuickCheck,
      done: false,
    };

  return (
    <section className={`bbs-selected-pack bbs-selected-pack--${accent}`} aria-label={`Selected pack: ${pack.title}`}>
      <h4 className="bbs-selected-pack-title" dir="auto">{pack.title}</h4>
      {pack.description && <p className="bbs-selected-pack-desc" dir="auto">{pack.description}</p>}
      <div className="bbs-selected-pack-meta">
        <span className="bbs-pack-chip">{wordsLabel}</span>
      </div>
      <h5 className="bbs-selected-pack-heading">Choose what to do</h5>
      <div className="bbs-activity-grid">
        <article className="bbs-activity-card bbs-activity-card--primary">
          <h6 className="bbs-activity-title">{mainAction.label}</h6>
          <p className="bbs-activity-subtitle">{mainAction.subtitle}</p>
          <button
            type="button"
            className="bbs-activity-cta bbs-activity-cta--primary"
            onClick={() => onLaunch(pack, 'vocab')}
            aria-label={`${mainAction.label}, ${mainAction.subtitle}`}
          >
            {mainAction.button}
          </button>
        </article>

        <article className="bbs-activity-card">
          <h6 className="bbs-activity-title">Use in Deep Script</h6>
          <p className="bbs-activity-subtitle">Play the guardian challenge with this pack.</p>
          <button
            type="button"
            className="bbs-activity-cta"
            onClick={() => onLaunch(pack, 'deep_script')}
            aria-label="Use in Deep Script, play the guardian challenge with this pack."
          >
            Play
          </button>
        </article>

        <article className={`bbs-activity-card${quickCheckAction.done ? ' bbs-activity-card--done' : ''}`}>
          <h6 className="bbs-activity-title">{quickCheckAction.label}</h6>
          <p className="bbs-activity-subtitle">{quickCheckAction.subtitle}</p>
          <button
            type="button"
            className="bbs-activity-cta"
            onClick={() => onQuizLaunch(pack)}
            disabled={quickCheckAction.disabled}
            aria-label={`${quickCheckAction.label}, ${quickCheckAction.subtitle}`}
          >
            {quickCheckAction.button}
          </button>
        </article>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SectionBlock — always-visible section with winding path
   ═══════════════════════════════════════════════════════════ */

function SectionBlock({ sectionModel, activePackId, expandedPack, onTogglePack, onLaunch, onQuizLaunch, panelId, hideHeader = false }) {
  const { section, packModels, isUnlocked, masteredCount, totalPacks } = sectionModel;
  const meta = getSectionMeta(sectionModel.id);
  const accent = meta.accent;
  const progressPct = totalPacks > 0 ? (masteredCount / totalPacks) * 100 : 0;
  const selectedPackModel = packModels.find((pm) => pm.id === expandedPack) || packModels.find((pm) => pm.id === activePackId) || packModels[0] || null;
  return (
    <div id={panelId} className={`bbs-block ${hideHeader ? 'bbs-block--embedded' : ''} ${!isUnlocked ? 'bbs-block--locked' : ''}`}>
      {!hideHeader && (
        <div className="bbs-block-header">
          <div className={`bbs-block-icon bbs-block-icon--${accent}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{meta.icon}</span>
          </div>
          <div className="bbs-block-info">
            <div className="bbs-block-top">
              <h3 className="bbs-block-title" dir="auto">{section.title}</h3>
              <span className={`bbs-block-count bbs-block-count--${accent}`}>
                {isUnlocked ? `${masteredCount}/${totalPacks}` : `${totalPacks} packs`}
              </span>
            </div>
            <p className="bbs-block-desc">{section.description}</p>
            <div className="bbs-block-bar">
              <div
                className="bbs-block-track"
                role="progressbar"
                aria-label={`${section.title} completion`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressPct)}
                aria-valuetext={`${masteredCount}/${totalPacks}`}
              >
                <div className={`bbs-block-fill bbs-block-fill--${accent}`} style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
      <SelectedPackPanel
        packModel={selectedPackModel}
        accent={accent}
        onLaunch={onLaunch}
        onQuizLaunch={onQuizLaunch}
      />
      <div className="bbs-quest-board" role="list" aria-label={`${section.title} packs`}>
        {packModels.map((packModel) => {
          const unlocked = packModel.status !== 'locked';
          return (
            <QuestPackTile
              key={packModel.id}
              pack={packModel.pack}
              progress={packModel.progress}
              unlocked={unlocked}
              isCurrent={packModel.id === activePackId}
              isSelected={selectedPackModel?.id === packModel.id}
              onToggle={onTogglePack}
              accent={accent}
              completion={packModel.completion}
              status={packModel.status}
              dueReviewCount={packModel.reviewDueCount || 0}
              packIndex={packModel.packIndex ?? 0}
              totalPacks={packModels.length}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Components kept for Browse / Expert views only
   ═══════════════════════════════════════════════════════════ */

function ProgressDots({ completion, modeOverride, unlocked, packId, onDotClick }) {
  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = completion;
  const dots = [
    { complete: bridgeBuilderComplete, override: modeOverride === 'bridge_builder', mode: 'bridge_builder', icon: 'conversion_path', label: 'Bridge Builder' },
    { complete: loosePlanksComplete, override: modeOverride === 'loose_planks', mode: 'loose_planks', icon: 'view_stream', label: 'Loose Planks' },
    { complete: deepScriptComplete, override: modeOverride === 'deep_script', mode: 'deep_script', icon: 'ink_pen', label: 'Deep Script' },
  ];
  return (
    <div className="bbs-dots" aria-label="Progress dots">
      {dots.map((dot, i) => {
        let cls = 'bbs-dot';
        if (dot.override) cls += ' bbs-dot--override';
        else if (dot.complete) cls += ' bbs-dot--complete';
        return (
          <button key={i} type="button" className="bbs-dot-mode" disabled={!unlocked}
            aria-label={dot.label} aria-pressed={dot.override}
            onClick={(e) => { e.stopPropagation(); if (unlocked && onDotClick) onDotClick(packId, dot.mode); }}>
            <span className={cls} />
            <span className="material-symbols-outlined bbs-dot-mode-icon" aria-hidden="true">{dot.icon}</span>
          </button>
        );
      })}
    </div>
  );
}

function PackRow({ packModel, modeOverride, onDotClick, onPlay, compact = false, entryPoint = 'guided' }) {
  const pack = packModel.pack;
  const progress = packModel.progress;
  const completion = packModel.completion;
  const unlocked = packModel.status !== 'locked';
  const dueReviewCount = packModel.reviewDueCount || 0;
  const copy = buildPackProgressCopy({ pack, progress, completion, isUnlocked: unlocked, isGatingEnforced: false, dueReviewCount });
  const statusInfo = { label: copy.stageLabel, modifier: copy.stageTone };
  const visual = getPackVisualTokens(pack, statusInfo.modifier);
  const buttonLabel = getPackButtonLabel(progress);
  const handlePlay = (e) => {
    e.stopPropagation();
    if (!unlocked) return;
    const gameMode = resolveGameMode(completion, modeOverride);
    const session = getRecommendedSessionForPack(pack);
    onPlay({
      sessionType: 'guided_pack', packId: pack.id, sessionId: session?.id || null,
      selectedWordIds: session ? [...session.targetWordIds, ...session.supportWordIds] : pack.wordIds,
      gameMode, entryPoint,
      targetsNewCount: pack.targetsNewCount || pack.wordIds.length,
      supportReviewCount: pack.supportReviewCount || 0,
      estimatedTimeSec: pack.estimatedTimeSec || 0,
    });
  };
  let rowCls = `bbs-pack-row bbs-pack-row--${visual.accent} bbs-pack-row--${visual.difficultyTone}`;
  if (!unlocked) rowCls += ' bbs-pack-row--locked';
  const rowMetaChips = [
    copy.wordsIntroducedLabel,
    copy.modesCompleteLabel,
    copy.reviewDueLabel,
    copy.sentenceReadyLabel,
    copy.unlockReasonLabel,
  ].filter(Boolean);

  return (
    <div className={rowCls}>
      <span className={`bbs-pack-motif bbs-pack-motif--${visual.motif}`} aria-hidden="true" />
      <div className={`bbs-pack-row-icon ${compact ? 'bbs-pack-row-icon--compact' : ''}`}>
        <span className={`material-symbols-outlined bbs-pack-row-emblem bbs-pack-row-emblem--${visual.accent}`} aria-hidden="true">
          {unlocked ? visual.icon : 'lock'}
        </span>
      </div>
      <div className="bbs-pack-row-body">
        <div className="bbs-pack-row-top">
          <span className="bbs-pack-row-title" dir="auto">{pack.title}</span>
          <span className={`bbs-status-pill bbs-status-pill--${statusInfo.modifier}`}>{statusInfo.label}</span>
        </div>
        {!compact && <div className="bbs-pack-row-subtitle" dir="auto">{pack.description}</div>}
        <div className="bbs-pack-meta">
          <span className="bbs-pack-chip">{pack.primaryType || 'mixed'}</span>
          <span className="bbs-pack-chip">{pack.difficultyBand || 'Core'}</span>
          {rowMetaChips.map((chip) => <span key={chip} className="bbs-pack-chip" dir="auto">{chip}</span>)}
          <span className="bbs-pack-chip">{formatEstimatedMinutes(pack.estimatedTimeSec)}</span>
        </div>
        {!compact && <div className="bbs-pack-why">{pack.whyItMatters}</div>}
        <div className="bbs-pack-row-bottom">
          <ProgressDots completion={completion} modeOverride={modeOverride} unlocked={unlocked} packId={pack.id} onDotClick={onDotClick} />
          {unlocked && <button type="button" className="bbs-action-btn" onClick={handlePlay}>{buttonLabel}</button>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SectionHubCard — compact default card for a section
   ═══════════════════════════════════════════════════════════ */
// Compact default card for Guided mode.

const HUB_STATUS_DOT_MODIFIER = {
  new: 'new',
  started: 'progress',
  introduced: 'progress',
  learned: 'progress',
  mastered: 'completed',
  review: 'progress',
  locked: 'locked',
};

function SectionHubCard({
  sectionModel,
  isExpanded,
  onToggleExpand,
  onLaunchRecommended,
  expandedContent,
}) {
  const {
    title,
    description,
    icon,
    accent,
    isUnlocked,
    totalPacks,
    masteredCount,
    previewPacks,
    recommendedPack,
    nextUnlockLabel,
  } = sectionModel;

  const progressLabel = isUnlocked
    ? `${masteredCount} of ${totalPacks} pack${totalPacks === 1 ? '' : 's'} mastered`
    : nextUnlockLabel || `${totalPacks} pack${totalPacks === 1 ? '' : 's'} locked`;

  const showContinue = isUnlocked && !!recommendedPack && !isExpanded;
  const panelId = `bbs-section-panel-${sectionModel.id}`;
  const nextPreview = previewPacks.slice(0, 3).map((p) => p.title).join(' · ');
  const actionLabel = recommendedPack
    ? recommendedPack.ctaLabel.toLowerCase().includes('continue') || recommendedPack.stageLabel === 'Started'
      ? `Continue ${recommendedPack.title}`
      : recommendedPack.isReviewDue
        ? `Review ${recommendedPack.title}`
        : `Start with ${recommendedPack.title}`
    : 'Open section';

  return (
    <div
      className={`bbs-hub bbs-hub--${accent} ${!isUnlocked ? 'bbs-hub--locked' : ''} ${isExpanded ? 'bbs-hub--expanded' : ''}`}
    >
      {/* Header */}
      <div className="bbs-hub-header">
        <div className={`bbs-hub-icon bbs-hub-icon--${accent}`} aria-hidden="true">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="bbs-hub-head-text">
          <div className="bbs-hub-head-top">
            <h3 className="bbs-hub-title" dir="auto">{title}</h3>
            <span className={`bbs-hub-count bbs-hub-count--${accent}`}>
              {isUnlocked ? `${masteredCount}/${totalPacks}` : `${totalPacks} packs`}
            </span>
          </div>
          <p className="bbs-hub-desc" dir="auto">{description}</p>
        </div>
      </div>

      {/* Continue CTA — recommended pack */}
      {showContinue ? (
        <button
          type="button"
          className={`bbs-hub-cta bbs-hub-cta--${accent}`}
          onClick={onLaunchRecommended}
          aria-label={`${actionLabel}. ${progressLabel}`}
        >
          <span className="bbs-hub-cta-body">
            <span className="bbs-hub-cta-title" dir="auto">{actionLabel}</span>
          </span>
          <span className="bbs-hub-cta-chev" aria-hidden="true">
            <span className="material-symbols-outlined">arrow_forward</span>
          </span>
        </button>
      ) : (
        !isUnlocked && (
          <div className="bbs-hub-locked-note">
            <span className="material-symbols-outlined" aria-hidden="true">lock</span>
            <span>{nextUnlockLabel || 'Complete the previous section to unlock'}</span>
          </div>
        )
      )}

      {!isExpanded && nextPreview && <div className="bbs-hub-next" dir="auto">{`Next: ${nextPreview}`}</div>}

      {/* Open / Close toggle */}
      {isUnlocked && totalPacks > 0 && (
        <button
          type="button"
          className="bbs-hub-toggle"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      )}
      {isExpanded && expandedContent}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TopActionStrip — compact "what to do next" area above tabs
   ═══════════════════════════════════════════════════════════ */
// Additive layer: sits above the existing Guided/Browse/Advanced tabs
// and surfaces the most important next actions (Continue, Review, Skill
// Check) so the player can act without scrolling. The old guided path
// and Review card below are intentionally left in place for now.

function TopActionStrip({
  recommendedPack,        // PackDisplayModel | null
  dueCount,
  weakCount,
  showSkillCheckCta,
  onContinue,
  onReview,
  onSkillCheck,
}) {
  const hasContinue = !!recommendedPack;
  const hasReview = dueCount > 0;
  const hasSkillCheck = !!showSkillCheckCta;
  const continueTitle = recommendedPack
    ? (recommendedPack.stageLabel === 'Started' || recommendedPack.ctaLabel.toLowerCase().includes('continue')
      ? `Continue ${recommendedPack.title}`
      : `Start with ${recommendedPack.title}`)
    : '';
  const continueMeta = recommendedPack
    ? (recommendedPack.progress.wordsIntroducedCount > 0
      ? `${recommendedPack.progress.wordsIntroducedCount}/${recommendedPack.progress.totalWords} words`
      : `${recommendedPack.wordCount} words`)
    : '';

  // Nothing to show — don't render an empty strip.
  if (!hasContinue && !hasReview && !hasSkillCheck) return null;

  return (
    <div className="bbs-top-strip" role="group" aria-label="Next actions">
      {hasContinue && (
        <button
          type="button"
          className="bbs-top-card bbs-top-card--primary"
          onClick={onContinue}
          aria-label={`${recommendedPack.ctaLabel} ${recommendedPack.title}`}
        >
          <span className="bbs-top-card-icon bbs-top-card-icon--primary" aria-hidden="true">
            <span className="material-symbols-outlined">play_arrow</span>
          </span>
          <span className="bbs-top-card-body">
            <span className="bbs-top-card-title" dir="auto">{continueTitle}</span>
            <span className="bbs-top-card-meta">{continueMeta}</span>
          </span>
          <span className="bbs-top-card-chev" aria-hidden="true">
            <span className="material-symbols-outlined">arrow_forward</span>
          </span>
        </button>
      )}

      {hasReview && (
        <button
          type="button"
          className="bbs-top-card bbs-top-card--review"
          onClick={onReview}
          aria-label={`Review ${dueCount} due item${dueCount === 1 ? '' : 's'}`}
        >
          <span className="bbs-top-card-icon bbs-top-card-icon--review" aria-hidden="true">
            <span className="material-symbols-outlined">casino</span>
          </span>
          <span className="bbs-top-card-body">
            <span className="bbs-top-card-eyebrow">Review due</span>
            <span className="bbs-top-card-title">
              {dueCount} item{dueCount === 1 ? '' : 's'}
            </span>
            {weakCount > 0 && (
              <span className="bbs-top-card-meta">{weakCount} weak</span>
            )}
          </span>
        </button>
      )}

      {hasSkillCheck && (
        <button
          type="button"
          className="bbs-top-card bbs-top-card--skillcheck"
          onClick={onSkillCheck}
          aria-label="Take a quick skill check"
        >
          <span className="bbs-top-card-icon bbs-top-card-icon--skillcheck" aria-hidden="true">
            <span className="material-symbols-outlined">quiz</span>
          </span>
          <span className="bbs-top-card-body">
            <span className="bbs-top-card-eyebrow">Skill check</span>
            <span className="bbs-top-card-title">Quick check</span>
            <span className="bbs-top-card-meta">Skip what you know</span>
          </span>
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main Setup Screen
   ═══════════════════════════════════════════════════════════ */

export default function BridgeBuilderSetup({ onPlay, onBack }) {
  const { languageId } = useLanguage();
  const languageName = getLanguageName(languageId);
  const [goalFilter, setGoalFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [activeSubview, setActiveSubview] = useState(null);
  const [expandedPack, setExpandedPack] = useState(null);
  // Which section hubs are currently expanded to show the detailed
  // winding path. Multiple can be open at once; default is all closed
  // so the Guided tab fits on one screen.
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const [modeOverrides, setModeOverrides] = useState({});
  const [lastMethods, setLastMethods] = useState(() => getLastStudyMethods());
  // Incremented after quiz mastery is applied to force re-read of storage
  const [progressRevision, setProgressRevision] = useState(0);
  const [showSkillCheck, setShowSkillCheck] = useState(false);
  const [packQuizTarget, setPackQuizTarget] = useState(null); // pack object when running a pack-specific quiz
  const [quizResult, setQuizResult] = useState(null);

  const sections = useMemo(() => getSectionsInOrder(), []);
  const allProgress = useMemo(() => getAllWordProgress(), [progressRevision]); // eslint-disable-line react-hooks/exhaustive-deps
  const dueReviewWordIds = useMemo(() => getDueReviewWordIds(), [progressRevision]); // eslint-disable-line react-hooks/exhaustive-deps
  const weakWordIds = useMemo(() => getWeakWordIds(), [progressRevision]); // eslint-disable-line react-hooks/exhaustive-deps
  const packCompletions = useMemo(() => getAllPackCompletions(), [progressRevision]); // eslint-disable-line react-hooks/exhaustive-deps

  // Normalized display model — the single source of truth for status,
  // CTA labels, progress copy, and section-level aggregates. The current
  // setup screen only consumes `currentPack` from it (for activePackId)
  // so the visible layout is unchanged, but a future section-hub UI can
  // render entirely from this structure.
  const displayModel = useMemo(() =>
    buildDisplayModel({
      sections,
      getPacksForSection: (sectionId) => getPacksBySection(sectionId),
      allWordProgress: allProgress,
      packCompletions,
      dueReviewWordIds,
      isPackUnlocked: (pack) => isPackUnlocked(pack, getPacksBySection(pack.sectionId), allProgress),
      isSectionUnlocked: (section) => isSectionUnlocked(section, sections, sections.flatMap(s => getPacksBySection(s.id)), allProgress),
    }),
  [sections, allProgress, packCompletions, dueReviewWordIds]);

  const activePackId = useMemo(() => {
    for (const sectionModel of displayModel.sections) {
      if (sectionModel.currentPack) return sectionModel.currentPack.id;
    }
    return null;
  }, [displayModel]);

  // Recommended pack for the top action strip — mirrors activePackId but
  // returns the full PackDisplayModel (not just id) so the strip can
  // render title, CTA label, and progress copy straight from one source.
  const recommendedPackModel = useMemo(() => {
    for (const sectionModel of displayModel.sections) {
      if (sectionModel.recommendedPack) return sectionModel.recommendedPack;
    }
    return null;
  }, [displayModel]);

  // Same rule as the existing skill-check banner so both appear and
  // disappear together — feature is additive, not a replacement.
  const showSkillCheckCta = useMemo(
    () => !Object.values(packCompletions).some((c) => c?.quizMastered || c?.sentenceReady),
    [packCompletions],
  );

  const handleTogglePack = useCallback((packId) => {
    setExpandedPack(prev => prev === packId ? null : packId);
  }, []);

  const handleDotClick = useCallback((packId, mode) => {
    setModeOverrides(prev => {
      if (prev[packId] === mode) { const next = { ...prev }; delete next[packId]; return next; }
      return { ...prev, [packId]: mode };
    });
  }, []);

  const handlePlayPack = useCallback((sessionConfig) => {
    emit('analytics:bridge_setup', { event: 'session_start', ...sessionConfig });
    onPlay(sessionConfig);
  }, [onPlay]);

  const handleLaunchPackMethod = useCallback((pack, method) => {
    const session = getRecommendedSessionForPack(pack);
    const completion = packCompletions[pack.id] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
    let gameMode;
    if (method === 'deep_script') {
      gameMode = 'deep_script';
    } else {
      gameMode = resolveGameMode(completion, null);
      if (gameMode === 'deep_script') gameMode = 'bridge_builder';
    }
    setLastStudyMethod(pack.id, method);
    setLastMethods(prev => ({ ...prev, [pack.id]: method }));
    emit('analytics:bridge_setup', { event: 'session_start', method, packId: pack.id, gameMode });
    onPlay({
      sessionType: 'guided_pack', packId: pack.id, sessionId: session?.id || null,
      selectedWordIds: session ? [...session.targetWordIds, ...session.supportWordIds] : pack.wordIds,
      gameMode, entryPoint: 'guided',
      targetsNewCount: pack.targetsNewCount || pack.wordIds.length,
      supportReviewCount: pack.supportReviewCount || 0,
      estimatedTimeSec: pack.estimatedTimeSec || 0,
    });
  }, [onPlay, packCompletions]);

  const handlePlayReview = useCallback(() => {
    const reviewIds = dueReviewWordIds.length > 0 ? dueReviewWordIds : weakWordIds;
    emit('analytics:bridge_setup', { event: 'review_start', dueCount: dueReviewWordIds.length, weakCount: weakWordIds.length });
    onPlay({ sessionType: 'due_review', packId: null, selectedWordIds: reviewIds, gameMode: 'bridge_builder', entryPoint: 'review_due' });
  }, [onPlay, dueReviewWordIds, weakWordIds]);

  const handleSkillCheckComplete = useCallback(({ score, total, breakdown, evidence }) => {
    const { correctWordIds, sentenceReadyPackIds } = applyQuizMastery(evidence, breakdown);
    setProgressRevision((r) => r + 1);
    setShowSkillCheck(false);
    const passed = total > 0 && score >= Math.ceil(total * 0.8);

    if (packQuizTarget) {
      setQuizResult({
        type: 'pack',
        packTitle: packQuizTarget.title,
        correctWordCount: correctWordIds.length,
        testedWordCount: packQuizTarget.wordIds.length,
        sentenceReady: sentenceReadyPackIds.includes(packQuizTarget.id),
      });
      setPackQuizTarget(null);
      if (passed) setExpandedPack(null);
    } else {
      const sentenceReadyPackTitles = sentenceReadyPackIds
        .map((id) => getPackById(id)?.title)
        .filter(Boolean);
      setQuizResult({
        type: 'global',
        correctWordCount: correctWordIds.length,
        testedWordCount: evidence?.length ?? 0,
        sentenceReadyPackIds,
        sentenceReadyPackTitles,
      });
    }

    emit('analytics:bridge_setup', {
      event: 'skill_check_complete',
      quizType: packQuizTarget ? 'pack' : 'global',
      packId: packQuizTarget?.id ?? null,
      correctWordCount: correctWordIds.length,
      sentenceReadyCount: sentenceReadyPackIds.length,
    });
  }, [packQuizTarget]);

  const handleSkillCheckSkip = useCallback(() => {
    setShowSkillCheck(false);
    setPackQuizTarget(null);
  }, []);

  const handlePackQuizLaunch = useCallback((pack) => {
    setPackQuizTarget(pack);
    setShowSkillCheck(true);
    setQuizResult(null);
  }, []);

  // Top-strip Continue: launch the recommended pack using the player's
  // last study method for that pack (falls back to 'vocab' for Vocab
  // Builder). Reuses the existing launch path so game modes, analytics,
  // and persistence are identical to the path-node chooser.
  const handleContinueRecommended = useCallback(() => {
    const pack = recommendedPackModel?.pack;
    if (!pack) return;
    const method = lastMethods[pack.id] || 'vocab';
    emit('analytics:bridge_setup', { event: 'top_strip_continue', packId: pack.id, method });
    handleLaunchPackMethod(pack, method);
  }, [recommendedPackModel, lastMethods, handleLaunchPackMethod]);

  const handleTopStripReview = useCallback(() => {
    emit('analytics:bridge_setup', { event: 'top_strip_review' });
    handlePlayReview();
  }, [handlePlayReview]);

  const handleTopStripSkillCheck = useCallback(() => {
    emit('analytics:bridge_setup', { event: 'top_strip_skill_check' });
    setShowSkillCheck(true);
  }, []);

  const handleToggleSection = useCallback((sectionId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      emit('analytics:bridge_setup', {
        event: next.has(sectionId) ? 'section_hub_open' : 'section_hub_close',
        sectionId,
      });
      return next;
    });
  }, []);

  // Launch the recommended pack for a section directly from its hub,
  // using the player's last study method so the UX matches the path
  // node's chooser.
  const handleLaunchRecommendedForSection = useCallback((sectionModel) => {
    const packModel = sectionModel.recommendedPack;
    if (!packModel) return;
    const method = lastMethods[packModel.id] || 'vocab';
    emit('analytics:bridge_setup', { event: 'section_hub_continue', sectionId: sectionModel.id, packId: packModel.id, method });
    handleLaunchPackMethod(packModel.pack, method);
  }, [lastMethods, handleLaunchPackMethod]);

  // Clicking a preview chip in the hub: expand the section and open
  // that pack's chooser inline in the detailed path below.
  const allUnlockedPackModels = useMemo(
    () => displayModel.sections.flatMap((sectionModel) => sectionModel.packModels).filter((pm) => pm.status !== 'locked'),
    [displayModel],
  );
  const goalModePackData = useMemo(() => allUnlockedPackModels.filter(pm => matchesGoal(pm.pack, goalFilter)), [allUnlockedPackModels, goalFilter]);
  const expertModePackData = useMemo(() => {
    const filtered = allUnlockedPackModels.filter(pm => matchesQuery(pm.pack, query));
    return sortPackData(filtered, sortBy);
  }, [allUnlockedPackModels, query, sortBy]);

  return (
    <>
    {showSkillCheck && (
      <SkillCheckScreen
        onComplete={handleSkillCheckComplete}
        onSkip={handleSkillCheckSkip}
        questionTypes={packQuizTarget ? ['vocab'] : ['vocab', 'sentence']}
        vocabWords={packQuizTarget ? getWordsByIds(packQuizTarget.wordIds) : QUIZ_VOCAB_WORDS}
        sentences={QUIZ_SENTENCES}
        questionCounts={packQuizTarget ? { vocab: Math.min(packQuizTarget.wordIds.length, 6) } : null}
      />
    )}
    <div className="bbs-screen">
      <div className="bbs-content">
        <div className="bbs-header">
          <h1 className="bbs-title">Vocab Builder</h1>
          <p className="bbs-subtitle">Your learning path</p>
        </div>

        <TopActionStrip
          recommendedPack={recommendedPackModel}
          dueCount={dueReviewWordIds.length}
          weakCount={weakWordIds.length}
          showSkillCheckCta={showSkillCheckCta}
          onContinue={handleContinueRecommended}
          onReview={handleTopStripReview}
          onSkillCheck={handleTopStripSkillCheck}
        />

        <div className="bbs-mode-tabs" role="tablist" aria-label="Browse modes">
          <button type="button" className={`bbs-mode-tab ${activeSubview === null ? 'active' : ''}`}
            onClick={() => setActiveSubview(null)}>Guided</button>
          <button type="button" className={`bbs-mode-tab ${activeSubview === 'goal' ? 'active' : ''}`}
            onClick={() => { setActiveSubview('goal'); emit('analytics:bridge_setup', { event: 'open_goal_browse' }); }}>Browse by goal</button>
          <button type="button" className={`bbs-mode-tab ${activeSubview === 'expert' ? 'active' : ''}`}
            onClick={() => { setActiveSubview('expert'); emit('analytics:bridge_setup', { event: 'open_expert_browse' }); }}>Advanced tools</button>
        </div>

        {activeSubview === 'goal' && (
          <div className="bbs-mode-panel">
            <h3 className="bbs-mode-title">What do you want to do today?</h3>
            <button type="button" className="bbs-subview-close" onClick={() => setActiveSubview(null)}>Back to guided</button>
            <div className="bbs-goal-filters">
              {GOAL_FILTERS.map(goal => (
                <button key={goal.id} type="button" className={`bbs-goal-chip ${goalFilter === goal.id ? 'active' : ''}`}
                  onClick={() => { setGoalFilter(goal.id); emit('analytics:bridge_setup', { event: 'goal_filter_change', goalId: goal.id }); }}>
                  {goal.label}
                </button>
              ))}
            </div>
            <div className="bbs-upnext-list">
              {goalModePackData.length > 0 ? (
                goalModePackData.slice(0, 12).map(pd => (
                  <PackRow key={pd.id} packModel={pd}
                    modeOverride={modeOverrides[pd.id] || null}
                    onDotClick={handleDotClick} onPlay={handlePlayPack} compact entryPoint="goal_browse" />
                ))
              ) : (
                <div className="bbs-empty-state">No packs match this goal yet. Try another goal filter.</div>
              )}
            </div>
          </div>
        )}

        {activeSubview === 'expert' && (
          <div className="bbs-mode-panel">
            <h3 className="bbs-mode-title">Search & filter your library</h3>
            <button type="button" className="bbs-subview-close" onClick={() => setActiveSubview(null)}>Back to guided</button>
            <div className="bbs-expert-controls">
              <input type="search" className="bbs-search" placeholder="Search packs or goals" value={query} aria-label="Search packs or goals"
                onChange={(e) => { setQuery(e.target.value); emit('analytics:bridge_setup', { event: 'expert_search_change', queryLength: e.target.value.length }); }} />
              <select className="bbs-sort" value={sortBy} aria-label="Sort packs" onChange={(e) => { setSortBy(e.target.value); emit('analytics:bridge_setup', { event: 'expert_sort_change', sortBy: e.target.value }); e.target.blur(); }}>
                <option value="recommended">Recommended</option>
                <option value="time">Shortest time</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
            <div className="bbs-upnext-list">
              {expertModePackData.length > 0 ? (
                expertModePackData.slice(0, 20).map(pd => (
                  <PackRow key={pd.id} packModel={pd}
                    modeOverride={modeOverrides[pd.id] || null}
                    onDotClick={handleDotClick} onPlay={handlePlayPack} compact entryPoint="expert_browse" />
                ))
              ) : (
                <div className="bbs-empty-state">No packs match your search. Adjust filters to find more lessons.</div>
              )}
            </div>
          </div>
        )}

        {activeSubview === null && (
          <div className="bbs-guided">
            {!Object.values(packCompletions).some(c => c.quizMastered || c.sentenceReady) && (
              <div className="bbs-skill-check-banner">
                <span className="material-symbols-outlined bbs-skill-check-icon">quiz</span>
                <div className="bbs-skill-check-text">
                  <span className="bbs-skill-check-title">{`Already know some ${languageName}?`}</span>
                  <span className="bbs-skill-check-sub">Take a quick skill check to unlock packs you've mastered</span>
                </div>
                <button type="button" className="bbs-skill-check-btn" onClick={() => setShowSkillCheck(true)}>
                  Start
                </button>
              </div>
            )}
            {quizResult && (
              <div className="bbs-quiz-result-banner">
                <span className="material-symbols-outlined" style={{ fontSize: 18, flexShrink: 0 }}>star</span>
                <span className="bbs-quiz-result-text">
                  {quizResult.type === 'pack' ? (
                    <>
                      {quizResult.correctWordCount > 0
                        ? `${quizResult.correctWordCount}/${quizResult.testedWordCount} word${quizResult.testedWordCount !== 1 ? 's' : ''} confirmed in ${quizResult.packTitle}`
                        : `Word check complete for ${quizResult.packTitle} — keep practicing!`}
                      {quizResult.sentenceReady && (
                        <span className="bbs-quiz-result-detail"> · Now sentence-ready!</span>
                      )}
                    </>
                  ) : (
                    <>
                      {quizResult.correctWordCount > 0
                        ? `${quizResult.correctWordCount} word${quizResult.correctWordCount !== 1 ? 's' : ''} confirmed from your skill check`
                        : 'Skill check complete — keep practicing to confirm more words!'}
                      {quizResult.sentenceReadyPackTitles?.length > 0 && (
                        <span className="bbs-quiz-result-detail">
                          {` · Ready for sentence practice: ${quizResult.sentenceReadyPackTitles.join(', ')}`}
                        </span>
                      )}
                    </>
                  )}
                </span>
                <button type="button" className="bbs-quiz-result-dismiss" onClick={() => setQuizResult(null)}>✕</button>
              </div>
            )}
            {displayModel.sections.map((sectionModel) => {
              const isExpanded = expandedSections.has(sectionModel.id);
              return (
                <div key={sectionModel.id} className="bbs-hub-wrap">
                  <SectionHubCard
                    sectionModel={sectionModel}
                    isExpanded={isExpanded}
                    onToggleExpand={() => handleToggleSection(sectionModel.id)}
                    onLaunchRecommended={() => handleLaunchRecommendedForSection(sectionModel)}
                    expandedContent={isExpanded ? (
                      <SectionBlock
                        panelId={`bbs-section-panel-${sectionModel.id}`}
                        sectionModel={sectionModel}
                        activePackId={activePackId}
                        expandedPack={expandedPack}
                        onTogglePack={handleTogglePack}
                        onLaunch={handleLaunchPackMethod}
                        onQuizLaunch={handlePackQuizLaunch}
                        hideHeader
                      />
                    ) : null}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
