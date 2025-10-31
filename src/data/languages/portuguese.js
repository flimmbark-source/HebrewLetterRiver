const portugueseLetters = [
  { id: 'a', symbol: 'A', name: 'A', transliteration: 'a', pronunciation: 'ah', sound: 'ah' },
  { id: 'e', symbol: 'E', name: 'E', transliteration: 'e', pronunciation: 'eh', sound: 'eh' },
  { id: 'i', symbol: 'I', name: 'I', transliteration: 'i', pronunciation: 'ee', sound: 'ee' },
  { id: 'o', symbol: 'O', name: 'O', transliteration: 'o', pronunciation: 'oh', sound: 'oh' },
  { id: 'u', symbol: 'U', name: 'U', transliteration: 'u', pronunciation: 'oo', sound: 'oo' },
  { id: 'lh', symbol: 'LH', name: 'LH', transliteration: 'lh', pronunciation: 'lye', sound: 'lye' },
  { id: 'nh', symbol: 'NH', name: 'NH', transliteration: 'nh', pronunciation: 'nye', sound: 'nye' },
  { id: 'r', symbol: 'R', name: 'R', transliteration: 'r', pronunciation: 'heh', sound: 'heh' },
  { id: 's', symbol: 'S', name: 'S', transliteration: 's', pronunciation: 'ess', sound: 'ess' },
  { id: 'z', symbol: 'Z', name: 'Z', transliteration: 'z', pronunciation: 'zeh', sound: 'zeh' }
];

const portuguesePracticeModes = [
  {
    id: 'letters',
    label: 'Alfabeto',
    description: 'Pratique letras e sons fundamentais.',
    type: 'consonants',
    noun: 'letra'
  }
];

const portugueseIntroductions = {
  subtitleTemplate: 'Arraste a {{noun}} em movimento para o espaço correto.',
  nounFallback: 'letra',
  initiallyKnownIds: ['a', 'e', 'lh']
};

const portuguesePack = {
  id: 'portuguese',
  name: 'Portuguese',
  metadata: {
    fontClass: 'language-font-latin',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: 'Letra {{symbol}} pronunciada {{pronunciation}}'
    }
  },
  consonants: portugueseLetters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: portuguesePracticeModes,
  introductions: portugueseIntroductions
};

export default portuguesePack;
