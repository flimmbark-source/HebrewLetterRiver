import { languagePacks, defaultAppLanguageId } from '../data/languages/index.js';
import { supplementalDictionaries as baseSupplementalDictionaries } from './supplemental.js';
import { hebrewSupplementalDictionary } from './supplemental.hebrew.js';
import { arabicSupplementalDictionary } from './supplemental.arabic.js';
import { russianSupplementalDictionary } from './supplemental.russian.js';

const supplementalDictionaries = {
  ...baseSupplementalDictionaries,
  hebrew: hebrewSupplementalDictionary,
  arabic: arabicSupplementalDictionary,
  russian: russianSupplementalDictionary
};

const dictionaryModules = import.meta.glob('./*.json', { eager: true });

const loadedDictionaries = Object.entries(dictionaryModules).reduce((acc, [path, module]) => {
  const dictionary = module?.default ?? module;
  if (!dictionary || typeof dictionary !== 'object') return acc;
  const idFromMeta = dictionary?.language?.id;
  const filename = path.replace('./', '').replace(/\.json$/i, '');
  const resolvedId = idFromMeta || filename;
  if (resolvedId) {
    acc[resolvedId] = dictionary;
  }
  return acc;
}, {});

const fallbackId = defaultAppLanguageId;
const fallbackDictionary =
  loadedDictionaries[fallbackId] ?? Object.values(loadedDictionaries)[0] ?? {};

function resolveDictionaryId(languageId) {
  const pack = languagePacks[languageId];
  const requestedId = pack?.metadata?.dictionaryId ?? languageId;
  if (requestedId && requestedId in loadedDictionaries) {
    return requestedId;
  }
  if (fallbackId in loadedDictionaries) {
    return fallbackId;
  }
  const availableIds = Object.keys(loadedDictionaries);
  return availableIds.length > 0 ? availableIds[0] : null;
}

function lookupValue(source, segments) {
  let value = source;
  for (const segment of segments) {
    if (value && typeof value === 'object' && segment in value) {
      value = value[segment];
    } else {
      return null;
    }
  }
  return value;
}

export function getDictionary(languageId) {
  const dictionaryId = resolveDictionaryId(languageId);
  if (dictionaryId && dictionaryId in loadedDictionaries) {
    return loadedDictionaries[dictionaryId];
  }
  return fallbackDictionary;
}

export function translate(dictionary, key, replacements = {}) {
  if (!dictionary) return key;
  const segments = Array.isArray(key) ? key : String(key).split('.');
  const dictionaryId = dictionary?.language?.id;

  let value = lookupValue(supplementalDictionaries[dictionaryId], segments);

  if (typeof value !== 'string') {
    value = lookupValue(dictionary, segments);
  }

  if (typeof value !== 'string' && dictionary !== fallbackDictionary) {
    value = lookupValue(fallbackDictionary, segments);
  }

  if (typeof value !== 'string') return key;

  return value.replace(/{{\s*(.+?)\s*}}/g, (match, token) => {
    const replacementKey = token.trim();
    return replacements[replacementKey] ?? match;
  });
}

export function formatTemplate(template, replacements = {}) {
  if (typeof template !== 'string') return template;
  return template.replace(/{{\s*(.+?)\s*}}/g, (match, token) => {
    const replacementKey = token.trim();
    return replacements[replacementKey] ?? match;
  });
}
