import React, { useMemo } from 'react';
import { deepScriptWords } from '../../data/deepScript/words.js';
import RunStatusBar from './RunStatusBar.jsx';
import PillarMiniGame from './PillarMiniGame.jsx';
import FloatingCapsulesGame from '../FloatingCapsulesGame.jsx';

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildCapsulePairs() {
  const words = shuffle(deepScriptWords.filter(word => !word.isMiniboss && word.english)).slice(0, 4);
  return words.map(word => ({
    hebrew: word.hebrew,
    transliteration: word.transliteration,
    meaning: word.english,
  }));
}

export default function MiniGameScreen({ miniGameId, runState, onComplete }) {
  const capsulePairs = useMemo(() => buildCapsulePairs(), []);

  const config = {
    pillar: {
      title: 'Pillar Game',
      description: 'Rotate each lower stone slat until every translation matches the Hebrew word above it.',
    },
    capsules: {
      title: 'Capsule Match',
      description: 'Drag floating capsules together so each Hebrew word joins its matching transliteration or meaning.',
    },
  }[miniGameId] || {
    title: 'Chamber Trial',
    description: 'Complete the chamber challenge to proceed.',
  };

  return (
    <div className="ds-screen ds-minigame-screen">
      <RunStatusBar runState={runState} />

      <div className="ds-minigame-content">
        <h2 className="ds-minigame-title">{config.title}</h2>
        <p className="ds-minigame-description">{config.description}</p>

        <div className="ds-minigame-playarea">
          {miniGameId === 'pillar' && (
            <PillarMiniGame onSolved={onComplete} />
          )}

          {miniGameId === 'capsules' && (
            <FloatingCapsulesGame
              wordPairs={capsulePairs}
              onComplete={() => onComplete()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
