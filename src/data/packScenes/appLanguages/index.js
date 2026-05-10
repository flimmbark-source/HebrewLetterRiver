import { englishAppStrings } from './english/index.js';

const APP_STRINGS_BY_LANGUAGE = {
  english: englishAppStrings,
};

export function getAppStringsForPack(appLanguageId, packId) {
  const bundle = APP_STRINGS_BY_LANGUAGE[appLanguageId];
  if (!bundle) return null;
  const packStrings = bundle.packs ? bundle.packs[packId] : null;
  if (!packStrings) return null;
  return {
    ...packStrings,
    shared: bundle.shared || {},
  };
}

export function getSharedAppStrings(appLanguageId) {
  const bundle = APP_STRINGS_BY_LANGUAGE[appLanguageId];
  if (!bundle) return null;
  return bundle.shared || null;
}

export function hasAppLanguage(appLanguageId) {
  return Boolean(APP_STRINGS_BY_LANGUAGE[appLanguageId]);
}
