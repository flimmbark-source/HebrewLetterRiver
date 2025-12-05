const hindiLetters = [
  { id: 'a', symbol: 'अ', name: 'अ', transliteration: 'a', pronunciation: 'uh', sound: 'a' },
  { id: 'aa', symbol: 'आ', name: 'आ', transliteration: 'ā', pronunciation: 'aa', sound: 'ā' },
  { id: 'i', symbol: 'इ', name: 'इ', transliteration: 'i', pronunciation: 'ih', sound: 'i' },
  { id: 'ii', symbol: 'ई', name: 'ई', transliteration: 'ī', pronunciation: 'ee', sound: 'ī' },
  { id: 'u', symbol: 'उ', name: 'उ', transliteration: 'u', pronunciation: 'oo', sound: 'u' },
  { id: 'ka', symbol: 'क', name: 'क', transliteration: 'ka', pronunciation: 'kuh', sound: 'ka' },
  { id: 'kha', symbol: 'ख', name: 'ख', transliteration: 'kha', pronunciation: 'khuh', sound: 'kha' },
  { id: 'ga', symbol: 'ग', name: 'ग', transliteration: 'ga', pronunciation: 'guh', sound: 'ga' },
  { id: 'gha', symbol: 'घ', name: 'घ', transliteration: 'gha', pronunciation: 'ghuh', sound: 'gha' },
  { id: 'cha', symbol: 'च', name: 'च', transliteration: 'ca', pronunciation: 'chuh', sound: 'ca' }
];

const hindiPracticeModes = [
  {
    id: 'letters',
    label: 'Devanagari Letters',
    description: 'Practice basic Hindi consonants.',
    type: 'consonants',
    noun: 'letter'
  },
  {
    id: 'matras',
    label: 'Vowels & Matras',
    description: 'Learn vowel signs and marks.',
    type: 'consonants',
    noun: 'mark'
  },
  {
    id: 'conjuncts',
    label: 'Conjunct Letters',
    description: 'Practice combined consonants.',
    type: 'consonants',
    noun: 'conjunct'
  }
];

const hindiIntroductions = {
  subtitleTemplate: 'चलते {{noun}} को सही खाने में ले जाएँ!',
  nounFallback: 'अक्षर',
  initiallyKnownIds: ['a', 'aa', 'ka']
};

const hindiPack = {
  id: 'hindi',
  name: 'हिंदी',
  metadata: {
    dictionaryId: 'hindi',
    fontClass: 'language-font-devanagari',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: '{{symbol}} अक्षर का उच्चारण {{pronunciation}}'
    }
  },
  consonants: hindiLetters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: hindiPracticeModes,
  introductions: hindiIntroductions
};

export default hindiPack;
