import { useEffect, useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  getNextSentenceIndex,
  getSentenceProgress,
  recordSentenceResult
} from '../lib/sentenceProgressStorage.ts';
import WordHelperModal from './WordHelperModal.jsx';
import SentenceIntroPopup from './SentenceIntroPopup.jsx';
import { useSentenceIntro } from '../hooks/useSentenceIntro.js';

function normalizeWord(word) {
  return word
    .toLowerCase()
    .replace(/[.,!?;:'"()\[\]]/g, '')
    .trim();
}

function tokenizeSentence(sentence) {
  return sentence
    .split(/\s+/)
    .map(normalizeWord)
    .filter(Boolean);
}

function longestCommonSubsequenceLength(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[a.length][b.length];
}

function evaluateTranslation(correctSentence, response) {
  const expectedWords = correctSentence.split(/\s+/);
  const expectedTokens = tokenizeSentence(correctSentence);
  const userTokens = tokenizeSentence(response);

  const tokenCounts = expectedTokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});

  let matchedCount = 0;
  const remainingCounts = { ...tokenCounts };

  userTokens.forEach((token) => {
    if (remainingCounts[token] > 0) {
      matchedCount += 1;
      remainingCounts[token] -= 1;
    }
  });

  const contentScore = expectedTokens.length > 0 ? matchedCount / expectedTokens.length : 0;
  const orderScore = expectedTokens.length > 0
    ? longestCommonSubsequenceLength(expectedTokens, userTokens) / expectedTokens.length
    : 0;

  const blendedScore = (contentScore * 0.7) + (orderScore * 0.3);
  const status = blendedScore >= 0.85 ? 'correct' : blendedScore >= 0.55 ? 'partial' : 'incorrect';

  const tempCounts = { ...tokenCounts };
  const evaluations = expectedWords.map((word) => {
    const token = normalizeWord(word);
    const isMatch = tempCounts[token] > 0;
    if (isMatch) {
      tempCounts[token] -= 1;
    }
    return { word, isMatch };
  });

  return {
    evaluations,
    status,
    correctCount: matchedCount,
    total: expectedTokens.length
  };
}

function SentenceWordSpan({ word, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(word)}
      className="px-1 py-0.5 text-lg font-semibold text-slate-800 underline decoration-dotted decoration-amber-500 whitespace-nowrap transition-all hover:scale-105 hover:text-amber-700"
      style={{ lineHeight: '1.75rem' }}
    >
      {word.surface || word.hebrew}
    </button>
  );
}

SentenceWordSpan.propTypes = {
  word: PropTypes.shape({
    hebrew: PropTypes.string.isRequired,
    surface: PropTypes.string,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

function buildSentenceNodes(sentence, onWordClick) {
  const nodes = [];
  let cursor = 0;

  sentence.words.forEach((word, idx) => {
    if (word.start > cursor) {
      const between = sentence.hebrew.slice(cursor, word.start);
      nodes.push(
        <span key={`gap-${idx}`} className="text-lg text-slate-800 whitespace-nowrap">
          {between}
        </span>
      );
    }

    nodes.push(
      <SentenceWordSpan key={`word-${idx}`} word={word} onClick={onWordClick} />
    );
    cursor = word.end + 1;
  });

  if (cursor < sentence.hebrew.length) {
    nodes.push(
      <span key="tail" className="text-lg text-slate-800 whitespace-nowrap">
        {sentence.hebrew.slice(cursor)}
      </span>
    );
  }

  return nodes;
}

export default function SentencePracticeArea({ theme, sentences, onExit }) {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(() => getNextSentenceIndex(theme, sentences));
  const [userResponse, setUserResponse] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [responses, setResponses] = useState([]);
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [hintText, setHintText] = useState('');
  const [listeningMode, setListeningMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('sentenceListeningMode');
    return stored === 'true';
  });
  const [audioAttempted, setAudioAttempted] = useState(false);

  // Refs for viewport/track structure
  const sentenceViewportRef = useRef(null);
  const sentenceTrackRef = useRef(null);

  // Sentence introduction popup hook
  const sentenceIntro = useSentenceIntro({
    sentence: currentSentence,
    practiceLanguageId,
    appLanguageId,
    t,
    enabled: !showResultsScreen
  });

  useEffect(() => {
    const nextIndex = getNextSentenceIndex(theme, sentences);
    setCurrentIndex(nextIndex);
    setResponses([]);
    setShowResultsScreen(false);
  }, [theme, sentences]);

  const currentSentence = useMemo(
    () => (currentIndex >= 0 && currentIndex < sentences.length ? sentences[currentIndex] : null),
    [currentIndex, sentences]
  );

  useEffect(() => {
    setUserResponse('');
    setEvaluation(null);
    setSelectedWord(null);
    setHintText('');
    setAudioAttempted(false);
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('sentenceListeningMode', String(listeningMode));
  }, [listeningMode]);

  const progress = currentSentence
    ? getSentenceProgress(currentSentence.theme, currentSentence.id)
    : null;

  const handleGrade = () => {
    if (!currentSentence) return;
    const nextEvaluation = evaluateTranslation(currentSentence.english, userResponse);
    setEvaluation(nextEvaluation);
    recordSentenceResult(currentSentence.theme, currentSentence.id, nextEvaluation.status);
    setResponses((prev) => {
      const filtered = prev.filter((entry) => entry.sentenceId !== currentSentence.id);
      return [
        ...filtered,
        {
          sentenceId: currentSentence.id,
          sentenceIndex: currentIndex,
          userResponse: userResponse.trim(),
          result: nextEvaluation.status,
          correctSentence: currentSentence.english
        }
      ];
    });
  };

  const handleNext = () => {
    if (currentIndex === sentences.length - 1) {
      setShowResultsScreen(true);
      return;
    }
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
  };

  const handleRestart = () => {
    setResponses([]);
    setShowResultsScreen(false);
    setCurrentIndex(0);
  };

  if (showResultsScreen) {
    const sortedResponses = [...responses].sort((a, b) => a.sentenceIndex - b.sentenceIndex);
    const correctCount = sortedResponses.filter((entry) => entry.result === 'correct').length;
    const partialCount = sortedResponses.filter((entry) => entry.result === 'partial').length;
    const incorrectCount = sortedResponses.filter((entry) => entry.result === 'incorrect').length;

    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('reading.back')}
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700"
          >
            {t('read.sentence.restartCard', 'Restart card')}
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-800">
            {t('read.sentence.resultsTitle', 'Sentence practice results')}
          </h3>
          <p className="text-sm text-slate-600">
            {t('read.sentence.resultsSummary', 'You finished this card! Here is how you did.')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
            {t('read.sentence.grade.correct')}: {correctCount}
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
            {t('read.sentence.grade.partial')}: {partialCount}
          </span>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-800">
            {t('read.sentence.grade.incorrect')}: {incorrectCount}
          </span>
        </div>

        <div className="space-y-3">
          {sortedResponses.map((entry) => (
            <div
              key={entry.sentenceId}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  {t('read.sentence.translationPrompt')} #{entry.sentenceIndex + 1}
                </p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    entry.result === 'correct'
                      ? 'bg-emerald-100 text-emerald-800'
                      : entry.result === 'partial'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {t(`read.sentence.grade.${entry.result}`)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">{t('reading.answer')}:</span> {entry.correctSentence}
              </p>
              <p className="text-xs text-slate-600">
                <span className="font-semibold text-slate-700">
                  {t('read.sentence.yourAnswerLabel', 'Your answer')}:
                </span>{' '}
                {entry.userResponse || t('read.sentence.noResponse', 'No response')}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentSentence) {
    return (
      <div className="space-y-4 p-4">
        <p className="text-slate-700">{t('read.sentence.noSentence')}</p>
        <button
          type="button"
          onClick={onExit}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t('reading.back')}
        </button>
      </div>
    );
  }

  const isGuided = currentSentence.difficulty <= 2;
  const isGraded = Boolean(evaluation);
  const primaryAction = isGraded ? handleNext : handleGrade;
  const primaryLabel = isGraded ? t('read.sentence.next') : t('read.sentence.gradeAction', 'Grade');

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExit}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {t('reading.back')}
          </button>
          <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            {t('read.sentence.difficulty', { level: currentSentence.difficulty })}
          </div>
          {progress?.lastResult && (
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
              {t('read.sentence.lastResult', { result: progress.lastResult })}
            </div>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={listeningMode}
            onChange={(e) => setListeningMode(e.target.checked)}
          />
          {t('read.sentence.listeningMode')}
        </label>
      </div>

      {listeningMode && !audioAttempted && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {t('read.sentence.listeningPending')}
          <button
            type="button"
            className="ml-3 text-amber-700 underline"
            onClick={() => setAudioAttempted(true)}
          >
            {t('read.sentence.showText')}
          </button>
        </div>
      )}

      {(!listeningMode || audioAttempted) && (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-amber-50 shadow-sm">
          <div
            ref={sentenceViewportRef}
            className="relative flex w-full min-w-0 items-center overflow-x-auto overflow-y-hidden px-4 py-4"
            style={{ minHeight: '72px' }}
          >
            <div
              ref={sentenceTrackRef}
              className="inline-flex items-center gap-2"
              dir="rtl"
            >
              {buildSentenceNodes(currentSentence, setSelectedWord)}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-800">{t('read.sentence.translationPrompt')}</p>
        {hintText && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {hintText}
          </div>
        )}
        {isGuided ? (
          <input
            type="text"
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            disabled={isGraded}
            placeholder={t('read.sentence.guidedPlaceholder')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        ) : (
          <textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            disabled={isGraded}
            placeholder={t('read.sentence.freeResponsePlaceholder')}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        )}
      </div>

      {evaluation && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold">{t('reading.answer')}:</p>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                evaluation.status === 'correct'
                  ? 'bg-emerald-100 text-emerald-800'
                  : evaluation.status === 'partial'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
              }`}
            >
              {t(`read.sentence.grade.${evaluation.status}`)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-base leading-relaxed">
            {evaluation.evaluations.map((entry, idx) => (
              <span
                key={`evaluation-${idx}`}
                className={`rounded-md px-2 py-1 font-medium ${
                  entry.isMatch ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}
              >
                {entry.word}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">{t('read.sentence.yourAnswerLabel', 'Your answer')}:</span>{' '}
            {userResponse || t('read.sentence.noResponse', 'No response')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={primaryAction}
          className="ml-auto rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700"
        >
          {primaryLabel}
        </button>
        {!isGraded && (
          <p className="text-xs text-slate-500">{t('read.sentence.gradeHint', 'Type your translation, then tap Grade')}</p>
        )}
      </div>

      <WordHelperModal
        word={selectedWord}
        practiceLanguageId={practiceLanguageId}
        appLanguageId={appLanguageId}
        onClose={() => setSelectedWord(null)}
        onUseHint={(hint) => setHintText(hint)}
        t={t}
      />

      {sentenceIntro.showPopup && (
        <SentenceIntroPopup {...sentenceIntro.popupProps} />
      )}
    </div>
  );
}

SentencePracticeArea.propTypes = {
  theme: PropTypes.string.isRequired,
  sentences: PropTypes.arrayOf(PropTypes.object).isRequired,
  onExit: PropTypes.func.isRequired
};
