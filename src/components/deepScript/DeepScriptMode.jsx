import React, { useState, useCallback, useEffect, useRef } from 'react';
import { getStarterKit } from '../../data/deepScript/starterKits.js';
import { generateDungeonFloor, CHAMBER_TYPES } from '../../data/deepScript/floorGenerator.js';
import { createRunState } from './deepScriptEngine.js';
import { registerCustomWords, clearCustomWords, convertBBWordsForDS, getWordById, deepScriptWords } from '../../data/deepScript/words.js';
import { bridgeBuilderPacks } from '../../data/bridgeBuilderPacks.js';
import { getWordsByIds } from '../../data/bridgeBuilderWords.js';
import KitSelectScreen from './KitSelectScreen.jsx';
import ExplorationScreen from './ExplorationScreen.jsx';
import BattleTransition from './BattleTransition.jsx';
import CombatScreen from './CombatScreen.jsx';
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
  const [wordSourceMode, setWordSourceMode] = useState('pack'); // pack | random (standalone only)
  const [screen, setScreen] = useState('kit_select'); // kit_select | exploring | combat | end
  const [runState, setRunState] = useState(null);
  const [endResult, setEndResult] = useState(null);
  const [floorNumber, setFloorNumber] = useState(1);

  // Exploration state
  const [floor, setFloor] = useState(null);
  const [currentChamberId, setCurrentChamberId] = useState(null);

  // Active encounter context
  const [activeCombat, setActiveCombat] = useState(null); // { wordId, chamberId, isMiniboss }
  const [activeMiniGame, setActiveMiniGame] = useState(null); // { chamberId, miniGameId }
  const [hasCompletedCapsulesMiniGameThisFloor, setHasCompletedCapsulesMiniGameThisFloor] = useState(false);
  const [floorMiniGameWords, setFloorMiniGameWords] = useState(null); // 3 words shared by capsules + pillar per floor

  const getRandomPackWordsForFloor = useCallback(() => {
    if (bridgeBuilderPacks.length === 0) return [];
    const pack = bridgeBuilderPacks[Math.floor(Math.random() * bridgeBuilderPacks.length)];
    return convertBBWordsForDS(getWordsByIds(pack.wordIds));
  }, []);

  const createFloorForNumber = useCallback((targetFloorNumber) => {
    const combatCount = Math.min(6, 3 + Math.floor((targetFloorNumber - 1) / 2));
    const floorWordPool = isGuidedPackRun
      ? (hasCustomWordPool ? packWords : null)
      : (wordSourceMode === 'pack' ? getRandomPackWordsForFloor() : null);

    if (floorWordPool && floorWordPool.length > 0) {
      registerCustomWords(floorWordPool);
    } else {
      clearCustomWords();
    }

    const nextFloor = generateDungeonFloor({
      combatCount,
      customWords: floorWordPool,
      excludeWordIds: previousFloorWordIdsRef.current,
    });
    previousFloorWordIdsRef.current = collectFloorWordIds(nextFloor);
    return nextFloor;
  }, [getRandomPackWordsForFloor, hasCustomWordPool, isGuidedPackRun, packWords, wordSourceMode]);

  // Pick 3 random words for minigames when a new floor is created
  const pickMiniGameWords = useCallback((newFloor) => {
    const wordIds = collectFloorWordIds(newFloor);
    const pool = wordIds.size > 0
      ? Array.from(wordIds).map(id => getWordById(id)).filter(Boolean)
      : [...deepScriptWords];
    const candidates = pool.filter(w => !w.isMiniboss && w.english);
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, []);

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
    setHasCompletedCapsulesMiniGameThisFloor(false);
    setFloorMiniGameWords(pickMiniGameWords(newFloor));
    setScreen('exploring');
  }, [createFloorForNumber, pickMiniGameWords]);

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

      // Auto-trigger minigames in unresolved minigame chambers
      if (chamber.type === CHAMBER_TYPES.MINIGAME_PILLAR || chamber.type === CHAMBER_TYPES.MINIGAME_CAPSULES) {
        const nextMiniGameId = hasCompletedCapsulesMiniGameThisFloor ? 'pillar' : 'capsules';
        setTimeout(() => {
          setActiveMiniGame({ chamberId: targetChamberId, miniGameId: nextMiniGameId });
        }, 600);
      }
    }
  }, [floor, hasCompletedCapsulesMiniGameThisFloor]);

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

  const handleTriggerMiniGame = useCallback((chamberId) => {
    const nextMiniGameId = hasCompletedCapsulesMiniGameThisFloor ? 'pillar' : 'capsules';
    setActiveMiniGame(prev => {
      if (prev?.chamberId === chamberId && prev?.miniGameId === nextMiniGameId) {
        return null;
      }
      return { chamberId, miniGameId: nextMiniGameId };
    });
  }, [hasCompletedCapsulesMiniGameThisFloor]);

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
    setHasCompletedCapsulesMiniGameThisFloor(false);
    setFloorMiniGameWords(pickMiniGameWords(nextFloor));
    setFloorNumber(nextFloorNumber);
    setScreen('exploring');
  }, [createFloorForNumber, floorNumber, isGuidedPackRun, pickMiniGameWords]);

  // ─── Mini-game End ────────────────────────────────────────

  const handleMiniGameComplete = useCallback(() => {
    const { chamberId, miniGameId } = activeMiniGame || {};
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

    if (miniGameId === 'capsules') {
      setHasCompletedCapsulesMiniGameThisFloor(true);
    }

    setActiveMiniGame(null);
  }, [activeMiniGame]);

  const handleCloseMiniGame = useCallback(() => {
    setActiveMiniGame(null);
  }, []);

  // ─── Restart / Back ───────────────────────────────────────

  const handleRestart = useCallback(() => {
    clearCustomWords();
    setScreen('kit_select');
    setRunState(null);
    setFloor(null);
    setCurrentChamberId(null);
    setActiveMiniGame(null);
    setHasCompletedCapsulesMiniGameThisFloor(false);
    setFloorMiniGameWords(null);
    setEndResult(null);
    setFloorNumber(1);
    previousFloorWordIdsRef.current = new Set();
  }, []);

  // ─── Render ───────────────────────────────────────────────

  if (screen === 'kit_select') {
    return (
      <div className="ds-mode">
        <KitSelectScreen
          onSelect={handleKitSelect}
          onBack={onBack}
          wordSourceMode={wordSourceMode}
          onWordSourceModeChange={setWordSourceMode}
          showWordSourceToggle={!isGuidedPackRun}
        />
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
  const floorWordPool = Array.from(collectFloorWordIds(floor))
    .map(id => getWordById(id))
    .filter(Boolean);

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
        activeMiniGame={activeMiniGame}
        onCompleteMiniGame={handleMiniGameComplete}
        onCloseMiniGame={handleCloseMiniGame}
        floorWordPool={floorWordPool}
        floorMiniGameWords={floorMiniGameWords}
        runState={runState}
      />
    </div>
  );
}
