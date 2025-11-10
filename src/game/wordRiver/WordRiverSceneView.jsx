import React from 'react';
import PropTypes from 'prop-types';
import WordRiverObjectIcon from './WordRiverObjectIcon.jsx';
import { classNames } from '../../lib/classNames.js';

function SceneObjectButton({ object, learned, active, disabled, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(object)}
      className={`word-river-scene-object group ${learned ? 'learned' : ''} ${active ? 'active' : ''}`.trim()}
      style={{ left: `${object.position.x}%`, top: `${object.position.y}%` }}
      disabled={disabled}
      aria-label={`${object.l1Gloss} (${object.l2Word})`}
      aria-pressed={active}
    >
      <div className="word-river-scene-object-icon">
        <WordRiverObjectIcon svgId={object.svgId} className="h-full w-full" />
      </div>
      <div className="word-river-scene-object-glow" aria-hidden="true" />
      {learned ? (
        <div className="word-river-scene-object-learned">
          <span aria-hidden="true">✓</span>
          <span className="sr-only">learned</span>
        </div>
      ) : null}
    </button>
  );
}

SceneObjectButton.propTypes = {
  object: PropTypes.shape({
    id: PropTypes.string.isRequired,
    svgId: PropTypes.string.isRequired,
    l2Word: PropTypes.string.isRequired,
    l1Gloss: PropTypes.string.isRequired,
    position: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired
    }).isRequired
  }).isRequired,
  learned: PropTypes.bool,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  onSelect: PropTypes.func.isRequired
};

SceneObjectButton.defaultProps = {
  learned: false,
  active: false,
  disabled: false
};

export default function WordRiverSceneView({
  scene,
  learnedObjectIds,
  onSelectObject,
  disabled,
  activeObjectId
}) {
  const sceneClassName = classNames('word-river-scene', {
    'word-river-scene-dimmed': disabled && Boolean(activeObjectId)
  });

  return (
    <div className={sceneClassName} aria-label={scene.label}>
      <div className={`word-river-scene-background scene-${scene.backgroundId}`} aria-hidden="true" />
      <div className="word-river-scene-overlay">
        <div className="word-river-scene-header">
          <div className="word-river-scene-label">{scene.label}</div>
        </div>
        <div className="word-river-scene-layer">
          {scene.objects.map((object) => (
            <SceneObjectButton
              key={object.id}
              object={object}
              learned={learnedObjectIds.includes(object.id)}
              active={activeObjectId === object.id}
              disabled={disabled}
              onSelect={onSelectObject}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

WordRiverSceneView.propTypes = {
  scene: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    backgroundId: PropTypes.string.isRequired,
    objects: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        svgId: PropTypes.string.isRequired,
        l2Word: PropTypes.string.isRequired,
        l1Gloss: PropTypes.string.isRequired,
        audioKey: PropTypes.string.isRequired,
        position: PropTypes.shape({
          x: PropTypes.number.isRequired,
          y: PropTypes.number.isRequired
        }).isRequired
      }).isRequired
    ).isRequired
  }).isRequired,
  learnedObjectIds: PropTypes.arrayOf(PropTypes.string),
  onSelectObject: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  activeObjectId: PropTypes.string
};

WordRiverSceneView.defaultProps = {
  learnedObjectIds: [],
  disabled: false,
  activeObjectId: null
};
