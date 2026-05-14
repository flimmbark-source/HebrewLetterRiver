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
  apple: 'apple',
  food: 'food',
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

  // Cardinal numbers 1..5 (grounded via countDots cue)
  one: 'one',
  two: 'two',
  three: 'three',
  four: 'four',
  five: 'five',

  // Everyday objects (grounded-identification via objectGlyph).
  book: 'book',
  phone: 'phone',
  table: 'table',
  door: 'door',
  thing: 'thing',

  // Greetings and courtesy (social-exchange).
  // Polysemy notes:
  //   bb-shalom → 'hello' in greetings_01 (the peace/goodbye readings are not taught here).
  //   bb-bevakasha → 'you-are-welcome' in greetings_01 (the 'please' reading lives in food/shopping).
  hello: 'hello',
  'good-morning': 'good-morning',
  'good-night': 'good-night',
  'you-are-welcome': 'you-are-welcome',

  // Shopping (transactional-choice).
  // Polysemy note: 'how-much' is the price-inquiry reading of bb-kamah.
  // A future quantity scene that uses bb-kamah as a counting interrogative
  // would need a separate 'how-many' concept; do not collapse them here.
  money: 'money',
  store: 'store',
  'how-much': 'how-much',
  bag: 'bag',
  buy: 'buy',
  pay: 'pay',
};

export function isKnownConceptId(conceptId) {
  return typeof conceptId === 'string' && Object.prototype.hasOwnProperty.call(CONCEPTS, conceptId);
}

export function listKnownConceptIds() {
  return Object.keys(CONCEPTS);
}
