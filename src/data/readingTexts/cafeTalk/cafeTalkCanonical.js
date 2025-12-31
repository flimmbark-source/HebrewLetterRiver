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
 * Organized into 7 sections (replacing the single "Cafe Talk" section)
 */
export const CAFE_TALK_CATEGORIES = {
  // Conversation Glue Section - 25 words split into 4 chunks
  basicConnectors: {
    id: 'basicConnectors',
    sectionId: 'conversationGlue',
    wordIds: ['so', 'but', 'well', 'actually', 'maybe', 'probably']
  },
  discourseMarkers: {
    id: 'discourseMarkers',
    sectionId: 'conversationGlue',
    wordIds: ['basically', 'anyway', 'also', 'too', 'either', 'neither', 'however']
  },
  logicalConnectors: {
    id: 'logicalConnectors',
    sectionId: 'conversationGlue',
    wordIds: ['therefore', 'meanwhile', 'besides', 'instead', 'otherwise', 'still']
  },
  qualifiersModifiers: {
    id: 'qualifiersModifiers',
    sectionId: 'conversationGlue',
    wordIds: ['yet', 'just', 'even', 'already', 'almost', 'quite']
  },

  // Time & Sequencing Section - 20 words split into 3 chunks
  presentTransitions: {
    id: 'presentTransitions',
    sectionId: 'timeSequencing',
    wordIds: ['now', 'then', 'when', 'before', 'after', 'during', 'while']
  },
  timeReferences: {
    id: 'timeReferences',
    sectionId: 'timeSequencing',
    wordIds: ['until', 'since', 'today', 'yesterday', 'tomorrow', 'soon']
  },
  frequencyTiming: {
    id: 'frequencyTiming',
    sectionId: 'timeSequencing',
    wordIds: ['later', 'early', 'late', 'always', 'never', 'sometimes', 'often']
  },

  // People Words Section - 18 words split into 3 chunks
  personalPronouns: {
    id: 'personalPronouns',
    sectionId: 'peopleWords',
    wordIds: ['I', 'you', 'he', 'she', 'we', 'they']
  },
  peopleReferences: {
    id: 'peopleReferences',
    sectionId: 'peopleWords',
    wordIds: ['who', 'someone', 'everyone', 'nobody', 'friend', 'family']
  },
  socialRoles: {
    id: 'socialRoles',
    sectionId: 'peopleWords',
    wordIds: ['person', 'people', 'child', 'parent', 'neighbor', 'stranger']
  },

  // Core Story Verbs Section - 22 words split into 3 chunks
  communicationPerception: {
    id: 'communicationPerception',
    sectionId: 'coreStoryVerbs',
    wordIds: ['go', 'come', 'see', 'hear', 'say', 'tell', 'ask', 'think']
  },
  emotionsCreation: {
    id: 'emotionsCreation',
    sectionId: 'coreStoryVerbs',
    wordIds: ['know', 'want', 'need', 'like', 'love', 'hate', 'make']
  },
  actionVerbs: {
    id: 'actionVerbs',
    sectionId: 'coreStoryVerbs',
    wordIds: ['do', 'get', 'give', 'take', 'find', 'lose', 'try']
  },

  // Life Logistics Section - 20 words split into 3 chunks
  dailyRoutines: {
    id: 'dailyRoutines',
    sectionId: 'lifeLogistics',
    wordIds: ['eat', 'drink', 'sleep', 'work', 'study', 'home', 'house']
  },
  timeResources: {
    id: 'timeResources',
    sectionId: 'lifeLogistics',
    wordIds: ['place', 'time', 'day', 'money', 'buy', 'pay']
  },
  actionsMovement: {
    id: 'actionsMovement',
    sectionId: 'lifeLogistics',
    wordIds: ['help', 'wait', 'leave', 'arrive', 'start', 'finish', 'stop']
  },

  // Reactions & Feelings Section - 20 words split into 3 chunks
  basicEmotions: {
    id: 'basicEmotions',
    sectionId: 'reactionsFeelings',
    wordIds: ['happy', 'sad', 'angry', 'scared', 'surprised', 'tired', 'excited']
  },
  statesOfBeing: {
    id: 'statesOfBeing',
    sectionId: 'reactionsFeelings',
    wordIds: ['bored', 'worried', 'confused', 'okay', 'fine', 'great']
  },
  descriptions: {
    id: 'descriptions',
    sectionId: 'reactionsFeelings',
    wordIds: ['bad', 'terrible', 'wonderful', 'nice', 'beautiful', 'ugly', 'strange']
  },

  // Everyday Topics Section - 20 words split into 3 chunks
  commonObjects: {
    id: 'commonObjects',
    sectionId: 'everydayTopics',
    wordIds: ['food', 'water', 'coffee', 'weather', 'book', 'phone', 'car']
  },
  placesConcepts: {
    id: 'placesConcepts',
    sectionId: 'everydayTopics',
    wordIds: ['street', 'city', 'country', 'language', 'word', 'thing']
  },
  abstractTerms: {
    id: 'abstractTerms',
    sectionId: 'everydayTopics',
    wordIds: ['something', 'nothing', 'everything', 'problem', 'question', 'answer', 'idea']
  },

  // Vowel Layout Practice Section - Test card with 3 layouts (18 words)
  vowelLayoutBootcamp: {
    id: 'vowelLayoutBootcamp',
    sectionId: 'vowelLayoutPractice',
    wordIds: [
      // VL_2_I-O layout (6 words)
      'however', 'instead', 'see', 'ask', 'want', 'hate',
      // VL_1_A layout (6 words)
      'so', 'also', 'too', 'just', 'already', 'then',
      // VL_2_A-A layout (6 words)
      'but', 'now', 'tomorrow', 'you', 'person', 'language'
    ]
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
