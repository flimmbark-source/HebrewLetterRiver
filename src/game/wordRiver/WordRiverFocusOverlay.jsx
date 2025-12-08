import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import SpellingRiver from './SpellingRiver.jsx';
import WordRiverObjectIcon from './WordRiverObjectIcon.jsx';
import { playWordAudio } from './audio.js';
import { celebrate } from '../../lib/celebration.js';

function MeaningMoment({ object, onComplete }) {
  const [showGloss, setShowGloss] = useState(true);

  useEffect(() => {
    let glossTimer;
    let completeTimer;
    playWordAudio(object.audioKey);
    glossTimer = setTimeout(() => setShowGloss(false), 900);
    completeTimer = setTimeout(() => {
      onComplete();
    }, 1400);
    return () => {
      clearTimeout(glossTimer);
      clearTimeout(completeTimer);
    };
  }, [object, onComplete]);

  return (
    <div className="word-river-focus-meaning">
      <div className="word-river-focus-icon">
        <WordRiverObjectIcon svgId={object.svgId} className="h-full w-full" />
      </div>
      {showGloss ? (
        <div className="word-river-focus-gloss" aria-live="polite">
          {object.l1Gloss}
        </div>
      ) : null}
    </div>
  );
}

MeaningMoment.propTypes = {
  object: PropTypes.shape({
    svgId: PropTypes.string.isRequired,
    audioKey: PropTypes.string.isRequired,
    l1Gloss: PropTypes.string.isRequired
  }).isRequired,
  onComplete: PropTypes.func.isRequired
};

function SuccessMoment({ object, fontClass, textDirection, onComplete }) {
  useEffect(() => {
    playWordAudio(object.audioKey);
    celebrate({ originY: 0.8, particleCount: 50 });
    const timer = setTimeout(onComplete, 1600);
    return () => clearTimeout(timer);
  }, [object, onComplete]);

  return (
    <div className="word-river-focus-success" dir={textDirection}>
      <div className="word-river-focus-icon success">
        <WordRiverObjectIcon svgId={object.svgId} className="h-full w-full" />
      </div>
      <div className={`word-river-success-word ${fontClass}`}>{object.l2Word}</div>
      <div className="word-river-success-gloss">{object.l1Gloss}</div>
    </div>
  );
}

SuccessMoment.propTypes = {
  object: PropTypes.shape({
    svgId: PropTypes.string.isRequired,
    audioKey: PropTypes.string.isRequired,
    l2Word: PropTypes.string.isRequired,
    l1Gloss: PropTypes.string.isRequired
  }).isRequired,
  fontClass: PropTypes.string.isRequired,
  textDirection: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired
};

export default function WordRiverFocusOverlay({
  phase,
  object,
  difficulty,
  fontClass,
  textDirection,
  onMeaningComplete,
  onSpellingComplete,
  onSuccessComplete,
  onFirstLetterShown
}) {
  const overlayVisible = useMemo(() => phase !== 'sceneView' && Boolean(object), [phase, object]);
  if (!overlayVisible) return null;

  return (
    <div className="word-river-focus-overlay">
      {phase === 'focusMeaning' ? (
        <MeaningMoment object={object} onComplete={onMeaningComplete} />
      ) : null}
      {phase === 'spelling' ? (
        <SpellingRiver
          object={object}
          difficulty={difficulty}
          fontClass={fontClass}
          textDirection={textDirection}
          onCompleted={onSpellingComplete}
          onFirstLetterShown={onFirstLetterShown}
        />
      ) : null}
      {phase === 'success' ? (
        <SuccessMoment
          object={object}
          fontClass={fontClass}
          textDirection={textDirection}
          onComplete={onSuccessComplete}
        />
      ) : null}
    </div>
  );
}

WordRiverFocusOverlay.propTypes = {
  phase: PropTypes.oneOf(['sceneView', 'focusMeaning', 'spelling', 'success']).isRequired,
  object: PropTypes.shape({
    svgId: PropTypes.string.isRequired,
    l2Word: PropTypes.string.isRequired,
    l2Phonetics: PropTypes.arrayOf(PropTypes.string),
    l1Gloss: PropTypes.string.isRequired,
    audioKey: PropTypes.string.isRequired
  }),
  difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']).isRequired,
  fontClass: PropTypes.string.isRequired,
  textDirection: PropTypes.string.isRequired,
  onMeaningComplete: PropTypes.func.isRequired,
  onSpellingComplete: PropTypes.func.isRequired,
  onSuccessComplete: PropTypes.func.isRequired,
  onFirstLetterShown: PropTypes.func
};

WordRiverFocusOverlay.defaultProps = {
  object: null,
  onFirstLetterShown: null
};
