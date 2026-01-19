export const hebrewConsonants = [
  { id: 'aleph', symbol: 'א', sound: '(A)', pronunciation: '(A)', name: 'Aleph' },
  { id: 'bet-dagesh', symbol: 'בּ', sound: 'B', pronunciation: 'B', name: 'Bet' },
  { id: 'vet', symbol: 'ב', sound: 'V', pronunciation: 'V', name: 'Vet' },
  { id: 'gimel', symbol: 'ג', sound: 'G', pronunciation: 'G', name: 'Gimel' },
  { id: 'dalet', symbol: 'ד', sound: 'D', pronunciation: 'D', name: 'Dalet' },
  { id: 'heh', symbol: 'ה', sound: 'H', pronunciation: 'H', name: 'Heh' },
  { id: 'vav', symbol: 'ו', sound: 'V/o/u', pronunciation: 'V/o/u', name: 'Vav' },
  { id: 'zayin', symbol: 'ז', sound: 'Z', pronunciation: 'Z', name: 'Zayin' },
  { id: 'chet', symbol: 'ח', sound: 'Ch', pronunciation: 'Ch', name: 'Chet' },
  { id: 'tet', symbol: 'ט', sound: 'T', pronunciation: 'T', name: 'Tet' },
  { id: 'yud', symbol: 'י', sound: 'Y', pronunciation: 'Y', name: 'Yud' },
  { id: 'kaf-dagesh', symbol: 'כּ', sound: 'K', pronunciation: 'K', name: 'Kaf' },
  { id: 'chaf', symbol: 'כ', sound: 'Ch', pronunciation: 'Ch', name: 'Chaf' },
  { id: 'final-chaf', symbol: 'ך', sound: 'Ch', pronunciation: 'Ch', name: 'Final Chaf' },
  { id: 'lamed', symbol: 'ל', sound: 'L', pronunciation: 'L', name: 'Lamed' },
  { id: 'mem', symbol: 'מ', sound: 'M', pronunciation: 'M', name: 'Mem' },
  { id: 'final-mem', symbol: 'ם', sound: 'M', pronunciation: 'M', name: 'Final Mem' },
  { id: 'nun', symbol: 'נ', sound: 'N', pronunciation: 'N', name: 'Nun' },
  { id: 'final-nun', symbol: 'ן', sound: 'N', pronunciation: 'N', name: 'Final Nun' },
  { id: 'samech', symbol: 'ס', sound: 'S', pronunciation: 'S', name: 'Samech' },
  { id: 'ayin', symbol: 'ע', sound: '(Ah)', pronunciation: '(Ah)', name: 'Ayin' },
  { id: 'pei-dagesh', symbol: 'פּ', sound: 'P', pronunciation: 'P', name: 'Pei' },
  { id: 'fei', symbol: 'פ', sound: 'F', pronunciation: 'F', name: 'Fei' },
  { id: 'final-fei', symbol: 'ף', sound: 'F', pronunciation: 'F', name: 'Final Fei' },
  { id: 'tzadi', symbol: 'צ', sound: 'Tz', pronunciation: 'Tz', name: 'Tzadi' },
  { id: 'final-tzadi', symbol: 'ץ', sound: 'Tz', pronunciation: 'Tz', name: 'Final Tzadi' },
  { id: 'kuf', symbol: 'ק', sound: 'K', pronunciation: 'K', name: 'Kuf' },
  { id: 'resh', symbol: 'ר', sound: 'R', pronunciation: 'R', name: 'Resh' },
  { id: 'shin', symbol: 'שׁ', sound: 'Sh', pronunciation: 'Sh', name: 'Shin' },
  { id: 'sin', symbol: 'שׂ', sound: 'S', pronunciation: 'S', name: 'Sin' },
  { id: 'tav', symbol: 'ת', sound: 'T', pronunciation: 'T', name: 'Tav' }
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
  { id: 'bet', symbol: 'ב', name: 'Bet', baseSound: 'B', sound: 'B', pronunciation: 'B' },
  { id: 'gimel-base', symbol: 'ג', name: 'Gimel', baseSound: 'G', sound: 'G', pronunciation: 'G' },
  { id: 'dalet-base', symbol: 'ד', name: 'Dalet', baseSound: 'D', sound: 'D', pronunciation: 'D' },
  { id: 'heh-base', symbol: 'ה', name: 'Heh', baseSound: 'H', sound: 'H', pronunciation: 'H' },
  { id: 'vav-base', symbol: 'ו', name: 'Vav', baseSound: 'V', sound: 'V', pronunciation: 'V' },
  { id: 'zayin-base', symbol: 'ז', name: 'Zayin', baseSound: 'Z', sound: 'Z', pronunciation: 'Z' },
  { id: 'chet-base', symbol: 'ח', name: 'Chet', baseSound: 'Ch', sound: 'Ch', pronunciation: 'Ch' },
  { id: 'tet-base', symbol: 'ט', name: 'Tet', baseSound: 'T', sound: 'T', pronunciation: 'T' },
  { id: 'yud-base', symbol: 'י', name: 'Yud', baseSound: 'Y', sound: 'Y', pronunciation: 'Y' },
  { id: 'kaf-base', symbol: 'כ', name: 'Kaf/Chaf', baseSound: 'K', sound: 'K', pronunciation: 'K' },
  { id: 'lamed-base', symbol: 'ל', name: 'Lamed', baseSound: 'L', sound: 'L', pronunciation: 'L' },
  { id: 'mem-base', symbol: 'מ', name: 'Mem', baseSound: 'M', sound: 'M', pronunciation: 'M' },
  { id: 'nun-base', symbol: 'נ', name: 'Nun', baseSound: 'N', sound: 'N', pronunciation: 'N' },
  { id: 'samech-base', symbol: 'ס', name: 'Samech', baseSound: 'S', sound: 'S', pronunciation: 'S' },
  { id: 'pei-base', symbol: 'פ', name: 'Pei/Fei', baseSound: 'P', sound: 'P', pronunciation: 'P' },
  { id: 'tzadi-base', symbol: 'צ', name: 'Tzadi', baseSound: 'Tz', sound: 'Tz', pronunciation: 'Tz' },
  { id: 'kuf-base', symbol: 'ק', name: 'Kuf', baseSound: 'K', sound: 'K', pronunciation: 'K' },
  { id: 'resh-base', symbol: 'ר', name: 'Resh', baseSound: 'R', sound: 'R', pronunciation: 'R' },
  { id: 'shin-base', symbol: 'ש', name: 'Shin/Sin', baseSound: 'Sh', sound: 'Sh', pronunciation: 'Sh' },
  { id: 'tav-base', symbol: 'ת', name: 'Tav', baseSound: 'T', sound: 'T', pronunciation: 'T' }
];

// Basic consonants (excluding final forms) for the consonants-basic mode
export const hebrewBasicConsonants = hebrewConsonants.filter(
  (item) => !item.id.startsWith('final-')
);

// Final forms only for the final-forms mode
export const hebrewFinalForms = hebrewConsonants.filter(
  (item) => item.id.startsWith('final-')
);

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Niqqud with a random carrier letter (using hebrewSyllableBases as the pool)
export const hebrewNiqqudWithCarrier = hebrewVowelMarkers.map((marker) => {
  const base = randomFrom(hebrewSyllableBases); // pick a random base consonant
  const soundValue = `${base.baseSound}${marker.soundSuffix}`;

  return {
    id: `carrier-${base.id}-${marker.id}`,
    symbol: `${base.symbol}${marker.mark}`,         // e.g. ג + ַ
    sound: soundValue,                              // e.g. G + a → "Ga"
    pronunciation: soundValue,                      // e.g. "Ga"
    name: `${base.name} + ${marker.name}`,          // e.g. "Gimel + Patach"
    type: 'vowel',
    markerId: marker.id,
    baseId: base.id
  };
});

export const hebrewPracticeModes = [
  {
    id: 'consonants-basic',
    label: 'Consonants',
    description: 'Practice א–ת without niqqud or final forms.',
    type: 'consonants-basic',
    noun: 'letter'
  },
  {
    id: 'niqqud',
    label: 'Vowels (Niqqud)',
    description: 'Practice vowel marks on a carrier letter.',
    type: 'niqqud',
    noun: 'vowel'
  },
  {
    id: 'final-forms',
    label: 'Final Forms',
    description: 'Practice final letter forms: ך, ם, ן, ף, ץ',
    type: 'final-forms',
    noun: 'letter'
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
  basicConsonants: hebrewBasicConsonants,
  finalForms: hebrewFinalForms,
  niqqudWithCarrier: hebrewNiqqudWithCarrier,
  vowels: {
    markers: hebrewVowelMarkers,
    groups: hebrewVowelGroups,
    syllableBases: hebrewSyllableBases
  },
  practiceModes: hebrewPracticeModes,
  introductions: hebrewIntroductions
};

export default hebrewPack;
