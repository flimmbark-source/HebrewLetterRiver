// Universal beat validation rules. These run regardless of archetype.
//
// Each rule receives (beat, context) and returns either null (ok) or an
// error object { code, beatId, message }. The rules are pure and synchronous.

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

  function chooseReplyRequiresOptionsOrPolicy(beat) {
    if (beat.actionType !== 'chooseReply') return null;
    const hasOptions = isNonEmptyArray(beat.options);
    const hasPolicy = !!beat.replyDistractorPolicy;
    if (!hasOptions && !hasPolicy) {
      return err(
        'missing_reply_source',
        beat.id,
        'chooseReply beat must have options or replyDistractorPolicy'
      );
    }
    return null;
  },

  function chooseReplyForbidsBothOptionsAndPolicy(beat) {
    if (beat.actionType !== 'chooseReply') return null;
    if (isNonEmptyArray(beat.options) && beat.replyDistractorPolicy) {
      return err(
        'conflicting_reply_source',
        beat.id,
        'chooseReply beat cannot have both options and replyDistractorPolicy'
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
        'misplaced_distractor_policy',
        beat.id,
        'buildLine beat cannot have replyDistractorPolicy'
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
    if (beat.tileDistractorPolicy || beat.replyDistractorPolicy) {
      return err(
        'misplaced_distractor_policy',
        beat.id,
        `${beat.actionType} beat cannot have tile or reply distractor policies`
      );
    }
    return null;
  },
];

export function runUniversalBeatRules(beat) {
  const errors = [];
  for (const rule of universalRules) {
    const result = rule(beat);
    if (result) errors.push(result);
  }
  return errors;
}

export const __testing = { universalRules };
