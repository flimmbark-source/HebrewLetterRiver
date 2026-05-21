import { describe, expect, it } from 'vitest';
import { resolvePackScene } from './resolvePackScene.js';
import { validateBlueprint } from './validateBlueprint.js';
import { adjectives_01Blueprint } from '../blueprints/adjectives_01.js';
import { pronouns_01Blueprint } from '../blueprints/pronouns_01.js';
import { family_01Blueprint } from '../blueprints/family_01.js';
import { auditPackSceneForPack } from '../auditPackSceneConsistency.js';

const NEW_FOUNDATIONS_SCENES = [
  ['adjectives_01', adjectives_01Blueprint, ['big', 'small', 'tall', 'short']],
  ['pronouns_01', pronouns_01Blueprint, ['i', 'you-m', 'you-f', 'he', 'she', 'we', 'they']],
  ['family_01', family_01Blueprint, ['mom', 'dad', 'family', 'home', 'friend', 'child', 'parent', 'neighbor', 'stranger']],
];

describe('missing Foundations pack scenes', () => {
  it.each(NEW_FOUNDATIONS_SCENES)('%s blueprint validates and covers the expected concepts', (_packId, blueprint, concepts) => {
    expect(validateBlueprint(blueprint).status).toBe('ok');
    expect(blueprint.packConceptIds).toEqual(concepts);
  });

  it.each(NEW_FOUNDATIONS_SCENES)('%s resolves end to end for Hebrew target and English app strings', (packId, blueprint) => {
    const result = resolvePackScene({
      packId,
      targetLanguageId: 'hebrew',
      appLanguageId: 'english',
    });

    expect(result.status).toBe('ok');
    expect(result.scene.blueprint.packId).toBe(packId);
    expect(result.scene.beats).toHaveLength(blueprint.beats.length);
    expect(result.scene.beats.every((beat) => beat.options.filter((option) => option.isCorrect).length === 1)).toBe(true);
  });

  it.each(NEW_FOUNDATIONS_SCENES)('%s passes the Bridge Builder consistency audit', (packId) => {
    expect(auditPackSceneForPack(packId).status).toBe('ok');
  });
});
