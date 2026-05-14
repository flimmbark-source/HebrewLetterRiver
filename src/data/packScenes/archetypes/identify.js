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

import {
  COUNT_DOTS_CONCEPT_BY_COUNT,
  COUNT_DOTS_MAX,
  SUPPORTED_VISUAL_CUE_TYPES,
} from '../visualCueConstants.js';

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

    function visualCuesAreWellFormed(blueprint) {
      const beats = blueprint.beats || [];
      const errors = [];
      for (const beat of beats) {
        const cue = beat.visualCue;
        if (!cue) continue;
        if (!cue.type || !SUPPORTED_VISUAL_CUE_TYPES.has(cue.type)) {
          errors.push(
            err(
              'unsupported_visual_cue_type',
              `visualCue.type must be one of: ${[...SUPPORTED_VISUAL_CUE_TYPES].join(', ')}`,
              beat.id
            )
          );
          continue;
        }

        if (cue.type === 'colorCircle') {
          if (!cue.colorConceptId || typeof cue.colorConceptId !== 'string') {
            errors.push(
              err(
                'invalid_color_circle_cue',
                'colorCircle visualCue must include colorConceptId',
                beat.id
              )
            );
            continue;
          }
          const targets = beat.targetConceptIds || [];
          if (!targets.includes(cue.colorConceptId)) {
            errors.push(
              err(
                'visual_cue_concept_mismatch',
                `colorCircle.colorConceptId '${cue.colorConceptId}' must appear in beat.targetConceptIds`,
                beat.id
              )
            );
          }
        }

        if (cue.type === 'objectGlyph') {
          if (!cue.objectConceptId || typeof cue.objectConceptId !== 'string') {
            errors.push(
              err(
                'invalid_object_glyph_cue',
                'objectGlyph visualCue must include objectConceptId',
                beat.id
              )
            );
            continue;
          }
          const targets = beat.targetConceptIds || [];
          if (!targets.includes(cue.objectConceptId)) {
            errors.push(
              err(
                'visual_cue_concept_mismatch',
                `objectGlyph.objectConceptId '${cue.objectConceptId}' must appear in beat.targetConceptIds`,
                beat.id
              )
            );
          }
        }

        if (cue.type === 'countDots') {
          if (!Number.isInteger(cue.count)) {
            errors.push(
              err('invalid_count_dots_cue', 'countDots visualCue must have an integer count', beat.id)
            );
            continue;
          }
          if (cue.count < 1 || cue.count > COUNT_DOTS_MAX) {
            errors.push(
              err(
                'invalid_count_dots_cue',
                `countDots.count must be between 1 and ${COUNT_DOTS_MAX} (got ${cue.count})`,
                beat.id
              )
            );
            continue;
          }
          const expectedConcept = COUNT_DOTS_CONCEPT_BY_COUNT[cue.count];
          if (!cue.conceptId || cue.conceptId !== expectedConcept) {
            errors.push(
              err(
                'visual_cue_concept_mismatch',
                `countDots.conceptId must equal '${expectedConcept}' for count ${cue.count}`,
                beat.id
              )
            );
            continue;
          }
          const targets = beat.targetConceptIds || [];
          if (!targets.includes(cue.conceptId)) {
            errors.push(
              err(
                'visual_cue_concept_mismatch',
                `countDots.conceptId '${cue.conceptId}' must appear in beat.targetConceptIds`,
                beat.id
              )
            );
          }
        }
      }
      return errors;
    },
  ],
};
