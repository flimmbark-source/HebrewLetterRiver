// Final post-resolution sanity check. Catches problems that only become
// visible after target lines and app strings are joined.

function err(code, message, beatId) {
  const out = { code, message };
  if (beatId) out.beatId = beatId;
  return out;
}

function tokenLeaksPackConcept(token, packConceptSet) {
  if (!token || typeof token !== 'object') return null;
  if (token.conceptId && packConceptSet.has(token.conceptId)) return token.conceptId;
  return null;
}

function isFromDistractorPool(lineId) {
  return typeof lineId === 'string' && lineId.startsWith('distractor_');
}

function checkDistractorOverlap(beat, packConceptSet, errors) {
  if (beat.actionType === 'chooseReply') {
    for (const opt of beat.options || []) {
      if (!opt || !isFromDistractorPool(opt.lineId)) continue;
      for (const token of opt.tokens || []) {
        const leak = tokenLeaksPackConcept(token, packConceptSet);
        if (leak) {
          errors.push(
            err(
              'distractor_concept_leak',
              `chooseReply distractor option '${opt.id}' contains pack concept '${leak}'`,
              beat.id
            )
          );
        }
      }
    }
  }

  if (beat.actionType === 'buildLine') {
    for (const tile of beat.tileBankTokens || []) {
      if (tile.source !== 'distractor') continue;
      const leak = tokenLeaksPackConcept(tile, packConceptSet);
      if (leak) {
        errors.push(
          err(
            'distractor_concept_leak',
            `buildLine distractor tile contains pack concept '${leak}'`,
            beat.id
          )
        );
      }
    }
  }
}

export function validateResolvedScene(resolvedBeats, blueprint = null) {
  const errors = [];
  if (!Array.isArray(resolvedBeats)) {
    return { status: 'invalid_resolved_scene', errors: [err('not_an_array', 'Resolved beats must be an array')] };
  }

  const packConceptSet = new Set((blueprint && blueprint.packConceptIds) || []);

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

    if (packConceptSet.size > 0) {
      checkDistractorOverlap(beat, packConceptSet, errors);
    }
  }

  if (errors.length > 0) {
    return { status: 'invalid_resolved_scene', errors };
  }
  return { status: 'ok' };
}
