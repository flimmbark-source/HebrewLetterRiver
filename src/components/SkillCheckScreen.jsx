import React, { useCallback, useMemo, useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getItemLabel(item) {
  return item.name || item.sound || item.id;
}

function getItemSymbol(item) {
  return item.symbol ?? item.hebrew ?? item.character ?? item.glyph ?? item.id;
}

/** Build letter-recognition questions from the language pack. */
function buildLetterQuestions(languagePack, count = 3) {
  const candidateItems = [
    ...(languagePack.items ?? []),
    ...(languagePack.allItems ?? []),
    ...(languagePack.consonants ?? []),
    ...(languagePack.basicConsonants ?? [])
  ];

  const seen = new Set();
  const unique = [];
  for (const item of candidateItems) {
    if (item?.id && !seen.has(item.id)) {
      seen.add(item.id);
      unique.push(item);
    }
  }

  if (unique.length < 4) return [];

  const selected = shuffleArray(unique).slice(0, count);

  return selected.map((correctItem) => {
    const distractors = shuffleArray(unique.filter((i) => i.id !== correctItem.id)).slice(0, 3);
    const choices = shuffleArray([correctItem, ...distractors]);
    return {
      type: 'letter',
      display: getItemSymbol(correctItem),
      prompt: 'What is this letter?',
      correctId: correctItem.id,
      choices: choices.map((c) => ({ id: c.id, label: getItemLabel(c) }))
    };
  });
}

/** Build vocabulary questions: show Hebrew word → pick English meaning. */
function buildVocabQuestions(words, count = 3) {
  if (!words || words.length < 4) return [];

  const pool = shuffleArray(words).slice(0, Math.max(count * 3, 12));
  const selected = pool.slice(0, count);

  return selected.map((correctWord) => {
    const distractors = shuffleArray(
      pool.filter((w) => w.id !== correctWord.id)
    ).slice(0, 3);
    const choices = shuffleArray([correctWord, ...distractors]);
    const correctMeaning = correctWord.translation || correctWord.meaning || correctWord.id;
    return {
      type: 'vocab',
      display: correctWord.hebrew || correctWord.nativeScript || correctWord.id,
      prompt: 'What does this word mean?',
      correctId: correctWord.id,
      choices: choices.map((c) => ({
        id: c.id,
        label: c.translation || c.meaning || c.id
      })),
      // Keep for potential display use
      correctMeaning
    };
  });
}

/** Build sentence questions: show Hebrew sentence → pick English translation. */
function buildSentenceQuestions(sentences, count = 2) {
  if (!sentences || sentences.length < 4) return [];

  // Prefer short/difficulty-1 sentences for the quiz
  const pool = shuffleArray(
    sentences.filter((s) => s.difficulty === 1)
  ).slice(0, Math.max(count * 3, 8));

  if (pool.length < 4) return [];

  const selected = pool.slice(0, count);

  return selected.map((correctSentence) => {
    const distractors = shuffleArray(
      pool.filter((s) => s.id !== correctSentence.id)
    ).slice(0, 3);
    const choices = shuffleArray([correctSentence, ...distractors]);
    return {
      type: 'sentence',
      display: correctSentence.hebrew,
      prompt: 'What does this sentence mean?',
      correctId: correctSentence.id,
      choices: choices.map((s) => ({
        id: s.id,
        label: s.english
      }))
    };
  });
}

/**
 * Build a mixed question set based on the requested types.
 * questionTypes: array of 'letter' | 'vocab' | 'sentence'
 */
function buildAllQuestions(languagePack, vocabWords, sentences, questionTypes = ['letter']) {
  const wantsLetters = questionTypes.includes('letter');
  const wantsVocab = questionTypes.includes('vocab');
  const wantsSentences = questionTypes.includes('sentence');

  // Determine per-type count based on what's requested
  let letterCount = 0;
  let vocabCount = 0;
  let sentenceCount = 0;

  if (wantsLetters && !wantsVocab && !wantsSentences) {
    letterCount = 5;
  } else if (wantsLetters && wantsVocab && !wantsSentences) {
    letterCount = 2;
    vocabCount = 3;
  } else if (wantsLetters && wantsVocab && wantsSentences) {
    letterCount = 2;
    vocabCount = 2;
    sentenceCount = 2;
  }

  const letterQs = wantsLetters ? buildLetterQuestions(languagePack, letterCount) : [];
  const vocabQs = wantsVocab ? buildVocabQuestions(vocabWords, vocabCount) : [];
  const sentenceQs = wantsSentences ? buildSentenceQuestions(sentences, sentenceCount) : [];

  // Interleave question types so the quiz feels varied
  const all = [];
  const maxLen = Math.max(letterQs.length, vocabQs.length, sentenceQs.length);
  for (let i = 0; i < maxLen; i++) {
    if (letterQs[i]) all.push(letterQs[i]);
    if (vocabQs[i]) all.push(vocabQs[i]);
    if (sentenceQs[i]) all.push(sentenceQs[i]);
  }

  return all;
}

function getTypeLabel(type) {
  if (type === 'vocab') return 'Vocabulary';
  if (type === 'sentence') return 'Sentence';
  return 'Letter';
}

/**
 * SkillCheckScreen
 *
 * Props:
 *   onComplete({ score, total, skillLevel, breakdown }) — called when all questions answered
 *   onSkip() — called when user skips
 *   questionTypes: string[] — which types to include: 'letter' | 'vocab' | 'sentence'
 *   vocabWords: object[] — word objects from bridgeBuilderWords (needed for 'vocab' type)
 *   sentences: object[] — sentence objects (needed for 'sentence' type)
 */
export default function SkillCheckScreen({ onComplete, onSkip, questionTypes = ['letter'], vocabWords = [], sentences = [] }) {
  const { languagePack } = useLocalization();
  const questions = useMemo(
    () => buildAllQuestions(languagePack, vocabWords, sentences, questionTypes),
    [languagePack, vocabWords, sentences, questionTypes]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [selectedId, setSelectedId] = useState(null);
  // Track per-type breakdown: { letter: {correct, total}, vocab: {correct, total}, sentence: {correct, total} }
  const [typeResults, setTypeResults] = useState({
    letter: { correct: 0, total: 0 },
    vocab: { correct: 0, total: 0 },
    sentence: { correct: 0, total: 0 }
  });

  const question = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;

  const handleAnswer = useCallback(
    (choiceId) => {
      if (feedback) return; // prevent double-tap
      setSelectedId(choiceId);
      const isCorrect = choiceId === question.correctId;
      const qType = question.type;

      if (isCorrect) setScore((prev) => prev + 1);

      // Update per-type tracking
      setTypeResults((prev) => ({
        ...prev,
        [qType]: {
          correct: prev[qType].correct + (isCorrect ? 1 : 0),
          total: prev[qType].total + 1
        }
      }));

      setFeedback(isCorrect ? 'correct' : 'incorrect');

      setTimeout(() => {
        setFeedback(null);
        setSelectedId(null);
        if (currentIndex + 1 >= totalQuestions) {
          const finalScore = isCorrect ? score + 1 : score;
          // Build final breakdown with this question included
          const finalBreakdown = {
            letter: { ...typeResults.letter },
            vocab: { ...typeResults.vocab },
            sentence: { ...typeResults.sentence }
          };
          finalBreakdown[qType] = {
            correct: typeResults[qType].correct + (isCorrect ? 1 : 0),
            total: typeResults[qType].total + 1
          };

          let skillLevel = 'beginner';
          if (finalScore >= Math.ceil(totalQuestions * 0.8)) skillLevel = 'advanced';
          else if (finalScore >= Math.ceil(totalQuestions * 0.4)) skillLevel = 'intermediate';

          onComplete({ score: finalScore, total: totalQuestions, skillLevel, breakdown: finalBreakdown });
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 800);
    },
    [feedback, question, currentIndex, totalQuestions, score, typeResults, onComplete]
  );

  if (!question) {
    // Not enough data — skip
    onSkip();
    return null;
  }

  // Determine display mode: letter/vocab show Hebrew in a box, sentence shows the sentence
  const isHebrewDisplay = question.type === 'letter' || question.type === 'vocab';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 animate-fade-in"
      style={{ background: 'var(--app-bg)' }}
    >
      <div
        className="animate-scale-in w-full max-w-lg rounded-3xl p-6 text-center sm:p-8"
        style={{
          background: 'var(--app-card-bg)',
          border: '1px solid var(--app-card-border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-bold sm:text-xl"
            style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}
          >
            Quick Skill Check
          </h2>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full px-4 py-1.5 text-sm font-semibold transition-colors"
            style={{ color: 'var(--app-muted)', background: 'var(--app-surface, transparent)' }}
          >
            Skip
          </button>
        </div>

        {/* Progress dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-full transition-all duration-300"
              style={{
                background:
                  i < currentIndex
                    ? 'var(--app-primary)'
                    : i === currentIndex
                      ? 'var(--app-primary)'
                      : 'var(--app-card-border)',
                opacity: i === currentIndex ? 1 : i < currentIndex ? 0.6 : 0.3,
                transform: i === currentIndex ? 'scale(1.3)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {/* Question type badge */}
        <div className="mt-4 flex justify-center">
          <span
            className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              background: 'var(--app-primary-container)',
              color: 'var(--app-primary)'
            }}
          >
            {getTypeLabel(question.type)}
          </span>
        </div>

        {/* Display area */}
        <div className="mt-6 mb-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
            {question.prompt}
          </p>
          {isHebrewDisplay ? (
            <div
              className="mx-auto flex min-h-[7rem] w-auto max-w-[14rem] items-center justify-center rounded-2xl px-4 py-3 font-bold shadow-lg"
              style={{
                background: 'var(--app-primary-container)',
                color: 'var(--app-primary)',
                border: '2px solid var(--app-primary)',
                fontSize: question.type === 'letter' ? '3.5rem' : '2rem',
                lineHeight: 1.2,
                direction: 'rtl'
              }}
            >
              {question.display}
            </div>
          ) : (
            /* Sentence: show Hebrew in a wider card */
            <div
              className="mx-auto flex min-h-[4rem] w-full items-center justify-center rounded-2xl px-5 py-4 font-bold shadow-lg"
              style={{
                background: 'var(--app-primary-container)',
                color: 'var(--app-primary)',
                border: '2px solid var(--app-primary)',
                fontSize: '1.35rem',
                lineHeight: 1.4,
                direction: 'rtl'
              }}
            >
              {question.display}
            </div>
          )}
        </div>

        {/* Answer choices */}
        <div className="grid grid-cols-2 gap-3">
          {question.choices.map((choice) => {
            let choiceStyle = {
              background: 'var(--app-surface, var(--app-card-bg))',
              border: '2px solid var(--app-card-border)',
              color: 'var(--app-on-surface)'
            };

            if (feedback && selectedId === choice.id) {
              if (feedback === 'correct') {
                choiceStyle = {
                  background: 'var(--app-mode-river-surface, #e8f5e9)',
                  border: '2px solid var(--app-mode-river, #4caf50)',
                  color: 'var(--app-mode-river, #2e7d32)'
                };
              } else {
                choiceStyle = {
                  background: '#fce4ec',
                  border: '2px solid #e57373',
                  color: '#c62828'
                };
              }
            } else if (feedback === 'incorrect' && choice.id === question.correctId) {
              choiceStyle = {
                background: 'var(--app-mode-river-surface, #e8f5e9)',
                border: '2px solid var(--app-mode-river, #4caf50)',
                color: 'var(--app-mode-river, #2e7d32)'
              };
            }

            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => handleAnswer(choice.id)}
                disabled={!!feedback}
                className="rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-200 active:scale-95 disabled:cursor-default sm:text-base"
                style={choiceStyle}
              >
                {choice.label}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-xs" style={{ color: 'var(--app-muted)' }}>
          {currentIndex + 1} of {totalQuestions}
        </p>
      </div>
    </div>
  );
}
