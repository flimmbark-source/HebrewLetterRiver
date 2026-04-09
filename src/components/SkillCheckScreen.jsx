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

function buildQuestions(languagePack, count = 5) {
  const candidateItems = [
    ...(languagePack.items ?? []),
    ...(languagePack.allItems ?? []),
    ...(languagePack.consonants ?? []),
    ...(languagePack.basicConsonants ?? [])
  ];

  // Deduplicate by id
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
      letter: correctItem,
      symbol: getItemSymbol(correctItem),
      correctId: correctItem.id,
      choices: choices.map((c) => ({ id: c.id, label: getItemLabel(c) }))
    };
  });
}

export default function SkillCheckScreen({ onComplete, onSkip }) {
  const { languagePack } = useLocalization();
  const questions = useMemo(() => buildQuestions(languagePack, 5), [languagePack]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect' | null
  const [selectedId, setSelectedId] = useState(null);

  const question = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;

  const handleAnswer = useCallback(
    (choiceId) => {
      if (feedback) return; // prevent double-tap
      setSelectedId(choiceId);
      const isCorrect = choiceId === question.correctId;
      if (isCorrect) setScore((prev) => prev + 1);
      setFeedback(isCorrect ? 'correct' : 'incorrect');

      setTimeout(() => {
        setFeedback(null);
        setSelectedId(null);
        if (currentIndex + 1 >= totalQuestions) {
          const finalScore = isCorrect ? score + 1 : score;
          let skillLevel = 'beginner';
          if (finalScore >= 4) skillLevel = 'advanced';
          else if (finalScore >= 2) skillLevel = 'intermediate';
          onComplete({ score: finalScore, total: totalQuestions, skillLevel });
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 800);
    },
    [feedback, question, currentIndex, totalQuestions, score, onComplete]
  );

  if (!question) {
    // Not enough letters in pack — skip
    onSkip();
    return null;
  }

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

        {/* Letter display */}
        <div className="mt-8 mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
            What is this letter?
          </p>
          <div
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl text-5xl font-bold shadow-lg sm:h-32 sm:w-32 sm:text-6xl"
            style={{
              background: 'var(--app-primary-container)',
              color: 'var(--app-primary)',
              border: '2px solid var(--app-primary)'
            }}
          >
            {question.symbol}
          </div>
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
