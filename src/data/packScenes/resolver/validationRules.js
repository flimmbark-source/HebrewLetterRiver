// Universal beat validation rules. These run regardless of archetype.
//
// Each rule receives (beat) and returns either:
//   null                     — no error
//   { code, beatId, message }  — a single error
//   Array<{ code, beatId, message }> — multiple errors (visual cue rules)
//
// Rules are pure and synchronous.

import {
  SUPPORTED_VISUAL_CUE_TYPES,
  SUPPORTED_OBJECT_GLYPH_CONCEPT_IDS,
  SUPPORTED_DAY_PARTS,
  DAY_PART_CONCEPT_MAP,
  COUNT_DOTS_CONCEPT_BY_COUNT,
  COUNT_DOTS_MAX,
} from '../visualCueConstants.js';

const ACTION_TYPES = new Set(['spotPackWords', 'meaningChoice', 'buildLine', 'chooseReply']);

function err(code, beatId, message) {
  return { code, beatId, message };
}

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}

const universalRules = [
  function actionTypeKnown(beat) {
    if (!ACTION_TYPES.has(beat.actionType)) {
      return err('unknown_action_type', beat.id, `Unknown actionType: ${beat.actionType}`);
    }
    return null;
  },

  function meaningChoiceRequiresTargetConcepts(beat) {
    if (beat.actionType !== 'meaningChoice') return null;
    if (!isNonEmptyArray(beat.targetConceptIds)) {
      return err('missing_target_concepts', beat.id, 'meaningChoice beat must have targetConceptIds');
    }
    return null;
  },

  function buildLineRequiresAnswerLineIds(beat) {
    if (beat.actionType !== 'buildLine') return null;
    if (!isNonEmptyArray(beat.answerLineIds)) {
      return err('missing_answer_line_ids', beat.id, 'buildLine beat must have answerLineIds');
    }
    return null;
  },

  function buildLineRequiresAcceptedConcepts(beat) {
    if (beat.actionType !== 'buildLine') return null;
    if (!isNonEmptyArray(beat.acceptedConceptSets) && !isNonEmptyArray(beat.acceptedConceptSequences)) {
      return err(
        'missing_accepted_concepts',
        beat.id,
        'buildLine beat must have acceptedConceptSets or acceptedConceptSequences'
      );
    }
    return null;
  },

  function chooseReplyRequiresOptions(beat) {
    if (beat.actionType !== 'chooseReply') return null;
    if (!isNonEmptyArray(beat.options)) {
      return err(
        'missing_reply_source',
        beat.id,
        'chooseReply beat must have options'
      );
    }
    return null;
  },

  function chooseReplyForbidsReplyDistractorPolicy(beat) {
    if (beat.actionType !== 'chooseReply') return null;
    if (beat.replyDistractorPolicy) {
      return err(
        'unsupported_reply_distractor_policy',
        beat.id,
        'replyDistractorPolicy is not yet supported; use explicit options instead'
      );
    }
    return null;
  },

  function chooseReplyExplicitOptionsNeedCorrect(beat) {
    if (beat.actionType !== 'chooseReply') return null;
    if (!isNonEmptyArray(beat.options)) return null;
    const correctCount = beat.options.filter((opt) => opt && opt.isCorrect === true).length;
    if (correctCount !== 1) {
      return err(
        'invalid_correct_count',
        beat.id,
        `chooseReply explicit options must have exactly one correct option (found ${correctCount})`
      );
    }
    return null;
  },

  function buildLineForbidsReplyDistractorPolicy(beat) {
    if (beat.actionType !== 'buildLine') return null;
    if (beat.replyDistractorPolicy) {
      return err(
        'unsupported_reply_distractor_policy',
        beat.id,
        'replyDistractorPolicy is not yet supported and cannot appear on a buildLine beat'
      );
    }
    return null;
  },

  function chooseReplyForbidsTileDistractorPolicy(beat) {
    if (beat.actionType !== 'chooseReply') return null;
    if (beat.tileDistractorPolicy) {
      return err(
        'misplaced_distractor_policy',
        beat.id,
        'chooseReply beat cannot have tileDistractorPolicy'
      );
    }
    return null;
  },

  function nonInteractiveBeatsForbidDistractorPolicies(beat) {
    if (beat.actionType !== 'spotPackWords' && beat.actionType !== 'meaningChoice') return null;
    if (beat.tileDistractorPolicy) {
      return err(
        'misplaced_distractor_policy',
        beat.id,
        `${beat.actionType} beat cannot have tileDistractorPolicy`
      );
    }
    if (beat.replyDistractorPolicy) {
      return err(
        'unsupported_reply_distractor_policy',
        beat.id,
        'replyDistractorPolicy is not yet supported'
      );
    }
    return null;
  },

  // Visual cue validation — applies to all archetypes.
  // Returns an array of errors (may be empty or have multiple items).
  function visualCueIsWellFormed(beat) {
    const cue = beat.visualCue;
    if (!cue) return null;

    const errors = [];

    if (!cue.type || !SUPPORTED_VISUAL_CUE_TYPES.has(cue.type)) {
      errors.push(
        err(
          'unsupported_visual_cue_type',
          beat.id,
          `visualCue.type must be one of: ${[...SUPPORTED_VISUAL_CUE_TYPES].join(', ')}`
        )
      );
      return errors;
    }

    if (cue.type === 'colorCircle') {
      if (!cue.colorConceptId || typeof cue.colorConceptId !== 'string') {
        errors.push(
          err('invalid_color_circle_cue', beat.id, 'colorCircle visualCue must include colorConceptId')
        );
        return errors;
      }
      const targets = beat.targetConceptIds || [];
      if (!targets.includes(cue.colorConceptId)) {
        errors.push(
          err(
            'visual_cue_concept_mismatch',
            beat.id,
            `colorCircle.colorConceptId '${cue.colorConceptId}' must appear in beat.targetConceptIds`
          )
        );
      }
    }

    if (cue.type === 'objectGlyph') {
      if (!cue.objectConceptId || typeof cue.objectConceptId !== 'string') {
        errors.push(
          err('invalid_object_glyph_cue', beat.id, 'objectGlyph visualCue must include objectConceptId')
        );
        return errors;
      }
      if (!SUPPORTED_OBJECT_GLYPH_CONCEPT_IDS.has(cue.objectConceptId)) {
        errors.push(
          err(
            'unsupported_object_glyph_concept',
            beat.id,
            `objectGlyph.objectConceptId '${cue.objectConceptId}' is not a supported object glyph ID; ` +
              `must be one of: ${[...SUPPORTED_OBJECT_GLYPH_CONCEPT_IDS].join(', ')}`
          )
        );
        return errors;
      }
      const targets = beat.targetConceptIds || [];
      if (!targets.includes(cue.objectConceptId)) {
        errors.push(
          err(
            'visual_cue_concept_mismatch',
            beat.id,
            `objectGlyph.objectConceptId '${cue.objectConceptId}' must appear in beat.targetConceptIds`
          )
        );
      }
    }

    if (cue.type === 'countDots') {
      if (!Number.isInteger(cue.count)) {
        errors.push(err('invalid_count_dots_cue', beat.id, 'countDots visualCue must have an integer count'));
        return errors;
      }
      if (cue.count < 1 || cue.count > COUNT_DOTS_MAX) {
        errors.push(
          err(
            'invalid_count_dots_cue',
            beat.id,
            `countDots.count must be between 1 and ${COUNT_DOTS_MAX} (got ${cue.count})`
          )
        );
        return errors;
      }
      const expectedConcept = COUNT_DOTS_CONCEPT_BY_COUNT[cue.count];
      if (!cue.conceptId || cue.conceptId !== expectedConcept) {
        errors.push(
          err(
            'visual_cue_concept_mismatch',
            beat.id,
            `countDots.conceptId must equal '${expectedConcept}' for count ${cue.count}`
          )
        );
        return errors;
      }
      const targets = beat.targetConceptIds || [];
      if (!targets.includes(cue.conceptId)) {
        errors.push(
          err(
            'visual_cue_concept_mismatch',
            beat.id,
            `countDots.conceptId '${cue.conceptId}' must appear in beat.targetConceptIds`
          )
        );
      }
    }

    if (cue.type === 'dayPart') {
      if (!cue.dayPart || !SUPPORTED_DAY_PARTS.has(cue.dayPart)) {
        errors.push(
          err(
            'invalid_day_part_cue',
            beat.id,
            `dayPart visualCue must include a valid dayPart; must be one of: ${[...SUPPORTED_DAY_PARTS].join(', ')}`
          )
        );
        return errors;
      }
      const expectedConcept = DAY_PART_CONCEPT_MAP[cue.dayPart];
      const targets = beat.targetConceptIds || [];
      if (!targets.includes(expectedConcept)) {
        errors.push(
          err(
            'visual_cue_concept_mismatch',
            beat.id,
            `dayPart '${cue.dayPart}' requires targetConceptIds to include '${expectedConcept}'`
          )
        );
      }
    }

    return errors.length > 0 ? errors : null;
  },
];

export function runUniversalBeatRules(beat) {
  const errors = [];
  for (const rule of universalRules) {
    const result = rule(beat);
    if (!result) continue;
    if (Array.isArray(result)) {
      errors.push(...result);
    } else {
      errors.push(result);
    }
  }
  return errors;
}

export const __testing = { universalRules };
