import React, { useState, useCallback, useMemo } from 'react';
import {
  getChamberDisplayName, getChamberIcon, CHAMBER_TYPES,
} from '../../data/deepScript/floorGenerator.js';
import { playFootstep } from './dsSounds.js';
import InspectPanel from './InspectPanel.jsx';
import PillarMiniGame from './PillarMiniGame.jsx';
import FloatingCapsulesGame from '../FloatingCapsulesGame.jsx';
import { deepScriptWords } from '../../data/deepScript/words.js';
import MemoryGateMiniGame from './MemoryGateMiniGame.jsx';

/**
 * ExplorationScreen — first-person dungeon traversal.
 *
 * The player stands inside a chamber, sees doors/exits and interactable
 * hotspots, and navigates by turning and moving forward.
 */
export default function ExplorationScreen({
  floor,
  currentChamberId,
  onMove,
  onTriggerCombat,
  onTriggerMiniGame,
  onLoot,
  onResolveInteractable,
  activeMiniGame,
  onCompleteMiniGame,
  onCloseMiniGame,
  floorWordPool = [],
  floorMiniGameWords = null,
  runState,
  onOpenMenu,
  isMemoryGateUnlocked = false,
}) {
  const [inspecting, setInspecting] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [transDir, setTransDir] = useState(null);

  const chamber = floor.chambers.get(currentChamberId);
  if (!chamber) return null;

  // Compute visible exits from a fixed forward-facing perspective.
  const relativeExits = useMemo(() => {
    return {
      forward: chamber.exits.north || null,
      right: chamber.exits.east || null,
      back: chamber.exits.south || null,
      left: chamber.exits.west || null,
    };
  }, [chamber.exits]);

  // Get chamber at an exit
  const getChamberAt = useCallback((chamberId) => {
    return chamberId ? floor.chambers.get(chamberId) : null;
  }, [floor]);

  // Walking state: 'walking' phase zooms toward exit, then 'arriving' fades in new room
  const [walkPhase, setWalkPhase] = useState(null); // null | 'walking' | 'arriving'

  // Click a door directly
  const handleDoorClick = useCallback((chamberId, direction) => {
    if (transitioning || activeMiniGame?.chamberId === currentChamberId) return;
    const targetChamber = floor.chambers.get(chamberId);
    if (targetChamber?.type === CHAMBER_TYPES.MINIBOSS && !isMemoryGateUnlocked) return;
    setTransitioning(true);
    setTransDir(direction);
    setWalkPhase('walking');
    playFootstep();
    setTimeout(() => {
      onMove(chamberId);
      setWalkPhase('arriving');
      setTimeout(() => {
        setTransitioning(false);
        setTransDir(null);
        setWalkPhase(null);
      }, 400);
    }, 600);
  }, [transitioning, onMove, activeMiniGame, currentChamberId, floor, isMemoryGateUnlocked]);

  // Click an interactable
  const handleHotspotClick = useCallback((interactable) => {
    if (interactable.resolved) return;

    switch (interactable.action) {
      case 'flavor':
        setInspecting(interactable);
        break;
      case 'trigger-combat':
        onTriggerCombat(chamber.payload?.wordId, chamber.id);
        break;
      case 'trigger-minigame':
        onTriggerMiniGame(chamber.id, interactable.minigameId);
        break;
      case 'trigger-memory-gate':
        onTriggerMiniGame(chamber.id, 'memory-gate');
        break;
      case 'loot':
        setInspecting({ ...interactable, isLoot: true });
        break;
      case 'inspect':
        setInspecting(interactable);
        break;
      default:
        setInspecting(interactable);
    }
  }, [chamber, onTriggerCombat, onTriggerMiniGame]);

  const handleCloseInspect = useCallback(() => {
    if (inspecting?.isLoot && !inspecting.resolved) {
      onLoot(chamber.id, inspecting.id);
      onResolveInteractable(chamber.id, inspecting.id);
    }
    setInspecting(null);
  }, [inspecting, chamber?.id, onLoot, onResolveInteractable]);

  // Health pips
  const healthPips = [];
  for (let i = 0; i < runState.maxHealth; i++) {
    healthPips.push(i < runState.health);
  }

  // Minimap data
  const minimapChambers = useMemo(() => {
    const result = [];
    for (const [id, ch] of floor.chambers) {
      if (ch.visited) {
        result.push({
          id,
          type: ch.type,
          resolved: ch.resolved,
          isCurrent: id === currentChamberId,
          exits: ch.exits,
        });
      }
    }
    return result;
  }, [floor, currentChamberId]);

  // Determine what doors are visible
  const forwardDoor = relativeExits.forward;
  const leftDoor = relativeExits.left;
  const rightDoor = relativeExits.right;
  const backDoor = relativeExits.back;

  // Chamber name for the chamber ahead (peeking)
  const forwardChamber = getChamberAt(forwardDoor);
  const leftChamber = getChamberAt(leftDoor);
  const rightChamber = getChamberAt(rightDoor);
  const backChamber = getChamberAt(backDoor);
  const visibleBackDoor = backChamber?.visited ? backDoor : null;
  const isMiniGameOpenInThisRoom = activeMiniGame?.chamberId === chamber.id;
  const activeWordPool = floorWordPool.length > 0 ? floorWordPool : deepScriptWords;
  const sharedMiniGameWords = floorMiniGameWords || [];
  const capsulePairs = useMemo(() => {
    return sharedMiniGameWords.map(word => ({
      hebrew: word.nativeScript || word.hebrew,
      nativeScript: word.nativeScript || word.hebrew,
      transliteration: word.transliteration,
      meaning: word.meaning || word.english,
      languageId: word.languageId || 'hebrew',
    }));
  }, [sharedMiniGameWords]);

  return (
    <div className={`ds-explore-screen ${transitioning ? `ds-explore--trans-${transDir}` : ''} ${walkPhase ? `ds-explore--${walkPhase}` : ''} ${isMiniGameOpenInThisRoom ? 'ds-explore--minigame-active' : ''}`}>
      {/* ═══ TOP HUD ═══ */}
      <div className="ds-explore-top-hud">
        <div className="ds-hud-left">
          <button type="button" className="ds-hamburger-btn" onClick={onOpenMenu} aria-label="Open game menu">
            ☰
          </button>
          <div className="ds-hud-health">
            {healthPips.map((full, i) => (
              <span key={i} className={`ds-hud-pip ${full ? 'ds-hud-pip--full' : 'ds-hud-pip--empty'}`} />
            ))}
          </div>
        </div>
        <div className="ds-explore-chamber-name">
          {getChamberDisplayName(chamber.type)}
        </div>
        <div className="ds-explore-compass">N</div>
      </div>

      {/* ═══ DUNGEON VIEWPORT ═══ */}
      <div className="ds-explore-viewport">
        {/* Room structure */}
        <div className={`ds-explore-room ds-explore-room--${chamber.theme}`}>
          <div className="ds-explore-ceiling" />
          <div className="ds-explore-back-wall">
            {/* Forward door */}
            {forwardDoor && (
              <button
                type="button"
                className={`ds-explore-door ds-explore-door--forward ${forwardChamber?.visited ? 'ds-explore-door--visited' : ''} ${forwardChamber?.type === CHAMBER_TYPES.MINIBOSS && !isMemoryGateUnlocked ? 'ds-explore-door--locked' : ''}`}
                onClick={() => handleDoorClick(forwardDoor, 'forward')}
                title={forwardChamber?.type === CHAMBER_TYPES.MINIBOSS && !isMemoryGateUnlocked
                  ? 'A memory seal blocks this door. Score 80%+ in the Memory Gate to enter.'
                  : (forwardChamber?.visited ? getChamberDisplayName(forwardChamber.type) : 'Unexplored passage')}
              >
                <div className="ds-explore-door-arch" />
                <div className="ds-explore-door-label">
                  {forwardChamber?.visited ? getChamberIcon(forwardChamber.type) : '?'}
                </div>
              </button>
            )}
          </div>
          <div className="ds-explore-wall-left">
            {leftDoor && (
              <button
                type="button"
                className={`ds-explore-door ds-explore-door--side ds-explore-door--left ${leftChamber?.visited ? 'ds-explore-door--visited' : ''} ${leftChamber?.type === CHAMBER_TYPES.MINIBOSS && !isMemoryGateUnlocked ? 'ds-explore-door--locked' : ''}`}
                onClick={() => handleDoorClick(leftDoor, 'left')}
                title={leftChamber?.type === CHAMBER_TYPES.MINIBOSS && !isMemoryGateUnlocked
                  ? 'A memory seal blocks this door. Score 80%+ in the Memory Gate to enter.'
                  : (leftChamber?.visited ? getChamberDisplayName(leftChamber.type) : 'Unexplored passage')}
              >
                <div className="ds-explore-door-arch" />
              </button>
            )}
          </div>
          <div className="ds-explore-wall-right">
            {rightDoor && (
              <button
                type="button"
                className={`ds-explore-door ds-explore-door--side ds-explore-door--right ${rightChamber?.visited ? 'ds-explore-door--visited' : ''} ${rightChamber?.type === CHAMBER_TYPES.MINIBOSS && !isMemoryGateUnlocked ? 'ds-explore-door--locked' : ''}`}
                onClick={() => handleDoorClick(rightDoor, 'right')}
                title={rightChamber?.type === CHAMBER_TYPES.MINIBOSS && !isMemoryGateUnlocked
                  ? 'A memory seal blocks this door. Score 80%+ in the Memory Gate to enter.'
                  : (rightChamber?.visited ? getChamberDisplayName(rightChamber.type) : 'Unexplored passage')}
              >
                <div className="ds-explore-door-arch" />
              </button>
            )}
          </div>
          <div className="ds-explore-floor" />
          {visibleBackDoor && (
            <button
              type="button"
              className={`ds-explore-door ds-explore-door--back ${backChamber?.visited ? 'ds-explore-door--visited' : ''} ${backChamber?.type === CHAMBER_TYPES.MINIBOSS && !isMemoryGateUnlocked ? 'ds-explore-door--locked' : ''}`}
              onClick={() => handleDoorClick(visibleBackDoor, 'back')}
              title={backChamber?.type === CHAMBER_TYPES.MINIBOSS && !isMemoryGateUnlocked
                ? 'A memory seal blocks this door. Score 80%+ in the Memory Gate to enter.'
                : (backChamber?.visited ? getChamberDisplayName(backChamber.type) : 'Unexplored passage behind you')}
            >
              <div className="ds-explore-door-arch" />
              <div className="ds-explore-door-label">
                {backChamber?.visited ? getChamberIcon(backChamber.type) : '?'}
              </div>
            </button>
          )}

          {/* Torches */}
          <div className="ds-torch ds-torch--left">
            <div className="ds-torch-flame" />
          </div>
          <div className="ds-torch ds-torch--right">
            <div className="ds-torch-flame" />
          </div>

          {/* ═══ INTERACTABLE HOTSPOTS ═══ */}
          <div className="ds-explore-hotspots">
            {chamber.interactables.map(obj => {
              if (obj.resolved && obj.action !== 'flavor') return null;

              const hotspotCls = [
                'ds-hotspot',
                `ds-hotspot--${obj.position}`,
                `ds-hotspot--${obj.type}`,
                obj.resolved ? 'ds-hotspot--resolved' : '',
                obj.action === 'trigger-combat' ? 'ds-hotspot--combat' : '',
                obj.action === 'trigger-minigame' ? 'ds-hotspot--minigame' : '',
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={obj.id}
                  type="button"
                  className={hotspotCls}
                  onClick={() => handleHotspotClick(obj)}
                  disabled={obj.resolved && obj.action !== 'flavor'}
                  title={obj.label}
                >
                  <span className="ds-hotspot-icon">
                    {getHotspotIcon(obj.type)}
                  </span>
                  <span className="ds-hotspot-label">{obj.label}</span>
                </button>
              );
            })}
          </div>

          {isMiniGameOpenInThisRoom && activeMiniGame?.miniGameId === 'pillar' && (
            <div className="ds-room-object ds-room-object--pillar" aria-label="Pillar game object">
              <PillarMiniGame
                onSolved={onCompleteMiniGame}
                compact
                wordPool={activeWordPool}
                selectedWords={sharedMiniGameWords}
              />
            </div>
          )}

          {isMiniGameOpenInThisRoom && activeMiniGame?.miniGameId === 'capsules' && (
            <div className="ds-bubbles-overlay" role="dialog" aria-label="Bubble matching minigame">
              <FloatingCapsulesGame
                wordPairs={capsulePairs}
                onComplete={onCompleteMiniGame}
                bubbleMode
              />
            </div>
          )}

          {isMiniGameOpenInThisRoom && activeMiniGame?.miniGameId === 'memory-gate' && (
            <div className="ds-room-object ds-room-object--pillar" aria-label="Memory gate challenge">
              <MemoryGateMiniGame
                onSolved={onCompleteMiniGame}
                compact
                wordPool={activeWordPool}
              />
            </div>
          )}

          {/* Chamber state indicator */}
          {chamber.resolved && chamber.type === CHAMBER_TYPES.COMBAT && (
            <div className="ds-explore-cleared-badge">CLEARED</div>
          )}
        </div>
      </div>

      {/* ═══ MINIMAP ═══ */}
      <div className="ds-minimap">
        {minimapChambers.map(ch => (
          <div
            key={ch.id}
            className={`ds-minimap-node ${ch.isCurrent ? 'ds-minimap-node--current' : ''} ${ch.resolved ? 'ds-minimap-node--resolved' : ''} ds-minimap-node--${ch.type}`}
            title={getChamberDisplayName(ch.type)}
          >
            <span className="ds-minimap-icon">{getChamberIcon(ch.type)}</span>
          </div>
        ))}
      </div>

      {/* ═══ INSPECT PANEL ═══ */}
      {inspecting && (
        <InspectPanel
          interactable={inspecting}
          onClose={handleCloseInspect}
        />
      )}
    </div>
  );
}

// ─── Hotspot icons ──────────────────────────────────────────

function getHotspotIcon(type) {
  switch (type) {
    case 'sigil': return '🔮';
    case 'bookshelf': return '📚';
    case 'scroll-stand': return '📜';
    case 'mural': return '🖼️';
    case 'pillar': return '🗿';
    case 'capsule-orb': return '🫧';
    case 'trial-pedestal': return '🧩';
    case 'memory-gate-seal': return '⟡';
    case 'brazier': return '🔥';
    case 'statue': return '🗿';
    case 'chest': return '📦';
    case 'cracked-wall': return '🪨';
    case 'note-tablet': return '📋';
    default: return '❓';
  }
}
