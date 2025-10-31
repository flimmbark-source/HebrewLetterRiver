const spanishLetters = [
  { id: 'a', symbol: 'A', name: 'A', transliteration: 'a', pronunciation: 'ah', sound: 'ah' },
  { id: 'e', symbol: 'E', name: 'E', transliteration: 'e', pronunciation: 'eh', sound: 'eh' },
  { id: 'i', symbol: 'I', name: 'I', transliteration: 'i', pronunciation: 'ee', sound: 'ee' },
  { id: 'o', symbol: 'O', name: 'O', transliteration: 'o', pronunciation: 'oh', sound: 'oh' },
  { id: 'u', symbol: 'U', name: 'U', transliteration: 'u', pronunciation: 'oo', sound: 'oo' },
  { id: 'ene', symbol: 'Ñ', name: 'Ñ', transliteration: 'ñ', pronunciation: 'enyeh', sound: 'enyeh' },
  { id: 'be', symbol: 'B', name: 'B', transliteration: 'b', pronunciation: 'beh', sound: 'beh' },
  { id: 'ce', symbol: 'C', name: 'C', transliteration: 'c', pronunciation: 'seh', sound: 'seh' },
  { id: 'elle', symbol: 'LL', name: 'LL', transliteration: 'll', pronunciation: 'eh-yeh', sound: 'eh-yeh' },
  { id: 'erre', symbol: 'R', name: 'R', transliteration: 'r', pronunciation: 'ehr-eh', sound: 'ehr-eh' }
];

const spanishPracticeModes = [
  {
    id: 'letters',
    label: 'Alfabeto',
    description: 'Repasa letras y sonidos esenciales.',
    type: 'consonants',
    noun: 'letra'
  }
];

const spanishIntroductions = {
  subtitleTemplate: 'Arrastra la {{noun}} en movimiento a la casilla correcta.',
  nounFallback: 'letra',
  initiallyKnownIds: ['a', 'e', 'ene']
};

const spanishPack = {
  id: 'spanish',
  name: 'Spanish',
  metadata: {
    fontClass: 'language-font-latin',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: 'Letra {{symbol}} se pronuncia {{pronunciation}}'
    }
  },
  consonants: spanishLetters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: spanishPracticeModes,
  introductions: spanishIntroductions
};

export default spanishPack;
