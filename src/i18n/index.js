import en from './en.json';
import he from './he.json';

const fallback = en;

const dictionaries = {
  english: en,
  hebrew: he,
  mandarin: en,
  hindi: en,
  spanish: en,
  french: en,
  arabic: en,
  bengali: en,
  portuguese: en,
  russian: en,
  japanese: en
};

export function getDictionary(languageId) {
  return dictionaries[languageId] ?? fallback;
}

export function translate(dictionary, key, replacements = {}) {
  if (!dictionary) return key;
  const segments = Array.isArray(key) ? key : String(key).split('.');
  let value = dictionary;
  for (const segment of segments) {
    if (value && typeof value === 'object' && segment in value) {
      value = value[segment];
    } else {
      value = null;
      break;
    }
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

