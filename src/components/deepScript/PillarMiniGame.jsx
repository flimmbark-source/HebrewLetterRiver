import React, { useMemo, useState } from 'react';
import { deepScriptWords } from '../../data/deepScript/words.js';
import { useFontSettings } from '../../hooks/useFontSettings.js';
import { getNativeScript, getMeaning, getTextDirection } from '../../lib/vocabLanguageAdapter.js';

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPillarRows(wordPool = deepScriptWords, selectedWordsOverride = null) {
  const candidates = wordPool.filter(word => !word.isMiniboss && getMeaning(word));
  const selectedWords = selectedWordsOverride?.length
    ? selectedWordsOverride.filter(word => getMeaning(word) && !word?.isMiniboss)
    : shuffle(candidates).slice(0, 3);

  const selectedAnswerSet = new Set(selectedWords.map(word => getMeaning(word)).filter(Boolean));

  const sharedAnswers = Array.from(
    new Set(selectedWords.map(word => getMeaning(word)).filter(Boolean))
  );

    const extraDistractors = shuffle(
    candidates
      .map(word => getMeaning(word))
      .filter(Boolean)
      .filter(answer => !selectedAnswerSet.has(answer))
  );
  if (extraDistractors.length > 0) {
    sharedAnswers.push(extraDistractors[0]);
  }

  return selectedWords.map((word) => {
    const options = shuffle(sharedAnswers);
    const correctTranslation = getMeaning(word);
    const correctIndex = options.findIndex(option => option === correctTranslation);
    const availableStartIndexes = options
      .map((_, index) => index)
      .filter(index => index !== correctIndex);
    const startIndex = availableStartIndexes.length
      ? availableStartIndexes[Math.floor(Math.random() * availableStartIndexes.length)]
      : 0;

    return {
      id: word.id,
      hebrew: getNativeScript(word),
      nativeScript: getNativeScript(word),
      languageId: word.languageId || 'hebrew',
      correctTranslation,
      options,
      currentIndex: startIndex,
    };
  });
}

export default function PillarMiniGame({
  onSolved,
  compact = false,
  wordPool = deepScriptWords,
  selectedWords = null,
}) {
  const { getGameFontClass } = useFontSettings();
  const [rows, setRows] = useState(() => buildPillarRows(wordPool, selectedWords));
  const [spinningRowId, setSpinningRowId] = useState(null);
  const [showProceed, setShowProceed] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const pointerStartRef = React.useRef({});
  const ignoreClickRef = React.useRef({});
  const proceedTriggeredRef = React.useRef(false);

  const solved = useMemo(
    () => rows.every(row => row.options[row.currentIndex] === row.correctTranslation),
    [rows]
  );

  const cycleRow = (rowId, direction = 1) => {
    if (showProceed || isCompleting) return;
    setRows(prev => {
      const next = prev.map(row => {
        if (row.id !== rowId) return row;
        const length = row.options.length;
        const nextIndex = (row.currentIndex + direction + length) % length;
        return { ...row, currentIndex: nextIndex };
      });
      return next;
    });
    setSpinningRowId(rowId);
    setTimeout(() => setSpinningRowId(current => (current === rowId ? null : current)), 280);
  };

  React.useEffect(() => {
    if (solved && !isCompleting) {
      setShowProceed(true);
    }
  }, [solved, isCompleting]);

  const handleProceed = () => {
    if (!solved || isCompleting || proceedTriggeredRef.current) return;

    proceedTriggeredRef.current = true;
    setShowProceed(false);
    setIsCompleting(true);
    setTimeout(() => onSolved(), 600);
  };

  const onPointerDown = (rowId, event) => {
    pointerStartRef.current[rowId] = event.clientX;
  };

  const onPointerUp = (rowId, event) => {
    ignoreClickRef.current[rowId] = true;
    setTimeout(() => {
      delete ignoreClickRef.current[rowId];
    }, 0);

    const startX = pointerStartRef.current[rowId];
    if (typeof startX !== 'number') {
      cycleRow(rowId, 1);
      return;
    }

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) < 20) {
      cycleRow(rowId, 1);
    } else {
      cycleRow(rowId, deltaX > 0 ? 1 : -1);
    }
    delete pointerStartRef.current[rowId];
  };

  return (
    <div className={`ds-pillar-game ${compact ? 'ds-pillar-game--compact' : ''} ${isCompleting ? 'ds-pillar-game--completing' : ''}`}>
      <div className="ds-pillar-core" aria-hidden="true" />
      {rows.map((row) => (
        <React.Fragment key={row.id}>
          <div className="ds-pillar-slat ds-pillar-slat--fixed" dir={getTextDirection(row.languageId || 'hebrew')} aria-label={`Word ${row.nativeScript || row.hebrew}`}>
            <span className={getGameFontClass(`${row.id}-hebrew`)}>{row.nativeScript || row.hebrew}</span>
          </div>
          <button
            type="button"
            className={`ds-pillar-slat ds-pillar-slat--rotating ${spinningRowId === row.id ? 'ds-pillar-slat--spinning' : ''} ${solved ? 'ds-pillar-slat--solved' : ''}`}
            disabled={showProceed || isCompleting}
            onClick={() => {
              if (ignoreClickRef.current[row.id]) return;
              cycleRow(row.id, 1);
            }}
            onPointerDown={(event) => onPointerDown(row.id, event)}
            onPointerUp={(event) => onPointerUp(row.id, event)}
          >
            <span className={`ds-pillar-slat-text ${getGameFontClass(`${row.id}-${row.options[row.currentIndex]}`)}`}>{row.options[row.currentIndex]}</span>
          </button>
          <div className="ds-pillar-gap" aria-hidden="true" />
        </React.Fragment>
      ))}

      {solved && !showProceed && !isCompleting && <div className="ds-pillar-solved">Pillar aligned</div>}
      {showProceed && (
        <button
          type="button"
          className="ds-pillar-proceed-btn"
          onClick={handleProceed}
          onPointerUp={handleProceed}
        >
          Proceed
        </button>
      )}
    </div>
  );
}
