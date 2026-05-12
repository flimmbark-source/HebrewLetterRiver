// Stable concept IDs — the language-agnostic bridge labels that identify
// which pack words appear in each scene line.
//
// Concept ID policy:
//   Concept IDs represent the intended learning *meaning* in the scene,
//   not merely the surface target-language word. Polysemous words that
//   carry distinct semantic or pragmatic functions must be split into
//   separate concept IDs (e.g. שלום → 'hello' vs 'goodbye',
//   בבקשה → 'please' vs 'you-are-welcome').
//
//   No blueprint, target token, visualCue, packConceptId, supportConceptId,
//   acceptedConceptSet, or acceptedConceptSequence may reference a concept
//   ID that is absent from this registry.
export const CONCEPTS = {
  coffee: 'coffee',
  water: 'water',
  bread: 'bread',
  please: 'please',
  want: 'want',
  yes: 'yes',
  'thank-you': 'thank-you',
  'can-get': 'can-get',
  and: 'and',
  or: 'or',
  also: 'also',

  // Colors (grounded-visual-property)
  red: 'red',
  blue: 'blue',
  green: 'green',
  yellow: 'yellow',
};

export function isKnownConceptId(conceptId) {
  return typeof conceptId === 'string' && Object.prototype.hasOwnProperty.call(CONCEPTS, conceptId);
}

export function listKnownConceptIds() {
  return Object.keys(CONCEPTS);
}
