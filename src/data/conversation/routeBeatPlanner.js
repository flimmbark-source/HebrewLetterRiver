function getRouteStopIndex(routeStop, segments) {
  const routeStopMatch = /^route-stop-(\d+)$/.exec(routeStop?.id || '');
  if (routeStopMatch) {
    return Math.max(0, Number(routeStopMatch[1]) - 1);
  }

  const firstSegmentIndex = routeStop?.startSegment?.index ?? segments?.[0]?.index ?? 0;
  if (firstSegmentIndex <= 0) return 0;
  if (firstSegmentIndex <= 2) return 1;
  return 2;
}

function getSegmentLineIds(segments) {
  const seen = new Set();
  const lineIds = [];

  segments.forEach((segment) => {
    segment?.pairs?.forEach((pair) => {
      [pair.shortSentenceId, pair.longSentenceId].forEach((lineId) => {
        if (!lineId || seen.has(lineId)) return;
        seen.add(lineId);
        lineIds.push(lineId);
      });
    });
  });

  return lineIds;
}

function makeStep({ routeStop, routeStopIndex, lineId, moduleId, order, routeBeatRole }) {
  return {
    id: `${routeStop?.id || 'route-stop'}-${order}-${moduleId}-${lineId}`,
    lineId,
    role: order % 2 === 0 ? 'A' : 'B',
    stepType: moduleId === 'listenMeaningChoice' ? 'introduce' : 'reinforce',
    moduleId,
    config: {
      turn: order,
      role: order % 2 === 0 ? 'A' : 'B',
      routeStopId: routeStop?.id,
      routeStopIndex,
      routeStopTitle: routeStop?.title,
      routeBeatRole
    }
  };
}

function createWarmupPlan({ lineIds, routeStop, routeStopIndex }) {
  return lineIds.slice(0, 2).flatMap((lineId, lineIndex) => [
    makeStep({
      routeStop,
      routeStopIndex,
      lineId,
      moduleId: 'listenMeaningChoice',
      order: lineIndex * 2,
      routeBeatRole: 'readAndMatch'
    }),
    makeStep({
      routeStop,
      routeStopIndex,
      lineId,
      moduleId: 'shadowRepeat',
      order: lineIndex * 2 + 1,
      routeBeatRole: 'fluencySupport'
    })
  ]);
}

function createScenePlan({ lineIds, routeStop, routeStopIndex }) {
  const firstLineId = lineIds[0];
  const secondLineId = lineIds[1] || firstLineId;

  return [
    makeStep({
      routeStop,
      routeStopIndex,
      lineId: firstLineId,
      moduleId: 'listenMeaningChoice',
      order: 0,
      routeBeatRole: 'readAndMatch'
    }),
    makeStep({
      routeStop,
      routeStopIndex,
      lineId: firstLineId,
      moduleId: 'buildLine',
      order: 1,
      routeBeatRole: 'buildLine'
    }),
    makeStep({
      routeStop,
      routeStopIndex,
      lineId: secondLineId,
      moduleId: 'listenMeaningChoice',
      order: 2,
      routeBeatRole: 'readAndMatch'
    }),
    makeStep({
      routeStop,
      routeStopIndex,
      lineId: secondLineId,
      moduleId: 'guidedReplyChoice',
      order: 3,
      routeBeatRole: 'chooseReply'
    })
  ];
}

function createExchangePlan({ lineIds, routeStop, routeStopIndex }) {
  const firstLineId = lineIds[0];
  const secondLineId = lineIds[1] || firstLineId;
  const thirdLineId = lineIds[2] || secondLineId;

  return [
    makeStep({
      routeStop,
      routeStopIndex,
      lineId: firstLineId,
      moduleId: 'guidedReplyChoice',
      order: 0,
      routeBeatRole: 'chooseReply'
    }),
    makeStep({
      routeStop,
      routeStopIndex,
      lineId: secondLineId,
      moduleId: 'buildLine',
      order: 1,
      routeBeatRole: 'buildLine'
    }),
    makeStep({
      routeStop,
      routeStopIndex,
      lineId: thirdLineId,
      moduleId: 'guidedReplyChoice',
      order: 2,
      routeBeatRole: 'chooseReply'
    }),
    makeStep({
      routeStop,
      routeStopIndex,
      lineId: thirdLineId,
      moduleId: 'shadowRepeat',
      order: 3,
      routeBeatRole: 'fluencySupport'
    })
  ];
}

/**
 * Builds an intentional beat sequence for a visible river route stop.
 *
 * Stop 1: Warm-up Phrases — read/match and fluency support.
 * Stop 2: Build the Scene — read/match, build a line, then choose a reply.
 * Stop 3: Full Exchange — choose replies and build a key line.
 */
export function buildRouteStopBeatPlan({ scenario, routeStop, segments, fallbackSteps = [] }) {
  const segmentsToUse = Array.isArray(segments) ? segments.filter(Boolean) : [];
  const routeStopIndex = getRouteStopIndex(routeStop, segmentsToUse);
  const lineMap = new Map((scenario?.lines || []).map(line => [line.id, line]));
  const lineIds = getSegmentLineIds(segmentsToUse).filter(lineId => lineMap.has(lineId));

  if (lineIds.length === 0) {
    return fallbackSteps;
  }

  if (routeStopIndex === 0) {
    return createWarmupPlan({ lineIds, routeStop, routeStopIndex });
  }

  if (routeStopIndex === 1) {
    return createScenePlan({ lineIds, routeStop, routeStopIndex });
  }

  return createExchangePlan({ lineIds, routeStop, routeStopIndex });
}
