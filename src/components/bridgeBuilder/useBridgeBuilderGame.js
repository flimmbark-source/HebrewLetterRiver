/**
 * useBridgeBuilderGame — state machine hook for the Bridge Builder game mode.
 *
 * Phases:
 *   promptIntro          — Hebrew prompt fades in
 *   transliterationChoice — player picks correct transliteration
 *   transliterationResolved — correct plank animates into bridge
 *   meaningTeach         — (new words) single revealed meaning plank
 *   meaningChoice        — (introduced words) pick correct meaning
 *   meaningResolved      — meaning plank animates into bridge
 *   wordComplete         — short pause, then next word
 *   roundComplete        — all words done
 */

import { useState, useCallback, useRef, useEffect } from 'react';
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

const WORDS_PER_ROUND = 6;
const MAX_HEARTS = 3;
const TRANSLIT_CHOICES = 3;
const MEANING_CHOICES = 3;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQueue() {
  // Pick WORDS_PER_ROUND words, prioritising words the player hasn't mastered
  const scored = bridgeBuilderWords.map(w => {
    const prog = getWordProgress(w.id);
    let priority = 0;
    if (prog.masteryStage === 'new') priority = 3;
    else if (prog.masteryStage === 'meaning_taught') priority = 2;
    else if (prog.masteryStage === 'practicing') priority = 1;
    else priority = 0;
    // Add a small random factor so order isn't fixed
    priority += Math.random() * 0.5;
    return { word: w, priority };
  });
  scored.sort((a, b) => b.priority - a.priority);
  return scored.slice(0, WORDS_PER_ROUND).map(s => s.word);
}

function buildTransliterationChoices(word) {
  const distractors = getTransliterationDistractors(word.id, TRANSLIT_CHOICES - 1);
  return shuffle([word.transliteration, ...distractors]);
}

function buildMeaningChoices(word) {
  const distractors = getTranslationDistractors(word.id, MEANING_CHOICES - 1);
  return shuffle([word.translation, ...distractors]);
}

export default function useBridgeBuilderGame() {
  const [phase, setPhase] = useState('promptIntro');
  const [queue, setQueue] = useState(() => buildQueue());
  const [wordIndex, setWordIndex] = useState(0);
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

  const currentWord = queue[wordIndex] || null;
  const isRoundComplete = phase === 'roundComplete';
  const isGameOver = hearts <= 0;

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
          const choices = buildMeaningChoices(currentWord);
          setMeaningChoices(choices);
          setPhase('meaningChoice');
        }
      }, 700);
      return () => clearTimeout(timerRef.current);
    }
  }, [phase, currentWord]);

  // After meaning resolved, complete the word
  useEffect(() => {
    if (phase === 'meaningResolved') {
      timerRef.current = setTimeout(() => {
        setPhase('wordComplete');
      }, 600);
      return () => clearTimeout(timerRef.current);
    }
  }, [phase]);

  // After word complete, advance to next word or end round
  useEffect(() => {
    if (phase === 'wordComplete') {
      timerRef.current = setTimeout(() => {
        const nextIndex = wordIndex + 1;
        if (nextIndex >= queue.length || hearts <= 0) {
          setPhase('roundComplete');
        } else {
          setWordIndex(nextIndex);
          setSelectedChoice(null);
          setChoiceResult(null);
          setPhase('promptIntro');
        }
      }, 500);
      return () => clearTimeout(timerRef.current);
    }
  }, [phase, wordIndex, queue.length, hearts]);

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
    const newQueue = buildQueue();
    setQueue(newQueue);
    setWordIndex(0);
    setScore(0);
    setStreak(0);
    setHearts(MAX_HEARTS);
    setBridgeSegments([]);
    setSelectedChoice(null);
    setChoiceResult(null);
    setPhase('promptIntro');
  }, []);

  return {
    // State
    phase,
    currentWord,
    score,
    streak,
    hearts,
    maxHearts: MAX_HEARTS,
    bridgeSegments,
    totalWords: queue.length,
    wordIndex,
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
