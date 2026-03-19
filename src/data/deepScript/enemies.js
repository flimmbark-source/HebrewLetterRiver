/**
 * Deep Script enemy archetype definitions.
 *
 * Design constraint: enemies add threats — they never remove player tools.
 * No enemy disables gear, hides reveals, or takes away learning tools.
 * The word is always the honest puzzle. The enemy is the clock.
 *
 * Three archetypes define how combat *feels*:
 *   Corruptor — steady curse pressure, baseline enemy
 *   Spawner   — floods tray with junk cursed tiles
 *   Amplifier — punishes wrong guesses with chain-curses
 */

export const ENEMY_TYPES = {
  CORRUPTOR: 'corruptor',
  SPAWNER: 'spawner',
  AMPLIFIER: 'amplifier',
};

export const enemyDefinitions = {
  [ENEMY_TYPES.CORRUPTOR]: {
    id: 'corruptor',
    name: 'The Corruptor',
    icon: '💀',
    description: 'Curses a clean tile each turn.',
    // Signature action happens every turn via intent weights
    passive: null,
    intentWeights: {
      CURSE_TILE:   { weight: 5 },
      BURN_TILE:    { weight: 2 },
      SLOT_LOCK:    { weight: 1, minTurn: 2 },
      SATCHEL_RAID: { weight: 1, minTurn: 3 },
    },
  },

  [ENEMY_TYPES.SPAWNER]: {
    id: 'spawner',
    name: 'The Spawner',
    icon: '🕷️',
    description: 'Floods your tray with junk cursed tiles.',
    passive: null,
    intentWeights: {
      SPAWN_CURSED: { weight: 5 },
      SATCHEL_RAID: { weight: 2 },
      BURN_TILE:    { weight: 2 },
      SLOT_LOCK:    { weight: 1, minTurn: 3 },
    },
  },

  [ENEMY_TYPES.AMPLIFIER]: {
    id: 'amplifier',
    name: 'The Amplifier',
    icon: '⚡',
    description: 'Wrong guesses chain-curse additional tiles.',
    // Passive: on wrong guess, also curse 1 additional random clean tile
    passive: 'chainCurse',
    intentWeights: {
      BURN_TILE:    { weight: 3 },
      SLOT_LOCK:    { weight: 3 },
      CURSE_TILE:   { weight: 2 },
      SATCHEL_RAID: { weight: 1, minTurn: 2 },
    },
  },
};

export function getEnemyDef(enemyType) {
  return enemyDefinitions[enemyType] || enemyDefinitions[ENEMY_TYPES.CORRUPTOR];
}
