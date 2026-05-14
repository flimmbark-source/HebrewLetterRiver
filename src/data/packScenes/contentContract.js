// Content contract definitions and mappings.
//
// The contentContract on a blueprint declares author intent so the system
// can enforce educational structure rather than merely accepting whatever
// scene data happens to exist.
//
// Machine-checked fields (validated):
//   sceneModel         — must map to blueprint.archetype via SCENE_MODEL_ARCHETYPE_MAP
//   correctnessSource  — must be a known correctness source
//   answerPolicy       — must be a known answer policy
//   coverage           — must be a known coverage policy
//   maxBeats           — positive integer; cap on blueprint.beats.length
//
// Reviewer/documentation fields (preserved but not enforced):
//   vocabularyType, distractorPolicyNote, risks, notes

export const SCENE_MODEL_ARCHETYPE_MAP = {
  'transactional-choice': ['choice'],
  'grounded-identification': ['identify'],
  'text-cue-identification': ['identify'],
  'social-exchange': ['socialExchange'],
  'request-response': ['request'],
};

export const KNOWN_CORRECTNESS_SOURCES = new Set([
  'conversational-fit',
  'visualCue',
  'textCue',
  'social-protocol',
  'mixed',
]);

export const KNOWN_ANSWER_POLICIES = new Set([
  'one-correct-per-beat',
  'mixed-valid-replies',
]);

export const KNOWN_COVERAGE_POLICIES = new Set([
  'all-pack-concepts-produced',
  'all-pack-concepts-meaningfully-used',
]);

export const MACHINE_CHECKED_CONTRACT_FIELDS = [
  'sceneModel',
  'correctnessSource',
  'answerPolicy',
  'coverage',
  'maxBeats',
];

export function archetypesForSceneModel(sceneModel) {
  return SCENE_MODEL_ARCHETYPE_MAP[sceneModel] || null;
}
