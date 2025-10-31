const russianLetters = [
  { id: 'a', symbol: 'А', name: 'А', transliteration: 'a', pronunciation: 'ah', sound: 'ah' },
  { id: 'be', symbol: 'Б', name: 'Б', transliteration: 'b', pronunciation: 'beh', sound: 'beh' },
  { id: 've', symbol: 'В', name: 'В', transliteration: 'v', pronunciation: 'veh', sound: 'veh' },
  { id: 'ge', symbol: 'Г', name: 'Г', transliteration: 'g', pronunciation: 'geh', sound: 'geh' },
  { id: 'de', symbol: 'Д', name: 'Д', transliteration: 'd', pronunciation: 'deh', sound: 'deh' },
  { id: 'ye', symbol: 'Е', name: 'Е', transliteration: 'ye', pronunciation: 'yeh', sound: 'yeh' },
  { id: 'zhe', symbol: 'Ж', name: 'Ж', transliteration: 'zh', pronunciation: 'zh', sound: 'zh' },
  { id: 'ze', symbol: 'З', name: 'З', transliteration: 'z', pronunciation: 'zeh', sound: 'zeh' },
  { id: 'i', symbol: 'И', name: 'И', transliteration: 'i', pronunciation: 'ee', sound: 'ee' },
  { id: 'short-i', symbol: 'Й', name: 'Й', transliteration: 'y', pronunciation: 'yot', sound: 'yot' }
];

const russianPracticeModes = [
  {
    id: 'letters',
    label: 'Азбука',
    description: 'Изучайте базовые буквы кириллицы.',
    type: 'consonants',
    noun: 'буква'
  }
];

const russianIntroductions = {
  subtitleTemplate: 'Перетащите движущуюся {{noun}} в нужную ячейку!',
  nounFallback: 'буква',
  initiallyKnownIds: ['a', 'be', 've']
};

const russianPack = {
  id: 'russian',
  name: 'Russian',
  metadata: {
    dictionaryId: 'russian',
    fontClass: 'language-font-cyrillic',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: 'Буква {{symbol}} читается как {{pronunciation}}'
    }
  },
  consonants: russianLetters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: russianPracticeModes,
  introductions: russianIntroductions
};

export default russianPack;
