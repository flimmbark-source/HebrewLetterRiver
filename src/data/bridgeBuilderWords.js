/**
 * Bridge Builder vocabulary data
 *
 * Static word data for the Bridge Builder game mode.
 * Structured for future glossary integration — each word has a stable id,
 * hebrew text, canonical transliteration, translation, theme, and difficulty.
 */

export const bridgeBuilderWords = [
  /* ═══════════════════════════════════════════════════════════
     Section 1: Foundations
     ═══════════════════════════════════════════════════════════ */

  // Theme: Greetings (difficulty 1)
  {
    id: 'bb-shalom',
    hebrew: 'שלום',
    transliteration: 'shalom',
    translation: 'hello / peace',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-todah',
    hebrew: 'תודה',
    transliteration: 'todah',
    translation: 'thank you',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-boker-tov',
    hebrew: 'בוקר טוב',
    transliteration: 'boker tov',
    translation: 'good morning',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-layla-tov',
    hebrew: 'לילה טוב',
    transliteration: 'layla tov',
    translation: 'good night',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-bevakasha',
    hebrew: 'בבקשה',
    transliteration: 'bevakasha',
    translation: 'please / you\'re welcome',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },

  // Theme: Pronouns (difficulty 1)
  {
    id: 'bb-ani',
    hebrew: 'אני',
    transliteration: 'ani',
    translation: 'I',
    theme: 'pronouns',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-atah',
    hebrew: 'אתה',
    transliteration: 'atah',
    translation: 'you (m)',
    theme: 'pronouns',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-at',
    hebrew: 'את',
    transliteration: 'at',
    translation: 'you (f)',
    theme: 'pronouns',
    difficulty: 1,
    tags: ['basics'],
  },

  // Theme: Family (difficulty 2)
  {
    id: 'bb-ima',
    hebrew: 'אמא',
    transliteration: 'ima',
    translation: 'mom',
    theme: 'family',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-abba',
    hebrew: 'אבא',
    transliteration: 'abba',
    translation: 'dad',
    theme: 'family',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-mishpacha',
    hebrew: 'משפחה',
    transliteration: 'mishpacha',
    translation: 'family',
    theme: 'family',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-bayit',
    hebrew: 'בית',
    transliteration: 'bayit',
    translation: 'house / home',
    theme: 'family',
    difficulty: 2,
    tags: ['nouns'],
  },

  // Theme: Food (difficulty 2)
  {
    id: 'bb-lechem',
    hebrew: 'לחם',
    transliteration: 'lechem',
    translation: 'bread',
    theme: 'food',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-mayim',
    hebrew: 'מים',
    transliteration: 'mayim',
    translation: 'water',
    theme: 'food',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-cafe',
    hebrew: 'קפה',
    transliteration: 'kafe',
    translation: 'coffee',
    theme: 'food',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-tapuach',
    hebrew: 'תפוח',
    transliteration: 'tapuach',
    translation: 'apple',
    theme: 'food',
    difficulty: 2,
    tags: ['nouns'],
  },

  // Theme: Adjectives (difficulty 2)
  {
    id: 'bb-tov',
    hebrew: 'טוב',
    transliteration: 'tov',
    translation: 'good',
    theme: 'adjectives',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-gadol',
    hebrew: 'גדול',
    transliteration: 'gadol',
    translation: 'big',
    theme: 'adjectives',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-katan',
    hebrew: 'קטן',
    transliteration: 'katan',
    translation: 'small',
    theme: 'adjectives',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-yafe',
    hebrew: 'יפה',
    transliteration: 'yafe',
    translation: 'beautiful',
    theme: 'adjectives',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Numbers (difficulty 1)
  {
    id: 'bb-echad',
    hebrew: 'אחד',
    transliteration: 'echad',
    translation: 'one',
    theme: 'numbers',
    difficulty: 1,
    tags: ['basics', 'numbers'],
  },
  {
    id: 'bb-shtayim',
    hebrew: 'שתיים',
    transliteration: 'shtayim',
    translation: 'two',
    theme: 'numbers',
    difficulty: 1,
    tags: ['basics', 'numbers'],
  },
  {
    id: 'bb-shalosh',
    hebrew: 'שלוש',
    transliteration: 'shalosh',
    translation: 'three',
    theme: 'numbers',
    difficulty: 1,
    tags: ['basics', 'numbers'],
  },
  {
    id: 'bb-arba',
    hebrew: 'ארבע',
    transliteration: 'arba',
    translation: 'four',
    theme: 'numbers',
    difficulty: 1,
    tags: ['basics', 'numbers'],
  },
  {
    id: 'bb-chamesh',
    hebrew: 'חמש',
    transliteration: 'chamesh',
    translation: 'five',
    theme: 'numbers',
    difficulty: 1,
    tags: ['basics', 'numbers'],
  },

  // Theme: Colors (difficulty 1)
  {
    id: 'bb-adom',
    hebrew: 'אדום',
    transliteration: 'adom',
    translation: 'red',
    theme: 'colors',
    difficulty: 1,
    tags: ['basics', 'colors'],
  },
  {
    id: 'bb-kachol',
    hebrew: 'כחול',
    transliteration: 'kachol',
    translation: 'blue',
    theme: 'colors',
    difficulty: 1,
    tags: ['basics', 'colors'],
  },
  {
    id: 'bb-yarok',
    hebrew: 'ירוק',
    transliteration: 'yarok',
    translation: 'green',
    theme: 'colors',
    difficulty: 1,
    tags: ['basics', 'colors'],
  },
  {
    id: 'bb-tsahov',
    hebrew: 'צהוב',
    transliteration: 'tsahov',
    translation: 'yellow',
    theme: 'colors',
    difficulty: 1,
    tags: ['basics', 'colors'],
  },

  // Theme: Everyday Objects (difficulty 2)
  {
    id: 'bb-sefer',
    hebrew: 'ספר',
    transliteration: 'sefer',
    translation: 'book',
    theme: 'objects',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-telefon',
    hebrew: 'טלפון',
    transliteration: 'telefon',
    translation: 'phone',
    theme: 'objects',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-shulchan',
    hebrew: 'שולחן',
    transliteration: 'shulchan',
    translation: 'table',
    theme: 'objects',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-delet',
    hebrew: 'דלת',
    transliteration: 'delet',
    translation: 'door',
    theme: 'objects',
    difficulty: 2,
    tags: ['nouns'],
  },

  /* ═══════════════════════════════════════════════════════════
     Section 2: Daily Life
     ═══════════════════════════════════════════════════════════ */

  // Theme: At Home
  {
    id: 'bb-mitbach',
    hebrew: 'מטבח',
    transliteration: 'mitbach',
    translation: 'kitchen',
    theme: 'home',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-cheder',
    hebrew: 'חדר',
    transliteration: 'cheder',
    translation: 'room',
    theme: 'home',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-mitah',
    hebrew: 'מיטה',
    transliteration: 'mitah',
    translation: 'bed',
    theme: 'home',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-chalon',
    hebrew: 'חלון',
    transliteration: 'chalon',
    translation: 'window',
    theme: 'home',
    difficulty: 2,
    tags: ['nouns'],
  },

  // Theme: Clothing
  {
    id: 'bb-chultsa',
    hebrew: 'חולצה',
    transliteration: 'chultsa',
    translation: 'shirt',
    theme: 'clothing',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-michnasayim',
    hebrew: 'מכנסיים',
    transliteration: 'michnasayim',
    translation: 'pants',
    theme: 'clothing',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-naalayim',
    hebrew: 'נעליים',
    transliteration: 'naalayim',
    translation: 'shoes',
    theme: 'clothing',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-kova',
    hebrew: 'כובע',
    transliteration: 'kova',
    translation: 'hat',
    theme: 'clothing',
    difficulty: 2,
    tags: ['nouns'],
  },

  // Theme: Time & Days
  {
    id: 'bb-hayom',
    hebrew: 'היום',
    transliteration: 'hayom',
    translation: 'today',
    theme: 'time',
    difficulty: 2,
    tags: ['basics', 'time'],
  },
  {
    id: 'bb-machar',
    hebrew: 'מחר',
    transliteration: 'machar',
    translation: 'tomorrow',
    theme: 'time',
    difficulty: 2,
    tags: ['basics', 'time'],
  },
  {
    id: 'bb-etmol',
    hebrew: 'אתמול',
    transliteration: 'etmol',
    translation: 'yesterday',
    theme: 'time',
    difficulty: 2,
    tags: ['basics', 'time'],
  },
  {
    id: 'bb-shaah',
    hebrew: 'שעה',
    transliteration: 'sha\'ah',
    translation: 'hour',
    theme: 'time',
    difficulty: 2,
    tags: ['nouns', 'time'],
  },

  // Theme: Weather
  {
    id: 'bb-shemesh',
    hebrew: 'שמש',
    transliteration: 'shemesh',
    translation: 'sun',
    theme: 'weather',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-geshem',
    hebrew: 'גשם',
    transliteration: 'geshem',
    translation: 'rain',
    theme: 'weather',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-cham',
    hebrew: 'חם',
    transliteration: 'cham',
    translation: 'hot',
    theme: 'weather',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-kar',
    hebrew: 'קר',
    transliteration: 'kar',
    translation: 'cold',
    theme: 'weather',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Basic Actions
  {
    id: 'bb-le-echol',
    hebrew: 'לאכול',
    transliteration: 'le\'echol',
    translation: 'to eat',
    theme: 'actions',
    difficulty: 2,
    tags: ['verbs'],
  },
  {
    id: 'bb-lishtot',
    hebrew: 'לשתות',
    transliteration: 'lishtot',
    translation: 'to drink',
    theme: 'actions',
    difficulty: 2,
    tags: ['verbs'],
  },
  {
    id: 'bb-lalechet',
    hebrew: 'ללכת',
    transliteration: 'lalechet',
    translation: 'to go / walk',
    theme: 'actions',
    difficulty: 2,
    tags: ['verbs'],
  },
  {
    id: 'bb-lishon',
    hebrew: 'לישון',
    transliteration: 'lishon',
    translation: 'to sleep',
    theme: 'actions',
    difficulty: 2,
    tags: ['verbs'],
  },

  // Theme: Shopping
  {
    id: 'bb-kesef',
    hebrew: 'כסף',
    transliteration: 'kesef',
    translation: 'money',
    theme: 'shopping',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-chanut',
    hebrew: 'חנות',
    transliteration: 'chanut',
    translation: 'store / shop',
    theme: 'shopping',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-kamah',
    hebrew: 'כמה',
    transliteration: 'kamah',
    translation: 'how much / how many',
    theme: 'shopping',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-sakit',
    hebrew: 'שקית',
    transliteration: 'sakit',
    translation: 'bag',
    theme: 'shopping',
    difficulty: 2,
    tags: ['nouns'],
  },

  // Theme: Getting Around
  {
    id: 'bb-mechonit',
    hebrew: 'מכונית',
    transliteration: 'mechonit',
    translation: 'car',
    theme: 'transport',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-otobus',
    hebrew: 'אוטובוס',
    transliteration: 'otobus',
    translation: 'bus',
    theme: 'transport',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-rechov',
    hebrew: 'רחוב',
    transliteration: 'rechov',
    translation: 'street',
    theme: 'transport',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-mapah',
    hebrew: 'מפה',
    transliteration: 'mapah',
    translation: 'map',
    theme: 'transport',
    difficulty: 2,
    tags: ['nouns'],
  },

  // Theme: School / Study
  {
    id: 'bb-moreh',
    hebrew: 'מורה',
    transliteration: 'moreh',
    translation: 'teacher',
    theme: 'school',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-talmid',
    hebrew: 'תלמיד',
    transliteration: 'talmid',
    translation: 'student',
    theme: 'school',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-shiur',
    hebrew: 'שיעור',
    transliteration: 'shi\'ur',
    translation: 'lesson',
    theme: 'school',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-et',
    hebrew: 'עט',
    transliteration: 'et',
    translation: 'pen',
    theme: 'school',
    difficulty: 2,
    tags: ['nouns'],
  },

  /* ═══════════════════════════════════════════════════════════
     Section 3: People & Social Life
     ═══════════════════════════════════════════════════════════ */

  // Theme: Friends
  {
    id: 'bb-chaver',
    hebrew: 'חבר',
    transliteration: 'chaver',
    translation: 'friend (m)',
    theme: 'friends',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-yachad',
    hebrew: 'יחד',
    transliteration: 'yachad',
    translation: 'together',
    theme: 'friends',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-kef',
    hebrew: 'כיף',
    transliteration: 'kef',
    translation: 'fun',
    theme: 'friends',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-lesachek',
    hebrew: 'לשחק',
    transliteration: 'lesachek',
    translation: 'to play',
    theme: 'friends',
    difficulty: 2,
    tags: ['verbs'],
  },

  // Theme: Feelings
  {
    id: 'bb-sameach',
    hebrew: 'שמח',
    transliteration: 'sameach',
    translation: 'happy',
    theme: 'feelings',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-atzuv',
    hebrew: 'עצוב',
    transliteration: 'atzuv',
    translation: 'sad',
    theme: 'feelings',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-ayef',
    hebrew: 'עייף',
    transliteration: 'ayef',
    translation: 'tired',
    theme: 'feelings',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-koes',
    hebrew: 'כועס',
    transliteration: 'ko\'es',
    translation: 'angry',
    theme: 'feelings',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Questions
  {
    id: 'bb-mah',
    hebrew: 'מה',
    transliteration: 'mah',
    translation: 'what',
    theme: 'questions',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-mi',
    hebrew: 'מי',
    transliteration: 'mi',
    translation: 'who',
    theme: 'questions',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-eifo',
    hebrew: 'איפה',
    transliteration: 'eifo',
    translation: 'where',
    theme: 'questions',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-matai',
    hebrew: 'מתי',
    transliteration: 'matai',
    translation: 'when',
    theme: 'questions',
    difficulty: 1,
    tags: ['basics'],
  },

  // Theme: Describing People
  {
    id: 'bb-gavoha',
    hebrew: 'גבוה',
    transliteration: 'gavoha',
    translation: 'tall',
    theme: 'describing',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-namuch',
    hebrew: 'נמוך',
    transliteration: 'namuch',
    translation: 'short (height)',
    theme: 'describing',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-tsair',
    hebrew: 'צעיר',
    transliteration: 'tsa\'ir',
    translation: 'young',
    theme: 'describing',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-zaken',
    hebrew: 'זקן',
    transliteration: 'zaken',
    translation: 'old',
    theme: 'describing',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Conversation Basics
  {
    id: 'bb-ken',
    hebrew: 'כן',
    transliteration: 'ken',
    translation: 'yes',
    theme: 'conversation',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-lo',
    hebrew: 'לא',
    transliteration: 'lo',
    translation: 'no',
    theme: 'conversation',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-ulai',
    hebrew: 'אולי',
    transliteration: 'ulai',
    translation: 'maybe',
    theme: 'conversation',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-betach',
    hebrew: 'בטח',
    transliteration: 'betach',
    translation: 'of course / sure',
    theme: 'conversation',
    difficulty: 1,
    tags: ['basics'],
  },

  // Theme: Helping & Asking
  {
    id: 'bb-ezrah',
    hebrew: 'עזרה',
    transliteration: 'ezrah',
    translation: 'help',
    theme: 'helping',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-tsarich',
    hebrew: 'צריך',
    transliteration: 'tsarich',
    translation: 'need',
    theme: 'helping',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-rotzeh',
    hebrew: 'רוצה',
    transliteration: 'rotzeh',
    translation: 'want',
    theme: 'helping',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-yachol',
    hebrew: 'יכול',
    transliteration: 'yachol',
    translation: 'can / able',
    theme: 'helping',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Community Places
  {
    id: 'bb-park',
    hebrew: 'פארק',
    transliteration: 'park',
    translation: 'park',
    theme: 'community',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-beit-sefer',
    hebrew: 'בית ספר',
    transliteration: 'beit sefer',
    translation: 'school',
    theme: 'community',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-beit-cholim',
    hebrew: 'בית חולים',
    transliteration: 'beit cholim',
    translation: 'hospital',
    theme: 'community',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-beit-knesset',
    hebrew: 'בית כנסת',
    transliteration: 'beit knesset',
    translation: 'synagogue',
    theme: 'community',
    difficulty: 2,
    tags: ['nouns'],
  },

  // Theme: Activities
  {
    id: 'bb-likro',
    hebrew: 'לקרוא',
    transliteration: 'likro',
    translation: 'to read',
    theme: 'activities',
    difficulty: 2,
    tags: ['verbs'],
  },
  {
    id: 'bb-lichtov',
    hebrew: 'לכתוב',
    transliteration: 'lichtov',
    translation: 'to write',
    theme: 'activities',
    difficulty: 2,
    tags: ['verbs'],
  },
  {
    id: 'bb-lashir',
    hebrew: 'לשיר',
    transliteration: 'lashir',
    translation: 'to sing',
    theme: 'activities',
    difficulty: 2,
    tags: ['verbs'],
  },
  {
    id: 'bb-lirkod',
    hebrew: 'לרקוד',
    transliteration: 'lirkod',
    translation: 'to dance',
    theme: 'activities',
    difficulty: 2,
    tags: ['verbs'],
  },

  /* ═══════════════════════════════════════════════════════════
     Section 4: Hebrew Meaning Builders
     ═══════════════════════════════════════════════════════════ */

  // Theme: Location Words
  {
    id: 'bb-po',
    hebrew: 'פה',
    transliteration: 'po',
    translation: 'here',
    theme: 'location',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-sham',
    hebrew: 'שם',
    transliteration: 'sham',
    translation: 'there',
    theme: 'location',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-bifnim',
    hebrew: 'בפנים',
    transliteration: 'bifnim',
    translation: 'inside',
    theme: 'location',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-bachutz',
    hebrew: 'בחוץ',
    transliteration: 'bachutz',
    translation: 'outside',
    theme: 'location',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Possession
  {
    id: 'bb-sheli',
    hebrew: 'שלי',
    transliteration: 'sheli',
    translation: 'my / mine',
    theme: 'possession',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-shelcha',
    hebrew: 'שלך',
    transliteration: 'shelcha',
    translation: 'your / yours (m)',
    theme: 'possession',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-shelo',
    hebrew: 'שלו',
    transliteration: 'shelo',
    translation: 'his',
    theme: 'possession',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-shelah',
    hebrew: 'שלה',
    transliteration: 'shelah',
    translation: 'her / hers',
    theme: 'possession',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Function Words
  {
    id: 'bb-ve',
    hebrew: 'ו',
    transliteration: 've',
    translation: 'and',
    theme: 'function',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-aval',
    hebrew: 'אבל',
    transliteration: 'aval',
    translation: 'but',
    theme: 'function',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-ki',
    hebrew: 'כי',
    transliteration: 'ki',
    translation: 'because',
    theme: 'function',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-gam',
    hebrew: 'גם',
    transliteration: 'gam',
    translation: 'also / too',
    theme: 'function',
    difficulty: 1,
    tags: ['basics'],
  },

  // Theme: Prefix Basics
  {
    id: 'bb-le',
    hebrew: 'ל',
    transliteration: 'le',
    translation: 'to / for',
    theme: 'prefixes',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-mi-prefix',
    hebrew: 'מ',
    transliteration: 'mi',
    translation: 'from',
    theme: 'prefixes',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-be',
    hebrew: 'ב',
    transliteration: 'be',
    translation: 'in / at',
    theme: 'prefixes',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-kmo',
    hebrew: 'כמו',
    transliteration: 'kmo',
    translation: 'like / as',
    theme: 'prefixes',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Definite Article
  {
    id: 'bb-ha-sefer',
    hebrew: 'הספר',
    transliteration: 'ha-sefer',
    translation: 'the book',
    theme: 'article',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-ha-bayit',
    hebrew: 'הבית',
    transliteration: 'ha-bayit',
    translation: 'the house',
    theme: 'article',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-ha-yeled',
    hebrew: 'הילד',
    transliteration: 'ha-yeled',
    translation: 'the boy',
    theme: 'article',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-ha-yaldah',
    hebrew: 'הילדה',
    transliteration: 'ha-yaldah',
    translation: 'the girl',
    theme: 'article',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Quantity Words
  {
    id: 'bb-harbeh',
    hebrew: 'הרבה',
    transliteration: 'harbeh',
    translation: 'many / a lot',
    theme: 'quantity',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-meat',
    hebrew: 'מעט',
    transliteration: 'me\'at',
    translation: 'few / a little',
    theme: 'quantity',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-kol',
    hebrew: 'כל',
    transliteration: 'kol',
    translation: 'all / every',
    theme: 'quantity',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-kol-echad',
    hebrew: 'כל אחד',
    transliteration: 'kol echad',
    translation: 'everyone / each one',
    theme: 'quantity',
    difficulty: 2,
    tags: ['basics'],
  },

  // Theme: Useful Chunks
  {
    id: 'bb-mah-nishma',
    hebrew: 'מה נשמע',
    transliteration: 'mah nishma',
    translation: 'what\'s up',
    theme: 'chunks',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-beseder',
    hebrew: 'בסדר',
    transliteration: 'beseder',
    translation: 'okay / alright',
    theme: 'chunks',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-yalla',
    hebrew: 'יאללה',
    transliteration: 'yalla',
    translation: 'let\'s go / come on',
    theme: 'chunks',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-sababa',
    hebrew: 'סבבה',
    transliteration: 'sababa',
    translation: 'cool / great',
    theme: 'chunks',
    difficulty: 1,
    tags: ['basics'],
  },

  // Theme: Word Variations
  {
    id: 'bb-yeled',
    hebrew: 'ילד',
    transliteration: 'yeled',
    translation: 'boy',
    theme: 'variations',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-yaldah',
    hebrew: 'ילדה',
    transliteration: 'yaldah',
    translation: 'girl',
    theme: 'variations',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-yeladim',
    hebrew: 'ילדים',
    transliteration: 'yeladim',
    translation: 'boys / children',
    theme: 'variations',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-yeladot',
    hebrew: 'ילדות',
    transliteration: 'yeladot',
    translation: 'girls',
    theme: 'variations',
    difficulty: 2,
    tags: ['nouns'],
  },
];

/**
 * Get multiple words by their IDs.
 * @param {string[]} ids
 * @returns {Object[]}
 */
export function getWordsByIds(ids) {
  const idSet = new Set(ids);
  return bridgeBuilderWords.filter(w => idSet.has(w.id));
}

/**
 * Get distractor transliterations for a given word.
 * Returns transliterations from the pool excluding the correct one.
 */
export function getTransliterationDistractors(wordId, count = 2) {
  const word = bridgeBuilderWords.find(w => w.id === wordId);
  if (!word) return [];
  const others = bridgeBuilderWords
    .filter(w => w.id !== wordId)
    .map(w => w.transliteration);
  return shuffle(others).slice(0, count);
}

/**
 * Get distractor translations for a given word.
 */
export function getTranslationDistractors(wordId, count = 2) {
  const word = bridgeBuilderWords.find(w => w.id === wordId);
  if (!word) return [];
  const others = bridgeBuilderWords
    .filter(w => w.id !== wordId)
    .map(w => w.translation);
  return shuffle(others).slice(0, count);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
