// Bridge Builder wordId → Pack Scene conceptId mapping.
//
// Each entry maps a Bridge Builder wordId (from bridgeBuilderWords.js,
// including consolidated bbct- words) to the Pack Scene conceptId that
// represents it inside its registered Pack Scene blueprint.
//
// Polysemy rule:
//   When the same Bridge Builder word would mean different things in
//   different scenes, the mapping reflects the scene it is scoped to.
//   For example bb-kamah maps to 'how-much' here because shopping_01
//   uses it as a price inquiry. A future pack that uses bb-kamah as a
//   counting interrogative would need a separate 'how-many' concept
//   and a per-pack mapping override.

export const bridgeWordConceptMap = {
  greetings_01: {
    'bb-shalom': 'hello',
    'bb-todah': 'thank-you',
    'bb-boker-tov': 'good-morning',
    'bb-layla-tov': 'good-night',
    'bb-bevakasha': 'you-are-welcome',
  },
  pronouns_01: {
    'bb-ani': 'i',
    'bb-atah': 'you-m',
    'bb-at': 'you-f',
    'bbct-I': 'i',
    'bbct-you': 'you-m',
    'bbct-he': 'he',
    'bbct-she': 'she',
    'bbct-we': 'we',
    'bbct-they': 'they',
  },
  family_01: {
    'bb-ima': 'mom',
    'bb-abba': 'dad',
    'bb-mishpacha': 'family',
    'bb-bayit': 'home',
    'bbct-family': 'family',
    'bbct-friend': 'friend',
    'bbct-child': 'child',
    'bbct-parent': 'parent',
    'bbct-neighbor': 'neighbor',
    'bbct-stranger': 'stranger',
  },
  food_01: {
    'bb-cafe': 'coffee',
    'bb-mayim': 'water',
    'bb-lechem': 'bread',
    'bb-tapuach': 'apple',
    'bbct-food': 'food',
  },
  adjectives_01: {
    'bb-gadol': 'big',
    'bb-katan': 'small',
    'bb-gavoha': 'tall',
    'bb-namuch': 'short',
  },
  colors_01: {
    'bb-adom': 'red',
    'bb-kachol': 'blue',
    'bb-yarok': 'green',
    'bb-tsahov': 'yellow',
  },
  numbers_01: {
    'bb-echad': 'one',
    'bb-shtayim': 'two',
    'bb-shalosh': 'three',
    'bb-arba': 'four',
    'bb-chamesh': 'five',
  },
  everyday_objects_01: {
    'bb-sefer': 'book',
    'bb-telefon': 'phone',
    'bb-shulchan': 'table',
    'bb-delet': 'door',
    'bbct-thing': 'thing',
  },
  shopping_01: {
    'bb-kesef': 'money',
    'bb-chanut': 'store',
    'bb-kamah': 'how-much',
    'bb-sakit': 'bag',
    'bbct-buy': 'buy',
    'bbct-pay': 'pay',
  },
};

export function getConceptIdForWord(packId, wordId) {
  const packMap = bridgeWordConceptMap[packId];
  if (!packMap) return null;
  return packMap[wordId] || null;
}

export function listMappedPackIds() {
  return Object.keys(bridgeWordConceptMap);
}
