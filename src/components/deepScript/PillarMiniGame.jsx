import React, { useMemo, useState } from 'react';
import { deepScriptWords } from '../../data/deepScript/words.js';

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildPillarRows(wordPool = deepScriptWords, selectedWordsOverride = null) {
  const candidates = wordPool.filter(word => !word.isMiniboss && word.english);
  const selectedWords = selectedWordsOverride?.length
    ? selectedWordsOverride.filter(word => word?.english && !word?.isMiniboss)
    : shuffle(candidates).slice(0, 3);

  return selectedWords.map((word) => {
    const distractors = shuffle(
      candidates
        .filter(candidate => candidate.id !== word.id && candidate.english !== word.english)
        .map(candidate => candidate.english)
    ).slice(0, 4);

    const options = shuffle([word.english, ...distractors]);
    const startIndex = Math.floor(Math.random() * options.length);

    return {
      id: word.id,
      hebrew: word.hebrew,
      correctTranslation: word.english,
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
  const [rows, setRows] = useState(() => buildPillarRows(wordPool, selectedWords));
  const [spinningRowId, setSpinningRowId] = useState(null);
  const [showProceed, setShowProceed] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const pointerStartRef = React.useRef({});

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
    if (!solved || isCompleting) return;
    setShowProceed(false);
    setIsCompleting(true);
    setTimeout(() => onSolved(), 600);
  };

  const onPointerDown = (rowId, event) => {
    pointerStartRef.current[rowId] = event.clientX;
  };

  const onPointerUp = (rowId, event) => {
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
      {/* Stone pillar body */}
      <div className="ds-pillar-body" aria-hidden="true">
        <div className="ds-pillar-cap ds-pillar-cap--top" />
        <div className="ds-pillar-shaft">
          <div className="ds-pillar-core" />
        </div>
        <div className="ds-pillar-cap ds-pillar-cap--bottom" />
      </div>

      {/* Slats carved into the pillar */}
      <div className="ds-pillar-slats">
        {rows.map((row) => {
          const isCorrect = row.options[row.currentIndex] === row.correctTranslation;
          return (
            <React.Fragment key={row.id}>
              <div className="ds-pillar-slat ds-pillar-slat--fixed" aria-label={`Hebrew word ${row.hebrew}`}>
                <span className="ds-pillar-rune">{row.hebrew}</span>
              </div>
              <button
                type="button"
                className={`ds-pillar-slat ds-pillar-slat--rotating ${spinningRowId === row.id ? 'ds-pillar-slat--spinning' : ''} ${isCorrect && !isCompleting ? 'ds-pillar-slat--aligned' : ''}`}
                disabled={showProceed || isCompleting}
                onClick={() => cycleRow(row.id, 1)}
                onPointerDown={(event) => onPointerDown(row.id, event)}
                onPointerUp={(event) => onPointerUp(row.id, event)}
              >
                <span className="ds-pillar-slat-text">{row.options[row.currentIndex]}</span>
              </button>
              <div className="ds-pillar-gap" aria-hidden="true" />
            </React.Fragment>
          );
        })}
      </div>

      {solved && !showProceed && !isCompleting && (
        <div className="ds-pillar-solved">Pillar aligned</div>
      )}
      {showProceed && (
        <button type="button" className="ds-pillar-proceed-btn" onClick={handleProceed}>
          Proceed
        </button>
      )}
    </div>
  );
}
