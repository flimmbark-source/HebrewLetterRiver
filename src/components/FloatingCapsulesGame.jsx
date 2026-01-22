import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * FloatingCapsulesGame - A word-matching mini-game with floating capsules
 *
 * Players drag Hebrew, transliteration, or meaning capsules onto their matching partners.
 * Capsules float gently like leaves on water with connecting lines shown at start.
 */

const PREVIEW_DURATION = 3000; // Show lines for 3 seconds
const FADE_DURATION = 1000; // Fade lines over 1 second
const CAPSULE_RADIUS = 40; // Hit detection radius
const BOUNCE_DAMPING = 0.7; // Velocity reduction on bounce
const LINE_OF_SIGHT_BUFFER = 65; // Clearance for matched capsules
const CAPSULE_CLEARANCE_BUFFER = 14; // Extra spacing to avoid overlaps

export default function FloatingCapsulesGame({ wordPairs, onComplete }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [gameState, setGameState] = useState('playing'); // 'playing' | 'completed'
  const [mismatchCount, setMismatchCount] = useState(0);
  const [completionTime, setCompletionTime] = useState(0);
  const [showLines, setShowLines] = useState(true);
  const [lineOpacity, setLineOpacity] = useState(1);
  const startTimeRef = useRef(Date.now());

  // Capsule state
  const capsulesRef = useRef([]);
  const [ghostPairs, setGhostPairs] = useState([]);

  // Drag state
  const dragStateRef = useRef({
    isDragging: false,
    capsuleIndex: -1,
    offsetX: 0,
    offsetY: 0
  });

  const playAreaRef = useRef(null);
  const [playAreaBounds, setPlayAreaBounds] = useState({ width: 0, height: 0 });

  // Initialize capsules with well-distributed positions
  useEffect(() => {
    if (!playAreaRef.current) return;

    const bounds = playAreaRef.current.getBoundingClientRect();
    setPlayAreaBounds({ width: bounds.width, height: bounds.height });

    // Ensure we have unique pairs (handle duplicates by adding disambiguation)
    const uniquePairs = ensureUniquePairs(wordPairs);

    const capsules = [];
    const padding = CAPSULE_RADIUS; // Just enough for capsule size
    const usableWidth = bounds.width - padding * 2;
    const usableHeight = bounds.height - padding * 2;

    const measurementCanvas = document.createElement('canvas');
    const measurementContext = measurementCanvas.getContext('2d');
    const getCapsuleRadius = (text, isHebrew) => {
      if (!measurementContext) {
        return CAPSULE_RADIUS;
      }
      const fontSize = isHebrew ? 18 : 16;
      const fontFamily = isHebrew ? '"Noto Sans Hebrew", "Arial", sans-serif' : '"Inter", "Arial", sans-serif';
      measurementContext.font = `600 ${fontSize}px ${fontFamily}`;
      const textWidth = measurementContext.measureText(text).width;
      const width = textWidth + 32;
      const height = fontSize + 16;
      return Math.max(width, height) / 2 + CAPSULE_CLEARANCE_BUFFER;
    };

    // Helper to check if position is too close to existing capsules
    const isTooClose = (x, y, radius, existingCapsules) => {
      return existingCapsules.some(cap => {
        const dx = cap.x - x;
        const dy = cap.y - y;
        // Just use the actual radii, no extra buffer
        const minDistance = radius + (cap.radius ?? CAPSULE_RADIUS);
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
          return distance >= LINE_OF_SIGHT_BUFFER;
        })
      );
    };

    const resolveSpawnOverlaps = (capsulesToResolve) => {
      const minX = padding;
      const maxX = bounds.width - padding;
      const minY = padding;
      const maxY = bounds.height - padding;
      const maxIterations = 30;
      const pairGroups = new Map();

      capsulesToResolve.forEach(capsule => {
        if (!pairGroups.has(capsule.pairIndex)) {
          pairGroups.set(capsule.pairIndex, []);
        }
        pairGroups.get(capsule.pairIndex).push(capsule);
      });

      const clampCapsule = (capsule) => {
        capsule.x = Math.max(minX, Math.min(maxX, capsule.x));
        capsule.y = Math.max(minY, Math.min(maxY, capsule.y));
      };

      const applyPairOffset = (pairIndex, offsetX, offsetY) => {
        const group = pairGroups.get(pairIndex) || [];
        group.forEach(member => {
          member.x += offsetX;
          member.y += offsetY;
          clampCapsule(member);
        });
      };

      for (let iteration = 0; iteration < maxIterations; iteration += 1) {
        let moved = false;

        for (let i = 0; i < capsulesToResolve.length; i += 1) {
          for (let j = i + 1; j < capsulesToResolve.length; j += 1) {
            const first = capsulesToResolve[i];
            const second = capsulesToResolve[j];
            const dx = second.x - first.x;
            const dy = second.y - first.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (first.radius ?? CAPSULE_RADIUS) +
              (second.radius ?? CAPSULE_RADIUS) +
              CAPSULE_CLEARANCE_BUFFER;

            if (distance < minDistance) {
              const overlap = minDistance - distance;
              const angle = distance === 0 ? Math.random() * Math.PI * 2 : Math.atan2(dy, dx);
              const offsetX = Math.cos(angle) * (overlap / 2);
              const offsetY = Math.sin(angle) * (overlap / 2);

              if (first.pairIndex === second.pairIndex) {
                first.x -= offsetX;
                first.y -= offsetY;
                second.x += offsetX;
                second.y += offsetY;
                clampCapsule(first);
                clampCapsule(second);
              } else {
                applyPairOffset(first.pairIndex, -offsetX, -offsetY);
                applyPairOffset(second.pairIndex, offsetX, offsetY);
              }
              moved = true;
            }
          }
        }

        if (!moved) {
          break;
        }
      }
    };

    // Create capsules in columns by TYPE (left: ALL Hebrew, middle: ALL Transliteration, right: ALL Meaning)
    // with randomized positions within each column
    const columnWidth = usableWidth / 3;
    const hebrewColumnX = padding + columnWidth / 2;
    const translitColumnX = padding + columnWidth + columnWidth / 2;
    const meaningColumnX = padding + 2 * columnWidth + columnWidth / 2;

    // Helper function to find a random position within a column that doesn't overlap
    const findColumnPosition = (columnCenterX, radius) => {
      const maxAttempts = 50;
      const columnHalfWidth = columnWidth / 2 - padding / 2;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = columnCenterX + (Math.random() - 0.5) * columnHalfWidth * 1.6;
        const y = padding + Math.random() * usableHeight;

        if (!isTooClose(x, y, radius, capsules)) {
          return { x, y };
        }
      }

      // Fallback: just use column center with random y
      return {
        x: columnCenterX,
        y: padding + Math.random() * usableHeight
      };
    };

    // Create ALL Hebrew capsules in left column
    uniquePairs.forEach((pair, index) => {
      const radius = getCapsuleRadius(pair.hebrew, true);
      const pos = findColumnPosition(hebrewColumnX, radius);
      const wanderDelay = 1200 + Math.random() * 1800;

      capsules.push({
        id: `hebrew-${index}`,
        type: 'hebrew',
        text: pair.hebrew,
        pairIndex: index,
        x: pos.x,
        y: pos.y,
        radius: radius,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        targetVx: (Math.random() - 0.5) * 0.4,
        targetVy: (Math.random() - 0.5) * 0.4,
        nextWanderAt: Date.now() + wanderDelay,
        matched: false,
        shaking: false
      });
    });

    // Create ALL Transliteration capsules in middle column
    uniquePairs.forEach((pair, index) => {
      const radius = getCapsuleRadius(pair.transliteration || pair.hebrew, false);
      const pos = findColumnPosition(translitColumnX, radius);
      const wanderDelay = 1200 + Math.random() * 1800;

      capsules.push({
        id: `transliteration-${index}`,
        type: 'transliteration',
        text: pair.transliteration || pair.hebrew,
        pairIndex: index,
        x: pos.x,
        y: pos.y,
        radius: radius,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        targetVx: (Math.random() - 0.5) * 0.4,
        targetVy: (Math.random() - 0.5) * 0.4,
        nextWanderAt: Date.now() + wanderDelay,
        matched: false,
        shaking: false
      });
    });

    // Create ALL Meaning capsules in right column
    uniquePairs.forEach((pair, index) => {
      const radius = getCapsuleRadius(pair.meaning, false);
      const pos = findColumnPosition(meaningColumnX, radius);
      const wanderDelay = 1200 + Math.random() * 1800;

      capsules.push({
        id: `meaning-${index}`,
        type: 'meaning',
        text: pair.meaning,
        pairIndex: index,
        x: pos.x,
        y: pos.y,
        radius: radius,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        targetVx: (Math.random() - 0.5) * 0.4,
        targetVy: (Math.random() - 0.5) * 0.4,
        nextWanderAt: Date.now() + wanderDelay,
        matched: false,
        shaking: false
      });
    });

    resolveSpawnOverlaps(capsules);

    capsulesRef.current = capsules;

    // Start line fade timer
    setTimeout(() => {
      const fadeStart = Date.now();
      const fadeInterval = setInterval(() => {
        const elapsed = Date.now() - fadeStart;
        const progress = Math.min(elapsed / FADE_DURATION, 1);
        setLineOpacity(1 - progress);

        if (progress >= 1) {
          setShowLines(false);
          clearInterval(fadeInterval);
        }
      }, 16);
    }, PREVIEW_DURATION);

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

  // Animation loop - keep capsules moving even during drag
  useEffect(() => {
    if (gameState !== 'playing') return;

    function animate() {
      const capsules = capsulesRef.current;
      const bounds = playAreaBounds;

      const now = Date.now();
      capsules.forEach((capsule, index) => {
        // Skip matched capsules and the one currently being dragged
        if (capsule.matched) return;
        const isDragging = dragStateRef.current.isDragging && dragStateRef.current.capsuleIndex === index;
        if (isDragging) return;

        const timeForWander = capsule.nextWanderAt && now >= capsule.nextWanderAt;
        if (timeForWander) {
          capsule.targetVx = (Math.random() - 0.5) * 0.4;
          capsule.targetVy = (Math.random() - 0.5) * 0.4;
          capsule.nextWanderAt = now + 1200 + Math.random() * 1800;
        }

        const smoothing = 0.02;
        capsule.vx += (capsule.targetVx - capsule.vx) * smoothing;
        capsule.vy += (capsule.targetVy - capsule.vy) * smoothing;

        const speedLimit = 0.7;
        const speed = Math.sqrt(capsule.vx * capsule.vx + capsule.vy * capsule.vy);
        if (speed > speedLimit) {
          capsule.vx = (capsule.vx / speed) * speedLimit;
          capsule.vy = (capsule.vy / speed) * speedLimit;
        }

        // Update position
        capsule.x += capsule.vx;
        capsule.y += capsule.vy;

        // Bounce off walls - use capsule's actual radius as margin
        const margin = capsule.radius ?? CAPSULE_RADIUS;
        if (capsule.x < margin || capsule.x > bounds.width - margin) {
          capsule.vx *= -BOUNCE_DAMPING;
          capsule.targetVx = -capsule.targetVx;
          capsule.x = Math.max(margin, Math.min(bounds.width - margin, capsule.x));
        }
        if (capsule.y < margin || capsule.y > bounds.height - margin) {
          capsule.vy *= -BOUNCE_DAMPING;
          capsule.targetVy = -capsule.targetVy;
          capsule.y = Math.max(margin, Math.min(bounds.height - margin, capsule.y));
        }

        if (capsule.shakeUntil && now >= capsule.shakeUntil) {
          capsule.shaking = false;
          capsule.shakeUntil = null;
        }
      });

      // Capsule-to-capsule collision detection and response
      for (let i = 0; i < capsules.length; i++) {
        const capsuleA = capsules[i];
        if (capsuleA.matched) continue;
        const isDraggingA = dragStateRef.current.isDragging && dragStateRef.current.capsuleIndex === i;
        if (isDraggingA) continue;

        for (let j = i + 1; j < capsules.length; j++) {
          const capsuleB = capsules[j];
          if (capsuleB.matched) continue;
          const isDraggingB = dragStateRef.current.isDragging && dragStateRef.current.capsuleIndex === j;
          if (isDraggingB) continue;

          const dx = capsuleB.x - capsuleA.x;
          const dy = capsuleB.y - capsuleA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (capsuleA.radius ?? CAPSULE_RADIUS) + (capsuleB.radius ?? CAPSULE_RADIUS);

          if (distance < minDistance && distance > 0) {
            // Collision detected - apply elastic collision response
            const overlap = minDistance - distance;
            const angle = Math.atan2(dy, dx);

            // Separate capsules
            const separationX = Math.cos(angle) * (overlap / 2);
            const separationY = Math.sin(angle) * (overlap / 2);

            capsuleA.x -= separationX;
            capsuleA.y -= separationY;
            capsuleB.x += separationX;
            capsuleB.y += separationY;

            // Exchange velocities with damping for elastic collision
            const relativeVx = capsuleB.vx - capsuleA.vx;
            const relativeVy = capsuleB.vy - capsuleA.vy;
            const dotProduct = relativeVx * Math.cos(angle) + relativeVy * Math.sin(angle);

            if (dotProduct < 0) {
              const collisionDamping = 0.6; // Energy loss on collision
              const impulseX = Math.cos(angle) * dotProduct * collisionDamping;
              const impulseY = Math.sin(angle) * dotProduct * collisionDamping;

              capsuleA.vx += impulseX;
              capsuleA.vy += impulseY;
              capsuleB.vx -= impulseX;
              capsuleB.vy -= impulseY;

              // Update target velocities too so wandering doesn't immediately counteract
              capsuleA.targetVx = capsuleA.vx;
              capsuleA.targetVy = capsuleA.vy;
              capsuleB.targetVx = capsuleB.vx;
              capsuleB.targetVy = capsuleB.vy;
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, playAreaBounds]);

  // Pointer event handlers - all capsule types are draggable
  const handlePointerDown = useCallback((e, capsule, index) => {
    if (capsule.matched) return; // Only prevent dragging matched capsules

    e.preventDefault();
    const rect = playAreaRef.current.getBoundingClientRect();
    dragStateRef.current = {
      isDragging: true,
      capsuleIndex: index,
      capsuleType: capsule.type, // Track which type we're dragging
      offsetX: e.clientX - rect.left - capsule.x,
      offsetY: e.clientY - rect.top - capsule.y
    };

    e.target.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!dragStateRef.current.isDragging) return;

    const rect = playAreaRef.current.getBoundingClientRect();
    const index = dragStateRef.current.capsuleIndex;
    const capsule = capsulesRef.current[index];

    capsule.x = e.clientX - rect.left - dragStateRef.current.offsetX;
    capsule.y = e.clientY - rect.top - dragStateRef.current.offsetY;
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (!dragStateRef.current.isDragging) return;

    const index = dragStateRef.current.capsuleIndex;
    const draggedCapsule = capsulesRef.current[index];

    const candidates = capsulesRef.current
      .map((capsule, capsuleIndex) => ({ capsule, capsuleIndex }))
      .filter(({ capsule, capsuleIndex }) => capsuleIndex !== index && !capsule.matched)
      .map(({ capsule }) => {
        const dx = draggedCapsule.x - capsule.x;
        const dy = draggedCapsule.y - capsule.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return { capsule, distance };
      })
      .filter(({ distance }) => distance < CAPSULE_RADIUS * 2)
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
        draggedCapsule.shakeUntil = Date.now() + 500;
        setMismatchCount(prev => prev + 1);
      }
    }

    dragStateRef.current.isDragging = false;
  }, []);

  // Draw canvas overlay for lines
  useEffect(() => {
    if (!canvasRef.current || !showLines) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bounds = playAreaBounds;

    canvas.width = bounds.width;
    canvas.height = bounds.height;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!showLines || lineOpacity <= 0) return;

      const capsules = capsulesRef.current;
      ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity * 0.4})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      const capsulesByPair = new Map();
      capsules.forEach(capsule => {
        if (capsule.matched) return;
        if (!capsulesByPair.has(capsule.pairIndex)) {
          capsulesByPair.set(capsule.pairIndex, []);
        }
        capsulesByPair.get(capsule.pairIndex).push(capsule);
      });

      capsulesByPair.forEach(pairCapsules => {
        for (let i = 0; i < pairCapsules.length; i += 1) {
          for (let j = i + 1; j < pairCapsules.length; j += 1) {
            ctx.beginPath();
            ctx.moveTo(pairCapsules[i].x, pairCapsules[i].y);
            ctx.lineTo(pairCapsules[j].x, pairCapsules[j].y);
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(draw);
    }

    draw();
  }, [showLines, lineOpacity, playAreaBounds]);

  // Clean up ghosts after fade
  useEffect(() => {
    const interval = setInterval(() => {
      setGhostPairs(prev =>
        prev.filter(ghost => Date.now() - ghost.timestamp < 2000)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (gameState === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
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
            {wordPairs.map((pair, i) => (
              <div key={i} className="flex gap-4 justify-center items-center">
                <span className="hebrew-font text-white" dir="rtl">{pair.hebrew}</span>
                <span className="text-slate-400">→</span>
                <span className="text-white">{pair.meaning}</span>
              </div>
            ))}
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
        style={{ opacity: showLines ? lineOpacity : 0 }}
      />

      {/* Play area */}
      <div
        ref={playAreaRef}
        className="absolute inset-0"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Ghost pairs (afterimages) - float upward with colored text */}
        {ghostPairs.map((ghost, i) => {
          const age = Date.now() - ghost.timestamp;
          const duration = 2500; // Float for 2.5 seconds
          const progress = Math.min(age / duration, 1);

          // Float upward 150px over the duration
          const floatDistance = 150;
          const currentY = ghost.startY - (floatDistance * progress);

          // Fade out gradually
          const opacity = 1 - progress;

          if (progress >= 1) return null; // Don't render if done

          return (
            <div
              key={`ghost-${i}`}
              className="absolute pointer-events-none flex flex-col items-center gap-1"
              style={{
                left: ghost.x,
                top: currentY,
                transform: 'translate(-50%, -50%)',
                opacity
              }}
            >
              {ghost.items.map((item, itemIndex) => {
                const isHebrew = item.type === 'hebrew';
                return (
                  <span
                    key={`${item.text}-${itemIndex}`}
                    className={`font-semibold drop-shadow-lg ${
                      isHebrew ? 'hebrew-font text-emerald-200' : 'text-slate-200'
                    }`}
                    dir={isHebrew ? 'rtl' : 'ltr'}
                  >
                    {item.text}
                  </span>
                );
              })}
            </div>
          );
        })}

        {/* Capsules */}
        {capsulesRef.current.map((capsule, index) => {
          if (capsule.matched) return null;

          const isHebrew = capsule.type === 'hebrew';
          const isTransliteration = capsule.type === 'transliteration';
          const isDragging = dragStateRef.current.isDragging && dragStateRef.current.capsuleIndex === index;
          const isPopping = capsule.popping;

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
                dir={isHebrew ? 'rtl' : 'ltr'}
              >
                {isHebrew && <span className="hebrew-font">{capsule.text}</span>}
                {!isHebrew && capsule.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint button */}
      {!showLines && (
        <button
          onClick={() => {
            setShowLines(true);
            setLineOpacity(1);
            setTimeout(() => {
              const fadeStart = Date.now();
              const fadeInterval = setInterval(() => {
                const elapsed = Date.now() - fadeStart;
                const progress = Math.min(elapsed / FADE_DURATION, 1);
                setLineOpacity(1 - progress);

                if (progress >= 1) {
                  setShowLines(false);
                  clearInterval(fadeInterval);
                }
              }, 16);
            }, 2000);
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-all"
        >
          Show Hint
        </button>
      )}

      <style jsx>{`
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
