// Final post-resolution sanity check. Catches problems that only become
// visible after target lines and app strings are joined.

function err(code, message, beatId) {
  const out = { code, message };
  if (beatId) out.beatId = beatId;
  return out;
}

export function validateResolvedScene(resolvedBeats) {
  const errors = [];
  if (!Array.isArray(resolvedBeats)) {
    return { status: 'invalid_resolved_scene', errors: [err('not_an_array', 'Resolved beats must be an array')] };
  }

  for (const beat of resolvedBeats) {
    if (beat.actionType === 'meaningChoice') {
      if (!beat.options.length) {
        errors.push(err('empty_options', 'meaningChoice resolved with no options', beat.id));
      } else if (!beat.options.every((opt) => typeof opt.text === 'string' && opt.text.length > 0)) {
        errors.push(err('blank_option_text', 'meaningChoice option has blank text', beat.id));
      }
    }

    if (beat.actionType === 'buildLine') {
      if (!beat.answerLines.length) {
        errors.push(err('missing_answer_lines', 'buildLine resolved with no answer lines', beat.id));
      }
      if (!beat.tileBankTokens.length) {
        errors.push(err('empty_tile_bank', 'buildLine resolved with empty tile bank', beat.id));
      }
    }

    if (beat.actionType === 'chooseReply') {
      if (!beat.options.length) {
        errors.push(err('empty_options', 'chooseReply resolved with no options', beat.id));
      } else if (!beat.options.every((opt) => typeof opt.targetText === 'string' && opt.targetText.length > 0)) {
        errors.push(err('blank_target_text', 'chooseReply option has blank targetText', beat.id));
      }
    }
  }

  if (errors.length > 0) {
    return { status: 'invalid_resolved_scene', errors };
  }
  return { status: 'ok' };
}
