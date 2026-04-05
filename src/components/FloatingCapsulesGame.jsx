import { useState, useEffect, useRef, useCallback } from 'react';
import { useFontSettings } from '../hooks/useFontSettings.js';
import { getTextDirection } from '../lib/vocabLanguageAdapter.js';

/**
 * FloatingCapsulesGame - A word-matching mini-game with floating capsules
 *
 * Players drag Hebrew, transliteration, or meaning capsules onto their matching partners.
 * Capsules float gently like leaves on water with connecting lines shown at start.
 */

const PREVIEW_DURATION = 3000; // Show lines for 3 seconds
const FADE_DURATION = 1000; // Fade lines over 1 second
const BOUNCE_DAMPING = 0.7; // Velocity reduction on bounce

// Responsive constants — scale down for narrow screens
function getResponsiveConstants(width) {
  const isNarrow = width < 420;
  return {
    capsuleRadius: isNarrow ? 30 : 40,
    lineOfSightBuffer: isNarrow ? 40 : 65,
    capsuleClearanceBuffer: isNarrow ? 10 : 19,
    edgePadding: isNarrow ? 20 : 2,
    bottomReservedSpace: isNarrow ? 56 : 68,
    minEdgePadding: isNarrow ? 30 : 60,
    targetSpacing: isNarrow ? 72 : 100,
  };
}

export default function FloatingCapsulesGame({ wordPairs, onComplete, bubbleMode = false }) {
  const { getGameFontClass, getNativeScriptFontClass } = useFontSettings();
  const wordLanguageId = wordPairs?.[0]?.languageId || 'hebrew';
  const nativeScriptDir = getTextDirection(wordLanguageId);
  const isNativeRtl = nativeScriptDir === 'rtl';
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'completed'
  const [mismatchCount, setMismatchCount] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  const [showLines, setShowLines] = useState(true);
  const [currentHintPairIndex, setCurrentHintPairIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [renderTick, forceUpdate] = useState(0);
  const startTimeRef = useRef(Date.now());

  // Capsule state
  const capsulesRef = useRef([]);
  const [ghostPairs, setGhostPairs] = useState([]);
  const initializedWordPairsRef = useRef(null);

  // DOM refs for direct manipulation during drag (avoids re-renders)
  const bubbleElsRef = useRef(new Map());

  // Drag state
  const dragStateRef = useRef({
    isDragging: false,
    capsuleIndex: -1,
    offsetX: 0,
    offsetY: 0,
    rafId: null,
  });

  const playAreaRef = useRef(null);
  const [playAreaBounds, setPlayAreaBounds] = useState({ width: 0, height: 0 });

  // Measure bounds accurately after layout is complete
  const updateBounds = useCallback(() => {
    if (!playAreaRef.current) return;

    // Double requestAnimationFrame ensures layout is 100% complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (playAreaRef.current) {
          const bounds = playAreaRef.current.getBoundingClientRect();
          setPlayAreaBounds({ width: bounds.width, height: bounds.height });
        }
      });
    });
  }, []);

  // Update bounds on window resize
  useEffect(() => {
    updateBounds();

    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [updateBounds]);

  // Initialize capsules with well-distributed positions
  useEffect(() => {
    if (!playAreaRef.current || playAreaBounds.width === 0) return;

    // Only reinitialize if wordPairs actually changed (not just bounds)
    if (initializedWordPairsRef.current === wordPairs) return;
    initializedWordPairsRef.current = wordPairs;

    const bounds = playAreaBounds;

    // Ensure we have unique pairs (handle duplicates by adding disambiguation)
    const uniquePairs = ensureUniquePairs(wordPairs);

    const rc = getResponsiveConstants(bounds.width);
    const capsules = [];
    const padding = rc.edgePadding;
    const bottomReservedSpace = rc.bottomReservedSpace;
    const usableWidth = bounds.width - padding * 2;
    const usableHeight = bounds.height - padding - bottomReservedSpace;
    const isNarrow = bounds.width < 420;

    const measurementCanvas = document.createElement('canvas');
    const measurementContext = measurementCanvas.getContext('2d');
    const getCapsuleRadius = (text, isNativeScript) => {
      if (!measurementContext) {
        return rc.capsuleRadius;
      }
      const fontSize = isNarrow ? (isNativeScript ? 14 : 12) : (isNativeScript ? 18 : 16);
      const fontFamily = isNativeScript ? '"Noto Sans Hebrew", "Noto Sans Arabic", "Noto Sans Devanagari", "Arial", sans-serif' : '"Inter", "Arial", sans-serif';
      measurementContext.font = `600 ${fontSize}px ${fontFamily}`;
      const textWidth = measurementContext.measureText(text).width;
      const paddingH = isNarrow ? 20 : 32;
      const paddingV = isNarrow ? 10 : 16;
      const width = textWidth + paddingH;
      const height = fontSize + paddingV;
      return Math.max(width, height) / 2;
    };

    // Helper to check if position is too close to existing capsules
    const isTooClose = (x, y, radius, existingCapsules) => {
      return existingCapsules.some(cap => {
        const dx = cap.x - x;
        const dy = cap.y - y;
        const minDistance = radius + (cap.radius ?? rc.capsuleRadius);
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });
    };

    const isWithinBounds = (x, y) => {
      return (
        x >= padding &&
        x <= bounds.width - padding &&
        y >= padding &&
        y <= bounds.height - padding
      );
    };

    const distanceToSegment = (point, start, end) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      if (dx === 0 && dy === 0) {
        const px = point.x - start.x;
        const py = point.y - start.y;
        return Math.sqrt(px * px + py * py);
      }

      const t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy);
      const clampedT = Math.max(0, Math.min(1, t));
      const closestX = start.x + clampedT * dx;
      const closestY = start.y + clampedT * dy;
      const distX = point.x - closestX;
      const distY = point.y - closestY;
      return Math.sqrt(distX * distX + distY * distY);
    };

    const hasClearLineOfSight = (pairPositions, existingCapsules) => {
      const segments = [
        [pairPositions.hebrew, pairPositions.transliteration],
        [pairPositions.hebrew, pairPositions.meaning],
        [pairPositions.transliteration, pairPositions.meaning]
      ];

      return segments.every(([start, end]) =>
        existingCapsules.every(cap => {
          const distance = distanceToSegment({ x: cap.x, y: cap.y }, start, end);
          return distance >= rc.lineOfSightBuffer;
        })
      );
    };

    // Resolve overlaps by only pushing capsules vertically (preserves column X)
    const resolveSpawnOverlaps = (capsulesToResolve) => {
      const minY = padding;
      const maxY = bounds.height - bottomReservedSpace - padding;
      const maxIterations = 30;

      const clampY = (capsule) => {
        capsule.y = Math.max(minY, Math.min(maxY, capsule.y));
      };

      for (let iteration = 0; iteration < maxIterations; iteration += 1) {
        let moved = false;

        // Only resolve overlaps between capsules in the same column (same type)
        for (let i = 0; i < capsulesToResolve.length; i += 1) {
          for (let j = i + 1; j < capsulesToResolve.length; j += 1) {
            const first = capsulesToResolve[i];
            const second = capsulesToResolve[j];
            if (first.type !== second.type) continue; // different columns can't overlap

            const dy = second.y - first.y;
            const verticalDistance = Math.abs(dy);
            const minDistance = (first.radius ?? rc.capsuleRadius) +
              (second.radius ?? rc.capsuleRadius) +
              rc.capsuleClearanceBuffer;

            if (verticalDistance < minDistance) {
              const overlap = minDistance - verticalDistance;
              const direction = dy >= 0 ? 1 : -1;
              first.y -= direction * (overlap / 2);
              second.y += direction * (overlap / 2);
              clampY(first);
              clampY(second);
              moved = true;
            }
          }
        }

        if (!moved) break;
      }
    };

    // Create capsules in straight vertical columns by TYPE
    // (left: ALL Hebrew, middle: ALL Transliteration, right: ALL Meaning)
    const columnWidth = usableWidth / 3;
    const hebrewColumnX = padding + columnWidth / 2;
    const translitColumnX = bounds.width / 2; // Center column aligned with start button
    const meaningColumnX = padding + 2 * columnWidth + columnWidth / 2;

    // Calculate equidistant Y positions for grid formation with contextual centering
    const numPairs = uniquePairs.length;
    const gridYPositions = [];

    if (numPairs === 1) {
      // Single pair - center it vertically in the available space (excluding bottom button area)
      const availableCenter = padding + (usableHeight / 2);
      gridYPositions.push(availableCenter);
    } else {
      // Multiple pairs - calculate centered grid based on number of capsules
      const targetSpacing = rc.targetSpacing;
      const minEdgePadding = rc.minEdgePadding;
      const totalGridHeight = targetSpacing * (numPairs - 1);
      const maxAvailableHeight = usableHeight - 2 * minEdgePadding;

      let actualGridHeight, topOffset;

      if (totalGridHeight <= maxAvailableHeight) {
        // Grid fits with target spacing - center it vertically
        actualGridHeight = totalGridHeight;
        const extraSpace = usableHeight - actualGridHeight;
        topOffset = padding + extraSpace / 2;
      } else {
        // Grid too large - compress to fit with minimum padding
        actualGridHeight = maxAvailableHeight;
        topOffset = padding + minEdgePadding;
      }

      const actualSpacing = actualGridHeight / (numPairs - 1);

      for (let i = 0; i < numPairs; i++) {
        const y = topOffset + (actualSpacing * i);
        gridYPositions.push(y);
      }
    }

    // Shuffle helper function (Fisher-Yates shuffle)
    const shuffle = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Create column orderings that avoid triplets lining up on the same row.
    const hebrewOrder = shuffle([...Array(numPairs).keys()]);
    const rotateOrder = (order, shift) => order.map((_, i) => order[(i + shift) % order.length]);

    let translitOrder = [...hebrewOrder];
    let meaningOrder = [...hebrewOrder];
    if (numPairs > 1) {
      const translitShift = 1 + Math.floor(Math.random() * (numPairs - 1));
      translitOrder = rotateOrder(hebrewOrder, translitShift);

      let meaningShift = translitShift;
      if (numPairs > 2) {
        while (meaningShift === translitShift) {
          meaningShift = 1 + Math.floor(Math.random() * (numPairs - 1));
        }
      }
      meaningOrder = rotateOrder(hebrewOrder, meaningShift);
    }

    // Create ALL native script capsules in left column (grid positions, randomized order)
    uniquePairs.forEach((pair, pairIndex) => {
      const nativeText = pair.nativeScript || pair.hebrew;
      const radius = getCapsuleRadius(nativeText, true);
      const positionIndex = hebrewOrder[pairIndex];
      const y = gridYPositions[positionIndex];
      const wanderDelay = 1200 + Math.random() * 1800;

      capsules.push({
        id: `hebrew-${pairIndex}`,
        type: 'hebrew',
        text: nativeText,
        pairIndex: pairIndex,
        x: hebrewColumnX,
        y: y,
        radius: radius,
        vx: 0,
        vy: 0,
        targetVx: 0,
        targetVy: 0,
        nextWanderAt: Date.now() + wanderDelay,
        matched: false,
        shaking: false,
        visible: false
      });
    });

    // Create ALL Transliteration capsules in middle column (grid positions, randomized order)
    uniquePairs.forEach((pair, pairIndex) => {
      const radius = getCapsuleRadius(pair.transliteration || pair.nativeScript || pair.hebrew, false);
      const positionIndex = translitOrder[pairIndex];
      const y = gridYPositions[positionIndex];
      const wanderDelay = 1200 + Math.random() * 1800;

      capsules.push({
        id: `transliteration-${pairIndex}`,
        type: 'transliteration',
        text: pair.transliteration || pair.nativeScript || pair.hebrew,
        pairIndex: pairIndex,
        x: translitColumnX,
        y: y,
        radius: radius,
        vx: 0,
        vy: 0,
        targetVx: 0,
        targetVy: 0,
        nextWanderAt: Date.now() + wanderDelay,
        matched: false,
        shaking: false,
        visible: false
      });
    });

    // Create ALL Meaning capsules in right column (grid positions, randomized order)
    uniquePairs.forEach((pair, pairIndex) => {
      const radius = getCapsuleRadius(pair.meaning, false);
      const positionIndex = meaningOrder[pairIndex];
      const y = gridYPositions[positionIndex];
      const wanderDelay = 1200 + Math.random() * 1800;

      capsules.push({
        id: `meaning-${pairIndex}`,
        type: 'meaning',
        text: pair.meaning,
        pairIndex: pairIndex,
        x: meaningColumnX,
        y: y,
        radius: radius,
        vx: 0,
        vy: 0,
        targetVx: 0,
        targetVy: 0,
        nextWanderAt: Date.now() + wanderDelay,
        matched: false,
        shaking: false,
        visible: false
      });
    });

    // Ensure a consistent spacing buffer between capsules so they do not overlap.
    resolveSpawnOverlaps(capsules);

    capsulesRef.current = capsules;

    // Show all hint lines initially (will be hidden when player first clicks a capsule)
    setShowLines(true);
    setCurrentHintPairIndex(-1); // -1 means show all lines
  }, [wordPairs, playAreaBounds]);

  // Staggered spawn: make each pair visible with 2s delay between pairs, starting 1s after mount
  useEffect(() => {
    const timeouts = [];
    const numPairs = wordPairs.length;

    // Schedule visibility for each pair
    for (let pairIndex = 0; pairIndex < numPairs; pairIndex++) {
      const delay = 1000 + (pairIndex * 1000); // 1s initial + 2s per pair
      const timeout = setTimeout(() => {
        capsulesRef.current.forEach(capsule => {
          if (capsule.pairIndex === pairIndex) {
            capsule.visible = true;
          }
        });
        // Force re-render so capsules appear at the same time as hint lines
        forceUpdate(n => n + 1);
      }, delay);
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [wordPairs]);

  // Ensure no duplicate meanings (add disambiguators if needed)
  function ensureUniquePairs(pairs) {
    const meaningCounts = {};
    pairs.forEach(p => {
      meaningCounts[p.meaning] = (meaningCounts[p.meaning] || 0) + 1;
    });

    const counters = {};
    return pairs.map(pair => {
      const meaning = pair.meaning;
      if (meaningCounts[meaning] > 1) {
        counters[meaning] = (counters[meaning] || 0) + 1;
        return {
          ...pair,
          meaning: `${meaning} (${counters[meaning]})`
        };
      }
      return pair;
    });
  }

  // Pointer event handlers - all capsule types are draggable
  const safelySetPointerCapture = (target, pointerId) => {
    if (!target || typeof target.setPointerCapture !== 'function' || pointerId == null) return;
    try {
      target.setPointerCapture(pointerId);
    } catch {
      // Some mobile browsers can throw if pointer capture is unsupported/interrupted.
    }
  };

  const handlePointerDown = useCallback((e, capsule, index) => {
    if (capsule.matched || !capsule.visible) return;

    // Auto-start game on first capsule interaction
    if (!gameStarted) {
      setGameStarted(true);
      setShowLines(false);
      startTimeRef.current = Date.now();
    }

    e.preventDefault();
    if (!playAreaRef.current) return;

    const rect = playAreaRef.current.getBoundingClientRect();
    dragStateRef.current = {
      isDragging: true,
      capsuleIndex: index,
      capsuleType: capsule.type,
      offsetX: e.clientX - rect.left - capsule.x,
      offsetY: e.clientY - rect.top - capsule.y,
      rafId: null,
    };

    safelySetPointerCapture(e.currentTarget, e.pointerId);
    // Force one re-render so the dragging class is applied
    forceUpdate(n => n + 1);
  }, [gameStarted]);

  const handlePointerMove = useCallback((e) => {
    const drag = dragStateRef.current;
    if (!drag.isDragging) return;
    if (!playAreaRef.current) return;

    const rect = playAreaRef.current.getBoundingClientRect();
    const index = drag.capsuleIndex;
    const capsule = capsulesRef.current[index];

    capsule.x = e.clientX - rect.left - drag.offsetX;
    capsule.y = e.clientY - rect.top - drag.offsetY;

    // Direct DOM update — no React re-render needed
    if (drag.rafId) return; // Already scheduled
    drag.rafId = requestAnimationFrame(() => {
      drag.rafId = null;
      const el = bubbleElsRef.current.get(capsule.id);
      if (el) {
        el.style.left = `${capsule.x}px`;
        el.style.top = `${capsule.y}px`;
      }
    });
  }, []);

  const resetDragState = useCallback(() => {
    dragStateRef.current.isDragging = false;
    dragStateRef.current.capsuleIndex = null;
    dragStateRef.current.capsuleType = null;
    dragStateRef.current.offsetX = 0;
    dragStateRef.current.offsetY = 0;
    if (dragStateRef.current.rafId) {
      cancelAnimationFrame(dragStateRef.current.rafId);
      dragStateRef.current.rafId = null;
    }
    forceUpdate(n => n + 1);
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (!dragStateRef.current.isDragging) return;

    const index = dragStateRef.current.capsuleIndex;
    const draggedCapsule = capsulesRef.current[index];

    const candidates = capsulesRef.current
      .map((capsule, capsuleIndex) => ({ capsule, capsuleIndex }))
      .filter(({ capsule, capsuleIndex }) => capsuleIndex !== index && !capsule.matched && capsule.visible)
      .map(({ capsule }) => {
        const dx = draggedCapsule.x - capsule.x;
        const dy = draggedCapsule.y - capsule.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return { capsule, distance };
      })
      .filter(({ distance }) => {
        const hitRadius = playAreaBounds.width < 420 ? 30 : 40;
        return distance < hitRadius * 2;
      })
      .sort((a, b) => a.distance - b.distance);

    const target = candidates[0]?.capsule;

    if (target) {
      if (draggedCapsule.pairIndex === target.pairIndex) {
        const remainingForPair = capsulesRef.current.filter(
          c => c.pairIndex === draggedCapsule.pairIndex && !c.matched
        );
        const removeTarget = remainingForPair.length <= 2;

        draggedCapsule.popping = true;
        if (removeTarget) {
          target.popping = true;
        }
        forceUpdate(n => n + 1); // Show pop-off animation immediately

        setTimeout(() => {
          draggedCapsule.matched = true;
          if (removeTarget) {
            target.matched = true;
          }

          // Check for orphaned capsules (single capsule left in a triplet)
          const pairGroups = new Map();
          capsulesRef.current.forEach(c => {
            if (!c.matched) {
              if (!pairGroups.has(c.pairIndex)) {
                pairGroups.set(c.pairIndex, []);
              }
              pairGroups.get(c.pairIndex).push(c);
            }
          });

          // Auto-remove any orphaned capsules (only 1 remaining in group)
          const orphanedCapsules = [];
          pairGroups.forEach((group, pairIndex) => {
            if (group.length === 1) {
              const orphan = group[0];
              orphan.matched = true;
              orphan.popping = true;
              orphanedCapsules.push(orphan);
            }
          });

          // Add orphaned capsules to ghost pairs
          if (orphanedCapsules.length > 0) {
            orphanedCapsules.forEach(orphan => {
              setGhostPairs(prev => [...prev, {
                items: [{ text: orphan.text, type: orphan.type }],
                x: orphan.x,
                y: orphan.y,
                startY: orphan.y,
                timestamp: Date.now()
              }]);
            });
          }

          const allMatched = capsulesRef.current.every(c => c.matched);
          if (allMatched) {
            const time = Date.now() - startTimeRef.current;
            setCompletionTime(time);
            setGameState('completed');
          }
        }, 400);

        const removedCapsules = [
          { text: draggedCapsule.text, type: draggedCapsule.type }
        ];
        if (removeTarget) {
          removedCapsules.push({ text: target.text, type: target.type });
        }

        setGhostPairs(prev => [...prev, {
          items: removedCapsules,
          x: removeTarget ? (draggedCapsule.x + target.x) / 2 : draggedCapsule.x,
          y: removeTarget ? (draggedCapsule.y + target.y) / 2 : draggedCapsule.y,
          startY: removeTarget ? (draggedCapsule.y + target.y) / 2 : draggedCapsule.y,
          timestamp: Date.now()
        }]);
      } else {
        draggedCapsule.shaking = true;
        setMismatchCount(prev => prev + 1);
        // Clear shake after animation completes — no rAF loop needed
        setTimeout(() => {
          draggedCapsule.shaking = false;
          forceUpdate(n => n + 1);
        }, 450);
      }
    }

    resetDragState();
  }, [resetDragState]);

  const handlePointerCancel = useCallback(() => {
    if (!dragStateRef.current.isDragging) return;
    resetDragState();
  }, [resetDragState]);

  // Draw canvas overlay for lines — draw ONCE per state change, no rAF loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bounds = playAreaBounds;

    canvas.width = bounds.width;
    canvas.height = bounds.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showLines) return;

    const hintColors = [
      'rgba(239, 68, 68, 0.7)',
      'rgba(22, 163, 74, 0.7)',
      'rgba(255, 159, 28, 0.7)',
      'rgba(59, 130, 246, 0.7)',
      'rgba(236, 72, 153, 0.7)',
      'rgba(168, 85, 247, 0.7)',
      'rgba(14, 165, 233, 0.7)',
      'rgba(234, 179, 8, 0.7)',
      'rgba(20, 184, 166, 0.7)',
      'rgba(248, 113, 113, 0.7)',
    ];

    const fallbackRadius = bounds.width < 420 ? 30 : 40;
    const getEdgePoints = (a, b) => {
      const left = a.x < b.x ? a : b;
      const right = a.x < b.x ? b : a;
      return {
        startX: left.x + (left.radius ?? fallbackRadius),
        startY: left.y,
        endX: right.x - (right.radius ?? fallbackRadius),
        endY: right.y,
      };
    };

    const drawPairLines = (pairCapsules, color) => {
      ctx.strokeStyle = color;
      for (let i = 0; i < pairCapsules.length; i++) {
        for (let j = i + 1; j < pairCapsules.length; j++) {
          const a = pairCapsules[i], b = pairCapsules[j];
          if ((a.type === 'hebrew' && b.type === 'meaning') ||
              (a.type === 'meaning' && b.type === 'hebrew')) continue;
          const { startX, startY, endX, endY } = getEdgePoints(a, b);
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      }
    };

    const capsules = capsulesRef.current;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (currentHintPairIndex === -1) {
      const pairs = new Map();
      capsules.forEach(c => {
        if (!c.matched && c.visible) {
          if (!pairs.has(c.pairIndex)) pairs.set(c.pairIndex, []);
          pairs.get(c.pairIndex).push(c);
        }
      });
      pairs.forEach((group, idx) => drawPairLines(group, hintColors[idx % hintColors.length]));
    } else {
      const group = capsules.filter(
        c => !c.matched && c.visible && c.pairIndex === currentHintPairIndex
      );
      drawPairLines(group, hintColors[currentHintPairIndex % hintColors.length]);
    }
  }, [showLines, currentHintPairIndex, playAreaBounds, renderTick]);

  if (gameState === 'completed') {
    return (
      <div className={`flex flex-col items-center justify-center h-full gap-6 p-8 ${bubbleMode ? 'ds-bubbles-complete' : ''}`}>
        <div className="text-center space-y-4">
          <div className="text-5xl">✓</div>
          <h2 className="text-2xl font-bold text-white">Completed!</h2>
          <div className="text-slate-300 space-y-2">
            <p>Time: {(completionTime / 1000).toFixed(1)}s</p>
            <p>Mismatches: {mismatchCount}</p>
          </div>

          {/* Recap of pairs */}
          <div className="mt-6 space-y-2 text-sm">
            <p className="text-slate-400">Words learned:</p>
            {wordPairs.map((pair, i) => {
              const native = pair.nativeScript || pair.hebrew;
              return (
                <div key={i} className="flex gap-3 justify-center items-center">
                  <span className={`text-white ${getNativeScriptFontClass(`${native}-${i}-h`, wordLanguageId)}`} dir={nativeScriptDir}>{native}</span>
                  <span className={`text-slate-400 text-xs ${getGameFontClass(`${native}-${i}-t`)}`}>({pair.transliteration || native})</span>
                  <span className="text-slate-400">→</span>
                  <span className={`text-white ${getGameFontClass(`${native}-${i}-m`)}`}>{pair.meaning}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => onComplete({ completionTime, mismatchCount })}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Canvas for lines */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: showLines ? 1 : 0 }}
      />

      {/* Play area */}
      <div
        ref={playAreaRef}
        className="absolute inset-0"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* Ghost pairs — CSS-animated float-up, removed on animationend */}
        {ghostPairs.map((ghost, i) => (
          <div
            key={`ghost-${ghost.timestamp}-${i}`}
            className="ds-bubble-ghost"
            style={{ left: ghost.x, top: ghost.y }}
            onAnimationEnd={() => {
              setGhostPairs(prev => prev.filter((_, idx) => idx !== i));
            }}
          >
            {ghost.items.map((item, itemIndex) => {
              const isHebrew = item.type === 'hebrew';
              return (
                <span
                  key={`${item.text}-${itemIndex}`}
                  className={`font-semibold ${isHebrew ? getNativeScriptFontClass(`${item.text}-${itemIndex}`, wordLanguageId) : getGameFontClass(`${item.text}-${itemIndex}`)} ${
                    isHebrew ? 'text-emerald-200' : 'text-slate-200'
                  }`}
                  dir={isHebrew ? nativeScriptDir : 'ltr'}
                >
                  {item.text}
                </span>
              );
            })}
          </div>
        ))}

        {/* Capsules */}
        {capsulesRef.current.map((capsule, index) => {
          if (capsule.matched || !capsule.visible) return null;

          const isHebrew = capsule.type === 'hebrew';
          const isTransliteration = capsule.type === 'transliteration';
          const isDragging = dragStateRef.current.isDragging && dragStateRef.current.capsuleIndex === index;
          const isPopping = capsule.popping;

          if (bubbleMode) {
            const bubbleColor = isHebrew
              ? 'rgba(91, 141, 217, 0.35)'
              : isTransliteration
                ? 'rgba(196, 149, 90, 0.35)'
                : 'rgba(168, 85, 247, 0.35)';
            const bubbleGlow = isHebrew
              ? 'rgba(91, 141, 217, 0.6)'
              : isTransliteration
                ? 'rgba(240, 198, 116, 0.6)'
                : 'rgba(168, 85, 247, 0.6)';

            // Determine animation class — only one active at a time
            let animCls = 'ds-bubble--pop-on';
            if (isPopping) animCls = 'ds-bubble--pop-off';
            else if (capsule.shaking) animCls = 'ds-bubble--shake';
            else if (isDragging) animCls = 'ds-bubble--dragging';

            return (
              <div
                key={capsule.id}
                ref={el => {
                  if (el) bubbleElsRef.current.set(capsule.id, el);
                  else bubbleElsRef.current.delete(capsule.id);
                }}
                className={`ds-bubble ${animCls}`}
                style={{
                  left: capsule.x,
                  top: capsule.y,
                  touchAction: 'none',
                  '--bubble-color': bubbleColor,
                  '--bubble-glow': bubbleGlow,
                }}
                onPointerDown={(e) => handlePointerDown(e, capsule, index)}
              >
                <span className={`ds-bubble-text ${isHebrew ? getNativeScriptFontClass(capsule.id, wordLanguageId) : getGameFontClass(capsule.id)}`} dir={isHebrew ? nativeScriptDir : 'ltr'}>
                  {capsule.text}
                </span>
                <span className="ds-bubble-shine" />
              </div>
            );
          }

          return (
            <div
              key={capsule.id}
              className={`absolute select-none transition-all cursor-grab active:cursor-grabbing ${
                capsule.shaking ? 'animate-shake' : ''
              } ${
                isPopping ? 'animate-pop' : ''
              }`}
              style={{
                left: capsule.x,
                top: capsule.y,
                transform: 'translate(-50%, -50%)',
                touchAction: 'none'
              }}
              onPointerDown={(e) => handlePointerDown(e, capsule, index)}
            >
              <div
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap shadow-lg transition-all ${
                  isHebrew
                    ? 'bg-blue-600 text-white'
                    : isTransliteration
                      ? 'bg-amber-500 text-white'
                      : 'bg-purple-600 text-white'
                } ${
                  isDragging ? 'scale-110 shadow-2xl' : ''
                } ${
                  capsule.shaking ? 'ring-2 ring-red-500' : ''
                }`}
                dir={isHebrew ? nativeScriptDir : 'ltr'}
              >
                <span className={isHebrew ? getNativeScriptFontClass(capsule.id, wordLanguageId) : getGameFontClass(capsule.id)}>{capsule.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint button (only shown after game has started) */}
      {gameStarted && !showLines && (
        <button
          onClick={() => {
            // Restart hint succession
            setCurrentHintPairIndex(0);
            setShowLines(true);

            const totalPairs = wordPairs.length;
            const hintInterval = setInterval(() => {
              setCurrentHintPairIndex(prev => {
                const nextIndex = prev + 1;
                if (nextIndex >= totalPairs) {
                  setShowLines(false);
                  clearInterval(hintInterval);
                  return prev;
                }
                return nextIndex;
              });
            }, 800); // 0.8 seconds per pair
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all"
        >
          Show Hint
        </button>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          25% { transform: translate(-50%, -50%) translateX(-10px); }
          75% { transform: translate(-50%, -50%) translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        @keyframes pop {
          0% { transform: translate(-50%, -50%) scale(1); }
          25% { transform: translate(-50%, -50%) scale(1.2); }
          50% { transform: translate(-50%, -50%) scale(0.9); }
          75% { transform: translate(-50%, -50%) scale(1.15); }
          100% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        }
        .animate-pop {
          animation: pop 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
