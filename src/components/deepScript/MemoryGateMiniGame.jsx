import React, { useMemo, useState } from 'react';
import { useFontSettings } from '../../hooks/useFontSettings.js';
import { getNativeScript, getMeaning, getTextDirection } from '../../lib/vocabLanguageAdapter.js';

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildRound(word, words, askFor, followUpAskFor = null) {
  const correct = askFor === 'meaning' ? getMeaning(word) : word.transliteration;
  const distractors = shuffle(
    words
      .filter((w) => w.id !== word.id)
      .map((w) => (askFor === 'meaning' ? getMeaning(w) : w.transliteration))
      .filter(Boolean)
      .filter((value, index, arr) => arr.indexOf(value) === index)
  ).slice(0, 2);

  return {
    word,
    askFor,
    followUpAskFor,
    correct,
    options: shuffle([correct, ...distractors]),
  };
}

function buildQueue(words) {
  return words.map((word, index) => {
    const firstAskFor = index % 2 === 0 ? 'meaning' : 'transliteration';
    const secondAskFor = firstAskFor === 'meaning' ? 'transliteration' : 'meaning';
    return buildRound(word, words, firstAskFor, secondAskFor);
  });
}

export default function MemoryGateMiniGame({ wordPool = [], onSolved, compact = false }) {
  const { getGameFontClass, getNativeScriptFontClass } = useFontSettings();
  const floorWords = useMemo(
    () => wordPool.filter((word) => !word?.isMiniboss && getMeaning(word) && word.transliteration),
    [wordPool]
  );

  const [queue, setQueue] = useState(() => buildQueue(floorWords));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const current = queue[currentIndex] ?? null;
  const totalWords = floorWords.length;
  const isComplete = !current;

  const advance = () => {
    setSelected(null);
    setFeedback(null);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleOptionClick = (option) => {
    if (!current || feedback || isCompleting) return;

    setSelected(option);
    const isCorrect = option === current.correct;

    if (isCorrect) {
      setFeedback('correct');

      if (current.followUpAskFor) {
        const followUpRound = buildRound(current.word, floorWords, current.followUpAskFor, null);
        setQueue((prev) => {
          const next = [...prev];
          next.splice(currentIndex + 1, 0, followUpRound);
          return next;
        });
      } else {
        setResolvedCount((prev) => prev + 1);
      }

      window.setTimeout(advance, 450);
      return;
    }

    setFeedback('wrong');
    setMistakes((prev) => prev + 1);
    setQueue((prev) => [...prev, { ...current, options: shuffle(current.options) }]);
    window.setTimeout(advance, 650);
  };

  const handleProceed = () => {
    if (isCompleting) return;
    setIsCompleting(true);
    window.setTimeout(() => onSolved?.(), 450);
  };

  if (!totalWords) return null;

  return (
    <>
      <style>{`
        .ds-memory-gate {
          position: absolute;
          inset: 0;
          z-index: 12;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background:
            radial-gradient(ellipse at 50% 30%, rgba(91, 141, 217, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 50% 100%, rgba(196, 149, 90, 0.08) 0%, transparent 55%),
            rgba(13, 15, 20, 0.9);
          animation: ds-fade-in 0.25s ease-out;
        }
        .ds-memory-gate__frame {
          width: min(560px, 92vw);
          border: 2px solid rgba(196, 149, 90, 0.45);
          border-radius: 16px;
          background: linear-gradient(180deg, rgba(30,34,40,0.97) 0%, rgba(22,25,31,0.98) 100%);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(224,184,120,0.12), 0 0 24px rgba(196,149,90,0.12);
          padding: 18px;
        }
        .ds-memory-gate__header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .ds-memory-gate__glyph {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid rgba(196,149,90,0.35);
          background: rgba(42,47,56,0.9);
          color: var(--ds-gold);
          font-size: 22px;
          box-shadow: 0 0 12px var(--ds-gold-glow);
        }
        .ds-memory-gate__title { margin: 0; font-family: var(--ds-font-display); font-size: 24px; color: var(--ds-gold); text-shadow: 0 2px 8px var(--ds-gold-glow); }
        .ds-memory-gate__progress { display: flex; gap: 8px; margin-top: 4px; font-size: 11px; font-weight: 800; letter-spacing: 0.8px; text-transform: uppercase; color: var(--ds-parchment-dim); }
        .ds-memory-gate__prompt { display: grid; gap: 10px; justify-items: center; padding: 10px 8px 20px; }
        .ds-memory-gate__word { font-size: clamp(42px, 9vw, 72px); font-weight: 800; color: #f7f2df; text-shadow: 0 0 10px rgba(224,184,120,0.16), 0 3px 10px rgba(0,0,0,0.45); line-height: 1; }
        .ds-memory-gate__ask { font-size: 11px; font-weight: 800; letter-spacing: 1.4px; text-transform: uppercase; color: var(--ds-parchment-dim); }
        .ds-memory-gate__choices { display: grid; gap: 12px; }
        .ds-memory-gate__choice { position: relative; width: 100%; padding: 0; border: none; background: transparent; color: var(--ds-parchment); cursor: pointer; text-align: left; transition: transform 0.12s ease, filter 0.18s ease, opacity 0.18s ease; }
        .ds-memory-gate__choice:disabled { cursor: default; }
        .ds-memory-gate__choice:active:not(:disabled) { transform: scale(0.985); }
        .ds-memory-gate__choice-inner {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 58px;
          padding: 14px 18px;
          clip-path: polygon(12px 0%, calc(100% - 12px) 0%, 100% 38%, 100% 62%, calc(100% - 12px) 100%, 12px 100%, 0% 62%, 0% 38%);
          background: linear-gradient(170deg, rgba(42,38,30,0.96) 0%, rgba(24,22,20,0.98) 52%, rgba(30,28,24,0.96) 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 3px 0 rgba(0,0,0,0.45);
        }
        .ds-memory-gate__choice-inner::before {
          content: '';
          position: absolute;
          inset: -1px;
          z-index: -1;
          clip-path: polygon(12px 0%, calc(100% - 12px) 0%, 100% 38%, 100% 62%, calc(100% - 12px) 100%, 12px 100%, 0% 62%, 0% 38%);
          background: linear-gradient(180deg, rgba(196,149,90,0.45), rgba(80,64,36,0.75));
        }
        .ds-memory-gate__choice-inner::after {
          content: '';
          position: absolute;
          top: 1px;
          left: 18px;
          right: 18px;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(224,184,120,0.22) 30%, rgba(224,184,120,0.22) 70%, transparent 100%);
          pointer-events: none;
        }
        .ds-memory-gate__choice-rune { flex: 0 0 auto; width: 24px; text-align: center; font-size: 18px; line-height: 1; opacity: 0.95; }
        .ds-memory-gate__choice-text { position: relative; z-index: 1; font-size: 17px; font-weight: 700; line-height: 1.25; color: #f6efe1; }
        .ds-memory-gate__choice--meaning .ds-memory-gate__choice-inner::before { background: linear-gradient(180deg, rgba(91,141,217,0.38), rgba(40,50,70,0.72)); }
        .ds-memory-gate__choice--meaning .ds-memory-gate__choice-rune, .ds-memory-gate__choice--meaning .ds-memory-gate__choice-text { color: #cfe0ff; text-shadow: 0 0 10px rgba(91,141,217,0.28); }
        .ds-memory-gate__choice--transliteration .ds-memory-gate__choice-inner::before { background: linear-gradient(180deg, rgba(80,190,140,0.34), rgba(30,55,45,0.72)); }
        .ds-memory-gate__choice--transliteration .ds-memory-gate__choice-rune, .ds-memory-gate__choice--transliteration .ds-memory-gate__choice-text { color: #a9f0cf; text-shadow: 0 0 10px rgba(100,210,160,0.24); }
        .ds-memory-gate__choice:hover:not(:disabled) { filter: brightness(1.12); }
        .ds-memory-gate__choice:hover:not(:disabled) .ds-memory-gate__choice-inner::before { background: linear-gradient(180deg, rgba(240,198,116,0.65), rgba(98,74,36,0.85)); }
        .ds-memory-gate__choice.is-selected .ds-memory-gate__choice-inner { transform: translateY(-1px); }
        .ds-memory-gate__choice.is-selected .ds-memory-gate__choice-inner::before { background: linear-gradient(180deg, rgba(240,198,116,0.85), rgba(130,96,38,0.9)); box-shadow: 0 0 16px rgba(240,198,116,0.28); }
        .ds-memory-gate__choice.is-selected .ds-memory-gate__choice-rune, .ds-memory-gate__choice.is-selected .ds-memory-gate__choice-text { color: #ffe7a8; text-shadow: 0 0 12px rgba(240,198,116,0.35); }
        .ds-memory-gate__choice.is-correct .ds-memory-gate__choice-inner::before { background: linear-gradient(180deg, rgba(76,175,106,0.95), rgba(40,90,55,0.92)); box-shadow: 0 0 18px rgba(76,175,106,0.3); }
        .ds-memory-gate__choice.is-correct .ds-memory-gate__choice-rune, .ds-memory-gate__choice.is-correct .ds-memory-gate__choice-text { color: #eaffef; text-shadow: 0 0 10px rgba(76,175,106,0.28); }
        .ds-memory-gate__choice.is-wrong .ds-memory-gate__choice-inner::before { background: linear-gradient(180deg, rgba(239,68,68,0.95), rgba(110,34,34,0.92)); box-shadow: 0 0 16px rgba(239,68,68,0.28); }
        .ds-memory-gate__choice.is-wrong .ds-memory-gate__choice-rune, .ds-memory-gate__choice.is-wrong .ds-memory-gate__choice-text { color: #fff0f0; text-shadow: 0 0 10px rgba(239,68,68,0.28); }
        .ds-memory-gate__feedback { min-height: 24px; margin-top: 10px; text-align: center; font-size: 13px; font-weight: 700; }
        .ds-memory-gate__feedback--correct { color: var(--ds-green); }
        .ds-memory-gate__feedback--wrong { color: var(--ds-ember); }
        .ds-memory-gate__complete { display: grid; justify-items: center; gap: 12px; padding: 20px 8px 8px; }
        .ds-memory-gate__complete-glyph { font-size: 48px; color: var(--ds-gold); text-shadow: 0 0 18px var(--ds-gold-glow); }
        .ds-memory-gate__complete-title { font-family: var(--ds-font-display); font-size: 26px; color: var(--ds-gold); }
        .ds-memory-gate__proceed { padding: 10px 22px; border-radius: 999px; border: 1px solid rgba(236,191,124,0.55); background: linear-gradient(180deg, #635438 0%, #4b3f2a 100%); color: #f6efe1; font-size: 13px; font-weight: 800; letter-spacing: 0.4px; text-transform: uppercase; cursor: pointer; box-shadow: 0 0 14px rgba(196,149,90,0.25); }
        .ds-memory-gate__proceed:hover { box-shadow: 0 0 22px rgba(196,149,90,0.4); }
        .ds-memory-gate--completing { animation: ds-pillar-complete 0.45s ease forwards; }
        @media (max-width: 480px) {
          .ds-memory-gate { padding: 12px; }
          .ds-memory-gate__frame { padding: 14px; border-radius: 14px; }
          .ds-memory-gate__title { font-size: 20px; }
          .ds-memory-gate__choice-inner { min-height: 54px; padding: 13px 14px; gap: 10px; }
          .ds-memory-gate__choice-rune { width: 20px; font-size: 16px; }
          .ds-memory-gate__choice-text { font-size: 15px; }
          .ds-memory-gate__word { font-size: clamp(34px, 12vw, 56px); }
        }
      `}</style>
      <div className={`ds-memory-gate ${compact ? 'ds-memory-gate--compact' : ''} ${isCompleting ? 'ds-memory-gate--completing' : ''}`}>
        <div className="ds-memory-gate__frame">
          <div className="ds-memory-gate__header">
            <div className="ds-memory-gate__glyph">⟡</div>
            <div className="ds-memory-gate__title-wrap">
              <h3 className="ds-memory-gate__title">Memory Gate</h3>
              <div className="ds-memory-gate__progress">
                <span>{resolvedCount}/{totalWords}</span>
                <span>•</span>
                <span>{mistakes} mistakes</span>
              </div>
            </div>
          </div>

          {!isComplete ? (
            <>
              <div className="ds-memory-gate__prompt">
                <div className={`ds-memory-gate__word ${getNativeScriptFontClass(`${current.word.id}-mg-word`, current.word.languageId)}`} dir={getTextDirection(current.word.languageId || 'hebrew')}>
                  {getNativeScript(current.word)}
                </div>
                <div className="ds-memory-gate__ask">Choose the correct {current.askFor}</div>
              </div>

              <div className="ds-memory-gate__choices">
                {current.options.map((option) => {
                  const isSelected = selected === option;
                  const isCorrect = feedback && option === current.correct;
                  const isWrong = feedback === 'wrong' && isSelected;

                  return (
                    <button
                      key={option}
                      type="button"
                      className={[
                        'ds-memory-gate__choice',
                        `ds-memory-gate__choice--${current.askFor}`,
                        isSelected ? 'is-selected' : '',
                        isCorrect ? 'is-correct' : '',
                        isWrong ? 'is-wrong' : '',
                      ].join(' ')}
                      onClick={() => handleOptionClick(option)}
                      disabled={!!feedback}
                    >
                      <span className="ds-memory-gate__choice-inner">
                        <span className="ds-memory-gate__choice-rune" aria-hidden="true">
                          {current.askFor === 'meaning' ? '✦' : '⌁'}
                        </span>
                        <span className={['ds-memory-gate__choice-text', getGameFontClass(`${current.word.id}-${current.askFor}-${option}`)].join(' ')}>
                          {option}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="ds-memory-gate__feedback">
                {feedback === 'correct' && (
                  <span className="ds-memory-gate__feedback--correct">
                    {current.followUpAskFor ? `Correct. Now check the ${current.followUpAskFor}.` : 'Correct.'}
                  </span>
                )}
                {feedback === 'wrong' && (
                  <span className="ds-memory-gate__feedback--wrong">Not yet. This word will return near the end.</span>
                )}
              </div>
            </>
          ) : (
            <div className="ds-memory-gate__complete">
              <div className="ds-memory-gate__complete-glyph">🜂</div>
              <div className="ds-memory-gate__complete-title">Gate Unsealed</div>
              <button type="button" className="ds-memory-gate__proceed" onClick={handleProceed}>Proceed</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
