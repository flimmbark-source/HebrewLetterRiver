/**
 * Canonical Cafe Talk Definition
 *
 * This file serves as the single source of truth for Cafe Talk reading texts.
 * It defines the 7 categories, their expected token counts, and concept keys
 * that should be implemented across all practice languages.
 *
 * Each category contains conversational vocabulary organized by theme:
 * - conversationGlue: Discourse markers and connectors (so, but, well, etc.)
 * - timeSequencing: Time-related words (now, then, after, before, etc.)
 * - peopleWords: Personal pronouns and people references
 * - coreStoryVerbs: Essential action verbs for storytelling
 * - lifeLogistics: Daily life and practical words
 * - reactionsFeelings: Emotional responses and reactions
 * - everydayTopics: Common conversation topics
 *
 * Usage:
 * - Used by validation to ensure completeness
 * - Reference for creating per-language implementations
 * - NOT used for runtime token generation (each language provides actual tokens)
 */

export const cafeTalkCanonical = [
  {
    id: 'conversationGlue',
    titleKey: 'reading.cafeTalk.conversationGlue.title',
    subtitleKey: 'reading.cafeTalk.conversationGlue.subtitle',
    tokenCount: 25,
    concepts: [
      { conceptId: 'so', meaningKey: 'reading.meaning.so' },
      { conceptId: 'but', meaningKey: 'reading.meaning.but' },
      { conceptId: 'well', meaningKey: 'reading.meaning.well' },
      { conceptId: 'actually', meaningKey: 'reading.meaning.actually' },
      { conceptId: 'maybe', meaningKey: 'reading.meaning.maybe' },
      { conceptId: 'probably', meaningKey: 'reading.meaning.probably' },
      { conceptId: 'basically', meaningKey: 'reading.meaning.basically' },
      { conceptId: 'anyway', meaningKey: 'reading.meaning.anyway' },
      { conceptId: 'also', meaningKey: 'reading.meaning.also' },
      { conceptId: 'too', meaningKey: 'reading.meaning.too' },
      { conceptId: 'either', meaningKey: 'reading.meaning.either' },
      { conceptId: 'neither', meaningKey: 'reading.meaning.neither' },
      { conceptId: 'however', meaningKey: 'reading.meaning.however' },
      { conceptId: 'therefore', meaningKey: 'reading.meaning.therefore' },
      { conceptId: 'meanwhile', meaningKey: 'reading.meaning.meanwhile' },
      { conceptId: 'besides', meaningKey: 'reading.meaning.besides' },
      { conceptId: 'instead', meaningKey: 'reading.meaning.instead' },
      { conceptId: 'otherwise', meaningKey: 'reading.meaning.otherwise' },
      { conceptId: 'still', meaningKey: 'reading.meaning.still' },
      { conceptId: 'yet', meaningKey: 'reading.meaning.yet' },
      { conceptId: 'just', meaningKey: 'reading.meaning.just' },
      { conceptId: 'even', meaningKey: 'reading.meaning.even' },
      { conceptId: 'already', meaningKey: 'reading.meaning.already' },
      { conceptId: 'almost', meaningKey: 'reading.meaning.almost' },
      { conceptId: 'quite', meaningKey: 'reading.meaning.quite' }
    ]
  },
  {
    id: 'timeSequencing',
    titleKey: 'reading.cafeTalk.timeSequencing.title',
    subtitleKey: 'reading.cafeTalk.timeSequencing.subtitle',
    tokenCount: 20,
    concepts: [
      { conceptId: 'now', meaningKey: 'reading.meaning.now' },
      { conceptId: 'then', meaningKey: 'reading.meaning.then' },
      { conceptId: 'when', meaningKey: 'reading.meaning.when' },
      { conceptId: 'before', meaningKey: 'reading.meaning.before' },
      { conceptId: 'after', meaningKey: 'reading.meaning.after' },
      { conceptId: 'during', meaningKey: 'reading.meaning.during' },
      { conceptId: 'while', meaningKey: 'reading.meaning.while' },
      { conceptId: 'until', meaningKey: 'reading.meaning.until' },
      { conceptId: 'since', meaningKey: 'reading.meaning.since' },
      { conceptId: 'today', meaningKey: 'reading.meaning.today' },
      { conceptId: 'yesterday', meaningKey: 'reading.meaning.yesterday' },
      { conceptId: 'tomorrow', meaningKey: 'reading.meaning.tomorrow' },
      { conceptId: 'soon', meaningKey: 'reading.meaning.soon' },
      { conceptId: 'later', meaningKey: 'reading.meaning.later' },
      { conceptId: 'early', meaningKey: 'reading.meaning.early' },
      { conceptId: 'late', meaningKey: 'reading.meaning.late' },
      { conceptId: 'always', meaningKey: 'reading.meaning.always' },
      { conceptId: 'never', meaningKey: 'reading.meaning.never' },
      { conceptId: 'sometimes', meaningKey: 'reading.meaning.sometimes' },
      { conceptId: 'often', meaningKey: 'reading.meaning.often' }
    ]
  },
  {
    id: 'peopleWords',
    titleKey: 'reading.cafeTalk.peopleWords.title',
    subtitleKey: 'reading.cafeTalk.peopleWords.subtitle',
    tokenCount: 18,
    concepts: [
      { conceptId: 'I', meaningKey: 'reading.meaning.I' },
      { conceptId: 'you', meaningKey: 'reading.meaning.you' },
      { conceptId: 'he', meaningKey: 'reading.meaning.he' },
      { conceptId: 'she', meaningKey: 'reading.meaning.she' },
      { conceptId: 'we', meaningKey: 'reading.meaning.we' },
      { conceptId: 'they', meaningKey: 'reading.meaning.they' },
      { conceptId: 'who', meaningKey: 'reading.meaning.who' },
      { conceptId: 'someone', meaningKey: 'reading.meaning.someone' },
      { conceptId: 'everyone', meaningKey: 'reading.meaning.everyone' },
      { conceptId: 'nobody', meaningKey: 'reading.meaning.nobody' },
      { conceptId: 'friend', meaningKey: 'reading.meaning.friend' },
      { conceptId: 'family', meaningKey: 'reading.meaning.family' },
      { conceptId: 'person', meaningKey: 'reading.meaning.person' },
      { conceptId: 'people', meaningKey: 'reading.meaning.people' },
      { conceptId: 'child', meaningKey: 'reading.meaning.child' },
      { conceptId: 'parent', meaningKey: 'reading.meaning.parent' },
      { conceptId: 'neighbor', meaningKey: 'reading.meaning.neighbor' },
      { conceptId: 'stranger', meaningKey: 'reading.meaning.stranger' }
    ]
  },
  {
    id: 'coreStoryVerbs',
    titleKey: 'reading.cafeTalk.coreStoryVerbs.title',
    subtitleKey: 'reading.cafeTalk.coreStoryVerbs.subtitle',
    tokenCount: 22,
    concepts: [
      { conceptId: 'go', meaningKey: 'reading.meaning.go' },
      { conceptId: 'come', meaningKey: 'reading.meaning.come' },
      { conceptId: 'see', meaningKey: 'reading.meaning.see' },
      { conceptId: 'hear', meaningKey: 'reading.meaning.hear' },
      { conceptId: 'say', meaningKey: 'reading.meaning.say' },
      { conceptId: 'tell', meaningKey: 'reading.meaning.tell' },
      { conceptId: 'ask', meaningKey: 'reading.meaning.ask' },
      { conceptId: 'think', meaningKey: 'reading.meaning.think' },
      { conceptId: 'know', meaningKey: 'reading.meaning.know' },
      { conceptId: 'want', meaningKey: 'reading.meaning.want' },
      { conceptId: 'need', meaningKey: 'reading.meaning.need' },
      { conceptId: 'like', meaningKey: 'reading.meaning.like' },
      { conceptId: 'love', meaningKey: 'reading.meaning.love' },
      { conceptId: 'hate', meaningKey: 'reading.meaning.hate' },
      { conceptId: 'make', meaningKey: 'reading.meaning.make' },
      { conceptId: 'do', meaningKey: 'reading.meaning.do' },
      { conceptId: 'get', meaningKey: 'reading.meaning.get' },
      { conceptId: 'give', meaningKey: 'reading.meaning.give' },
      { conceptId: 'take', meaningKey: 'reading.meaning.take' },
      { conceptId: 'find', meaningKey: 'reading.meaning.find' },
      { conceptId: 'lose', meaningKey: 'reading.meaning.lose' },
      { conceptId: 'try', meaningKey: 'reading.meaning.try' }
    ]
  },
  {
    id: 'lifeLogistics',
    titleKey: 'reading.cafeTalk.lifeLogistics.title',
    subtitleKey: 'reading.cafeTalk.lifeLogistics.subtitle',
    tokenCount: 20,
    concepts: [
      { conceptId: 'eat', meaningKey: 'reading.meaning.eat' },
      { conceptId: 'drink', meaningKey: 'reading.meaning.drink' },
      { conceptId: 'sleep', meaningKey: 'reading.meaning.sleep' },
      { conceptId: 'work', meaningKey: 'reading.meaning.work' },
      { conceptId: 'study', meaningKey: 'reading.meaning.study' },
      { conceptId: 'home', meaningKey: 'reading.meaning.home' },
      { conceptId: 'house', meaningKey: 'reading.meaning.house' },
      { conceptId: 'place', meaningKey: 'reading.meaning.place' },
      { conceptId: 'time', meaningKey: 'reading.meaning.time' },
      { conceptId: 'day', meaningKey: 'reading.meaning.day' },
      { conceptId: 'money', meaningKey: 'reading.meaning.money' },
      { conceptId: 'buy', meaningKey: 'reading.meaning.buy' },
      { conceptId: 'pay', meaningKey: 'reading.meaning.pay' },
      { conceptId: 'help', meaningKey: 'reading.meaning.help' },
      { conceptId: 'wait', meaningKey: 'reading.meaning.wait' },
      { conceptId: 'leave', meaningKey: 'reading.meaning.leave' },
      { conceptId: 'arrive', meaningKey: 'reading.meaning.arrive' },
      { conceptId: 'start', meaningKey: 'reading.meaning.start' },
      { conceptId: 'finish', meaningKey: 'reading.meaning.finish' },
      { conceptId: 'stop', meaningKey: 'reading.meaning.stop' }
    ]
  },
  {
    id: 'reactionsFeelings',
    titleKey: 'reading.cafeTalk.reactionsFeelings.title',
    subtitleKey: 'reading.cafeTalk.reactionsFeelings.subtitle',
    tokenCount: 20,
    concepts: [
      { conceptId: 'happy', meaningKey: 'reading.meaning.happy' },
      { conceptId: 'sad', meaningKey: 'reading.meaning.sad' },
      { conceptId: 'angry', meaningKey: 'reading.meaning.angry' },
      { conceptId: 'scared', meaningKey: 'reading.meaning.scared' },
      { conceptId: 'surprised', meaningKey: 'reading.meaning.surprised' },
      { conceptId: 'tired', meaningKey: 'reading.meaning.tired' },
      { conceptId: 'excited', meaningKey: 'reading.meaning.excited' },
      { conceptId: 'bored', meaningKey: 'reading.meaning.bored' },
      { conceptId: 'worried', meaningKey: 'reading.meaning.worried' },
      { conceptId: 'confused', meaningKey: 'reading.meaning.confused' },
      { conceptId: 'okay', meaningKey: 'reading.meaning.okay' },
      { conceptId: 'fine', meaningKey: 'reading.meaning.fine' },
      { conceptId: 'great', meaningKey: 'reading.meaning.great' },
      { conceptId: 'bad', meaningKey: 'reading.meaning.bad' },
      { conceptId: 'terrible', meaningKey: 'reading.meaning.terrible' },
      { conceptId: 'wonderful', meaningKey: 'reading.meaning.wonderful' },
      { conceptId: 'nice', meaningKey: 'reading.meaning.nice' },
      { conceptId: 'beautiful', meaningKey: 'reading.meaning.beautiful' },
      { conceptId: 'ugly', meaningKey: 'reading.meaning.ugly' },
      { conceptId: 'strange', meaningKey: 'reading.meaning.strange' }
    ]
  },
  {
    id: 'everydayTopics',
    titleKey: 'reading.cafeTalk.everydayTopics.title',
    subtitleKey: 'reading.cafeTalk.everydayTopics.subtitle',
    tokenCount: 20,
    concepts: [
      { conceptId: 'food', meaningKey: 'reading.meaning.food' },
      { conceptId: 'water', meaningKey: 'reading.meaning.water' },
      { conceptId: 'coffee', meaningKey: 'reading.meaning.coffee' },
      { conceptId: 'weather', meaningKey: 'reading.meaning.weather' },
      { conceptId: 'book', meaningKey: 'reading.meaning.book' },
      { conceptId: 'phone', meaningKey: 'reading.meaning.phone' },
      { conceptId: 'car', meaningKey: 'reading.meaning.car' },
      { conceptId: 'street', meaningKey: 'reading.meaning.street' },
      { conceptId: 'city', meaningKey: 'reading.meaning.city' },
      { conceptId: 'country', meaningKey: 'reading.meaning.country' },
      { conceptId: 'language', meaningKey: 'reading.meaning.language' },
      { conceptId: 'word', meaningKey: 'reading.meaning.word' },
      { conceptId: 'thing', meaningKey: 'reading.meaning.thing' },
      { conceptId: 'something', meaningKey: 'reading.meaning.something' },
      { conceptId: 'nothing', meaningKey: 'reading.meaning.nothing' },
      { conceptId: 'everything', meaningKey: 'reading.meaning.everything' },
      { conceptId: 'problem', meaningKey: 'reading.meaning.problem' },
      { conceptId: 'question', meaningKey: 'reading.meaning.question' },
      { conceptId: 'answer', meaningKey: 'reading.meaning.answer' },
      { conceptId: 'idea', meaningKey: 'reading.meaning.idea' }
    ]
  }
];

/**
 * Get all Cafe Talk category IDs in order
 * @returns {string[]} Array of category IDs
 */
export function getCafeTalkCategoryIds() {
  return cafeTalkCanonical.map(cat => cat.id);
}

/**
 * Get expected token count for a category
 * @param {string} categoryId - Category identifier
 * @returns {number} Expected token count
 */
export function getCategoryTokenCount(categoryId) {
  const category = cafeTalkCanonical.find(cat => cat.id === categoryId);
  return category?.tokenCount || 0;
}

/**
 * Get all concept IDs for a category
 * @param {string} categoryId - Category identifier
 * @returns {string[]} Array of concept IDs
 */
export function getCategoryConcepts(categoryId) {
  const category = cafeTalkCanonical.find(cat => cat.id === categoryId);
  return category?.concepts.map(c => c.conceptId) || [];
}
