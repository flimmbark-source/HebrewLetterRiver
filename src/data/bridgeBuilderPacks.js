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
 * @property {string[]}    [supportWordIds]
 * @property {('noun'|'verb'|'connector'|'phrase'|'reading-pattern'|'mixed')} [primaryType]
 * @property {string[]}    [goalTags]
 * @property {('Starter'|'Core'|'Advanced')} [difficultyBand]
 * @property {number}      [estimatedTimeSec]
 * @property {number}      [targetsNewCount]
 * @property {number}      [supportReviewCount]
 * @property {string}      [whyItMatters]
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
    id: 'pronouns_02',
    sectionId: 'foundations',
    title: 'Pronouns 2',
    theme: 'pronouns',
    description: 'He, she, we, and they',
    wordIds: ['bbct-I', 'bbct-you', 'bbct-he', 'bbct-she', 'bbct-we', 'bbct-they'],
    order: 3,
    unlockAfter: 'pronouns_01',
  },
  {
    id: 'family_01',
    sectionId: 'foundations',
    title: 'Family',
    theme: 'family',
    description: 'Mom, dad, family, and home',
    wordIds: ['bb-ima', 'bb-abba', 'bb-mishpacha', 'bb-bayit'],
    order: 4,
    unlockAfter: 'pronouns_02',
  },
  {
    id: 'family_02',
    sectionId: 'foundations',
    title: 'Family 2',
    theme: 'family',
    description: 'Friend, child, parent, neighbor, and more',
    wordIds: ['bbct-friend', 'bbct-family', 'bbct-child', 'bbct-parent', 'bbct-neighbor', 'bbct-stranger'],
    order: 5,
    unlockAfter: 'family_01',
  },
  {
    id: 'food_01',
    sectionId: 'foundations',
    title: 'Food & Drink',
    theme: 'food',
    description: 'Bread, water, coffee, and more',
    wordIds: ['bb-lechem', 'bb-mayim', 'bb-cafe', 'bb-tapuach'],
    order: 6,
    unlockAfter: 'family_02',
  },
  {
    id: 'food_02',
    sectionId: 'foundations',
    title: 'Food & Drink 2',
    theme: 'food',
    description: 'Food, water, and coffee',
    wordIds: ['bbct-food', 'bbct-water', 'bbct-coffee'],
    order: 7,
    unlockAfter: 'food_01',
  },
  {
    id: 'adjectives_01',
    sectionId: 'foundations',
    title: 'Adjectives',
    theme: 'adjectives',
    description: 'Good, big, small, beautiful',
    wordIds: ['bb-tov', 'bb-gadol', 'bb-katan', 'bb-yafe'],
    order: 8,
    unlockAfter: 'food_02',
  },
  {
    id: 'adjectives_02',
    sectionId: 'foundations',
    title: 'Adjectives 2',
    theme: 'adjectives',
    description: 'Great, nice, beautiful, bad, and more',
    wordIds: ['bbct-great', 'bbct-nice', 'bbct-beautiful', 'bbct-bad', 'bbct-terrible', 'bbct-wonderful'],
    order: 9,
    unlockAfter: 'adjectives_01',
  },
  {
    id: 'adjectives_03',
    sectionId: 'foundations',
    title: 'Adjectives 3',
    theme: 'adjectives',
    description: 'Ugly and strange',
    wordIds: ['bbct-ugly', 'bbct-strange'],
    order: 10,
    unlockAfter: 'adjectives_02',
  },
  {
    id: 'numbers_01',
    sectionId: 'foundations',
    title: 'Numbers',
    theme: 'numbers',
    description: 'Counting from one to five',
    wordIds: ['bb-echad', 'bb-shtayim', 'bb-shalosh', 'bb-arba', 'bb-chamesh'],
    order: 11,
    unlockAfter: 'adjectives_03',
  },
  {
    id: 'colors_01',
    sectionId: 'foundations',
    title: 'Colors',
    theme: 'colors',
    description: 'Red, blue, green, and more',
    wordIds: ['bb-adom', 'bb-kachol', 'bb-yarok', 'bb-tsahov'],
    order: 12,
    unlockAfter: 'numbers_01',
  },
  {
    id: 'everyday_objects_01',
    sectionId: 'foundations',
    title: 'Everyday Objects',
    theme: 'objects',
    description: 'Book, phone, table, and door',
    wordIds: ['bb-sefer', 'bb-telefon', 'bb-shulchan', 'bb-delet'],
    order: 13,
    unlockAfter: 'colors_01',
  },
  {
    id: 'everyday_objects_02',
    sectionId: 'foundations',
    title: 'Everyday Objects 2',
    theme: 'objects',
    description: 'Book, phone, and thing',
    wordIds: ['bbct-book', 'bbct-phone', 'bbct-thing'],
    order: 14,
    unlockAfter: 'everyday_objects_01',
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
    id: 'time_days_02',
    sectionId: 'daily_life',
    title: 'Time & Days 2',
    theme: 'time',
    description: 'Now, then, when, and the core day words',
    wordIds: ['bbct-now', 'bbct-then', 'bbct-when', 'bbct-today', 'bbct-yesterday', 'bbct-tomorrow'],
    order: 4,
    unlockAfter: 'time_days_01',
  },
  {
    id: 'time_days_03',
    sectionId: 'daily_life',
    title: 'Time & Days 3',
    theme: 'time',
    description: 'Soon, later, early, late, time, and day',
    wordIds: ['bbct-soon', 'bbct-later', 'bbct-early', 'bbct-late', 'bbct-time', 'bbct-day'],
    order: 5,
    unlockAfter: 'time_days_02',
  },
  {
    id: 'weather_01',
    sectionId: 'daily_life',
    title: 'Weather',
    theme: 'weather',
    description: 'Sun, rain, hot, and cold',
    wordIds: ['bb-shemesh', 'bb-geshem', 'bb-cham', 'bb-kar'],
    order: 6,
    unlockAfter: 'time_days_03',
  },
  {
    id: 'weather_02',
    sectionId: 'daily_life',
    title: 'Weather 2',
    theme: 'weather',
    description: 'The word for weather itself',
    wordIds: ['bbct-weather'],
    order: 7,
    unlockAfter: 'weather_01',
  },
  {
    id: 'basic_actions_01',
    sectionId: 'daily_life',
    title: 'Basic Actions',
    theme: 'actions',
    description: 'Eat, drink, go, and sleep',
    wordIds: ['bb-le-echol', 'bb-lishtot', 'bb-lalechet', 'bb-lishon'],
    order: 8,
    unlockAfter: 'weather_02',
  },
  {
    id: 'basic_actions_02',
    sectionId: 'daily_life',
    title: 'Basic Actions 2',
    theme: 'actions',
    description: 'Go, come, eat, drink, sleep, and work',
    wordIds: ['bbct-go', 'bbct-come', 'bbct-eat', 'bbct-drink', 'bbct-sleep', 'bbct-work'],
    order: 9,
    unlockAfter: 'basic_actions_01',
  },
  {
    id: 'daily_processes_01',
    sectionId: 'daily_life',
    title: 'Daily Processes',
    theme: 'actions',
    description: 'Help, wait, leave, arrive, start, and finish',
    wordIds: ['bbct-help', 'bbct-wait', 'bbct-leave', 'bbct-arrive', 'bbct-start', 'bbct-finish'],
    order: 10,
    unlockAfter: 'basic_actions_02',
  },
  {
    id: 'daily_processes_02',
    sectionId: 'daily_life',
    title: 'Daily Processes 2',
    theme: 'actions',
    description: 'Stop',
    wordIds: ['bbct-stop'],
    order: 11,
    unlockAfter: 'daily_processes_01',
  },
  {
    id: 'shopping_01',
    sectionId: 'daily_life',
    title: 'Shopping Basics',
    theme: 'shopping',
    description: 'Money, store, how much, and bag',
    wordIds: ['bb-kesef', 'bb-chanut', 'bb-kamah', 'bb-sakit'],
    order: 12,
    unlockAfter: 'daily_processes_02',
  },
  {
    id: 'shopping_02',
    sectionId: 'daily_life',
    title: 'Shopping Basics 2',
    theme: 'shopping',
    description: 'Money, buy, and pay',
    wordIds: ['bbct-money', 'bbct-buy', 'bbct-pay'],
    order: 13,
    unlockAfter: 'shopping_01',
  },
  {
    id: 'getting_around_01',
    sectionId: 'daily_life',
    title: 'Getting Around',
    theme: 'transport',
    description: 'Car, bus, street, and map',
    wordIds: ['bb-mechonit', 'bb-otobus', 'bb-rechov', 'bb-mapah'],
    order: 14,
    unlockAfter: 'shopping_02',
  },
  {
    id: 'getting_around_02',
    sectionId: 'daily_life',
    title: 'Getting Around 2',
    theme: 'transport',
    description: 'Home, house, place, car, street, and city',
    wordIds: ['bbct-home', 'bbct-house', 'bbct-place', 'bbct-car', 'bbct-street', 'bbct-city'],
    order: 15,
    unlockAfter: 'getting_around_01',
  },
  {
    id: 'getting_around_03',
    sectionId: 'daily_life',
    title: 'Getting Around 3',
    theme: 'transport',
    description: 'Country',
    wordIds: ['bbct-country'],
    order: 16,
    unlockAfter: 'getting_around_02',
  },
  {
    id: 'school_study_01',
    sectionId: 'daily_life',
    title: 'School / Study',
    theme: 'school',
    description: 'Teacher, student, lesson, and pen',
    wordIds: ['bb-moreh', 'bb-talmid', 'bb-shiur', 'bb-et'],
    order: 17,
    unlockAfter: 'getting_around_03',
  },
  {
    id: 'school_study_02',
    sectionId: 'daily_life',
    title: 'School / Study 2',
    theme: 'school',
    description: 'Study, language, and word',
    wordIds: ['bbct-study', 'bbct-language', 'bbct-word'],
    order: 18,
    unlockAfter: 'school_study_01',
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
    id: 'people_references_01',
    sectionId: 'people_social',
    title: 'People References',
    theme: 'people',
    description: 'Who, someone, everyone, nobody, person, and people',
    wordIds: ['bbct-who', 'bbct-someone', 'bbct-everyone', 'bbct-nobody', 'bbct-person', 'bbct-people'],
    order: 2,
    unlockAfter: 'friends_01',
  },
  {
    id: 'feelings_01',
    sectionId: 'people_social',
    title: 'Feelings',
    theme: 'feelings',
    description: 'Happy, sad, tired, and angry',
    wordIds: ['bb-sameach', 'bb-atzuv', 'bb-ayef', 'bb-koes'],
    order: 3,
    unlockAfter: 'people_references_01',
  },
  {
    id: 'feelings_02',
    sectionId: 'people_social',
    title: 'Feelings 2',
    theme: 'feelings',
    description: 'Happy, sad, angry, scared, surprised, and tired',
    wordIds: ['bbct-happy', 'bbct-sad', 'bbct-angry', 'bbct-scared', 'bbct-surprised', 'bbct-tired'],
    order: 4,
    unlockAfter: 'feelings_01',
  },
  {
    id: 'feelings_03',
    sectionId: 'people_social',
    title: 'Feelings 3',
    theme: 'feelings',
    description: 'Excited, bored, worried, confused, okay, and fine',
    wordIds: ['bbct-excited', 'bbct-bored', 'bbct-worried', 'bbct-confused', 'bbct-okay', 'bbct-fine'],
    order: 5,
    unlockAfter: 'feelings_02',
  },
  {
    id: 'questions_01',
    sectionId: 'people_social',
    title: 'Questions',
    theme: 'questions',
    description: 'What, who, where, and when',
    wordIds: ['bb-mah', 'bb-mi', 'bb-eifo', 'bb-matai'],
    order: 6,
    unlockAfter: 'feelings_03',
  },
  {
    id: 'conversation_01',
    sectionId: 'people_social',
    title: 'Conversation Basics',
    theme: 'conversation',
    description: 'Yes, no, maybe, and of course',
    wordIds: ['bb-ken', 'bb-lo', 'bb-ulai', 'bb-betach'],
    order: 7,
    unlockAfter: 'questions_01',
  },
  {
    id: 'communication_01',
    sectionId: 'people_social',
    title: 'Communication',
    theme: 'conversation',
    description: 'See, hear, say, tell, and ask',
    wordIds: ['bbct-see', 'bbct-hear', 'bbct-say', 'bbct-tell', 'bbct-ask'],
    order: 8,
    unlockAfter: 'conversation_01',
  },
  {
    id: 'helping_asking_01',
    sectionId: 'people_social',
    title: 'Helping & Asking',
    theme: 'helping',
    description: 'Help, need, want, and can',
    wordIds: ['bb-ezrah', 'bb-tsarich', 'bb-rotzeh', 'bb-yachol'],
    order: 9,
    unlockAfter: 'communication_01',
  },
  {
    id: 'helping_asking_02',
    sectionId: 'people_social',
    title: 'Helping & Asking 2',
    theme: 'helping',
    description: 'Want, need, like, love, hate, and try',
    wordIds: ['bbct-want', 'bbct-need', 'bbct-like', 'bbct-love', 'bbct-hate', 'bbct-try'],
    order: 10,
    unlockAfter: 'helping_asking_01',
  },
  {
    id: 'thinking_01',
    sectionId: 'people_social',
    title: 'Thinking',
    theme: 'thinking',
    description: 'Think, know, problem, question, answer, and idea',
    wordIds: ['bbct-think', 'bbct-know', 'bbct-problem', 'bbct-question', 'bbct-answer', 'bbct-idea'],
    order: 11,
    unlockAfter: 'helping_asking_02',
  },
  {
    id: 'social_actions_01',
    sectionId: 'people_social',
    title: 'Social Actions',
    theme: 'actions',
    description: 'Make, do, get, give, take, find, and lose',
    wordIds: ['bbct-make', 'bbct-do', 'bbct-get', 'bbct-give', 'bbct-take', 'bbct-find', 'bbct-lose'],
    order: 12,
    unlockAfter: 'thinking_01',
  },
  {
    id: 'describing_people_01',
    sectionId: 'people_social',
    title: 'Describing People',
    theme: 'describing',
    description: 'Tall, short, young, and old',
    wordIds: ['bb-gavoha', 'bb-namuch', 'bb-tsair', 'bb-zaken'],
    order: 13,
    unlockAfter: 'social_actions_01',
  },
  {
    id: 'community_places_01',
    sectionId: 'people_social',
    title: 'Community Places',
    theme: 'community',
    description: 'Park, school, hospital, and synagogue',
    wordIds: ['bb-park', 'bb-beit-sefer', 'bb-beit-cholim', 'bb-beit-knesset'],
    order: 15,
    unlockAfter: 'describing_people_01',
  },
  {
    id: 'activities_01',
    sectionId: 'people_social',
    title: 'Activities',
    theme: 'activities',
    description: 'Read, write, sing, and dance',
    wordIds: ['bb-likro', 'bb-lichtov', 'bb-lashir', 'bb-lirkod'],
    order: 16,
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
    id: 'function_words_02',
    sectionId: 'meaning_builders',
    title: 'Function Words 2',
    theme: 'function',
    description: 'So, but, also, too, either, and neither',
    wordIds: ['bbct-so', 'bbct-but', 'bbct-also', 'bbct-too', 'bbct-either', 'bbct-neither'],
    order: 4,
    unlockAfter: 'function_words_01',
  },
  {
    id: 'connector_logic_01',
    sectionId: 'meaning_builders',
    title: 'Connector Logic',
    theme: 'function',
    description: 'However, therefore, meanwhile, and more',
    wordIds: ['bbct-however', 'bbct-therefore', 'bbct-meanwhile', 'bbct-besides', 'bbct-instead', 'bbct-otherwise'],
    order: 5,
    unlockAfter: 'function_words_02',
  },
  {
    id: 'sequence_words_01',
    sectionId: 'meaning_builders',
    title: 'Sequence Words',
    theme: 'time',
    description: 'Before, after, during, while, until, and since',
    wordIds: ['bbct-before', 'bbct-after', 'bbct-during', 'bbct-while', 'bbct-until', 'bbct-since'],
    order: 6,
    unlockAfter: 'connector_logic_01',
  },
  {
    id: 'prefix_basics_01',
    sectionId: 'meaning_builders',
    title: 'Prefix Basics',
    theme: 'prefixes',
    description: 'To, from, in, and like',
    wordIds: ['bb-le', 'bb-mi-prefix', 'bb-be', 'bb-kmo'],
    order: 7,
    unlockAfter: 'sequence_words_01',
  },
  {
    id: 'definite_article_01',
    sectionId: 'meaning_builders',
    title: 'Definite Article',
    theme: 'article',
    description: 'The (ha-) and how it works',
    wordIds: ['bb-ha-sefer', 'bb-ha-bayit', 'bb-ha-yeled', 'bb-ha-yaldah'],
    order: 8,
    unlockAfter: 'prefix_basics_01',
  },
  {
    id: 'quantity_words_01',
    sectionId: 'meaning_builders',
    title: 'Quantity Words',
    theme: 'quantity',
    description: 'Many, few, all, and every',
    wordIds: ['bb-harbeh', 'bb-meat', 'bb-kol', 'bb-kol-echad'],
    order: 9,
    unlockAfter: 'definite_article_01',
  },
  {
    id: 'indefinite_reference_01',
    sectionId: 'meaning_builders',
    title: 'Indefinite Reference',
    theme: 'quantity',
    description: 'Something, nothing, and everything',
    wordIds: ['bbct-something', 'bbct-nothing', 'bbct-everything'],
    order: 10,
    unlockAfter: 'quantity_words_01',
  },
  {
    id: 'useful_chunks_01',
    sectionId: 'meaning_builders',
    title: 'Useful Chunks',
    theme: 'chunks',
    description: 'Common phrases and expressions',
    wordIds: ['bb-mah-nishma', 'bb-beseder', 'bb-yalla', 'bb-sababa'],
    order: 11,
    unlockAfter: 'indefinite_reference_01',
  },
  {
    id: 'word_variations_01',
    sectionId: 'meaning_builders',
    title: 'Word Variations',
    theme: 'variations',
    description: 'Masculine, feminine, and plural forms',
    wordIds: ['bb-yeled', 'bb-yaldah', 'bb-yeladim', 'bb-yeladot'],
    order: 12,
    unlockAfter: 'useful_chunks_01',
  },
  /* ═══════════════════════════════════════════════════════════
     Section 5: Cafe Talk
     ═══════════════════════════════════════════════════════════ */
  {
    id: 'cafe_talk_softeners_01',
    sectionId: 'cafe_talk',
    title: 'Cafe Talk: Softeners',
    theme: 'cafe_talk',
    description: 'Well, actually, maybe, probably, basically, and anyway',
    wordIds: ['bbct-well', 'bbct-actually', 'bbct-maybe', 'bbct-probably', 'bbct-basically', 'bbct-anyway'],
    supportWordIds: ['bb-ken', 'bb-lo', 'bb-ulai'],
    order: 1,
    unlockAfter: null,
  },
  {
    id: 'cafe_talk_nuance_01',
    sectionId: 'cafe_talk',
    title: 'Cafe Talk: Nuance',
    theme: 'cafe_talk',
    description: 'Still, yet, just, even, already, and almost',
    wordIds: ['bbct-still', 'bbct-yet', 'bbct-just', 'bbct-even', 'bbct-already', 'bbct-almost'],
    supportWordIds: ['bb-ve', 'bb-aval'],
    order: 2,
    unlockAfter: 'cafe_talk_softeners_01',
  },
  {
    id: 'cafe_talk_frequency_tone_01',
    sectionId: 'cafe_talk',
    title: 'Cafe Talk: Frequency & Tone',
    theme: 'cafe_talk',
    description: 'Always, never, sometimes, often, and quite',
    wordIds: ['bbct-always', 'bbct-never', 'bbct-sometimes', 'bbct-often', 'bbct-quite'],
    supportWordIds: ['bb-hayom', 'bb-machar'],
    order: 3,
    unlockAfter: 'cafe_talk_nuance_01',
  },
];

function inferPrimaryType(pack) {
  const title = `${pack.title} ${pack.theme}`.toLowerCase();
  if (title.includes('connector') || title.includes('logic') || title.includes('function')) {
    return 'connector';
  }
  if (title.includes('verb') || title.includes('action') || title.includes('process')) return 'verb';
  if (title.includes('phrase') || title.includes('conversation') || title.includes('chunk') || title.includes('cafe talk')) return 'phrase';
  return 'mixed';
}

function inferGoalTags(pack) {
  const title = `${pack.title} ${pack.theme}`.toLowerCase();
  if (title.includes('connector') || title.includes('logic') || title.includes('function')) {
    return ['connect-ideas', 'sound-natural'];
  }
  if (title.includes('question')) return ['ask-questions', 'daily-talk'];
  if (title.includes('time') || title.includes('sequence')) return ['time-and-sequence', 'daily-talk'];
  if (title.includes('emotion') || title.includes('feeling')) return ['express-feelings', 'sound-natural'];
  return ['daily-talk'];
}

function inferDifficultyBand(pack) {
  if (pack.sectionId === 'foundations') return 'Starter';
  if (pack.sectionId === 'cafe_talk' || pack.sectionId === 'meaning_builders') return 'Advanced';
  return 'Core';
}

function estimatePackTime(pack) {
  const targetsNewCount = Math.max(1, Math.min(pack.wordIds.length, 6));
  const supportReviewCount = pack.supportWordIds?.length ?? Math.max(0, pack.wordIds.length - targetsNewCount);
  const baseOverhead = 20;
  const avgStepSec = 7;
  const reviewStepSec = 4;
  const exerciseStepsPerTarget = 4;
  return {
    targetsNewCount,
    supportReviewCount,
    estimatedTimeSec: baseOverhead + (targetsNewCount * exerciseStepsPerTarget * avgStepSec) + (supportReviewCount * reviewStepSec),
  };
}

for (const pack of bridgeBuilderPacks) {
  const derivedTime = estimatePackTime(pack);
  pack.primaryType = pack.primaryType || inferPrimaryType(pack);
  pack.goalTags = pack.goalTags || inferGoalTags(pack);
  pack.difficultyBand = pack.difficultyBand || inferDifficultyBand(pack);
  pack.estimatedTimeSec = pack.estimatedTimeSec || derivedTime.estimatedTimeSec;
  pack.targetsNewCount = pack.targetsNewCount || derivedTime.targetsNewCount;
  pack.supportReviewCount = pack.supportReviewCount || derivedTime.supportReviewCount;
  pack.whyItMatters = pack.whyItMatters || `Builds ${pack.title.toLowerCase()} fluency for real conversations.`;
}

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
