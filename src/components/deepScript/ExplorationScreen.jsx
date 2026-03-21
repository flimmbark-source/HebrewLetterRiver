import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  DIRECTIONS, OPPOSITE, TURN_LEFT, TURN_RIGHT,
  getChamberDisplayName, getChamberIcon, CHAMBER_TYPES,
} from '../../data/deepScript/floorGenerator.js';
import { playFootstep } from './dsSounds.js';
import InspectPanel from './InspectPanel.jsx';

/**
 * ExplorationScreen — first-person dungeon traversal.
 *
 * The player stands inside a chamber, sees doors/exits and interactable
 * hotspots, and navigates by turning and moving forward.
 */
export default function ExplorationScreen({
  floor,
  currentChamberId,
  facing,
  onMove,
  onTurnLeft,
  onTurnRight,
  onTriggerCombat,
  onTriggerArchive,
  onTriggerShrine,
  onLoot,
  onResolveInteractable,
  runState,
  onBack,
}) {
  const [inspecting, setInspecting] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [transDir, setTransDir] = useState(null);

  const chamber = floor.chambers.get(currentChamberId);
  if (!chamber) return null;

  // Compute visible exits relative to facing
  const relativeExits = useMemo(() => {
    // Map absolute directions to relative positions based on facing
    const dirs = ['north', 'east', 'south', 'west'];
    const facingIdx = dirs.indexOf(facing);

    // forward = facing, right = facing+1, back = facing+2, left = facing+3
    const forward = dirs[facingIdx];
    const right = dirs[(facingIdx + 1) % 4];
    const back = dirs[(facingIdx + 2) % 4];
    const left = dirs[(facingIdx + 3) % 4];

    return {
      forward: chamber.exits[forward] || null,
      right: chamber.exits[right] || null,
      back: chamber.exits[back] || null,
      left: chamber.exits[left] || null,
      forwardDir: forward,
      rightDir: right,
      backDir: back,
      leftDir: left,
    };
  }, [chamber.exits, facing]);

  // Get chamber at an exit
  const getChamberAt = useCallback((chamberId) => {
    return chamberId ? floor.chambers.get(chamberId) : null;
  }, [floor]);

  // Walking state: 'walking' phase zooms toward exit, then 'arriving' fades in new room
  const [walkPhase, setWalkPhase] = useState(null); // null | 'walking' | 'arriving'

  // Handle forward movement with walk animation
  const handleForward = useCallback(() => {
    if (!relativeExits.forward || transitioning) return;
    setTransitioning(true);
    setTransDir('forward');
    setWalkPhase('walking');
    playFootstep();
    // Phase 1: walk toward exit (600ms)
    setTimeout(() => {
      onMove(relativeExits.forward);
      setWalkPhase('arriving');
      // Phase 2: new room fades in (400ms)
      setTimeout(() => {
        setTransitioning(false);
        setTransDir(null);
        setWalkPhase(null);
      }, 400);
    }, 600);
  }, [relativeExits.forward, transitioning, onMove]);

  // Click a door directly
  const handleDoorClick = useCallback((chamberId, direction) => {
    if (transitioning) return;
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
  }, [transitioning, onMove]);

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
      case 'trigger-archive':
        onTriggerArchive(interactable.archiveReward || 'insight', chamber.id, interactable.id);
        break;
      case 'trigger-shrine':
        onTriggerShrine(chamber.id);
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
  }, [chamber, onTriggerCombat, onTriggerArchive, onTriggerShrine]);

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

  return (
    <div className={`ds-explore-screen ${transitioning ? `ds-explore--trans-${transDir}` : ''} ${walkPhase ? `ds-explore--${walkPhase}` : ''}`}>
      {/* ═══ TOP HUD ═══ */}
      <div className="ds-explore-top-hud">
        <div className="ds-hud-health">
          {healthPips.map((full, i) => (
            <span key={i} className={`ds-hud-pip ${full ? 'ds-hud-pip--full' : 'ds-hud-pip--empty'}`} />
          ))}
        </div>
        <div className="ds-explore-chamber-name">
          {getChamberDisplayName(chamber.type)}
        </div>
        <div className="ds-explore-compass">{facing[0].toUpperCase()}</div>
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
                className={`ds-explore-door ds-explore-door--forward ${forwardChamber?.visited ? 'ds-explore-door--visited' : ''}`}
                onClick={() => handleDoorClick(forwardDoor, 'forward')}
                title={forwardChamber?.visited ? getChamberDisplayName(forwardChamber.type) : 'Unexplored passage'}
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
                className={`ds-explore-door ds-explore-door--side ds-explore-door--left ${leftChamber?.visited ? 'ds-explore-door--visited' : ''}`}
                onClick={() => handleDoorClick(leftDoor, 'left')}
                title={leftChamber?.visited ? getChamberDisplayName(leftChamber.type) : 'Unexplored passage'}
              >
                <div className="ds-explore-door-arch" />
              </button>
            )}
          </div>
          <div className="ds-explore-wall-right">
            {rightDoor && (
              <button
                type="button"
                className={`ds-explore-door ds-explore-door--side ds-explore-door--right ${rightChamber?.visited ? 'ds-explore-door--visited' : ''}`}
                onClick={() => handleDoorClick(rightDoor, 'right')}
                title={rightChamber?.visited ? getChamberDisplayName(rightChamber.type) : 'Unexplored passage'}
              >
                <div className="ds-explore-door-arch" />
              </button>
            )}
          </div>
          <div className="ds-explore-floor" />

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
                obj.action === 'trigger-shrine' ? 'ds-hotspot--shrine' : '',
                obj.action === 'trigger-archive' ? 'ds-hotspot--archive' : '',
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

      {/* ═══ ACTION BAR ═══ */}
      <div className="ds-explore-action-bar">
        <button
          type="button"
          className="ds-explore-act ds-explore-act--turn"
          onClick={onTurnLeft}
          title="Turn Left"
        >
          <span className="ds-explore-act-icon">⟲</span>
        </button>
        <button
          type="button"
          className={`ds-explore-act ds-explore-act--back ${!backDoor ? 'ds-explore-act--disabled' : ''}`}
          onClick={() => handleDoorClick(backDoor, 'back')}
          disabled={!backDoor}
          title={backDoor
            ? `Step Back${backChamber?.visited ? ` to ${getChamberDisplayName(backChamber.type)}` : ''}`
            : 'No exit behind you'}
        >
          <span className="ds-explore-act-icon">⬇</span>
          <span className="ds-explore-act-label">Back</span>
        </button>
        <button
          type="button"
          className={`ds-explore-act ds-explore-act--forward ${!forwardDoor ? 'ds-explore-act--disabled' : ''}`}
          onClick={handleForward}
          disabled={!forwardDoor}
          title={forwardDoor ? 'Move Forward' : 'No exit ahead'}
        >
          <span className="ds-explore-act-icon">⬆</span>
          <span className="ds-explore-act-label">Forward</span>
        </button>
        <button
          type="button"
          className="ds-explore-act ds-explore-act--turn"
          onClick={onTurnRight}
          title="Turn Right"
        >
          <span className="ds-explore-act-icon">⟳</span>
        </button>
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
    case 'altar': return '⛩️';
    case 'brazier': return '🔥';
    case 'statue': return '🗿';
    case 'chest': return '📦';
    case 'cracked-wall': return '🪨';
    case 'note-tablet': return '📋';
    default: return '❓';
  }
}
