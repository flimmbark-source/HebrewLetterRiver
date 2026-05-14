// Archetype: socialExchange
//
// A social or conversational exchange where correctness is determined by
// conversational fit, social protocol, or a visual context cue (or a mix).
// The learner must select the appropriate reply for the situation.
//
// Required structure:
//   - At least one answer beat (chooseReply or buildLine).
//   - Every packConceptId appears in at least one meaningful answer beat.

function err(code, message, beatId) {
  const out = { code, message };
  if (beatId) out.beatId = beatId;
  return out;
}

function beatProducesConcept(beat, conceptId) {
  if (!beat) return false;
  const targets = beat.targetConceptIds || [];
  if (beat.actionType === 'chooseReply' && targets.includes(conceptId)) return true;
  if (beat.actionType === 'buildLine') {
    for (const set of beat.acceptedConceptSets || []) {
      if (Array.isArray(set) && set.includes(conceptId)) return true;
    }
    for (const seq of beat.acceptedConceptSequences || []) {
      if (Array.isArray(seq) && seq.includes(conceptId)) return true;
    }
  }
  return false;
}

function isAnswerBeat(beat) {
  return beat && (beat.actionType === 'chooseReply' || beat.actionType === 'buildLine');
}

export const socialExchangeArchetype = {
  id: 'socialExchange',
  rules: [
    function hasAtLeastOneAnswerBeat(blueprint) {
      const beats = blueprint.beats || [];
      if (!beats.some(isAnswerBeat)) {
        return [
          err(
            'social_exchange_missing_answer_beat',
            'socialExchange archetype requires at least one chooseReply or buildLine answer beat'
          ),
        ];
      }
      return [];
    },

    function eachPackConceptHasAnswerBeat(blueprint) {
      const beats = blueprint.beats || [];
      const errors = [];
      for (const conceptId of blueprint.packConceptIds || []) {
        const found = beats.some((b) => beatProducesConcept(b, conceptId));
        if (!found) {
          errors.push(
            err(
              'social_exchange_pack_concept_not_produced',
              `socialExchange archetype requires packConcept '${conceptId}' to appear in at least one answer beat`
            )
          );
        }
      }
      return errors;
    },
  ],
};
