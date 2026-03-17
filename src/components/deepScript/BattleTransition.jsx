import React, { useEffect, useState } from 'react';
import { playBattleEncounter } from './dsSounds.js';

/**
 * BattleTransition — RPG-style screen transition before combat.
 *
 * Classic effect: screen flashes white, diagonal slashes tear across the
 * viewport, then the screen shatters into darkness before combat begins.
 *
 * Duration: ~1.6s total, then calls onComplete.
 */
export default function BattleTransition({ onComplete, isMiniboss }) {
  const [phase, setPhase] = useState('flash'); // flash → slashes → shatter → done

  useEffect(() => {
    playBattleEncounter();
    // flash (0-300ms) → slashes (300-900ms) → shatter (900-1400ms) → done
    const t1 = setTimeout(() => setPhase('slashes'), 300);
    const t2 = setTimeout(() => setPhase('shatter'), 900);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className={`ds-battle-transition ds-battle-transition--${phase} ${isMiniboss ? 'ds-battle-transition--boss' : ''}`}>
      {/* White flash overlay */}
      <div className="ds-bt-flash" />

      {/* Diagonal slash lines */}
      <div className="ds-bt-slashes">
        <div className="ds-bt-slash ds-bt-slash--1" />
        <div className="ds-bt-slash ds-bt-slash--2" />
        <div className="ds-bt-slash ds-bt-slash--3" />
        <div className="ds-bt-slash ds-bt-slash--4" />
      </div>

      {/* Shatter / darkness wipe */}
      <div className="ds-bt-shatter">
        <div className="ds-bt-shard ds-bt-shard--tl" />
        <div className="ds-bt-shard ds-bt-shard--tr" />
        <div className="ds-bt-shard ds-bt-shard--bl" />
        <div className="ds-bt-shard ds-bt-shard--br" />
      </div>

      {/* Encounter text */}
      <div className="ds-bt-text">
        {isMiniboss ? '⚔ BOSS ENCOUNTER ⚔' : '⚔ ENCOUNTER ⚔'}
      </div>
    </div>
  );
}
