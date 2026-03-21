import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getStarterKit } from '../../data/deepScript/starterKits.js';
import { generateDungeonFloor, CHAMBER_TYPES } from '../../data/deepScript/floorGenerator.js';
import { createRunState } from './deepScriptEngine.js';
import { registerCustomWords, clearCustomWords } from '../../data/deepScript/words.js';
import KitSelectScreen from './KitSelectScreen.jsx';
import ExplorationScreen from './ExplorationScreen.jsx';
import BattleTransition from './BattleTransition.jsx';
import CombatScreen from './CombatScreen.jsx';
import MiniGameScreen from './MiniGameScreen.jsx';
import RunEndScreen from './RunEndScreen.jsx';
import './DeepScript.css';

/**
 * DeepScriptMode — top-level orchestrator for the Deep Script game mode.
 *
 * Flow: Kit Select → Exploration (move/turn/inspect/trigger) →
 *       Combat/Archive/Shrine → back to Exploration → ... → Miniboss → End
 */
function collectFloorWordIds(floor) {
  if (!floor?.chambers) return new Set();
  const wordIds = new Set();
  for (const chamber of floor.chambers.values()) {
    if (chamber?.payload?.wordId) {
      wordIds.add(chamber.payload.wordId);
    }
  }
  return wordIds;
}

export default function DeepScriptMode({ onBack, packWords, onRunComplete, isGuidedPackRun = false }) {
  const hasCustomWordPool = !!(packWords && packWords.length > 0);
  const previousFloorWordIdsRef = useRef(new Set());
  const [screen, setScreen] = useState('kit_select'); // kit_select | exploring | combat | minigame | end
  const [runState, setRunState] = useState(null);
  const [endResult, setEndResult] = useState(null);
  const [floorNumber, setFloorNumber] = useState(1);

  // Exploration state
  const [floor, setFloor] = useState(null);
  const [currentChamberId, setCurrentChamberId] = useState(null);

  // Active encounter context
  const [activeCombat, setActiveCombat] = useState(null); // { wordId, chamberId, isMiniboss }
  const [activeMiniGame, setActiveMiniGame] = useState(null); // { chamberId, miniGameId }

  const createFloorForNumber = useCallback((targetFloorNumber) => {
    const combatCount = Math.min(6, 3 + Math.floor((targetFloorNumber - 1) / 2));
    const nextFloor = generateDungeonFloor({
      combatCount,
      customWords: hasCustomWordPool ? packWords : null,
      excludeWordIds: previousFloorWordIdsRef.current,
    });
    previousFloorWordIdsRef.current = collectFloorWordIds(nextFloor);
    return nextFloor;
  }, [hasCustomWordPool, packWords]);

  // Add/remove body class for nav bar hiding; clean up custom words on unmount
  useEffect(() => {
    document.body.classList.add('in-deep-script');
    return () => {
      document.body.classList.remove('in-deep-script');
      clearCustomWords();
    };
  }, []);

  // ─── Kit Selection ────────────────────────────────────────

  const handleKitSelect = useCallback((kitId) => {
    const kit = getStarterKit(kitId);
    if (!kit) return;

    // Register custom words if running a pack-based session
    if (hasCustomWordPool) {
      registerCustomWords(packWords);
    } else {
      clearCustomWords();
    }

    // Generate dungeon floor (pass custom words if available)
    const newFloor = createFloorForNumber(1);

    // Create run state (pass a dummy runMap for backward compat)
    const newRun = createRunState(kit, [], []);
    // Add floor reference
    newRun.floor = newFloor;

    setRunState(newRun);
    setFloor(newFloor);
    setCurrentChamberId(newFloor.startChamberId);
    setFloorNumber(1);
    setScreen('exploring');
  }, [createFloorForNumber, hasCustomWordPool, packWords]);

  // ─── Exploration: Movement ────────────────────────────────

  const handleMove = useCallback((targetChamberId) => {
    if (!floor) return;

    setCurrentChamberId(targetChamberId);

    // Mark chamber as visited
    setFloor(prev => {
      const newChambers = new Map(prev.chambers);
      const chamber = { ...newChambers.get(targetChamberId), visited: true };
      newChambers.set(targetChamberId, chamber);
      return { ...prev, chambers: newChambers };
    });

    // Use current chamber snapshot to decide whether to trigger combat
    const chamber = floor.chambers.get(targetChamberId);
    if (!chamber) return;

    // Auto-trigger combat in unresolved combat/miniboss chambers
    if (!chamber.resolved) {
      if (chamber.type === CHAMBER_TYPES.COMBAT || chamber.type === CHAMBER_TYPES.MINIBOSS) {
        // Small delay to let the room render first, then show battle transition
        setTimeout(() => {
          setActiveCombat({
            wordId: chamber.payload?.wordId,
            chamberId: targetChamberId,
            isMiniboss: chamber.type === CHAMBER_TYPES.MINIBOSS,
          });
          setScreen('battle_transition');
        }, 600);
      }
    }
  }, [floor]);

  // ─── Exploration: Trigger encounters from hotspots ────────

  const handleTriggerCombat = useCallback((wordId, chamberId) => {
    const chamber = floor?.chambers.get(chamberId);
    setActiveCombat({
      wordId,
      chamberId,
      isMiniboss: chamber?.type === CHAMBER_TYPES.MINIBOSS,
    });
    setScreen('battle_transition');
  }, [floor]);

  const handleBattleTransitionComplete = useCallback(() => {
    setScreen('combat');
  }, []);

  const handleTriggerMiniGame = useCallback((chamberId, miniGameId) => {
    setActiveMiniGame({ chamberId, miniGameId });
    setScreen('minigame');
  }, []);

  const handleLoot = useCallback((chamberId, interactableId) => {
    // Loot effect: heal 1 HP
    setRunState(prev => ({
      ...prev,
      health: Math.min(prev.maxHealth, prev.health + 1),
    }));
  }, []);

  const handleResolveInteractable = useCallback((chamberId, interactableId) => {
    setFloor(prev => {
      const newChambers = new Map(prev.chambers);
      const chamber = { ...newChambers.get(chamberId) };
      chamber.interactables = chamber.interactables.map(obj =>
        obj.id === interactableId ? { ...obj, resolved: true } : obj
      );
      newChambers.set(chamberId, chamber);
      return { ...prev, chambers: newChambers };
    });
  }, []);

  // ─── Combat End ───────────────────────────────────────────

  const handleCombatEnd = useCallback((result, wordId) => {
    const { chamberId, isMiniboss } = activeCombat || {};

    if (result === 'victory') {
      // Mark chamber as resolved
      setFloor(prev => {
        const newChambers = new Map(prev.chambers);
        const chamber = { ...newChambers.get(chamberId), resolved: true };
        // Also resolve the sigil interactable
        chamber.interactables = chamber.interactables.map(obj =>
          obj.action === 'trigger-combat' ? { ...obj, resolved: true } : obj
        );
        newChambers.set(chamberId, chamber);
        return { ...prev, chambers: newChambers };
      });

      setRunState(prev => ({
        ...prev,
        combatsWon: prev.combatsWon + 1,
        wordsCompleted: [...prev.wordsCompleted, wordId],
        roomsCompleted: prev.roomsCompleted + 1,
      }));

      // Check if miniboss was defeated = victory
      if (isMiniboss) {
        setEndResult('victory');
        setScreen('end');
        if (onRunComplete && isGuidedPackRun) onRunComplete('victory');
      } else {
        setScreen('exploring');
      }
    } else {
      // Defeat — lose health
      setRunState(prev => {
        const newHealth = prev.health - 1;
        if (newHealth <= 0) {
          setEndResult('defeat');
          setScreen('end');
          return { ...prev, health: 0 };
        }
        return { ...prev, health: newHealth };
      });

      // If still alive, return to exploration (retreat from combat)
      setRunState(prev => {
        if (prev.health > 0) {
          // Don't mark chamber as resolved — they can try again
          return prev;
        }
        return prev;
      });

      // Check health after state update
      setTimeout(() => {
        setRunState(prev => {
          if (prev.health > 0) {
            setScreen('exploring');
          }
          return prev;
        });
      }, 0);
    }

    setActiveCombat(null);
  }, [activeCombat, isGuidedPackRun, onRunComplete]);

  const handleNextFloor = useCallback(() => {
    if (isGuidedPackRun) {
      setEndResult('victory');
      setScreen('end');
      return;
    }
    const nextFloorNumber = floorNumber + 1;
    const nextFloor = createFloorForNumber(nextFloorNumber);

    setFloor(nextFloor);
    setCurrentChamberId(nextFloor.startChamberId);
    setActiveCombat(null);
    setActiveMiniGame(null);
    setRunState(prev => ({
      ...prev,
      floor: nextFloor,
      health: Math.min(prev.maxHealth, prev.health + 1),
    }));
    setFloorNumber(nextFloorNumber);
    setScreen('exploring');
  }, [createFloorForNumber, floorNumber, isGuidedPackRun]);

  // ─── Mini-game End ────────────────────────────────────────

  const handleMiniGameComplete = useCallback(() => {
    const { chamberId } = activeMiniGame || {};
    if (!chamberId) return;

    setFloor(prev => {
      const newChambers = new Map(prev.chambers);
      const chamber = { ...newChambers.get(chamberId), resolved: true };
      chamber.interactables = chamber.interactables.map(obj =>
        obj.action === 'trigger-minigame' ? { ...obj, resolved: true } : obj
      );
      newChambers.set(chamberId, chamber);
      return { ...prev, chambers: newChambers };
    });

    setRunState(prev => ({
      ...prev,
      roomsCompleted: prev.roomsCompleted + 1,
    }));

    setActiveMiniGame(null);
    setScreen('exploring');
  }, [activeMiniGame]);

  // ─── Restart / Back ───────────────────────────────────────

  const handleRestart = useCallback(() => {
    clearCustomWords();
    setScreen('kit_select');
    setRunState(null);
    setFloor(null);
    setCurrentChamberId(null);
    setActiveMiniGame(null);
    setEndResult(null);
    setFloorNumber(1);
    previousFloorWordIdsRef.current = new Set();
  }, []);

  // ─── Render ───────────────────────────────────────────────

  if (screen === 'kit_select') {
    return (
      <div className="ds-mode">
        <KitSelectScreen onSelect={handleKitSelect} onBack={onBack} />
      </div>
    );
  }

  if (screen === 'end') {
    return (
      <div className="ds-mode">
        <RunEndScreen
          result={endResult}
          runState={runState}
          floorNumber={floorNumber}
          onNextFloor={handleNextFloor}
          onRestart={handleRestart}
          onBack={onBack}
          canAdvanceFloor={!isGuidedPackRun}
        />
      </div>
    );
  }

  if (!runState || !floor) return null;

  // Battle transition
  if (screen === 'battle_transition' && activeCombat) {
    return (
      <div className="ds-mode">
        <BattleTransition
          onComplete={handleBattleTransitionComplete}
          isMiniboss={activeCombat.isMiniboss}
        />
      </div>
    );
  }

  // Combat screen
  if (screen === 'combat' && activeCombat) {
    return (
      <div className="ds-mode">
        <CombatScreen
          wordId={activeCombat.wordId}
          runState={runState}
          onEnd={handleCombatEnd}
          isMiniboss={activeCombat.isMiniboss}
        />
      </div>
    );
  }

  // Mini-game screen
  if (screen === 'minigame' && activeMiniGame) {
    return (
      <div className="ds-mode">
        <MiniGameScreen
          miniGameId={activeMiniGame.miniGameId}
          runState={runState}
          onComplete={handleMiniGameComplete}
        />
      </div>
    );
  }

  // Exploration
  return (
    <div className="ds-mode">
      <ExplorationScreen
        floor={floor}
        currentChamberId={currentChamberId}
        onMove={handleMove}
        onTriggerCombat={handleTriggerCombat}
        onTriggerMiniGame={handleTriggerMiniGame}
        onLoot={handleLoot}
        onResolveInteractable={handleResolveInteractable}
        runState={runState}
      />
    </div>
  );
}
