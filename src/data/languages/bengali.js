const bengaliLetters = [
  { id: 'a', symbol: 'অ', name: 'অ', transliteration: 'ô', pronunciation: 'aw', sound: 'ô' },
  { id: 'aa', symbol: 'আ', name: 'আ', transliteration: 'a', pronunciation: 'ah', sound: 'a' },
  { id: 'i', symbol: 'ই', name: 'ই', transliteration: 'i', pronunciation: 'ee', sound: 'i' },
  { id: 'ii', symbol: 'ঈ', name: 'ঈ', transliteration: 'ī', pronunciation: 'ee', sound: 'ī' },
  { id: 'u', symbol: 'উ', name: 'উ', transliteration: 'u', pronunciation: 'oo', sound: 'u' },
  { id: 'ka', symbol: 'ক', name: 'ক', transliteration: 'ko', pronunciation: 'ko', sound: 'ko' },
  { id: 'kha', symbol: 'খ', name: 'খ', transliteration: 'kho', pronunciation: 'kho', sound: 'kho' },
  { id: 'ga', symbol: 'গ', name: 'গ', transliteration: 'go', pronunciation: 'go', sound: 'go' },
  { id: 'gha', symbol: 'ঘ', name: 'ঘ', transliteration: 'gho', pronunciation: 'gho', sound: 'gho' },
  { id: 'cha', symbol: 'চ', name: 'চ', transliteration: 'co', pronunciation: 'cho', sound: 'co' }
];

const bengaliPracticeModes = [
  {
    id: 'letters',
    label: 'বর্ণমালা',
    description: 'বাংলা বর্ণের উচ্চারণ চর্চা করুন।',
    type: 'consonants',
    noun: 'অক্ষর'
  }
];

const bengaliIntroductions = {
  subtitleTemplate: 'চলমান {{noun}} সঠিক ঘরে রাখুন!',
  nounFallback: 'অক্ষর',
  initiallyKnownIds: ['a', 'aa', 'ka']
};

const bengaliPack = {
  id: 'bengali',
  name: 'Bengali',
  metadata: {
    fontClass: 'language-font-bengali',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: '{{symbol}} অক্ষর উচ্চারণ {{pronunciation}}'
    }
  },
  consonants: bengaliLetters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: bengaliPracticeModes,
  introductions: bengaliIntroductions
};

export default bengaliPack;
