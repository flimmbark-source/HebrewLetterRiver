// Maps Bridge Builder word IDs (from bridgeBuilderPacks wordIds) to Pack Scene
// concept IDs (from blueprints packConceptIds).
//
// Add an entry here whenever a word from a registered Pack Scene's Bridge
// Builder pack (after consolidation) needs to be recognised by the audit.
//
// Only pack target vocabulary goes here. Support concepts (please, yes,
// thank-you, or, also) do not belong — they are not Bridge Builder pack words.
//
// When a new Pack Scene is registered, extend this map with every word ID
// that appears in the matching Bridge Builder pack after consolidation.
export const BRIDGE_WORD_TO_PACK_SCENE_CONCEPT = {
  // food_01 (consolidated with food_02)
  'bb-cafe':    'coffee',
  'bb-mayim':   'water',
  'bb-lechem':  'bread',
  'bb-tapuach': 'apple',
  'bbct-food':  'food',

  // colors_01
  'bb-adom':   'red',
  'bb-kachol': 'blue',
  'bb-yarok':  'green',
  'bb-tsahov': 'yellow',

  // numbers_01
  'bb-echad':   'one',
  'bb-shtayim': 'two',
  'bb-shalosh': 'three',
  'bb-arba':    'four',
  'bb-chamesh': 'five',
};
