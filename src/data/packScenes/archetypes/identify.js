// Archetype: identify
//
// The learner is shown a grounding cue (visual or text) that uniquely
// determines the correct answer, and must produce/select the pack-language
// label for that cue.
//
// Required structure:
//   - At least one meaningful answer beat exists (i.e. a beat that actually
//     elicits a pack concept as the correct answer).
//   - Every packConceptId appears in at least one meaningful answer beat.
//   - chooseReply identify beats with role 'choose_or_build_response' have
//     exactly one correct option (already enforced universally, but the
//     archetype requires the beat exists at all).
//   - visualCue, when present, must use a supported type and carry the
//     concept-determining payload (e.g. colorCircle.colorConceptId,
//     countDots.count + countDots.conceptId).
//
// A beat is "meaningful" for a concept if:
//   - actionType 'chooseReply' AND targetConceptIds includes the concept, OR
//   - actionType 'buildLine' AND any acceptedConceptSets or
//     acceptedConceptSequences entry contains the concept.


function err(code, message, beatId) {
  const out = { code, message };
  if (beatId) out.beatId = beatId;
  return out;
}

function beatProducesConcept(beat, conceptId) {
  if (!beat) return false;
  const targets = beat.targetConceptIds || [];
  if (beat.actionType === 'chooseReply' && targets.includes(conceptId)) {
    return true;
  }
  if (beat.actionType === 'buildLine') {
    const sets = beat.acceptedConceptSets || [];
    for (const set of sets) {
      if (Array.isArray(set) && set.includes(conceptId)) return true;
    }
    const seqs = beat.acceptedConceptSequences || [];
    for (const seq of seqs) {
      if (Array.isArray(seq) && seq.includes(conceptId)) return true;
    }
  }
  return false;
}

function isAnswerBeat(beat) {
  return beat && (beat.actionType === 'chooseReply' || beat.actionType === 'buildLine');
}

export const identifyArchetype = {
  id: 'identify',
  rules: [
    function hasAtLeastOneAnswerBeat(blueprint) {
      const beats = blueprint.beats || [];
      if (!beats.some(isAnswerBeat)) {
        return [
          err(
            'identify_missing_answer_beat',
            'identify archetype requires at least one chooseReply or buildLine answer beat'
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
              'identify_pack_concept_not_produced',
              `identify archetype requires packConcept '${conceptId}' to appear in at least one answer beat`
            )
          );
        }
      }
      return errors;
    },

  ],
};
