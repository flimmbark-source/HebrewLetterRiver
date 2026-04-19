/**
 * Bridge Builder curriculum sections.
 *
 * Sections are first-class entities that group packs into themed units.
 * Each section represents a milestone in the learner's journey.
 *
 * @typedef {Object} Section
 * @property {string}   id          — Stable section identifier
 * @property {string}   title       — Display title
 * @property {string}   description — Short description for the setup screen
 * @property {number}   order       — Sort order for progression
 * @property {string[]} packIds     — Ordered list of pack IDs in this section
 */

export const bridgeBuilderSections = [
  {
    id: 'foundations',
    title: 'Foundations',
    description: 'Essential words and phrases to get started',
    order: 1,
    packIds: [
      'greetings_01',
      'pronouns_01',
      'pronouns_02',
      'family_01',
      'family_02',
      'food_01',
      'food_02',
      'adjectives_01',
      'adjectives_02',
      'adjectives_03',
      'numbers_01',
      'colors_01',
      'everyday_objects_01',
      'everyday_objects_02',
    ],
  },
  {
    id: 'daily_life',
    title: 'Daily Life',
    description: 'Words for navigating everyday situations',
    order: 2,
    packIds: [
      'at_home_01',
      'clothing_01',
      'time_days_01',
      'time_days_02',
      'time_days_03',
      'weather_01',
      'weather_02',
      'basic_actions_01',
      'basic_actions_02',
      'daily_processes_01',
      'daily_processes_02',
      'shopping_01',
      'shopping_02',
      'getting_around_01',
      'getting_around_02',
      'getting_around_03',
      'school_study_01',
      'school_study_02',
    ],
  },
  {
    id: 'people_social',
    title: 'People & Social Life',
    description: 'Connect with people and express yourself',
    order: 3,
    packIds: [
      'friends_01',
      'people_references_01',
      'feelings_01',
      'feelings_02',
      'feelings_03',
      'questions_01',
      'conversation_01',
      'communication_01',
      'helping_asking_01',
      'helping_asking_02',
      'thinking_01',
      'social_actions_01',
      'describing_people_01',
      'community_places_01',
      'activities_01',
    ],
  },
  {
    id: 'meaning_builders',
    title: 'Meaning Builders',
    description: 'Building blocks that make the language click',
    order: 4,
    packIds: [
      'location_words_01',
      'possession_01',
      'function_words_01',
      'function_words_02',
      'connector_logic_01',
      'sequence_words_01',
      'prefix_basics_01',
      'definite_article_01',
      'quantity_words_01',
      'indefinite_reference_01',
      'useful_chunks_01',
      'word_variations_01',
    ],
  },
  {
    id: 'cafe_talk',
    title: 'Cafe Talk',
    description: 'Conversation texture, nuance, and frequency words',
    order: 5,
    packIds: [
      'cafe_talk_softeners_01',
      'cafe_talk_nuance_01',
      'cafe_talk_frequency_tone_01',
    ],
  },
];

/**
 * Get a section by ID.
 */
export function getSectionById(sectionId) {
  return bridgeBuilderSections.find(s => s.id === sectionId) || null;
}

/**
 * Get sections sorted by progression order.
 */
export function getSectionsInOrder() {
  return [...bridgeBuilderSections].sort((a, b) => a.order - b.order);
}

/**
 * Get the section that contains a given pack ID.
 */
export function getSectionForPack(packId) {
  return bridgeBuilderSections.find(s => s.packIds.includes(packId)) || null;
}
