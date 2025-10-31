const mandarinCharacters = [
  { id: 'ni3', symbol: '你', name: '你', transliteration: 'nǐ', pronunciation: 'nee', sound: 'nǐ' },
  { id: 'hao3', symbol: '好', name: '好', transliteration: 'hǎo', pronunciation: 'how', sound: 'hǎo' },
  { id: 'xue2', symbol: '学', name: '学', transliteration: 'xué', pronunciation: 'shweh', sound: 'xué' },
  { id: 'sheng1', symbol: '生', name: '生', transliteration: 'shēng', pronunciation: 'shung', sound: 'shēng' },
  { id: 'shui3', symbol: '水', name: '水', transliteration: 'shuǐ', pronunciation: 'shway', sound: 'shuǐ' },
  { id: 'huo3', symbol: '火', name: '火', transliteration: 'huǒ', pronunciation: 'hwo', sound: 'huǒ' },
  { id: 'shan1', symbol: '山', name: '山', transliteration: 'shān', pronunciation: 'shahn', sound: 'shān' },
  { id: 'tian2', symbol: '田', name: '田', transliteration: 'tián', pronunciation: 'tyen', sound: 'tián' },
  { id: 'ri4', symbol: '日', name: '日', transliteration: 'rì', pronunciation: 'rr', sound: 'rì' },
  { id: 'yue4', symbol: '月', name: '月', transliteration: 'yuè', pronunciation: 'yweh', sound: 'yuè' }
];

const mandarinPracticeModes = [
  {
    id: 'characters',
    label: '常用字',
    description: '练习基础汉字。',
    type: 'consonants',
    noun: '字'
  }
];

const mandarinIntroductions = {
  subtitleTemplate: '把移动的{{noun}}拖到正确的方框！',
  nounFallback: '字',
  initiallyKnownIds: ['ni3', 'hao3', 'xue2']
};

const mandarinPack = {
  id: 'mandarin',
  name: 'Mandarin Chinese',
  metadata: {
    dictionaryId: 'mandarin',
    fontClass: 'language-font-han',
    textDirection: 'ltr',
    accessibility: {
      letterDescriptionTemplate: '汉字 {{symbol}} 读作 {{pronunciation}}'
    }
  },
  consonants: mandarinCharacters,
  vowels: {
    markers: [],
    groups: [],
    syllableBases: []
  },
  practiceModes: mandarinPracticeModes,
  introductions: mandarinIntroductions
};

export default mandarinPack;
