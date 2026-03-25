import { describe, expect, it } from 'vitest';
import { getSessionsForPack } from './bridgeBuilderSessions.js';

describe('bridgeBuilderSessions', () => {
  it('creates at least one session per pack', () => {
    const pack = {
      id: 'demo_pack',
      title: 'Demo Pack',
      wordIds: ['a', 'b', 'c', 'd'],
      targetsNewCount: 2,
      estimatedTimeSec: 240,
      primaryType: 'connector',
      difficultyBand: 'Core',
    };
    const sessions = getSessionsForPack(pack);
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions[0].packId).toBe('demo_pack');
  });
});
