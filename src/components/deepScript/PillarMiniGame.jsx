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

function buildPillarRows() {
  const candidates = deepScriptWords.filter(word => !word.isMiniboss && word.english);
  const selectedWords = shuffle(candidates).slice(0, 3);

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

export default function PillarMiniGame({ onSolved, compact = false }) {
  const [rows, setRows] = useState(() => buildPillarRows());
  const [spinningRowId, setSpinningRowId] = useState(null);
  const pointerStartRef = React.useRef({});

  const solved = useMemo(
    () => rows.every(row => row.options[row.currentIndex] === row.correctTranslation),
    [rows]
  );

  const cycleRow = (rowId, direction = 1) => {
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
    if (!solved) return;
    const timeout = setTimeout(() => onSolved(), 500);
    return () => clearTimeout(timeout);
  }, [solved, onSolved]);

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
    <div className={`ds-pillar-game ${compact ? 'ds-pillar-game--compact' : ''}`}>
      <div className="ds-pillar-core" aria-hidden="true" />
      {rows.map((row) => (
        <React.Fragment key={row.id}>
          <div className="ds-pillar-slat ds-pillar-slat--fixed" aria-label={`Hebrew word ${row.hebrew}`}>
            {row.hebrew}
          </div>
          <button
            type="button"
            className={`ds-pillar-slat ds-pillar-slat--rotating ${spinningRowId === row.id ? 'ds-pillar-slat--spinning' : ''}`}
            onClick={() => cycleRow(row.id, 1)}
            onPointerDown={(event) => onPointerDown(row.id, event)}
            onPointerUp={(event) => onPointerUp(row.id, event)}
          >
            <span className="ds-pillar-slat-text">{row.options[row.currentIndex]}</span>
          </button>
          <div className="ds-pillar-gap" aria-hidden="true" />
        </React.Fragment>
      ))}

      {solved && <div className="ds-pillar-solved">Pillar aligned</div>}
    </div>
  );
}
