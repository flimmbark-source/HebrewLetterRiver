const TOKEN_PRESETS = {
  social: {
    accent: 'emerald',
    icon: 'chat_bubble',
    motif: 'rings',
  },
  food: {
    accent: 'amber',
    icon: 'local_cafe',
    motif: 'dots',
  },
  people: {
    accent: 'rose',
    icon: 'groups',
    motif: 'spark',
  },
  time: {
    accent: 'sky',
    icon: 'schedule',
    motif: 'wave',
  },
  builders: {
    accent: 'violet',
    icon: 'extension',
    motif: 'grid',
  },
  action: {
    accent: 'indigo',
    icon: 'directions_run',
    motif: 'chevrons',
  },
  objects: {
    accent: 'teal',
    icon: 'inventory_2',
    motif: 'grid',
  },
  default: {
    accent: 'slate',
    icon: 'category',
    motif: 'dots',
  },
};

function includesAny(value, terms) {
  return terms.some((term) => value.includes(term));
}

function pickPresetKey(pack) {
  const haystack = [
    pack.sectionId,
    pack.theme,
    pack.primaryType,
    pack.title,
    pack.description,
    ...(Array.isArray(pack.goalTags) ? pack.goalTags : []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (includesAny(haystack, ['greeting', 'social', 'friend', 'talk', 'question'])) return 'social';
  if (includesAny(haystack, ['food', 'cafe', 'drink', 'market', 'restaurant'])) return 'food';
  if (includesAny(haystack, ['family', 'people', 'pronoun', 'feelings', 'relationship'])) return 'people';
  if (includesAny(haystack, ['time', 'day', 'week', 'clock', 'weather'])) return 'time';
  if (includesAny(haystack, ['meaning_builders', 'connector', 'pattern', 'grammar', 'builder'])) return 'builders';
  if (includesAny(haystack, ['action', 'transport', 'travel', 'verb'])) return 'action';
  if (includesAny(haystack, ['object', 'home', 'clothing', 'school', 'shopping'])) return 'objects';

  if (pack.sectionId === 'people_social') return 'people';
  if (pack.sectionId === 'cafe_talk') return 'food';
  if (pack.sectionId === 'meaning_builders') return 'builders';
  return 'default';
}

function getDifficultyTone(difficultyBand) {
  if (difficultyBand === 'Starter') return 'easy';
  if (difficultyBand === 'Advanced') return 'hard';
  return 'core';
}

export function getPackVisualTokens(pack, statusModifier = null) {
  const preset = TOKEN_PRESETS[pickPresetKey(pack)];
  const wordCount = pack?.wordIds?.length || 0;
  const size = wordCount <= 3 ? 'short' : wordCount >= 6 ? 'long' : 'medium';

  return {
    icon: preset.icon,
    accent: preset.accent,
    motif: preset.motif,
    difficultyTone: getDifficultyTone(pack?.difficultyBand),
    size,
    statusTone: statusModifier || 'new',
  };
}
