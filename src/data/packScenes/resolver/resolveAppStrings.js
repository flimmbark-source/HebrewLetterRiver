import { getAppStringsForPack } from '../appLanguages/index.js';

/**
 * Resolve app-language strings for a pack.
 *
 * @returns {{ status: 'ok', appStrings: object } |
 *           { status: 'missing_app_strings', packId, appLanguageId }}
 */
export function resolveAppStrings(blueprint, appLanguageId) {
  const packId = blueprint.packId;
  const appStrings = getAppStringsForPack(appLanguageId, packId);
  if (!appStrings) {
    return {
      status: 'missing_app_strings',
      packId,
      appLanguageId,
    };
  }
  return { status: 'ok', appStrings };
}
