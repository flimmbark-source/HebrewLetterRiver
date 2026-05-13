import { describe, it, expect } from 'vitest';
import {
  auditPackSceneForPack,
  auditAllRegisteredPackScenes,
} from '../auditPackSceneConsistency.js';
import { bridgeBuilderPacks } from '../../bridgeBuilderPackConsolidation.js';
import { bridgeWordConceptMap } from '../bridgeWordConceptMap.js';
import { getBlueprintForPack, listBlueprintPackIds } from '../blueprintRegistry.js';

function getConsolidatedPack(packId) {
  return bridgeBuilderPacks.find((pack) => pack.id === packId) || null;
}

describe('Pack Scene / Bridge Builder consistency audit', () => {
  it('food_01 passes the consistency audit', () => {
    expect(auditPackSceneForPack('food_01').status).toBe('ok');
  });

  it('colors_01 passes the consistency audit', () => {
    expect(auditPackSceneForPack('colors_01').status).toBe('ok');
  });

  it('numbers_01 passes the consistency audit', () => {
    expect(auditPackSceneForPack('numbers_01').status).toBe('ok');
  });

  it('every registered Pack Scene passes the consistency audit', () => {
    const result = auditAllRegisteredPackScenes();
    if (result.status !== 'ok') {
      // surface the offending packs to make failures actionable
      // eslint-disable-next-line no-console
      console.error(JSON.stringify(result.errors, null, 2));
    }
    expect(result.status).toBe('ok');
  });

  it('every registered blueprint has a bridgeWordConceptMap entry', () => {
    for (const packId of listBlueprintPackIds()) {
      expect(bridgeWordConceptMap[packId]).toBeTruthy();
    }
  });

  it('consolidated food_01 wordIds all have a concept mapping', () => {
    const pack = getConsolidatedPack('food_01');
    expect(pack).toBeTruthy();
    for (const wordId of pack.wordIds) {
      expect(bridgeWordConceptMap.food_01[wordId]).toBeTruthy();
    }
  });

  it('consolidated shopping_01 wordIds all have a concept mapping', () => {
    const pack = getConsolidatedPack('shopping_01');
    expect(pack).toBeTruthy();
    for (const wordId of pack.wordIds) {
      expect(bridgeWordConceptMap.shopping_01[wordId]).toBeTruthy();
    }
  });

  it('bb-kamah maps to how-much, not how-many or kamah', () => {
    expect(bridgeWordConceptMap.shopping_01['bb-kamah']).toBe('how-much');
  });
});

describe('Pack Scene consistency audit detects drift', () => {
  it('fails when blueprint.packConceptIds is missing a mapped concept (stale blueprint fixture)', () => {
    // Stub a blueprint registry lookup with a deliberately stale blueprint
    // by reusing the audit's underlying check on a fake pack.
    //
    // We do this by constructing a fake mapping + blueprint and calling
    // the per-pack auditor logic on a temporary pack id.
    const fakePackId = '__test_pack_missing_concept__';

    // Inject a fake mapping and a fake consolidated pack via prototype
    // modification of the imported map. Because ES modules export bindings,
    // we mutate the bridgeWordConceptMap object directly for this test only,
    // then restore.
    bridgeWordConceptMap[fakePackId] = { 'bb-fake': 'fake-concept' };
    bridgeBuilderPacks.push({ id: fakePackId, wordIds: ['bb-fake'] });

    // No blueprint registered → audit should fail with missing_blueprint.
    const result = auditPackSceneForPack(fakePackId);
    expect(result.status).toBe('inconsistent');
    expect(result.errors.some((e) => e.code === 'missing_blueprint')).toBe(true);

    // cleanup
    delete bridgeWordConceptMap[fakePackId];
    const idx = bridgeBuilderPacks.findIndex((p) => p.id === fakePackId);
    if (idx >= 0) bridgeBuilderPacks.splice(idx, 1);
  });

  it('fails when a wordId has no mapping', () => {
    // Use the food_01 mapping but pretend pack has an extra unmapped wordId.
    const pack = getConsolidatedPack('food_01');
    expect(pack).toBeTruthy();

    const original = pack.wordIds.slice();
    pack.wordIds.push('bb-no-mapping-for-this');
    try {
      const result = auditPackSceneForPack('food_01');
      expect(result.status).toBe('inconsistent');
      expect(result.errors.some((e) => e.code === 'unmapped_word_id')).toBe(true);
    } finally {
      pack.wordIds.length = 0;
      pack.wordIds.push(...original);
    }
  });

  it('fails when blueprint.packConceptIds contains a stale concept', () => {
    const blueprint = getBlueprintForPack('food_01');
    expect(blueprint).toBeTruthy();

    const original = blueprint.packConceptIds.slice();
    blueprint.packConceptIds.push('thank-you'); // exists as concept but isn't in food_01 pack map
    try {
      const result = auditPackSceneForPack('food_01');
      expect(result.status).toBe('inconsistent');
      expect(result.errors.some((e) => e.code === 'stale_pack_concept_in_blueprint')).toBe(true);
    } finally {
      blueprint.packConceptIds.length = 0;
      blueprint.packConceptIds.push(...original);
    }
  });

  it('fails when blueprint.packConceptIds is missing a mapped concept', () => {
    const blueprint = getBlueprintForPack('food_01');
    expect(blueprint).toBeTruthy();

    const original = blueprint.packConceptIds.slice();
    // Remove 'food' from packConceptIds while bbct-food still maps to it.
    blueprint.packConceptIds.length = 0;
    blueprint.packConceptIds.push(...original.filter((c) => c !== 'food'));
    try {
      const result = auditPackSceneForPack('food_01');
      expect(result.status).toBe('inconsistent');
      expect(
        result.errors.some((e) => e.code === 'missing_pack_concept_in_blueprint')
      ).toBe(true);
    } finally {
      blueprint.packConceptIds.length = 0;
      blueprint.packConceptIds.push(...original);
    }
  });

  it('supportConceptIds do not affect the audit (adding a support concept does not fail it)', () => {
    const blueprint = getBlueprintForPack('food_01');
    const original = blueprint.supportConceptIds.slice();
    blueprint.supportConceptIds.push('water'); // a real pack concept being borrowed as support
    try {
      const result = auditPackSceneForPack('food_01');
      expect(result.status).toBe('ok');
    } finally {
      blueprint.supportConceptIds.length = 0;
      blueprint.supportConceptIds.push(...original);
    }
  });
});
