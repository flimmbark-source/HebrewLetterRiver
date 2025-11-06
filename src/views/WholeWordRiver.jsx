import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import hebrewWords from '../data/words/he.json';
import enTranslations from '../data/translations/en.json';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';

const translationCatalog = {
  en: enTranslations
};

const MIN_BUCKETS = 2;
const MAX_BUCKETS = 4;

function shuffleArray(source) {
  const array = [...source];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export default function WholeWordRiver() {
  const { appLanguageId } = useLanguage();
  const { languagePack } = useLocalization();

  const [score, setScore] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [bucketIds, setBucketIds] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [riverTiles, setRiverTiles] = useState([]);
  const [bucketFeedback, setBucketFeedback] = useState({});
  const [draggingKey, setDraggingKey] = useState(null);
  const [activeBucket, setActiveBucket] = useState(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [scoreBursts, setScoreBursts] = useState([]);

  const feedbackTimers = useRef(new Map());
  const burstTimers = useRef(new Map());

  const allWords = useMemo(
    () => (Array.isArray(hebrewWords.words) ? [...hebrewWords.words] : []),
    []
  );

  const fallbackTranslations = useMemo(() => enTranslations, []);
  const translationPack = useMemo(
    () => translationCatalog[appLanguageId] ?? fallbackTranslations,
    [appLanguageId, fallbackTranslations]
  );

  const fontClass = languagePack.metadata?.fontClass ?? 'language-font-hebrew';
  const tileDirection = languagePack.metadata?.textDirection ?? 'rtl';

  const translationFor = useCallback(
    (id) => translationPack[id] ?? fallbackTranslations[id] ?? id,
    [fallbackTranslations, translationPack]
  );

  const createRound = useCallback(() => {
    feedbackTimers.current.forEach((timer) => clearTimeout(timer));
    feedbackTimers.current.clear();
    burstTimers.current.forEach((timer) => clearTimeout(timer));
    burstTimers.current.clear();

    if (!allWords.length) {
      setBucketIds([]);
      setAssignments({});
      setRiverTiles([]);
      setBucketFeedback({});
      setActiveBucket(null);
      setDraggingKey(null);
      setScoreBursts([]);
      setRoundComplete(true);
      return;
    }

    const cappedMax = Math.min(MAX_BUCKETS, allWords.length);
    const cappedMin = Math.min(MIN_BUCKETS, cappedMax);
    const range = cappedMax - cappedMin + 1;
    const bucketCount = cappedMin + Math.floor(Math.random() * range);

    const selected = shuffleArray(allWords).slice(0, bucketCount);
    const initialAssignments = selected.reduce((acc, word) => {
      acc[word.id] = [];
      return acc;
    }, {});

    const baseTime = Date.now();
    const tiles = selected.map((word, index) => ({
      ...word,
      key: `${word.id}-${baseTime}-${index}`,
      top: Math.min(82, Math.max(8, randomBetween(10, 82))),
      duration: randomBetween(14, 18),
      delay: index * 0.8
    }));

    setBucketIds(selected.map((word) => word.id));
    setAssignments(initialAssignments);
    setRiverTiles(tiles);
    setBucketFeedback({});
    setActiveBucket(null);
    setDraggingKey(null);
    setScoreBursts([]);
    setRoundComplete(false);
  }, [allWords]);

  useEffect(() => {
    createRound();
  }, [createRound]);

  useEffect(() => {
    if (bucketIds.length && riverTiles.length === 0) {
      setRoundComplete(true);
    }
  }, [bucketIds.length, riverTiles.length]);

  useEffect(() => () => {
    feedbackTimers.current.forEach((timer) => clearTimeout(timer));
    feedbackTimers.current.clear();
    burstTimers.current.forEach((timer) => clearTimeout(timer));
    burstTimers.current.clear();
  }, []);

  const applyBucketFeedback = useCallback((bucketId, type) => {
    setBucketFeedback((prev) => ({ ...prev, [bucketId]: type }));
    const timers = feedbackTimers.current;
    if (timers.has(bucketId)) {
      clearTimeout(timers.get(bucketId));
    }
    const timeout = setTimeout(() => {
      setBucketFeedback((prev) => {
        const next = { ...prev };
        delete next[bucketId];
        return next;
      });
      timers.delete(bucketId);
    }, type === 'glow' ? 700 : 450);
    timers.set(bucketId, timeout);
  }, []);

  const triggerScoreBurst = useCallback((bucketId) => {
    const burstId = `${bucketId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setScoreBursts((prev) => [...prev, { id: burstId, bucketId }]);
    const timers = burstTimers.current;
    const timeout = setTimeout(() => {
      setScoreBursts((prev) => prev.filter((item) => item.id !== burstId));
      timers.delete(burstId);
    }, 800);
    timers.set(burstId, timeout);
  }, []);

  const handleDrop = useCallback(
    (bucketId, tileKey) => {
      if (!tileKey) return;
      setRiverTiles((prevTiles) => {
        const tile = prevTiles.find((item) => item.key === tileKey);
        if (!tile) {
          return prevTiles;
        }
        if (tile.id === bucketId) {
          setAssignments((prev) => ({
            ...prev,
            [bucketId]: [...(prev[bucketId] ?? []), tile]
          }));
          setScore((prevScore) => prevScore + 100);
          applyBucketFeedback(bucketId, 'glow');
          triggerScoreBurst(bucketId);
          return prevTiles.filter((item) => item.key !== tileKey);
        }
        applyBucketFeedback(bucketId, 'shake');
        return prevTiles;
      });
      setActiveBucket(null);
      setDraggingKey(null);
    },
    [applyBucketFeedback, triggerScoreBurst]
  );

  const handleNextRound = useCallback(() => {
    setRoundNumber((prev) => prev + 1);
    createRound();
  }, [createRound]);

  const wordsRemaining = riverTiles.length;

  const handleDragStart = useCallback((tileKey, event) => {
    setDraggingKey(tileKey);
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', tileKey);
      event.dataTransfer.effectAllowed = 'move';
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingKey(null);
    setActiveBucket(null);
  }, []);

  const renderBucketContents = useCallback(
    (bucketId) => {
      const assignedWords = assignments[bucketId] ?? [];
      if (!assignedWords.length) {
        return <p className="text-xs text-slate-400">Drag the matching word here.</p>;
      }
      return (
        <ul className="flex flex-wrap gap-2">
          {assignedWords.map((word) => (
            <li
              key={word.key}
              className="rounded-full bg-slate-900/70 px-3 py-1 text-left"
            >
              <span className={`block text-base font-semibold text-white ${fontClass}`} dir={tileDirection}>
                {word.native}
              </span>
              <span className="block text-xs uppercase tracking-wide text-cyan-200">
                {word.romanization}
              </span>
            </li>
          ))}
        </ul>
      );
    },
    [assignments, fontClass, tileDirection]
  );

  if (!allWords.length) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-300">
        No word data available.
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 sm:text-sm">Whole Word River</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Match each Hebrew word to its bucket.</h1>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              Drag the drifting tiles into the English bucket that shares the same meaning. Earn 100 points for every correct match.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Round</p>
              <p className="mt-1 text-2xl font-semibold text-white">{roundNumber}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Score</p>
              <p className="mt-1 text-2xl font-semibold text-cyan-300">{score}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Words Remaining</p>
              <p className="mt-1 text-2xl font-semibold text-white">{wordsRemaining}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 lg:flex-row">
        <div className="relative flex-1 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4">
          <div className="wwr-river">
            {riverTiles.map((tile) => (
              <div
                key={tile.key}
                className={`wwr-word ${draggingKey === tile.key ? 'dragging' : ''}`}
                draggable
                onDragStart={(event) => handleDragStart(tile.key, event)}
                onDragEnd={handleDragEnd}
                style={{
                  top: `${tile.top}%`,
                  animationDuration: `${tile.duration}s`,
                  animationDelay: `${tile.delay}s`
                }}
              >
                <span className={`text-3xl font-semibold text-white ${fontClass}`} dir={tileDirection}>
                  {tile.native}
                </span>
                <span className="text-sm text-cyan-200">{tile.romanization}</span>
              </div>
            ))}
          </div>
          {roundComplete ? (
            <div className="wwr-round-complete absolute inset-0 flex items-center justify-center">
              <div className="rounded-3xl border border-emerald-400/40 bg-emerald-500/10 px-6 py-5 text-center shadow-xl backdrop-blur">
                <h2 className="text-xl font-semibold text-emerald-200 sm:text-2xl">Round Complete!</h2>
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="mt-4 rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-300"
                >
                  Next Round
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-4 lg:w-72">
          {bucketIds.map((bucketId) => {
            const label = translationFor(bucketId);
            const feedback = bucketFeedback[bucketId];
            const isActive = activeBucket === bucketId;
            const bursts = scoreBursts.filter((burst) => burst.bucketId === bucketId);
            return (
              <div
                key={bucketId}
                className={`catcher-box wwr-bucket relative flex flex-col gap-3 border-2 border-slate-700 bg-slate-800/80 text-left text-white ${
                  feedback === 'shake' ? 'wwr-bucket-shake' : ''
                } ${feedback === 'glow' ? 'wwr-bucket-glow' : ''} ${isActive ? 'drag-over' : ''}`}
                onDragOver={(event) => {
                  if (!draggingKey) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDragEnter={(event) => {
                  event.preventDefault();
                  if (!draggingKey) return;
                  setActiveBucket(bucketId);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  if (!draggingKey) return;
                  const nextTarget = event.relatedTarget;
                  if (nextTarget && event.currentTarget.contains(nextTarget)) {
                    return;
                  }
                  setActiveBucket((current) => (current === bucketId ? null : current));
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const tileKey = event.dataTransfer.getData('text/plain') || draggingKey;
                  handleDrop(bucketId, tileKey);
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-cyan-100">{label}</h3>
                  <div className="relative flex h-6 w-16 items-center justify-end overflow-visible">
                    {bursts.map((burst) => (
                      <span key={burst.id} className="wwr-score-burst text-sm font-semibold text-emerald-300">
                        +100
                      </span>
                    ))}
                  </div>
                </div>
                {renderBucketContents(bucketId)}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
