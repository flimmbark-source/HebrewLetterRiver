/**
 * Deep Script word content — Mandarin Chinese
 *
 * Words used as combat enemies in Deep Script mode.
 * For Chinese, each character is treated as an individual letter unit.
 *
 * Enemy types: 'corruptor' | 'spawner' | 'amplifier'
 * - Difficulty 1-2: mostly corruptors (baseline, learnable)
 * - Difficulty 3: mix of all three
 * - Difficulty 4-5: more spawners and amplifiers, includes minibosses
 *
 * Language-agnostic fields:
 *   nativeScript — The word in Simplified Chinese
 *   meaning      — English gloss (alias for legacy `english` field)
 *   languageId   — 'mandarin'
 *
 * Legacy fields (kept for backward compat):
 *   hebrew       — Target word text (same as nativeScript)
 *   english      — English meaning (same as meaning)
 */

export const deepScriptWordsMandarin = [

  /* ═══════════════════════════════════════════════════════════
     Difficulty 1 — Single character words (very common)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-zh-ren',   nativeScript: '人',  hebrew: '人',  letters: ['人'],       transliteration: 'rén',   english: 'person',   meaning: 'person',   languageId: 'mandarin', difficulty: 1, tags: ['person', 'common'] },
  { id: 'ds-zh-da',    nativeScript: '大',  hebrew: '大',  letters: ['大'],       transliteration: 'dà',    english: 'big',      meaning: 'big',      languageId: 'mandarin', difficulty: 1, tags: ['adjective', 'common'] },
  { id: 'ds-zh-shui',  nativeScript: '水',  hebrew: '水',  letters: ['水'],       transliteration: 'shuǐ',  english: 'water',    meaning: 'water',    languageId: 'mandarin', difficulty: 1, tags: ['nature', 'concrete'] },
  { id: 'ds-zh-huo',   nativeScript: '火',  hebrew: '火',  letters: ['火'],       transliteration: 'huǒ',   english: 'fire',     meaning: 'fire',     languageId: 'mandarin', difficulty: 1, tags: ['nature', 'concrete'] },
  { id: 'ds-zh-shan',  nativeScript: '山',  hebrew: '山',  letters: ['山'],       transliteration: 'shān',  english: 'mountain', meaning: 'mountain', languageId: 'mandarin', difficulty: 1, tags: ['nature', 'concrete'] },
  { id: 'ds-zh-ri',    nativeScript: '日',  hebrew: '日',  letters: ['日'],       transliteration: 'rì',    english: 'sun / day', meaning: 'sun / day', languageId: 'mandarin', difficulty: 1, tags: ['nature', 'time'] },
  { id: 'ds-zh-yue',   nativeScript: '月',  hebrew: '月',  letters: ['月'],       transliteration: 'yuè',   english: 'moon / month', meaning: 'moon / month', languageId: 'mandarin', difficulty: 1, tags: ['nature', 'time'] },
  { id: 'ds-zh-mu',    nativeScript: '木',  hebrew: '木',  letters: ['木'],       transliteration: 'mù',    english: 'wood / tree', meaning: 'wood / tree', languageId: 'mandarin', difficulty: 1, tags: ['nature', 'concrete'] },
  { id: 'ds-zh-kou',   nativeScript: '口',  hebrew: '口',  letters: ['口'],       transliteration: 'kǒu',   english: 'mouth',    meaning: 'mouth',    languageId: 'mandarin', difficulty: 1, tags: ['body', 'concrete'] },
  { id: 'ds-zh-shou',  nativeScript: '手',  hebrew: '手',  letters: ['手'],       transliteration: 'shǒu',  english: 'hand',     meaning: 'hand',     languageId: 'mandarin', difficulty: 1, tags: ['body', 'concrete'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 2 — Two character words (common vocabulary)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-zh-pengyou',  nativeScript: '朋友',  hebrew: '朋友',  letters: ['朋', '友'],   transliteration: 'péngyǒu',   english: 'friend',    meaning: 'friend',    languageId: 'mandarin', difficulty: 2, tags: ['person', 'common'] },
  { id: 'ds-zh-xuesheng', nativeScript: '学生',  hebrew: '学生',  letters: ['学', '生'],   transliteration: 'xuéshēng',  english: 'student',   meaning: 'student',   languageId: 'mandarin', difficulty: 2, tags: ['person', 'common'] },
  { id: 'ds-zh-laoshi',   nativeScript: '老师',  hebrew: '老师',  letters: ['老', '师'],   transliteration: 'lǎoshī',    english: 'teacher',   meaning: 'teacher',   languageId: 'mandarin', difficulty: 2, tags: ['person', 'common'] },
  { id: 'ds-zh-zhongguo', nativeScript: '中国',  hebrew: '中国',  letters: ['中', '国'],   transliteration: 'zhōngguó',  english: 'China',     meaning: 'China',     languageId: 'mandarin', difficulty: 2, tags: ['place', 'proper'] },
  { id: 'ds-zh-kafei',    nativeScript: '咖啡',  hebrew: '咖啡',  letters: ['咖', '啡'],   transliteration: 'kāfēi',     english: 'coffee',    meaning: 'coffee',    languageId: 'mandarin', difficulty: 2, tags: ['food', 'concrete'] },
  { id: 'ds-zh-gongzuo',  nativeScript: '工作',  hebrew: '工作',  letters: ['工', '作'],   transliteration: 'gōngzuò',   english: 'work',      meaning: 'work',      languageId: 'mandarin', difficulty: 2, tags: ['abstract', 'common'] },
  { id: 'ds-zh-kuaile',   nativeScript: '快乐',  hebrew: '快乐',  letters: ['快', '乐'],   transliteration: 'kuàilè',    english: 'happy',     meaning: 'happy',     languageId: 'mandarin', difficulty: 2, tags: ['adjective', 'common'], enemyType: 'spawner' },
  { id: 'ds-zh-shijian',  nativeScript: '时间',  hebrew: '时间',  letters: ['时', '间'],   transliteration: 'shíjiān',   english: 'time',      meaning: 'time',      languageId: 'mandarin', difficulty: 2, tags: ['abstract', 'common'] },
  { id: 'ds-zh-dongxi',   nativeScript: '东西',  hebrew: '东西',  letters: ['东', '西'],   transliteration: 'dōngxi',    english: 'thing',     meaning: 'thing',     languageId: 'mandarin', difficulty: 2, tags: ['abstract', 'common'] },
  { id: 'ds-zh-mingtian',  nativeScript: '明天',  hebrew: '明天',  letters: ['明', '天'],   transliteration: 'míngtiān',  english: 'tomorrow',  meaning: 'tomorrow',  languageId: 'mandarin', difficulty: 2, tags: ['time', 'common'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 3 — Two to three character words (intermediate)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-zh-taiyang',    nativeScript: '太阳',    hebrew: '太阳',    letters: ['太', '阳'],         transliteration: 'tàiyáng',     english: 'sun',         meaning: 'sun',         languageId: 'mandarin', difficulty: 3, tags: ['nature', 'concrete'] },
  { id: 'ds-zh-dianhua',    nativeScript: '电话',    hebrew: '电话',    letters: ['电', '话'],         transliteration: 'diànhuà',     english: 'telephone',   meaning: 'telephone',   languageId: 'mandarin', difficulty: 3, tags: ['object', 'concrete'], enemyType: 'spawner' },
  { id: 'ds-zh-yiyuan',     nativeScript: '医院',    hebrew: '医院',    letters: ['医', '院'],         transliteration: 'yīyuàn',      english: 'hospital',    meaning: 'hospital',    languageId: 'mandarin', difficulty: 3, tags: ['place', 'concrete'] },
  { id: 'ds-zh-tushuguan',  nativeScript: '图书馆',  hebrew: '图书馆',  letters: ['图', '书', '馆'],   transliteration: 'túshūguǎn',   english: 'library',     meaning: 'library',     languageId: 'mandarin', difficulty: 3, tags: ['place', 'concrete'], enemyType: 'amplifier' },
  { id: 'ds-zh-xuexiao',    nativeScript: '学校',    hebrew: '学校',    letters: ['学', '校'],         transliteration: 'xuéxiào',     english: 'school',      meaning: 'school',      languageId: 'mandarin', difficulty: 3, tags: ['place', 'concrete'] },
  { id: 'ds-zh-diannao',    nativeScript: '电脑',    hebrew: '电脑',    letters: ['电', '脑'],         transliteration: 'diànnǎo',     english: 'computer',    meaning: 'computer',    languageId: 'mandarin', difficulty: 3, tags: ['object', 'concrete'], enemyType: 'spawner' },
  { id: 'ds-zh-huoche',     nativeScript: '火车',    hebrew: '火车',    letters: ['火', '车'],         transliteration: 'huǒchē',      english: 'train',       meaning: 'train',       languageId: 'mandarin', difficulty: 3, tags: ['object', 'concrete'] },
  { id: 'ds-zh-feiji',      nativeScript: '飞机',    hebrew: '飞机',    letters: ['飞', '机'],         transliteration: 'fēijī',        english: 'airplane',    meaning: 'airplane',    languageId: 'mandarin', difficulty: 3, tags: ['object', 'concrete'], enemyType: 'amplifier' },
  { id: 'ds-zh-dianying',   nativeScript: '电影',    hebrew: '电影',    letters: ['电', '影'],         transliteration: 'diànyǐng',    english: 'movie',       meaning: 'movie',       languageId: 'mandarin', difficulty: 3, tags: ['abstract', 'culture'] },
  { id: 'ds-zh-zhonggwen',  nativeScript: '中文',    hebrew: '中文',    letters: ['中', '文'],         transliteration: 'zhōngwén',    english: 'Chinese (language)', meaning: 'Chinese (language)', languageId: 'mandarin', difficulty: 3, tags: ['abstract', 'common'], enemyType: 'spawner' },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 4 — Three to four character words (advanced)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-zh-daxuesheng', nativeScript: '大学生',    hebrew: '大学生',    letters: ['大', '学', '生'],         transliteration: 'dàxuéshēng',    english: 'college student', meaning: 'college student', languageId: 'mandarin', difficulty: 4, tags: ['person', 'concrete'], enemyType: 'spawner' },
  { id: 'ds-zh-fuwuyuan',   nativeScript: '服务员',    hebrew: '服务员',    letters: ['服', '务', '员'],         transliteration: 'fúwùyuán',      english: 'waiter / attendant', meaning: 'waiter / attendant', languageId: 'mandarin', difficulty: 4, tags: ['person', 'concrete'], enemyType: 'amplifier' },
  { id: 'ds-zh-gonggongqiche', nativeScript: '公共汽车', hebrew: '公共汽车', letters: ['公', '共', '汽', '车'],   transliteration: 'gōnggòng qìchē', english: 'bus',           meaning: 'bus',           languageId: 'mandarin', difficulty: 4, tags: ['object', 'concrete'], enemyType: 'spawner' },
  { id: 'ds-zh-yinyuehui',  nativeScript: '音乐会',    hebrew: '音乐会',    letters: ['音', '乐', '会'],         transliteration: 'yīnyuèhuì',     english: 'concert',       meaning: 'concert',       languageId: 'mandarin', difficulty: 4, tags: ['abstract', 'culture'], enemyType: 'amplifier' },
  { id: 'ds-zh-bowuguan',   nativeScript: '博物馆',    hebrew: '博物馆',    letters: ['博', '物', '馆'],         transliteration: 'bówùguǎn',      english: 'museum',        meaning: 'museum',        languageId: 'mandarin', difficulty: 4, tags: ['place', 'concrete'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 5 — Minibosses (challenging multi-character words)
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-zh-youdianr',    nativeScript: '不好意思',    hebrew: '不好意思',    letters: ['不', '好', '意', '思'],         transliteration: 'bùhǎoyìsi',        english: 'excuse me / embarrassed', meaning: 'excuse me / embarrassed', languageId: 'mandarin', difficulty: 5, tags: ['abstract', 'common'], enemyType: 'amplifier', isMiniboss: true },
  { id: 'ds-zh-huanying',    nativeScript: '欢迎光临',    hebrew: '欢迎光临',    letters: ['欢', '迎', '光', '临'],         transliteration: 'huānyíng guānglín', english: 'welcome',                 meaning: 'welcome',                 languageId: 'mandarin', difficulty: 5, tags: ['abstract', 'greeting'], enemyType: 'spawner', isMiniboss: true },
  { id: 'ds-zh-xinniankuaile', nativeScript: '新年快乐',  hebrew: '新年快乐',  letters: ['新', '年', '快', '乐'],         transliteration: 'xīnnián kuàilè',   english: 'Happy New Year',          meaning: 'Happy New Year',          languageId: 'mandarin', difficulty: 5, tags: ['abstract', 'culture'], enemyType: 'amplifier', isMiniboss: true },

];
