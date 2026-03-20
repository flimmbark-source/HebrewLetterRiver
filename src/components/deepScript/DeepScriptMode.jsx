import React, { useState, useCallback, useEffect } from 'react';
import { getStarterKit } from '../../data/deepScript/starterKits.js';
import { getSharedGear } from '../../data/deepScript/gear.js';
import { generateDungeonFloor, TURN_LEFT, TURN_RIGHT, CHAMBER_TYPES } from '../../data/deepScript/floorGenerator.js';
import { createRunState } from './deepScriptEngine.js';
import { upgradeDefinitions } from '../../data/deepScript/upgrades.js';
import { registerCustomWords, clearCustomWords } from '../../data/deepScript/words.js';
import KitSelectScreen from './KitSelectScreen.jsx';
import ExplorationScreen from './ExplorationScreen.jsx';
import BattleTransition from './BattleTransition.jsx';
import CombatScreen from './CombatScreen.jsx';
import ArchiveScreen from './ArchiveScreen.jsx';
import ShrineScreen from './ShrineScreen.jsx';
import RunEndScreen from './RunEndScreen.jsx';
import './DeepScript.css';

/**
 * DeepScriptMode — top-level orchestrator for the Deep Script game mode.
 *
 * Flow: Kit Select → Exploration (move/turn/inspect/trigger) →
 *       Combat/Archive/Shrine → back to Exploration → ... → Miniboss → End
 */
export default function DeepScriptMode({ onBack, packWords, onRunComplete }) {
  const [screen, setScreen] = useState('kit_select'); // kit_select | exploring | combat | archive | shrine | end
  const [runState, setRunState] = useState(null);
  const [endResult, setEndResult] = useState(null);
  const [floorNumber, setFloorNumber] = useState(1);

  // Exploration state
  const [floor, setFloor] = useState(null);
  const [currentChamberId, setCurrentChamberId] = useState(null);
  const [facing, setFacing] = useState('north');

  // Active encounter context
  const [activeCombat, setActiveCombat] = useState(null); // { wordId, chamberId, isMiniboss }
  const [activeArchive, setActiveArchive] = useState(null); // { rewardId, chamberId, interactableId }
  const [activeShrine, setActiveShrine] = useState(null); // { chamberId }

  const createFloorForNumber = useCallback((targetFloorNumber) => {
    const combatCount = Math.min(6, 3 + Math.floor((targetFloorNumber - 1) / 2));
    return generateDungeonFloor({
      combatCount,
      customWords: packWords && packWords.length > 0 ? packWords : null,
    });
  }, [packWords]);

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
    const sharedGearIds = getSharedGear().map(g => g.id);

    // Register custom words if running a pack-based session
    if (packWords && packWords.length > 0) {
      registerCustomWords(packWords);
    } else {
      clearCustomWords();
    }

    // Generate dungeon floor (pass custom words if available)
    const newFloor = createFloorForNumber(1);

    // Create run state (pass a dummy runMap for backward compat)
    const newRun = createRunState(kit, sharedGearIds, []);
    // Add floor reference
    newRun.floor = newFloor;

    setRunState(newRun);
    setFloor(newFloor);
    setCurrentChamberId(newFloor.startChamberId);
    setFacing('north');
    setFloorNumber(1);
    setScreen('exploring');
  }, [packWords, createFloorForNumber]);

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

    // Auto-trigger combat in unresolved combat/miniboss chambers
    const chamber = floor.chambers.get(targetChamberId);
    if (chamber && !chamber.resolved) {
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

  const handleTurnLeft = useCallback(() => {
    setFacing(prev => TURN_LEFT[prev]);
  }, []);

  const handleTurnRight = useCallback(() => {
    setFacing(prev => TURN_RIGHT[prev]);
  }, []);

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

  const handleTriggerArchive = useCallback((rewardId, chamberId, interactableId) => {
    setActiveArchive({ rewardId, chamberId, interactableId });
    setScreen('archive');
  }, []);

  const handleTriggerShrine = useCallback((chamberId) => {
    setActiveShrine({ chamberId });
    setScreen('shrine');
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
        if (onRunComplete && floorNumber === 1) onRunComplete('victory');
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
  }, [activeCombat, floorNumber, onRunComplete]);

  const handleNextFloor = useCallback(() => {
    const nextFloorNumber = floorNumber + 1;
    const nextFloor = createFloorForNumber(nextFloorNumber);

    setFloor(nextFloor);
    setCurrentChamberId(nextFloor.startChamberId);
    setFacing('north');
    setActiveCombat(null);
    setActiveArchive(null);
    setActiveShrine(null);
    setRunState(prev => ({
      ...prev,
      floor: nextFloor,
      health: Math.min(prev.maxHealth, prev.health + 1),
    }));
    setFloorNumber(nextFloorNumber);
    setScreen('exploring');
  }, [createFloorForNumber, floorNumber]);

  // ─── Archive End ──────────────────────────────────────────

  const handleArchiveComplete = useCallback((rewardId) => {
    const { chamberId, interactableId } = activeArchive || {};

    // Resolve the interactable
    if (chamberId && interactableId) {
      setFloor(prev => {
        const newChambers = new Map(prev.chambers);
        const chamber = { ...newChambers.get(chamberId) };
        chamber.interactables = chamber.interactables.map(obj =>
          obj.id === interactableId ? { ...obj, resolved: true } : obj
        );
        // Mark chamber resolved if all archive interactables are done
        const unresolvedArchive = chamber.interactables.filter(
          o => o.action === 'trigger-archive' && !o.resolved
        );
        if (unresolvedArchive.length === 0) {
          chamber.resolved = true;
        }
        newChambers.set(chamberId, chamber);
        return { ...prev, chambers: newChambers };
      });
    }

    // Apply archive reward
    setRunState(prev => {
      const newState = { ...prev, roomsCompleted: prev.roomsCompleted + 1 };
      switch (rewardId) {
        case 'heal':
          newState.health = Math.min(prev.maxHealth, prev.health + 1);
          break;
        case 'clue-hint':
          newState.insightNextCombat = true;
          break;
        default:
          break;
      }
      return newState;
    });

    setActiveArchive(null);
    setScreen('exploring');
  }, [activeArchive]);

  // ─── Shrine End ───────────────────────────────────────────

  const handleShrineComplete = useCallback((upgradeId) => {
    const { chamberId } = activeShrine || {};

    // Mark shrine chamber as resolved
    if (chamberId) {
      setFloor(prev => {
        const newChambers = new Map(prev.chambers);
        const chamber = { ...newChambers.get(chamberId), resolved: true };
        chamber.interactables = chamber.interactables.map(obj =>
          obj.action === 'trigger-shrine' ? { ...obj, resolved: true } : obj
        );
        newChambers.set(chamberId, chamber);
        return { ...prev, chambers: newChambers };
      });
    }

    // Apply upgrade
    setRunState(prev => {
      const newState = {
        ...prev,
        roomsCompleted: prev.roomsCompleted + 1,
        upgrades: { ...prev.upgrades },
      };

      const upgrade = upgradeDefinitions.find(u => u.id === upgradeId);
      if (upgrade) {
        switch (upgrade.effect) {
          case 'satchelSize':
            newState.satchelSize = (prev.satchelSize || 3) + upgrade.value;
            break;
          case 'traySize':
            newState.traySize = (prev.traySize || 6) + upgrade.value;
            break;
          case 'maxPressure':
            newState.upgrades.maxPressure = (prev.upgrades.maxPressure || 0) + upgrade.value;
            break;
          case 'heal':
            newState.health = Math.min(prev.maxHealth + upgrade.value, prev.health + upgrade.value);
            newState.maxHealth = prev.maxHealth + upgrade.value;
            break;
          case 'genAccuracy':
            newState.upgrades.genAccuracy = (prev.upgrades.genAccuracy || 0) + upgrade.value;
            break;
          case 'burnBonus':
            newState.upgrades.burnBonus = true;
            break;
          case 'cooldownReduction':
            newState.upgrades.cooldownReduction = (prev.upgrades.cooldownReduction || 0) + upgrade.value;
            break;
          case 'startReveal':
            newState.upgrades.startReveal = (prev.upgrades.startReveal || 0) + upgrade.value;
            break;
          default:
            break;
        }
      }
      return newState;
    });

    setActiveShrine(null);
    setScreen('exploring');
  }, [activeShrine]);

  // ─── Restart / Back ───────────────────────────────────────

  const handleRestart = useCallback(() => {
    clearCustomWords();
    setScreen('kit_select');
    setRunState(null);
    setFloor(null);
    setCurrentChamberId(null);
    setEndResult(null);
    setFloorNumber(1);
    setFacing('north');
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

  // Archive screen
  if (screen === 'archive' && activeArchive) {
    return (
      <div className="ds-mode">
        <ArchiveScreen
          room={{ rewardId: activeArchive.rewardId }}
          runState={runState}
          onComplete={handleArchiveComplete}
        />
      </div>
    );
  }

  // Shrine screen
  if (screen === 'shrine') {
    return (
      <div className="ds-mode">
        <ShrineScreen
          runState={runState}
          onComplete={handleShrineComplete}
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
        facing={facing}
        onMove={handleMove}
        onTurnLeft={handleTurnLeft}
        onTurnRight={handleTurnRight}
        onTriggerCombat={handleTriggerCombat}
        onTriggerArchive={handleTriggerArchive}
        onTriggerShrine={handleTriggerShrine}
        onLoot={handleLoot}
        onResolveInteractable={handleResolveInteractable}
        runState={runState}
        onBack={onBack}
      />
    </div>
  );
}
