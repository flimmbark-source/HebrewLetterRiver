/**
 * Cafe Talk Canonical Word List
 *
 * This is the single source of truth for all Cafe Talk vocabulary.
 * Each word has a stable ID and English reference text.
 * This file is used ONLY for:
 * - Generating translations via DeepL
 * - Validation
 * - Building lexicons
 *
 * DO NOT import this for runtime token generation in non-English languages.
 * Use language-specific lexicons instead.
 */

/**
 * All Cafe Talk words with stable IDs and English reference text
 */
export const CAFE_TALK_WORDS = [
  // Conversation Glue (25 words)
  { id: 'so', en: 'so' },
  { id: 'but', en: 'but' },
  { id: 'well', en: 'well' },
  { id: 'actually', en: 'actually' },
  { id: 'maybe', en: 'maybe' },
  { id: 'probably', en: 'probably' },
  { id: 'basically', en: 'basically' },
  { id: 'anyway', en: 'anyway' },
  { id: 'also', en: 'also' },
  { id: 'too', en: 'too' },
  { id: 'either', en: 'either' },
  { id: 'neither', en: 'neither' },
  { id: 'however', en: 'however' },
  { id: 'therefore', en: 'therefore' },
  { id: 'meanwhile', en: 'meanwhile' },
  { id: 'besides', en: 'besides' },
  { id: 'instead', en: 'instead' },
  { id: 'otherwise', en: 'otherwise' },
  { id: 'still', en: 'still' },
  { id: 'yet', en: 'yet' },
  { id: 'just', en: 'just' },
  { id: 'even', en: 'even' },
  { id: 'already', en: 'already' },
  { id: 'almost', en: 'almost' },
  { id: 'quite', en: 'quite' },

  // Time & Sequencing (20 words)
  { id: 'now', en: 'now' },
  { id: 'then', en: 'then' },
  { id: 'when', en: 'when' },
  { id: 'before', en: 'before' },
  { id: 'after', en: 'after' },
  { id: 'during', en: 'during' },
  { id: 'while', en: 'while' },
  { id: 'until', en: 'until' },
  { id: 'since', en: 'since' },
  { id: 'today', en: 'today' },
  { id: 'yesterday', en: 'yesterday' },
  { id: 'tomorrow', en: 'tomorrow' },
  { id: 'soon', en: 'soon' },
  { id: 'later', en: 'later' },
  { id: 'early', en: 'early' },
  { id: 'late', en: 'late' },
  { id: 'always', en: 'always' },
  { id: 'never', en: 'never' },
  { id: 'sometimes', en: 'sometimes' },
  { id: 'often', en: 'often' },

  // People Words (18 words)
  { id: 'I', en: 'I' },
  { id: 'you', en: 'you' },
  { id: 'he', en: 'he' },
  { id: 'she', en: 'she' },
  { id: 'we', en: 'we' },
  { id: 'they', en: 'they' },
  { id: 'who', en: 'who' },
  { id: 'someone', en: 'someone' },
  { id: 'everyone', en: 'everyone' },
  { id: 'nobody', en: 'nobody' },
  { id: 'friend', en: 'friend' },
  { id: 'family', en: 'family' },
  { id: 'person', en: 'person' },
  { id: 'people', en: 'people' },
  { id: 'child', en: 'child' },
  { id: 'parent', en: 'parent' },
  { id: 'neighbor', en: 'neighbor' },
  { id: 'stranger', en: 'stranger' },

  // Core Story Verbs (22 words)
  { id: 'go', en: 'go' },
  { id: 'come', en: 'come' },
  { id: 'see', en: 'see' },
  { id: 'hear', en: 'hear' },
  { id: 'say', en: 'say' },
  { id: 'tell', en: 'tell' },
  { id: 'ask', en: 'ask' },
  { id: 'think', en: 'think' },
  { id: 'know', en: 'know' },
  { id: 'want', en: 'want' },
  { id: 'need', en: 'need' },
  { id: 'like', en: 'like' },
  { id: 'love', en: 'love' },
  { id: 'hate', en: 'hate' },
  { id: 'make', en: 'make' },
  { id: 'do', en: 'do' },
  { id: 'get', en: 'get' },
  { id: 'give', en: 'give' },
  { id: 'take', en: 'take' },
  { id: 'find', en: 'find' },
  { id: 'lose', en: 'lose' },
  { id: 'try', en: 'try' },

  // Life Logistics (20 words)
  { id: 'eat', en: 'eat' },
  { id: 'drink', en: 'drink' },
  { id: 'sleep', en: 'sleep' },
  { id: 'work', en: 'work' },
  { id: 'study', en: 'study' },
  { id: 'home', en: 'home' },
  { id: 'house', en: 'house' },
  { id: 'place', en: 'place' },
  { id: 'time', en: 'time' },
  { id: 'day', en: 'day' },
  { id: 'money', en: 'money' },
  { id: 'buy', en: 'buy' },
  { id: 'pay', en: 'pay' },
  { id: 'help', en: 'help' },
  { id: 'wait', en: 'wait' },
  { id: 'leave', en: 'leave' },
  { id: 'arrive', en: 'arrive' },
  { id: 'start', en: 'start' },
  { id: 'finish', en: 'finish' },
  { id: 'stop', en: 'stop' },

  // Reactions & Feelings (20 words)
  { id: 'happy', en: 'happy' },
  { id: 'sad', en: 'sad' },
  { id: 'angry', en: 'angry' },
  { id: 'scared', en: 'scared' },
  { id: 'surprised', en: 'surprised' },
  { id: 'tired', en: 'tired' },
  { id: 'excited', en: 'excited' },
  { id: 'bored', en: 'bored' },
  { id: 'worried', en: 'worried' },
  { id: 'confused', en: 'confused' },
  { id: 'okay', en: 'okay' },
  { id: 'fine', en: 'fine' },
  { id: 'great', en: 'great' },
  { id: 'bad', en: 'bad' },
  { id: 'terrible', en: 'terrible' },
  { id: 'wonderful', en: 'wonderful' },
  { id: 'nice', en: 'nice' },
  { id: 'beautiful', en: 'beautiful' },
  { id: 'ugly', en: 'ugly' },
  { id: 'strange', en: 'strange' },

  // Everyday Topics (20 words)
  { id: 'food', en: 'food' },
  { id: 'water', en: 'water' },
  { id: 'coffee', en: 'coffee' },
  { id: 'weather', en: 'weather' },
  { id: 'book', en: 'book' },
  { id: 'phone', en: 'phone' },
  { id: 'car', en: 'car' },
  { id: 'street', en: 'street' },
  { id: 'city', en: 'city' },
  { id: 'country', en: 'country' },
  { id: 'language', en: 'language' },
  { id: 'word', en: 'word' },
  { id: 'thing', en: 'thing' },
  { id: 'something', en: 'something' },
  { id: 'nothing', en: 'nothing' },
  { id: 'everything', en: 'everything' },
  { id: 'problem', en: 'problem' },
  { id: 'question', en: 'question' },
  { id: 'answer', en: 'answer' },
  { id: 'idea', en: 'idea' }
];

/**
 * Cafe Talk categories with word IDs split into manageable chunks (5-8 words each)
 */
export const CAFE_TALK_CATEGORIES = {
  // Conversation Glue - 25 words split into 4 chunks
  conversationGlue1: {
    id: 'conversationGlue1',
    parentCategory: 'conversationGlue',
    chunkNumber: 1,
    wordIds: ['so', 'but', 'well', 'actually', 'maybe', 'probably']
  },
  conversationGlue2: {
    id: 'conversationGlue2',
    parentCategory: 'conversationGlue',
    chunkNumber: 2,
    wordIds: ['basically', 'anyway', 'also', 'too', 'either', 'neither', 'however']
  },
  conversationGlue3: {
    id: 'conversationGlue3',
    parentCategory: 'conversationGlue',
    chunkNumber: 3,
    wordIds: ['therefore', 'meanwhile', 'besides', 'instead', 'otherwise', 'still']
  },
  conversationGlue4: {
    id: 'conversationGlue4',
    parentCategory: 'conversationGlue',
    chunkNumber: 4,
    wordIds: ['yet', 'just', 'even', 'already', 'almost', 'quite']
  },

  // Time & Sequencing - 20 words split into 3 chunks
  timeSequencing1: {
    id: 'timeSequencing1',
    parentCategory: 'timeSequencing',
    chunkNumber: 1,
    wordIds: ['now', 'then', 'when', 'before', 'after', 'during', 'while']
  },
  timeSequencing2: {
    id: 'timeSequencing2',
    parentCategory: 'timeSequencing',
    chunkNumber: 2,
    wordIds: ['until', 'since', 'today', 'yesterday', 'tomorrow', 'soon']
  },
  timeSequencing3: {
    id: 'timeSequencing3',
    parentCategory: 'timeSequencing',
    chunkNumber: 3,
    wordIds: ['later', 'early', 'late', 'always', 'never', 'sometimes', 'often']
  },

  // People Words - 18 words split into 3 chunks
  peopleWords1: {
    id: 'peopleWords1',
    parentCategory: 'peopleWords',
    chunkNumber: 1,
    wordIds: ['I', 'you', 'he', 'she', 'we', 'they']
  },
  peopleWords2: {
    id: 'peopleWords2',
    parentCategory: 'peopleWords',
    chunkNumber: 2,
    wordIds: ['who', 'someone', 'everyone', 'nobody', 'friend', 'family']
  },
  peopleWords3: {
    id: 'peopleWords3',
    parentCategory: 'peopleWords',
    chunkNumber: 3,
    wordIds: ['person', 'people', 'child', 'parent', 'neighbor', 'stranger']
  },

  // Core Story Verbs - 22 words split into 3 chunks
  coreStoryVerbs1: {
    id: 'coreStoryVerbs1',
    parentCategory: 'coreStoryVerbs',
    chunkNumber: 1,
    wordIds: ['go', 'come', 'see', 'hear', 'say', 'tell', 'ask', 'think']
  },
  coreStoryVerbs2: {
    id: 'coreStoryVerbs2',
    parentCategory: 'coreStoryVerbs',
    chunkNumber: 2,
    wordIds: ['know', 'want', 'need', 'like', 'love', 'hate', 'make']
  },
  coreStoryVerbs3: {
    id: 'coreStoryVerbs3',
    parentCategory: 'coreStoryVerbs',
    chunkNumber: 3,
    wordIds: ['do', 'get', 'give', 'take', 'find', 'lose', 'try']
  },

  // Life Logistics - 20 words split into 3 chunks
  lifeLogistics1: {
    id: 'lifeLogistics1',
    parentCategory: 'lifeLogistics',
    chunkNumber: 1,
    wordIds: ['eat', 'drink', 'sleep', 'work', 'study', 'home', 'house']
  },
  lifeLogistics2: {
    id: 'lifeLogistics2',
    parentCategory: 'lifeLogistics',
    chunkNumber: 2,
    wordIds: ['place', 'time', 'day', 'money', 'buy', 'pay']
  },
  lifeLogistics3: {
    id: 'lifeLogistics3',
    parentCategory: 'lifeLogistics',
    chunkNumber: 3,
    wordIds: ['help', 'wait', 'leave', 'arrive', 'start', 'finish', 'stop']
  },

  // Reactions & Feelings - 20 words split into 3 chunks
  reactionsFeelings1: {
    id: 'reactionsFeelings1',
    parentCategory: 'reactionsFeelings',
    chunkNumber: 1,
    wordIds: ['happy', 'sad', 'angry', 'scared', 'surprised', 'tired', 'excited']
  },
  reactionsFeelings2: {
    id: 'reactionsFeelings2',
    parentCategory: 'reactionsFeelings',
    chunkNumber: 2,
    wordIds: ['bored', 'worried', 'confused', 'okay', 'fine', 'great']
  },
  reactionsFeelings3: {
    id: 'reactionsFeelings3',
    parentCategory: 'reactionsFeelings',
    chunkNumber: 3,
    wordIds: ['bad', 'terrible', 'wonderful', 'nice', 'beautiful', 'ugly', 'strange']
  },

  // Everyday Topics - 20 words split into 3 chunks
  everydayTopics1: {
    id: 'everydayTopics1',
    parentCategory: 'everydayTopics',
    chunkNumber: 1,
    wordIds: ['food', 'water', 'coffee', 'weather', 'book', 'phone', 'car']
  },
  everydayTopics2: {
    id: 'everydayTopics2',
    parentCategory: 'everydayTopics',
    chunkNumber: 2,
    wordIds: ['street', 'city', 'country', 'language', 'word', 'thing']
  },
  everydayTopics3: {
    id: 'everydayTopics3',
    parentCategory: 'everydayTopics',
    chunkNumber: 3,
    wordIds: ['something', 'nothing', 'everything', 'problem', 'question', 'answer', 'idea']
  }
};

/**
 * Get all category IDs in order
 */
export function getCafeTalkCategoryIds() {
  return Object.keys(CAFE_TALK_CATEGORIES);
}

/**
 * Get word count for a category
 */
export function getCategoryTokenCount(categoryId) {
  const category = CAFE_TALK_CATEGORIES[categoryId];
  return category ? category.wordIds.length : 0;
}

/**
 * Get all word IDs
 */
export function getAllWordIds() {
  return CAFE_TALK_WORDS.map(w => w.id);
}

/**
 * Create a lookup map of word ID to English text
 */
export function getEnglishLookup() {
  return CAFE_TALK_WORDS.reduce((acc, word) => {
    acc[word.id] = word.en;
    return acc;
  }, {});
}
