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
    description: 'Essential Hebrew words and phrases to get started',
    order: 1,
    packIds: [
      'greetings_01',
      'pronouns_01',
      'family_01',
      'food_01',
      'adjectives_01',
      'numbers_01',
      'colors_01',
      'everyday_objects_01',
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
      'weather_01',
      'basic_actions_01',
      'shopping_01',
      'getting_around_01',
      'school_study_01',
    ],
  },
  {
    id: 'people_social',
    title: 'People & Social Life',
    description: 'Connect with people and express yourself',
    order: 3,
    packIds: [
      'friends_01',
      'feelings_01',
      'questions_01',
      'describing_people_01',
      'conversation_01',
      'helping_asking_01',
      'community_places_01',
      'activities_01',
    ],
  },
  {
    id: 'meaning_builders',
    title: 'Hebrew Meaning Builders',
    description: 'Building blocks that make Hebrew click',
    order: 4,
    packIds: [
      'location_words_01',
      'possession_01',
      'function_words_01',
      'prefix_basics_01',
      'definite_article_01',
      'quantity_words_01',
      'useful_chunks_01',
      'word_variations_01',
    ],
  },
  {
    id: 'cafe_talk',
    title: 'Cafe Talk',
    description: 'High-frequency conversational words from Cafe Talk',
    order: 5,
    packIds: [
      'cafe_talk_vowel_layout_bootcamp_01',
      'cafe_talk_basic_connectors_01',
      'cafe_talk_discourse_markers_01',
      'cafe_talk_logical_connectors_01',
      'cafe_talk_qualifiers_modifiers_01',
      'cafe_talk_present_transitions_01',
      'cafe_talk_time_references_01',
      'cafe_talk_frequency_timing_01',
      'cafe_talk_personal_pronouns_01',
      'cafe_talk_people_references_01',
      'cafe_talk_social_roles_01',
      'cafe_talk_communication_perception_01',
      'cafe_talk_emotions_creation_01',
      'cafe_talk_action_verbs_01',
      'cafe_talk_daily_routines_01',
      'cafe_talk_time_resources_01',
      'cafe_talk_actions_movement_01',
      'cafe_talk_basic_emotions_01',
      'cafe_talk_states_of_being_01',
      'cafe_talk_descriptions_01',
      'cafe_talk_common_objects_01',
      'cafe_talk_places_concepts_01',
      'cafe_talk_abstract_terms_01',
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
