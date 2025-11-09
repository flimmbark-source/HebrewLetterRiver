import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WORD_RIVER_SETS, getWordRiverSet } from '../data/wordRiverSets.js';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useRiverPointerDrag } from '../hooks/useRiverPointerDrag.js';
import { classNames } from '../lib/classNames.js';

const LETTER_PHASE = 'letters';
const MATCH_PHASE = 'match';
const LETTER_RELEASE_BATCH = 4;

function splitWord(word) {
  return Array.from(word ?? '');
}

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function buildRoundState(set) {
  const buckets = set.words.map((word) => {
    const symbols = splitWord(word.practice);
    return {
      id: word.id,
      practiceWord: word.practice,
      appWord: word.app,
      emoji: word.emoji,
      slots: symbols.map((symbol, index) => ({
        id: `${word.id}-slot-${index}`,
        char: symbol,
        filledChar: null,
        flashKey: null
      }))
    };
  });

  const letters = buckets.flatMap((bucket) =>
    bucket.slots.map((slot, index) => ({
      id: `${bucket.id}-letter-${index}-${Math.random().toString(36).slice(2, 8)}`,
      char: slot.char,
      bucketId: bucket.id,
      topOffset: Math.random() * 70,
      driftSeed: Math.random(),
      speed: 45 + Math.random() * 55,
      direction: Math.random() > 0.5 ? 1 : -1
    }))
  );

  return {
    buckets,
    letters: shuffle(letters)
  };
}

function DriftingLetter({ letter, fontClass, getDropZones, onLetterDrop }) {
  const ref = useRef(null);
  const animationRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const positionRef = useRef(0);
  const boundsRef = useRef({ maxOffset: 0 });
  const initializedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const seedRef = useRef(
    typeof letter.driftSeed === 'number' ? Math.min(Math.max(letter.driftSeed, 0), 1) : Math.random()
  );
  const baseSpeedRef = useRef(Math.max(20, Math.abs(letter.speed ?? 60)));
  const velocityRef = useRef(null);

  if (velocityRef.current === null) {
    const initialDirection = letter.direction ?? (Math.random() > 0.5 ? 1 : -1);
    const normalizedDirection = initialDirection >= 0 ? 1 : -1;
    velocityRef.current = baseSpeedRef.current * normalizedDirection;
  }

  const updateTransform = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    element.style.transform = `translateX(${positionRef.current}px)`;
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const parent = element.parentElement;
    if (!parent) return undefined;

    const updateBounds = () => {
      const parentRect = parent.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const maxOffset = Math.max(0, parentRect.width - elementRect.width);
      boundsRef.current.maxOffset = maxOffset;
      if (!initializedRef.current) {
        const initialOffset = maxOffset * seedRef.current;
        positionRef.current = Math.min(Math.max(initialOffset, 0), maxOffset);
        initializedRef.current = true;
      } else {
        positionRef.current = Math.min(Math.max(positionRef.current, 0), maxOffset);
      }
      updateTransform();
    };

    updateBounds();

    const observer = new ResizeObserver(updateBounds);
    observer.observe(parent);

    const step = (timestamp) => {
      if (!ref.current) return;
      if (isDraggingRef.current) {
        lastTimestampRef.current = timestamp;
        animationRef.current = requestAnimationFrame(step);
        return;
      }
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;
      positionRef.current += velocityRef.current * delta;
      const maxOffset = boundsRef.current.maxOffset ?? 0;
      if (positionRef.current <= 0) {
        positionRef.current = 0;
        velocityRef.current = Math.abs(baseSpeedRef.current);
      } else if (positionRef.current >= maxOffset) {
        positionRef.current = maxOffset;
        velocityRef.current = -Math.abs(baseSpeedRef.current);
      }
      updateTransform();
      animationRef.current = requestAnimationFrame(step);
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [updateTransform]);

  useRiverPointerDrag(ref, {
    enabled: true,
    payload: { letter, origin: { type: 'river', letterId: letter.id } },
    getDropZones,
    ghostClassName: `${fontClass} text-6xl font-semibold text-cyan-200 drop-shadow-lg px-2 py-1`,
    getGhostContent: () => letter.char,
    onDrop: ({ zone, payload }) => onLetterDrop({ letter: payload.letter ?? letter, zone, origin: payload.origin }),
    freezeWhileDragging: true,
    onDragStart: () => {
      isDraggingRef.current = true;
      lastTimestampRef.current = null;
    },
    onDragEnd: () => {
      isDraggingRef.current = false;
      lastTimestampRef.current = null;
    }
  });

  return (
    <div
      ref={ref}
      className={`falling-letter ${fontClass} text-cyan-300`}
      style={{
        top: `${letter.topOffset}%`,
        left: 0
      }}
      aria-hidden="true"
    >
      {letter.char}
    </div>
  );
}

function WordBucketSlot({
  bucketId,
  slot,
  phase,
  fontClass,
  registerDropZone,
  getDropZones,
  onLetterDrop
}) {
  const ref = useRef(null);
  const isLettersPhase = phase === LETTER_PHASE;
  const filled = Boolean(slot.filledChar);

  useEffect(() => {
    if (!isLettersPhase) return undefined;
    const element = ref.current;
    if (!element) return undefined;
    const unregister = registerDropZone({
      element,
      data: { type: 'slot', bucketId, slotId: slot.id }
    });
    return unregister;
  }, [isLettersPhase, registerDropZone, bucketId, slot.id]);

  useRiverPointerDrag(ref, {
    enabled: isLettersPhase && filled,
    payload: filled
      ? {
          letter: { id: `${bucketId}-${slot.id}-filled`, char: slot.filledChar },
          origin: { type: 'bucket', bucketId, slotId: slot.id }
        }
      : null,
    getDropZones,
    ghostClassName: `${fontClass} text-6xl font-semibold text-cyan-200 drop-shadow-lg px-2 py-1`,
    getGhostContent: () => slot.filledChar ?? '',
    onDrop: ({ zone, payload }) => {
      if (!payload?.letter?.char) return { accepted: false };
      return onLetterDrop({ letter: payload.letter, zone, origin: payload.origin });
    },
    freezeWhileDragging: true
  });

  const slotClasses = [
    'word-river-slot',
    'flex h-12 w-12 items-center justify-center rounded-xl border-2 text-2xl font-semibold transition-all',
    fontClass,
    filled ? 'word-river-slot-filled text-white' : 'word-river-slot-empty text-slate-500',
    filled ? 'word-river-slot-draggable' : ''
  ].filter(Boolean);

  if (slot.flashKey) {
    slotClasses.push('animate-slot-glow');
  }

  return (
    <div ref={ref} className={slotClasses.join(' ')}>
      <span>{slot.filledChar ?? ''}</span>
    </div>
  );
}

function WordBucket({
  bucket,
  phase,
  fontClass,
  registerDropZone,
  getDropZones,
  onBucketDrop,
  onLetterDrop,
  isMatched,
  shakeKey
}) {
  const ref = useRef(null);
  const isLettersPhase = phase === LETTER_PHASE;
  const isMatchPhase = phase === MATCH_PHASE && !isMatched;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    element.style.visibility = isMatched ? 'hidden' : '';
  }, [isMatched, phase]);

  useEffect(() => {
    if (!isLettersPhase) return undefined;
    const element = ref.current;
    if (!element) return undefined;
    const unregister = registerDropZone({
      element,
      data: { type: 'bucket', bucketId: bucket.id }
    });
    return unregister;
  }, [isLettersPhase, registerDropZone, bucket.id]);

  useRiverPointerDrag(ref, {
    enabled: isMatchPhase,
    payload: { bucketId: bucket.id },
    getDropZones,
    ghostClassName: classNames(
      fontClass,
      'text-4xl font-semibold text-cyan-200',
      'px-4 py-2 rounded-2xl',
      'border border-cyan-500/40 bg-slate-950/90 shadow-xl'
    ),
    getGhostContent: () => bucket.practiceWord,
    onDrop: ({ zone }) => onBucketDrop({ bucket, zone }),
    freezeWhileDragging: true
  });

  const slotItems = bucket.slots.map((slot) => (
    <WordBucketSlot
      key={slot.id}
      bucketId={bucket.id}
      slot={slot}
      phase={phase}
      fontClass={fontClass}
      registerDropZone={registerDropZone}
      getDropZones={getDropZones}
      onLetterDrop={onLetterDrop}
    />
  ));

  const containerClasses = [
    'word-river-bucket',
    'rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-center shadow-inner transition-all',
    isMatchPhase ? 'cursor-grab word-river-draggable select-none' : '',
    isMatched ? 'pointer-events-none opacity-0' : '',
    shakeKey ? 'word-bucket-shake' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={containerClasses}>
      <div className="space-y-1">
        <div className={`text-xl font-semibold text-white ${fontClass}`}>{bucket.practiceWord}</div>
        {phase === LETTER_PHASE ? <div className="text-sm text-slate-300">{bucket.appWord}</div> : null}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">{slotItems}</div>
    </div>
  );
}

function MeaningTarget({
  word,
  bucket,
  phase,
  fontClass,
  registerDropZone,
  isMatched,
  fallbackLabel
}) {
  const ref = useRef(null);
  const showDropZone = phase === MATCH_PHASE && !isMatched;

  useEffect(() => {
    if (!showDropZone) return undefined;
    const element = ref.current;
    if (!element) return undefined;
    const unregister = registerDropZone({
      element,
      data: { type: 'target', targetId: word.id }
    });
    return unregister;
  }, [showDropZone, registerDropZone, word.id]);

  return (
    <div
      ref={ref}
      className={classNames(
        'word-river-target flex flex-col items-center gap-2 rounded-2xl border border-slate-700',
        'bg-slate-900/70 px-4 py-5 text-center shadow-inner transition-all',
        isMatched && 'border-emerald-400/50 bg-emerald-500/10 shadow-emerald-400/20'
      )}
    >
      <div className="text-4xl" aria-hidden="true">
        {word.emoji ? word.emoji : '❔'}
      </div>
      <div className="text-sm text-slate-300">{fallbackLabel}</div>
      {isMatched && bucket ? (
        <div className={`mt-2 text-lg font-semibold text-emerald-200 ${fontClass}`}>{bucket.practiceWord}</div>
      ) : null}
    </div>
  );
}

export default function WordRiverView() {
  const navigate = useNavigate();
  const { languagePack, t } = useLocalization();
  const { addToast } = useToast();
  const fontClass = languagePack.metadata?.fontClass ?? 'language-font-hebrew';
  const totalSets = WORD_RIVER_SETS.length || 1;
  const [phase, setPhase] = useState(LETTER_PHASE);
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundSeed, setRoundSeed] = useState(0);
  const [bucketStates, setBucketStates] = useState([]);
  const [letters, setLetters] = useState([]);
  const [letterQueue, setLetterQueue] = useState([]);
  const [matches, setMatches] = useState({});
  const [bucketShakes, setBucketShakes] = useState({});
  const dropZonesRef = useRef([]);
  const playAreaRef = useRef(null);
  const completionAnnouncedRef = useRef(false);

  const currentSet = useMemo(() => getWordRiverSet(roundIndex), [roundIndex]);

  useEffect(() => {
    const { buckets, letters: initialLetters } = buildRoundState(currentSet);
    const initialBatchSize = Math.min(LETTER_RELEASE_BATCH, initialLetters.length);
    const initialBatch = initialLetters.slice(0, initialBatchSize);
    const remainingLetters = initialLetters.slice(initialBatchSize);
    setBucketStates(buckets);
    setLetters(initialBatch);
    setLetterQueue(remainingLetters);
    setMatches({});
    setBucketShakes({});
    setPhase(LETTER_PHASE);
    completionAnnouncedRef.current = false;
    dropZonesRef.current = [];
  }, [currentSet, roundSeed]);

  useEffect(() => {
    const area = playAreaRef.current;
    if (!area) return undefined;
    const updateRiverWidth = () => {
      const { width } = area.getBoundingClientRect();
      area.style.setProperty('--river-width', `${width}px`);
    };
    updateRiverWidth();
    const observer = new ResizeObserver(updateRiverWidth);
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (Object.keys(bucketShakes).length === 0) return undefined;
    const timers = Object.entries(bucketShakes).map(([bucketId, timestamp]) => {
      return setTimeout(() => {
        setBucketShakes((prev) => {
          if (prev[bucketId] !== timestamp) return prev;
          const next = { ...prev };
          delete next[bucketId];
          return next;
        });
      }, 450);
    });
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [bucketShakes]);

  useEffect(() => {
    if (phase !== LETTER_PHASE) return undefined;
    if (!bucketStates.length) return undefined;
    const allFilled = bucketStates.every((bucket) => bucket.slots.every((slot) => slot.filledChar));
    if (!allFilled) return undefined;
    const timeout = setTimeout(() => {
      setPhase(MATCH_PHASE);
      setLetterQueue([]);
      dropZonesRef.current = [];
    }, 400);
    return () => clearTimeout(timeout);
  }, [bucketStates, phase]);

  useEffect(() => {
    if (phase !== MATCH_PHASE) return undefined;
    if (!bucketStates.length) return undefined;
    const matchedCount = bucketStates.filter((bucket) => matches[bucket.id]).length;
    if (matchedCount !== bucketStates.length || completionAnnouncedRef.current) return undefined;
    completionAnnouncedRef.current = true;
    addToast({
      icon: '🌟',
      title: t('wordRiver.notifications.roundComplete')
    });
    const timeout = setTimeout(() => {
      setRoundIndex((prev) => (prev + 1) % totalSets);
      setRoundSeed((prev) => prev + 1);
    }, 900);
    return () => clearTimeout(timeout);
  }, [phase, matches, bucketStates, addToast, t, totalSets]);

  const registerDropZone = useCallback((zone) => {
    if (!zone?.element) return () => {};
    dropZonesRef.current = dropZonesRef.current.filter((entry) => entry.element !== zone.element);
    dropZonesRef.current.push(zone);
    return () => {
      dropZonesRef.current = dropZonesRef.current.filter((entry) => entry.element !== zone.element);
    };
  }, []);

  const getDropZones = useCallback(() => dropZonesRef.current, []);

  const handleLetterDrop = useCallback(({ letter, zone, origin }) => {
    if (!zone?.data) return { accepted: false };
    const zoneData = zone.data;

    if (zoneData.type === 'slot') {
      const targetBucketId = zoneData.bucketId;
      const targetSlotId = zoneData.slotId;
      let accepted = false;
      setBucketStates((prev) => {
        const targetBucketIndex = prev.findIndex((bucket) => bucket.id === targetBucketId);
        if (targetBucketIndex === -1) return prev;
        const targetBucket = prev[targetBucketIndex];
        const targetSlot = targetBucket.slots.find((slot) => slot.id === targetSlotId);
        if (!targetSlot) return prev;
        if (targetSlot.char !== letter.char) return prev;
        if (
          targetSlot.filledChar &&
          !(origin?.type === 'bucket' && origin.bucketId === targetBucketId && origin.slotId === targetSlotId)
        ) {
          return prev;
        }
        accepted = true;
        const nextBuckets = prev.map((bucket) => {
          if (bucket.id === targetBucketId) {
            return {
              ...bucket,
              slots: bucket.slots.map((slot) => {
                if (slot.id === targetSlotId) {
                  return { ...slot, filledChar: letter.char, flashKey: Date.now() };
                }
                if (
                  origin?.type === 'bucket' &&
                  origin.bucketId === targetBucketId &&
                  origin.slotId === slot.id &&
                  origin.slotId !== targetSlotId
                ) {
                  return { ...slot, filledChar: null, flashKey: null };
                }
                return slot;
              })
            };
          } else if (origin?.type === 'bucket' && origin.bucketId === bucket.id) {
            return {
              ...bucket,
              slots: bucket.slots.map((slot) =>
                slot.id === origin.slotId ? { ...slot, filledChar: null, flashKey: null } : slot
              )
            };
          }
          return bucket;
        });
        return nextBuckets;
      });
      if (accepted) {
        if (origin?.type === 'river') {
          setLetters((prev) => prev.filter((item) => item.id !== letter.id));
        }
        return { accepted: true };
      }
      setBucketShakes((prev) => ({ ...prev, [targetBucketId]: Date.now() }));
      return { accepted: false };
    }

    if (zoneData.type === 'bucket') {
      const targetBucketId = zoneData.bucketId;
      let accepted = false;
      setBucketStates((prev) => {
        const targetBucketIndex = prev.findIndex((bucket) => bucket.id === targetBucketId);
        if (targetBucketIndex === -1) return prev;
        const targetBucket = prev[targetBucketIndex];
        const nextIndex = targetBucket.slots.findIndex((slot) => !slot.filledChar);
        if (nextIndex === -1) return prev;
        const nextSlot = targetBucket.slots[nextIndex];
        if (nextSlot.char !== letter.char) return prev;
        accepted = true;
        const nextBuckets = prev.map((bucket) => {
          if (bucket.id === targetBucketId) {
            return {
              ...bucket,
              slots: bucket.slots.map((slot, index) => {
                if (index === nextIndex) {
                  return { ...slot, filledChar: letter.char, flashKey: Date.now() };
                }
                if (
                  origin?.type === 'bucket' &&
                  origin.bucketId === targetBucketId &&
                  origin.slotId === slot.id &&
                  origin.slotId !== nextSlot.id
                ) {
                  return { ...slot, filledChar: null, flashKey: null };
                }
                return slot;
              })
            };
          } else if (origin?.type === 'bucket' && origin.bucketId === bucket.id) {
            return {
              ...bucket,
              slots: bucket.slots.map((slot) =>
                slot.id === origin.slotId ? { ...slot, filledChar: null, flashKey: null } : slot
              )
            };
          }
          return bucket;
        });
        return nextBuckets;
      });
      if (accepted) {
        if (origin?.type === 'river') {
          setLetters((prev) => prev.filter((item) => item.id !== letter.id));
        }
        return { accepted: true };
      }
      setBucketShakes((prev) => ({ ...prev, [targetBucketId]: Date.now() }));
      return { accepted: false };
    }

    return { accepted: false };
  }, []);

  useEffect(() => {
    if (phase !== LETTER_PHASE) return undefined;
    if (letters.length !== 0) return undefined;
    if (letterQueue.length === 0) return undefined;
    const releaseCount = Math.min(LETTER_RELEASE_BATCH, letterQueue.length);
    const nextBatch = letterQueue.slice(0, releaseCount);
    const timeout = setTimeout(() => {
      setLetters(nextBatch);
      setLetterQueue((prev) => prev.slice(releaseCount));
    }, 250);
    return () => clearTimeout(timeout);
  }, [letters, letterQueue, phase]);

  const handleBucketDrop = useCallback(
    ({ bucket, zone }) => {
      if (!zone?.data?.targetId) return { accepted: false };
      const targetId = zone.data.targetId;
      if (bucket.id !== targetId) {
        setBucketShakes((prev) => ({ ...prev, [bucket.id]: Date.now() }));
        return { accepted: false };
      }
      setMatches((prev) => ({ ...prev, [bucket.id]: targetId }));
      return { accepted: true };
    },
    []
  );

  const unmatchedBuckets = bucketStates.filter((bucket) => !matches[bucket.id]);

  const phaseLabel = phase === LETTER_PHASE ? t('wordRiver.phases.letters') : t('wordRiver.phases.match');
  const instructions =
    phase === LETTER_PHASE ? t('wordRiver.instructions.letters') : t('wordRiver.instructions.match');

  const handleBack = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('wordRiver.title')}</h1>
          <p className="text-sm text-slate-300 sm:text-base">{t('wordRiver.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className={classNames(
            'inline-flex items-center justify-center gap-2 rounded-full border border-slate-700',
            'bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition',
            'hover:border-cyan-400 hover:text-white'
          )}
        >
          ← {t('wordRiver.actions.back')}
        </button>
      </div>

      <div
        className={classNames(
          'rounded-3xl border border-cyan-500/20',
          'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
          'shadow-2xl'
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-900/80 px-4 py-3 sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 sm:text-sm">
            {phaseLabel}
          </span>
          <span className="text-xs text-slate-400 sm:text-sm">{instructions}</span>
        </div>
        <div ref={playAreaRef} className="relative h-[360px] overflow-hidden bg-slate-900">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-900/30 via-slate-900 to-slate-900" />
          <div className="absolute inset-0">
            {letters.map((letter) => (
              <DriftingLetter
                key={letter.id}
                letter={letter}
                fontClass={fontClass}
                getDropZones={getDropZones}
                onLetterDrop={handleLetterDrop}
              />
            ))}
          </div>
        </div>
        <div className="space-y-6 bg-slate-900/80 px-4 py-5 sm:px-6">
          {phase === LETTER_PHASE ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bucketStates.map((bucket) => (
                <WordBucket
                  key={bucket.id}
                  bucket={bucket}
                  phase={phase}
                  fontClass={fontClass}
                  registerDropZone={registerDropZone}
                  getDropZones={getDropZones}
                  onBucketDrop={handleBucketDrop}
                  onLetterDrop={handleLetterDrop}
                  isMatched={Boolean(matches[bucket.id])}
                  shakeKey={bucketShakes[bucket.id]}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap justify-center gap-4">
                {unmatchedBuckets.map((bucket) => (
                  <WordBucket
                    key={bucket.id}
                    bucket={bucket}
                    phase={phase}
                    fontClass={fontClass}
                    registerDropZone={registerDropZone}
                    getDropZones={getDropZones}
                    onBucketDrop={handleBucketDrop}
                    onLetterDrop={handleLetterDrop}
                    isMatched={Boolean(matches[bucket.id])}
                    shakeKey={bucketShakes[bucket.id]}
                  />
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {currentSet.words.map((word) => {
                  const matchedBucket = bucketStates.find((bucket) => bucket.id === matches[word.id]);
                  return (
                    <MeaningTarget
                      key={word.id}
                      word={word}
                      bucket={matchedBucket}
                      phase={phase}
                      fontClass={fontClass}
                      registerDropZone={registerDropZone}
                      isMatched={Boolean(matches[word.id])}
                      fallbackLabel={word.app || t('wordRiver.targets.fallback')}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
