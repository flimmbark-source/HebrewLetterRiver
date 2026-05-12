import { getBlueprintForPack } from '../blueprintRegistry.js';
import { getDistractorPool } from '../distractors/beginnerDistractors.js';
import { validateBlueprint } from './validateBlueprint.js';
import { resolveTargetLines } from './resolveTargetLines.js';
import { resolveAppStrings } from './resolveAppStrings.js';
import { resolveBeats } from './resolveBeats.js';
import { validateResolvedScene } from './validateResolvedScene.js';
import { buildDirectionConfig } from '../directionConfig.js';

/**
 * End-to-end resolver for a Pack Scene.
 *
 * Returns a tagged status:
 *   { status: 'ok', scene }
 *   { status: 'missing_blueprint', packId }
 *   { status: 'invalid_blueprint', errors }
 *   { status: 'missing_target_realization', packId, targetLanguageId, missingLineIds }
 *   { status: 'missing_app_strings', packId, appLanguageId }
 *   { status: 'invalid_resolved_scene', errors }
 */
export function resolvePackScene({ packId, targetLanguageId, appLanguageId }) {
  const blueprint = getBlueprintForPack(packId);
  if (!blueprint) {
    return { status: 'missing_blueprint', packId };
  }

  const blueprintCheck = validateBlueprint(blueprint);
  if (blueprintCheck.status !== 'ok') {
    return blueprintCheck;
  }

  const targetResult = resolveTargetLines(blueprint, targetLanguageId);
  if (targetResult.status !== 'ok') {
    return targetResult;
  }

  const appResult = resolveAppStrings(blueprint, appLanguageId);
  if (appResult.status !== 'ok') {
    return appResult;
  }

  const distractorPool = getDistractorPool(targetLanguageId) || {};

  const beatsResult = resolveBeats(
    blueprint,
    targetResult.targetLines,
    distractorPool,
    appResult.appStrings
  );
  if (beatsResult.status !== 'ok') {
    return beatsResult;
  }

  const finalCheck = validateResolvedScene(beatsResult.beats);
  if (finalCheck.status !== 'ok') {
    return finalCheck;
  }

  return {
    status: 'ok',
    scene: {
      packId,
      targetLanguageId,
      appLanguageId,
      blueprint,
      beats: beatsResult.beats,
      appStrings: appResult.appStrings,
      directionConfig: buildDirectionConfig(appLanguageId, targetLanguageId),
    },
  };
}
