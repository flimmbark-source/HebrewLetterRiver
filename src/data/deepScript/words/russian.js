/**
 * Deep Script word content — Russian
 *
 * Words used as combat enemies in the Deep Script game mode.
 * Each word uses proper Cyrillic script. Letters are stored as
 * individual characters for validation.
 *
 * Language-agnostic fields:
 *   nativeScript — The word in Cyrillic (alias for legacy `hebrew` field)
 *   meaning      — English gloss (alias for legacy `english` field)
 *   languageId   — 'russian'
 */

export const deepScriptWordsRussian = [

  /* ═══════════════════════════════════════════════════════════
     Difficulty 1 — Short (2-3 letters), very common
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ru-da',   nativeScript: 'да',   hebrew: 'да',   letters: ['д','а'],       transliteration: 'da',   english: 'yes',    meaning: 'yes',    languageId: 'russian', difficulty: 1, tags: ['basics','common'] },
  { id: 'ds-ru-net',  nativeScript: 'нет',  hebrew: 'нет',  letters: ['н','е','т'],   transliteration: 'net',  english: 'no',     meaning: 'no',     languageId: 'russian', difficulty: 1, tags: ['basics','common'] },
  { id: 'ds-ru-dom',  nativeScript: 'дом',  hebrew: 'дом',  letters: ['д','о','м'],   transliteration: 'dom',  english: 'house',  meaning: 'house',  languageId: 'russian', difficulty: 1, tags: ['place','concrete'] },
  { id: 'ds-ru-on',   nativeScript: 'он',   hebrew: 'он',   letters: ['о','н'],       transliteration: 'on',   english: 'he',     meaning: 'he',     languageId: 'russian', difficulty: 1, tags: ['basics','pronoun'] },
  { id: 'ds-ru-my',   nativeScript: 'мы',   hebrew: 'мы',   letters: ['м','ы'],       transliteration: 'my',   english: 'we',     meaning: 'we',     languageId: 'russian', difficulty: 1, tags: ['basics','pronoun'] },
  { id: 'ds-ru-no',   nativeScript: 'но',   hebrew: 'но',   letters: ['н','о'],       transliteration: 'no',   english: 'but',    meaning: 'but',    languageId: 'russian', difficulty: 1, tags: ['basics','common'] },
  { id: 'ds-ru-son',  nativeScript: 'сон',  hebrew: 'сон',  letters: ['с','о','н'],   transliteration: 'son',  english: 'dream',  meaning: 'dream',  languageId: 'russian', difficulty: 1, tags: ['abstract','common'] },
  { id: 'ds-ru-mir',  nativeScript: 'мир',  hebrew: 'мир',  letters: ['м','и','р'],   transliteration: 'mir',  english: 'world / peace', meaning: 'world / peace', languageId: 'russian', difficulty: 1, tags: ['abstract','common'] },
  { id: 'ds-ru-den',  nativeScript: 'день', hebrew: 'день', letters: ['д','е','н','ь'], transliteration: 'den\'', english: 'day', meaning: 'day', languageId: 'russian', difficulty: 1, tags: ['time','common'] },
  { id: 'ds-ru-eda',  nativeScript: 'еда',  hebrew: 'еда',  letters: ['е','д','а'],   transliteration: 'yeda', english: 'food',   meaning: 'food',   languageId: 'russian', difficulty: 1, tags: ['food','concrete'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 2 — Common 3-4 letter words
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ru-voda',   nativeScript: 'вода',   hebrew: 'вода',   letters: ['в','о','д','а'],       transliteration: 'voda',   english: 'water',    meaning: 'water',    languageId: 'russian', difficulty: 2, tags: ['nature','concrete'] },
  { id: 'ds-ru-mama',   nativeScript: 'мама',   hebrew: 'мама',   letters: ['м','а','м','а'],       transliteration: 'mama',   english: 'mother',   meaning: 'mother',   languageId: 'russian', difficulty: 2, tags: ['person','family'] },
  { id: 'ds-ru-papa',   nativeScript: 'папа',   hebrew: 'папа',   letters: ['п','а','п','а'],       transliteration: 'papa',   english: 'father',   meaning: 'father',   languageId: 'russian', difficulty: 2, tags: ['person','family'] },
  { id: 'ds-ru-drug',   nativeScript: 'друг',   hebrew: 'друг',   letters: ['д','р','у','г'],       transliteration: 'drug',   english: 'friend',   meaning: 'friend',   languageId: 'russian', difficulty: 2, tags: ['person','common'] },
  { id: 'ds-ru-slovo',  nativeScript: 'слово',  hebrew: 'слово',  letters: ['с','л','о','в','о'],   transliteration: 'slovo',  english: 'word',     meaning: 'word',     languageId: 'russian', difficulty: 2, tags: ['abstract','common'] },
  { id: 'ds-ru-kofe',   nativeScript: 'кофе',   hebrew: 'кофе',   letters: ['к','о','ф','е'],       transliteration: 'kofe',   english: 'coffee',   meaning: 'coffee',   languageId: 'russian', difficulty: 2, tags: ['food','concrete'] },
  { id: 'ds-ru-ruka',   nativeScript: 'рука',   hebrew: 'рука',   letters: ['р','у','к','а'],       transliteration: 'ruka',   english: 'hand',     meaning: 'hand',     languageId: 'russian', difficulty: 2, tags: ['body','concrete'] },
  { id: 'ds-ru-noch',   nativeScript: 'ночь',   hebrew: 'ночь',   letters: ['н','о','ч','ь'],       transliteration: 'noch\'', english: 'night',    meaning: 'night',    languageId: 'russian', difficulty: 2, tags: ['time','common'] },
  { id: 'ds-ru-lyudi',  nativeScript: 'люди',   hebrew: 'люди',   letters: ['л','ю','д','и'],       transliteration: 'lyudi',  english: 'people',   meaning: 'people',   languageId: 'russian', difficulty: 2, tags: ['person','common'] },
  { id: 'ds-ru-yazyk',  nativeScript: 'язык',   hebrew: 'язык',   letters: ['я','з','ы','к'],       transliteration: 'yazyk',  english: 'language',  meaning: 'language', languageId: 'russian', difficulty: 2, tags: ['abstract','common'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 3 — Medium (4-5 letters), common vocabulary
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ru-kniga',   nativeScript: 'книга',   hebrew: 'книга',   letters: ['к','н','и','г','а'],         transliteration: 'kniga',   english: 'book',     meaning: 'book',     languageId: 'russian', difficulty: 3, tags: ['object','concrete'] },
  { id: 'ds-ru-gorod',   nativeScript: 'город',   hebrew: 'город',   letters: ['г','о','р','о','д'],         transliteration: 'gorod',   english: 'city',     meaning: 'city',     languageId: 'russian', difficulty: 3, tags: ['place','concrete'] },
  { id: 'ds-ru-vremya',  nativeScript: 'время',   hebrew: 'время',   letters: ['в','р','е','м','я'],         transliteration: 'vremya',  english: 'time',     meaning: 'time',     languageId: 'russian', difficulty: 3, tags: ['abstract','common'] },
  { id: 'ds-ru-strana',  nativeScript: 'страна',  hebrew: 'страна',  letters: ['с','т','р','а','н','а'],     transliteration: 'strana',  english: 'country',  meaning: 'country',  languageId: 'russian', difficulty: 3, tags: ['place','concrete'] },
  { id: 'ds-ru-ulitsa',  nativeScript: 'улица',   hebrew: 'улица',   letters: ['у','л','и','ц','а'],         transliteration: 'ulitsa',  english: 'street',   meaning: 'street',   languageId: 'russian', difficulty: 3, tags: ['place','concrete'] },
  { id: 'ds-ru-rabota',  nativeScript: 'работа',  hebrew: 'работа',  letters: ['р','а','б','о','т','а'],     transliteration: 'rabota',  english: 'work',     meaning: 'work',     languageId: 'russian', difficulty: 3, tags: ['abstract','common'] },
  { id: 'ds-ru-semya',   nativeScript: 'семья',   hebrew: 'семья',   letters: ['с','е','м','ь','я'],         transliteration: 'sem\'ya', english: 'family',   meaning: 'family',   languageId: 'russian', difficulty: 3, tags: ['person','family'] },
  { id: 'ds-ru-dengi',   nativeScript: 'деньги',  hebrew: 'деньги',  letters: ['д','е','н','ь','г','и'],     transliteration: 'den\'gi', english: 'money',    meaning: 'money',    languageId: 'russian', difficulty: 3, tags: ['object','concrete'] },
  { id: 'ds-ru-pogoda',  nativeScript: 'погода',  hebrew: 'погода',  letters: ['п','о','г','о','д','а'],     transliteration: 'pogoda',  english: 'weather',  meaning: 'weather',  languageId: 'russian', difficulty: 3, tags: ['nature','common'] },
  { id: 'ds-ru-zavtra',  nativeScript: 'завтра',  hebrew: 'завтра',  letters: ['з','а','в','т','р','а'],     transliteration: 'zavtra',  english: 'tomorrow', meaning: 'tomorrow', languageId: 'russian', difficulty: 3, tags: ['time','common'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 4 — Longer words (5+ letters)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ru-chelovek',  nativeScript: 'человек',  hebrew: 'человек',  letters: ['ч','е','л','о','в','е','к'],       transliteration: 'chelovek',  english: 'person',    meaning: 'person',    languageId: 'russian', difficulty: 4, tags: ['person','common'], enemyType: 'spawner' },
  { id: 'ds-ru-segodnya',  nativeScript: 'сегодня',  hebrew: 'сегодня',  letters: ['с','е','г','о','д','н','я'],       transliteration: 'segodnya',  english: 'today',     meaning: 'today',     languageId: 'russian', difficulty: 4, tags: ['time','common'], enemyType: 'corruptor' },
  { id: 'ds-ru-vopros',    nativeScript: 'вопрос',   hebrew: 'вопрос',   letters: ['в','о','п','р','о','с'],           transliteration: 'vopros',    english: 'question',  meaning: 'question',  languageId: 'russian', difficulty: 4, tags: ['abstract','common'], enemyType: 'amplifier' },
  { id: 'ds-ru-telefon',   nativeScript: 'телефон',  hebrew: 'телефон',  letters: ['т','е','л','е','ф','о','н'],       transliteration: 'telefon',   english: 'phone',     meaning: 'phone',     languageId: 'russian', difficulty: 4, tags: ['object','concrete'], enemyType: 'corruptor' },
  { id: 'ds-ru-problema',  nativeScript: 'проблема', hebrew: 'проблема', letters: ['п','р','о','б','л','е','м','а'],   transliteration: 'problema',  english: 'problem',   meaning: 'problem',   languageId: 'russian', difficulty: 4, tags: ['abstract','common'], enemyType: 'spawner' },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 5 — Minibosses (long, challenging words)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-ru-krasivyy',      nativeScript: 'красивый',     hebrew: 'красивый',     letters: ['к','р','а','с','и','в','ы','й'],             transliteration: 'krasivyy',      english: 'beautiful',  meaning: 'beautiful',  languageId: 'russian', difficulty: 5, tags: ['adjective','common'], enemyType: 'amplifier', isMiniboss: true },
  { id: 'ds-ru-schastlivyy',   nativeScript: 'счастливый',   hebrew: 'счастливый',   letters: ['с','ч','а','с','т','л','и','в','ы','й'],     transliteration: 'schastlivyy',   english: 'happy',      meaning: 'happy',      languageId: 'russian', difficulty: 5, tags: ['adjective','common'], enemyType: 'spawner', isMiniboss: true },
  { id: 'ds-ru-zamechatelnyy', nativeScript: 'замечательный', hebrew: 'замечательный', letters: ['з','а','м','е','ч','а','т','е','л','ь','н','ы','й'], transliteration: 'zamechatel\'nyy', english: 'wonderful', meaning: 'wonderful', languageId: 'russian', difficulty: 5, tags: ['adjective','common'], enemyType: 'corruptor', isMiniboss: true },
];
