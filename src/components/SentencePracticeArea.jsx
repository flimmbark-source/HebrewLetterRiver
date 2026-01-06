import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  getNextSentenceIndex,
  getSentenceProgress,
  recordSentenceResult
} from '../lib/sentenceProgressStorage.ts';
import WordHelperModal from './WordHelperModal.jsx';

function SentenceWordSpan({ word, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(word)}
      className="px-1 py-0.5 text-xl font-semibold text-slate-800 underline decoration-dotted decoration-amber-500"
      style={{ lineHeight: '2.25rem' }}
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
        <span key={`gap-${idx}`} className="text-xl text-slate-800">
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
      <span key="tail" className="text-xl text-slate-800">
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
  const [grade, setGrade] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [hintText, setHintText] = useState('');
  const [listeningMode, setListeningMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('sentenceListeningMode');
    return stored === 'true';
  });
  const [audioAttempted, setAudioAttempted] = useState(false);

  useEffect(() => {
    const nextIndex = getNextSentenceIndex(theme, sentences);
    setCurrentIndex(nextIndex);
  }, [theme, sentences]);

  const currentSentence = useMemo(
    () => (currentIndex >= 0 && currentIndex < sentences.length ? sentences[currentIndex] : null),
    [currentIndex, sentences]
  );

  useEffect(() => {
    setUserResponse('');
    setGrade(null);
    setShowAnswer(false);
    setSelectedWord(null);
    setHintText('');
    setAudioAttempted(false);
  }, [currentIndex]);

  useEffect(() => {
    localStorage.setItem('sentenceListeningMode', String(listeningMode));
  }, [listeningMode]);

  const handleGrade = (result) => {
    if (!currentSentence) return;
    setGrade(result);
    recordSentenceResult(currentSentence.theme, currentSentence.id, result);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % sentences.length;
    setCurrentIndex(nextIndex);
  };

  const handleWordBankClick = (token) => {
    setUserResponse((prev) => (prev ? `${prev} ${token}` : token));
  };

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
  const wordBank = isGuided ? currentSentence.english.split(/\s+/) : [];
  const progress = getSentenceProgress(currentSentence.theme, currentSentence.id);

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
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-amber-50 p-4 text-center shadow-sm">
          <div className="flex flex-wrap justify-center gap-1" dir="rtl">
            {buildSentenceNodes(currentSentence, setSelectedWord)}
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
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {wordBank.map((token, idx) => (
                <button
                  key={`${token}-${idx}`}
                  type="button"
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-800 hover:bg-slate-200"
                  onClick={() => handleWordBankClick(token)}
                >
                  {token}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder={t('read.sentence.guidedPlaceholder')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none"
            />
          </div>
        ) : (
          <textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder={t('read.sentence.freeResponsePlaceholder')}
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-amber-400 focus:outline-none"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setShowAnswer((prev) => !prev)}
          className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          {showAnswer ? t('reading.hideAnswer') : t('reading.showAnswer')}
        </button>
        <div className="flex items-center gap-2">
          {['correct', 'partial', 'incorrect'].map((result) => (
            <button
              key={result}
              type="button"
              onClick={() => handleGrade(result)}
              className={`rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-colors ${
                grade === result
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              {t(`read.sentence.grade.${result}`)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleNext}
          className="ml-auto rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700"
        >
          {t('read.sentence.next')}
        </button>
      </div>

      {showAnswer && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
          <p className="font-semibold">{t('reading.answer')}:</p>
          <p>{currentSentence.english}</p>
        </div>
      )}

      <WordHelperModal
        word={selectedWord}
        practiceLanguageId={practiceLanguageId}
        appLanguageId={appLanguageId}
        onClose={() => setSelectedWord(null)}
        onUseHint={(hint) => setHintText(hint)}
        t={t}
      />
    </div>
  );
}

SentencePracticeArea.propTypes = {
  theme: PropTypes.string.isRequired,
  sentences: PropTypes.arrayOf(PropTypes.object).isRequired,
  onExit: PropTypes.func.isRequired
};
