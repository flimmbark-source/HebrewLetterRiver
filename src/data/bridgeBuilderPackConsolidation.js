/**
 * Runtime consolidation for Vocabulary Journey packs.
 *
 * The authored pack list intentionally remains available in bridgeBuilderPacks.js,
 * but the journey should not present near-duplicate "2" / "3" packs as separate
 * destinations. This module mutates the shared bridgeBuilderPacks array in-place
 * once, so existing imports still receive the same array object with duplicate
 * packs folded into their canonical parent packs.
 */

import { bridgeBuilderPacks as sourceBridgeBuilderPacks } from './bridgeBuilderPacks.js';
import { bridgeBuilderWords } from './bridgeBuilderWords.js';

export const PACK_MERGES = {
  pronouns_01: ['pronouns_02'],
  family_01: ['family_02'],
  food_01: ['food_02'],
  // The old physical_descriptions_01 source pack exists only as a staging pack
  // from the Foundations Pack Scene planning pass. Fold it into adjectives_01
  // so the learner sees a single clean beginner adjective pack: big/small/tall/short.
  adjectives_01: ['physical_descriptions_01'],
  everyday_objects_01: ['everyday_objects_02'],
  time_days_01: ['time_days_02', 'time_days_03'],
  weather_01: ['weather_02'],
  basic_actions_01: ['basic_actions_02', 'daily_processes_01', 'daily_processes_02'],
  shopping_01: ['shopping_02'],
  getting_around_01: ['getting_around_02', 'getting_around_03'],
  school_study_01: ['school_study_02'],
  feelings_01: ['feelings_02', 'feelings_03'],
  helping_asking_01: ['helping_asking_02'],
  function_words_01: ['function_words_02', 'connector_logic_01'],
  quantity_words_01: ['indefinite_reference_01'],
};

const CONSOLIDATED_COPY = {
  pronouns_01: {
    title: 'Pronouns',
    description: 'I, you, he, she, we, and they',
  },
  family_01: {
    title: 'Family & People Close By',
    description: 'Family, friends, children, parents, neighbors, and strangers',
  },
  food_01: {
    title: 'Food & Drink',
    description: 'Food, water, coffee, bread, fruit, and useful eating words',
  },
  adjectives_01: {
    title: 'Adjectives',
    description: 'Big, small, tall, and short',
  },
  everyday_objects_01: {
    title: 'Everyday Objects',
    description: 'Book, phone, table, door, and common things',
  },
  time_days_01: {
    title: 'Time & Days',
    description: 'Today, tomorrow, yesterday, now, soon, later, early, and late',
  },
  weather_01: {
    title: 'Weather',
    description: 'Weather, sun, rain, hot, and cold',
  },
  basic_actions_01: {
    title: 'Basic Actions',
    description: 'Go, come, eat, drink, sleep, work, help, wait, start, finish, and stop',
  },
  shopping_01: {
    title: 'Shopping Basics',
    description: 'Money, store, buy, pay, how much, and bag',
  },
  getting_around_01: {
    title: 'Getting Around',
    description: 'Home, place, car, bus, street, city, country, and map',
  },
  school_study_01: {
    title: 'School / Study',
    description: 'Teacher, student, lesson, pen, study, language, and word',
  },
  feelings_01: {
    title: 'Feelings',
    description: 'Happy, sad, angry, tired, scared, surprised, excited, worried, and okay',
  },
  helping_asking_01: {
    title: 'Helping & Asking',
    description: 'Help, need, want, can, like, love, hate, and try',
  },
  function_words_01: {
    title: 'Function & Connector Words',
    description: 'And, but, because, also, so, however, therefore, meanwhile, and more',
  },
  quantity_words_01: {
    title: 'Quantity & Reference Words',
    description: 'Many, few, all, every, something, nothing, and everything',
  },
};

// Some source packs were split for Pack Scene integrity rather than duplicate cleanup.
// These overrides keep all original adjective/describing word IDs assigned to active
// packs while allowing adjectives_01 to be the clean comparison-cue pack.
const RUNTIME_PACK_OVERRIDES = {
  pronouns_01: {
    wordIds: ['bb-ani', 'bb-atah', 'bb-at', 'bbct-he', 'bbct-she', 'bbct-we', 'bbct-they'],
  },
  adjectives_01: {
    title: 'Adjectives',
    description: 'Big, small, tall, and short',
    wordIds: ['bb-gadol', 'bb-katan', 'bb-gavoha', 'bb-namuch'],
  },
  numbers_01: {
    unlockAfter: 'adjectives_01',
  },
  adjectives_02: {
    sectionId: 'people_social',
    title: 'Evaluation Adjectives',
    description: 'Good, beautiful, great, nice, bad, terrible, and wonderful',
    wordIds: ['bb-tov', 'bb-yafe', 'bbct-great', 'bbct-nice', 'bbct-bad', 'bbct-terrible', 'bbct-wonderful'],
    order: 14,
    unlockAfter: 'describing_people_01',
  },
  adjectives_03: {
    sectionId: 'people_social',
    title: 'Appearance & Strange',
    description: 'Ugly and strange',
    wordIds: ['bbct-ugly', 'bbct-strange'],
    order: 15,
    unlockAfter: 'adjectives_02',
  },
  describing_people_01: {
    title: 'Describing People',
    description: 'Young and old',
    wordIds: ['bb-tsair', 'bb-zaken'],
  },
  community_places_01: {
    order: 16,
    unlockAfter: 'adjectives_03',
  },
  activities_01: {
    order: 17,
    unlockAfter: 'community_places_01',
  },
};

const MERGED_TO_CANONICAL = Object.freeze(
  Object.fromEntries(
    Object.entries(PACK_MERGES).flatMap(([canonicalId, mergedIds]) =>
      mergedIds.map((mergedId) => [mergedId, canonicalId])
    )
  )
);

const WORD_BY_ID = new Map(bridgeBuilderWords.map((word) => [word.id, word]));

let applied = false;

function uniqueStrings(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeKeyPart(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[׳׳'’`]/g, '')
    .replace(/[()]/g, ' ')
    .replace(/\b(to|a|an|the)\b/g, ' ')
    .replace(/\b(m|f|masc|fem|masculine|feminine)\b/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/[^\p{L}\p{N}/]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getEnglishConceptFallback(wordId, word) {
  const fromWord = normalizeKeyPart(word?.meaning || word?.translation || word?.en);
  if (fromWord) return fromWord.split('/')[0].trim();

  if (String(wordId).startsWith('bbct-')) {
    return normalizeKeyPart(String(wordId).replace(/^bbct-/, ''));
  }

  return '';
}

function getWordConceptKeys(wordId) {
  const word = WORD_BY_ID.get(wordId);
  const keys = [];

  const nativeScript = normalizeKeyPart(word?.nativeScript || word?.hebrew);
  if (nativeScript) keys.push(`script:${nativeScript}`);

  const transliteration = normalizeKeyPart(word?.transliteration);
  if (transliteration) keys.push(`translit:${transliteration}`);

  const englishFallback = getEnglishConceptFallback(wordId, word);
  if (englishFallback) keys.push(`english:${englishFallback}`);

  keys.push(`id:${wordId}`);
  return keys;
}

function uniqueWordIdsByConcept(wordIds = []) {
  const kept = [];
  const seenKeys = new Set();

  for (const wordId of wordIds.filter(Boolean)) {
    const keys = getWordConceptKeys(wordId);
    const duplicate = keys.some((key) => seenKeys.has(key));
    if (duplicate) continue;

    kept.push(wordId);
    keys.forEach((key) => seenKeys.add(key));
  }

  return kept;
}

function getPackLookup(packs) {
  return new Map(packs.map((pack) => [pack.id, pack]));
}

function applyRuntimePackOverrides(byId, removedPackIds) {
  for (const [packId, override] of Object.entries(RUNTIME_PACK_OVERRIDES)) {
    if (removedPackIds.has(packId)) continue;
    const pack = byId.get(packId);
    if (!pack) continue;

    if (override.sectionId) pack.sectionId = override.sectionId;
    if (override.title) pack.title = override.title;
    if (override.theme) pack.theme = override.theme;
    if (override.description) pack.description = override.description;
    if (Number.isFinite(override.order)) pack.order = override.order;
    if (Object.prototype.hasOwnProperty.call(override, 'unlockAfter')) {
      pack.unlockAfter = override.unlockAfter;
    }
    if (Array.isArray(override.wordIds)) {
      pack.wordIds = uniqueWordIdsByConcept(override.wordIds);
    }
    if (Array.isArray(override.supportWordIds)) {
      pack.supportWordIds = uniqueWordIdsByConcept(override.supportWordIds);
    }

    pack.targetsNewCount = pack.wordIds.length;
    pack.supportReviewCount = Array.isArray(pack.supportWordIds) ? pack.supportWordIds.length : 0;
  }
}

export function getCanonicalPackId(packId) {
  return MERGED_TO_CANONICAL[packId] || packId;
}

export function getMergedPackIds(packId) {
  const canonicalId = getCanonicalPackId(packId);
  return PACK_MERGES[canonicalId] || [];
}

export function getPackIdFamily(packId) {
  const canonicalId = getCanonicalPackId(packId);
  return [canonicalId, ...getMergedPackIds(canonicalId)];
}

export function applyJourneyPackConsolidation() {
  if (applied) return sourceBridgeBuilderPacks;

  const byId = getPackLookup(sourceBridgeBuilderPacks);
  const removedPackIds = new Set();

  for (const [canonicalId, mergedIds] of Object.entries(PACK_MERGES)) {
    const canonicalPack = byId.get(canonicalId);
    if (!canonicalPack) continue;

    const existingMerged = Array.isArray(canonicalPack.mergedPackIds)
      ? canonicalPack.mergedPackIds
      : [];
    const availableMergedIds = mergedIds.filter((packId) => byId.has(packId));
    const mergedPacks = availableMergedIds.map((packId) => byId.get(packId));

    canonicalPack.wordIds = uniqueWordIdsByConcept([
      ...(canonicalPack.wordIds || []),
      ...mergedPacks.flatMap((pack) => pack.wordIds || []),
    ]);

    canonicalPack.supportWordIds = uniqueWordIdsByConcept([
      ...(canonicalPack.supportWordIds || []),
      ...mergedPacks.flatMap((pack) => pack.supportWordIds || []),
    ]);

    canonicalPack.mergedPackIds = uniqueStrings([
      ...existingMerged,
      ...availableMergedIds,
    ]);

    const copy = CONSOLIDATED_COPY[canonicalId];
    if (copy?.title) canonicalPack.title = copy.title;
    if (copy?.description) canonicalPack.description = copy.description;

    canonicalPack.targetsNewCount = canonicalPack.wordIds.length;
    canonicalPack.supportReviewCount = canonicalPack.supportWordIds.length;

    for (const mergedId of availableMergedIds) {
      removedPackIds.add(mergedId);
    }
  }

  applyRuntimePackOverrides(byId, removedPackIds);

  for (const pack of sourceBridgeBuilderPacks) {
    if (pack.unlockAfter && MERGED_TO_CANONICAL[pack.unlockAfter]) {
      pack.unlockAfter = MERGED_TO_CANONICAL[pack.unlockAfter];
    }
  }

  sourceBridgeBuilderPacks.splice(
    0,
    sourceBridgeBuilderPacks.length,
    ...sourceBridgeBuilderPacks.filter((pack) => !removedPackIds.has(pack.id))
  );

  applied = true;
  return sourceBridgeBuilderPacks;
}

export const bridgeBuilderPacks = applyJourneyPackConsolidation();

export function getConsolidatedPackById(packId) {
  const canonicalId = getCanonicalPackId(packId);
  return bridgeBuilderPacks.find((pack) => pack.id === canonicalId) || null;
}
