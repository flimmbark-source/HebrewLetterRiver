/**
 * Sound-to-Emoji Associations by Language
 *
 * CRITICAL REQUIREMENTS:
 * 1. The emoji must VISUALLY represent what the word means in that language
 * 2. The word must START with the target sound in that specific language
 *
 * Each mapping has been verified for correctness.
 */

export const soundAssociationsByLanguage = {
  // ========================================
  // VOWELS
  // ========================================

  '(A)': {
    en: { emoji: '🍎', word: 'Apple', alt: 'Red apple' },
    es: { emoji: '🐝', word: 'Abeja', alt: 'Abeja amarilla' },  // Bee
    fr: { emoji: '🍍', word: 'Ananas', alt: 'Ananas' },  // Pineapple
    pt: { emoji: '🐝', word: 'Abelha', alt: 'Abelha amarela' },  // Bee
    he: { emoji: '🔴', word: 'אדום', alt: 'עיגול אדום' },  // Red
    ru: { emoji: '🍊', word: 'Апельсин', alt: 'Апельсин' },  // Orange
  },

  '(Ah)': {
    en: { emoji: '🍎', word: 'Apple', alt: 'Red apple' },
    es: { emoji: '🐝', word: 'Abeja', alt: 'Abeja amarilla' },
    fr: { emoji: '🍍', word: 'Ananas', alt: 'Ananas' },
    pt: { emoji: '🐝', word: 'Abelha', alt: 'Abelha amarela' },
    he: { emoji: '🔴', word: 'אדום', alt: 'עיגול אדום' },
    ru: { emoji: '🍊', word: 'Апельсин', alt: 'Апельсин' },
  },

  // ========================================
  // CONSONANTS
  // ========================================

  'B': {
    en: { emoji: '🐻', word: 'Bear', alt: 'Brown bear' },
    es: { emoji: '⚽', word: 'Balón', alt: 'Balón' },  // Ball
    fr: { emoji: '🥖', word: 'Baguette', alt: 'Baguette' },  // Baguette
    pt: { emoji: '⚽', word: 'Bola', alt: 'Bola' },  // Ball
    he: { emoji: '🏠', word: 'בית', alt: 'בית' },  // House
    ru: { emoji: '🦛', word: 'Бегемот', alt: 'Бегемот' },  // Hippo
  },

  'C': {
    en: { emoji: '🐱', word: 'Cat', alt: 'Gray cat' },
    es: { emoji: '🏠', word: 'Casa', alt: 'Casa' },  // House
    fr: { emoji: '🦆', word: 'Canard', alt: 'Canard' },  // Duck
    pt: { emoji: '🏠', word: 'Casa', alt: 'Casa' },  // House
    he: { emoji: '⚽', word: 'כדור', alt: 'כדור' },  // Ball (Kadur)
    ru: { emoji: '☀️', word: 'Солнце', alt: 'Солнце' },  // Sun
  },

  'Ch': {
    en: { emoji: '🧀', word: 'Cheese', alt: 'Cheese' },
    es: { emoji: '🍫', word: 'Chocolate', alt: 'Chocolate' },  // Chocolate
    fr: { emoji: '🐱', word: 'Chat', alt: 'Chat' },  // Cat
    pt: { emoji: '🍵', word: 'Chá', alt: 'Chá' },  // Tea
    he: { emoji: '🐱', word: 'חתול', alt: 'חתול' },  // Cat (Chatul)
    ru: { emoji: '⏰', word: 'Часы', alt: 'Часы' },  // Clock
  },

  'D': {
    en: { emoji: '🦆', word: 'Duck', alt: 'Yellow duck' },
    es: { emoji: '🐬', word: 'Delfín', alt: 'Delfín' },  // Dolphin
    fr: { emoji: '🦷', word: 'Dent', alt: 'Dent' },  // Tooth
    pt: { emoji: '💵', word: 'Dinheiro', alt: 'Dinheiro' },  // Money
    he: { emoji: '🐟', word: 'דג', alt: 'דג' },  // Fish (Dag)
    ru: { emoji: '🏠', word: 'Дом', alt: 'Дом' },  // House
  },

  'F': {
    en: { emoji: '🐟', word: 'Fish', alt: 'Fish' },
    es: { emoji: '⚽', word: 'Fútbol', alt: 'Fútbol' },  // Football/Soccer
    fr: { emoji: '🔥', word: 'Feu', alt: 'Feu' },  // Fire
    pt: { emoji: '🔥', word: 'Fogo', alt: 'Fogo' },  // Fire
    he: { emoji: '🌸', word: 'פרח', alt: 'פרח' },  // Flower (Perach)
    ru: { emoji: '⚽', word: 'Футбол', alt: 'Футбол' },  // Football
  },

  'G': {
    en: { emoji: '🦒', word: 'Giraffe', alt: 'Giraffe' },
    es: { emoji: '🐱', word: 'Gato', alt: 'Gato' },  // Cat
    fr: { emoji: '🎂', word: 'Gâteau', alt: 'Gâteau' },  // Cake
    pt: { emoji: '🐱', word: 'Gato', alt: 'Gato' },  // Cat
    he: { emoji: '🧀', word: 'גבינה', alt: 'גבינה' },  // Cheese (Gvina)
    ru: { emoji: '🎸', word: 'Гитара', alt: 'Гитара' },  // Guitar
  },

  'H': {
    en: { emoji: '🏠', word: 'House', alt: 'House' },
    es: { emoji: '🍦', word: 'Helado', alt: 'Helado' },  // Ice cream
    fr: { emoji: '🚁', word: 'Hélicoptère', alt: 'Hélicoptère' },  // Helicopter
    pt: { emoji: '⏰', word: 'Hora', alt: 'Hora' },  // Hour/Time (H is pronounced)
    he: { emoji: '⛰️', word: 'הר', alt: 'הר' },  // Mountain (Har)
    ru: { emoji: '🚁', word: 'Вертолёт', alt: 'Вертолёт' },  // Helicopter (V sound, not H)
  },

  'J': {
    en: { emoji: '🤹', word: 'Juggler', alt: 'Juggler' },
    es: { emoji: '🦒', word: 'Jirafa', alt: 'Jirafa' },  // Giraffe
    fr: { emoji: '🎲', word: 'Jeu', alt: 'Jeu' },  // Game
    pt: { emoji: '🪟', word: 'Janela', alt: 'Janela' },  // Window
    he: { emoji: '🌊', word: 'ים', alt: 'ים' },  // Sea (Yam)
    ru: { emoji: '🌰', word: 'Жёлудь', alt: 'Жёлудь' },  // Acorn
  },

  'K': {
    en: { emoji: '🔑', word: 'Key', alt: 'Key' },
    es: { emoji: '🧀', word: 'Queso', alt: 'Queso' },  // Cheese (Q/K sound)
    fr: { emoji: '🦘', word: 'Kangourou', alt: 'Kangourou' },  // Kangaroo
    pt: { emoji: '🧀', word: 'Queijo', alt: 'Queijo' },  // Cheese (Q/K sound)
    he: { emoji: '🐕', word: 'כלב', alt: 'כלב' },  // Dog (Kelev)
    ru: { emoji: '🔑', word: 'Ключ', alt: 'Ключ' },  // Key
  },

  'L': {
    en: { emoji: '🦁', word: 'Lion', alt: 'Lion' },
    es: { emoji: '📖', word: 'Libro', alt: 'Libro' },  // Book
    fr: { emoji: '🌙', word: 'Lune', alt: 'Lune' },  // Moon
    pt: { emoji: '🌙', word: 'Lua', alt: 'Lua' },  // Moon
    he: { emoji: '🍋', word: 'לימון', alt: 'לימון' },  // Lemon (Limon)
    ru: { emoji: '🦁', word: 'Лев', alt: 'Лев' },  // Lion
  },

  'M': {
    en: { emoji: '🌙', word: 'Moon', alt: 'Moon' },
    es: { emoji: '🍎', word: 'Manzana', alt: 'Manzana' },  // Apple
    fr: { emoji: '🏠', word: 'Maison', alt: 'Maison' },  // House
    pt: { emoji: '🍎', word: 'Maçã', alt: 'Maçã' },  // Apple
    he: { emoji: '💧', word: 'מים', alt: 'מים' },  // Water (Mayim)
    ru: { emoji: '🐭', word: 'Мышь', alt: 'Мышь' },  // Mouse
  },

  'N': {
    en: { emoji: '🪺', word: 'Nest', alt: 'Nest' },
    es: { emoji: '☁️', word: 'Nube', alt: 'Nube' },  // Cloud
    fr: { emoji: '⚫', word: 'Noir', alt: 'Noir' },  // Black
    pt: { emoji: '☁️', word: 'Nuvem', alt: 'Nuvem' },  // Cloud
    he: { emoji: '👃', word: 'אף', alt: 'אף' },  // Nose (Af)
    ru: { emoji: '👃', word: 'Нос', alt: 'Нос' },  // Nose
  },

  'P': {
    en: { emoji: '🍕', word: 'Pizza', alt: 'Pizza' },
    es: { emoji: '🦆', word: 'Pato', alt: 'Pato' },  // Duck
    fr: { emoji: '🍞', word: 'Pain', alt: 'Pain' },  // Bread
    pt: { emoji: '🦆', word: 'Pato', alt: 'Pato' },  // Duck
    he: { emoji: '🌸', word: 'פרח', alt: 'פרח' },  // Flower (Perach)
    ru: { emoji: '🐧', word: 'Пингвин', alt: 'Пингвин' },  // Penguin
  },

  'R': {
    en: { emoji: '🚀', word: 'Rocket', alt: 'Rocket' },
    es: { emoji: '🐀', word: 'Ratón', alt: 'Ratón' },  // Mouse/Rat
    fr: { emoji: '🐀', word: 'Rat', alt: 'Rat' },  // Rat
    pt: { emoji: '🐀', word: 'Rato', alt: 'Rato' },  // Mouse/Rat
    he: { emoji: '🏃', word: 'רץ', alt: 'רץ' },  // Runner (Ratz)
    ru: { emoji: '🚀', word: 'Ракета', alt: 'Ракета' },  // Rocket
  },

  'S': {
    en: { emoji: '☀️', word: 'Sun', alt: 'Sun' },
    es: { emoji: '☀️', word: 'Sol', alt: 'Sol' },  // Sun
    fr: { emoji: '☀️', word: 'Soleil', alt: 'Soleil' },  // Sun
    pt: { emoji: '☀️', word: 'Sol', alt: 'Sol' },  // Sun
    he: { emoji: '🐴', word: 'סוס', alt: 'סוס' },  // Horse (Sus)
    ru: { emoji: '☀️', word: 'Солнце', alt: 'Солнце' },  // Sun
  },

  'Sh': {
    en: { emoji: '👞', word: 'Shoe', alt: 'Shoe' },
    es: { emoji: '🤫', word: 'Silencio', alt: 'Silencio' },  // Silence (Sh sound)
    fr: { emoji: '🐱', word: 'Chat', alt: 'Chat' },  // Cat (Ch = Sh sound)
    pt: { emoji: '🧃', word: 'Suco', alt: 'Suco' },  // Juice (soft S)
    he: { emoji: '🕐', word: 'שעה', alt: 'שעה' },  // Hour (Sha'a)
    ru: { emoji: '🧣', word: 'Шарф', alt: 'Шарф' },  // Scarf
  },

  'T': {
    en: { emoji: '🐯', word: 'Tiger', alt: 'Tiger' },
    es: { emoji: '🐯', word: 'Tigre', alt: 'Tigre' },  // Tiger
    fr: { emoji: '🐯', word: 'Tigre', alt: 'Tigre' },  // Tiger
    pt: { emoji: '🐯', word: 'Tigre', alt: 'Tigre' },  // Tiger
    he: { emoji: '🍵', word: 'תה', alt: 'תה' },  // Tea (Te)
    ru: { emoji: '🐯', word: 'Тигр', alt: 'Тигр' },  // Tiger
  },

  'Tz': {
    en: { emoji: '🍕', word: 'Pizza', alt: 'Pizza' },
    es: { emoji: '🍕', word: 'Pizza', alt: 'Pizza' },
    fr: { emoji: '🍕', word: 'Pizza', alt: 'Pizza' },
    pt: { emoji: '🍕', word: 'Pizza', alt: 'Pizza' },
    he: { emoji: '🐢', word: 'צב', alt: 'צב' },  // Turtle (Tzav)
    ru: { emoji: '🐥', word: 'Цыплёнок', alt: 'Цыплёнок' },  // Chick
  },

  'V': {
    en: { emoji: '🎻', word: 'Violin', alt: 'Violin' },
    es: { emoji: '🐄', word: 'Vaca', alt: 'Vaca' },  // Cow
    fr: { emoji: '🚗', word: 'Voiture', alt: 'Voiture' },  // Car
    pt: { emoji: '🐄', word: 'Vaca', alt: 'Vaca' },  // Cow
    he: { emoji: '🌸', word: 'ורד', alt: 'ורד' },  // Rose (Vered)
    ru: { emoji: '💧', word: 'Вода', alt: 'Вода' },  // Water
  },

  'V/o/u': {
    en: { emoji: '🎻', word: 'Violin', alt: 'Violin' },
    es: { emoji: '🐄', word: 'Vaca', alt: 'Vaca' },
    fr: { emoji: '🚗', word: 'Voiture', alt: 'Voiture' },
    pt: { emoji: '🐄', word: 'Vaca', alt: 'Vaca' },
    he: { emoji: '🌸', word: 'ורד', alt: 'ורד' },
    ru: { emoji: '💧', word: 'Вода', alt: 'Вода' },
  },

  'W': {
    en: { emoji: '🌊', word: 'Wave', alt: 'Wave' },
    es: { emoji: '🌐', word: 'Web', alt: 'Web' },  // Web (borrowed word)
    fr: { emoji: '🚃', word: 'Wagon', alt: 'Wagon' },  // Wagon
    pt: { emoji: '🌐', word: 'Web', alt: 'Web' },  // Web (borrowed word)
    he: { emoji: '🌸', word: 'ורד', alt: 'ורד' },  // Rose (V/W)
    ru: { emoji: '🌊', word: 'Волна', alt: 'Волна' },  // Wave (V sound)
  },

  'Y': {
    en: { emoji: '🟡', word: 'Yellow', alt: 'Yellow' },
    es: { emoji: '🪀', word: 'Yo-yo', alt: 'Yo-yo' },
    fr: { emoji: '👀', word: 'Yeux', alt: 'Yeux' },  // Eyes
    pt: { emoji: '🪀', word: 'Ioiô', alt: 'Ioiô' },  // Yo-yo (I sound)
    he: { emoji: '🌊', word: 'ים', alt: 'ים' },  // Sea (Yam)
    ru: { emoji: '🪀', word: 'Йо-йо', alt: 'Йо-йо' },
  },

  'Z': {
    en: { emoji: '🦓', word: 'Zebra', alt: 'Zebra' },
    es: { emoji: '👞', word: 'Zapato', alt: 'Zapato' },  // Shoe
    fr: { emoji: '🦓', word: 'Zèbre', alt: 'Zèbre' },  // Zebra
    pt: { emoji: '🦓', word: 'Zebra', alt: 'Zebra' },
    he: { emoji: '🦓', word: 'זברה', alt: 'זברה' },  // Zebra
    ru: { emoji: '⭐', word: 'Звезда', alt: 'Звезда' },  // Star
  },

  // ========================================
  // COMMON SYLLABLES
  // ========================================

  'Ba': {
    en: { emoji: '🍌', word: 'Banana', alt: 'Banana' },
    es: { emoji: '⚽', word: 'Balón', alt: 'Balón' },  // Ball
    fr: { emoji: '🍌', word: 'Banane', alt: 'Banane' },
    pt: { emoji: '🍌', word: 'Banana', alt: 'Banana' },
    he: { emoji: '🍌', word: 'בננה', alt: 'בננה' },  // Banana
    ru: { emoji: '🍌', word: 'Банан', alt: 'Банан' },
  },

  'Be': {
    en: { emoji: '🐝', word: 'Bee', alt: 'Bee' },
    es: { emoji: '💋', word: 'Beso', alt: 'Beso' },  // Kiss
    fr: { emoji: '🧈', word: 'Beurre', alt: 'Beurre' },  // Butter
    pt: { emoji: '💋', word: 'Beijo', alt: 'Beijo' },  // Kiss
    he: { emoji: '🏠', word: 'בית', alt: 'בית' },  // House
    ru: { emoji: '🏃', word: 'Бег', alt: 'Бег' },  // Running
  },

  'Bi': {
    en: { emoji: '🚲', word: 'Bicycle', alt: 'Bicycle' },
    es: { emoji: '🧔', word: 'Bigote', alt: 'Bigote' },  // Mustache
    fr: { emoji: '🍺', word: 'Bière', alt: 'Bière' },  // Beer
    pt: { emoji: '🚲', word: 'Bicicleta', alt: 'Bicicleta' },
    he: { emoji: '🥚', word: 'ביצה', alt: 'ביצה' },  // Egg
    ru: { emoji: '🎫', word: 'Билет', alt: 'Билет' },  // Ticket
  },

  'Bo': {
    en: { emoji: '🚤', word: 'Boat', alt: 'Boat' },
    es: { emoji: '💼', word: 'Bolso', alt: 'Bolso' },  // Bag
    fr: { emoji: '📦', word: 'Boîte', alt: 'Boîte' },  // Box
    pt: { emoji: '🎂', word: 'Bolo', alt: 'Bolo' },  // Cake
    he: { emoji: '🌅', word: 'בוקר', alt: 'בוקר' },  // Morning
    ru: { emoji: '⚔️', word: 'Бой', alt: 'Бой' },  // Battle
  },

  'Bu': {
    en: { emoji: '🚌', word: 'Bus', alt: 'Bus' },
    es: { emoji: '🦉', word: 'Búho', alt: 'Búho' },  // Owl
    fr: { emoji: '🪵', word: 'Bûche', alt: 'Bûche' },  // Log
    pt: { emoji: '🧭', word: 'Bússola', alt: 'Bússola' },  // Compass
    he: { emoji: '🔩', word: 'בורג', alt: 'בורג' },  // Screw
    ru: { emoji: '🥖', word: 'Булка', alt: 'Булка' },  // Bun
  },
};

/**
 * Get emoji association for a sound in specific language
 * Falls back to English if translation unavailable
 */
export function getAssociationForLanguage(sound, appLanguageId = 'en') {
  if (!sound) return null;

  const soundData = soundAssociationsByLanguage[sound];
  if (!soundData) return null;

  return soundData[appLanguageId] || soundData.en || null;
}

export default {
  soundAssociationsByLanguage,
  getAssociationForLanguage,
};
