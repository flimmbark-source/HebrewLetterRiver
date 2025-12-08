import React from 'react';
import PropTypes from 'prop-types';
import { classNames } from '../../lib/classNames.js';

function TutorialCallout({ positionClass, title, body, icon }) {
  return (
    <div
      className={classNames(
        'pointer-events-auto absolute max-w-sm rounded-2xl border-2 border-white/20',
        'bg-slate-900/85 p-4 text-sm text-white shadow-arcade-lg backdrop-blur',
        positionClass
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-base font-semibold">
        <span aria-hidden="true">{icon}</span>
        <span>{title}</span>
      </div>
      <p className="leading-relaxed text-slate-100/90">{body}</p>
    </div>
  );
}

TutorialCallout.propTypes = {
  positionClass: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired
};

export default function WordRiverTutorial({ visible, stage, phase, onDismiss }) {
  if (!visible) return null;

  const showSceneHints = stage === 'scene' && phase === 'sceneView';
  const showSpellingHints = stage !== 'scene' && phase === 'spelling';
  const showDragHint = stage === 'drag' && phase === 'spelling';

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      {showSceneHints ? (
        <TutorialCallout
          positionClass="left-4 top-4"
          title="Pick a word to study"
          body="Tap any island icon to start a round. Icons with a ✓ are words you have already practiced."
          icon="🗺️"
        />
      ) : null}

      {showSpellingHints ? (
        <>
          <TutorialCallout
            positionClass="left-4 top-4"
            title="Replay the word"
            body="Use the speaker button to hear the word again whenever you need a reminder."
            icon="🔈"
          />
          <TutorialCallout
            positionClass="left-1/2 top-1/4 -translate-x-1/2"
            title="Match letters to the bucket"
            body="The bucket shows the object you chose. Drop each matching letter into the slots to spell the word."
            icon="🪣"
          />
        </>
      ) : null}

      {showDragHint ? (
        <TutorialCallout
          positionClass="left-1/2 bottom-6 -translate-x-1/2"
          title="Drag floating letters"
          body="When a letter drifts down the river, press and drag it onto the correct slot above. You can pull a letter back out if you need to swap it."
          icon="🪄"
        />
      ) : null}

      <div className="pointer-events-auto absolute bottom-4 right-4">
        <button
          type="button"
          onClick={onDismiss}
          className={classNames(
            'rounded-full border-2 border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-arcade-sm',
            'hover:border-white/60 hover:bg-white/25'
          )}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

WordRiverTutorial.propTypes = {
  visible: PropTypes.bool.isRequired,
  stage: PropTypes.oneOf(['scene', 'spelling', 'drag']).isRequired,
  phase: PropTypes.oneOf(['sceneView', 'focusMeaning', 'spelling', 'success']).isRequired,
  onDismiss: PropTypes.func.isRequired
};
