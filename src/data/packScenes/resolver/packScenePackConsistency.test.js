import { describe, it, expect } from 'vitest';
import { auditPackSceneConsistency } from '../auditPackSceneConsistency.js';
import { listBlueprintPackIds, getBlueprintForPack } from '../blueprintRegistry.js';
import { getConsolidatedPackById } from '../../bridgeBuilderPackConsolidation.js';
import { BRIDGE_WORD_TO_PACK_SCENE_CONCEPT } from '../bridgeWordConceptMap.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function resultFor(results, packId) {
  return results.find((r) => r.packId === packId);
}

// Run the real audit against the live registry + consolidation
function runAudit() {
  return auditPackSceneConsistency();
}

// ─── 1. Every registered Pack Scene has a matching Bridge Builder pack ────────

describe('Pack Scene / Bridge Builder pack consistency', () => {
  it('every registered Pack Scene has a matching Bridge Builder pack', () => {
    const results = runAudit();
    for (const result of results) {
      expect(result.status).not.toBe('missing_bridge_pack');
    }
  });

  // ─── 2. Every wordId in every registered pack has a concept map entry ───────

  it('every wordId in every registered pack has a concept map entry', () => {
    const results = runAudit();
    for (const result of results) {
      expect(result.status).not.toBe('mapping_error');
      for (const err of result.errors || []) {
        expect(err.code).not.toBe('missing_word_concept_mapping');
      }
    }
  });

  // ─── 3. Every blueprint.packConceptIds exactly matches the mapped concepts ──

  it('every registered blueprint.packConceptIds exactly matches its Bridge Builder pack', () => {
    const results = runAudit();
    for (const result of results) {
      expect(result.status).toBe('ok');
    }
  });

  // ─── 4. Stale drift detection: food_01 with old packConceptIds is caught ────

  it('detects missing_pack_concept when food_01 blueprint is stale (coffee/water/bread only)', () => {
    const staleBlueprint = {
      ...getBlueprintForPack('food_01'),
      packConceptIds: ['coffee', 'water', 'bread'],
    };
    const results = auditPackSceneConsistency({
      getBlueprintFn: (id) => (id === 'food_01' ? staleBlueprint : getBlueprintForPack(id)),
      packIds: ['food_01'],
    });
    const result = resultFor(results, 'food_01');
    expect(result.status).toBe('mismatch');
    const missing = result.errors.filter((e) => e.code === 'missing_pack_concept');
    const missingIds = missing.map((e) => e.conceptId);
    expect(missingIds).toContain('apple');
    expect(missingIds).toContain('food');
  });

  it('detects stale_pack_concept when food_01 blueprint has a concept the pack no longer contains', () => {
    const staleBlueprint = {
      ...getBlueprintForPack('food_01'),
      packConceptIds: ['coffee', 'water', 'bread', 'apple', 'food', 'soup'],
    };
    const results = auditPackSceneConsistency({
      getBlueprintFn: (id) => (id === 'food_01' ? staleBlueprint : getBlueprintForPack(id)),
      packIds: ['food_01'],
    });
    const result = resultFor(results, 'food_01');
    expect(result.status).toBe('mismatch');
    expect(result.errors.some((e) => e.code === 'stale_pack_concept' && e.conceptId === 'soup')).toBe(true);
  });

  // ─── 5. colors_01 matches red/blue/green/yellow ──────────────────────────────

  it('colors_01 passes with exactly red, blue, green, yellow', () => {
    const results = runAudit();
    const result = resultFor(results, 'colors_01');
    expect(result.status).toBe('ok');
    expect(new Set(result.mappedConceptIds)).toEqual(new Set(['red', 'blue', 'green', 'yellow']));
    expect(new Set(result.blueprintConceptIds)).toEqual(new Set(['red', 'blue', 'green', 'yellow']));
  });

  // ─── 6. numbers_01 matches one/two/three/four/five ───────────────────────────

  it('numbers_01 passes with exactly one, two, three, four, five', () => {
    const results = runAudit();
    const result = resultFor(results, 'numbers_01');
    expect(result.status).toBe('ok');
    expect(new Set(result.mappedConceptIds)).toEqual(new Set(['one', 'two', 'three', 'four', 'five']));
    expect(new Set(result.blueprintConceptIds)).toEqual(new Set(['one', 'two', 'three', 'four', 'five']));
  });

  // ─── 7. supportConceptIds do not affect the consistency check ────────────────

  it('supportConceptIds are not compared against Bridge Builder wordIds', () => {
    // Inject a blueprint with extra supportConceptIds — should not change audit result
    const blueprint = getBlueprintForPack('colors_01');
    const augmented = {
      ...blueprint,
      supportConceptIds: [...blueprint.supportConceptIds, 'please', 'yes', 'thank-you'],
    };
    const results = auditPackSceneConsistency({
      getBlueprintFn: (id) => (id === 'colors_01' ? augmented : getBlueprintForPack(id)),
      packIds: ['colors_01'],
    });
    const result = resultFor(results, 'colors_01');
    expect(result.status).toBe('ok');
  });

  // ─── audit reports the Bridge Builder wordIds and mapped concepts ─────────────

  it('audit result includes wordIds, mappedConceptIds, and blueprintConceptIds for each pack', () => {
    const results = runAudit();
    for (const result of results) {
      expect(Array.isArray(result.wordIds)).toBe(true);
      expect(Array.isArray(result.mappedConceptIds)).toBe(true);
      expect(Array.isArray(result.blueprintConceptIds)).toBe(true);
    }
  });

  it('missing_bridge_pack is reported when a pack has no Bridge Builder entry', () => {
    const results = auditPackSceneConsistency({
      getBlueprintFn: () => ({ packConceptIds: ['coffee'] }),
      getPackFn: () => null,
      packIds: ['ghost_pack'],
    });
    const result = resultFor(results, 'ghost_pack');
    expect(result.status).toBe('missing_bridge_pack');
    expect(result.errors[0].code).toBe('missing_bridge_pack');
  });

  it('missing_word_concept_mapping is reported when a wordId has no map entry', () => {
    const results = auditPackSceneConsistency({
      getBlueprintFn: () => ({ packConceptIds: ['coffee'] }),
      getPackFn: () => ({ wordIds: ['bb-unmapped-word'] }),
      conceptMap: {},
      packIds: ['test_pack'],
    });
    const result = resultFor(results, 'test_pack');
    expect(result.status).toBe('mapping_error');
    expect(result.errors[0].code).toBe('missing_word_concept_mapping');
    expect(result.errors[0].wordId).toBe('bb-unmapped-word');
  });

  // ─── food_01 specifically passes with the updated blueprint ──────────────────

  it('food_01 passes with coffee, water, bread, apple, food', () => {
    const results = runAudit();
    const result = resultFor(results, 'food_01');
    expect(result.status).toBe('ok');
    expect(new Set(result.mappedConceptIds)).toEqual(
      new Set(['coffee', 'water', 'bread', 'apple', 'food'])
    );
    expect(new Set(result.blueprintConceptIds)).toEqual(
      new Set(['coffee', 'water', 'bread', 'apple', 'food'])
    );
  });

  // ─── all registered pack IDs are covered ─────────────────────────────────────

  it('audit covers all IDs returned by listBlueprintPackIds', () => {
    const registeredIds = listBlueprintPackIds();
    const results = runAudit();
    const auditedIds = results.map((r) => r.packId);
    for (const packId of registeredIds) {
      expect(auditedIds).toContain(packId);
    }
  });
});
