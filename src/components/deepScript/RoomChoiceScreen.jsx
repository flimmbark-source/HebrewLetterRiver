import React from 'react';
import { getRoomDisplayInfo } from '../../data/deepScript/roomGenerator.js';
import { getWordById } from '../../data/deepScript/words.js';
import { ARCHIVE_REWARDS } from '../../data/deepScript/roomGenerator.js';

export default function RoomChoiceScreen({ node, runState, onSelect, onBack }) {
  if (!node) return null;

  const isMiniboss = node.choices.length === 1 && node.choices[0].type === 'miniboss';

  // Health pips
  const healthPips = [];
  for (let i = 0; i < runState.maxHealth; i++) {
    healthPips.push(i < runState.health);
  }

  return (
    <div className="ds-screen ds-room-choice">
      {/* Dungeon corridor background */}
      <div className="ds-corridor-bg">
        <div className="ds-corridor-floor" />
        <div className="ds-corridor-wall-l" />
        <div className="ds-corridor-wall-r" />
        <div className="ds-corridor-ceiling" />
      </div>

      {/* Top status */}
      <div className="ds-rc-top-bar">
        <div className="ds-hud-health">
          {healthPips.map((full, i) => (
            <span key={i} className={`ds-hud-pip ${full ? 'ds-hud-pip--full' : 'ds-hud-pip--empty'}`} />
          ))}
        </div>
        <div className="ds-rc-depth">
          Room {runState.roomIndex + 1} / {runState.runMap.length}
        </div>
        <div className="ds-hud-progress">
          <span className="ds-hud-progress-text">{runState.combatsWon} won</span>
        </div>
      </div>

      {/* Title */}
      <div className="ds-room-choice-header">
        <h2 className="ds-room-choice-title">
          {isMiniboss ? 'The Guardian Awaits' : 'Choose Your Path'}
        </h2>
      </div>

      {/* Room cards */}
      <div className="ds-room-choices">
        {node.choices.map(room => {
          const info = getRoomDisplayInfo(room.type);
          let subtitle = info.description;

          if (room.type === 'combat' || room.type === 'miniboss') {
            const word = getWordById(room.wordId);
            if (word) {
              subtitle = `"${word.english}"`;
            }
          } else if (room.type === 'archive' && room.rewardId) {
            const reward = ARCHIVE_REWARDS.find(r => r.id === room.rewardId);
            if (reward) subtitle = reward.description;
          }

          return (
            <button
              key={room.id}
              type="button"
              className={`ds-room-card ds-room-card--${room.type}`}
              onClick={() => onSelect(room)}
            >
              <div className="ds-room-card-icon">{info.icon}</div>
              <div className="ds-room-card-info">
                <div className="ds-room-card-name">{info.name}</div>
                <div className="ds-room-card-desc">{subtitle}</div>
              </div>
              <div className="ds-room-card-arrow">▸</div>
            </button>
          );
        })}
      </div>

      {runState.roomIndex === 0 && (
        <button type="button" className="ds-retreat-btn" onClick={onBack}>
          Retreat
        </button>
      )}
    </div>
  );
}
