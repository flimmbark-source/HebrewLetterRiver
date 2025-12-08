import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import WordRiverObjectIcon from './WordRiverObjectIcon.jsx';
import { playWordAudio } from './audio.js';
import { getHebrewPhoneticLabel, getWordPhonetics } from './phonetics.js';
import { useRiverPointerDrag } from '../../hooks/useRiverPointerDrag.js';
import { classNames } from '../../lib/classNames.js';

const DIFFICULTY_CONFIG = {
  easy: { type: 'ghost', distractorCount: 2 },
  medium: { type: 'anchors', distractorCount: 3 },
  hard: { type: 'sound', distractorCount: 4 }
};

const CONFUSION_MAP = {
  א: ['ע'],
  ב: ['ו', 'כ'],
  ג: ['ק'],
  ה: ['ח'],
  ח: ['כ', 'ע'],
  כ: ['ק', 'ך'],
  ל: ['ן', 'ך'],
  מ: ['ם', 'נ'],
  נ: ['ן', 'מ'],
  ס: ['ם', 'ע'],
  ע: ['א', 'ח'],
  פ: ['ף', 'כ'],
  צ: ['ץ', 'ק'],
  ק: ['כ'],
  ש: ['ס'],
  ת: ['ט']
};

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.easy;
}

function computeLockedIndices(chars, difficultyType) {
  if (difficultyType !== 'anchors') return new Set();
  const result = new Set();
  if (chars.length > 0) {
    result.add(0);
  }
  if (chars.length > 1) {
    result.add(chars.length - 1);
  }
  return result;
}

function buildSlots(word, difficultyType, phoneticSegments) {
  const chars = Array.from(word ?? '');
  const labels = getWordPhonetics(word, phoneticSegments);
  const locked = computeLockedIndices(chars, difficultyType);
  return chars.map((char, index) => ({
    id: `slot-${index}-${char}`,
    char,
    label: labels[index],
    filledChar: locked.has(index) ? char : null,
    filledLabel: locked.has(index) ? labels[index] : null,
    sourceLetterId: locked.has(index) ? `locked-${index}` : null,
    locked: locked.has(index)
  }));
}

function pickDistractors(wordChars, count) {
  const distractors = new Set();
  wordChars.forEach((char) => {
    const similar = CONFUSION_MAP[char];
    if (Array.isArray(similar)) {
      similar.forEach((candidate) => distractors.add(candidate));
    }
  });
  const ordered = Array.from(distractors);
  if (ordered.length >= count) {
    return ordered.slice(0, count);
  }
  const fallbackPool = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
  let poolIndex = 0;
  while (ordered.length < count && poolIndex < fallbackPool.length) {
    const letter = fallbackPool[poolIndex];
    if (!wordChars.includes(letter)) {
      ordered.push(letter);
    }
    poolIndex += 1;
  }
  return ordered.slice(0, count);
}

function generateRiverLetters(word, slots, difficulty) {
  const difficultyConfig = getDifficultyConfig(difficulty);
  const neededChars = [];
  slots.forEach((slot) => {
    if (!slot.locked) {
      neededChars.push({ char: slot.char, label: slot.label });
    }
  });
  const baseLetters = neededChars.map((slotInfo, index) => ({
    id: `needed-${index}-${slotInfo.char}-${Math.random().toString(36).slice(2, 7)}`,
    char: slotInfo.char,
    label: slotInfo.label,
    kind: 'target',
    top: 10 + Math.random() * 65,
    driftDistance: 30 + Math.random() * 40,
    driftDuration: 8 + Math.random() * 5
  }));
  const distractorChars = pickDistractors(Array.from(word), difficultyConfig.distractorCount);
  const distractors = distractorChars.map((char, index) => ({
    id: `distractor-${index}-${char}-${Math.random().toString(36).slice(2, 7)}`,
    char,
    label: getHebrewPhoneticLabel(char),
    kind: 'distractor',
    top: 10 + Math.random() * 65,
    driftDistance: 25 + Math.random() * 35,
    driftDuration: 9 + Math.random() * 6
  }));
  return shuffle([...baseLetters, ...distractors]);
}

function useDropZones() {
  const dropZonesRef = useRef([]);

  const registerDropZone = useCallback(({ element, data }) => {
    if (!element) return () => {};
    const zone = { element, data };
    dropZonesRef.current = [...dropZonesRef.current, zone];
    return () => {
      dropZonesRef.current = dropZonesRef.current.filter((item) => item !== zone);
    };
  }, []);

  const getDropZones = useCallback(() => dropZonesRef.current, []);

  return { registerDropZone, getDropZones };
}

function FloatingLetter({ letter, fontClass, getDropZones, onLetterDrop }) {
  const ref = useRef(null);

  useRiverPointerDrag(ref, {
    enabled: true,
    payload: { letter, origin: { type: 'river', letterId: letter.id } },
    getDropZones,
    ghostClassName: `${fontClass} text-5xl font-semibold text-cyan-200 drop-shadow-lg px-2 py-1`,
    getGhostContent: () => letter.label,
    onDrop: ({ zone, payload }) => onLetterDrop({ letter: payload.letter, zone, origin: payload.origin }),
    freezeWhileDragging: true
  });

  return (
    <div
      ref={ref}
      className={classNames(
        'word-river-floating-letter',
        'absolute select-none rounded-2xl px-3 py-2 text-4xl font-semibold text-cyan-200 shadow-lg backdrop-blur-sm',
        fontClass
      )}
      style={{
        top: `${letter.top}%`,
        '--drift-distance': `${letter.driftDistance}px`,
        '--drift-duration': `${letter.driftDuration}s`
      }}
      aria-hidden="true"
    >
      {letter.label}
    </div>
  );
}

FloatingLetter.propTypes = {
  letter: PropTypes.shape({
    id: PropTypes.string.isRequired,
    char: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    top: PropTypes.number.isRequired,
    driftDistance: PropTypes.number.isRequired,
    driftDuration: PropTypes.number.isRequired
  }).isRequired,
  fontClass: PropTypes.string.isRequired,
  getDropZones: PropTypes.func.isRequired,
  onLetterDrop: PropTypes.func.isRequired
};

function SpellingSlot({
  slot,
  fontClass,
  registerDropZone,
  getDropZones,
  onLetterDrop,
  textDirection
}) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return () => {};
    return registerDropZone({
      element,
      data: { type: 'slot', slotId: slot.id }
    });
  }, [registerDropZone, slot.id]);

  useRiverPointerDrag(ref, {
    enabled: Boolean(slot.filledChar) && !slot.locked,
    payload: {
      letter: { id: slot.sourceLetterId ?? `filled-${slot.id}`, char: slot.filledChar, label: slot.filledLabel ?? slot.label },
      origin: { type: 'slot', slotId: slot.id, letterId: slot.sourceLetterId ?? null }
    },
    getDropZones,
    ghostClassName: `${fontClass} text-5xl font-semibold text-cyan-200 drop-shadow-lg px-2 py-1`,
    getGhostContent: () => slot.filledLabel ?? slot.label ?? '',
    onDrop: ({ zone, payload }) => onLetterDrop({ letter: payload.letter, zone, origin: payload.origin }),
    freezeWhileDragging: true
  });

  return (
    <div
      ref={ref}
      className={classNames(
        'word-river-spelling-slot',
        'flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-3xl font-semibold transition-all',
        fontClass,
        {
          'word-river-spelling-slot-filled': Boolean(slot.filledChar),
          'word-river-spelling-slot-empty': !slot.filledChar,
          'opacity-70': slot.locked
        }
      )}
      dir={textDirection}
    >
      {slot.filledChar || slot.locked ? slot.filledLabel ?? slot.label ?? '' : ''}
    </div>
  );
}

SpellingSlot.propTypes = {
  slot: PropTypes.shape({
    id: PropTypes.string.isRequired,
    char: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    filledChar: PropTypes.string,
    filledLabel: PropTypes.string,
    sourceLetterId: PropTypes.string,
    locked: PropTypes.bool
  }).isRequired,
  fontClass: PropTypes.string.isRequired,
  registerDropZone: PropTypes.func.isRequired,
  getDropZones: PropTypes.func.isRequired,
  onLetterDrop: PropTypes.func.isRequired,
  textDirection: PropTypes.string.isRequired
};

export default function SpellingRiver({
  object,
  difficulty,
  fontClass,
  textDirection,
  onCompleted,
  onFirstLetterShown
}) {
  const difficultyConfig = getDifficultyConfig(difficulty);
  const [slots, setSlots] = useState(() => buildSlots(object.l2Word, difficultyConfig.type, object.l2Phonetics));
  const [letters, setLetters] = useState(() =>
    generateRiverLetters(object.l2Word, buildSlots(object.l2Word, difficultyConfig.type, object.l2Phonetics), difficulty)
  );
  const riverRef = useRef(null);
  const cooldownRef = useRef(false);
  const { registerDropZone, getDropZones } = useDropZones();
  const completedRef = useRef(false);
  const announcedLettersRef = useRef(false);

  useEffect(() => {
    announcedLettersRef.current = false;
    const nextSlots = buildSlots(object.l2Word, difficultyConfig.type, object.l2Phonetics);
    setSlots(nextSlots);
    setLetters(generateRiverLetters(object.l2Word, nextSlots, difficulty));
    playWordAudio(object.audioKey);
  }, [object, difficulty, difficultyConfig.type]);

  const phoneticGhost = useMemo(
    () => getWordPhonetics(object.l2Word, object.l2Phonetics).join(' '),
    [object.l2Phonetics, object.l2Word]
  );

  useEffect(() => {
    if (announcedLettersRef.current) return;
    if (letters.length === 0) return;
    announcedLettersRef.current = true;
    if (onFirstLetterShown) {
      onFirstLetterShown();
    }
  }, [letters, onFirstLetterShown]);

  useEffect(() => {
    const element = riverRef.current;
    if (!element) return () => {};
    return registerDropZone({
      element,
      data: { type: 'river' }
    });
  }, [registerDropZone]);

  const allCorrect = useMemo(
    () => slots.every((slot) => slot.filledChar === slot.char),
    [slots]
  );

  useEffect(() => {
    if (allCorrect && !completedRef.current) {
      completedRef.current = true;
      onCompleted();
    }
    if (!allCorrect) {
      completedRef.current = false;
    }
  }, [allCorrect, onCompleted]);

  const handleLetterDrop = useCallback(
    ({ letter, zone, origin }) => {
      if (!zone) {
        return { accepted: false };
      }
      const zoneType = zone.data?.type;
      if (zoneType === 'river') {
        if (origin?.type !== 'slot') {
          return { accepted: false };
        }
        setSlots((prev) =>
          prev.map((slot) => {
            if (slot.id === origin.slotId) {
              return { ...slot, filledChar: null, filledLabel: null, sourceLetterId: null };
            }
            return slot;
          })
        );
        setLetters((prev) => [
          ...prev,
          { ...letter, id: `${letter.id}-return-${Math.random().toString(36).slice(2, 6)}` }
        ]);
        return { accepted: true };
      }
      if (zoneType === 'slot') {
        const targetSlotId = zone.data.slotId;
        let letterToReturn = null;
        setSlots((prevSlots) =>
          prevSlots.map((slot) => {
            if (slot.id !== targetSlotId || slot.locked) {
              return slot;
            }
            if (slot.filledChar && slot.sourceLetterId && slot.sourceLetterId !== letter.id) {
              letterToReturn = {
                id: `${slot.sourceLetterId}-swap-${Math.random().toString(36).slice(2, 6)}`,
                char: slot.filledChar,
                label: slot.filledLabel ?? slot.label,
                kind: 'target',
                top: 15 + Math.random() * 60,
                driftDistance: 20 + Math.random() * 40,
                driftDuration: 8 + Math.random() * 6
              };
            }
            return {
              ...slot,
              filledChar: letter.char,
              filledLabel: letter.label,
              sourceLetterId: letter.id
            };
          })
        );
        if (origin?.type === 'slot') {
          setSlots((prev) =>
            prev.map((slot) => {
              if (slot.id === origin.slotId && slot.id !== targetSlotId) {
                return { ...slot, filledChar: null, filledLabel: null, sourceLetterId: null };
              }
              return slot;
            })
          );
        }
        setLetters((prev) => prev.filter((item) => item.id !== letter.id));
        if (letterToReturn) {
          setLetters((prev) => [...prev, letterToReturn]);
        }
        return { accepted: true };
      }
      return { accepted: false };
    },
    []
  );

  const onReplayAudio = useCallback(() => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    playWordAudio(object.audioKey).finally(() => {
      setTimeout(() => {
        cooldownRef.current = false;
      }, 400);
    });
  }, [object.audioKey]);

  return (
    <div className="word-river-spelling">
      <div className="word-river-spelling-audio">
        <button
          type="button"
          className="word-river-audio-button"
          onClick={onReplayAudio}
          aria-label={`Replay ${object.l2Word} audio`}
        >
          <span className="sr-only">Replay {object.l2Word} audio</span>
          <span aria-hidden="true">🔈</span>
        </button>
      </div>
      <div className="word-river-spelling-focus">
        <div className="word-river-spelling-bucket">
          <WordRiverObjectIcon svgId={object.svgId} className="word-river-spelling-bucket-icon" />
        </div>
        {difficultyConfig.type === 'ghost' ? (
          <div className={classNames('word-river-spelling-ghost', fontClass)} dir={textDirection}>
            {phoneticGhost}
          </div>
        ) : null}
        <div
          className={classNames('word-river-spelling-slots', fontClass)}
          dir={textDirection}
          style={textDirection === 'rtl' ? { flexDirection: 'row-reverse' } : undefined}
        >
          {slots.map((slot) => (
            <SpellingSlot
              key={slot.id}
              slot={slot}
              fontClass={fontClass}
              registerDropZone={registerDropZone}
              getDropZones={getDropZones}
              onLetterDrop={handleLetterDrop}
              textDirection={textDirection}
            />
          ))}
        </div>
      </div>
      <div ref={riverRef} className="word-river-spelling-river" aria-hidden="true">
        {letters.map((letter) => (
          <FloatingLetter
            key={letter.id}
            letter={letter}
            fontClass={fontClass}
            getDropZones={getDropZones}
            onLetterDrop={handleLetterDrop}
          />
        ))}
      </div>
    </div>
  );
}

SpellingRiver.propTypes = {
  object: PropTypes.shape({
    svgId: PropTypes.string.isRequired,
    l2Word: PropTypes.string.isRequired,
    l2Phonetics: PropTypes.arrayOf(PropTypes.string),
    audioKey: PropTypes.string.isRequired
  }).isRequired,
  difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']).isRequired,
  fontClass: PropTypes.string.isRequired,
  textDirection: PropTypes.string.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onFirstLetterShown: PropTypes.func
};

SpellingRiver.defaultProps = {
  onFirstLetterShown: null
};
