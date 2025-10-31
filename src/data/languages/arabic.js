const arabicLetters = [
  { id: 'alif', symbol: 'ا', name: 'Alif', transliteration: 'ʾalif', pronunciation: 'a', sound: 'a' },
  { id: 'ba', symbol: 'ب', name: 'Ba', transliteration: 'bāʼ', pronunciation: 'ba', sound: 'ba' },
  { id: 'ta', symbol: 'ت', name: 'Ta', transliteration: 'tāʼ', pronunciation: 'ta', sound: 'ta' },
  { id: 'tha', symbol: 'ث', name: 'Tha', transliteration: 'thāʼ', pronunciation: 'tha', sound: 'tha' },
  { id: 'jeem', symbol: 'ج', name: 'Jeem', transliteration: 'jīm', pronunciation: 'jeem', sound: 'jeem' },
  { id: 'ha', symbol: 'ح', name: 'Ha', transliteration: 'ḥāʼ', pronunciation: 'ha', sound: 'ha' },
  { id: 'kha', symbol: 'خ', name: 'Kha', transliteration: 'khāʼ', pronunciation: 'kha', sound: 'kha' },
  { id: 'dal', symbol: 'د', name: 'Dal', transliteration: 'dāl', pronunciation: 'dal', sound: 'dal' },
  { id: 'dhal', symbol: 'ذ', name: 'Dhal', transliteration: 'dhāl', pronunciation: 'dhal', sound: 'dhal' },
  { id: 'ra', symbol: 'ر', name: 'Ra', transliteration: 'rāʼ', pronunciation: 'ra', sound: 'ra' }
];

const arabicPracticeModes = [
  {
    id: 'letters',
    label: 'الحروف',
    description: 'تعرّف على الحروف العربية الأساسية.',
    type: 'consonants',
    noun: 'حرف'
  }
];

const arabicIntroductions = {
  subtitleTemplate: 'اسحب {{noun}} المتحرك إلى المربع الصحيح!',
  nounFallback: 'حرف',
  initiallyKnownIds: ['alif', 'ba', 'ta']
};

const arabicPack = {
  id: 'arabic',
  name: 'Standard Arabic',
  metadata: {
    dictionaryId: 'arabic',
    fontClass: 'language-font-arabic',
    textDirection: 'rtl',
    accessibility: {
      letterDescriptionTemplate: 'الحرف {{symbol}} يلفظ {{pronunciation}}'
    }
  },
  consonants: arabicLetters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: arabicPracticeModes,
  introductions: arabicIntroductions
};

export default arabicPack;
