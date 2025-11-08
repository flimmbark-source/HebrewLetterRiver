import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { getWordRiverWords } from '../data/wordRiver.js';
import { useLocalization } from '../context/LocalizationContext.jsx';

function shuffleArray(list = []) {
  const clone = [...list];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function extractCharacters(word = '') {
  return Array.from(word).filter((char) => char.trim().length > 0);
}

const animationClasses = ['river-flow-1', 'river-flow-2', 'simple-flow'];

function ensureAudioContext(audioRef) {
  if (typeof window === 'undefined') return null;
  if (audioRef.current) return audioRef.current;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  audioRef.current = new AudioContext();
  return audioRef.current;
}

export default function WordRiverGame({ languagePack, onClose }) {
  const { interfaceLanguagePack, t } = useLocalization();
  const fontClass = languagePack.metadata?.fontClass ?? 'language-font-hebrew';
  const direction = interfaceLanguagePack.metadata?.textDirection ?? 'ltr';
  const availableWords = useMemo(() => getWordRiverWords(languagePack.id), [languagePack.id]);
  const [phase, setPhase] = useState('assemble');
  const [bucketStates, setBucketStates] = useState([]);
  const [letters, setLetters] = useState([]);
  const [targetOrder, setTargetOrder] = useState([]);
  const [hoverBucket, setHoverBucket] = useState(null);
  const [shakeBucketId, setShakeBucketId] = useState(null);
  const [sparkleTargetId, setSparkleTargetId] = useState(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const timeoutsRef = useRef(new Set());
  const audioRef = useRef(null);

  const addTimeout = useCallback((handle) => {
    if (!handle) return;
    timeoutsRef.current.add(handle);
  }, []);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((handle) => clearTimeout(handle));
    timeoutsRef.current.clear();
  }, []);

  useEffect(() => () => clearTimeouts(), [clearTimeouts]);

  const playSuccessTone = useCallback(async () => {
    const audioContext = ensureAudioContext(audioRef);
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch (error) {
        // ignore resume errors
      }
    }
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(660, now);
    gain.gain.setValueAtTime(0.0001, now);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }, []);

  const startRound = useCallback(() => {
    clearTimeouts();
    setPhase('assemble');
    setRoundComplete(false);
    setTargetOrder([]);
    setSparkleTargetId(null);
    setShakeBucketId(null);

    if (!availableWords.length) {
      setBucketStates([]);
      setLetters([]);
      return;
    }

    const shuffled = shuffleArray(availableWords);
    const targetCount = Math.min(3, shuffled.length);
    const selected = shuffled.slice(0, targetCount);

    const buckets = selected.map((word, index) => {
      const characters = extractCharacters(word.practice);
      return {
        word,
        index,
        letters: characters,
        slots: characters.map(() => null),
        glowIndex: null,
        matched: false
      };
    });
    setBucketStates(buckets);

    const pool = [];
    selected.forEach((word, wordIndex) => {
      const characters = extractCharacters(word.practice);
      characters.forEach((char, charIndex) => {
        const animationClass = animationClasses[(wordIndex + charIndex) % animationClasses.length];
        pool.push({
          id: `${word.id}-${charIndex}-${nanoid()}`,
          char,
          wordId: word.id,
          slotIndex: charIndex,
          animationClass,
          top: 15 + Math.random() * 55,
          delay: Math.random() * 3,
          duration: 10 + Math.random() * 6
        });
      });
    });
    setLetters(pool);
  }, [availableWords, clearTimeouts]);

  useEffect(() => {
    startRound();
  }, [startRound]);

  const handleLetterDragStart = useCallback((event, letterId, char) => {
    event.dataTransfer.setData('wordRiver/letter-id', letterId);
    event.dataTransfer.setData('wordRiver/letter-char', char);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleLetterDragEnd = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleLetterDrop = useCallback(
    (event, wordId) => {
      if (phase !== 'assemble') return;
      event.preventDefault();
      const letterId = event.dataTransfer.getData('wordRiver/letter-id');
      const char = event.dataTransfer.getData('wordRiver/letter-char');
      if (!letterId || !char) return;

      let wasCorrect = false;
      let placedWordId = null;
      let shouldShake = false;

      setBucketStates((prev) =>
        prev.map((bucket) => {
          if (bucket.word.id !== wordId) return bucket;
          const nextIndex = bucket.slots.findIndex((slot) => slot === null);
          if (nextIndex === -1) return bucket;
          const expectedChar = bucket.letters[nextIndex];
          if (expectedChar === char) {
            const nextSlots = [...bucket.slots];
            nextSlots[nextIndex] = { char, id: letterId };
            wasCorrect = true;
            placedWordId = bucket.word.id;
            return { ...bucket, slots: nextSlots, glowIndex: nextIndex };
          }
          shouldShake = true;
          return { ...bucket };
        })
      );

      if (wasCorrect && placedWordId) {
        setLetters((prev) => prev.filter((letter) => letter.id !== letterId));
        const timeout = setTimeout(() => {
          setBucketStates((prev) =>
            prev.map((bucket) =>
              bucket.word.id === placedWordId ? { ...bucket, glowIndex: null } : bucket
            )
          );
        }, 450);
        addTimeout(timeout);
      } else if (shouldShake) {
        setShakeBucketId(wordId);
        const timeout = setTimeout(() => setShakeBucketId(null), 400);
        addTimeout(timeout);
      }
    },
    [phase, addTimeout]
  );

  const allBucketsComplete = useMemo(() => {
    if (!bucketStates.length) return false;
    return bucketStates.every((bucket) => bucket.slots.every((slot) => slot !== null));
  }, [bucketStates]);

  const initiateMatchPhase = useCallback(() => {
    if (!allBucketsComplete) return;
    setPhase('match');
    const order = shuffleArray(bucketStates.map((bucket) => bucket.word.id));
    setTargetOrder(order);
  }, [allBucketsComplete, bucketStates]);

  useEffect(() => {
    if (phase !== 'assemble') return;
    if (!allBucketsComplete) return;
    const timeout = setTimeout(() => {
      initiateMatchPhase();
    }, 600);
    addTimeout(timeout);
  }, [phase, allBucketsComplete, initiateMatchPhase, addTimeout]);

  const handleMeaningDrop = useCallback(
    (event, targetId) => {
      if (phase !== 'match') return;
      event.preventDefault();
      const bucketId = event.dataTransfer.getData('wordRiver/bucket-id');
      if (!bucketId) return;
      if (bucketId === targetId) {
        setBucketStates((prev) =>
          prev.map((bucket) =>
            bucket.word.id === bucketId ? { ...bucket, matched: true } : bucket
          )
        );
        setSparkleTargetId(targetId);
        const timeout = setTimeout(() => setSparkleTargetId(null), 700);
        addTimeout(timeout);
        playSuccessTone();
      } else {
        setShakeBucketId(bucketId);
        const timeout = setTimeout(() => setShakeBucketId(null), 400);
        addTimeout(timeout);
      }
    },
    [phase, addTimeout, playSuccessTone]
  );

  const handleBucketDragStart = useCallback((event, bucketId) => {
    event.dataTransfer.setData('wordRiver/bucket-id', bucketId);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleBucketDragEnd = useCallback((event) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    if (phase !== 'match') return;
    if (!bucketStates.length) return;
    const done = bucketStates.every((bucket) => bucket.matched);
    if (!done) return;
    setRoundComplete(true);
    const timeout = setTimeout(() => {
      startRound();
    }, 1800);
    addTimeout(timeout);
  }, [phase, bucketStates, startRound, addTimeout]);

  const meaningTargets = useMemo(() => {
    if (!targetOrder.length) return [];
    const lookup = new Map(bucketStates.map((bucket) => [bucket.word.id, bucket.word]));
    return targetOrder
      .map((id) => lookup.get(id))
      .filter(Boolean)
      .map((word) => ({
        id: word.id,
        emoji: word.emoji,
        translationKey: word.translationKey
      }));
  }, [targetOrder, bucketStates]);

  if (!availableWords.length) {
    return (
      <div className="flex h-full flex-col" dir={direction}>
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4">
          <div>
            <h2 className={`text-xl font-semibold text-cyan-300 sm:text-2xl ${fontClass}`}>
              {t('wordRiver.heading')}
            </h2>
            <p className="text-sm text-slate-400">{t('wordRiver.emptyState.description')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
          >
            {t('game.controls.exitToMenu')}
          </button>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 text-center">
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            {t('wordRiver.emptyState.title')}
          </h3>
          <p className="max-w-md text-sm text-slate-300 sm:text-base">
            {t('wordRiver.emptyState.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" dir={direction}>
      <header className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            {t('wordRiver.heading')}
          </p>
          <h2 className={`text-2xl font-bold text-white sm:text-3xl ${fontClass}`}>
            {phase === 'assemble'
              ? t('wordRiver.phaseLabels.assemble')
              : t('wordRiver.phaseLabels.match')}
          </h2>
          <p className="mt-1 text-sm text-slate-300 sm:text-base">
            {phase === 'assemble'
              ? t('wordRiver.instructions.assemble')
              : t('wordRiver.instructions.match')}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="self-start rounded-full border border-slate-700 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400 hover:bg-slate-700 hover:text-white"
        >
          {t('game.controls.exitToMenu')}
        </button>
      </header>
      <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_55%)]" />
        <div className="relative flex h-full flex-col">
          <div className="relative flex-1">
            <div className="absolute inset-0">
              {letters.map((letter) => (
                <div
                  key={letter.id}
                  className={`falling-letter font-bold text-cyan-200 ${fontClass} ${letter.animationClass}`}
                  style={{
                    top: `${letter.top}%`,
                    animationDelay: `${letter.delay}s`,
                    animationDuration: `${letter.duration}s`,
                    animationIterationCount: 'infinite'
                  }}
                  draggable
                  onDragStart={(event) => handleLetterDragStart(event, letter.id, letter.char)}
                  onDragEnd={handleLetterDragEnd}
                  onDragOver={(event) => event.preventDefault()}
                >
                  {letter.char}
                </div>
              ))}
            </div>
            <div className="relative z-10 flex h-full flex-col justify-end">
              <div
                className={`flex flex-wrap justify-center gap-4 px-6 pb-12 transition-all duration-700 sm:gap-6 ${
                  phase === 'match' ? 'translate-y-[-40px]' : ''
                }`}
              >
                {bucketStates.map((bucket) => {
                  const isHover = hoverBucket === bucket.word.id;
                  const isShaking = shakeBucketId === bucket.word.id;
                  const isMatched = bucket.matched;
                  return (
                    <div
                      key={bucket.word.id}
                      className={`word-river-bucket ${
                        phase === 'match' ? 'word-river-bucket-match' : ''
                      } ${isHover ? 'word-river-bucket-hover' : ''} ${
                        isShaking ? 'word-river-bucket-shake' : ''
                      } ${isMatched ? 'word-river-bucket-locked' : ''}`}
                      onDragOver={(event) => {
                        if (phase === 'assemble') {
                          event.preventDefault();
                          setHoverBucket(bucket.word.id);
                        }
                      }}
                      onDragEnter={(event) => {
                        if (phase === 'assemble') {
                          event.preventDefault();
                          setHoverBucket(bucket.word.id);
                        }
                      }}
                      onDragLeave={() => {
                        if (phase === 'assemble') setHoverBucket(null);
                      }}
                      onDrop={(event) => {
                        setHoverBucket(null);
                        if (phase === 'assemble') {
                          handleLetterDrop(event, bucket.word.id);
                        }
                      }}
                      draggable={phase === 'match' && !bucket.matched}
                      onDragStart={(event) => {
                        if (phase === 'match' && !bucket.matched) {
                          handleBucketDragStart(event, bucket.word.id);
                        }
                      }}
                      onDragEnd={handleBucketDragEnd}
                    >
                      <div className="word-river-card">
                        <span className={`word-river-practice ${fontClass}`}>
                          {bucket.word.practice}
                        </span>
                        <span
                          className={`word-river-translation ${
                            phase === 'match' ? 'word-river-translation-hide' : ''
                          }`}
                        >
                          {t(bucket.word.translationKey)}
                        </span>
                      </div>
                      <div className="word-river-slots">
                        {bucket.letters.map((expected, index) => {
                          const slot = bucket.slots[index];
                          const filled = Boolean(slot);
                          const glow = bucket.glowIndex === index;
                          return (
                            <div
                              key={`${bucket.word.id}-${index}`}
                              className={`word-river-slot ${filled ? 'filled' : ''} ${
                                glow ? 'glow' : ''
                              }`}
                            >
                              {filled ? (
                                <span className={`${fontClass}`}>{slot.char}</span>
                              ) : (
                                <span>_</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {phase === 'match' ? (
                <div className="flex flex-wrap justify-center gap-5 px-6 pb-10 pt-4">
                  {meaningTargets.map((target) => {
                    const matched = bucketStates.find((bucket) => bucket.word.id === target.id)?.matched;
                    const sparkle = sparkleTargetId === target.id;
                    return (
                      <div
                        key={target.id}
                        className={`word-river-meaning ${matched ? 'matched' : ''} ${
                          sparkle ? 'sparkle' : ''
                        }`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleMeaningDrop(event, target.id)}
                      >
                        <span className="text-4xl sm:text-5xl">{target.emoji}</span>
                        <span className="mt-2 text-sm text-slate-200 sm:text-base">
                          {t(target.translationKey)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-10 flex justify-center transition-opacity duration-500 ${
            roundComplete ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="rounded-full border border-cyan-300/60 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-cyan-200 shadow-lg">
            {t('wordRiver.status.roundComplete')}
          </div>
        </div>
      </div>
    </div>
  );
}

