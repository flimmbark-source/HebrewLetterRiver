/**
 * Sound-to-Emoji Associations by Language
 *
 * Maps phonetic sounds to appropriate emojis for each app language.
 * IMPORTANT: The emoji word must START with the target sound in that specific language!
 *
 * Structure: sound → appLanguageId → {emoji, word, alt}
 *
 * Example:
 * - Sound "B" in English: 🐻 "Bear" ✓ (starts with B)
 * - Sound "B" in Spanish: 🥾 "Bota" ✓ (starts with B, not 🐻 "Oso" which starts with O)
 */

export const soundAssociationsByLanguage = {
  // ========================================
  // VOWELS
  // ========================================

  '(A)': {
    en: { emoji: '🍎', word: 'Apple', alt: 'Red apple' },
    es: { emoji: '🐝', word: 'Abeja', alt: 'Abeja amarilla' },
    fr: { emoji: '🍍', word: 'Ananas', alt: 'Ananas' },  // Fixed: Pineapple emoji! Ananas starts with A
    pt: { emoji: '🐝', word: 'Abelha', alt: 'Abelha amarela' },
    he: { emoji: '🔴', word: 'אדום', alt: 'עיגול אדום' },
    ru: { emoji: '🍊', word: 'Апельсин', alt: 'Оранжевый апельсин' },
  },

  '(Ah)': {
    en: { emoji: '🍎', word: 'Apple', alt: 'Red apple' },
    es: { emoji: '🐝', word: 'Abeja', alt: 'Abeja amarilla' },
    fr: { emoji: '🍍', word: 'Ananas', alt: 'Ananas' },  // Fixed: Pineapple emoji! Ananas starts with A
    pt: { emoji: '🐝', word: 'Abelha', alt: 'Abelha amarela' },
    he: { emoji: '🔴', word: 'אדום', alt: 'עיגול אדום' },
    ru: { emoji: '🍊', word: 'Апельсин', alt: 'Оранжевый апельсин' },
  },

  // ========================================
  // CONSONANTS - Basic Sounds
  // ========================================

  'B': {
    en: { emoji: '🐻', word: 'Bear', alt: 'Brown bear' },
    es: { emoji: '🥾', word: 'Bota', alt: 'Bota marrón' },
    fr: { emoji: '🥖', word: 'Baguette', alt: 'Baguette française' },
    pt: { emoji: '⚽', word: 'Bola', alt: 'Bola de futebol' },
    he: { emoji: '🏠', word: 'בית', alt: 'בית קטן' },
    ru: { emoji: '🦛', word: 'Бегемот', alt: 'Бегемот' },
  },

  'C': {
    en: { emoji: '🍒', word: 'Cherry', alt: 'Red cherries' },
    es: { emoji: '🏠', word: 'Casa', alt: 'Casa pequeña' },
    fr: { emoji: '🐸', word: 'Crapaud', alt: 'Crapaud vert' },
    pt: { emoji: '🏠', word: 'Casa', alt: 'Casa pequena' },
    he: { emoji: '⚽', word: 'כדור', alt: 'כדור צבעוני' },  // Fixed: Ball emoji for כדור (ball)
    ru: { emoji: '🧀', word: 'Сыр', alt: 'Кусок сыра' },
  },

  'Ch': {
    en: { emoji: '🧀', word: 'Cheese', alt: 'Cheese wedge' },
    es: { emoji: '🏠', word: 'Choza', alt: 'Choza pequeña' },
    fr: { emoji: '🐱', word: 'Chat', alt: 'Chat gris' },
    pt: { emoji: '🔑', word: 'Chave', alt: 'Chave dourada' },
    he: { emoji: '🐱', word: 'חתול', alt: 'חתול' },
    ru: { emoji: '⏰', word: 'Часы', alt: 'Часы' },
  },

  'D': {
    en: { emoji: '🦆', word: 'Duck', alt: 'Yellow duck' },
    es: { emoji: '🐬', word: 'Delfín', alt: 'Delfín gris' },
    fr: { emoji: '🦷', word: 'Dent', alt: 'Dent blanche' },
    pt: { emoji: '🦷', word: 'Dente', alt: 'Dente branco' },
    he: { emoji: '🐟', word: 'דג', alt: 'דג כתום' },
    ru: { emoji: '🏠', word: 'Дом', alt: 'Маленький дом' },
  },

  'F': {
    en: { emoji: '🐟', word: 'Fish', alt: 'Orange fish' },
    es: { emoji: '⚽', word: 'Fútbol', alt: 'Balón de fútbol' },
    fr: { emoji: '🔥', word: 'Feu', alt: 'Flamme' },
    pt: { emoji: '🔥', word: 'Fogo', alt: 'Chama' },
    he: { emoji: '🌸', word: 'פרח', alt: 'פרח ורוד' },
    ru: { emoji: '⚽', word: 'Футбол', alt: 'Футбольный мяч' },
  },

  'G': {
    en: { emoji: '🍇', word: 'Grapes', alt: 'Purple grapes' },
    es: { emoji: '🐱', word: 'Gato', alt: 'Gato gris' },
    fr: { emoji: '🎂', word: 'Gâteau', alt: 'Gâteau d\'anniversaire' },
    pt: { emoji: '🐱', word: 'Gato', alt: 'Gato cinza' },
    he: { emoji: '🧀', word: 'גבינה', alt: 'פרוסת גבינה' },
    ru: { emoji: '🍇', word: 'Виноград', alt: 'Фиолетовый виноград' },
  },

  'H': {
    en: { emoji: '🏠', word: 'House', alt: 'Small house' },
    es: { emoji: '🍦', word: 'Helado', alt: 'Helado de vainilla' },
    fr: { emoji: '🚁', word: 'Hélicoptère', alt: 'Hélicoptère' },  // Fixed: H is pronounced in Hélicoptère (borrowed word)
    pt: { emoji: '⏰', word: 'Hora', alt: 'Relógio' },
    he: { emoji: '⛰️', word: 'הר', alt: 'הר' },
    ru: { emoji: '🦛', word: 'Гиппопотам', alt: 'Гиппопотам' },
  },

  'J': {
    en: { emoji: '🤹', word: 'Juggler', alt: 'Person juggling' },
    es: { emoji: '🦒', word: 'Jirafa', alt: 'Jirafa amarilla' },
    fr: { emoji: '🎲', word: 'Jeu', alt: 'Jeu de dés' },
    pt: { emoji: '🏞️', word: 'Jardim', alt: 'Jardim' },  // Fixed: Garden/park emoji for Jardim (garden)
    he: { emoji: '🌊', word: 'ים', alt: 'גלי ים' },
    ru: { emoji: '🍃', word: 'Жёлудь', alt: 'Жёлудь' },
  },

  'K': {
    en: { emoji: '🪁', word: 'Kite', alt: 'Colorful kite' },
    es: { emoji: '🦘', word: 'Canguro', alt: 'Canguro' },  // Fixed: Canguro starts with C/K sound
    fr: { emoji: '🦘', word: 'Kangourou', alt: 'Kangourou' },
    pt: { emoji: '🔑', word: 'Chave', alt: 'Chave dourada' },  // K/Ch sound
    he: { emoji: '🐕', word: 'כלב', alt: 'כלב' },
    ru: { emoji: '🔑', word: 'Ключ', alt: 'Ключ' },
  },

  'L': {
    en: { emoji: '🦙', word: 'Llama', alt: 'Brown llama' },
    es: { emoji: '🦙', word: 'Llama', alt: 'Llama marrón' },
    fr: { emoji: '🌙', word: 'Lune', alt: 'Croissant de lune' },
    pt: { emoji: '🌙', word: 'Lua', alt: 'Lua crescente' },
    he: { emoji: '🍋', word: 'לימון', alt: 'לימון צהוב' },
    ru: { emoji: '🦙', word: 'Лама', alt: 'Коричневая лама' },
  },

  'M': {
    en: { emoji: '🐭', word: 'Mouse', alt: 'Gray mouse' },
    es: { emoji: '🍎', word: 'Manzana', alt: 'Manzana roja' },
    fr: { emoji: '🏠', word: 'Maison', alt: 'Petite maison' },
    pt: { emoji: '🍎', word: 'Maçã', alt: 'Maçã vermelha' },
    he: { emoji: '💧', word: 'מים', alt: 'טיפת מים' },
    ru: { emoji: '🐭', word: 'Мышь', alt: 'Серая мышь' },
  },

  'N': {
    en: { emoji: '🪹', word: 'Nest', alt: 'Bird nest' },
    es: { emoji: '☁️', word: 'Nube', alt: 'Nube blanca' },
    fr: { emoji: '🪹', word: 'Nid', alt: 'Nid d\'oiseau' },
    pt: { emoji: '🪹', word: 'Ninho', alt: 'Ninho de pássaro' },
    he: { emoji: '👃', word: 'אף', alt: 'אף' },
    ru: { emoji: '👃', word: 'Нос', alt: 'Человеческий нос' },
  },

  'P': {
    en: { emoji: '🍕', word: 'Pizza', alt: 'Pizza slice' },
    es: { emoji: '🦆', word: 'Pato', alt: 'Pato amarillo' },
    fr: { emoji: '🍕', word: 'Pizza', alt: 'Part de pizza' },
    pt: { emoji: '🦆', word: 'Pato', alt: 'Pato amarelo' },
    he: { emoji: '🌸', word: 'פרח', alt: 'פרח ורוד' },
    ru: { emoji: '🐧', word: 'Пингвин', alt: 'Чёрный пингвин' },
  },

  'R': {
    en: { emoji: '🚀', word: 'Rocket', alt: 'Red rocket' },
    es: { emoji: '🐀', word: 'Ratón', alt: 'Ratón gris' },
    fr: { emoji: '🐀', word: 'Rat', alt: 'Rat gris' },  // Fixed: Rat starts with R in French!
    pt: { emoji: '🐀', word: 'Rato', alt: 'Rato cinza' },
    he: { emoji: '🏃', word: 'רץ', alt: 'אדם רץ' },
    ru: { emoji: '🚀', word: 'Ракета', alt: 'Красная ракета' },
  },

  'S': {
    en: { emoji: '🍜', word: 'Soup', alt: 'Bowl of soup' },
    es: { emoji: '☀️', word: 'Sol', alt: 'Sol brillante' },
    fr: { emoji: '🐒', word: 'Singe', alt: 'Singe' },
    pt: { emoji: '☀️', word: 'Sol', alt: 'Sol brilhante' },
    he: { emoji: '🐴', word: 'סוס', alt: 'סוס חום' },
    ru: { emoji: '☀️', word: 'Солнце', alt: 'Яркое солнце' },
  },

  'Sh': {
    en: { emoji: '👞', word: 'Shoe', alt: 'Brown shoe' },
    es: { emoji: '🤫', word: 'Shh', alt: 'Silencio' },  // Fixed: "Shh" is recognized for Sh sound
    fr: { emoji: '🐈', word: 'Chat', alt: 'Chat gris' },  // Ch in French sounds like Sh
    pt: { emoji: '🤫', word: 'Shh', alt: 'Silêncio' },  // Fixed: "Shh" for Sh sound
    he: { emoji: '🕐', word: 'שעה', alt: 'שעון' },
    ru: { emoji: '🎪', word: 'Шапито', alt: 'Цирковой шатёр' },
  },

  'T': {
    en: { emoji: '🐯', word: 'Tiger', alt: 'Orange tiger' },
    es: { emoji: '🐯', word: 'Tigre', alt: 'Tigre naranja' },
    fr: { emoji: '🐯', word: 'Tigre', alt: 'Tigre orange' },
    pt: { emoji: '🐯', word: 'Tigre', alt: 'Tigre laranja' },
    he: { emoji: '🍵', word: 'תה', alt: 'כוס תה' },
    ru: { emoji: '🐯', word: 'Тигр', alt: 'Оранжевый тигр' },
  },

  'Tz': {
    en: { emoji: '🍕', word: 'Pizza', alt: 'Pizza slice' },
    es: { emoji: '🍕', word: 'Pizza', alt: 'Rebanada de pizza' },
    fr: { emoji: '🍕', word: 'Pizza', alt: 'Part de pizza' },
    pt: { emoji: '🍕', word: 'Pizza', alt: 'Fatia de pizza' },
    he: { emoji: '🐢', word: 'צב', alt: 'צב ירוק' },
    ru: { emoji: '🐥', word: 'Цыплёнок', alt: 'Жёлтый цыплёнок' },
  },

  'V': {
    en: { emoji: '🎻', word: 'Violin', alt: 'Brown violin' },
    es: { emoji: '🐄', word: 'Vaca', alt: 'Vaca blanca y negra' },
    fr: { emoji: '🚗', word: 'Voiture', alt: 'Voiture rouge' },
    pt: { emoji: '🐄', word: 'Vaca', alt: 'Vaca branca e preta' },
    he: { emoji: '🩷', word: 'ורוד', alt: 'לב ורוד' },
    ru: { emoji: '💧', word: 'Вода', alt: 'Капля воды' },
  },

  'V/o/u': {
    en: { emoji: '🎻', word: 'Violin', alt: 'Brown violin' },
    es: { emoji: '🐄', word: 'Vaca', alt: 'Vaca blanca y negra' },
    fr: { emoji: '🚗', word: 'Voiture', alt: 'Voiture rouge' },
    pt: { emoji: '🐄', word: 'Vaca', alt: 'Vaca branca e preta' },
    he: { emoji: '🩷', word: 'ורוד', alt: 'לב ורוד' },
    ru: { emoji: '💧', word: 'Вода', alt: 'Капля воды' },
  },

  'W': {
    en: { emoji: '🌊', word: 'Wave', alt: 'Ocean wave' },
    es: { emoji: '🚂', word: 'Vagón', alt: 'Vagón de tren' },  // Fixed: V/W sound in Spanish
    fr: { emoji: '🚃', word: 'Wagon', alt: 'Wagon' },  // Fixed: Wagon starts with W
    pt: { emoji: '🚂', word: 'Vagão', alt: 'Vagão de trem' },  // Fixed: V/W sound in Portuguese
    he: { emoji: '🩷', word: 'ורוד', alt: 'לב ורוד' },
    ru: { emoji: '🌊', word: 'Волна', alt: 'Океанская волна' },
  },

  'Y': {
    en: { emoji: '🪀', word: 'Yo-yo', alt: 'Red yo-yo' },
    es: { emoji: '🪀', word: 'Yo-yo', alt: 'Yo-yo rojo' },
    fr: { emoji: '👀', word: 'Yeux', alt: 'Yeux' },
    pt: { emoji: '🪀', word: 'Ioiô', alt: 'Ioiô vermelho' },
    he: { emoji: '🌊', word: 'ים', alt: 'גלי ים' },
    ru: { emoji: '🪀', word: 'Йо-йо', alt: 'Красное йо-йо' },
  },

  'Z': {
    en: { emoji: '🦓', word: 'Zebra', alt: 'Striped zebra' },
    es: { emoji: '👞', word: 'Zapato', alt: 'Zapato marrón' },
    fr: { emoji: '🦓', word: 'Zèbre', alt: 'Zèbre rayé' },
    pt: { emoji: '🦓', word: 'Zebra', alt: 'Zebra listrada' },
    he: { emoji: '🦓', word: 'זברה', alt: 'זברה מפוספסת' },
    ru: { emoji: '🦓', word: 'Зебра', alt: 'Полосатая зебра' },
  },

  // ========================================
  // SYLLABLES - Common combinations
  // ========================================

  'Ba': {
    en: { emoji: '🍌', word: 'Banana', alt: 'Yellow banana' },
    es: { emoji: '⚽', word: 'Balón', alt: 'Balón de fútbol' },
    fr: { emoji: '🍌', word: 'Banane', alt: 'Banane jaune' },
    pt: { emoji: '🍌', word: 'Banana', alt: 'Banana amarela' },
    he: { emoji: '🍌', word: 'בננה', alt: 'בננה צהובה' },
    ru: { emoji: '🍌', word: 'Банан', alt: 'Жёлтый банан' },
  },

  'Be': {
    en: { emoji: '🐝', word: 'Bee', alt: 'Yellow bee' },
    es: { emoji: '💋', word: 'Beso', alt: 'Beso' },
    fr: { emoji: '🧈', word: 'Beurre', alt: 'Beurre' },
    pt: { emoji: '💋', word: 'Beijo', alt: 'Beijo' },
    he: { emoji: '🏠', word: 'בית', alt: 'בית קטן' },
    ru: { emoji: '🏃', word: 'Бег', alt: 'Бег' },
  },

  'Bi': {
    en: { emoji: '🐦', word: 'Bird', alt: 'Blue bird' },
    es: { emoji: '🧔', word: 'Bigote', alt: 'Bigote' },
    fr: { emoji: '🍺', word: 'Bière', alt: 'Bière' },
    pt: { emoji: '🚲', word: 'Bicicleta', alt: 'Bicicleta' },
    he: { emoji: '🥚', word: 'ביצה', alt: 'ביצה לבנה' },
    ru: { emoji: '🎫', word: 'Билет', alt: 'Билет' },
  },

  'Bo': {
    en: { emoji: '🚤', word: 'Boat', alt: 'Small boat' },
    es: { emoji: '👄', word: 'Boca', alt: 'Boca' },
    fr: { emoji: '🥾', word: 'Botte', alt: 'Botte' },
    pt: { emoji: '🎂', word: 'Bolo', alt: 'Bolo' },
    he: { emoji: '🌅', word: 'בוקר', alt: 'זריחה' },
    ru: { emoji: '📦', word: 'Коробка', alt: 'Коробка' },
  },

  'Bu': {
    en: { emoji: '🪲', word: 'Bug', alt: 'Green bug' },
    es: { emoji: '🦉', word: 'Búho', alt: 'Búho' },
    fr: { emoji: '🪵', word: 'Bois', alt: 'Bûche' },
    pt: { emoji: '🧭', word: 'Bússola', alt: 'Bússola' },
    he: { emoji: '🔩', word: 'בורג', alt: 'בורג' },
    ru: { emoji: '🥖', word: 'Булка', alt: 'Булка' },  // Fixed: Булка (bun/bread roll) starts with Б
  },

  // Add more syllables as needed - these demonstrate the pattern
};

/**
 * Get emoji association for a sound in specific language
 * Falls back to English if translation unavailable
 *
 * @param {string} sound - The phonetic sound
 * @param {string} appLanguageId - The app language ID
 * @returns {object|null} {emoji, word, alt} or null
 */
export function getAssociationForLanguage(sound, appLanguageId = 'en') {
  if (!sound) return null;

  const soundData = soundAssociationsByLanguage[sound];
  if (!soundData) return null;

  // Return association for requested language, fallback to English
  return soundData[appLanguageId] || soundData.en || null;
}

export default {
  soundAssociationsByLanguage,
  getAssociationForLanguage,
};
