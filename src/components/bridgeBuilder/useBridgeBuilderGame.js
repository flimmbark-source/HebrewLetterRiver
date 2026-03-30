/**
 * useBridgeBuilderGame — state machine hook for the Bridge Builder game mode.
 *
 * Accepts a session config that determines which words to use:
 *   - sessionType: 'guided_pack' | 'random_review'
 *   - selectedWordIds: word IDs to draw from
 *   - packId: (optional) which pack is being played
 *
 * Session word lifecycle (guided packs):
 *   pending   → word has not been seen this session
 *   learned   → word was successfully tested in meaning multiple-choice once this session
 *   completed → word was successfully recalled AFTER being learned
 *
 * For random review, words go directly pending → completed (one pass).
 *
 * Phases:
 *   promptIntro          — Hebrew prompt fades in
 *   transliterationChoice — player picks correct transliteration
 *   transliterationResolved — correct plank animates into bridge
 *   meaningTeach         — (new words) single revealed meaning plank
 *   meaningChoice        — (introduced words) pick correct meaning
 *   meaningResolved      — meaning plank animates into bridge
 *   wordComplete         — short pause, then advance session state and pick next word
 *   roundComplete        — all words completed (or game over)
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  bridgeBuilderWords,
  getTransliterationDistractors,
  getTranslationDistractors,
} from '../../data/bridgeBuilderWords.js';
import {
  getWordProgress,
  recordTransliterationAttempt,
  recordMeaningIntroduced,
  recordMeaningAttempt,
} from '../../lib/bridgeBuilderStorage.js';
import { emit } from '../../lib/eventBus.js';

const MAX_HEARTS = 3;
const TRANSLIT_CHOICES = 3;
const MEANING_CHOICES = 3;
const VOWELS = ['a', 'e', 'i', 'o', 'u'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick the next word to show based on session states.
 * Avoids repeating the same word back-to-back.
 * Prefers learned words (they need recall for completion) over pending words.
 */
function pickNextWord(sessionStates, allWords, lastWordId) {
  const available = allWords.filter(w =>
    sessionStates[w.id] !== 'completed' && w.id !== lastWordId
  );

  if (available.length === 0) {
    // Edge case: only one non-completed word left and it was the last shown
    const remaining = allWords.filter(w => sessionStates[w.id] !== 'completed');
    return remaining.length > 0 ? remaining[0] : null;
  }

  const learned = available.filter(w => sessionStates[w.id] === 'learned');
  const pending = available.filter(w => sessionStates[w.id] === 'pending');

  let pool;
  if (learned.length > 0 && pending.length > 0) {
    // Prefer recalling learned words, but still introduce new ones
    pool = Math.random() < 0.7 ? learned : pending;
  } else {
    pool = learned.length > 0 ? learned : pending;
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

function buildTransliterationChoices(word) {
  const misspellings = buildMisspelledTransliterationDistractors(word.transliteration, TRANSLIT_CHOICES - 1);

  if (misspellings.length < TRANSLIT_CHOICES - 1) {
    const fallbackCount = (TRANSLIT_CHOICES - 1) - misspellings.length;
    const fallback = getTransliterationDistractors(word.id, fallbackCount)
      .filter(choice => choice !== word.transliteration && !misspellings.includes(choice));
    return shuffle([word.transliteration, ...misspellings, ...fallback].slice(0, TRANSLIT_CHOICES));
  }

  return shuffle([word.transliteration, ...misspellings]);
}

function buildMeaningChoices(word, sessionWords) {
  const inSessionDistractors = sessionWords
    .filter(w => w.id !== word.id)
    .map(w => w.translation)
    .filter(Boolean);

  const uniqueInSessionDistractors = [...new Set(inSessionDistractors)];
  const fromSession = shuffle(uniqueInSessionDistractors).slice(0, MEANING_CHOICES - 1);

  if (fromSession.length < MEANING_CHOICES - 1) {
    const fallbackCount = (MEANING_CHOICES - 1) - fromSession.length;
    const fallback = getTranslationDistractors(word.id, fallbackCount)
      .filter(choice => choice !== word.translation && !fromSession.includes(choice));
    const distractors = [...fromSession, ...fallback].slice(0, MEANING_CHOICES - 1);
    return shuffle([word.translation, ...distractors]);
  }

  const distractors = fromSession;
  return shuffle([word.translation, ...distractors]);
}

function buildMisspelledTransliterationDistractors(transliteration, count = 2) {
  if (!transliteration || typeof transliteration !== 'string') return [];
  const trimmed = transliteration.trim();
  if (!trimmed) return [];

  const variants = [];
  const normalized = trimmed.toLowerCase();
  const chars = normalized.split('');
  const isLetter = (ch) => /[a-z]/.test(ch);

  // 1) Single-letter vowel/consonant substitution.
  for (let i = 0; i < chars.length && variants.length < count; i++) {
    const ch = chars[i];
    if (!isLetter(ch)) continue;
    const replacement = VOWELS.includes(ch) ? VOWELS.find(v => v !== ch) : 'a';
    if (!replacement) continue;
    const copy = [...chars];
    copy[i] = replacement;
    const candidate = copy.join('');
    if (candidate !== normalized && !variants.includes(candidate)) {
      variants.push(candidate);
    }
  }

  // 2) Adjacent swap to produce natural-looking typo.
  for (let i = 0; i < chars.length - 1 && variants.length < count; i++) {
    if (!isLetter(chars[i]) || !isLetter(chars[i + 1])) continue;
    const copy = [...chars];
    [copy[i], copy[i + 1]] = [copy[i + 1], copy[i]];
    const candidate = copy.join('');
    if (candidate !== normalized && !variants.includes(candidate)) {
      variants.push(candidate);
    }
  }

  // 3) Drop one letter if still short.
  for (let i = 0; i < chars.length && variants.length < count; i++) {
    if (!isLetter(chars[i])) continue;
    const candidate = chars.filter((_, idx) => idx !== i).join('');
    if (candidate.length >= 2 && candidate !== normalized && !variants.includes(candidate)) {
      variants.push(candidate);
    }
  }

  return variants.slice(0, count);
}

/**
 * @param {Object} sessionConfig
 * @param {string} sessionConfig.sessionType — 'guided_pack' | 'random_review'
 * @param {string|null} sessionConfig.packId
 * @param {string[]} sessionConfig.selectedWordIds
 */
export default function useBridgeBuilderGame(sessionConfig) {
  const { sessionType, selectedWordIds } = sessionConfig;
  const isGuidedPack = sessionType === 'guided_pack';

  // Resolve word IDs to word objects (stable for the session)
  const allSessionWords = useMemo(() => {
    const wordMap = new Map(bridgeBuilderWords.map(w => [w.id, w]));
    return selectedWordIds.map(id => wordMap.get(id)).filter(Boolean);
  }, [selectedWordIds]);

  // Session-level word states: wordId → 'pending' | 'learned' | 'completed'
  const buildInitialStates = useCallback(() => {
    const states = {};
    for (const w of allSessionWords) states[w.id] = 'pending';
    return states;
  }, [allSessionWords]);

  const sessionStatesRef = useRef(buildInitialStates());
  const [sessionStates, setSessionStates] = useState(() => sessionStatesRef.current);
  const lastWordIdRef = useRef(null);

  const completedCount = useMemo(
    () => Object.values(sessionStates).filter(s => s === 'completed').length,
    [sessionStates]
  );

  // Phase machine state
  const [phase, setPhase] = useState('promptIntro');
  const [currentWord, setCurrentWord] = useState(
    () => pickNextWord(sessionStatesRef.current, allSessionWords, null)
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [bridgeSegments, setBridgeSegments] = useState([]);

  // Choices for current phase
  const [translitChoices, setTranslitChoices] = useState([]);
  const [meaningChoices, setMeaningChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [choiceResult, setChoiceResult] = useState(null); // 'correct' | 'wrong' | null

  const timerRef = useRef(null);
  const meaningOutcomeRef = useRef('untested'); // 'teach' | 'choice' | 'untested'

  const isRoundComplete = phase === 'roundComplete';
  const isGameOver = hearts <= 0;

  // Emit session-complete event when the round ends
  const hasEmittedRef = useRef(false);
  useEffect(() => {
    if (phase === 'roundComplete' && !hasEmittedRef.current) {
      hasEmittedRef.current = true;
      const allCompleted = allSessionWords.every(w => sessionStatesRef.current[w.id] === 'completed');
      const completedWordIds = allSessionWords
        .filter(w => sessionStatesRef.current[w.id] === 'completed')
        .map(w => w.id);
      emit('bridge:session-complete', {
        score,
        streak,
        hearts,
        maxHearts: MAX_HEARTS,
        completedCount,
        completedWordIds,
        totalWords: allSessionWords.length,
        isGameOver: hearts <= 0,
        isFullClear: allCompleted && hearts > 0,
        isPerfect: allCompleted && hearts === MAX_HEARTS,
        sessionType,
      });
    }
    if (phase === 'promptIntro') {
      hasEmittedRef.current = false;
    }
  }, [phase, score, streak, hearts, completedCount, allSessionWords, sessionType]);

  // Start the intro animation timer
  useEffect(() => {
    if (phase === 'promptIntro' && currentWord) {
      timerRef.current = setTimeout(() => {
        const choices = buildTransliterationChoices(currentWord);
        setTranslitChoices(choices);
        setPhase('transliterationChoice');
      }, 800);
      return () => clearTimeout(timerRef.current);
    }
  }, [phase, currentWord]);

  // After transliteration resolved, move to meaning phase
  useEffect(() => {
    if (phase === 'transliterationResolved' && currentWord) {
      timerRef.current = setTimeout(() => {
        const prog = getWordProgress(currentWord.id);
        if (!prog.meaningIntroduced) {
          // New word — teach meaning with single plank
          setPhase('meaningTeach');
        } else {
          // Introduced word — test meaning with multiple choices
          const choices = buildMeaningChoices(currentWord, allSessionWords);
          setMeaningChoices(choices);
          setPhase('meaningChoice');
        }
      }, 700);
      return () => clearTimeout(timerRef.current);
    }
  }, [phase, currentWord, allSessionWords]);

  // After meaning resolved, complete the word
  useEffect(() => {
    if (phase === 'meaningResolved') {
      timerRef.current = setTimeout(() => {
        setPhase('wordComplete');
      }, 600);
      return () => clearTimeout(timerRef.current);
    }
  }, [phase]);

  // After word complete — update session state, pick next word or end
  useEffect(() => {
    if (phase === 'wordComplete' && currentWord) {
      timerRef.current = setTimeout(() => {
        if (hearts <= 0) {
          setPhase('roundComplete');
          return;
        }

        // Advance session state for the current word
        const wordId = currentWord.id;
        const prevState = sessionStatesRef.current[wordId];
        let nextState;
        if (isGuidedPack && prevState === 'pending') {
          // In guided mode, a word is only "learned" after first successful
          // multiple-choice meaning test. Intro-only encounters do not advance.
          // (Random review still completes in one pass via branch below.)
          nextState = meaningOutcomeRef.current === 'choice' ? 'learned' : 'pending';
        } else {
          // Recall in guided pack (learned → completed), or any encounter in review
          nextState = 'completed';
        }

        const newStates = { ...sessionStatesRef.current, [wordId]: nextState };
        sessionStatesRef.current = newStates;
        setSessionStates(newStates);
        lastWordIdRef.current = wordId;

        // Check if all words are completed
        const allCompleted = allSessionWords.every(w => newStates[w.id] === 'completed');
        if (allCompleted) {
          setPhase('roundComplete');
        } else {
          const nextWord = pickNextWord(newStates, allSessionWords, wordId);
          if (!nextWord) {
            setPhase('roundComplete');
          } else {
            setCurrentWord(nextWord);
            setStepIndex(s => s + 1);
            setSelectedChoice(null);
            setChoiceResult(null);
            meaningOutcomeRef.current = 'untested';
            setPhase('promptIntro');
          }
        }
      }, 500);
      return () => clearTimeout(timerRef.current);
    }
  }, [phase, currentWord, hearts, isGuidedPack, allSessionWords]);

  const handleTransliterationChoice = useCallback((choice) => {
    if (phase !== 'transliterationChoice' || !currentWord) return;
    setSelectedChoice(choice);
    const correct = choice === currentWord.transliteration;
    setChoiceResult(correct ? 'correct' : 'wrong');
    recordTransliterationAttempt(currentWord.id, correct);

    if (correct) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
      setBridgeSegments(segs => [
        ...segs,
        { wordId: currentWord.id, transliteration: currentWord.transliteration, translation: null },
      ]);
      setTimeout(() => {
        setSelectedChoice(null);
        setChoiceResult(null);
        setPhase('transliterationResolved');
      }, 600);
    } else {
      setStreak(0);
      setHearts(h => h - 1);
      // Wrong plank breaks — remove it from choices, let player retry
      setTimeout(() => {
        setTranslitChoices(prev => prev.filter(c => c !== choice));
        setSelectedChoice(null);
        setChoiceResult(null);
        // Stay in transliterationChoice phase so player can pick again
      }, 800);
    }
  }, [phase, currentWord]);

  const handleMeaningTeachPlace = useCallback(() => {
    if (phase !== 'meaningTeach' || !currentWord) return;
    recordMeaningIntroduced(currentWord.id);
    recordMeaningAttempt(currentWord.id, true);
    setScore(s => s + 5);
    meaningOutcomeRef.current = 'teach';
    setBridgeSegments(segs => {
      const updated = [...segs];
      const last = updated[updated.length - 1];
      if (last && last.wordId === currentWord.id) {
        updated[updated.length - 1] = { ...last, translation: currentWord.translation };
      }
      return updated;
    });
    setPhase('meaningResolved');
  }, [phase, currentWord]);

  const handleMeaningChoice = useCallback((choice) => {
    if (phase !== 'meaningChoice' || !currentWord) return;
    setSelectedChoice(choice);
    const correct = choice === currentWord.translation;
    setChoiceResult(correct ? 'correct' : 'wrong');
    recordMeaningAttempt(currentWord.id, correct);

    if (correct) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
      meaningOutcomeRef.current = 'choice';
      setBridgeSegments(segs => {
        const updated = [...segs];
        const last = updated[updated.length - 1];
        if (last && last.wordId === currentWord.id) {
          updated[updated.length - 1] = { ...last, translation: currentWord.translation };
        }
        return updated;
      });
      setTimeout(() => {
        setSelectedChoice(null);
        setChoiceResult(null);
        setPhase('meaningResolved');
      }, 600);
    } else {
      setStreak(0);
      setHearts(h => h - 1);
      // Wrong plank breaks — remove it from choices, let player retry
      setTimeout(() => {
        setMeaningChoices(prev => prev.filter(c => c !== choice));
        setSelectedChoice(null);
        setChoiceResult(null);
        // Stay in meaningChoice phase so player can pick again
      }, 800);
    }
  }, [phase, currentWord]);

  const restartGame = useCallback(() => {
    const states = buildInitialStates();
    sessionStatesRef.current = states;
    setSessionStates(states);
    lastWordIdRef.current = null;

    const first = pickNextWord(states, allSessionWords, null);
    setCurrentWord(first);
    setStepIndex(0);
    setScore(0);
    setStreak(0);
    setHearts(MAX_HEARTS);
    setBridgeSegments([]);
    meaningOutcomeRef.current = 'untested';
    setSelectedChoice(null);
    setChoiceResult(null);
    setPhase('promptIntro');
  }, [allSessionWords, buildInitialStates]);

  return {
    // State
    phase,
    currentWord,
    score,
    streak,
    hearts,
    maxHearts: MAX_HEARTS,
    bridgeSegments,
    totalWords: allSessionWords.length,
    wordIndex: stepIndex,       // step counter for animation keys
    completedCount,             // session-completed words (for dots)
    isRoundComplete,
    isGameOver,

    // Choices
    translitChoices,
    meaningChoices,
    selectedChoice,
    choiceResult,

    // Actions
    handleTransliterationChoice,
    handleMeaningTeachPlace,
    handleMeaningChoice,
    restartGame,
  };
}
