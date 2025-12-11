import { defaultLanguageId, getLanguageDefinition } from '../data/languages/index.js';

function cloneItem(item, overrides = {}) {
  return { ...item, ...overrides };
}

function buildModeItems(baseItems, vowelGroups, practiceModes, pack) {
  const modeItems = {};
  practiceModes.forEach((mode) => {
    if (mode.type === 'consonants') {
      modeItems[mode.id] = baseItems.map((item) => ({ ...item }));
    } else if (mode.type === 'consonants-basic') {
      const basicConsonants = pack.basicConsonants ?? baseItems.filter((item) => !item.id.startsWith('final-'));
      modeItems[mode.id] = basicConsonants.map((item) => ({ ...item, type: 'consonant' }));
    } else if (mode.type === 'final-forms') {
      const finalForms = pack.finalForms ?? baseItems.filter((item) => item.id.startsWith('final-'));
      modeItems[mode.id] = finalForms.map((item) => ({ ...item, type: 'consonant', isFinalForm: true }));
    } else if (mode.type === 'niqqud') {
      const niqqudItems = pack.niqqudWithCarrier ?? [];
      modeItems[mode.id] = niqqudItems.map((item) => ({ ...item }));
    } else if (mode.type === 'font-shuffle') {
      // Font shuffle uses the same items as basic consonants but with a flag
      const basicConsonants = pack.basicConsonants ?? baseItems.filter((item) => !item.id.startsWith('final-'));
      modeItems[mode.id] = basicConsonants.map((item) => ({ ...item, type: 'consonant', fontShuffle: true }));
    } else if (mode.type === 'vowel-group') {
      const groupItems = vowelGroups[mode.groupId] ?? [];
      modeItems[mode.id] = groupItems.map((item) => ({ ...item }));
    } else if (mode.type === 'combined') {
      const aggregate = [];
      const seen = new Set();
      (mode.include ?? []).forEach((childId) => {
        const source = modeItems[childId] ?? [];
        source.forEach((item) => {
          if (seen.has(item.id)) return;
          seen.add(item.id);
          aggregate.push({ ...item });
        });
      });
      modeItems[mode.id] = aggregate;
    } else {
      modeItems[mode.id] = [];
    }
  });
  return modeItems;
}

export function loadLanguage(languageId = defaultLanguageId) {
  const pack = getLanguageDefinition(languageId) ?? getLanguageDefinition(defaultLanguageId);
  if (!pack) throw new Error(`Unknown language id: ${languageId}`);

  const consonants = Array.isArray(pack.consonants) ? pack.consonants : [];
  const baseItems = consonants.map((item) =>
    cloneItem(item, {
      type: 'consonant',
      transliteration: item.transliteration ?? item.name ?? item.id,
      pronunciation: item.pronunciation ?? item.sound ?? item.name ?? item.id,
      sound: item.sound ?? item.pronunciation ?? item.name ?? item.id
    })
  );

  const markers = pack.vowels?.markers ?? [];
  const markerMap = markers.reduce((acc, marker) => {
    acc[marker.id] = marker;
    return acc;
  }, {});

  const groupDefinitions = pack.vowels?.groups ?? [];
  const syllableBases = pack.vowels?.syllableBases ?? [];

  const vowelGroups = groupDefinitions.reduce((acc, group) => {
    const items = [];
    const markersForGroup = (group.markerIds ?? [])
      .map((markerId) => markerMap[markerId])
      .filter(Boolean);

    syllableBases.forEach((base) => {
      const baseSound = base.baseSound ?? '';
      if (!baseSound) return;
      markersForGroup.forEach((marker) => {
        const symbol = `${base.symbol}${marker.mark}`;
        const id = `${base.id}_${marker.id}`;
        const soundSuffix = marker.soundSuffix ?? '';
        const sound = `${baseSound}${soundSuffix}`;
        items.push({
          id,
          symbol,
          name: `${base.name} + ${marker.name}`,
          sound,
          transliteration: `${base.name} ${marker.name}`,
          pronunciation: sound,
          type: 'syllable',
          markerId: marker.id,
          baseId: base.id
        });
      });
    });

    acc[group.id] = items;
    return acc;
  }, {});

  const practiceModes = Array.isArray(pack.practiceModes) ? pack.practiceModes : [];
  const modeItems = buildModeItems(baseItems, vowelGroups, practiceModes, pack);

  const itemsById = {};
  const itemsBySymbol = {};
  baseItems.forEach((item) => {
    itemsById[item.id] = item;
    itemsBySymbol[item.symbol] = item;
  });
  Object.values(vowelGroups).forEach((items) => {
    items.forEach((item) => {
      itemsById[item.id] = item;
      itemsBySymbol[item.symbol] = item;
    });
  });

  const allItems = Object.values(itemsById).map((item) => ({ ...item }));

  return {
    id: pack.id,
    name: pack.name,
    introductions: pack.introductions ?? {},
    metadata: pack.metadata ?? {},
    practiceModes,
    vowels: {
      markers,
      groups: groupDefinitions,
      syllableBases
    },
    items: baseItems.map((item) => ({ ...item })),
    allItems,
    modeItems,
    itemsById,
    itemsBySymbol
  };
}
