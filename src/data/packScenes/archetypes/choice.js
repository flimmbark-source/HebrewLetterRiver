// Archetype: choice
// The learner is offered options and must respond with one.
// Required structure:
//   - at least one beat with role 'notice_options'
//   - at least one beat with role 'choose_or_build_response'
//   - the notice_options beat must include at least 2 targetConceptIds

function err(code, message, beatId) {
  const out = { code, message };
  if (beatId) out.beatId = beatId;
  return out;
}

export const choiceArchetype = {
  id: 'choice',
  rules: [
    function requiresNoticeOptions(blueprint) {
      const beats = blueprint.beats || [];
      const noticeBeat = beats.find((beat) => beat.role === 'notice_options');
      if (!noticeBeat) {
        return [err('missing_notice_options', 'choice archetype requires a notice_options beat')];
      }
      return [];
    },

    function requiresChooseOrBuildResponse(blueprint) {
      const beats = blueprint.beats || [];
      const responseBeat = beats.find((beat) => beat.role === 'choose_or_build_response');
      if (!responseBeat) {
        return [
          err('missing_choose_or_build_response', 'choice archetype requires a choose_or_build_response beat'),
        ];
      }
      return [];
    },

    function noticeOptionsHasAtLeastTwoConcepts(blueprint) {
      const beats = blueprint.beats || [];
      const noticeBeat = beats.find((beat) => beat.role === 'notice_options');
      if (!noticeBeat) return [];
      const concepts = noticeBeat.targetConceptIds || [];
      if (concepts.length < 2) {
        return [
          err(
            'notice_options_too_few_concepts',
            `notice_options beat must include at least 2 targetConceptIds (found ${concepts.length})`,
            noticeBeat.id
          ),
        ];
      }
      return [];
    },
  ],
};
