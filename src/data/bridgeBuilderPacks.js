/**
 * Bridge Builder vocabulary packs — guided progression content.
 *
 * Each pack groups related words into a themed lesson.
 * Packs belong to a section and are ordered within that section.
 *
 * Structure designed for future glossary integration:
 *   - wordIds reference stable IDs from bridgeBuilderWords
 *   - pack metadata (title, theme, description) can be displayed in glossary groupings
 *
 * @typedef {Object} Pack
 * @property {string}      id           — Stable pack identifier
 * @property {string}      sectionId    — Section this pack belongs to
 * @property {string}      title        — Display title
 * @property {string}      theme        — Theme category
 * @property {string}      description  — Short description for setup screen
 * @property {string[]}    wordIds      — Ordered list of word IDs in this pack
 * @property {number}      order        — Sort order within section
 * @property {string|null} unlockAfter  — Pack ID that must be completed to unlock this one (null = unlocked by default)
 */

export const bridgeBuilderPacks = [
  /* ═══════════════════════════════════════════════════════════
     Section 1: Foundations
     ═══════════════════════════════════════════════════════════ */
  {
    id: 'greetings_01',
    sectionId: 'foundations',
    title: 'Greetings',
    theme: 'greetings',
    description: 'Hello, thank you, and basic courtesy',
    wordIds: ['bb-shalom', 'bb-todah', 'bb-boker-tov', 'bb-layla-tov', 'bb-bevakasha'],
    order: 1,
    unlockAfter: null,
  },
  {
    id: 'pronouns_01',
    sectionId: 'foundations',
    title: 'Pronouns',
    theme: 'pronouns',
    description: 'I, you, and basic pronouns',
    wordIds: ['bb-ani', 'bb-atah', 'bb-at'],
    order: 2,
    unlockAfter: 'greetings_01',
  },
  {
    id: 'family_01',
    sectionId: 'foundations',
    title: 'Family',
    theme: 'family',
    description: 'Mom, dad, family, and home',
    wordIds: ['bb-ima', 'bb-abba', 'bb-mishpacha', 'bb-bayit'],
    order: 3,
    unlockAfter: 'pronouns_01',
  },
  {
    id: 'food_01',
    sectionId: 'foundations',
    title: 'Food & Drink',
    theme: 'food',
    description: 'Bread, water, coffee, and more',
    wordIds: ['bb-lechem', 'bb-mayim', 'bb-cafe', 'bb-tapuach'],
    order: 4,
    unlockAfter: 'family_01',
  },
  {
    id: 'adjectives_01',
    sectionId: 'foundations',
    title: 'Adjectives',
    theme: 'adjectives',
    description: 'Good, big, small, beautiful',
    wordIds: ['bb-tov', 'bb-gadol', 'bb-katan', 'bb-yafe'],
    order: 5,
    unlockAfter: 'food_01',
  },
  {
    id: 'numbers_01',
    sectionId: 'foundations',
    title: 'Numbers',
    theme: 'numbers',
    description: 'Counting from one to five',
    wordIds: ['bb-echad', 'bb-shtayim', 'bb-shalosh', 'bb-arba', 'bb-chamesh'],
    order: 6,
    unlockAfter: 'adjectives_01',
  },
  {
    id: 'colors_01',
    sectionId: 'foundations',
    title: 'Colors',
    theme: 'colors',
    description: 'Red, blue, green, and more',
    wordIds: ['bb-adom', 'bb-kachol', 'bb-yarok', 'bb-tsahov'],
    order: 7,
    unlockAfter: 'numbers_01',
  },
  {
    id: 'everyday_objects_01',
    sectionId: 'foundations',
    title: 'Everyday Objects',
    theme: 'objects',
    description: 'Book, phone, table, and door',
    wordIds: ['bb-sefer', 'bb-telefon', 'bb-shulchan', 'bb-delet'],
    order: 8,
    unlockAfter: 'colors_01',
  },

  /* ═══════════════════════════════════════════════════════════
     Section 2: Daily Life
     ═══════════════════════════════════════════════════════════ */
  {
    id: 'at_home_01',
    sectionId: 'daily_life',
    title: 'At Home',
    theme: 'home',
    description: 'Kitchen, room, bed, and window',
    wordIds: ['bb-mitbach', 'bb-cheder', 'bb-mitah', 'bb-chalon'],
    order: 1,
    unlockAfter: null,
  },
  {
    id: 'clothing_01',
    sectionId: 'daily_life',
    title: 'Clothing',
    theme: 'clothing',
    description: 'Shirt, pants, shoes, and hat',
    wordIds: ['bb-chultsa', 'bb-michnasayim', 'bb-naalayim', 'bb-kova'],
    order: 2,
    unlockAfter: 'at_home_01',
  },
  {
    id: 'time_days_01',
    sectionId: 'daily_life',
    title: 'Time & Days',
    theme: 'time',
    description: 'Today, tomorrow, and days of the week',
    wordIds: ['bb-hayom', 'bb-machar', 'bb-etmol', 'bb-shaah'],
    order: 3,
    unlockAfter: 'clothing_01',
  },
  {
    id: 'weather_01',
    sectionId: 'daily_life',
    title: 'Weather',
    theme: 'weather',
    description: 'Sun, rain, hot, and cold',
    wordIds: ['bb-shemesh', 'bb-geshem', 'bb-cham', 'bb-kar'],
    order: 4,
    unlockAfter: 'time_days_01',
  },
  {
    id: 'basic_actions_01',
    sectionId: 'daily_life',
    title: 'Basic Actions',
    theme: 'actions',
    description: 'Eat, drink, go, and sleep',
    wordIds: ['bb-le-echol', 'bb-lishtot', 'bb-lalechet', 'bb-lishon'],
    order: 5,
    unlockAfter: 'weather_01',
  },
  {
    id: 'shopping_01',
    sectionId: 'daily_life',
    title: 'Shopping Basics',
    theme: 'shopping',
    description: 'Money, store, how much, and bag',
    wordIds: ['bb-kesef', 'bb-chanut', 'bb-kamah', 'bb-sakit'],
    order: 6,
    unlockAfter: 'basic_actions_01',
  },
  {
    id: 'getting_around_01',
    sectionId: 'daily_life',
    title: 'Getting Around',
    theme: 'transport',
    description: 'Car, bus, street, and map',
    wordIds: ['bb-mechonit', 'bb-otobus', 'bb-rechov', 'bb-mapah'],
    order: 7,
    unlockAfter: 'shopping_01',
  },
  {
    id: 'school_study_01',
    sectionId: 'daily_life',
    title: 'School / Study',
    theme: 'school',
    description: 'Teacher, student, lesson, and pen',
    wordIds: ['bb-moreh', 'bb-talmid', 'bb-shiur', 'bb-et'],
    order: 8,
    unlockAfter: 'getting_around_01',
  },

  /* ═══════════════════════════════════════════════════════════
     Section 3: People & Social Life
     ═══════════════════════════════════════════════════════════ */
  {
    id: 'friends_01',
    sectionId: 'people_social',
    title: 'Friends',
    theme: 'friends',
    description: 'Friend, together, fun, and play',
    wordIds: ['bb-chaver', 'bb-yachad', 'bb-kef', 'bb-lesachek'],
    order: 1,
    unlockAfter: null,
  },
  {
    id: 'feelings_01',
    sectionId: 'people_social',
    title: 'Feelings',
    theme: 'feelings',
    description: 'Happy, sad, tired, and angry',
    wordIds: ['bb-sameach', 'bb-atzuv', 'bb-ayef', 'bb-koes'],
    order: 2,
    unlockAfter: 'friends_01',
  },
  {
    id: 'questions_01',
    sectionId: 'people_social',
    title: 'Questions',
    theme: 'questions',
    description: 'What, who, where, and when',
    wordIds: ['bb-mah', 'bb-mi', 'bb-eifo', 'bb-matai'],
    order: 3,
    unlockAfter: 'feelings_01',
  },
  {
    id: 'describing_people_01',
    sectionId: 'people_social',
    title: 'Describing People',
    theme: 'describing',
    description: 'Tall, short, young, and old',
    wordIds: ['bb-gavoha', 'bb-namuch', 'bb-tsair', 'bb-zaken'],
    order: 4,
    unlockAfter: 'questions_01',
  },
  {
    id: 'conversation_01',
    sectionId: 'people_social',
    title: 'Conversation Basics',
    theme: 'conversation',
    description: 'Yes, no, maybe, and of course',
    wordIds: ['bb-ken', 'bb-lo', 'bb-ulai', 'bb-betach'],
    order: 5,
    unlockAfter: 'describing_people_01',
  },
  {
    id: 'helping_asking_01',
    sectionId: 'people_social',
    title: 'Helping & Asking',
    theme: 'helping',
    description: 'Help, need, want, and can',
    wordIds: ['bb-ezrah', 'bb-tsarich', 'bb-rotzeh', 'bb-yachol'],
    order: 6,
    unlockAfter: 'conversation_01',
  },
  {
    id: 'community_places_01',
    sectionId: 'people_social',
    title: 'Community Places',
    theme: 'community',
    description: 'Park, school, hospital, and synagogue',
    wordIds: ['bb-park', 'bb-beit-sefer', 'bb-beit-cholim', 'bb-beit-knesset'],
    order: 7,
    unlockAfter: 'helping_asking_01',
  },
  {
    id: 'activities_01',
    sectionId: 'people_social',
    title: 'Activities',
    theme: 'activities',
    description: 'Read, write, sing, and dance',
    wordIds: ['bb-likro', 'bb-lichtov', 'bb-lashir', 'bb-lirkod'],
    order: 8,
    unlockAfter: 'community_places_01',
  },

  /* ═══════════════════════════════════════════════════════════
     Section 4: Hebrew Meaning Builders
     ═══════════════════════════════════════════════════════════ */
  {
    id: 'location_words_01',
    sectionId: 'meaning_builders',
    title: 'Location Words',
    theme: 'location',
    description: 'Here, there, inside, and outside',
    wordIds: ['bb-po', 'bb-sham', 'bb-bifnim', 'bb-bachutz'],
    order: 1,
    unlockAfter: null,
  },
  {
    id: 'possession_01',
    sectionId: 'meaning_builders',
    title: 'Possession',
    theme: 'possession',
    description: 'My, your, his, and her',
    wordIds: ['bb-sheli', 'bb-shelcha', 'bb-shelo', 'bb-shelah'],
    order: 2,
    unlockAfter: 'location_words_01',
  },
  {
    id: 'function_words_01',
    sectionId: 'meaning_builders',
    title: 'Function Words',
    theme: 'function',
    description: 'And, but, because, and also',
    wordIds: ['bb-ve', 'bb-aval', 'bb-ki', 'bb-gam'],
    order: 3,
    unlockAfter: 'possession_01',
  },
  {
    id: 'prefix_basics_01',
    sectionId: 'meaning_builders',
    title: 'Prefix Basics',
    theme: 'prefixes',
    description: 'To, from, in, and like',
    wordIds: ['bb-le', 'bb-mi-prefix', 'bb-be', 'bb-kmo'],
    order: 4,
    unlockAfter: 'function_words_01',
  },
  {
    id: 'definite_article_01',
    sectionId: 'meaning_builders',
    title: 'Definite Article',
    theme: 'article',
    description: 'The (ha-) and how it works',
    wordIds: ['bb-ha-sefer', 'bb-ha-bayit', 'bb-ha-yeled', 'bb-ha-yaldah'],
    order: 5,
    unlockAfter: 'prefix_basics_01',
  },
  {
    id: 'quantity_words_01',
    sectionId: 'meaning_builders',
    title: 'Quantity Words',
    theme: 'quantity',
    description: 'Many, few, all, and every',
    wordIds: ['bb-harbeh', 'bb-meat', 'bb-kol', 'bb-kol-echad'],
    order: 6,
    unlockAfter: 'definite_article_01',
  },
  {
    id: 'useful_chunks_01',
    sectionId: 'meaning_builders',
    title: 'Useful Chunks',
    theme: 'chunks',
    description: 'Common phrases and expressions',
    wordIds: ['bb-mah-nishma', 'bb-beseder', 'bb-yalla', 'bb-sababa'],
    order: 7,
    unlockAfter: 'quantity_words_01',
  },
  {
    id: 'word_variations_01',
    sectionId: 'meaning_builders',
    title: 'Word Variations',
    theme: 'variations',
    description: 'Masculine, feminine, and plural forms',
    wordIds: ['bb-yeled', 'bb-yaldah', 'bb-yeladim', 'bb-yeladot'],
    order: 8,
    unlockAfter: 'useful_chunks_01',
  },
];

/**
 * Get a pack by ID.
 */
export function getPackById(packId) {
  return bridgeBuilderPacks.find(p => p.id === packId) || null;
}

/**
 * Get all packs sorted by order.
 */
export function getPacksInOrder() {
  return [...bridgeBuilderPacks].sort((a, b) => a.order - b.order);
}

/**
 * Get packs for a specific section, sorted by order.
 */
export function getPacksBySection(sectionId) {
  return bridgeBuilderPacks
    .filter(p => p.sectionId === sectionId)
    .sort((a, b) => a.order - b.order);
}
