const englishConsonants = [
  { id: 'a', symbol: 'A', name: 'A', transliteration: 'A', pronunciation: 'ay', sound: 'ay' },
  { id: 'b', symbol: 'B', name: 'B', transliteration: 'B', pronunciation: 'bee', sound: 'bee' },
  { id: 'c', symbol: 'C', name: 'C', transliteration: 'C', pronunciation: 'see', sound: 'see' },
  { id: 'd', symbol: 'D', name: 'D', transliteration: 'D', pronunciation: 'dee', sound: 'dee' },
  { id: 'e', symbol: 'E', name: 'E', transliteration: 'E', pronunciation: 'ee', sound: 'ee' },
  { id: 'f', symbol: 'F', name: 'F', transliteration: 'F', pronunciation: 'eff', sound: 'eff' },
  { id: 'g', symbol: 'G', name: 'G', transliteration: 'G', pronunciation: 'jee', sound: 'jee' },
  { id: 'h', symbol: 'H', name: 'H', transliteration: 'H', pronunciation: 'aitch', sound: 'aitch' },
  { id: 'i', symbol: 'I', name: 'I', transliteration: 'I', pronunciation: 'eye', sound: 'eye' },
  { id: 'j', symbol: 'J', name: 'J', transliteration: 'J', pronunciation: 'jay', sound: 'jay' }
];

const englishPracticeModes = [
  {
    id: 'letters',
    label: 'Alphabet',
    description: 'Practice uppercase letters.',
    type: 'consonants',
    noun: 'letter'
  }
];

const englishIntroductions = {
  subtitleTemplate: 'Drag the moving {{noun}} to the correct box!',
  nounFallback: 'letter',
  initiallyKnownIds: ['a', 'b', 'c']
};

const englishPack = {
  id: 'english',
  name: 'English',
  metadata: {
    fontClass: 'language-font-latin',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: 'Letter {{symbol}} pronounced {{pronunciation}}'
    }
  },
  consonants: englishConsonants,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: englishPracticeModes,
  introductions: englishIntroductions
};

export default englishPack;
