export const hebrewConsonants = [
  { id: 'aleph', symbol: 'א', sound: '(A)', name: 'Aleph' },
  { id: 'bet-dagesh', symbol: 'בּ', sound: 'B', name: 'Bet' },
  { id: 'vet', symbol: 'ב', sound: 'V', name: 'Vet' },
  { id: 'gimel', symbol: 'ג', sound: 'G', name: 'Gimel' },
  { id: 'dalet', symbol: 'ד', sound: 'D', name: 'Dalet' },
  { id: 'heh', symbol: 'ה', sound: 'H', name: 'Heh' },
  { id: 'vav', symbol: 'ו', sound: 'V/o/u', name: 'Vav' },
  { id: 'zayin', symbol: 'ז', sound: 'Z', name: 'Zayin' },
  { id: 'chet', symbol: 'ח', sound: 'Ch', name: 'Chet' },
  { id: 'tet', symbol: 'ט', sound: 'T', name: 'Tet' },
  { id: 'yud', symbol: 'י', sound: 'Y', name: 'Yud' },
  { id: 'kaf-dagesh', symbol: 'כּ', sound: 'K', name: 'Kaf' },
  { id: 'chaf', symbol: 'כ', sound: 'Ch', name: 'Chaf' },
  { id: 'final-chaf', symbol: 'ך', sound: '[Ch]', name: 'Final Chaf' },
  { id: 'lamed', symbol: 'ל', sound: 'L', name: 'Lamed' },
  { id: 'mem', symbol: 'מ', sound: 'M', name: 'Mem' },
  { id: 'final-mem', symbol: 'ם', sound: '[M]', name: 'Final Mem' },
  { id: 'nun', symbol: 'נ', sound: 'N', name: 'Nun' },
  { id: 'final-nun', symbol: 'ן', sound: '[N]', name: 'Final Nun' },
  { id: 'samech', symbol: 'ס', sound: 'S', name: 'Samech' },
  { id: 'ayin', symbol: 'ע', sound: '(Ah)', name: 'Ayin' },
  { id: 'pei-dagesh', symbol: 'פּ', sound: 'P', name: 'Pei' },
  { id: 'fei', symbol: 'פ', sound: 'F', name: 'Fei' },
  { id: 'final-fei', symbol: 'ף', sound: '[F]', name: 'Final Fei' },
  { id: 'tzadi', symbol: 'צ', sound: 'Tz', name: 'Tzadi' },
  { id: 'final-tzadi', symbol: 'ץ', sound: '[Tz]', name: 'Final Tzadi' },
  { id: 'kuf', symbol: 'ק', sound: 'K', name: 'Kuf' },
  { id: 'resh', symbol: 'ר', sound: 'R', name: 'Resh' },
  { id: 'shin', symbol: 'שׁ', sound: 'Sh', name: 'Shin' },
  { id: 'sin', symbol: 'שׂ', sound: 'S', name: 'Sin' },
  { id: 'tav', symbol: 'ת', sound: 'T', name: 'Tav' }
];

export const hebrewVowelMarkers = [
  { id: 'patach', name: 'Patach', mark: '\u05B7', soundSuffix: 'a' },
  { id: 'holam', name: 'Holam', mark: '\u05B9', soundSuffix: 'o' },
  { id: 'segol', name: 'Segol', mark: '\u05B6', soundSuffix: 'e' },
  { id: 'hirik', name: 'Hirik', mark: '\u05B4', soundSuffix: 'i' }
];

export const hebrewVowelGroups = [
  { id: 'vowels1', markerIds: ['patach', 'holam'] },
  { id: 'vowels2', markerIds: ['segol', 'hirik'] }
];

export const hebrewSyllableBases = [
  { id: 'bet', symbol: 'ב', name: 'Bet', baseSound: 'B' },
  { id: 'gimel-base', symbol: 'ג', name: 'Gimel', baseSound: 'G' },
  { id: 'dalet-base', symbol: 'ד', name: 'Dalet', baseSound: 'D' },
  { id: 'heh-base', symbol: 'ה', name: 'Heh', baseSound: 'H' },
  { id: 'vav-base', symbol: 'ו', name: 'Vav', baseSound: 'V' },
  { id: 'zayin-base', symbol: 'ז', name: 'Zayin', baseSound: 'Z' },
  { id: 'chet-base', symbol: 'ח', name: 'Chet', baseSound: 'Ch' },
  { id: 'tet-base', symbol: 'ט', name: 'Tet', baseSound: 'T' },
  { id: 'yud-base', symbol: 'י', name: 'Yud', baseSound: 'Y' },
  { id: 'kaf-base', symbol: 'כ', name: 'Kaf/Chaf', baseSound: 'K' },
  { id: 'lamed-base', symbol: 'ל', name: 'Lamed', baseSound: 'L' },
  { id: 'mem-base', symbol: 'מ', name: 'Mem', baseSound: 'M' },
  { id: 'nun-base', symbol: 'נ', name: 'Nun', baseSound: 'N' },
  { id: 'samech-base', symbol: 'ס', name: 'Samech', baseSound: 'S' },
  { id: 'pei-base', symbol: 'פ', name: 'Pei/Fei', baseSound: 'P' },
  { id: 'tzadi-base', symbol: 'צ', name: 'Tzadi', baseSound: 'Tz' },
  { id: 'kuf-base', symbol: 'ק', name: 'Kuf', baseSound: 'K' },
  { id: 'resh-base', symbol: 'ר', name: 'Resh', baseSound: 'R' },
  { id: 'shin-base', symbol: 'ש', name: 'Shin/Sin', baseSound: 'Sh' },
  { id: 'tav-base', symbol: 'ת', name: 'Tav', baseSound: 'T' }
];

export const hebrewPracticeModes = [
  { id: 'letters', label: 'Letters Only', description: 'Master the 22 core letters.', type: 'consonants', noun: 'letter' },
  {
    id: 'vowels1',
    label: "'A' & 'O' Vowels",
    description: 'Practice Patach and Holam.',
    type: 'vowel-group',
    groupId: 'vowels1',
    noun: 'item'
  },
  {
    id: 'vowels2',
    label: "'E' & 'I' Vowels",
    description: 'Practice Segol and Hirik.',
    type: 'vowel-group',
    groupId: 'vowels2',
    noun: 'item'
  },
  {
    id: 'expert',
    label: 'Expert Mode',
    description: 'Mix of letters & vowels.',
    type: 'combined',
    include: ['letters', 'vowels1', 'vowels2'],
    noun: 'item'
  }
];

export const hebrewIntroductions = {
  subtitleTemplate: 'Drag the moving {{noun}} to the correct box!',
  nounFallback: 'item',
  initiallyKnownIds: ['aleph', 'bet-dagesh', 'lamed']
};

const hebrewPack = {
  id: 'hebrew',
  name: 'עברית',
  metadata: {
    dictionaryId: 'hebrew',
    fontClass: 'language-font-hebrew',
    textDirection: 'rtl',
    accessibility: {
      letterDescriptionTemplate: 'האות {{symbol}} נהגית {{pronunciation}}'
    }
  },
  consonants: hebrewConsonants,
  vowels: {
    markers: hebrewVowelMarkers,
    groups: hebrewVowelGroups,
    syllableBases: hebrewSyllableBases
  },
  practiceModes: hebrewPracticeModes,
  introductions: hebrewIntroductions
};

export default hebrewPack;
