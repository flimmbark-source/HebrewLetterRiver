/**
 * Cafe Talk Factory
 * 
 * Helper functions to build Cafe Talk reading texts from lexicons.
 * This eliminates code duplication and ensures consistent structure.
 */

import { createReadingText } from '../common/helpers.js';
import { CAFE_TALK_CATEGORIES } from './cafeTalkCanonical.js';

/**
 * Build tokens array from word IDs and lexicon
 * @param {string[]} wordIds - Array of word IDs in order
 * @param {Object} lexicon - Lexicon mapping word ID to translated text
 * @param {Object} [vowelLayouts] - Optional: vowel layout IDs for Hebrew words
 * @returns {Array} Token array
 */
function buildTokensFromLexicon(wordIds, lexicon, vowelLayouts = null) {
  const tokens = wordIds.map(wordId => {
    const token = {
      type: 'word',
      text: lexicon[wordId],
      id: wordId
    };

    // Add vowelLayoutId if available (defensive: only if it exists)
    if (vowelLayouts && vowelLayouts[wordId]) {
      token.vowelLayoutId = vowelLayouts[wordId];
    }

    return token;
  });

  // Add punctuation at end
  tokens.push({ type: 'punct', text: '.' });

  return tokens;
}

/**
 * Build meaningKeys object from word IDs
 * @param {string[]} wordIds - Array of word IDs
 * @returns {Object} MeaningKeys mapping
 */
function buildMeaningKeys(wordIds) {
  const meaningKeys = {};
  wordIds.forEach(wordId => {
    meaningKeys[wordId] = `reading.meaning.${wordId}`;
  });
  return meaningKeys;
}

/**
 * Build translations object for a single app language
 *
 * The canonical value is the transliteration (what users type).
 * Transliterations must be provided for all practice languages.
 *
 * @param {string[]} wordIds - Array of word IDs
 * @param {Object} appLangLexicon - Lexicon for the app language (used for variants)
 * @param {Object} transliterationSource - Transliterations for typing
 * @returns {Object} Translations object for one language
 */
function buildTranslationsForLanguage(wordIds, appLangLexicon, transliterationSource) {
  const translations = {};
  wordIds.forEach(wordId => {
    // Canonical is always the transliteration (what users type)
    const canonical = transliterationSource[wordId];
    const variants = [canonical];

    // Add the app language meaning translation as a variant (helps typing validation)
    const appLangVariant = appLangLexicon[wordId];
    if (appLangVariant && appLangVariant !== canonical) {
      variants.push(appLangVariant);
    }

    translations[wordId] = {
      canonical,
      variants: [...new Set(variants)]
    };
  });
  return translations;
}

/**
 * Build a complete Cafe Talk reading text from category and lexicons
 * @param {string} categoryId - Category ID (e.g., 'conversationGlue')
 * @param {string} practiceLanguage - Practice language ID
 * @param {Object} practiceLexicon - Lexicon for practice language
 * @param {Object} titles - Title translations {en, es, fr, he, ...}
 * @param {Object} subtitles - Subtitle translations {en, es, fr, he, ...}
 * @param {Object} [i18nLexicons] - Optional: lexicons mapped by i18n codes (en, es, fr, etc.) for app language translations
 * @param {Object} [transliterations] - Optional: practice language transliterations for typing validation
 * @param {Object} [vowelLayouts] - Optional: vowel layout IDs for Hebrew words
 * @returns {Object} Reading text object
 */
export function buildCafeTalkText(categoryId, practiceLanguage, practiceLexicon, titles, subtitles, i18nLexicons = null, transliterations = null, vowelLayouts = null) {
  const category = CAFE_TALK_CATEGORIES[categoryId];

  if (!category) {
    throw new Error(`Unknown Cafe Talk category: ${categoryId}`);
  }

  const { wordIds } = category;

  // Build translations object
  // Translations use i18n language codes (en, es, fr, etc.) NOT internal IDs (english, spanish, etc.)
  // Transliterations are required for all practice languages
  const transliterationSource = transliterations || practiceLexicon;
  let translations = {};
  if (i18nLexicons) {
    // Build translations for all app languages using i18n codes
    Object.keys(i18nLexicons).forEach(i18nCode => {
      translations[i18nCode] = buildTranslationsForLanguage(
        wordIds,
        i18nLexicons[i18nCode],
        transliterationSource
      );
    });
  } else {
    // Fallback: just use practice language lexicon with 'en' key
    translations['en'] = buildTranslationsForLanguage(
      wordIds,
      practiceLexicon,
      transliterationSource
    );
  }

  // Extract sectionId if provided in the category object (used by buildAllCafeTalkTexts)
  // Otherwise default to cafeTalk for backward compatibility
  const categoryData = CAFE_TALK_CATEGORIES[categoryId];
  const sectionPrefix = categoryData?.sectionId || 'cafeTalk';

  return createReadingText({
    id: `${sectionPrefix}.${categoryId}`,
    title: titles,
    subtitle: subtitles,
    practiceLanguage,
    tokens: buildTokensFromLexicon(wordIds, practiceLexicon, vowelLayouts),
    meaningKeys: buildMeaningKeys(wordIds),
    translations,
    sectionId: sectionPrefix
  });
}

/**
 * Build all Cafe Talk texts for a language (now with descriptive names)
 * @param {string} practiceLanguage - Practice language ID
 * @param {Object} practiceLexicon - Lexicon for practice language
 * @param {Object} [i18nLexicons] - Optional: lexicons mapped by i18n codes for all app languages
 * @param {Object} [transliterations] - Optional: practice language transliterations for typing validation
 * @param {Object} [vowelLayouts] - Optional: vowel layout IDs for Hebrew words
 * @returns {Array} Array of reading text objects for all chunks
 */
export function buildAllCafeTalkTexts(practiceLanguage, practiceLexicon, i18nLexicons = null, transliterations = null, vowelLayouts = null) {
  // Define titles and subtitles for each specific card
  // These are hardcoded multilingual strings (not from lexicons)
  const cardMetadata = {
    // Conversation Glue section
    basicConnectors: {
      titles: {
        en: 'Basic Connectors',
        es: 'Conectores Básicos',
        fr: 'Connecteurs de Base',
        ar: 'روابط أساسية',
        pt: 'Conectores Básicos',
        ru: 'Основные связки',
        ja: '基本的な接続詞',
        zh: '基本连接词',
        hi: 'बुनियादी संयोजक',
        bn: 'মৌলিক সংযোজক',
        am: 'መሰረታዊ ማገናኛዎች',
        he: 'מקשרים בסיסיים'
      },
      subtitles: {
        en: 'Essential words to connect thoughts',
        es: 'Palabras esenciales para conectar ideas',
        fr: 'Mots essentiels pour relier les pensées',
        ar: 'كلمات أساسية لربط الأفكار',
        pt: 'Palavras essenciais para conectar ideias',
        ru: 'Основные слова для связи мыслей',
        ja: '考えをつなぐ基本的な言葉',
        zh: '连接思想的基本词汇',
        hi: 'विचारों को जोड़ने के लिए आवश्यक शब्द',
        bn: 'চিন্তা সংযুক্ত করার জন্য প্রয়োজনীয় শব্দ',
        am: 'ሀሳቦችን ለማገናኘት አስፈላጊ ቃላት',
        he: 'מילים חיוניות לחיבור מחשבות'
      }
    },
    discourseMarkers: {
      titles: {
        en: 'Discourse Markers',
        es: 'Marcadores Discursivos',
        fr: 'Marqueurs du Discours',
        ar: 'علامات الخطاب',
        pt: 'Marcadores Discursivos',
        ru: 'Дискурсивные маркеры',
        ja: '談話標識',
        zh: '话语标记',
        hi: 'प्रवचन चिह्नक',
        bn: 'বক্তৃতা চিহ্নিতকারী',
        am: 'የንግግር ምልክቶች',
        he: 'סמני שיח'
      },
      subtitles: {
        en: 'Words that structure conversations',
        es: 'Palabras que estructuran conversaciones',
        fr: 'Mots qui structurent les conversations',
        ar: 'كلمات تنظم المحادثات',
        pt: 'Palavras que estruturam conversas',
        ru: 'Слова, структурирующие разговор',
        ja: '会話を構造化する言葉',
        zh: '构建对话的词汇',
        hi: 'बातचीत को संरचित करने वाले शब्द',
        bn: 'কথোপকথন গঠন করে এমন শব্দ',
        am: 'ውይይቶችን የሚያዋቅሩ ቃላት',
        he: 'מילים שמבנות שיחות'
      }
    },
    logicalConnectors: {
      titles: {
        en: 'Logical Connectors',
        es: 'Conectores Lógicos',
        fr: 'Connecteurs Logiques',
        ar: 'روابط منطقية',
        pt: 'Conectores Lógicos',
        ru: 'Логические связки',
        ja: '論理的接続詞',
        zh: '逻辑连接词',
        hi: 'तार्किक संयोजक',
        bn: 'যৌক্তিক সংযোজক',
        am: 'አመክንዮአዊ ማገናኛዎች',
        he: 'מקשרים לוגיים'
      },
      subtitles: {
        en: 'Words showing cause and consequence',
        es: 'Palabras que muestran causa y consecuencia',
        fr: 'Mots montrant cause et conséquence',
        ar: 'كلمات تظهر السبب والنتيجة',
        pt: 'Palavras que mostram causa e consequência',
        ru: 'Слова, показывающие причину и следствие',
        ja: '原因と結果を示す言葉',
        zh: '显示因果关系的词汇',
        hi: 'कारण और परिणाम दिखाने वाले शब्द',
        bn: 'কারণ এবং পরিণাম প্রদর্শনকারী শব্দ',
        am: 'ምክንያትና ውጤትን የሚያሳዩ ቃላት',
        he: 'מילים המראות סיבה ותוצאה'
      }
    },
    qualifiersModifiers: {
      titles: {
        en: 'Qualifiers & Modifiers',
        es: 'Calificadores y Modificadores',
        fr: 'Qualificateurs et Modificateurs',
        ar: 'المؤهلات والمعدلات',
        pt: 'Qualificadores e Modificadores',
        ru: 'Квалификаторы и модификаторы',
        ja: '修飾語と限定詞',
        zh: '限定词和修饰词',
        hi: 'योग्यता और संशोधक',
        bn: 'যোগ্যতা এবং পরিবর্তক',
        am: 'መመዘኛዎችና ማሻሻያዎች',
        he: 'מגדירים ומתאמים'
      },
      subtitles: {
        en: 'Words that adjust meaning',
        es: 'Palabras que ajustan el significado',
        fr: 'Mots qui ajustent le sens',
        ar: 'كلمات تعدل المعنى',
        pt: 'Palavras que ajustam o significado',
        ru: 'Слова, корректирующие значение',
        ja: '意味を調整する言葉',
        zh: '调整含义的词汇',
        hi: 'अर्थ को समायोजित करने वाले शब्द',
        bn: 'অর্থ সমন্বয়কারী শব্দ',
        am: 'ትርጉምን የሚያስተካክሉ ቃላት',
        he: 'מילים המתאימות משמעות'
      }
    },

    // Time & Sequencing section
    presentTransitions: {
      titles: {
        en: 'Present & Transitions',
        es: 'Presente y Transiciones',
        fr: 'Présent et Transitions',
        ar: 'الحاضر والانتقالات',
        pt: 'Presente e Transições',
        ru: 'Настоящее и переходы',
        ja: '現在と移行',
        zh: '现在和过渡',
        hi: 'वर्तमान और संक्रमण',
        bn: 'বর্তমান এবং রূপান্তর',
        am: 'አሁን እና ሽግግሮች',
        he: 'הווה ומעברים'
      },
      subtitles: {
        en: 'Current time and sequential words',
        es: 'Tiempo actual y palabras secuenciales',
        fr: 'Temps actuel et mots séquentiels',
        ar: 'الوقت الحالي والكلمات التسلسلية',
        pt: 'Tempo atual e palavras sequenciais',
        ru: 'Текущее время и последовательные слова',
        ja: '現在時刻と順序を示す言葉',
        zh: '当前时间和顺序词汇',
        hi: 'वर्तमान समय और क्रमिक शब्द',
        bn: 'বর্তমান সময় এবং ক্রমিক শব্দ',
        am: 'የአሁን ጊዜ እና ተከታታይ ቃላት',
        he: 'זמן נוכחי ומילים רציפות'
      }
    },
    timeReferences: {
      titles: {
        en: 'Time References',
        es: 'Referencias de Tiempo',
        fr: 'Références Temporelles',
        ar: 'مراجع الوقت',
        pt: 'Referências de Tempo',
        ru: 'Временные ссылки',
        ja: '時間の参照',
        zh: '时间参考',
        hi: 'समय संदर्भ',
        bn: 'সময় উল্লেখ',
        am: 'የጊዜ ማጣቀሻዎች',
        he: 'הפניות זמן'
      },
      subtitles: {
        en: 'Specific points in time',
        es: 'Puntos específicos en el tiempo',
        fr: 'Points spécifiques dans le temps',
        ar: 'نقاط محددة في الوقت',
        pt: 'Pontos específicos no tempo',
        ru: 'Конкретные моменты времени',
        ja: '時間の特定の点',
        zh: '时间中的特定点',
        hi: 'समय में विशिष्ट बिंदु',
        bn: 'সময়ের নির্দিষ্ট পয়েন্ট',
        am: 'በጊዜ ውስጥ ልዩ ነጥቦች',
        he: 'נקודות זמן ספציפיות'
      }
    },
    frequencyTiming: {
      titles: {
        en: 'Frequency & Timing',
        es: 'Frecuencia y Temporización',
        fr: 'Fréquence et Timing',
        ar: 'التكرار والتوقيت',
        pt: 'Frequência e Tempo',
        ru: 'Частота и время',
        ja: '頻度とタイミング',
        zh: '频率和时机',
        hi: 'आवृत्ति और समय',
        bn: 'ফ্রিকোয়েন্সি এবং সময়',
        am: 'ድግግሞሽ እና ጊዜ',
        he: 'תדירות ותזמון'
      },
      subtitles: {
        en: 'How often things happen',
        es: 'Con qué frecuencia ocurren las cosas',
        fr: 'À quelle fréquence les choses se produisent',
        ar: 'كم مرة تحدث الأشياء',
        pt: 'Com que frequência as coisas acontecem',
        ru: 'Как часто происходят события',
        ja: '物事がどのくらいの頻度で起こるか',
        zh: '事情发生的频率',
        hi: 'चीजें कितनी बार होती हैं',
        bn: 'কত ঘন ঘন ঘটনা ঘটে',
        am: 'ነገሮች ምን ያህል ጊዜ እንደሚከሰቱ',
        he: 'כמה פעמים דברים קורים'
      }
    },

    // People Words section
    personalPronouns: {
      titles: {
        en: 'Personal Pronouns',
        es: 'Pronombres Personales',
        fr: 'Pronoms Personnels',
        ar: 'الضمائر الشخصية',
        pt: 'Pronomes Pessoais',
        ru: 'Личные местоимения',
        ja: '人称代名詞',
        zh: '人称代词',
        hi: 'व्यक्तिगत सर्वनाम',
        bn: 'ব্যক্তিগত সর্বনাম',
        am: 'የግል ተውላጠ ስሞች',
        he: 'כינויי גוף'
      },
      subtitles: {
        en: 'Basic references to people',
        es: 'Referencias básicas a personas',
        fr: 'Références de base aux personnes',
        ar: 'إشارات أساسية للأشخاص',
        pt: 'Referências básicas a pessoas',
        ru: 'Основные обращения к людям',
        ja: '人への基本的な言及',
        zh: '对人的基本指称',
        hi: 'लोगों के बुनियादी संदर्भ',
        bn: 'মানুষের প্রাথমিক উল্লেখ',
        am: 'ለሰዎች መሰረታዊ ማጣቀሻዎች',
        he: 'התייחסויות בסיסיות לאנשים'
      }
    },
    peopleReferences: {
      titles: {
        en: 'People References',
        es: 'Referencias a Personas',
        fr: 'Références aux Personnes',
        ar: 'مراجع الأشخاص',
        pt: 'Referências a Pessoas',
        ru: 'Ссылки на людей',
        ja: '人への言及',
        zh: '人物指称',
        hi: 'लोगों के संदर्भ',
        bn: 'মানুষের উল্লেখ',
        am: 'የሰዎች ማጣቀሻዎች',
        he: 'התייחסויות לאנשים'
      },
      subtitles: {
        en: 'General ways to refer to people',
        es: 'Formas generales de referirse a personas',
        fr: 'Façons générales de faire référence aux personnes',
        ar: 'طرق عامة للإشارة إلى الأشخاص',
        pt: 'Maneiras gerais de se referir a pessoas',
        ru: 'Общие способы обращения к людям',
        ja: '人を指す一般的な方法',
        zh: '指称人的一般方式',
        hi: 'लोगों को संदर्भित करने के सामान्य तरीके',
        bn: 'মানুষকে উল্লেখ করার সাধারণ উপায়',
        am: 'ሰዎችን ለመጥቀስ አጠቃላይ መንገዶች',
        he: 'דרכים כלליות להתייחס לאנשים'
      }
    },
    socialRoles: {
      titles: {
        en: 'Social Roles',
        es: 'Roles Sociales',
        fr: 'Rôles Sociaux',
        ar: 'الأدوار الاجتماعية',
        pt: 'Papéis Sociais',
        ru: 'Социальные роли',
        ja: '社会的役割',
        zh: '社会角色',
        hi: 'सामाजिक भूमिकाएं',
        bn: 'সামাজিক ভূমিকা',
        am: 'ማህበራዊ ሚናዎች',
        he: 'תפקידים חברתיים'
      },
      subtitles: {
        en: 'Relationships and types of people',
        es: 'Relaciones y tipos de personas',
        fr: 'Relations et types de personnes',
        ar: 'العلاقات وأنواع الأشخاص',
        pt: 'Relacionamentos e tipos de pessoas',
        ru: 'Отношения и типы людей',
        ja: '関係と人のタイプ',
        zh: '关系和人的类型',
        hi: 'संबंध और लोगों के प्रकार',
        bn: 'সম্পর্ক এবং মানুষের ধরন',
        am: 'ግንኙነቶች እና የሰዎች ዓይነቶች',
        he: 'קשרים וסוגי אנשים'
      }
    },

    // Core Story Verbs section
    communicationPerception: {
      titles: {
        en: 'Communication & Perception',
        es: 'Comunicación y Percepción',
        fr: 'Communication et Perception',
        ar: 'التواصل والإدراك',
        pt: 'Comunicação e Percepção',
        ru: 'Коммуникация и восприятие',
        ja: 'コミュニケーションと知覚',
        zh: '沟通和感知',
        hi: 'संचार और धारणा',
        bn: 'যোগাযোগ এবং উপলব্ধি',
        am: 'ግንኙነት እና ግንዛቤ',
        he: 'תקשורת ותפיסה'
      },
      subtitles: {
        en: 'Verbs for talking and sensing',
        es: 'Verbos para hablar y sentir',
        fr: 'Verbes pour parler et percevoir',
        ar: 'أفعال للتحدث والشعور',
        pt: 'Verbos para falar e sentir',
        ru: 'Глаголы для разговора и восприятия',
        ja: '話すことと感じることの動詞',
        zh: '说话和感知的动词',
        hi: 'बात करने और महसूस करने के लिए क्रियाएं',
        bn: 'কথা বলা এবং অনুভব করার ক্রিয়া',
        am: 'ለመነጋገር እና ለመሰማት ግሶች',
        he: 'פעלים לדיבור וחישה'
      }
    },
    emotionsCreation: {
      titles: {
        en: 'Emotions & Creation',
        es: 'Emociones y Creación',
        fr: 'Émotions et Création',
        ar: 'العواطف والإبداع',
        pt: 'Emoções e Criação',
        ru: 'Эмоции и создание',
        ja: '感情と創造',
        zh: '情感和创造',
        hi: 'भावनाएं और रचना',
        bn: 'আবেগ এবং সৃষ্টি',
        am: 'ስሜቶች እና ፍጥረት',
        he: 'רגשות ויצירה'
      },
      subtitles: {
        en: 'Verbs for feelings and making',
        es: 'Verbos para sentimientos y creación',
        fr: 'Verbes pour les sentiments et la création',
        ar: 'أفعال للمشاعر والصنع',
        pt: 'Verbos para sentimentos e criação',
        ru: 'Глаголы для чувств и создания',
        ja: '感情と作ることの動詞',
        zh: '感受和创造的动词',
        hi: 'भावनाओं और बनाने के लिए क्रियाएं',
        bn: 'অনুভূতি এবং তৈরির ক্রিয়া',
        am: 'ስሜቶችን እና መፍጠርን ለማሳየት ግሶች',
        he: 'פעלים לרגשות ויצירה'
      }
    },
    actionVerbs: {
      titles: {
        en: 'Action Verbs',
        es: 'Verbos de Acción',
        fr: 'Verbes d\'Action',
        ar: 'أفعال الحركة',
        pt: 'Verbos de Ação',
        ru: 'Глаголы действия',
        ja: '動作動詞',
        zh: '动作动词',
        hi: 'क्रिया क्रियाएं',
        bn: 'ক্রিয়া ক্রিয়া',
        am: 'የድርጊት ግሶች',
        he: 'פעלי פעולה'
      },
      subtitles: {
        en: 'Essential verbs for doing',
        es: 'Verbos esenciales para hacer',
        fr: 'Verbes essentiels pour faire',
        ar: 'أفعال أساسية للفعل',
        pt: 'Verbos essenciais para fazer',
        ru: 'Основные глаголы для действия',
        ja: '行うための基本動詞',
        zh: '做事的基本动词',
        hi: 'करने के लिए आवश्यक क्रियाएं',
        bn: 'করার জন্য প্রয়োজনীয় ক্রিয়া',
        am: 'ለማድረግ አስፈላጊ ግሶች',
        he: 'פעלים חיוניים לעשייה'
      }
    },

    // Life Logistics section
    dailyRoutines: {
      titles: {
        en: 'Daily Routines',
        es: 'Rutinas Diarias',
        fr: 'Routines Quotidiennes',
        ar: 'الروتين اليومي',
        pt: 'Rotinas Diárias',
        ru: 'Ежедневные рутины',
        ja: '日常のルーティン',
        zh: '日常例行公事',
        hi: 'दैनिक दिनचर्या',
        bn: 'দৈনন্দিন রুটিন',
        am: 'የዕለት ተዕለት ተግባራት',
        he: 'שגרה יומית'
      },
      subtitles: {
        en: 'Everyday activities and places',
        es: 'Actividades y lugares cotidianos',
        fr: 'Activités et lieux quotidiens',
        ar: 'الأنشطة والأماكن اليومية',
        pt: 'Atividades e lugares cotidianos',
        ru: 'Повседневные занятия и места',
        ja: '日常の活動と場所',
        zh: '日常活动和地点',
        hi: 'रोजमर्रा की गतिविधियां और स्थान',
        bn: 'প্রতিদিনের কার্যকলাপ এবং স্থান',
        am: 'የዕለት ተዕለት እንቅስቃሴዎች እና ቦታዎች',
        he: 'פעילויות ומקומות יומיומיים'
      }
    },
    timeResources: {
      titles: {
        en: 'Time & Resources',
        es: 'Tiempo y Recursos',
        fr: 'Temps et Ressources',
        ar: 'الوقت والموارد',
        pt: 'Tempo e Recursos',
        ru: 'Время и ресурсы',
        ja: '時間とリソース',
        zh: '时间和资源',
        hi: 'समय और संसाधन',
        bn: 'সময় এবং সম্পদ',
        am: 'ጊዜ እና ሀብቶች',
        he: 'זמן ומשאבים'
      },
      subtitles: {
        en: 'Essential concepts for planning',
        es: 'Conceptos esenciales para planificar',
        fr: 'Concepts essentiels pour la planification',
        ar: 'مفاهيم أساسية للتخطيط',
        pt: 'Conceitos essenciais para planejamento',
        ru: 'Основные концепции для планирования',
        ja: '計画のための基本概念',
        zh: '计划的基本概念',
        hi: 'योजना बनाने के लिए आवश्यक अवधारणाएं',
        bn: 'পরিকল্পনার জন্য প্রয়োজনীয় ধারণা',
        am: 'ለእቅድ ማውጣት አስፈላጊ ፅንሰ-ሀሳቦች',
        he: 'מושגים חיוניים לתכנון'
      }
    },
    actionsMovement: {
      titles: {
        en: 'Actions & Movement',
        es: 'Acciones y Movimiento',
        fr: 'Actions et Mouvement',
        ar: 'الأفعال والحركة',
        pt: 'Ações e Movimento',
        ru: 'Действия и движение',
        ja: '行動と動き',
        zh: '动作和移动',
        hi: 'क्रियाएं और गति',
        bn: 'ক্রিয়া এবং চলাচল',
        am: 'ድርጊቶች እና እንቅስቃሴ',
        he: 'פעולות ותנועה'
      },
      subtitles: {
        en: 'Verbs for getting things done',
        es: 'Verbos para lograr cosas',
        fr: 'Verbes pour accomplir les choses',
        ar: 'أفعال لإنجاز الأشياء',
        pt: 'Verbos para realizar coisas',
        ru: 'Глаголы для выполнения дел',
        ja: '物事を成し遂げる動詞',
        zh: '完成事情的动词',
        hi: 'काम पूरा करने के लिए क्रियाएं',
        bn: 'কাজ সম্পন্ন করার ক্রিয়া',
        am: 'ነገሮችን ለማጠናቀቅ ግሶች',
        he: 'פעלים לביצוע דברים'
      }
    },

    // Reactions & Feelings section
    basicEmotions: {
      titles: {
        en: 'Basic Emotions',
        es: 'Emociones Básicas',
        fr: 'Émotions de Base',
        ar: 'المشاعر الأساسية',
        pt: 'Emoções Básicas',
        ru: 'Основные эмоции',
        ja: '基本的な感情',
        zh: '基本情绪',
        hi: 'बुनियादी भावनाएं',
        bn: 'মৌলিক আবেগ',
        am: 'መሰረታዊ ስሜቶች',
        he: 'רגשות בסיסיים'
      },
      subtitles: {
        en: 'Core emotional states',
        es: 'Estados emocionales centrales',
        fr: 'États émotionnels fondamentaux',
        ar: 'الحالات العاطفية الأساسية',
        pt: 'Estados emocionais centrais',
        ru: 'Основные эмоциональные состояния',
        ja: '核心的な感情状態',
        zh: '核心情绪状态',
        hi: 'मुख्य भावनात्मक अवस्थाएं',
        bn: 'মূল আবেগজনিত অবস্থা',
        am: 'ዋና የስሜት ሁኔታዎች',
        he: 'מצבים רגשיים מרכזיים'
      }
    },
    statesOfBeing: {
      titles: {
        en: 'States of Being',
        es: 'Estados del Ser',
        fr: 'États d\'Être',
        ar: 'حالات الوجود',
        pt: 'Estados do Ser',
        ru: 'Состояния бытия',
        ja: '存在の状態',
        zh: '存在状态',
        hi: 'होने की अवस्थाएं',
        bn: 'থাকার অবস্থা',
        am: 'የመሆን ሁኔታዎች',
        he: 'מצבי הוויה'
      },
      subtitles: {
        en: 'How you feel right now',
        es: 'Cómo te sientes ahora mismo',
        fr: 'Comment vous vous sentez maintenant',
        ar: 'كيف تشعر الآن',
        pt: 'Como você se sente agora',
        ru: 'Как вы себя чувствуете сейчас',
        ja: '今どう感じているか',
        zh: '你现在的感觉',
        hi: 'आप अभी कैसा महसूस करते हैं',
        bn: 'আপনি এখন কেমন অনুভব করছেন',
        am: 'አሁን እንዴት እንደሚሰማዎት',
        he: 'איך אתה מרגיש כרגע'
      }
    },
    descriptions: {
      titles: {
        en: 'Descriptions',
        es: 'Descripciones',
        fr: 'Descriptions',
        ar: 'الأوصاف',
        pt: 'Descrições',
        ru: 'Описания',
        ja: '説明',
        zh: '描述',
        hi: 'विवरण',
        bn: 'বর্ণনা',
        am: 'ገለጻዎች',
        he: 'תיאורים'
      },
      subtitles: {
        en: 'Words to describe people and things',
        es: 'Palabras para describir personas y cosas',
        fr: 'Mots pour décrire les personnes et les choses',
        ar: 'كلمات لوصف الأشخاص والأشياء',
        pt: 'Palavras para descrever pessoas e coisas',
        ru: 'Слова для описания людей и вещей',
        ja: '人や物を説明する言葉',
        zh: '描述人和事物的词汇',
        hi: 'लोगों और चीजों का वर्णन करने के लिए शब्द',
        bn: 'মানুষ এবং জিনিস বর্ণনা করার শব্দ',
        am: 'ሰዎችን እና ነገሮችን ለመግለጽ ቃላት',
        he: 'מילים לתאר אנשים ודברים'
      }
    },

    // Everyday Topics section
    commonObjects: {
      titles: {
        en: 'Common Objects',
        es: 'Objetos Comunes',
        fr: 'Objets Courants',
        ar: 'الأشياء الشائعة',
        pt: 'Objetos Comuns',
        ru: 'Обычные объекты',
        ja: '一般的な物',
        zh: '常见物品',
        hi: 'सामान्य वस्तुएं',
        bn: 'সাধারণ বস্তু',
        am: 'የተለመዱ ነገሮች',
        he: 'חפצים נפוצים'
      },
      subtitles: {
        en: 'Things you use every day',
        es: 'Cosas que usas todos los días',
        fr: 'Choses que vous utilisez tous les jours',
        ar: 'أشياء تستخدمها كل يوم',
        pt: 'Coisas que você usa todos os dias',
        ru: 'Вещи, которые вы используете каждый день',
        ja: '毎日使うもの',
        zh: '您每天使用的物品',
        hi: 'वे चीजें जिनका आप हर दिन उपयोग करते हैं',
        bn: 'আপনি প্রতিদিন যে জিনিসগুলি ব্যবহার করেন',
        am: 'በየቀኑ የሚጠቀሙባቸው ነገሮች',
        he: 'דברים שאתה משתמש בהם כל יום'
      }
    },
    placesConcepts: {
      titles: {
        en: 'Places & Concepts',
        es: 'Lugares y Conceptos',
        fr: 'Lieux et Concepts',
        ar: 'الأماكن والمفاهيم',
        pt: 'Lugares e Conceitos',
        ru: 'Места и концепции',
        ja: '場所と概念',
        zh: '地点和概念',
        hi: 'स्थान और अवधारणाएं',
        bn: 'স্থান এবং ধারণা',
        am: 'ቦታዎች እና ፅንሰ-ሀሳቦች',
        he: 'מקומות ומושגים'
      },
      subtitles: {
        en: 'Locations and ideas',
        es: 'Ubicaciones e ideas',
        fr: 'Emplacements et idées',
        ar: 'المواقع والأفكار',
        pt: 'Localizações e ideias',
        ru: 'Места и идеи',
        ja: '場所とアイデア',
        zh: '位置和想法',
        hi: 'स्थान और विचार',
        bn: 'স্থান এবং ধারণা',
        am: 'ቦታዎች እና ሀሳቦች',
        he: 'מיקומים ורעיונות'
      }
    },
    abstractTerms: {
      titles: {
        en: 'Abstract Terms',
        es: 'Términos Abstractos',
        fr: 'Termes Abstraits',
        ar: 'المصطلحات المجردة',
        pt: 'Termos Abstratos',
        ru: 'Абстрактные термины',
        ja: '抽象的な用語',
        zh: '抽象术语',
        hi: 'अमूर्त शब्द',
        bn: 'বিমূর্ত পদ',
        am: 'ረቂቅ ቃላት',
        he: 'מונחים מופשטים'
      },
      subtitles: {
        en: 'General concepts and ideas',
        es: 'Conceptos e ideas generales',
        fr: 'Concepts et idées générales',
        ar: 'المفاهيم والأفكار العامة',
        pt: 'Conceitos e ideias gerais',
        ru: 'Общие концепции и идеи',
        ja: '一般的な概念とアイデア',
        zh: '一般概念和想法',
        hi: 'सामान्य अवधारणाएं और विचार',
        bn: 'সাধারণ ধারণা এবং ধারণা',
        am: 'አጠቃላይ ፅንሰ-ሀሳቦች እና ሀሳቦች',
        he: 'מושגים ורעיונות כלליים'
      }
    },

    // Vowel Layout Practice section
    vowelLayoutBootcamp: {
      titles: {
        en: 'Vowel Layout Bootcamp',
        es: 'Bootcamp de Patrones Vocálicos',
        fr: 'Bootcamp des Modèles de Voyelles',
        ar: 'معسكر تدريب أنماط حروف العلة',
        pt: 'Bootcamp de Padrões Vocálicos',
        ru: 'Тренировка гласных паттернов',
        ja: '母音パターンブートキャンプ',
        zh: '元音模式训练营',
        hi: 'स्वर पैटर्न प्रशिक्षण शिविर',
        bn: 'স্বরবর্ণ প্যাটার্ন বুটক্যাম্প',
        am: 'የድምፀ ቃላት ስርዓት ስልጠና',
        he: 'מחנה אימון תבניות תנועות'
      },
      subtitles: {
        en: 'Practice 3 vowel patterns with repetition',
        es: 'Practica 3 patrones vocálicos con repetición',
        fr: 'Pratiquez 3 modèles de voyelles avec répétition',
        ar: 'تدرب على 3 أنماط من حروف العلة بالتكرار',
        pt: 'Pratique 3 padrões vocálicos com repetição',
        ru: 'Практикуйте 3 паттерна гласных с повторением',
        ja: '3つの母音パターンを繰り返し練習',
        zh: '重复练习3种元音模式',
        hi: '3 स्वर पैटर्न को दोहराव के साथ अभ्यास करें',
        bn: 'পুনরাবৃত্তি সহ 3টি স্বর প্যাটার্ন অনুশীলন করুন',
        am: '3 የድምፀ ቃላት ስርዓቶችን በድግግሞሽ ይለማመዱ',
        he: 'תרגל 3 תבניות תנועות עם חזרות'
      }
    }
  };

  const results = [];

  // Build reading texts for all cards
  Object.keys(CAFE_TALK_CATEGORIES).forEach(categoryId => {
    const category = CAFE_TALK_CATEGORIES[categoryId];
    const { sectionId, wordIds } = category;
    const metadata = cardMetadata[categoryId];

    if (!metadata) {
      console.warn(`No metadata found for category: ${categoryId}`);
      return;
    }

    const readingText = buildCafeTalkText(
      categoryId,
      practiceLanguage,
      practiceLexicon,
      metadata.titles,
      metadata.subtitles,
      i18nLexicons,
      transliterations,
      vowelLayouts
    );

    results.push(readingText);
  });

  return results;
}
