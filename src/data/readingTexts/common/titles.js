/**
 * Common title and subtitle translations for reading texts.
 * These can be reused across different language exercises.
 */

/**
 * Get "Starter Words (N)" title in all languages
 * @param {number} count - Number of words
 * @returns {Object} Title translations
 */
export function getStarterWordsTitle(count = 5) {
  return {
    en: `Starter Words (${count})`,
    es: `Palabras Iniciales (${count})`,
    fr: `Mots de Base (${count})`,
    ar: `كلمات أساسية (${toArabicNumeral(count)})`,
    pt: `Palavras Iniciais (${count})`,
    ru: `Начальные Слова (${count})`,
    ja: `基本単語 (${count})`,
    zh: `基础词汇 (${count})`,
    hi: `बुनियादी शब्द (${count})`,
    bn: `প্রাথমিক শব্দ (${toBengaliNumeral(count)})`,
    am: `መሰረታዊ ቃላት (${count})`,
    he: `מילים בסיסיות (${count})`
  };
}

/**
 * Get "Greetings (N)" title in all languages
 * @param {number} count - Number of words
 * @returns {Object} Title translations
 */
export function getGreetingsTitle(count = 6) {
  return {
    en: `Greetings (${count})`,
    es: `Saludos (${count})`,
    fr: `Salutations (${count})`,
    ar: `تحيات (${toArabicNumeral(count)})`,
    pt: `Saudações (${count})`,
    ru: `Приветствия (${count})`,
    ja: `挨拶 (${count})`,
    zh: `问候语 (${count})`,
    hi: `अभिवादन (${count})`,
    bn: `শুভেচ্ছা (${toBengaliNumeral(count)})`,
    am: `ሰላምታዎች (${count})`,
    he: `ברכות (${count})`
  };
}

/**
 * Get subtitle for common words in a specific language
 * @param {string} languageName - Name of the language in English
 * @returns {Object} Subtitle translations
 */
export function getCommonWordsSubtitle(languageName) {
  return {
    en: `Common ${languageName} words`,
    es: `Palabras ${getLanguageNameInSpanish(languageName)} comunes`,
    fr: `Mots ${getLanguageNameInFrench(languageName)} courants`,
    ar: getCommonWordsInArabic(languageName),
    pt: `Palavras ${getLanguageNameInPortuguese(languageName)} comuns`,
    ru: getCommonWordsInRussian(languageName),
    ja: getCommonWordsInJapanese(languageName),
    zh: getCommonWordsInChinese(languageName),
    hi: getCommonWordsInHindi(languageName),
    bn: getCommonWordsInBengali(languageName),
    am: getCommonWordsInAmharic(languageName),
    he: getCommonWordsInHebrew(languageName)
  };
}

/**
 * Get subtitle for greetings in a specific language
 * @param {string} languageName - Name of the language in English
 * @returns {Object} Subtitle translations
 */
export function getGreetingsSubtitle(languageName) {
  return {
    en: `Common ${languageName} greetings`,
    es: `Saludos ${getLanguageNameInSpanish(languageName)} comunes`,
    fr: `Salutations ${getLanguageNameInFrench(languageName)} courantes`,
    ar: getGreetingsInArabic(languageName),
    pt: `Saudações ${getLanguageNameInPortuguese(languageName)} comuns`,
    ru: getGreetingsInRussian(languageName),
    ja: getGreetingsInJapanese(languageName),
    zh: getGreetingsInChinese(languageName),
    hi: getGreetingsInHindi(languageName),
    bn: getGreetingsInBengali(languageName),
    am: getGreetingsInAmharic(languageName),
    he: getGreetingsInHebrew(languageName)
  };
}

// Helper functions for language names in different languages
function getLanguageNameInSpanish(lang) {
  const names = {
    'English': 'inglesas',
    'Hebrew': 'hebreas',
    'Arabic': 'árabes',
    'Mandarin': 'chinas',
    'Hindi': 'hindi',
    'Spanish': 'españolas',
    'French': 'francesas',
    'Portuguese': 'portuguesas',
    'Russian': 'rusas',
    'Japanese': 'japonesas',
    'Bengali': 'bengalíes',
    'Amharic': 'amáricas'
  };
  return names[lang] || lang.toLowerCase();
}

function getLanguageNameInFrench(lang) {
  const names = {
    'English': 'anglais',
    'Hebrew': 'hébreux',
    'Arabic': 'arabes',
    'Mandarin': 'chinois',
    'Hindi': 'hindi',
    'Spanish': 'espagnols',
    'French': 'français',
    'Portuguese': 'portugais',
    'Russian': 'russes',
    'Japanese': 'japonais',
    'Bengali': 'bengalis',
    'Amharic': 'amhariques'
  };
  return names[lang] || lang.toLowerCase();
}

function getLanguageNameInPortuguese(lang) {
  const names = {
    'English': 'inglesas',
    'Hebrew': 'hebraicas',
    'Arabic': 'árabes',
    'Mandarin': 'chinesas',
    'Hindi': 'hindi',
    'Spanish': 'espanholas',
    'French': 'francesas',
    'Portuguese': 'portuguesas',
    'Russian': 'russas',
    'Japanese': 'japonesas',
    'Bengali': 'bengali',
    'Amharic': 'amárico'
  };
  return names[lang] || lang.toLowerCase();
}

function getCommonWordsInArabic(lang) {
  const names = {
    'English': 'كلمات إنجليزية شائعة',
    'Hebrew': 'كلمات عبرية شائعة',
    'Arabic': 'كلمات عربية شائعة',
    'Mandarin': 'كلمات صينية شائعة',
    'Hindi': 'كلمات هندية شائعة',
    'Spanish': 'كلمات إسبانية شائعة',
    'French': 'كلمات فرنسية شائعة',
    'Portuguese': 'كلمات برتغالية شائعة',
    'Russian': 'كلمات روسية شائعة',
    'Japanese': 'كلمات يابانية شائعة',
    'Bengali': 'كلمات بنغالية شائعة',
    'Amharic': 'كلمات أمهرية شائعة'
  };
  return names[lang] || `كلمات شائعة`;
}

function getCommonWordsInRussian(lang) {
  const names = {
    'English': 'Общие английские слова',
    'Hebrew': 'Общие еврейские слова',
    'Arabic': 'Общие арабские слова',
    'Mandarin': 'Общие китайские слова',
    'Hindi': 'Общие слова на хинди',
    'Spanish': 'Общие испанские слова',
    'French': 'Общие французские слова',
    'Portuguese': 'Общие португальские слова',
    'Russian': 'Общие русские слова',
    'Japanese': 'Общие японские слова',
    'Bengali': 'Общие бенгальские слова',
    'Amharic': 'Общие амхарские слова'
  };
  return names[lang] || `Общие слова`;
}

function getCommonWordsInJapanese(lang) {
  const names = {
    'English': '一般的な英語の単語',
    'Hebrew': '一般的なヘブライ語の単語',
    'Arabic': '一般的なアラビア語の単語',
    'Mandarin': '一般的な中国語の単語',
    'Hindi': '一般的なヒンディー語の単語',
    'Spanish': '一般的なスペイン語の単語',
    'French': '一般的なフランス語の単語',
    'Portuguese': '一般的なポルトガル語の単語',
    'Russian': '一般的なロシア語の単語',
    'Japanese': '一般的な日本語の単語',
    'Bengali': '一般的なベンガル語の単語',
    'Amharic': '一般的なアムハラ語の単語'
  };
  return names[lang] || `一般的な単語`;
}

function getCommonWordsInChinese(lang) {
  const names = {
    'English': '常用英语词汇',
    'Hebrew': '常用希伯来语词汇',
    'Arabic': '常用阿拉伯语词汇',
    'Mandarin': '常用中文词汇',
    'Hindi': '常用印地语词汇',
    'Spanish': '常用西班牙语词汇',
    'French': '常用法语词汇',
    'Portuguese': '常用葡萄牙语词汇',
    'Russian': '常用俄语词汇',
    'Japanese': '常用日语词汇',
    'Bengali': '常用孟加拉语词汇',
    'Amharic': '常用阿姆哈拉语词汇'
  };
  return names[lang] || `常用词汇`;
}

function getCommonWordsInHindi(lang) {
  const names = {
    'English': 'सामान्य अंग्रेज़ी शब्द',
    'Hebrew': 'सामान्य हिब्रू शब्द',
    'Arabic': 'सामान्य अरबी शब्द',
    'Mandarin': 'सामान्य चीनी शब्द',
    'Hindi': 'सामान्य हिन्दी शब्द',
    'Spanish': 'सामान्य स्पेनिश शब्द',
    'French': 'सामान्य फ्रेंच शब्द',
    'Portuguese': 'सामान्य पुर्तगाली शब्द',
    'Russian': 'सामान्य रूसी शब्द',
    'Japanese': 'सामान्य जापानी शब्द',
    'Bengali': 'सामान्य बंगाली शब्द',
    'Amharic': 'सामान्य अम्हारिक शब्द'
  };
  return names[lang] || `सामान्य शब्द`;
}

function getCommonWordsInBengali(lang) {
  const names = {
    'English': 'সাধারণ ইংরেজি শব্দ',
    'Hebrew': 'সাধারণ হিব্রু শব্দ',
    'Arabic': 'সাধারণ আরবি শব্দ',
    'Mandarin': 'সাধারণ চীনা শব্দ',
    'Hindi': 'সাধারণ হিন্দি শব্দ',
    'Spanish': 'সাধারণ স্প্যানিশ শব্দ',
    'French': 'সাধারণ ফরাসি শব্দ',
    'Portuguese': 'সাধারণ পর্তুগিজ শব্দ',
    'Russian': 'সাধারণ রুশ শব্দ',
    'Japanese': 'সাধারণ জাপানি শব্দ',
    'Bengali': 'সাধারণ বাংলা শব্দ',
    'Amharic': 'সাধারণ আমহারিক শব্দ'
  };
  return names[lang] || `সাধারণ শব্দ`;
}

function getCommonWordsInAmharic(lang) {
  const names = {
    'English': 'የተለመዱ የእንግሊዝኛ ቃላት',
    'Hebrew': 'የተለመዱ የዕብራይስጥ ቃላት',
    'Arabic': 'የተለመዱ የአረብኛ ቃላት',
    'Mandarin': 'የተለመዱ የቻይንኛ ቃላት',
    'Hindi': 'የተለመዱ የሂንዲ ቃላት',
    'Spanish': 'የተለመዱ የስፓኒሽ ቃላት',
    'French': 'የተለመዱ የፈረንሳይ ቃላት',
    'Portuguese': 'የተለመዱ የፖርቱጋል ቃላት',
    'Russian': 'የተለመዱ የሩሲያኛ ቃላት',
    'Japanese': 'የተለመዱ የጃፓን ቃላት',
    'Bengali': 'የተለመዱ የቤንጋሊ ቃላት',
    'Amharic': 'የተለመዱ የአማርኛ ቃላት'
  };
  return names[lang] || `የተለመዱ ቃላት`;
}

function getCommonWordsInHebrew(lang) {
  const names = {
    'English': 'מילים נפוצות באנגלית',
    'Hebrew': 'מילים עבריות נפוצות',
    'Arabic': 'מילים נפוצות בערבית',
    'Mandarin': 'מילים נפוצות בסינית',
    'Hindi': 'מילים נפוצות בהינדי',
    'Spanish': 'מילים נפוצות בספרדית',
    'French': 'מילים נפוצות בצרפתית',
    'Portuguese': 'מילים נפוצות בפורטוגזית',
    'Russian': 'מילים נפוצות ברוסית',
    'Japanese': 'מילים נפוצות ביפנית',
    'Bengali': 'מילים נפוצות בבנגלית',
    'Amharic': 'מילים נפוצות באמהרית'
  };
  return names[lang] || `מילים נפוצות`;
}

function getGreetingsInArabic(lang) {
  const names = {
    'Hebrew': 'التحيات العبرية الشائعة'
  };
  return names[lang] || `التحيات الشائعة`;
}

function getGreetingsInRussian(lang) {
  const names = {
    'Hebrew': 'Общие еврейские приветствия'
  };
  return names[lang] || `Общие приветствия`;
}

function getGreetingsInJapanese(lang) {
  const names = {
    'Hebrew': '一般的なヘブライ語の挨拶'
  };
  return names[lang] || `一般的な挨拶`;
}

function getGreetingsInChinese(lang) {
  const names = {
    'Hebrew': '常用希伯来语问候语'
  };
  return names[lang] || `常用问候语`;
}

function getGreetingsInHindi(lang) {
  const names = {
    'Hebrew': 'सामान्य हिब्रू अभिवादन'
  };
  return names[lang] || `सामान्य अभिवादन`;
}

function getGreetingsInBengali(lang) {
  const names = {
    'Hebrew': 'সাধারণ হিব্রু শুভেচ্ছা'
  };
  return names[lang] || `সাধারণ শুভেচ্ছা`;
}

function getGreetingsInAmharic(lang) {
  const names = {
    'Hebrew': 'የተለመዱ የዕብራይስጥ ሰላምታዎች'
  };
  return names[lang] || `የተለመዱ ሰላምታዎች`;
}

function getGreetingsInHebrew(lang) {
  const names = {
    'Hebrew': 'ברכות עבריות נפוצות'
  };
  return names[lang] || `ברכות נפוצות`;
}

// Numeral conversion helpers
function toArabicNumeral(num) {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).split('').map(d => arabicNumerals[parseInt(d)] || d).join('');
}

function toBengaliNumeral(num) {
  const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => bengaliNumerals[parseInt(d)] || d).join('');
}
