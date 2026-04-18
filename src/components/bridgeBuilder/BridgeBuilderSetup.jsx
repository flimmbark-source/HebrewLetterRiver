import React, { useMemo, useState, useCallback } from 'react';
import { getSectionsInOrder } from '../../data/bridgeBuilderSections.js';
import { getPacksBySection } from '../../data/bridgeBuilderPacks.js';
import {
  getAllWordProgress,
  getPackProgress,
  isPackUnlocked,
  getSectionProgress,
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
import SkillCheckScreen from '../SkillCheckScreen.jsx';
import { bridgeBuilderWords, getWordsByIds } from '../../data/bridgeBuilderWords.js';
import { allSentences } from '../../data/sentences/index.ts';
import { applyQuizMastery } from '../../lib/quizMastery.js';
import { getLanguageName } from '../../lib/vocabLanguageAdapter.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import './BridgeBuilderSetup.css';

// Quiz vocab pool: difficulty ≤ 2 words, computed once at module load
const QUIZ_VOCAB_WORDS = bridgeBuilderWords.filter((w) => w.difficulty <= 2);
// Quiz sentence pool: difficulty-1 sentences
const QUIZ_SENTENCES = allSentences.filter((s) => s.difficulty === 1);

/* ─── Section visual metadata ──────────────────────────────── */

const SECTION_META = {
  foundations: { icon: 'school', accent: 'primary' },
  daily_life: { icon: 'home', accent: 'secondary' },
  people_social: { icon: 'groups', accent: 'tertiary' },
  meaning_builders: { icon: 'auto_stories', accent: 'primary' },
  cafe_talk: { icon: 'coffee', accent: 'secondary' },
};

function getSectionMeta(sectionId) {
  return SECTION_META[sectionId] || { icon: 'category', accent: 'primary' };
}

/* ─── Status helpers ─────────────────────────────────────── */

function getPackStatusInfo(progress, unlocked) {
  if (!unlocked) return { label: 'Locked', modifier: 'locked' };
  if (progress.completed) return { label: 'Done', modifier: 'completed' };
  if (progress.wordsIntroducedCount > 0) return { label: 'Started', modifier: 'progress' };
  return { label: 'New', modifier: 'new' };
}

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

/* ─── Support line ───────────────────────────────────────── */

function buildSupportLine(pack, progress, completion) {
  const comp = completion || { loosePlanksComplete: false, deepScriptComplete: false };
  const level = getCompletionLevel(comp);

  if (level === 'full') return 'Complete';

  const parts = [];
  if (level === 'partial') {
    const done = comp.loosePlanksComplete ? 'Planks' : 'Deep Script';
    parts.push(`${done} done`);
  }

  const newCount = pack.targetsNewCount || pack.wordIds.length;
  const introduced = progress.wordsIntroducedCount || 0;
  const remaining = Math.max(0, newCount - introduced);
  if (remaining > 0) parts.push(`${remaining} new`);
  else if (parts.length === 0) parts.push(`${newCount} words`);

  if (parts.length === 0 && pack.estimatedTimeSec) parts.push(formatEstimatedMinutes(pack.estimatedTimeSec));

  return parts.join(' \u00b7 ');
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

/* ─── Snake pattern: determines horizontal position ──────── */
// Nodes snake: left, center, right, center, left, center, right …
// This creates the S-curve / winding path feel.
const SNAKE_POSITIONS = ['left', 'center', 'right', 'center'];
function getSnakePosition(index) {
  return SNAKE_POSITIONS[index % SNAKE_POSITIONS.length];
}

/* ═══════════════════════════════════════════════════════════
   PathNode — a single node on the winding path
   ═══════════════════════════════════════════════════════════ */

function PathNode({ pack, progress, unlocked, isCurrent, isExpanded, lastMethod, position, onToggle, onLaunch, onQuizLaunch, accent, completion }) {
  const defaultCompletion = { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };
  const comp = completion || defaultCompletion;
  const state = getNodeState(progress, unlocked, isCurrent, comp);
  const completionLevel = unlocked ? getCompletionLevel(comp) : 'none';
  const support = buildSupportLine(pack, progress, comp);

  const handleLaunch = (method) => {
    if (!unlocked) return;
    onLaunch(pack, method);
  };

  // Node icon
  let icon;
  if (state === 'locked') icon = 'lock';
  else if (state === 'completed') icon = 'check';
  else if (state === 'current') icon = 'play_arrow';
  else icon = 'radio_button_unchecked';

  const nodeCls = `bbs-node bbs-node--${state} bbs-node--${position}`;

  return (
    <div className={`bbs-node-cell bbs-node-cell--${position}`}>
      <div className={isExpanded ? `${nodeCls} bbs-node--expanded` : nodeCls}>
        <button
          type="button"
          className="bbs-node-btn"
          onClick={() => unlocked && onToggle(pack.id)}
          disabled={!unlocked}
          aria-label={`${pack.title} — ${support}`}
        >
          <span className={`bbs-node-circle bbs-node-circle--${state} bbs-node-circle--${accent}`}>
            <span className="material-symbols-outlined bbs-node-icon">{icon}</span>
          </span>
          {unlocked && state !== 'locked' && (
            <span className="bbs-completion-pips" aria-label={completionLevel === 'full' ? 'Fully completed' : completionLevel === 'partial' ? 'Partially completed' : 'Not completed'}>
              <span className={`bbs-completion-pip ${comp.loosePlanksComplete ? 'bbs-completion-pip--done' : ''}`} title="Planks" />
              <span className={`bbs-completion-pip ${comp.deepScriptComplete ? 'bbs-completion-pip--done' : ''}`} title="Deep Script" />
            </span>
          )}
        </button>
        <div className="bbs-node-label">
          <span className="bbs-node-title">{pack.title}</span>
          <span className="bbs-node-support">{support}</span>
          {(comp.quizMastered || comp.sentenceReady) && (
            <span className="bbs-quiz-badge" title="Covered in skill check quiz">✦ Quiz</span>
          )}
        </div>
      </div>

      {/* Study method chooser — appears below the node */}
      {isExpanded && (
        <div className="bbs-chooser">
          {pack.description && <p className="bbs-chooser-desc">{pack.description}</p>}
          <button
            type="button"
            className={`bbs-method ${lastMethod === 'vocab' ? 'bbs-method--last' : ''}`}
            onClick={() => handleLaunch('vocab')}
          >
            <span className="material-symbols-outlined bbs-method-ic">conversion_path</span>
            <div className="bbs-method-text">
              <span className="bbs-method-name">
                {lastMethod === 'vocab' ? 'Continue Vocab Builder' : 'Vocab Builder'}
              </span>
              <span className="bbs-method-sub">Structured pack practice</span>
            </div>
            <span className="material-symbols-outlined bbs-method-go">arrow_forward</span>
          </button>
          <button
            type="button"
            className={`bbs-method ${lastMethod === 'deep_script' ? 'bbs-method--last' : ''}`}
            onClick={() => handleLaunch('deep_script')}
          >
            <span className="material-symbols-outlined bbs-method-ic">ink_pen</span>
            <div className="bbs-method-text">
              <span className="bbs-method-name">
                {lastMethod === 'deep_script' ? 'Continue Deep Script' : 'Deep Script Floor'}
              </span>
              <span className="bbs-method-sub">A dungeon floor built from this pack</span>
            </div>
            <span className="material-symbols-outlined bbs-method-go">arrow_forward</span>
          </button>
          {pack.wordIds.length >= 4 && (
            <button
              type="button"
              className={`bbs-method bbs-method--quiz`}
              onClick={() => unlocked && onQuizLaunch(pack)}
              disabled={!unlocked}
            >
              <span className="material-symbols-outlined bbs-method-ic">quiz</span>
              <div className="bbs-method-text">
                <span className="bbs-method-name">Quick Word Check</span>
                <span className="bbs-method-sub">Already know these? Skip the intro</span>
              </div>
              <span className="material-symbols-outlined bbs-method-go">arrow_forward</span>
            </button>
          )}
          {lastMethod && (
            <div className="bbs-chooser-hint">
              Last used: {lastMethod === 'deep_script' ? 'Deep Script' : 'Vocab Builder'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SVG connector between two adjacent nodes
   ═══════════════════════════════════════════════════════════ */

function PathConnector({ fromPos, toPos, state }) {
  // state: 'done' | 'pending'
  // Each cell is laid out on a 3-column grid.
  // Positions map to x%: left=20%, center=50%, right=80%
  const xMap = { left: 20, center: 50, right: 80 };
  const x1 = xMap[fromPos];
  const x2 = xMap[toPos];

  return (
    <div className="bbs-connector">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="bbs-connector-svg">
        <path
          d={`M ${x1} 0 C ${x1} 20, ${x2} 20, ${x2} 40`}
          className={`bbs-connector-line bbs-connector-line--${state}`}
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SectionBlock — always-visible section with winding path
   ═══════════════════════════════════════════════════════════ */

function SectionBlock({ section, sectionProgress, unlocked, packData, activePackId, expandedPack, lastMethods, onTogglePack, onLaunch, onQuizLaunch }) {
  const { packsCompleted, totalPacks } = sectionProgress;
  const meta = getSectionMeta(section.id);
  const accent = meta.accent;
  const progressPct = totalPacks > 0 ? (packsCompleted / totalPacks) * 100 : 0;

  return (
    <div className={`bbs-block ${!unlocked ? 'bbs-block--locked' : ''}`}>
      {/* Section header */}
      <div className="bbs-block-header">
        <div className={`bbs-block-icon bbs-block-icon--${accent}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{meta.icon}</span>
        </div>
        <div className="bbs-block-info">
          <div className="bbs-block-top">
            <h3 className="bbs-block-title">{section.title}</h3>
            <span className={`bbs-block-count bbs-block-count--${accent}`}>
              {unlocked ? `${packsCompleted}/${totalPacks}` : `${totalPacks} packs`}
            </span>
          </div>
          <p className="bbs-block-desc">{section.description}</p>
          <div className="bbs-block-bar">
            <div className="bbs-block-track">
              <div className={`bbs-block-fill bbs-block-fill--${accent}`} style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Winding pack path */}
      <div className="bbs-path">
        {packData.map((pd, idx) => {
          const pos = getSnakePosition(idx);
          const nextPos = idx < packData.length - 1 ? getSnakePosition(idx + 1) : null;
          const connectorState = getCompletionLevel(pd.completion || {}) === 'full' ? 'done' : 'pending';

          return (
            <React.Fragment key={pd.pack.id}>
              <PathNode
                pack={pd.pack}
                progress={pd.progress}
                unlocked={pd.unlocked}
                isCurrent={pd.pack.id === activePackId}
                isExpanded={expandedPack === pd.pack.id}
                lastMethod={lastMethods[pd.pack.id] || null}
                position={pos}
                onToggle={onTogglePack}
                onLaunch={onLaunch}
                onQuizLaunch={onQuizLaunch}
                accent={accent}
                completion={pd.completion}
              />
              {nextPos && (
                <PathConnector fromPos={pos} toPos={nextPos} state={connectorState} />
              )}
            </React.Fragment>
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

function PackRow({ pack, progress, unlocked, completion, modeOverride, onDotClick, onPlay, compact = false, entryPoint = 'guided' }) {
  const { completed } = progress;
  const statusInfo = getPackStatusInfo(progress, unlocked);
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
  let rowCls = 'bbs-pack-row';
  if (!unlocked) rowCls += ' bbs-pack-row--locked';
  return (
    <div className={rowCls}>
      <div className={`bbs-pack-row-icon ${compact ? 'bbs-pack-row-icon--compact' : ''}`}>
        <span className="bbs-pack-row-emoji">{!unlocked ? '\ud83d\udd12' : completed ? '\u2705' : '\ud83d\udce6'}</span>
      </div>
      <div className="bbs-pack-row-body">
        <div className="bbs-pack-row-top">
          <span className="bbs-pack-row-title">{pack.title}</span>
          <span className={`bbs-status-pill bbs-status-pill--${statusInfo.modifier}`}>{statusInfo.label}</span>
        </div>
        {!compact && <div className="bbs-pack-row-subtitle">{pack.description}</div>}
        <div className="bbs-pack-meta">
          <span className="bbs-pack-chip">{pack.primaryType || 'mixed'}</span>
          <span className="bbs-pack-chip">{pack.difficultyBand || 'Core'}</span>
          <span className="bbs-pack-chip">{pack.targetsNewCount || pack.wordIds.length} new</span>
          <span className="bbs-pack-chip">{pack.supportReviewCount || 0} review</span>
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

/* ─── Review Card ────────────────────────────────────────── */

function ReviewCard({ dueCount, weakCount, onPlay }) {
  const available = dueCount > 0 || weakCount > 0;
  return (
    <div className="bbs-review-wrap">
      <div className={`bbs-review-card ${!available ? 'bbs-review-card--disabled' : ''}`}>
        <div className="bbs-review-icon-wrap">
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--m3-primary)', fontVariationSettings: "'FILL' 1" }}>casino</span>
        </div>
        <div className="bbs-review-info">
          <h3 className="bbs-review-title">Review Due Now</h3>
          <p className="bbs-review-desc">
            {available ? `${dueCount} due \u00b7 ${weakCount} weak items` : 'Complete a pack first to unlock review.'}
          </p>
        </div>
        <button type="button" className="bbs-review-btn" onClick={() => available && onPlay()} disabled={!available}>
          Start Due Review
        </button>
      </div>
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

  const sectionData = useMemo(() => {
    const allPacks = sections.flatMap(s => getPacksBySection(s.id));
    return sections.map(section => {
      const packs = getPacksBySection(section.id);
      const sectionProgress = getSectionProgress(section, packs, allProgress, packCompletions);
      const unlocked = isSectionUnlocked(section, sections, allPacks, allProgress);
      const packData = packs.map(pack => ({
        pack,
        progress: getPackProgress(pack, allProgress),
        unlocked: unlocked && isPackUnlocked(pack, packs, allProgress),
        completion: packCompletions[pack.id] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false },
      }));
      return { section, sectionProgress, unlocked, packData };
    });
  }, [sections, allProgress, packCompletions]);

  const activePackId = useMemo(() => {
    for (const sd of sectionData) {
      for (const pd of sd.packData) {
        if (pd.unlocked && pd.progress.wordsIntroducedCount > 0 && !pd.progress.completed) return pd.pack.id;
      }
    }
    for (const sd of sectionData) {
      for (const pd of sd.packData) {
        if (pd.unlocked && !pd.progress.completed) return pd.pack.id;
      }
    }
    return null;
  }, [sectionData]);

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

  const handleSkillCheckComplete = useCallback(({ breakdown, evidence }) => {
    const { correctWordIds, sentenceReadyPackIds } = applyQuizMastery(evidence, breakdown);
    setProgressRevision((r) => r + 1);
    setShowSkillCheck(false);

    if (packQuizTarget) {
      setQuizResult({
        type: 'pack',
        packTitle: packQuizTarget.title,
        correctWordCount: correctWordIds.length,
        testedWordCount: packQuizTarget.wordIds.length,
        sentenceReady: sentenceReadyPackIds.includes(packQuizTarget.id),
      });
      setPackQuizTarget(null);
    } else {
      setQuizResult({ type: 'global', correctWordCount: correctWordIds.length, sentenceReadyPackIds });
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

  const allUnlockedPackData = useMemo(() => sectionData.flatMap(sd => sd.packData).filter(pd => pd.unlocked), [sectionData]);
  const goalModePackData = useMemo(() => allUnlockedPackData.filter(pd => matchesGoal(pd.pack, goalFilter)), [allUnlockedPackData, goalFilter]);
  const expertModePackData = useMemo(() => {
    const filtered = allUnlockedPackData.filter(pd => matchesQuery(pd.pack, query));
    return sortPackData(filtered, sortBy);
  }, [allUnlockedPackData, query, sortBy]);

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
              {goalModePackData.slice(0, 12).map(pd => (
                <PackRow key={pd.pack.id} pack={pd.pack} progress={pd.progress} unlocked={pd.unlocked}
                  completion={pd.completion} modeOverride={modeOverrides[pd.pack.id] || null}
                  onDotClick={handleDotClick} onPlay={handlePlayPack} compact entryPoint="goal_browse" />
              ))}
            </div>
          </div>
        )}

        {activeSubview === 'expert' && (
          <div className="bbs-mode-panel">
            <h3 className="bbs-mode-title">Search & filter your library</h3>
            <button type="button" className="bbs-subview-close" onClick={() => setActiveSubview(null)}>Back to guided</button>
            <div className="bbs-expert-controls">
              <input type="search" className="bbs-search" placeholder="Search packs or goals" value={query}
                onChange={(e) => { setQuery(e.target.value); emit('analytics:bridge_setup', { event: 'expert_search_change', queryLength: e.target.value.length }); }} />
              <select className="bbs-sort" value={sortBy} onChange={(e) => { setSortBy(e.target.value); emit('analytics:bridge_setup', { event: 'expert_sort_change', sortBy: e.target.value }); e.target.blur(); }}>
                <option value="recommended">Recommended</option>
                <option value="time">Shortest time</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
            <div className="bbs-upnext-list">
              {expertModePackData.slice(0, 20).map(pd => (
                <PackRow key={pd.pack.id} pack={pd.pack} progress={pd.progress} unlocked={pd.unlocked}
                  completion={pd.completion} modeOverride={modeOverrides[pd.pack.id] || null}
                  onDotClick={handleDotClick} onPlay={handlePlayPack} compact entryPoint="expert_browse" />
              ))}
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
                      {quizResult.sentenceReadyPackIds?.length > 0 && (
                        <span className="bbs-quiz-result-detail">
                          {` · ${quizResult.sentenceReadyPackIds.length} pack${quizResult.sentenceReadyPackIds.length !== 1 ? 's' : ''} now sentence-ready`}
                        </span>
                      )}
                    </>
                  )}
                </span>
                <button type="button" className="bbs-quiz-result-dismiss" onClick={() => setQuizResult(null)}>✕</button>
              </div>
            )}
            {sectionData.map(({ section, sectionProgress, unlocked, packData }) => (
              <SectionBlock
                key={section.id}
                section={section}
                sectionProgress={sectionProgress}
                unlocked={unlocked}
                packData={packData}
                activePackId={activePackId}
                expandedPack={expandedPack}
                lastMethods={lastMethods}
                onTogglePack={handleTogglePack}
                onLaunch={handleLaunchPackMethod}
                onQuizLaunch={handlePackQuizLaunch}
              />
            ))}
          </div>
        )}

        <ReviewCard dueCount={dueReviewWordIds.length} weakCount={weakWordIds.length} onPlay={handlePlayReview} />
      </div>
    </div>
    </>
  );
}
