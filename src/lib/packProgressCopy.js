import { getPackById } from '../data/bridgeBuilderPacks.js';

const MODE_KEYS = ['bridgeBuilderComplete', 'loosePlanksComplete', 'deepScriptComplete'];

function pluralizeWord(count, noun) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function formatPackRef(packId) {
  const required = getPackById(packId);
  if (required?.title) return required.title;
  return (packId || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildPackProgressCopy({
  pack,
  progress,
  completion,
  isUnlocked = true,
  isGatingEnforced = false,
  dueReviewCount = 0,
}) {
  const totalWords = progress?.totalWords ?? pack?.wordIds?.length ?? 0;
  const wordsIntroduced = progress?.wordsIntroducedCount ?? 0;
  const modesComplete = MODE_KEYS.filter((key) => completion?.[key]).length;
  const totalModes = MODE_KEYS.length;
  const sentenceReady = !!completion?.sentenceReady;
  const mastered = modesComplete >= totalModes;
  const started =
    wordsIntroduced > 0 || modesComplete > 0 || !!completion?.quizMastered || sentenceReady;
  const hardLocked = !isUnlocked && isGatingEnforced;

  let stageLabel = 'New';
  if (hardLocked) stageLabel = 'Locked';
  else if (mastered) stageLabel = 'Mastered';
  else if (started) stageLabel = 'Started';

  const wordsIntroducedLabel = `${wordsIntroduced} of ${totalWords} words introduced`;
  const modesCompleteLabel = `${modesComplete} of ${totalModes} modes complete`;
  const reviewDueLabel = dueReviewCount > 0 ? `Review due: ${pluralizeWord(dueReviewCount, 'word')}` : null;
  const sentenceReadyLabel = sentenceReady ? 'Sentence-ready' : null;

  let unlockReasonLabel = null;
  if (hardLocked) {
    unlockReasonLabel = pack?.unlockAfter
      ? `Unlocks after ${formatPackRef(pack.unlockAfter)}`
      : 'Locked';
  } else if (pack?.unlockAfter && !started) {
    unlockReasonLabel = `Suggested after ${formatPackRef(pack.unlockAfter)}`;
  }

  const primaryLabel = reviewDueLabel || wordsIntroducedLabel;
  const secondaryLabel = modesCompleteLabel;

  return {
    stageLabel,
    stageTone: hardLocked ? 'locked' : mastered ? 'completed' : started ? 'progress' : 'new',
    wordsIntroducedLabel,
    modesCompleteLabel,
    reviewDueLabel,
    sentenceReadyLabel,
    unlockReasonLabel,
    primaryLabel,
    secondaryLabel,
    isMastered: mastered,
    isStarted: started,
    isHardLocked: hardLocked,
  };
}
