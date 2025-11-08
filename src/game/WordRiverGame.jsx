import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { createWordRiverRound, buildLetterPool } from '../data/wordRiverLibrary.js';

const LETTER_ANIMATION_MIN = 10;
const LETTER_ANIMATION_MAX = 16;
const LETTER_VERTICAL_MIN = 12;
const LETTER_VERTICAL_MAX = 68;
const LETTER_DELAY_MAX = 2.8;
const ROUND_WORD_COUNT = 3;

function createBuckets(words) {
  return words.map((word) => ({
    id: word.id,
    practiceWord: word.practiceWord,
    translationKey: word.translationKey,
    emoji: word.emoji,
    slots: word.characters.map((char, index) => ({
      index,
      char,
      filled: false,
      highlight: false
    }))
  }));
}

function createLetterPool(words) {
  const baseLetters = buildLetterPool(words);
  return baseLetters.map((letter) => ({
    ...letter,
    animationClass: Math.random() > 0.5 ? 'river-flow-1' : 'river-flow-2',
    duration: Math.random() * (LETTER_ANIMATION_MAX - LETTER_ANIMATION_MIN) + LETTER_ANIMATION_MIN,
    delay: Math.random() * LETTER_DELAY_MAX,
    top: Math.random() * (LETTER_VERTICAL_MAX - LETTER_VERTICAL_MIN) + LETTER_VERTICAL_MIN,
    dragging: false
  }));
}

function buildPracticeDisplay(bucket, phase) {
  if (phase === 'match') {
    return bucket.practiceWord;
  }
  return bucket.slots.map((slot) => (slot.filled ? slot.char : '＿')).join(' ');
}

function playSuccessTone() {
  try {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.2);
    gain.gain.setValueAtTime(0.001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.4);
  } catch (error) {
    console.warn('Audio playback unavailable', error);
  }
}

function SparkleBurst() {
  return (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      <span className="inline-flex h-6 w-6 animate-ping rounded-full bg-cyan-300/60" />
      <span className="absolute h-3 w-3 rounded-full bg-cyan-100 shadow-lg" />
    </span>
  );
}

export default function WordRiverGame({ fontClass, onExit }) {
  const { languagePack, interfaceLanguagePack, t } = useLocalization();
  const practiceDirection = languagePack.metadata?.textDirection ?? 'ltr';
  const interfaceDirection = interfaceLanguagePack.metadata?.textDirection ?? 'ltr';
  const riverRef = useRef(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState('assemble');
  const [sparkleTarget, setSparkleTarget] = useState(null);
  const [shakeBucketId, setShakeBucketId] = useState(null);
  const [showComplete, setShowComplete] = useState(false);

  const roundData = useMemo(
    () => createWordRiverRound(languagePack.id, { wordCount: ROUND_WORD_COUNT }),
    [languagePack.id, roundIndex]
  );

  const [buckets, setBuckets] = useState(() => createBuckets(roundData.words));
  const [letters, setLetters] = useState(() => createLetterPool(roundData.words));
  const [matches, setMatches] = useState({});
  const [activeLetterId, setActiveLetterId] = useState(null);
  const [activeBucketId, setActiveBucketId] = useState(null);

  useEffect(() => {
    setBuckets(createBuckets(roundData.words));
    setLetters(createLetterPool(roundData.words));
    setMatches({});
    setPhase('assemble');
    setShowComplete(false);
  }, [roundData]);

  useEffect(() => {
    const node = riverRef.current;
    if (!node) return undefined;

    const updateWidth = () => {
      const rect = node.getBoundingClientRect();
      node.style.setProperty('--river-width', `${rect.width}px`);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== 'assemble') return undefined;
    const allFilled = buckets.every((bucket) => bucket.slots.every((slot) => slot.filled));
    if (!allFilled) return undefined;

    const timeout = setTimeout(() => setPhase('match'), 900);
    return () => clearTimeout(timeout);
  }, [buckets, phase]);

  useEffect(() => {
    if (phase !== 'match') return undefined;
    const allMatched = roundData.words.every((word) => matches[word.id]);
    if (!allMatched) return undefined;

    setShowComplete(true);
    const timeout = setTimeout(() => {
      setShowComplete(false);
      setRoundIndex((index) => index + 1);
    }, 1600);

    return () => clearTimeout(timeout);
  }, [matches, phase, roundData.words]);

  const handleLetterDragStart = useCallback((letterId, event) => {
    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', letterId);
    }
    setActiveLetterId(letterId);
    setLetters((prev) =>
      prev.map((letter) =>
        letter.id === letterId ? { ...letter, dragging: true } : letter
      )
    );
  }, []);

  const handleLetterDragEnd = useCallback(() => {
    setActiveLetterId(null);
    setLetters((prev) => prev.map((letter) => ({ ...letter, dragging: false })));
  }, []);

  const handleLetterDrop = useCallback(
    (bucketId, slotIndex) => {
      if (!activeLetterId) return;
      setLetters((prev) => {
        const letter = prev.find((item) => item.id === activeLetterId);
        if (!letter) return prev;
        const targetBucket = buckets.find((bucket) => bucket.id === bucketId);
        if (!targetBucket) return prev;
        const targetSlot = targetBucket.slots.find((slot) => slot.index === slotIndex);
        if (!targetSlot || targetSlot.filled) return prev;
        if (letter.wordId !== bucketId || letter.slotIndex !== slotIndex) {
          return prev.map((item) => (item.id === activeLetterId ? { ...item, dragging: false } : item));
        }

        setBuckets((current) =>
          current.map((bucket) => {
            if (bucket.id !== bucketId) return bucket;
            const nextSlots = bucket.slots.map((slot) =>
              slot.index === slotIndex
                ? { ...slot, filled: true, highlight: true }
                : slot
            );
            return { ...bucket, slots: nextSlots };
          })
        );

        setTimeout(() => {
          setBuckets((current) =>
            current.map((bucket) => {
              if (bucket.id !== bucketId) return bucket;
              const nextSlots = bucket.slots.map((slot) =>
                slot.index === slotIndex ? { ...slot, highlight: false } : slot
              );
              return { ...bucket, slots: nextSlots };
            })
          );
        }, 240);

        return prev.filter((item) => item.id !== activeLetterId);
      });
      setActiveLetterId(null);
    },
    [activeLetterId, buckets]
  );

  const handleBucketDragStart = useCallback((bucketId, event) => {
    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', bucketId);
    }
    setActiveBucketId(bucketId);
  }, []);

  const handleBucketDragEnd = useCallback(() => {
    setActiveBucketId(null);
  }, []);

  const handleMeaningDrop = useCallback(
    (optionId) => {
      if (!activeBucketId) return;
      const targetBucket = buckets.find((bucket) => bucket.id === activeBucketId);
      if (!targetBucket) {
        setActiveBucketId(null);
        return;
      }

      if (matches[activeBucketId]) {
        setActiveBucketId(null);
        return;
      }

      const optionTaken = Object.values(matches).includes(optionId);
      if (optionTaken) {
        setShakeBucketId(activeBucketId);
        setTimeout(() => setShakeBucketId(null), 400);
        setActiveBucketId(null);
        return;
      }

      if (activeBucketId !== optionId) {
        setShakeBucketId(activeBucketId);
        setTimeout(() => setShakeBucketId(null), 400);
        setActiveBucketId(null);
        return;
      }

      setMatches((current) => ({ ...current, [activeBucketId]: optionId }));
      setSparkleTarget(optionId);
      playSuccessTone();
      setTimeout(() => setSparkleTarget(null), 400);
      setActiveBucketId(null);
    },
    [activeBucketId, buckets, matches]
  );

  const phaseLabel = phase === 'assemble' ? t('wordRiver.phase.assemble') : t('wordRiver.phase.match');
  const instruction = phase === 'assemble' ? t('wordRiver.instructions.assemble') : t('wordRiver.instructions.match');

  return (
    <div className="flex h-full min-h-[500px] flex-col bg-slate-900" dir={interfaceDirection}>
      <header className="flex items-center gap-4 bg-slate-800/90 px-4 py-3 text-sm text-slate-200 sm:gap-6 sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={onExit}
          className="flex shrink-0 items-center gap-2 rounded-full border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 sm:px-4 sm:text-sm"
        >
          <span className="text-lg" aria-hidden="true">
            ←
          </span>
          <span>{t('game.controls.exitToMenu')}</span>
        </button>
        <div className="flex flex-1 flex-col items-center text-center">
          <h1 className={`text-xl font-semibold text-cyan-300 sm:text-2xl ${fontClass}`}>{t('wordRiver.title')}</h1>
          <p className="text-xs text-slate-300 sm:text-sm">{phaseLabel}</p>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.25em] text-slate-400 sm:text-sm">
          {t('wordRiver.round', { round: roundIndex + 1 })}
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        <div className="bg-slate-900/90 px-4 py-3 text-center text-xs text-slate-300 sm:px-6 sm:text-sm">{instruction}</div>
        <div ref={riverRef} className="relative flex-1 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950/80 to-transparent" />
          </div>
          <div className="absolute inset-0">
            {letters.map((letter) => (
              <div
                key={letter.id}
                draggable
                onDragStart={(event) => handleLetterDragStart(letter.id, event)}
                onDragEnd={handleLetterDragEnd}
                className={`falling-letter select-none rounded-full bg-cyan-500/10 px-6 py-4 text-4xl font-bold text-cyan-200 shadow-lg backdrop-blur transition ${
                  letter.animationClass
                } ${letter.dragging ? 'opacity-60' : ''}`}
                style={{
                  top: `${letter.top}%`,
                  animationDuration: `${letter.duration}s`,
                  animationDelay: `${letter.delay}s`
                }}
              >
                <span className={fontClass}>{letter.char}</span>
              </div>
            ))}
          </div>

          <div
            className={`absolute inset-x-0 bottom-6 mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-4 transition-transform duration-700 sm:gap-5 ${
              phase === 'match' ? '-translate-y-24' : '-translate-y-6'
            }`}
            dir={practiceDirection}
          >
            <div className="grid w-full gap-4 sm:grid-cols-3">
              {buckets.map((bucket) => {
                const translation = t(bucket.translationKey);
                const isMatched = Boolean(matches[bucket.id]);
                return (
                  <div
                    key={bucket.id}
                    draggable={phase === 'match' && !isMatched}
                    onDragStart={(event) => handleBucketDragStart(bucket.id, event)}
                    onDragEnd={handleBucketDragEnd}
                    className={`relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-4 shadow-xl transition ${
                      shakeBucketId === bucket.id ? 'animate-shake-soft' : ''
                    } ${isMatched ? 'ring-2 ring-emerald-300/60 opacity-80' : 'cursor-grab active:cursor-grabbing'}`}
                  >
                    {sparkleTarget === bucket.id ? <SparkleBurst /> : null}
                    <div className={`text-lg font-semibold text-cyan-100 sm:text-xl ${fontClass}`}>{buildPracticeDisplay(bucket, phase)}</div>
                    <div
                      className={`mt-1 text-xs text-slate-300 transition-opacity duration-500 sm:text-sm ${
                        phase === 'match' ? 'opacity-0' : 'opacity-100'
                      }`}
                    >
                      {translation}
                    </div>
                    <div className="mt-3 flex justify-center gap-2">
                      {bucket.slots.map((slot) => (
                        <div
                          key={slot.index}
                          onDragOver={(event) => {
                            event.preventDefault();
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            handleLetterDrop(bucket.id, slot.index);
                          }}
                          className={`flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-slate-900/70 text-2xl font-bold text-cyan-200 transition ${
                            slot.filled ? 'bg-cyan-500/20 shadow-inner shadow-cyan-400/40' : 'opacity-80'
                          } ${slot.highlight ? 'ring-2 ring-cyan-300/70' : ''}`}
                        >
                          <span className={fontClass}>{slot.filled ? slot.char : '·'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 bg-slate-900/95 px-4 py-5 sm:px-6">
          {phase === 'match' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {roundData.options.map((option) => {
                const translation = t(option.translationKey);
                const isMatched = Object.values(matches).includes(option.id);
                const matchedBucket = buckets.find((bucket) => matches[bucket.id] === option.id);
                return (
                  <div
                    key={option.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleMeaningDrop(option.id);
                    }}
                    className={`relative flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 text-center text-slate-200 shadow-inner transition ${
                      isMatched ? 'border-emerald-400/60 bg-emerald-400/10' : 'hover:border-cyan-400/60'
                    }`}
                  >
                    {sparkleTarget === option.id ? <SparkleBurst /> : null}
                    <span className="text-4xl" aria-hidden="true">
                      {option.emoji}
                    </span>
                    <span className="text-sm font-semibold text-cyan-100 sm:text-base">{translation}</span>
                    {matchedBucket ? (
                      <span className={`text-sm font-semibold text-emerald-200 sm:text-base ${fontClass}`}>
                        {matchedBucket.practiceWord}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-400" dir={practiceDirection}>
              {t('wordRiver.instructions.previewMatch')}
            </p>
          )}
        </div>
      </div>
      {showComplete ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
          <div className="rounded-3xl border border-emerald-400/60 bg-slate-900/95 px-8 py-6 text-center shadow-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">{t('wordRiver.roundComplete')}</p>
            <p className={`mt-2 text-2xl font-semibold text-white sm:text-3xl ${fontClass}`}>{t('wordRiver.readyNext')}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
