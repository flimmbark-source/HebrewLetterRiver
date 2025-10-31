const japaneseCharacters = [
  { id: 'a', symbol: 'あ', name: 'あ', transliteration: 'a', pronunciation: 'ah', sound: 'ah' },
  { id: 'i', symbol: 'い', name: 'い', transliteration: 'i', pronunciation: 'ee', sound: 'ee' },
  { id: 'u', symbol: 'う', name: 'う', transliteration: 'u', pronunciation: 'oo', sound: 'oo' },
  { id: 'e', symbol: 'え', name: 'え', transliteration: 'e', pronunciation: 'eh', sound: 'eh' },
  { id: 'o', symbol: 'お', name: 'お', transliteration: 'o', pronunciation: 'oh', sound: 'oh' },
  { id: 'ka', symbol: 'か', name: 'か', transliteration: 'ka', pronunciation: 'kah', sound: 'ka' },
  { id: 'ki', symbol: 'き', name: 'き', transliteration: 'ki', pronunciation: 'kee', sound: 'ki' },
  { id: 'ku', symbol: 'く', name: 'く', transliteration: 'ku', pronunciation: 'koo', sound: 'ku' },
  { id: 'ke', symbol: 'け', name: 'け', transliteration: 'ke', pronunciation: 'keh', sound: 'ke' },
  { id: 'ko', symbol: 'こ', name: 'こ', transliteration: 'ko', pronunciation: 'koh', sound: 'ko' }
];

const japanesePracticeModes = [
  {
    id: 'hiragana',
    label: 'ひらがな',
    description: 'ひらがなの基本的な文字を練習しましょう。',
    type: 'consonants',
    noun: '文字'
  }
];

const japaneseIntroductions = {
  subtitleTemplate: '動く{{noun}}を正しい枠にドラッグしましょう。',
  nounFallback: '文字',
  initiallyKnownIds: ['a', 'i', 'ka']
};

const japanesePack = {
  id: 'japanese',
  name: 'Japanese',
  metadata: {
    fontClass: 'language-font-japanese',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: '{{symbol}} は {{pronunciation}} と発音します'
    }
  },
  consonants: japaneseCharacters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: japanesePracticeModes,
  introductions: japaneseIntroductions
};

export default japanesePack;
