/**
 * Deep Script word content — Japanese (Hiragana only)
 *
 * Words used as combat enemies, decomposed into individual kana.
 * All words use hiragana so they can be broken into individual characters.
 *
 * Enemy types: 'corruptor' | 'spawner' | 'amplifier'
 * - Difficulty 1: single kana (1-2 chars), very common
 * - Difficulty 2: 2-3 kana, common nouns
 * - Difficulty 3: 3-4 kana, everyday vocabulary
 * - Difficulty 4-5: 4+ kana, longer words and minibosses
 */

export const deepScriptWordsJapanese = [

  /* ═══════════════════════════════════════════════════════════
     Difficulty 1 — Single or two kana, very common (10 words)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ja-ki',   nativeScript: 'き',     hebrew: 'き',     letters: ['き'],           transliteration: 'ki',    english: 'tree',      meaning: 'tree',      languageId: 'japanese', difficulty: 1, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-me',   nativeScript: 'め',     hebrew: 'め',     letters: ['め'],           transliteration: 'me',    english: 'eye',       meaning: 'eye',       languageId: 'japanese', difficulty: 1, tags: ['body', 'concrete'] },
  { id: 'ds-ja-te',   nativeScript: 'て',     hebrew: 'て',     letters: ['て'],           transliteration: 'te',    english: 'hand',      meaning: 'hand',      languageId: 'japanese', difficulty: 1, tags: ['body', 'concrete'] },
  { id: 'ds-ja-hi',   nativeScript: 'ひ',     hebrew: 'ひ',     letters: ['ひ'],           transliteration: 'hi',    english: 'fire / day', meaning: 'fire / day', languageId: 'japanese', difficulty: 1, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-ha',   nativeScript: 'は',     hebrew: 'は',     letters: ['は'],           transliteration: 'ha',    english: 'leaf / tooth', meaning: 'leaf / tooth', languageId: 'japanese', difficulty: 1, tags: ['nature', 'body'] },
  { id: 'ds-ja-e',    nativeScript: 'え',     hebrew: 'え',     letters: ['え'],           transliteration: 'e',     english: 'picture',   meaning: 'picture',   languageId: 'japanese', difficulty: 1, tags: ['object', 'concrete'] },
  { id: 'ds-ja-ka',   nativeScript: 'か',     hebrew: 'か',     letters: ['か'],           transliteration: 'ka',    english: 'mosquito',  meaning: 'mosquito',  languageId: 'japanese', difficulty: 1, tags: ['animal', 'concrete'] },
  { id: 'ds-ja-su',   nativeScript: 'す',     hebrew: 'す',     letters: ['す'],           transliteration: 'su',    english: 'vinegar',   meaning: 'vinegar',   languageId: 'japanese', difficulty: 1, tags: ['food', 'concrete'] },
  { id: 'ds-ja-ki2',  nativeScript: 'け',     hebrew: 'け',     letters: ['け'],           transliteration: 'ke',    english: 'hair',      meaning: 'hair',      languageId: 'japanese', difficulty: 1, tags: ['body', 'concrete'] },
  { id: 'ds-ja-ho',   nativeScript: 'ほ',     hebrew: 'ほ',     letters: ['ほ'],           transliteration: 'ho',    english: 'sail',      meaning: 'sail',      languageId: 'japanese', difficulty: 1, tags: ['object', 'concrete'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 2 — Two to three kana, common nouns (10 words)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ja-inu',    nativeScript: 'いぬ',   hebrew: 'いぬ',   letters: ['い', 'ぬ'],         transliteration: 'inu',    english: 'dog',       meaning: 'dog',       languageId: 'japanese', difficulty: 2, tags: ['animal', 'concrete'] },
  { id: 'ds-ja-neko',   nativeScript: 'ねこ',   hebrew: 'ねこ',   letters: ['ね', 'こ'],         transliteration: 'neko',   english: 'cat',       meaning: 'cat',       languageId: 'japanese', difficulty: 2, tags: ['animal', 'concrete'] },
  { id: 'ds-ja-yama',   nativeScript: 'やま',   hebrew: 'やま',   letters: ['や', 'ま'],         transliteration: 'yama',   english: 'mountain',  meaning: 'mountain',  languageId: 'japanese', difficulty: 2, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-kawa',   nativeScript: 'かわ',   hebrew: 'かわ',   letters: ['か', 'わ'],         transliteration: 'kawa',   english: 'river',     meaning: 'river',     languageId: 'japanese', difficulty: 2, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-hana',   nativeScript: 'はな',   hebrew: 'はな',   letters: ['は', 'な'],         transliteration: 'hana',   english: 'flower',    meaning: 'flower',    languageId: 'japanese', difficulty: 2, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-sora',   nativeScript: 'そら',   hebrew: 'そら',   letters: ['そ', 'ら'],         transliteration: 'sora',   english: 'sky',       meaning: 'sky',       languageId: 'japanese', difficulty: 2, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-umi',    nativeScript: 'うみ',   hebrew: 'うみ',   letters: ['う', 'み'],         transliteration: 'umi',    english: 'sea',       meaning: 'sea',       languageId: 'japanese', difficulty: 2, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-ame',    nativeScript: 'あめ',   hebrew: 'あめ',   letters: ['あ', 'め'],         transliteration: 'ame',    english: 'rain',      meaning: 'rain',      languageId: 'japanese', difficulty: 2, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-mizu',   nativeScript: 'みず',   hebrew: 'みず',   letters: ['み', 'ず'],         transliteration: 'mizu',   english: 'water',     meaning: 'water',     languageId: 'japanese', difficulty: 2, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-tori',   nativeScript: 'とり',   hebrew: 'とり',   letters: ['と', 'り'],         transliteration: 'tori',   english: 'bird',      meaning: 'bird',      languageId: 'japanese', difficulty: 2, tags: ['animal', 'concrete'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 3 — Three to four kana, everyday vocabulary (10 words)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ja-sakura',  nativeScript: 'さくら',  hebrew: 'さくら',  letters: ['さ', 'く', 'ら'],       transliteration: 'sakura',  english: 'cherry blossom', meaning: 'cherry blossom', languageId: 'japanese', difficulty: 3, tags: ['nature', 'concrete'] },
  { id: 'ds-ja-hikari',  nativeScript: 'ひかり',  hebrew: 'ひかり',  letters: ['ひ', 'か', 'り'],       transliteration: 'hikari',  english: 'light',          meaning: 'light',          languageId: 'japanese', difficulty: 3, tags: ['nature', 'abstract'] },
  { id: 'ds-ja-kokoro',  nativeScript: 'こころ',  hebrew: 'こころ',  letters: ['こ', 'こ', 'ろ'],       transliteration: 'kokoro',  english: 'heart / mind',   meaning: 'heart / mind',   languageId: 'japanese', difficulty: 3, tags: ['abstract', 'body'] },
  { id: 'ds-ja-namida',  nativeScript: 'なみだ',  hebrew: 'なみだ',  letters: ['な', 'み', 'だ'],       transliteration: 'namida',  english: 'tears',          meaning: 'tears',          languageId: 'japanese', difficulty: 3, tags: ['body', 'concrete'] },
  { id: 'ds-ja-usagi',   nativeScript: 'うさぎ',  hebrew: 'うさぎ',  letters: ['う', 'さ', 'ぎ'],       transliteration: 'usagi',   english: 'rabbit',         meaning: 'rabbit',         languageId: 'japanese', difficulty: 3, tags: ['animal', 'concrete'] },
  { id: 'ds-ja-sakana',  nativeScript: 'さかな',  hebrew: 'さかな',  letters: ['さ', 'か', 'な'],       transliteration: 'sakana',  english: 'fish',           meaning: 'fish',           languageId: 'japanese', difficulty: 3, tags: ['animal', 'food'] },
  { id: 'ds-ja-kodomo',  nativeScript: 'こども',  hebrew: 'こども',  letters: ['こ', 'ど', 'も'],       transliteration: 'kodomo',  english: 'child',          meaning: 'child',          languageId: 'japanese', difficulty: 3, tags: ['person', 'common'] },
  { id: 'ds-ja-kimono',  nativeScript: 'きもの',  hebrew: 'きもの',  letters: ['き', 'も', 'の'],       transliteration: 'kimono',  english: 'kimono',         meaning: 'kimono',         languageId: 'japanese', difficulty: 3, tags: ['object', 'culture'], enemyType: 'spawner' },
  { id: 'ds-ja-kazoku',  nativeScript: 'かぞく',  hebrew: 'かぞく',  letters: ['か', 'ぞ', 'く'],       transliteration: 'kazoku',  english: 'family',         meaning: 'family',         languageId: 'japanese', difficulty: 3, tags: ['person', 'common'] },
  { id: 'ds-ja-tsukue',  nativeScript: 'つくえ',  hebrew: 'つくえ',  letters: ['つ', 'く', 'え'],       transliteration: 'tsukue',  english: 'desk',           meaning: 'desk',           languageId: 'japanese', difficulty: 3, tags: ['object', 'concrete'], enemyType: 'amplifier' },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 4 — Four or more kana, longer words (5 words)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ja-tomodachi', nativeScript: 'ともだち', hebrew: 'ともだち', letters: ['と', 'も', 'だ', 'ち'],       transliteration: 'tomodachi', english: 'friend',     meaning: 'friend',     languageId: 'japanese', difficulty: 4, tags: ['person', 'common'], enemyType: 'spawner' },
  { id: 'ds-ja-tabemono', nativeScript: 'たべもの', hebrew: 'たべもの', letters: ['た', 'べ', 'も', 'の'],       transliteration: 'tabemono',  english: 'food',       meaning: 'food',       languageId: 'japanese', difficulty: 4, tags: ['food', 'concrete'], enemyType: 'amplifier' },
  { id: 'ds-ja-ikimono',  nativeScript: 'いきもの', hebrew: 'いきもの', letters: ['い', 'き', 'も', 'の'],       transliteration: 'ikimono',   english: 'living thing', meaning: 'living thing', languageId: 'japanese', difficulty: 4, tags: ['nature', 'abstract'] },
  { id: 'ds-ja-onigiri',  nativeScript: 'おにぎり', hebrew: 'おにぎり', letters: ['お', 'に', 'ぎ', 'り'],       transliteration: 'onigiri',   english: 'rice ball',  meaning: 'rice ball',  languageId: 'japanese', difficulty: 4, tags: ['food', 'culture'], enemyType: 'spawner' },
  { id: 'ds-ja-origami',  nativeScript: 'おりがみ', hebrew: 'おりがみ', letters: ['お', 'り', 'が', 'み'],       transliteration: 'origami',   english: 'origami',    meaning: 'origami',    languageId: 'japanese', difficulty: 4, tags: ['object', 'culture'], enemyType: 'amplifier' },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 5 — Long / complex words, challenge tier + minibosses
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ja-hanabi',      nativeScript: 'はなび',       hebrew: 'はなび',       letters: ['は', 'な', 'び'],                   transliteration: 'hanabi',       english: 'fireworks',     meaning: 'fireworks',     languageId: 'japanese', difficulty: 5, tags: ['nature', 'culture'], isMiniboss: true, enemyType: 'corruptor' },
  { id: 'ds-ja-monogatari',  nativeScript: 'ものがたり',   hebrew: 'ものがたり',   letters: ['も', 'の', 'が', 'た', 'り'],       transliteration: 'monogatari',   english: 'story / tale',  meaning: 'story / tale',  languageId: 'japanese', difficulty: 5, tags: ['abstract', 'culture'], isMiniboss: true, enemyType: 'amplifier' },
  { id: 'ds-ja-omoiyari',    nativeScript: 'おもいやり',   hebrew: 'おもいやり',   letters: ['お', 'も', 'い', 'や', 'り'],       transliteration: 'omoiyari',     english: 'compassion',    meaning: 'compassion',    languageId: 'japanese', difficulty: 5, tags: ['abstract'], isMiniboss: true, enemyType: 'spawner' },
];

/**
 * All unique hiragana used across the Japanese word set.
 */
export const deepScriptLetterPoolJapanese = [
  ...new Set(deepScriptWordsJapanese.flatMap((w) => w.letters)),
].sort();
