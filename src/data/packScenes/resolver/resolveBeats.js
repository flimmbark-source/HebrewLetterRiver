// resolveBeats — replaces the old injectDistractors step.
// Hydrates each blueprint beat into the renderer-ready shape using
// targetLines, distractorPool, and appStrings.

function isDistractorLineId(id) {
  return typeof id === 'string' && id.startsWith('distractor_');
}

function err(code, message, beatId) {
  const out = { code, message };
  if (beatId) out.beatId = beatId;
  return out;
}

function lookupLine(lineId, targetLines, distractorPool, errors, beatId) {
  if (!lineId) return null;
  if (isDistractorLineId(lineId)) {
    const line = distractorPool ? distractorPool[lineId] : null;
    if (!line) {
      errors.push(err('missing_distractor', `Distractor line not found: ${lineId}`, beatId));
      return null;
    }
    return line;
  }
  const line = targetLines[lineId];
  if (!line) {
    errors.push(err('missing_target_line', `Target line not found: ${lineId}`, beatId));
    return null;
  }
  return line;
}

function buildTileBank(answerLines, beat, distractorPool) {
  const tiles = [];
  const seen = new Set();

  for (const line of answerLines) {
    if (!line || !Array.isArray(line.tokens)) continue;
    for (const token of line.tokens) {
      if (!token || typeof token.text !== 'string') continue;
      const key = token.text;
      if (seen.has(key)) continue;
      seen.add(key);
      tiles.push({ text: token.text, conceptId: token.conceptId || null, source: 'answer' });
    }
  }

  const policy = beat.tileDistractorPolicy;
  if (policy && distractorPool) {
    const exclusions = new Set(policy.domainExclusions || []);
    const pickCount = typeof policy.count === 'number' ? policy.count : 0;
    let added = 0;
    for (const lineId of Object.keys(distractorPool)) {
      if (added >= pickCount) break;
      const line = distractorPool[lineId];
      if (!line) continue;
      if (exclusions.has(line.domainId)) continue;
      const firstToken = (line.tokens || []).find((tok) => tok && typeof tok.text === 'string' && !seen.has(tok.text));
      if (!firstToken) continue;
      seen.add(firstToken.text);
      tiles.push({ text: firstToken.text, conceptId: firstToken.conceptId || null, source: 'distractor', distractorLineId: lineId });
      added += 1;
    }
  }

  return tiles;
}

function resolveMeaningChoiceBeat(beat, appStrings) {
  const errors = [];
  const supportMeanings = appStrings.supportMeanings || {};
  const options = (beat.options || []).map((opt) => {
    const text = supportMeanings[opt.meaningId];
    if (text === undefined) {
      errors.push(err('missing_support_meaning', `meaningChoice option missing supportMeaning: ${opt.meaningId}`, beat.id));
    }
    return { id: opt.id, text: text ?? '', isCorrect: !!opt.isCorrect };
  });
  return { options, errors };
}

function resolveBuildLineBeat(beat, targetLines, distractorPool) {
  const errors = [];
  const answerLines = (beat.answerLineIds || [])
    .map((id) => lookupLine(id, targetLines, distractorPool, errors, beat.id))
    .filter(Boolean);
  const tileBankTokens = buildTileBank(answerLines, beat, distractorPool);
  return { answerLines, tileBankTokens, errors };
}

function resolveChooseReplyBeat(beat, targetLines, distractorPool, appStrings) {
  const errors = [];
  const lineSupport = appStrings.lineSupportMeanings || {};
  const options = (beat.options || []).map((opt) => {
    const line = lookupLine(opt.lineId, targetLines, distractorPool, errors, beat.id);
    if (!line) {
      return {
        id: opt.id,
        lineId: opt.lineId,
        isCorrect: !!opt.isCorrect,
        targetText: '',
        supportText: '',
        direction: 'ltr',
        tokens: [],
      };
    }
    return {
      id: opt.id,
      lineId: opt.lineId,
      isCorrect: !!opt.isCorrect,
      targetText: line.targetText,
      supportText: lineSupport[opt.lineId] || '',
      direction: line.direction || 'ltr',
      tokens: line.tokens || [],
    };
  });
  return { options, errors };
}

/**
 * Hydrate every blueprint beat into final renderer-ready shape.
 *
 * @returns {{ status: 'ok', beats: Array } |
 *           { status: 'invalid_resolved_scene', errors: Array }}
 */
export function resolveBeats(blueprint, targetLines, distractorPool, appStrings) {
  const allErrors = [];
  const prompts = (appStrings && appStrings.prompts) || {};
  const beats = [];

  for (const beat of blueprint.beats || []) {
    const cueLine = beat.cueLineId
      ? lookupLine(beat.cueLineId, targetLines, distractorPool, allErrors, beat.id)
      : null;

    let activeLine = null;
    if (beat.activeLineId) {
      activeLine = lookupLine(beat.activeLineId, targetLines, distractorPool, allErrors, beat.id);
    }

    const resolved = {
      id: beat.id,
      role: beat.role || null,
      actionType: beat.actionType,
      prompt: prompts[beat.id] || '',
      cueLine: cueLine || null,
      activeLine: activeLine || null,
      targetConceptIds: beat.targetConceptIds || [],
      options: [],
      answerLines: [],
      tileBankTokens: [],
      acceptedConceptSets: beat.acceptedConceptSets || null,
      acceptedConceptSequences: beat.acceptedConceptSequences || null,
    };

    if (beat.actionType === 'meaningChoice') {
      const out = resolveMeaningChoiceBeat(beat, appStrings);
      resolved.options = out.options;
      allErrors.push(...out.errors);
    } else if (beat.actionType === 'buildLine') {
      const out = resolveBuildLineBeat(beat, targetLines, distractorPool);
      resolved.answerLines = out.answerLines;
      resolved.tileBankTokens = out.tileBankTokens;
      allErrors.push(...out.errors);
    } else if (beat.actionType === 'chooseReply') {
      const out = resolveChooseReplyBeat(beat, targetLines, distractorPool, appStrings);
      resolved.options = out.options;
      allErrors.push(...out.errors);
    }

    beats.push(resolved);
  }

  if (allErrors.length > 0) {
    return { status: 'invalid_resolved_scene', errors: allErrors };
  }
  return { status: 'ok', beats };
}
