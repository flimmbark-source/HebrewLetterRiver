const HEBREW_PHONETIC_MAP = {
  א: 'ah',
  'בּ': 'b',
  ב: 'v',
  ג: 'g',
  ד: 'd',
  ה: 'h',
  ו: 'v',
  ז: 'z',
  ח: 'kh',
  ט: 't',
  י: 'y',
  'כּ': 'k',
  כ: 'kh',
  ך: 'kh',
  ל: 'l',
  מ: 'm',
  ם: 'm',
  נ: 'n',
  ן: 'n',
  ס: 's',
  ע: 'ah',
  'פּ': 'p',
  פ: 'f',
  ף: 'f',
  צ: 'tz',
  ץ: 'tz',
  ק: 'k',
  ר: 'r',
  'שׁ': 'sh',
  'שׂ': 's',
  ת: 't'
};

export function getHebrewPhoneticLabel(char) {
  return HEBREW_PHONETIC_MAP[char] ?? char;
}

export function getWordPhonetics(word, overrideSegments = []) {
  const chars = Array.from(word ?? '');
  return chars.map((char, index) => {
    if (Array.isArray(overrideSegments) && overrideSegments[index]) {
      return overrideSegments[index];
    }
    return getHebrewPhoneticLabel(char);
  });
}
