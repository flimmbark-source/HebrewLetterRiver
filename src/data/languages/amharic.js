const amharicLetters = [
  { id: 'ha', symbol: 'ሀ', name: 'Ha', transliteration: 'hä', pronunciation: 'ha', sound: 'ha' },
  { id: 'le', symbol: 'ለ', name: 'Le', transliteration: 'lä', pronunciation: 'le', sound: 'le' },
  { id: 'he', symbol: 'ሐ', name: 'He', transliteration: 'ḥä', pronunciation: 'he', sound: 'he' },
  { id: 'me', symbol: 'መ', name: 'Me', transliteration: 'mä', pronunciation: 'me', sound: 'me' },
  { id: 'se', symbol: 'ሰ', name: 'Se', transliteration: 'sä', pronunciation: 'se', sound: 'se' },
  { id: 're', symbol: 'ረ', name: 'Re', transliteration: 'rä', pronunciation: 're', sound: 're' },
  { id: 'sa', symbol: 'ሠ', name: 'Sa', transliteration: 'śä', pronunciation: 'sa', sound: 'sa' },
  { id: 'sha', symbol: 'ሸ', name: 'Sha', transliteration: 'šä', pronunciation: 'sha', sound: 'sha' },
  { id: 'qe', symbol: 'ቀ', name: 'Qe', transliteration: 'qä', pronunciation: 'qe', sound: 'qe' },
  { id: 'be', symbol: 'በ', name: 'Be', transliteration: 'bä', pronunciation: 'be', sound: 'be' },
  { id: 've', symbol: 'ቨ', name: 'Ve', transliteration: 'vä', pronunciation: 've', sound: 've' },
  { id: 'te', symbol: 'ተ', name: 'Te', transliteration: 'tä', pronunciation: 'te', sound: 'te' },
  { id: 'che', symbol: 'ቸ', name: 'Che', transliteration: 'čä', pronunciation: 'che', sound: 'che' },
  { id: 'ne', symbol: 'ነ', name: 'Ne', transliteration: 'nä', pronunciation: 'ne', sound: 'ne' },
  { id: 'nye', symbol: 'ኘ', name: 'Nye', transliteration: 'ñä', pronunciation: 'nye', sound: 'nye' },
  { id: 'a', symbol: 'አ', name: 'A', transliteration: 'ʾä', pronunciation: 'a', sound: 'a' },
  { id: 'ke', symbol: 'ከ', name: 'Ke', transliteration: 'kä', pronunciation: 'ke', sound: 'ke' },
  { id: 'we', symbol: 'ወ', name: 'We', transliteration: 'wä', pronunciation: 'we', sound: 'we' },
  { id: 'ze', symbol: 'ዘ', name: 'Ze', transliteration: 'zä', pronunciation: 'ze', sound: 'ze' },
  { id: 'zhe', symbol: 'ዠ', name: 'Zhe', transliteration: 'žä', pronunciation: 'zhe', sound: 'zhe' },
  { id: 'ye', symbol: 'የ', name: 'Ye', transliteration: 'yä', pronunciation: 'ye', sound: 'ye' },
  { id: 'de', symbol: 'ደ', name: 'De', transliteration: 'dä', pronunciation: 'de', sound: 'de' },
  { id: 'je', symbol: 'ጀ', name: 'Je', transliteration: 'ǧä', pronunciation: 'je', sound: 'je' },
  { id: 'ge', symbol: 'ገ', name: 'Ge', transliteration: 'gä', pronunciation: 'ge', sound: 'ge' },
  { id: 'te2', symbol: 'ጠ', name: 'Te2', transliteration: 'ṭä', pronunciation: 'te', sound: 'te' },
  { id: 'pe', symbol: 'ፐ', name: 'Pe', transliteration: 'pä', pronunciation: 'pe', sound: 'pe' },
  { id: 'tse', symbol: 'ጸ', name: 'Tse', transliteration: 'ṣä', pronunciation: 'tse', sound: 'tse' },
  { id: 'fe', symbol: 'ፈ', name: 'Fe', transliteration: 'fä', pronunciation: 'fe', sound: 'fe' }
];

const amharicPracticeModes = [
  {
    id: 'letters',
    label: 'Amharic Letters',
    description: 'Practice basic Ge\'ez alphabet (Fidel).',
    type: 'consonants',
    noun: 'letter'
  },
  {
    id: 'characters',
    label: 'Characters',
    description: 'Practice essential Amharic characters.',
    type: 'consonants',
    noun: 'character'
  }
];

const amharicIntroductions = {
  subtitleTemplate: 'የሚንቀሳቀሰውን {{noun}} ወደ ትክክለኛው ሳጥን ይጎትቱ!',
  nounFallback: 'ፊደል',
  initiallyKnownIds: ['a', 'be', 'me']
};

const amharicPack = {
  id: 'amharic',
  name: 'አማርኛ',
  metadata: {
    dictionaryId: 'amharic',
    fontClass: 'language-font-ethiopic',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: 'ፊደል {{symbol}} {{pronunciation}} ይነበባል'
    }
  },
  consonants: amharicLetters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: amharicPracticeModes,
  introductions: amharicIntroductions
};

export default amharicPack;
