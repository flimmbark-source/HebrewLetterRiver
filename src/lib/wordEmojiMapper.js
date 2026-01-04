/**
 * Word to Emoji Mapper
 *
 * Maps word IDs or meanings to emoji representations for vocab practice mode
 */

// Common word-to-emoji mappings
const EMOJI_MAP = {
  // Greetings & Basic
  'shalom': '👋',
  'hello': '👋',
  'goodbye': '👋',
  'thanks': '🙏',
  'thank': '🙏',
  'please': '🙏',
  'yes': '✅',
  'no': '❌',

  // People & Pronouns
  'i': '👤',
  'you': '👥',
  'he': '👨',
  'she': '👩',
  'we': '👥',
  'they': '👥',
  'person': '👤',
  'people': '👥',
  'man': '👨',
  'woman': '👩',
  'child': '👶',
  'baby': '👶',
  'friend': '🤝',
  'family': '👨‍👩‍👧‍👦',
  'mother': '👩',
  'father': '👨',
  'brother': '👨',
  'sister': '👩',

  // Time
  'day': '📅',
  'night': '🌙',
  'morning': '🌅',
  'evening': '🌆',
  'today': '📅',
  'tomorrow': '📅',
  'yesterday': '📅',
  'week': '📅',
  'month': '📅',
  'year': '📅',
  'time': '⏰',
  'hour': '⏰',
  'minute': '⏰',
  'now': '⏰',
  'later': '⏰',
  'before': '⏰',
  'after': '⏰',

  // Food & Drink
  'food': '🍽️',
  'eat': '🍽️',
  'drink': '🥤',
  'water': '💧',
  'coffee': '☕',
  'tea': '🍵',
  'bread': '🍞',
  'fruit': '🍎',
  'apple': '🍎',
  'banana': '🍌',
  'milk': '🥛',

  // Emotions & Feelings
  'happy': '😊',
  'sad': '😢',
  'love': '❤️',
  'like': '👍',
  'want': '🙏',
  'need': '🙏',
  'good': '👍',
  'bad': '👎',
  'beautiful': '✨',
  'nice': '👍',

  // Actions & Verbs
  'go': '🚶',
  'come': '🚶',
  'walk': '🚶',
  'run': '🏃',
  'sit': '🪑',
  'stand': '🧍',
  'sleep': '😴',
  'wake': '⏰',
  'work': '💼',
  'study': '📚',
  'read': '📖',
  'write': '✍️',
  'speak': '💬',
  'listen': '👂',
  'see': '👁️',
  'look': '👀',
  'hear': '👂',
  'give': '🤲',
  'take': '✋',
  'make': '🛠️',
  'do': '✅',
  'know': '🧠',
  'think': '💭',
  'understand': '💡',
  'learn': '📚',
  'teach': '👨‍🏫',
  'help': '🤝',
  'ask': '❓',
  'answer': '💬',
  'tell': '💬',
  'say': '💬',
  'call': '📞',

  // Places & Locations
  'home': '🏠',
  'house': '🏠',
  'city': '🏙️',
  'street': '🛣️',
  'school': '🏫',
  'work': '💼',
  'office': '🏢',
  'store': '🏪',
  'shop': '🛍️',
  'market': '🛒',
  'restaurant': '🍽️',
  'cafe': '☕',
  'hospital': '🏥',
  'park': '🌳',
  'beach': '🏖️',
  'mountain': '⛰️',
  'country': '🌍',
  'world': '🌎',

  // Things & Objects
  'book': '📖',
  'phone': '📱',
  'car': '🚗',
  'bus': '🚌',
  'train': '🚂',
  'plane': '✈️',
  'bike': '🚲',
  'computer': '💻',
  'money': '💰',
  'key': '🔑',
  'door': '🚪',
  'window': '🪟',
  'table': '🪑',
  'chair': '🪑',
  'pen': '✒️',
  'paper': '📄',
  'bag': '👜',
  'clothes': '👕',
  'shoes': '👟',
  'hat': '🎩',
  'watch': '⌚',
  'gift': '🎁',
  'flower': '🌸',
  'tree': '🌳',
  'sun': '☀️',
  'moon': '🌙',
  'star': '⭐',
  'rain': '🌧️',
  'snow': '❄️',
  'fire': '🔥',
  'light': '💡',

  // Numbers & Quantities
  'one': '1️⃣',
  'two': '2️⃣',
  'three': '3️⃣',
  'four': '4️⃣',
  'five': '5️⃣',
  'many': '➕',
  'few': '➖',
  'all': '💯',
  'some': '🔢',
  'more': '➕',
  'less': '➖',

  // Question words
  'what': '❓',
  'when': '⏰',
  'where': '📍',
  'who': '👤',
  'why': '❓',
  'how': '❓',
  'which': '❓',

  // Colors
  'red': '🔴',
  'blue': '🔵',
  'green': '🟢',
  'yellow': '🟡',
  'black': '⚫',
  'white': '⚪',
  'color': '🎨',

  // Animals
  'dog': '🐕',
  'cat': '🐈',
  'bird': '🐦',
  'fish': '🐟',
  'animal': '🐾',

  // Default fallback emojis by category
  'verb': '▶️',
  'noun': '📦',
  'adjective': '✨',
  'adverb': '⚡',
  'preposition': '➡️',
  'conjunction': '🔗',
};

/**
 * Get emoji for a word based on its ID, meaning, or translation
 * @param {string} wordId - The word ID
 * @param {string} meaning - The word's meaning in English
 * @param {string} translation - The word's translation/transliteration
 * @returns {string} Emoji representation
 */
export function getWordEmoji(wordId, meaning = '', translation = '') {
  // Try to match by ID first
  const idLower = (wordId || '').toLowerCase();
  if (EMOJI_MAP[idLower]) {
    return EMOJI_MAP[idLower];
  }

  // Try to match by meaning (look for keywords)
  const meaningLower = (meaning || '').toLowerCase();
  for (const [keyword, emoji] of Object.entries(EMOJI_MAP)) {
    if (meaningLower.includes(keyword)) {
      return emoji;
    }
  }

  // Try to match by translation
  const translationLower = (translation || '').toLowerCase();
  if (EMOJI_MAP[translationLower]) {
    return EMOJI_MAP[translationLower];
  }

  // Default emoji based on first letter (for variety)
  const firstChar = (wordId || translation || 'x').charAt(0).toLowerCase();
  const defaultEmojis = ['🔷', '🔶', '🔸', '🔹', '💠', '🔺', '🔻', '⭐', '🌟', '💫', '✨', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎮', '🎯', '🎲', '🧩', '🔮', '💎', '🏆', '🎖️'];
  const index = firstChar.charCodeAt(0) % defaultEmojis.length;
  return defaultEmojis[index];
}

/**
 * Generate a consistent emoji for a word index (alternative approach)
 * @param {number} index - The word index
 * @returns {string} Emoji representation
 */
export function getEmojiByIndex(index) {
  const emojis = ['🔷', '🔶', '🔸', '🔹', '💠', '🔺', '🔻', '⭐', '🌟', '💫', '✨', '🎯', '🎲', '🎪', '🎨', '🎭', '🎬', '🎮', '🧩', '🔮', '💎', '🏆', '🎖️', '🎨', '🌈'];
  return emojis[index % emojis.length];
}
