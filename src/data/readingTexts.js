/**
 * Reading texts for the Reading Area learn mode.
 * Each text is tokenized into words with translations/transliterations
 * for different language pairs.
 */

/**
 * Reading text structure:
 * {
 *   id: string - unique identifier
 *   title: { [appLang]: string } - title in different UI languages
 *   subtitle: { [appLang]: string } - description
 *   practiceLanguage: string - language of the practice text
 *   tokens: Array<{ type: 'word'|'punct', text: string, id?: string }>
 *   translations: {
 *     [appLang]: {
 *       [wordId]: {
 *         canonical: string - canonical translation
 *         variants: string[] - accepted variants
 *         optionalChars?: Array<{index: number, char: string}> - optional characters
 *       }
 *     }
 *   }
 * }
 */

// Hebrew practice texts
export const hebrewReadingTexts = [
  {
    id: 'hebrew-starter-words',
    title: {
      en: 'Starter Words (5)',
      he: 'מילים בסיסיות (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)'
    },
    subtitle: {
      en: 'Common Hebrew words',
      he: 'מילים עבריות נפוצות',
      es: 'Palabras hebreas comunes',
      fr: 'Mots hébreux courants',
      ar: 'كلمات عبرية شائعة',
      pt: 'Palavras hebraicas comuns',
      ru: 'Общие еврейские слова',
      ja: '一般的なヘブライ語の単語',
      zh: '常用希伯来语词汇',
      hi: 'सामान्य हिब्रू शब्द',
      bn: 'সাধারণ হিব্রু শব্দ',
      am: 'የተለመዱ የዕብራይስጥ ቃላት'
    },
    practiceLanguage: 'hebrew',
    tokens: [
      { type: 'word', text: 'שלום', id: 'shalom' },
      { type: 'word', text: 'תודה', id: 'todah' },
      { type: 'word', text: 'כן', id: 'ken' },
      { type: 'word', text: 'תורה', id: 'torah' },
      { type: 'word', text: 'אמת', id: 'emet' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        shalom: { canonical: 'shalom', variants: ['shalom'] },
        todah: { canonical: 'todah', variants: ['todah', 'toda'] },
        ken: { canonical: 'ken', variants: ['ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'emet', variants: ['emet'] }
      },
      he: {
        shalom: { canonical: 'שלום', variants: ['שלום'] },
        todah: { canonical: 'תודה', variants: ['תודה'] },
        ken: { canonical: 'כן', variants: ['כן'] },
        torah: { canonical: 'תורה', variants: ['תורה'] },
        emet: { canonical: 'אמת', variants: ['אמת'] }
      },
      es: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'paz'] },
        todah: { canonical: 'gracias', variants: ['gracias', 'todah'] },
        ken: { canonical: 'si', variants: ['si', 'sí', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'verdad', variants: ['verdad', 'emet'] }
      },
      fr: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'paix'] },
        todah: { canonical: 'merci', variants: ['merci', 'todah'] },
        ken: { canonical: 'oui', variants: ['oui', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'verite', variants: ['verite', 'vérité', 'emet'] }
      },
      ar: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'سلام'] },
        todah: { canonical: 'todah', variants: ['todah', 'شكرا'] },
        ken: { canonical: 'ken', variants: ['ken', 'نعم'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'emet', variants: ['emet', 'حقيقة'] }
      },
      pt: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'paz'] },
        todah: { canonical: 'obrigado', variants: ['obrigado', 'todah'] },
        ken: { canonical: 'sim', variants: ['sim', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'verdade', variants: ['verdade', 'emet'] }
      },
      ru: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'мир'] },
        todah: { canonical: 'spasibo', variants: ['spasibo', 'todah'] },
        ken: { canonical: 'da', variants: ['da', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'pravda', variants: ['pravda', 'emet'] }
      },
      ja: {
        shalom: { canonical: 'shalom', variants: ['shalom', '平和'] },
        todah: { canonical: 'arigatou', variants: ['arigatou', 'todah'] },
        ken: { canonical: 'hai', variants: ['hai', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'shinjitsu', variants: ['shinjitsu', 'emet'] }
      },
      zh: {
        shalom: { canonical: 'shalom', variants: ['shalom', '和平'] },
        todah: { canonical: 'xiexie', variants: ['xiexie', 'todah'] },
        ken: { canonical: 'shi', variants: ['shi', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'zhenli', variants: ['zhenli', 'emet'] }
      },
      hi: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'shanti'] },
        todah: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'todah'] },
        ken: { canonical: 'haan', variants: ['haan', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'satya', variants: ['satya', 'emet'] }
      },
      bn: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'shanti'] },
        todah: { canonical: 'dhonnobad', variants: ['dhonnobad', 'todah'] },
        ken: { canonical: 'hyan', variants: ['hyan', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'satya', variants: ['satya', 'emet'] }
      },
      am: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'selam'] },
        todah: { canonical: 'ameseginalehu', variants: ['ameseginalehu', 'todah'] },
        ken: { canonical: 'awo', variants: ['awo', 'ken'] },
        torah: { canonical: 'torah', variants: ['torah', 'tora'] },
        emet: { canonical: 'emet', variants: ['emet'] }
      }
    },
    glosses: {
      en: {
        shalom: 'hello / peace',
        todah: 'thanks / thank you',
        ken: 'yes',
        torah: 'Torah / law',
        emet: 'truth'
      },
      he: {
        shalom: 'שלום / שלום',
        todah: 'תודה',
        ken: 'כן',
        torah: 'תורה',
        emet: 'אמת'
      },
      es: {
        shalom: 'hola / paz',
        todah: 'gracias',
        ken: 'sí',
        torah: 'Torá / ley',
        emet: 'verdad'
      },
      fr: {
        shalom: 'bonjour / paix',
        todah: 'merci',
        ken: 'oui',
        torah: 'Torah / loi',
        emet: 'vérité'
      },
      ar: {
        shalom: 'مرحبا / سلام',
        todah: 'شكرا',
        ken: 'نعم',
        torah: 'التوراة / القانون',
        emet: 'حقيقة'
      },
      pt: {
        shalom: 'olá / paz',
        todah: 'obrigado',
        ken: 'sim',
        torah: 'Torá / lei',
        emet: 'verdade'
      },
      ru: {
        shalom: 'привет / мир',
        todah: 'спасибо',
        ken: 'да',
        torah: 'Тора / закон',
        emet: 'правда'
      },
      ja: {
        shalom: 'こんにちは / 平和',
        todah: 'ありがとう',
        ken: 'はい',
        torah: 'トーラー / 律法',
        emet: '真実'
      },
      zh: {
        shalom: '你好 / 和平',
        todah: '谢谢',
        ken: '是',
        torah: '托拉 / 律法',
        emet: '真理'
      },
      hi: {
        shalom: 'नमस्ते / शांति',
        todah: 'धन्यवाद',
        ken: 'हाँ',
        torah: 'तोराह / कानून',
        emet: 'सत्य'
      },
      bn: {
        shalom: 'নমস্কার / শান্তি',
        todah: 'ধন্যবাদ',
        ken: 'হ্যাঁ',
        torah: 'তোরাহ / আইন',
        emet: 'সত্য'
      },
      am: {
        shalom: 'ሰላም / ሰላም',
        todah: 'አመሰግናለሁ',
        ken: 'አዎ',
        torah: 'ቶራ / ሕግ',
        emet: 'እውነት'
      }
    }
  },
  {
    id: 'hebrew-greetings',
    title: {
      en: 'Greetings (6)',
      he: 'ברכות (6)',
      es: 'Saludos (6)',
      fr: 'Salutations (6)',
      ar: 'تحيات (٦)',
      pt: 'Saudações (6)',
      ru: 'Приветствия (6)',
      ja: '挨拶 (6)',
      zh: '问候语 (6)',
      hi: 'अभिवादन (6)',
      bn: 'শুভেচ্ছা (৬)',
      am: 'ሰላምታዎች (6)'
    },
    subtitle: {
      en: 'Common Hebrew greetings',
      he: 'ברכות עבריות נפוצות',
      es: 'Saludos hebreos comunes',
      fr: 'Salutations hébraïques courantes',
      ar: 'التحيات العبرية الشائعة',
      pt: 'Saudações hebraicas comuns',
      ru: 'Общие еврейские приветствия',
      ja: '一般的なヘブライ語の挨拶',
      zh: '常用希伯来语问候语',
      hi: 'सामान्य हिब्रू अभिवादन',
      bn: 'সাধারণ হিব্রু শুভেচ্ছা',
      am: 'የተለመዱ የዕብራይስጥ ሰላምታዎች'
    },
    practiceLanguage: 'hebrew',
    tokens: [
      { type: 'word', text: 'שלום', id: 'shalom' },
      { type: 'word', text: 'בוקר', id: 'boker' },
      { type: 'word', text: 'טוב', id: 'tov' },
      { type: 'word', text: 'ערב', id: 'erev' },
      { type: 'word', text: 'טוב', id: 'tov2' },
      { type: 'word', text: 'להתראות', id: 'lehitraot' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'hello', 'peace'] },
        boker: { canonical: 'boker', variants: ['boker', 'morning'] },
        tov: { canonical: 'tov', variants: ['tov', 'good'] },
        erev: { canonical: 'erev', variants: ['erev', 'evening'] },
        tov2: { canonical: 'tov', variants: ['tov', 'good'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'goodbye', 'bye'] }
      },
      he: {
        shalom: { canonical: 'שלום', variants: ['שלום'] },
        boker: { canonical: 'בוקר', variants: ['בוקר'] },
        tov: { canonical: 'טוב', variants: ['טוב'] },
        erev: { canonical: 'ערב', variants: ['ערב'] },
        tov2: { canonical: 'טוב', variants: ['טוב'] },
        lehitraot: { canonical: 'להתראות', variants: ['להתראות'] }
      },
      es: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'hola'] },
        boker: { canonical: 'boker', variants: ['boker', 'manana', 'mañana'] },
        tov: { canonical: 'tov', variants: ['tov', 'bueno'] },
        erev: { canonical: 'erev', variants: ['erev', 'noche'] },
        tov2: { canonical: 'tov', variants: ['tov', 'bueno'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'adios', 'adiós'] }
      },
      fr: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'bonjour'] },
        boker: { canonical: 'boker', variants: ['boker', 'matin'] },
        tov: { canonical: 'tov', variants: ['tov', 'bon'] },
        erev: { canonical: 'erev', variants: ['erev', 'soir'] },
        tov2: { canonical: 'tov', variants: ['tov', 'bon'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'au revoir'] }
      },
      ar: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'مرحبا'] },
        boker: { canonical: 'boker', variants: ['boker', 'صباح'] },
        tov: { canonical: 'tov', variants: ['tov', 'جيد'] },
        erev: { canonical: 'erev', variants: ['erev', 'مساء'] },
        tov2: { canonical: 'tov', variants: ['tov', 'جيد'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'وداعا'] }
      },
      pt: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'ola', 'olá'] },
        boker: { canonical: 'boker', variants: ['boker', 'manha', 'manhã'] },
        tov: { canonical: 'tov', variants: ['tov', 'bom'] },
        erev: { canonical: 'erev', variants: ['erev', 'noite'] },
        tov2: { canonical: 'tov', variants: ['tov', 'bom'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'adeus'] }
      },
      ru: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'привет'] },
        boker: { canonical: 'boker', variants: ['boker', 'утро'] },
        tov: { canonical: 'tov', variants: ['tov', 'хороший'] },
        erev: { canonical: 'erev', variants: ['erev', 'вечер'] },
        tov2: { canonical: 'tov', variants: ['tov', 'хороший'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'до свидания'] }
      },
      ja: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'こんにちは'] },
        boker: { canonical: 'boker', variants: ['boker', '朝'] },
        tov: { canonical: 'tov', variants: ['tov', 'いい'] },
        erev: { canonical: 'erev', variants: ['erev', '夕'] },
        tov2: { canonical: 'tov', variants: ['tov', 'いい'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'さようなら'] }
      },
      zh: {
        shalom: { canonical: 'shalom', variants: ['shalom', '你好'] },
        boker: { canonical: 'boker', variants: ['boker', '早晨'] },
        tov: { canonical: 'tov', variants: ['tov', '好'] },
        erev: { canonical: 'erev', variants: ['erev', '晚上'] },
        tov2: { canonical: 'tov', variants: ['tov', '好'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', '再见'] }
      },
      hi: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'नमस्ते'] },
        boker: { canonical: 'boker', variants: ['boker', 'सुबह'] },
        tov: { canonical: 'tov', variants: ['tov', 'अच्छा'] },
        erev: { canonical: 'erev', variants: ['erev', 'शाम'] },
        tov2: { canonical: 'tov', variants: ['tov', 'अच्छा'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'अलविदा'] }
      },
      bn: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'নমস্কার'] },
        boker: { canonical: 'boker', variants: ['boker', 'সকাল'] },
        tov: { canonical: 'tov', variants: ['tov', 'ভালো'] },
        erev: { canonical: 'erev', variants: ['erev', 'সন্ধ্যা'] },
        tov2: { canonical: 'tov', variants: ['tov', 'ভালো'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'বিদায়'] }
      },
      am: {
        shalom: { canonical: 'shalom', variants: ['shalom', 'ሰላም'] },
        boker: { canonical: 'boker', variants: ['boker', 'ጠዋት'] },
        tov: { canonical: 'tov', variants: ['tov', 'ጥሩ'] },
        erev: { canonical: 'erev', variants: ['erev', 'ማታ'] },
        tov2: { canonical: 'tov', variants: ['tov', 'ጥሩ'] },
        lehitraot: { canonical: 'lehitraot', variants: ['lehitraot', 'ቻው'] }
      }
    },
    glosses: {
      en: {
        shalom: 'hello / peace',
        boker: 'morning',
        tov: 'good',
        erev: 'evening',
        tov2: 'good',
        lehitraot: 'goodbye'
      },
      he: {
        shalom: 'שלום',
        boker: 'בוקר',
        tov: 'טוב',
        erev: 'ערב',
        tov2: 'טוב',
        lehitraot: 'להתראות'
      },
      es: {
        shalom: 'hola / paz',
        boker: 'mañana',
        tov: 'bueno',
        erev: 'noche',
        tov2: 'bueno',
        lehitraot: 'adiós'
      },
      fr: {
        shalom: 'bonjour / paix',
        boker: 'matin',
        tov: 'bon',
        erev: 'soir',
        tov2: 'bon',
        lehitraot: 'au revoir'
      },
      ar: {
        shalom: 'مرحبا / سلام',
        boker: 'صباح',
        tov: 'جيد',
        erev: 'مساء',
        tov2: 'جيد',
        lehitraot: 'وداعا'
      },
      pt: {
        shalom: 'olá / paz',
        boker: 'manhã',
        tov: 'bom',
        erev: 'noite',
        tov2: 'bom',
        lehitraot: 'adeus'
      },
      ru: {
        shalom: 'привет / мир',
        boker: 'утро',
        tov: 'хороший',
        erev: 'вечер',
        tov2: 'хороший',
        lehitraot: 'до свидания'
      },
      ja: {
        shalom: 'こんにちは / 平和',
        boker: '朝',
        tov: 'いい',
        erev: '夕',
        tov2: 'いい',
        lehitraot: 'さようなら'
      },
      zh: {
        shalom: '你好 / 和平',
        boker: '早晨',
        tov: '好',
        erev: '晚上',
        tov2: '好',
        lehitraot: '再见'
      },
      hi: {
        shalom: 'नमस्ते / शांति',
        boker: 'सुबह',
        tov: 'अच्छा',
        erev: 'शाम',
        tov2: 'अच्छा',
        lehitraot: 'अलविदा'
      },
      bn: {
        shalom: 'নমস্কার / শান্তি',
        boker: 'সকাল',
        tov: 'ভালো',
        erev: 'সন্ধ্যা',
        tov2: 'ভালো',
        lehitraot: 'বিদায়'
      },
      am: {
        shalom: 'ሰላም / ሰላም',
        boker: 'ጠዋት',
        tov: 'ጥሩ',
        erev: 'ማታ',
        tov2: 'ጥሩ',
        lehitraot: 'ቻው'
      }
    }
  }
];

// Arabic practice texts
export const arabicReadingTexts = [
  {
    id: 'arabic-starter-words',
    title: {
      en: 'Starter Words (5)',
      ar: 'كلمات أساسية (٥)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common Arabic words',
      ar: 'كلمات عربية شائعة',
      es: 'Palabras árabes comunes',
      fr: 'Mots arabes courants',
      pt: 'Palavras árabes comuns',
      ru: 'Общие арабские слова',
      ja: '一般的なアラビア語の単語',
      zh: '常用阿拉伯语词汇',
      hi: 'सामान्य अरबी शब्द',
      bn: 'সাধারণ আরবি শব্দ',
      am: 'የተለመዱ የአረብኛ ቃላት',
      he: 'מילים נפוצות בערבית'
    },
    practiceLanguage: 'arabic',
    tokens: [
      { type: 'word', text: 'سلام', id: 'salam' },
      { type: 'word', text: 'شكرا', id: 'shukran' },
      { type: 'word', text: 'نعم', id: 'naam' },
      { type: 'word', text: 'لا', id: 'la' },
      { type: 'word', text: 'كتاب', id: 'kitab' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        salam: { canonical: 'salam', variants: ['salam', 'salaam', 'peace'] },
        shukran: { canonical: 'shukran', variants: ['shukran', 'thanks'] },
        naam: { canonical: 'naam', variants: ['naam', 'na\'am', 'yes'] },
        la: { canonical: 'la', variants: ['la', 'laa', 'no'] },
        kitab: { canonical: 'kitab', variants: ['kitab', 'kitaab', 'book'] }
      },
      ar: {
        salam: { canonical: 'سلام', variants: ['سلام'] },
        shukran: { canonical: 'شكرا', variants: ['شكرا'] },
        naam: { canonical: 'نعم', variants: ['نعم'] },
        la: { canonical: 'لا', variants: ['لا'] },
        kitab: { canonical: 'كتاب', variants: ['كتاب'] }
      },
      es: {
        salam: { canonical: 'salam', variants: ['salam', 'paz'] },
        shukran: { canonical: 'gracias', variants: ['gracias', 'shukran'] },
        naam: { canonical: 'si', variants: ['si', 'sí', 'naam'] },
        la: { canonical: 'no', variants: ['no', 'la'] },
        kitab: { canonical: 'libro', variants: ['libro', 'kitab'] }
      },
      fr: {
        salam: { canonical: 'salam', variants: ['salam', 'paix'] },
        shukran: { canonical: 'merci', variants: ['merci', 'shukran'] },
        naam: { canonical: 'oui', variants: ['oui', 'naam'] },
        la: { canonical: 'non', variants: ['non', 'la'] },
        kitab: { canonical: 'livre', variants: ['livre', 'kitab'] }
      },
      pt: {
        salam: { canonical: 'salam', variants: ['salam', 'paz'] },
        shukran: { canonical: 'obrigado', variants: ['obrigado', 'shukran'] },
        naam: { canonical: 'sim', variants: ['sim', 'naam'] },
        la: { canonical: 'nao', variants: ['nao', 'não', 'la'] },
        kitab: { canonical: 'livro', variants: ['livro', 'kitab'] }
      },
      ru: {
        salam: { canonical: 'salam', variants: ['salam', 'мир'] },
        shukran: { canonical: 'spasibo', variants: ['spasibo', 'shukran'] },
        naam: { canonical: 'da', variants: ['da', 'naam'] },
        la: { canonical: 'net', variants: ['net', 'la'] },
        kitab: { canonical: 'kniga', variants: ['kniga', 'kitab'] }
      },
      ja: {
        salam: { canonical: 'salam', variants: ['salam', '平和'] },
        shukran: { canonical: 'arigatou', variants: ['arigatou', 'shukran'] },
        naam: { canonical: 'hai', variants: ['hai', 'naam'] },
        la: { canonical: 'iie', variants: ['iie', 'la'] },
        kitab: { canonical: 'hon', variants: ['hon', 'kitab'] }
      },
      zh: {
        salam: { canonical: 'salam', variants: ['salam', '和平'] },
        shukran: { canonical: 'xiexie', variants: ['xiexie', 'shukran'] },
        naam: { canonical: 'shi', variants: ['shi', 'naam'] },
        la: { canonical: 'bu', variants: ['bu', 'la'] },
        kitab: { canonical: 'shu', variants: ['shu', 'kitab'] }
      },
      hi: {
        salam: { canonical: 'salam', variants: ['salam', 'shanti'] },
        shukran: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'shukran'] },
        naam: { canonical: 'haan', variants: ['haan', 'naam'] },
        la: { canonical: 'nahin', variants: ['nahin', 'la'] },
        kitab: { canonical: 'kitab', variants: ['kitab'] }
      },
      bn: {
        salam: { canonical: 'salam', variants: ['salam', 'shanti'] },
        shukran: { canonical: 'dhonnobad', variants: ['dhonnobad', 'shukran'] },
        naam: { canonical: 'hyan', variants: ['hyan', 'naam'] },
        la: { canonical: 'na', variants: ['na', 'la'] },
        kitab: { canonical: 'boi', variants: ['boi', 'kitab'] }
      },
      am: {
        salam: { canonical: 'salam', variants: ['salam', 'selam'] },
        shukran: { canonical: 'ameseginalehu', variants: ['ameseginalehu', 'shukran'] },
        naam: { canonical: 'awo', variants: ['awo', 'naam'] },
        la: { canonical: 'ay', variants: ['ay', 'la'] },
        kitab: { canonical: 'metsihaf', variants: ['metsihaf', 'kitab'] }
      },
      he: {
        salam: { canonical: 'salam', variants: ['salam', 'shalom'] },
        shukran: { canonical: 'todah', variants: ['todah', 'shukran'] },
        naam: { canonical: 'ken', variants: ['ken', 'naam'] },
        la: { canonical: 'lo', variants: ['lo', 'la'] },
        kitab: { canonical: 'sefer', variants: ['sefer', 'kitab'] }
      }
    }
  }
];

// Mandarin practice texts (using pinyin transliteration)
export const mandarinReadingTexts = [
  {
    id: 'mandarin-starter-words',
    title: {
      en: 'Starter Words (5)',
      zh: '基础词汇 (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common Mandarin words',
      zh: '常用中文词汇',
      es: 'Palabras chinas comunes',
      fr: 'Mots chinois courants',
      ar: 'كلمات صينية شائعة',
      pt: 'Palavras chinesas comuns',
      ru: 'Общие китайские слова',
      ja: '一般的な中国語の単語',
      hi: 'सामान्य चीनी शब्द',
      bn: 'সাধারণ চীনা শব্দ',
      am: 'የተለመዱ የቻይንኛ ቃላት',
      he: 'מילים נפוצות בסינית'
    },
    practiceLanguage: 'mandarin',
    tokens: [
      { type: 'word', text: '你好', id: 'nihao' },
      { type: 'word', text: '谢谢', id: 'xiexie' },
      { type: 'word', text: '是', id: 'shi' },
      { type: 'word', text: '不', id: 'bu' },
      { type: 'word', text: '好', id: 'hao' },
      { type: 'punct', text: '。' }
    ],
    translations: {
      en: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'ni hao', 'hello'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'xie xie', 'thanks'] },
        shi: { canonical: 'shi', variants: ['shi', 'yes', 'is'] },
        bu: { canonical: 'bu', variants: ['bu', 'no', 'not'] },
        hao: { canonical: 'hao', variants: ['hao', 'good'] }
      },
      zh: {
        nihao: { canonical: '你好', variants: ['你好'] },
        xiexie: { canonical: '谢谢', variants: ['谢谢'] },
        shi: { canonical: '是', variants: ['是'] },
        bu: { canonical: '不', variants: ['不'] },
        hao: { canonical: '好', variants: ['好'] }
      },
      es: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'hola'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'gracias'] },
        shi: { canonical: 'shi', variants: ['shi', 'si', 'sí'] },
        bu: { canonical: 'bu', variants: ['bu', 'no'] },
        hao: { canonical: 'hao', variants: ['hao', 'bueno'] }
      },
      fr: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'bonjour'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'merci'] },
        shi: { canonical: 'shi', variants: ['shi', 'oui'] },
        bu: { canonical: 'bu', variants: ['bu', 'non'] },
        hao: { canonical: 'hao', variants: ['hao', 'bon'] }
      },
      ar: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'مرحبا'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'شكرا'] },
        shi: { canonical: 'shi', variants: ['shi', 'نعم'] },
        bu: { canonical: 'bu', variants: ['bu', 'لا'] },
        hao: { canonical: 'hao', variants: ['hao', 'جيد'] }
      },
      pt: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'ola', 'olá'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'obrigado'] },
        shi: { canonical: 'shi', variants: ['shi', 'sim'] },
        bu: { canonical: 'bu', variants: ['bu', 'nao', 'não'] },
        hao: { canonical: 'hao', variants: ['hao', 'bom'] }
      },
      ru: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'привет'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'спасибо'] },
        shi: { canonical: 'shi', variants: ['shi', 'да'] },
        bu: { canonical: 'bu', variants: ['bu', 'нет'] },
        hao: { canonical: 'hao', variants: ['hao', 'хорошо'] }
      },
      ja: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'こんにちは'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'ありがとう'] },
        shi: { canonical: 'shi', variants: ['shi', 'はい'] },
        bu: { canonical: 'bu', variants: ['bu', 'いいえ'] },
        hao: { canonical: 'hao', variants: ['hao', 'いい'] }
      },
      hi: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'नमस्ते'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'धन्यवाद'] },
        shi: { canonical: 'shi', variants: ['shi', 'हाँ'] },
        bu: { canonical: 'bu', variants: ['bu', 'नहीं'] },
        hao: { canonical: 'hao', variants: ['hao', 'अच्छा'] }
      },
      bn: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'নমস্কার'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'ধন্যবাদ'] },
        shi: { canonical: 'shi', variants: ['shi', 'হ্যাঁ'] },
        bu: { canonical: 'bu', variants: ['bu', 'না'] },
        hao: { canonical: 'hao', variants: ['hao', 'ভালো'] }
      },
      am: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'ሰላም'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'አመሰግናለሁ'] },
        shi: { canonical: 'shi', variants: ['shi', 'አዎ'] },
        bu: { canonical: 'bu', variants: ['bu', 'አይ'] },
        hao: { canonical: 'hao', variants: ['hao', 'ጥሩ'] }
      },
      he: {
        nihao: { canonical: 'nihao', variants: ['nihao', 'שלום'] },
        xiexie: { canonical: 'xiexie', variants: ['xiexie', 'תודה'] },
        shi: { canonical: 'shi', variants: ['shi', 'כן'] },
        bu: { canonical: 'bu', variants: ['bu', 'לא'] },
        hao: { canonical: 'hao', variants: ['hao', 'טוב'] }
      }
    }
  }
];

// Hindi practice texts
export const hindiReadingTexts = [
  {
    id: 'hindi-starter-words',
    title: {
      en: 'Starter Words (5)',
      hi: 'बुनियादी शब्द (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common Hindi words',
      hi: 'सामान्य हिन्दी शब्द',
      es: 'Palabras hindi comunes',
      fr: 'Mots hindi courants',
      ar: 'كلمات هندية شائعة',
      pt: 'Palavras hindi comuns',
      ru: 'Общие слова на хинди',
      ja: '一般的なヒンディー語の単語',
      zh: '常用印地语词汇',
      bn: 'সাধারণ হিন্দি শব্দ',
      am: 'የተለመዱ የሂንዲ ቃላት',
      he: 'מילים נפוצות בהינדי'
    },
    practiceLanguage: 'hindi',
    tokens: [
      { type: 'word', text: 'नमस्ते', id: 'namaste' },
      { type: 'word', text: 'धन्यवाद', id: 'dhanyavaad' },
      { type: 'word', text: 'हाँ', id: 'haan' },
      { type: 'word', text: 'नहीं', id: 'nahin' },
      { type: 'word', text: 'अच्छा', id: 'accha' },
      { type: 'punct', text: '।' }
    ],
    translations: {
      en: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'hello'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'dhanyavad', 'thanks'] },
        haan: { canonical: 'haan', variants: ['haan', 'haa', 'yes'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'nahi', 'no'] },
        accha: { canonical: 'accha', variants: ['accha', 'acha', 'good'] }
      },
      hi: {
        namaste: { canonical: 'नमस्ते', variants: ['नमस्ते'] },
        dhanyavaad: { canonical: 'धन्यवाद', variants: ['धन्यवाद'] },
        haan: { canonical: 'हाँ', variants: ['हाँ', 'हां'] },
        nahin: { canonical: 'नहीं', variants: ['नहीं'] },
        accha: { canonical: 'अच्छा', variants: ['अच्छा'] }
      },
      es: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'hola'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'gracias'] },
        haan: { canonical: 'haan', variants: ['haan', 'si', 'sí'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'no'] },
        accha: { canonical: 'accha', variants: ['accha', 'bueno'] }
      },
      fr: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'bonjour'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'merci'] },
        haan: { canonical: 'haan', variants: ['haan', 'oui'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'non'] },
        accha: { canonical: 'accha', variants: ['accha', 'bon'] }
      },
      ar: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'مرحبا'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'شكرا'] },
        haan: { canonical: 'haan', variants: ['haan', 'نعم'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'لا'] },
        accha: { canonical: 'accha', variants: ['accha', 'جيد'] }
      },
      pt: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'ola', 'olá'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'obrigado'] },
        haan: { canonical: 'haan', variants: ['haan', 'sim'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'nao', 'não'] },
        accha: { canonical: 'accha', variants: ['accha', 'bom'] }
      },
      ru: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'привет'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'спасибо'] },
        haan: { canonical: 'haan', variants: ['haan', 'да'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'нет'] },
        accha: { canonical: 'accha', variants: ['accha', 'хорошо'] }
      },
      ja: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'こんにちは'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'ありがとう'] },
        haan: { canonical: 'haan', variants: ['haan', 'はい'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'いいえ'] },
        accha: { canonical: 'accha', variants: ['accha', 'いい'] }
      },
      zh: {
        namaste: { canonical: 'namaste', variants: ['namaste', '你好'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', '谢谢'] },
        haan: { canonical: 'haan', variants: ['haan', '是'] },
        nahin: { canonical: 'nahin', variants: ['nahin', '不'] },
        accha: { canonical: 'accha', variants: ['accha', '好'] }
      },
      bn: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'নমস্কার'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'ধন্যবাদ'] },
        haan: { canonical: 'haan', variants: ['haan', 'হ্যাঁ'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'না'] },
        accha: { canonical: 'accha', variants: ['accha', 'ভালো'] }
      },
      am: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'ሰላም'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'አመሰግናለሁ'] },
        haan: { canonical: 'haan', variants: ['haan', 'አዎ'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'አይ'] },
        accha: { canonical: 'accha', variants: ['accha', 'ጥሩ'] }
      },
      he: {
        namaste: { canonical: 'namaste', variants: ['namaste', 'שלום'] },
        dhanyavaad: { canonical: 'dhanyavaad', variants: ['dhanyavaad', 'תודה'] },
        haan: { canonical: 'haan', variants: ['haan', 'כן'] },
        nahin: { canonical: 'nahin', variants: ['nahin', 'לא'] },
        accha: { canonical: 'accha', variants: ['accha', 'טוב'] }
      }
    }
  }
];

// English practice texts
export const englishReadingTexts = [
  {
    id: 'english-starter-words',
    title: {
      en: 'Starter Words (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common English words',
      es: 'Palabras inglesas comunes',
      fr: 'Mots anglais courants',
      ar: 'كلمات إنجليزية شائعة',
      pt: 'Palavras inglesas comuns',
      ru: 'Общие английские слова',
      ja: '一般的な英語の単語',
      zh: '常用英语词汇',
      hi: 'सामान्य अंग्रेज़ी शब्द',
      bn: 'সাধারণ ইংরেজি শব্দ',
      am: 'የተለመዱ የእንግሊዝኛ ቃላት',
      he: 'מילים נפוצות באנגלית'
    },
    practiceLanguage: 'english',
    tokens: [
      { type: 'word', text: 'hello', id: 'hello' },
      { type: 'word', text: 'thanks', id: 'thanks' },
      { type: 'word', text: 'yes', id: 'yes' },
      { type: 'word', text: 'no', id: 'no' },
      { type: 'word', text: 'good', id: 'good' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        hello: { canonical: 'hello', variants: ['hello'] },
        thanks: { canonical: 'thanks', variants: ['thanks', 'thank you'] },
        yes: { canonical: 'yes', variants: ['yes'] },
        no: { canonical: 'no', variants: ['no'] },
        good: { canonical: 'good', variants: ['good'] }
      },
      es: {
        hello: { canonical: 'hola', variants: ['hola', 'hello'] },
        thanks: { canonical: 'gracias', variants: ['gracias', 'thanks'] },
        yes: { canonical: 'si', variants: ['si', 'sí', 'yes'] },
        no: { canonical: 'no', variants: ['no'] },
        good: { canonical: 'bueno', variants: ['bueno', 'bien', 'good'] }
      },
      fr: {
        hello: { canonical: 'bonjour', variants: ['bonjour', 'hello'] },
        thanks: { canonical: 'merci', variants: ['merci', 'thanks'] },
        yes: { canonical: 'oui', variants: ['oui', 'yes'] },
        no: { canonical: 'non', variants: ['non', 'no'] },
        good: { canonical: 'bon', variants: ['bon', 'bien', 'good'] }
      },
      ar: {
        hello: { canonical: 'مرحبا', variants: ['مرحبا', 'hello'] },
        thanks: { canonical: 'شكرا', variants: ['شكرا', 'thanks'] },
        yes: { canonical: 'نعم', variants: ['نعم', 'yes'] },
        no: { canonical: 'لا', variants: ['لا', 'no'] },
        good: { canonical: 'جيد', variants: ['جيد', 'good'] }
      },
      pt: {
        hello: { canonical: 'ola', variants: ['ola', 'olá', 'hello'] },
        thanks: { canonical: 'obrigado', variants: ['obrigado', 'thanks'] },
        yes: { canonical: 'sim', variants: ['sim', 'yes'] },
        no: { canonical: 'nao', variants: ['nao', 'não', 'no'] },
        good: { canonical: 'bom', variants: ['bom', 'good'] }
      },
      ru: {
        hello: { canonical: 'привет', variants: ['привет', 'hello'] },
        thanks: { canonical: 'спасибо', variants: ['спасибо', 'thanks'] },
        yes: { canonical: 'да', variants: ['да', 'yes'] },
        no: { canonical: 'нет', variants: ['нет', 'no'] },
        good: { canonical: 'хорошо', variants: ['хорошо', 'good'] }
      },
      ja: {
        hello: { canonical: 'こんにちは', variants: ['こんにちは', 'hello'] },
        thanks: { canonical: 'ありがとう', variants: ['ありがとう', 'thanks'] },
        yes: { canonical: 'はい', variants: ['はい', 'yes'] },
        no: { canonical: 'いいえ', variants: ['いいえ', 'no'] },
        good: { canonical: 'いい', variants: ['いい', 'good'] }
      },
      zh: {
        hello: { canonical: '你好', variants: ['你好', 'hello'] },
        thanks: { canonical: '谢谢', variants: ['谢谢', 'thanks'] },
        yes: { canonical: '是', variants: ['是', 'yes'] },
        no: { canonical: '不', variants: ['不', 'no'] },
        good: { canonical: '好', variants: ['好', 'good'] }
      },
      hi: {
        hello: { canonical: 'नमस्ते', variants: ['नमस्ते', 'hello'] },
        thanks: { canonical: 'धन्यवाद', variants: ['धन्यवाद', 'thanks'] },
        yes: { canonical: 'हाँ', variants: ['हाँ', 'yes'] },
        no: { canonical: 'नहीं', variants: ['नहीं', 'no'] },
        good: { canonical: 'अच्छा', variants: ['अच्छा', 'good'] }
      },
      bn: {
        hello: { canonical: 'নমস্কার', variants: ['নমস্কার', 'hello'] },
        thanks: { canonical: 'ধন্যবাদ', variants: ['ধন্যবাদ', 'thanks'] },
        yes: { canonical: 'হ্যাঁ', variants: ['হ্যাঁ', 'yes'] },
        no: { canonical: 'না', variants: ['না', 'no'] },
        good: { canonical: 'ভালো', variants: ['ভালো', 'good'] }
      },
      am: {
        hello: { canonical: 'ሰላም', variants: ['ሰላም', 'hello'] },
        thanks: { canonical: 'አመሰግናለሁ', variants: ['አመሰግናለሁ', 'thanks'] },
        yes: { canonical: 'አዎ', variants: ['አዎ', 'yes'] },
        no: { canonical: 'አይ', variants: ['አይ', 'no'] },
        good: { canonical: 'ጥሩ', variants: ['ጥሩ', 'good'] }
      },
      he: {
        hello: { canonical: 'שלום', variants: ['שלום', 'hello'] },
        thanks: { canonical: 'תודה', variants: ['תודה', 'thanks'] },
        yes: { canonical: 'כן', variants: ['כן', 'yes'] },
        no: { canonical: 'לא', variants: ['לא', 'no'] },
        good: { canonical: 'טוב', variants: ['טוב', 'good'] }
      }
    }
  }
];

// Spanish practice texts
export const spanishReadingTexts = [
  {
    id: 'spanish-starter-words',
    title: {
      en: 'Starter Words (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common Spanish words',
      es: 'Palabras españolas comunes',
      fr: 'Mots espagnols courants',
      ar: 'كلمات إسبانية شائعة',
      pt: 'Palavras espanholas comuns',
      ru: 'Общие испанские слова',
      ja: '一般的なスペイン語の単語',
      zh: '常用西班牙语词汇',
      hi: 'सामान्य स्पेनिश शब्द',
      bn: 'সাধারণ স্প্যানিশ শব্দ',
      am: 'የተለመዱ የስፓኒሽ ቃላት',
      he: 'מילים נפוצות בספרדית'
    },
    practiceLanguage: 'spanish',
    tokens: [
      { type: 'word', text: 'hola', id: 'hola' },
      { type: 'word', text: 'gracias', id: 'gracias' },
      { type: 'word', text: 'sí', id: 'si' },
      { type: 'word', text: 'no', id: 'no' },
      { type: 'word', text: 'bien', id: 'bien' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        hola: { canonical: 'hola', variants: ['hola', 'hello'] },
        gracias: { canonical: 'gracias', variants: ['gracias', 'thanks'] },
        si: { canonical: 'si', variants: ['si', 'sí', 'yes'] },
        no: { canonical: 'no', variants: ['no'] },
        bien: { canonical: 'bien', variants: ['bien', 'good', 'well'] }
      },
      es: {
        hola: { canonical: 'hola', variants: ['hola'] },
        gracias: { canonical: 'gracias', variants: ['gracias'] },
        si: { canonical: 'si', variants: ['si', 'sí'] },
        no: { canonical: 'no', variants: ['no'] },
        bien: { canonical: 'bien', variants: ['bien'] }
      },
      fr: {
        hola: { canonical: 'bonjour', variants: ['bonjour', 'hola'] },
        gracias: { canonical: 'merci', variants: ['merci', 'gracias'] },
        si: { canonical: 'oui', variants: ['oui', 'si', 'sí'] },
        no: { canonical: 'non', variants: ['non', 'no'] },
        bien: { canonical: 'bien', variants: ['bien'] }
      },
      ar: {
        hola: { canonical: 'مرحبا', variants: ['مرحبا', 'hola'] },
        gracias: { canonical: 'شكرا', variants: ['شكرا', 'gracias'] },
        si: { canonical: 'نعم', variants: ['نعم', 'si', 'sí'] },
        no: { canonical: 'لا', variants: ['لا', 'no'] },
        bien: { canonical: 'جيد', variants: ['جيد', 'bien'] }
      },
      pt: {
        hola: { canonical: 'ola', variants: ['ola', 'olá', 'hola'] },
        gracias: { canonical: 'obrigado', variants: ['obrigado', 'gracias'] },
        si: { canonical: 'sim', variants: ['sim', 'si', 'sí'] },
        no: { canonical: 'nao', variants: ['nao', 'não', 'no'] },
        bien: { canonical: 'bem', variants: ['bem', 'bien'] }
      },
      ru: {
        hola: { canonical: 'привет', variants: ['привет', 'hola'] },
        gracias: { canonical: 'спасибо', variants: ['спасибо', 'gracias'] },
        si: { canonical: 'да', variants: ['да', 'si', 'sí'] },
        no: { canonical: 'нет', variants: ['нет', 'no'] },
        bien: { canonical: 'хорошо', variants: ['хорошо', 'bien'] }
      },
      ja: {
        hola: { canonical: 'こんにちは', variants: ['こんにちは', 'hola'] },
        gracias: { canonical: 'ありがとう', variants: ['ありがとう', 'gracias'] },
        si: { canonical: 'はい', variants: ['はい', 'si', 'sí'] },
        no: { canonical: 'いいえ', variants: ['いいえ', 'no'] },
        bien: { canonical: 'いい', variants: ['いい', 'bien'] }
      },
      zh: {
        hola: { canonical: '你好', variants: ['你好', 'hola'] },
        gracias: { canonical: '谢谢', variants: ['谢谢', 'gracias'] },
        si: { canonical: '是', variants: ['是', 'si', 'sí'] },
        no: { canonical: '不', variants: ['不', 'no'] },
        bien: { canonical: '好', variants: ['好', 'bien'] }
      },
      hi: {
        hola: { canonical: 'नमस्ते', variants: ['नमस्ते', 'hola'] },
        gracias: { canonical: 'धन्यवाद', variants: ['धन्यवाद', 'gracias'] },
        si: { canonical: 'हाँ', variants: ['हाँ', 'si', 'sí'] },
        no: { canonical: 'नहीं', variants: ['नहीं', 'no'] },
        bien: { canonical: 'अच्छा', variants: ['अच्छा', 'bien'] }
      },
      bn: {
        hola: { canonical: 'নমস্কার', variants: ['নমস্কার', 'hola'] },
        gracias: { canonical: 'ধন্যবাদ', variants: ['ধন্যবাদ', 'gracias'] },
        si: { canonical: 'হ্যাঁ', variants: ['হ্যাঁ', 'si', 'sí'] },
        no: { canonical: 'না', variants: ['না', 'no'] },
        bien: { canonical: 'ভালো', variants: ['ভালো', 'bien'] }
      },
      am: {
        hola: { canonical: 'ሰላም', variants: ['ሰላም', 'hola'] },
        gracias: { canonical: 'አመሰግናለሁ', variants: ['አመሰግናለሁ', 'gracias'] },
        si: { canonical: 'አዎ', variants: ['አዎ', 'si', 'sí'] },
        no: { canonical: 'አይ', variants: ['አይ', 'no'] },
        bien: { canonical: 'ጥሩ', variants: ['ጥሩ', 'bien'] }
      },
      he: {
        hola: { canonical: 'שלום', variants: ['שלום', 'hola'] },
        gracias: { canonical: 'תודה', variants: ['תודה', 'gracias'] },
        si: { canonical: 'כן', variants: ['כן', 'si', 'sí'] },
        no: { canonical: 'לא', variants: ['לא', 'no'] },
        bien: { canonical: 'טוב', variants: ['טוב', 'bien'] }
      }
    }
  }
];

// French practice texts
export const frenchReadingTexts = [
  {
    id: 'french-starter-words',
    title: {
      en: 'Starter Words (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common French words',
      es: 'Palabras francesas comunes',
      fr: 'Mots français courants',
      ar: 'كلمات فرنسية شائعة',
      pt: 'Palavras francesas comuns',
      ru: 'Общие французские слова',
      ja: '一般的なフランス語の単語',
      zh: '常用法语词汇',
      hi: 'सामान्य फ्रेंच शब्द',
      bn: 'সাধারণ ফরাসি শব্দ',
      am: 'የተለመዱ የፈረንሳይ ቃላት',
      he: 'מילים נפוצות בצרפתית'
    },
    practiceLanguage: 'french',
    tokens: [
      { type: 'word', text: 'bonjour', id: 'bonjour' },
      { type: 'word', text: 'merci', id: 'merci' },
      { type: 'word', text: 'oui', id: 'oui' },
      { type: 'word', text: 'non', id: 'non' },
      { type: 'word', text: 'bon', id: 'bon' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        bonjour: { canonical: 'bonjour', variants: ['bonjour', 'hello'] },
        merci: { canonical: 'merci', variants: ['merci', 'thanks'] },
        oui: { canonical: 'oui', variants: ['oui', 'yes'] },
        non: { canonical: 'non', variants: ['non', 'no'] },
        bon: { canonical: 'bon', variants: ['bon', 'good'] }
      },
      es: {
        bonjour: { canonical: 'hola', variants: ['hola', 'bonjour'] },
        merci: { canonical: 'gracias', variants: ['gracias', 'merci'] },
        oui: { canonical: 'si', variants: ['si', 'sí', 'oui'] },
        non: { canonical: 'no', variants: ['no', 'non'] },
        bon: { canonical: 'bueno', variants: ['bueno', 'bon'] }
      },
      fr: {
        bonjour: { canonical: 'bonjour', variants: ['bonjour'] },
        merci: { canonical: 'merci', variants: ['merci'] },
        oui: { canonical: 'oui', variants: ['oui'] },
        non: { canonical: 'non', variants: ['non'] },
        bon: { canonical: 'bon', variants: ['bon'] }
      },
      ar: {
        bonjour: { canonical: 'مرحبا', variants: ['مرحبا', 'bonjour'] },
        merci: { canonical: 'شكرا', variants: ['شكرا', 'merci'] },
        oui: { canonical: 'نعم', variants: ['نعم', 'oui'] },
        non: { canonical: 'لا', variants: ['لا', 'non'] },
        bon: { canonical: 'جيد', variants: ['جيد', 'bon'] }
      },
      pt: {
        bonjour: { canonical: 'ola', variants: ['ola', 'olá', 'bonjour'] },
        merci: { canonical: 'obrigado', variants: ['obrigado', 'merci'] },
        oui: { canonical: 'sim', variants: ['sim', 'oui'] },
        non: { canonical: 'nao', variants: ['nao', 'não', 'non'] },
        bon: { canonical: 'bom', variants: ['bom', 'bon'] }
      },
      ru: {
        bonjour: { canonical: 'привет', variants: ['привет', 'bonjour'] },
        merci: { canonical: 'спасибо', variants: ['спасибо', 'merci'] },
        oui: { canonical: 'да', variants: ['да', 'oui'] },
        non: { canonical: 'нет', variants: ['нет', 'non'] },
        bon: { canonical: 'хорошо', variants: ['хорошо', 'bon'] }
      },
      ja: {
        bonjour: { canonical: 'こんにちは', variants: ['こんにちは', 'bonjour'] },
        merci: { canonical: 'ありがとう', variants: ['ありがとう', 'merci'] },
        oui: { canonical: 'はい', variants: ['はい', 'oui'] },
        non: { canonical: 'いいえ', variants: ['いいえ', 'non'] },
        bon: { canonical: 'いい', variants: ['いい', 'bon'] }
      },
      zh: {
        bonjour: { canonical: '你好', variants: ['你好', 'bonjour'] },
        merci: { canonical: '谢谢', variants: ['谢谢', 'merci'] },
        oui: { canonical: '是', variants: ['是', 'oui'] },
        non: { canonical: '不', variants: ['不', 'non'] },
        bon: { canonical: '好', variants: ['好', 'bon'] }
      },
      hi: {
        bonjour: { canonical: 'नमस्ते', variants: ['नमस्ते', 'bonjour'] },
        merci: { canonical: 'धन्यवाद', variants: ['धन्यवाद', 'merci'] },
        oui: { canonical: 'हाँ', variants: ['हाँ', 'oui'] },
        non: { canonical: 'नहीं', variants: ['नहीं', 'non'] },
        bon: { canonical: 'अच्छा', variants: ['अच्छा', 'bon'] }
      },
      bn: {
        bonjour: { canonical: 'নমস্কার', variants: ['নমস্কার', 'bonjour'] },
        merci: { canonical: 'ধন্যবাদ', variants: ['ধন্যবাদ', 'merci'] },
        oui: { canonical: 'হ্যাঁ', variants: ['হ্যাঁ', 'oui'] },
        non: { canonical: 'না', variants: ['না', 'non'] },
        bon: { canonical: 'ভালো', variants: ['ভালো', 'bon'] }
      },
      am: {
        bonjour: { canonical: 'ሰላም', variants: ['ሰላም', 'bonjour'] },
        merci: { canonical: 'አመሰግናለሁ', variants: ['አመሰግናለሁ', 'merci'] },
        oui: { canonical: 'አዎ', variants: ['አዎ', 'oui'] },
        non: { canonical: 'አይ', variants: ['አይ', 'non'] },
        bon: { canonical: 'ጥሩ', variants: ['ጥሩ', 'bon'] }
      },
      he: {
        bonjour: { canonical: 'שלום', variants: ['שלום', 'bonjour'] },
        merci: { canonical: 'תודה', variants: ['תודה', 'merci'] },
        oui: { canonical: 'כן', variants: ['כן', 'oui'] },
        non: { canonical: 'לא', variants: ['לא', 'non'] },
        bon: { canonical: 'טוב', variants: ['טוב', 'bon'] }
      }
    }
  }
];

// Portuguese practice texts
export const portugueseReadingTexts = [
  {
    id: 'portuguese-starter-words',
    title: {
      en: 'Starter Words (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common Portuguese words',
      es: 'Palabras portuguesas comunes',
      fr: 'Mots portugais courants',
      ar: 'كلمات برتغالية شائعة',
      pt: 'Palavras portuguesas comuns',
      ru: 'Общие португальские слова',
      ja: '一般的なポルトガル語の単語',
      zh: '常用葡萄牙语词汇',
      hi: 'सामान्य पुर्तगाली शब्द',
      bn: 'সাধারণ পর্তুগিজ শব্দ',
      am: 'የተለመዱ የፖርቱጋል ቃላት',
      he: 'מילים נפוצות בפורטוגזית'
    },
    practiceLanguage: 'portuguese',
    tokens: [
      { type: 'word', text: 'olá', id: 'ola' },
      { type: 'word', text: 'obrigado', id: 'obrigado' },
      { type: 'word', text: 'sim', id: 'sim' },
      { type: 'word', text: 'não', id: 'nao' },
      { type: 'word', text: 'bom', id: 'bom' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        ola: { canonical: 'ola', variants: ['ola', 'olá', 'hello'] },
        obrigado: { canonical: 'obrigado', variants: ['obrigado', 'thanks'] },
        sim: { canonical: 'sim', variants: ['sim', 'yes'] },
        nao: { canonical: 'nao', variants: ['nao', 'não', 'no'] },
        bom: { canonical: 'bom', variants: ['bom', 'good'] }
      },
      es: {
        ola: { canonical: 'hola', variants: ['hola', 'ola', 'olá'] },
        obrigado: { canonical: 'gracias', variants: ['gracias', 'obrigado'] },
        sim: { canonical: 'si', variants: ['si', 'sí', 'sim'] },
        nao: { canonical: 'no', variants: ['no', 'nao', 'não'] },
        bom: { canonical: 'bueno', variants: ['bueno', 'bom'] }
      },
      fr: {
        ola: { canonical: 'bonjour', variants: ['bonjour', 'ola', 'olá'] },
        obrigado: { canonical: 'merci', variants: ['merci', 'obrigado'] },
        sim: { canonical: 'oui', variants: ['oui', 'sim'] },
        nao: { canonical: 'non', variants: ['non', 'nao', 'não'] },
        bom: { canonical: 'bon', variants: ['bon', 'bom'] }
      },
      ar: {
        ola: { canonical: 'مرحبا', variants: ['مرحبا', 'ola', 'olá'] },
        obrigado: { canonical: 'شكرا', variants: ['شكرا', 'obrigado'] },
        sim: { canonical: 'نعم', variants: ['نعم', 'sim'] },
        nao: { canonical: 'لا', variants: ['لا', 'nao', 'não'] },
        bom: { canonical: 'جيد', variants: ['جيد', 'bom'] }
      },
      pt: {
        ola: { canonical: 'ola', variants: ['ola', 'olá'] },
        obrigado: { canonical: 'obrigado', variants: ['obrigado'] },
        sim: { canonical: 'sim', variants: ['sim'] },
        nao: { canonical: 'nao', variants: ['nao', 'não'] },
        bom: { canonical: 'bom', variants: ['bom'] }
      },
      ru: {
        ola: { canonical: 'привет', variants: ['привет', 'ola', 'olá'] },
        obrigado: { canonical: 'спасибо', variants: ['спасибо', 'obrigado'] },
        sim: { canonical: 'да', variants: ['да', 'sim'] },
        nao: { canonical: 'нет', variants: ['нет', 'nao', 'não'] },
        bom: { canonical: 'хорошо', variants: ['хорошо', 'bom'] }
      },
      ja: {
        ola: { canonical: 'こんにちは', variants: ['こんにちは', 'ola', 'olá'] },
        obrigado: { canonical: 'ありがとう', variants: ['ありがとう', 'obrigado'] },
        sim: { canonical: 'はい', variants: ['はい', 'sim'] },
        nao: { canonical: 'いいえ', variants: ['いいえ', 'nao', 'não'] },
        bom: { canonical: 'いい', variants: ['いい', 'bom'] }
      },
      zh: {
        ola: { canonical: '你好', variants: ['你好', 'ola', 'olá'] },
        obrigado: { canonical: '谢谢', variants: ['谢谢', 'obrigado'] },
        sim: { canonical: '是', variants: ['是', 'sim'] },
        nao: { canonical: '不', variants: ['不', 'nao', 'não'] },
        bom: { canonical: '好', variants: ['好', 'bom'] }
      },
      hi: {
        ola: { canonical: 'नमस्ते', variants: ['नमस्ते', 'ola', 'olá'] },
        obrigado: { canonical: 'धन्यवाद', variants: ['धन्यवाद', 'obrigado'] },
        sim: { canonical: 'हाँ', variants: ['हाँ', 'sim'] },
        nao: { canonical: 'नहीं', variants: ['नहीं', 'nao', 'não'] },
        bom: { canonical: 'अच्छा', variants: ['अच्छा', 'bom'] }
      },
      bn: {
        ola: { canonical: 'নমস্কার', variants: ['নমস্কার', 'ola', 'olá'] },
        obrigado: { canonical: 'ধন্যবাদ', variants: ['ধন্যবাদ', 'obrigado'] },
        sim: { canonical: 'হ্যাঁ', variants: ['হ্যাঁ', 'sim'] },
        nao: { canonical: 'না', variants: ['না', 'nao', 'não'] },
        bom: { canonical: 'ভালো', variants: ['ভালো', 'bom'] }
      },
      am: {
        ola: { canonical: 'ሰላም', variants: ['ሰላም', 'ola', 'olá'] },
        obrigado: { canonical: 'አመሰግናለሁ', variants: ['አመሰግናለሁ', 'obrigado'] },
        sim: { canonical: 'አዎ', variants: ['አዎ', 'sim'] },
        nao: { canonical: 'አይ', variants: ['አይ', 'nao', 'não'] },
        bom: { canonical: 'ጥሩ', variants: ['ጥሩ', 'bom'] }
      },
      he: {
        ola: { canonical: 'שלום', variants: ['שלום', 'ola', 'olá'] },
        obrigado: { canonical: 'תודה', variants: ['תודה', 'obrigado'] },
        sim: { canonical: 'כן', variants: ['כן', 'sim'] },
        nao: { canonical: 'לא', variants: ['לא', 'nao', 'não'] },
        bom: { canonical: 'טוב', variants: ['טוב', 'bom'] }
      }
    }
  }
];

// Russian practice texts
export const russianReadingTexts = [
  {
    id: 'russian-starter-words',
    title: {
      en: 'Starter Words (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common Russian words',
      es: 'Palabras rusas comunes',
      fr: 'Mots russes courants',
      ar: 'كلمات روسية شائعة',
      pt: 'Palavras russas comuns',
      ru: 'Общие русские слова',
      ja: '一般的なロシア語の単語',
      zh: '常用俄语词汇',
      hi: 'सामान्य रूसी शब्द',
      bn: 'সাধারণ রুশ শব্দ',
      am: 'የተለመዱ የሩሲያኛ ቃላት',
      he: 'מילים נפוצות ברוסית'
    },
    practiceLanguage: 'russian',
    tokens: [
      { type: 'word', text: 'привет', id: 'privet' },
      { type: 'word', text: 'спасибо', id: 'spasibo' },
      { type: 'word', text: 'да', id: 'da' },
      { type: 'word', text: 'нет', id: 'net' },
      { type: 'word', text: 'хорошо', id: 'horosho' },
      { type: 'punct', text: '.' }
    ],
    translations: {
      en: {
        privet: { canonical: 'privet', variants: ['privet', 'hello'] },
        spasibo: { canonical: 'spasibo', variants: ['spasibo', 'thanks'] },
        da: { canonical: 'da', variants: ['da', 'yes'] },
        net: { canonical: 'net', variants: ['net', 'no'] },
        horosho: { canonical: 'horosho', variants: ['horosho', 'good'] }
      },
      es: {
        privet: { canonical: 'hola', variants: ['hola', 'privet'] },
        spasibo: { canonical: 'gracias', variants: ['gracias', 'spasibo'] },
        da: { canonical: 'si', variants: ['si', 'sí', 'da'] },
        net: { canonical: 'no', variants: ['no', 'net'] },
        horosho: { canonical: 'bien', variants: ['bien', 'horosho'] }
      },
      fr: {
        privet: { canonical: 'bonjour', variants: ['bonjour', 'privet'] },
        spasibo: { canonical: 'merci', variants: ['merci', 'spasibo'] },
        da: { canonical: 'oui', variants: ['oui', 'da'] },
        net: { canonical: 'non', variants: ['non', 'net'] },
        horosho: { canonical: 'bon', variants: ['bon', 'horosho'] }
      },
      ar: {
        privet: { canonical: 'مرحبا', variants: ['مرحبا', 'privet'] },
        spasibo: { canonical: 'شكرا', variants: ['شكرا', 'spasibo'] },
        da: { canonical: 'نعم', variants: ['نعم', 'da'] },
        net: { canonical: 'لا', variants: ['لا', 'net'] },
        horosho: { canonical: 'جيد', variants: ['جيد', 'horosho'] }
      },
      pt: {
        privet: { canonical: 'ola', variants: ['ola', 'olá', 'privet'] },
        spasibo: { canonical: 'obrigado', variants: ['obrigado', 'spasibo'] },
        da: { canonical: 'sim', variants: ['sim', 'da'] },
        net: { canonical: 'nao', variants: ['nao', 'não', 'net'] },
        horosho: { canonical: 'bom', variants: ['bom', 'horosho'] }
      },
      ru: {
        privet: { canonical: 'привет', variants: ['привет'] },
        spasibo: { canonical: 'спасибо', variants: ['спасибо'] },
        da: { canonical: 'да', variants: ['да'] },
        net: { canonical: 'нет', variants: ['нет'] },
        horosho: { canonical: 'хорошо', variants: ['хорошо'] }
      },
      ja: {
        privet: { canonical: 'こんにちは', variants: ['こんにちは', 'privet'] },
        spasibo: { canonical: 'ありがとう', variants: ['ありがとう', 'spasibo'] },
        da: { canonical: 'はい', variants: ['はい', 'da'] },
        net: { canonical: 'いいえ', variants: ['いいえ', 'net'] },
        horosho: { canonical: 'いい', variants: ['いい', 'horosho'] }
      },
      zh: {
        privet: { canonical: '你好', variants: ['你好', 'privet'] },
        spasibo: { canonical: '谢谢', variants: ['谢谢', 'spasibo'] },
        da: { canonical: '是', variants: ['是', 'da'] },
        net: { canonical: '不', variants: ['不', 'net'] },
        horosho: { canonical: '好', variants: ['好', 'horosho'] }
      },
      hi: {
        privet: { canonical: 'नमस्ते', variants: ['नमस्ते', 'privet'] },
        spasibo: { canonical: 'धन्यवाद', variants: ['धन्यवाद', 'spasibo'] },
        da: { canonical: 'हाँ', variants: ['हाँ', 'da'] },
        net: { canonical: 'नहीं', variants: ['नहीं', 'net'] },
        horosho: { canonical: 'अच्छा', variants: ['अच्छा', 'horosho'] }
      },
      bn: {
        privet: { canonical: 'নমস্কার', variants: ['নমস্কার', 'privet'] },
        spasibo: { canonical: 'ধন্যবাদ', variants: ['ধন্যবাদ', 'spasibo'] },
        da: { canonical: 'হ্যাঁ', variants: ['হ্যাঁ', 'da'] },
        net: { canonical: 'না', variants: ['না', 'net'] },
        horosho: { canonical: 'ভালো', variants: ['ভালো', 'horosho'] }
      },
      am: {
        privet: { canonical: 'ሰላም', variants: ['ሰላም', 'privet'] },
        spasibo: { canonical: 'አመሰግናለሁ', variants: ['አመሰግናለሁ', 'spasibo'] },
        da: { canonical: 'አዎ', variants: ['አዎ', 'da'] },
        net: { canonical: 'አይ', variants: ['አይ', 'net'] },
        horosho: { canonical: 'ጥሩ', variants: ['ጥሩ', 'horosho'] }
      },
      he: {
        privet: { canonical: 'שלום', variants: ['שלום', 'privet'] },
        spasibo: { canonical: 'תודה', variants: ['תודה', 'spasibo'] },
        da: { canonical: 'כן', variants: ['כן', 'da'] },
        net: { canonical: 'לא', variants: ['לא', 'net'] },
        horosho: { canonical: 'טוב', variants: ['טוב', 'horosho'] }
      }
    }
  }
];

// Japanese practice texts
export const japaneseReadingTexts = [
  {
    id: 'japanese-starter-words',
    title: {
      en: 'Starter Words (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common Japanese words',
      es: 'Palabras japonesas comunes',
      fr: 'Mots japonais courants',
      ar: 'كلمات يابانية شائعة',
      pt: 'Palavras japonesas comuns',
      ru: 'Общие японские слова',
      ja: '一般的な日本語の単語',
      zh: '常用日语词汇',
      hi: 'सामान्य जापानी शब्द',
      bn: 'সাধারণ জাপানি শব্দ',
      am: 'የተለመዱ የጃፓን ቃላት',
      he: 'מילים נפוצות ביפנית'
    },
    practiceLanguage: 'japanese',
    tokens: [
      { type: 'word', text: 'こんにちは', id: 'konnichiwa' },
      { type: 'word', text: 'ありがとう', id: 'arigatou' },
      { type: 'word', text: 'はい', id: 'hai' },
      { type: 'word', text: 'いいえ', id: 'iie' },
      { type: 'word', text: 'いい', id: 'ii' },
      { type: 'punct', text: '。' }
    ],
    translations: {
      en: {
        konnichiwa: { canonical: 'konnichiwa', variants: ['konnichiwa', 'hello'] },
        arigatou: { canonical: 'arigatou', variants: ['arigatou', 'arigato', 'thanks'] },
        hai: { canonical: 'hai', variants: ['hai', 'yes'] },
        iie: { canonical: 'iie', variants: ['iie', 'no'] },
        ii: { canonical: 'ii', variants: ['ii', 'good'] }
      },
      es: {
        konnichiwa: { canonical: 'hola', variants: ['hola', 'konnichiwa'] },
        arigatou: { canonical: 'gracias', variants: ['gracias', 'arigatou', 'arigato'] },
        hai: { canonical: 'si', variants: ['si', 'sí', 'hai'] },
        iie: { canonical: 'no', variants: ['no', 'iie'] },
        ii: { canonical: 'bueno', variants: ['bueno', 'ii'] }
      },
      fr: {
        konnichiwa: { canonical: 'bonjour', variants: ['bonjour', 'konnichiwa'] },
        arigatou: { canonical: 'merci', variants: ['merci', 'arigatou', 'arigato'] },
        hai: { canonical: 'oui', variants: ['oui', 'hai'] },
        iie: { canonical: 'non', variants: ['non', 'iie'] },
        ii: { canonical: 'bon', variants: ['bon', 'ii'] }
      },
      ar: {
        konnichiwa: { canonical: 'مرحبا', variants: ['مرحبا', 'konnichiwa'] },
        arigatou: { canonical: 'شكرا', variants: ['شكرا', 'arigatou', 'arigato'] },
        hai: { canonical: 'نعم', variants: ['نعم', 'hai'] },
        iie: { canonical: 'لا', variants: ['لا', 'iie'] },
        ii: { canonical: 'جيد', variants: ['جيد', 'ii'] }
      },
      pt: {
        konnichiwa: { canonical: 'ola', variants: ['ola', 'olá', 'konnichiwa'] },
        arigatou: { canonical: 'obrigado', variants: ['obrigado', 'arigatou', 'arigato'] },
        hai: { canonical: 'sim', variants: ['sim', 'hai'] },
        iie: { canonical: 'nao', variants: ['nao', 'não', 'iie'] },
        ii: { canonical: 'bom', variants: ['bom', 'ii'] }
      },
      ru: {
        konnichiwa: { canonical: 'привет', variants: ['привет', 'konnichiwa'] },
        arigatou: { canonical: 'спасибо', variants: ['спасибо', 'arigatou', 'arigato'] },
        hai: { canonical: 'да', variants: ['да', 'hai'] },
        iie: { canonical: 'нет', variants: ['нет', 'iie'] },
        ii: { canonical: 'хорошо', variants: ['хорошо', 'ii'] }
      },
      ja: {
        konnichiwa: { canonical: 'こんにちは', variants: ['こんにちは'] },
        arigatou: { canonical: 'ありがとう', variants: ['ありがとう'] },
        hai: { canonical: 'はい', variants: ['はい'] },
        iie: { canonical: 'いいえ', variants: ['いいえ'] },
        ii: { canonical: 'いい', variants: ['いい'] }
      },
      zh: {
        konnichiwa: { canonical: '你好', variants: ['你好', 'konnichiwa'] },
        arigatou: { canonical: '谢谢', variants: ['谢谢', 'arigatou', 'arigato'] },
        hai: { canonical: '是', variants: ['是', 'hai'] },
        iie: { canonical: '不', variants: ['不', 'iie'] },
        ii: { canonical: '好', variants: ['好', 'ii'] }
      },
      hi: {
        konnichiwa: { canonical: 'नमस्ते', variants: ['नमस्ते', 'konnichiwa'] },
        arigatou: { canonical: 'धन्यवाद', variants: ['धन्यवाद', 'arigatou', 'arigato'] },
        hai: { canonical: 'हाँ', variants: ['हाँ', 'hai'] },
        iie: { canonical: 'नहीं', variants: ['नहीं', 'iie'] },
        ii: { canonical: 'अच्छा', variants: ['अच्छा', 'ii'] }
      },
      bn: {
        konnichiwa: { canonical: 'নমস্কার', variants: ['নমস্কার', 'konnichiwa'] },
        arigatou: { canonical: 'ধন্যবাদ', variants: ['ধন্যবাদ', 'arigatou', 'arigato'] },
        hai: { canonical: 'হ্যাঁ', variants: ['হ্যাঁ', 'hai'] },
        iie: { canonical: 'না', variants: ['না', 'iie'] },
        ii: { canonical: 'ভালো', variants: ['ভালো', 'ii'] }
      },
      am: {
        konnichiwa: { canonical: 'ሰላም', variants: ['ሰላም', 'konnichiwa'] },
        arigatou: { canonical: 'አመሰግናለሁ', variants: ['አመሰግናለሁ', 'arigatou', 'arigato'] },
        hai: { canonical: 'አዎ', variants: ['አዎ', 'hai'] },
        iie: { canonical: 'አይ', variants: ['አይ', 'iie'] },
        ii: { canonical: 'ጥሩ', variants: ['ጥሩ', 'ii'] }
      },
      he: {
        konnichiwa: { canonical: 'שלום', variants: ['שלום', 'konnichiwa'] },
        arigatou: { canonical: 'תודה', variants: ['תודה', 'arigatou', 'arigato'] },
        hai: { canonical: 'כן', variants: ['כן', 'hai'] },
        iie: { canonical: 'לא', variants: ['לא', 'iie'] },
        ii: { canonical: 'טוב', variants: ['טוב', 'ii'] }
      }
    }
  }
];

// Bengali practice texts
export const bengaliReadingTexts = [
  {
    id: 'bengali-starter-words',
    title: {
      en: 'Starter Words (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common Bengali words',
      es: 'Palabras bengalíes comunes',
      fr: 'Mots bengalis courants',
      ar: 'كلمات بنغالية شائعة',
      pt: 'Palavras bengali comuns',
      ru: 'Общие бенгальские слова',
      ja: '一般的なベンガル語の単語',
      zh: '常用孟加拉语词汇',
      hi: 'सामान्य बंगाली शब्द',
      bn: 'সাধারণ বাংলা শব্দ',
      am: 'የተለመዱ የቤንጋሊ ቃላት',
      he: 'מילים נפוצות בבנגלית'
    },
    practiceLanguage: 'bengali',
    tokens: [
      { type: 'word', text: 'নমস্কার', id: 'nomoshkar' },
      { type: 'word', text: 'ধন্যবাদ', id: 'dhonnobad' },
      { type: 'word', text: 'হ্যাঁ', id: 'hyan' },
      { type: 'word', text: 'না', id: 'na' },
      { type: 'word', text: 'ভালো', id: 'bhalo' },
      { type: 'punct', text: '।' }
    ],
    translations: {
      en: {
        nomoshkar: { canonical: 'nomoshkar', variants: ['nomoshkar', 'hello'] },
        dhonnobad: { canonical: 'dhonnobad', variants: ['dhonnobad', 'thanks'] },
        hyan: { canonical: 'hyan', variants: ['hyan', 'yes'] },
        na: { canonical: 'na', variants: ['na', 'no'] },
        bhalo: { canonical: 'bhalo', variants: ['bhalo', 'good'] }
      },
      es: {
        nomoshkar: { canonical: 'hola', variants: ['hola', 'nomoshkar'] },
        dhonnobad: { canonical: 'gracias', variants: ['gracias', 'dhonnobad'] },
        hyan: { canonical: 'si', variants: ['si', 'sí', 'hyan'] },
        na: { canonical: 'no', variants: ['no', 'na'] },
        bhalo: { canonical: 'bueno', variants: ['bueno', 'bhalo'] }
      },
      fr: {
        nomoshkar: { canonical: 'bonjour', variants: ['bonjour', 'nomoshkar'] },
        dhonnobad: { canonical: 'merci', variants: ['merci', 'dhonnobad'] },
        hyan: { canonical: 'oui', variants: ['oui', 'hyan'] },
        na: { canonical: 'non', variants: ['non', 'na'] },
        bhalo: { canonical: 'bon', variants: ['bon', 'bhalo'] }
      },
      ar: {
        nomoshkar: { canonical: 'مرحبا', variants: ['مرحبا', 'nomoshkar'] },
        dhonnobad: { canonical: 'شكرا', variants: ['شكرا', 'dhonnobad'] },
        hyan: { canonical: 'نعم', variants: ['نعم', 'hyan'] },
        na: { canonical: 'لا', variants: ['لا', 'na'] },
        bhalo: { canonical: 'جيد', variants: ['جيد', 'bhalo'] }
      },
      pt: {
        nomoshkar: { canonical: 'ola', variants: ['ola', 'olá', 'nomoshkar'] },
        dhonnobad: { canonical: 'obrigado', variants: ['obrigado', 'dhonnobad'] },
        hyan: { canonical: 'sim', variants: ['sim', 'hyan'] },
        na: { canonical: 'nao', variants: ['nao', 'não', 'na'] },
        bhalo: { canonical: 'bom', variants: ['bom', 'bhalo'] }
      },
      ru: {
        nomoshkar: { canonical: 'привет', variants: ['привет', 'nomoshkar'] },
        dhonnobad: { canonical: 'спасибо', variants: ['спасибо', 'dhonnobad'] },
        hyan: { canonical: 'да', variants: ['да', 'hyan'] },
        na: { canonical: 'нет', variants: ['нет', 'na'] },
        bhalo: { canonical: 'хорошо', variants: ['хорошо', 'bhalo'] }
      },
      ja: {
        nomoshkar: { canonical: 'こんにちは', variants: ['こんにちは', 'nomoshkar'] },
        dhonnobad: { canonical: 'ありがとう', variants: ['ありがとう', 'dhonnobad'] },
        hyan: { canonical: 'はい', variants: ['はい', 'hyan'] },
        na: { canonical: 'いいえ', variants: ['いいえ', 'na'] },
        bhalo: { canonical: 'いい', variants: ['いい', 'bhalo'] }
      },
      zh: {
        nomoshkar: { canonical: '你好', variants: ['你好', 'nomoshkar'] },
        dhonnobad: { canonical: '谢谢', variants: ['谢谢', 'dhonnobad'] },
        hyan: { canonical: '是', variants: ['是', 'hyan'] },
        na: { canonical: '不', variants: ['不', 'na'] },
        bhalo: { canonical: '好', variants: ['好', 'bhalo'] }
      },
      hi: {
        nomoshkar: { canonical: 'नमस्ते', variants: ['नमस्ते', 'nomoshkar'] },
        dhonnobad: { canonical: 'धन्यवाद', variants: ['धन्यवाद', 'dhonnobad'] },
        hyan: { canonical: 'हाँ', variants: ['हाँ', 'hyan'] },
        na: { canonical: 'नहीं', variants: ['नहीं', 'na'] },
        bhalo: { canonical: 'अच्छा', variants: ['अच्छा', 'bhalo'] }
      },
      bn: {
        nomoshkar: { canonical: 'নমস্কার', variants: ['নমস্কার'] },
        dhonnobad: { canonical: 'ধন্যবাদ', variants: ['ধন্যবাদ'] },
        hyan: { canonical: 'হ্যাঁ', variants: ['হ্যাঁ'] },
        na: { canonical: 'না', variants: ['না'] },
        bhalo: { canonical: 'ভালো', variants: ['ভালো'] }
      },
      am: {
        nomoshkar: { canonical: 'ሰላም', variants: ['ሰላም', 'nomoshkar'] },
        dhonnobad: { canonical: 'አመሰግናለሁ', variants: ['አመሰግናለሁ', 'dhonnobad'] },
        hyan: { canonical: 'አዎ', variants: ['አዎ', 'hyan'] },
        na: { canonical: 'አይ', variants: ['አይ', 'na'] },
        bhalo: { canonical: 'ጥሩ', variants: ['ጥሩ', 'bhalo'] }
      },
      he: {
        nomoshkar: { canonical: 'שלום', variants: ['שלום', 'nomoshkar'] },
        dhonnobad: { canonical: 'תודה', variants: ['תודה', 'dhonnobad'] },
        hyan: { canonical: 'כן', variants: ['כן', 'hyan'] },
        na: { canonical: 'לא', variants: ['לא', 'na'] },
        bhalo: { canonical: 'טוב', variants: ['טוב', 'bhalo'] }
      }
    }
  }
];

// Amharic practice texts
export const amharicReadingTexts = [
  {
    id: 'amharic-starter-words',
    title: {
      en: 'Starter Words (5)',
      es: 'Palabras Iniciales (5)',
      fr: 'Mots de Base (5)',
      ar: 'كلمات أساسية (٥)',
      pt: 'Palavras Iniciais (5)',
      ru: 'Начальные Слова (5)',
      ja: '基本単語 (5)',
      zh: '基础词汇 (5)',
      hi: 'बुनियादी शब्द (5)',
      bn: 'প্রাথমিক শব্দ (৫)',
      am: 'መሰረታዊ ቃላት (5)',
      he: 'מילים בסיסיות (5)'
    },
    subtitle: {
      en: 'Common Amharic words',
      es: 'Palabras amáricas comunes',
      fr: 'Mots amhariques courants',
      ar: 'كلمات أمهرية شائعة',
      pt: 'Palavras amárico comuns',
      ru: 'Общие амхарские слова',
      ja: '一般的なアムハラ語の単語',
      zh: '常用阿姆哈拉语词汇',
      hi: 'सामान्य अम्हारिक शब्द',
      bn: 'সাধারণ আমহারিক শব্দ',
      am: 'የተለመዱ የአማርኛ ቃላት',
      he: 'מילים נפוצות באמהרית'
    },
    practiceLanguage: 'amharic',
    tokens: [
      { type: 'word', text: 'ሰላም', id: 'selam' },
      { type: 'word', text: 'አመሰግናለሁ', id: 'ameseginalehu' },
      { type: 'word', text: 'አዎ', id: 'awo' },
      { type: 'word', text: 'አይ', id: 'ay' },
      { type: 'word', text: 'ጥሩ', id: 'tiru' },
      { type: 'punct', text: '።' }
    ],
    translations: {
      en: {
        selam: { canonical: 'selam', variants: ['selam', 'hello'] },
        ameseginalehu: { canonical: 'ameseginalehu', variants: ['ameseginalehu', 'thanks'] },
        awo: { canonical: 'awo', variants: ['awo', 'yes'] },
        ay: { canonical: 'ay', variants: ['ay', 'no'] },
        tiru: { canonical: 'tiru', variants: ['tiru', 'good'] }
      },
      es: {
        selam: { canonical: 'hola', variants: ['hola', 'selam'] },
        ameseginalehu: { canonical: 'gracias', variants: ['gracias', 'ameseginalehu'] },
        awo: { canonical: 'si', variants: ['si', 'sí', 'awo'] },
        ay: { canonical: 'no', variants: ['no', 'ay'] },
        tiru: { canonical: 'bueno', variants: ['bueno', 'tiru'] }
      },
      fr: {
        selam: { canonical: 'bonjour', variants: ['bonjour', 'selam'] },
        ameseginalehu: { canonical: 'merci', variants: ['merci', 'ameseginalehu'] },
        awo: { canonical: 'oui', variants: ['oui', 'awo'] },
        ay: { canonical: 'non', variants: ['non', 'ay'] },
        tiru: { canonical: 'bon', variants: ['bon', 'tiru'] }
      },
      ar: {
        selam: { canonical: 'مرحبا', variants: ['مرحبا', 'selam'] },
        ameseginalehu: { canonical: 'شكرا', variants: ['شكرا', 'ameseginalehu'] },
        awo: { canonical: 'نعم', variants: ['نعم', 'awo'] },
        ay: { canonical: 'لا', variants: ['لا', 'ay'] },
        tiru: { canonical: 'جيد', variants: ['جيد', 'tiru'] }
      },
      pt: {
        selam: { canonical: 'ola', variants: ['ola', 'olá', 'selam'] },
        ameseginalehu: { canonical: 'obrigado', variants: ['obrigado', 'ameseginalehu'] },
        awo: { canonical: 'sim', variants: ['sim', 'awo'] },
        ay: { canonical: 'nao', variants: ['nao', 'não', 'ay'] },
        tiru: { canonical: 'bom', variants: ['bom', 'tiru'] }
      },
      ru: {
        selam: { canonical: 'привет', variants: ['привет', 'selam'] },
        ameseginalehu: { canonical: 'спасибо', variants: ['спасибо', 'ameseginalehu'] },
        awo: { canonical: 'да', variants: ['да', 'awo'] },
        ay: { canonical: 'нет', variants: ['нет', 'ay'] },
        tiru: { canonical: 'хорошо', variants: ['хорошо', 'tiru'] }
      },
      ja: {
        selam: { canonical: 'こんにちは', variants: ['こんにちは', 'selam'] },
        ameseginalehu: { canonical: 'ありがとう', variants: ['ありがとう', 'ameseginalehu'] },
        awo: { canonical: 'はい', variants: ['はい', 'awo'] },
        ay: { canonical: 'いいえ', variants: ['いいえ', 'ay'] },
        tiru: { canonical: 'いい', variants: ['いい', 'tiru'] }
      },
      zh: {
        selam: { canonical: '你好', variants: ['你好', 'selam'] },
        ameseginalehu: { canonical: '谢谢', variants: ['谢谢', 'ameseginalehu'] },
        awo: { canonical: '是', variants: ['是', 'awo'] },
        ay: { canonical: '不', variants: ['不', 'ay'] },
        tiru: { canonical: '好', variants: ['好', 'tiru'] }
      },
      hi: {
        selam: { canonical: 'नमस्ते', variants: ['नमस्ते', 'selam'] },
        ameseginalehu: { canonical: 'धन्यवाद', variants: ['धन्यवाद', 'ameseginalehu'] },
        awo: { canonical: 'हाँ', variants: ['हाँ', 'awo'] },
        ay: { canonical: 'नहीं', variants: ['नहीं', 'ay'] },
        tiru: { canonical: 'अच्छा', variants: ['अच्छा', 'tiru'] }
      },
      bn: {
        selam: { canonical: 'নমস্কার', variants: ['নমস্কার', 'selam'] },
        ameseginalehu: { canonical: 'ধন্যবাদ', variants: ['ধন্যবাদ', 'ameseginalehu'] },
        awo: { canonical: 'হ্যাঁ', variants: ['হ্যাঁ', 'awo'] },
        ay: { canonical: 'না', variants: ['না', 'ay'] },
        tiru: { canonical: 'ভালো', variants: ['ভালো', 'tiru'] }
      },
      am: {
        selam: { canonical: 'ሰላም', variants: ['ሰላም'] },
        ameseginalehu: { canonical: 'አመሰግናለሁ', variants: ['አመሰግናለሁ'] },
        awo: { canonical: 'አዎ', variants: ['አዎ'] },
        ay: { canonical: 'አይ', variants: ['አይ'] },
        tiru: { canonical: 'ጥሩ', variants: ['ጥሩ'] }
      },
      he: {
        selam: { canonical: 'שלום', variants: ['שלום', 'selam'] },
        ameseginalehu: { canonical: 'תודה', variants: ['תודה', 'ameseginalehu'] },
        awo: { canonical: 'כן', variants: ['כן', 'awo'] },
        ay: { canonical: 'לא', variants: ['לא', 'ay'] },
        tiru: { canonical: 'טוב', variants: ['טוב', 'tiru'] }
      }
    }
  }
];

// Aggregate all texts by practice language
export const readingTextsByLanguage = {
  hebrew: hebrewReadingTexts,
  arabic: arabicReadingTexts,
  mandarin: mandarinReadingTexts,
  hindi: hindiReadingTexts,
  english: englishReadingTexts,
  spanish: spanishReadingTexts,
  french: frenchReadingTexts,
  portuguese: portugueseReadingTexts,
  russian: russianReadingTexts,
  japanese: japaneseReadingTexts,
  bengali: bengaliReadingTexts,
  amharic: amharicReadingTexts
};

/**
 * Get all reading texts for a specific practice language
 * @param {string} practiceLanguage - Language ID
 * @returns {Array} Reading texts for that language
 */
export function getReadingTextsForLanguage(practiceLanguage) {
  return readingTextsByLanguage[practiceLanguage] || [];
}

/**
 * Get a specific reading text by ID
 * @param {string} textId - Text ID
 * @returns {Object|null} Reading text object or null
 */
export function getReadingTextById(textId) {
  for (const texts of Object.values(readingTextsByLanguage)) {
    const text = texts.find(t => t.id === textId);
    if (text) return text;
  }
  return null;
}
