const frenchLetters = [
  { id: 'a', symbol: 'A', name: 'A', transliteration: 'a', pronunciation: 'ah', sound: 'ah' },
  { id: 'e', symbol: 'E', name: 'E', transliteration: 'e', pronunciation: 'uh', sound: 'uh' },
  { id: 'i', symbol: 'I', name: 'I', transliteration: 'i', pronunciation: 'ee', sound: 'ee' },
  { id: 'o', symbol: 'O', name: 'O', transliteration: 'o', pronunciation: 'oh', sound: 'oh' },
  { id: 'u', symbol: 'U', name: 'U', transliteration: 'u', pronunciation: 'oo', sound: 'oo' },
  { id: 'c-cedille', symbol: 'Ç', name: 'Ç', transliteration: 'ç', pronunciation: 'seh', sound: 'seh' },
  { id: 'ch', symbol: 'CH', name: 'CH', transliteration: 'ch', pronunciation: 'sh', sound: 'sh' },
  { id: 'gn', symbol: 'GN', name: 'GN', transliteration: 'gn', pronunciation: 'ny', sound: 'ny' },
  { id: 'r', symbol: 'R', name: 'R', transliteration: 'r', pronunciation: 'air', sound: 'air' },
  { id: 'l', symbol: 'L', name: 'L', transliteration: 'l', pronunciation: 'ell', sound: 'ell' }
];

const frenchPracticeModes = [
  {
    id: 'letters',
    label: 'Alphabet',
    description: 'Practice French letters and sounds.',
    type: 'consonants',
    noun: 'letter'
  },
  {
    id: 'accents',
    label: 'Accents & Diacritics',
    description: 'Learn é, è, ê, ç, and more.',
    type: 'consonants',
    noun: 'accent'
  },
  {
    id: 'liaison',
    label: 'Silent Letters',
    description: 'Practice French pronunciation rules.',
    type: 'consonants',
    noun: 'pattern'
  }
];

const frenchIntroductions = {
  subtitleTemplate: 'Faites glisser la {{noun}} en mouvement vers la bonne case.',
  nounFallback: 'lettre',
  initiallyKnownIds: ['a', 'e', 'c-cedille']
};

const frenchPack = {
  id: 'french',
  name: 'French',
  metadata: {
    dictionaryId: 'french',
    fontClass: 'language-font-latin',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: 'Lettre {{symbol}} prononcée {{pronunciation}}'
    }
  },
  consonants: frenchLetters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: frenchPracticeModes,
  introductions: frenchIntroductions
};

export default frenchPack;
