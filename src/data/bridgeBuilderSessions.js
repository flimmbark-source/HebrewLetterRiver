import { bridgeBuilderPacks } from './bridgeBuilderPacks.js';

function chunkWords(wordIds, chunkSize) {
  const chunks = [];
  for (let i = 0; i < wordIds.length; i += chunkSize) {
    chunks.push(wordIds.slice(i, i + chunkSize));
  }
  return chunks;
}

export function getSessionsForPack(pack) {
  const targetSize = Math.max(2, Math.min(pack.targetsNewCount || 4, 6));
  const chunks = chunkWords(pack.wordIds, targetSize);

  return chunks.map((targetWordIds, idx) => ({
    id: `${pack.id}::session-${idx + 1}`,
    packId: pack.id,
    title: chunks.length > 1 ? `${pack.title} · Part ${idx + 1}` : pack.title,
    targetWordIds,
    supportWordIds: [],
    estimatedTimeSec: Math.max(60, Math.round((pack.estimatedTimeSec || 180) / chunks.length)),
    type: pack.primaryType || 'mixed',
    difficultyBand: pack.difficultyBand || 'Core',
  }));
}

export function getRecommendedSessionForPack(pack) {
  return getSessionsForPack(pack)[0] || null;
}

export function getSessionById(sessionId) {
  for (const pack of bridgeBuilderPacks) {
    const match = getSessionsForPack(pack).find((session) => session.id === sessionId);
    if (match) return match;
  }
  return null;
}
