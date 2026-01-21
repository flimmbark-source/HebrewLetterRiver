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
    const padding = 80;
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
        const minDistance = radius + (cap.radius ?? CAPSULE_RADIUS) + CAPSULE_CLEARANCE_BUFFER;
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

    // Create capsules scattered like leaves in a river - pairs start near each other
    uniquePairs.forEach((pair, index) => {
      const radii = {
        hebrew: getCapsuleRadius(pair.hebrew, true),
        transliteration: getCapsuleRadius(pair.transliteration || pair.hebrew, false),
        meaning: getCapsuleRadius(pair.meaning, false)
      };
      const minPairSpacing = Math.max(
        radii.hebrew + radii.transliteration,
        radii.hebrew + radii.meaning,
        radii.transliteration + radii.meaning
      ) + CAPSULE_CLEARANCE_BUFFER;

      // Find a valid center point that doesn't overlap with existing capsules
      const pairSpacings = [
        minPairSpacing + 30,
        minPairSpacing + 15,
        minPairSpacing
      ]; // Distance between pair members
      let centerX, centerY, hebrewX, hebrewY, translitX, translitY, meaningX, meaningY;
      const isValidPlacement = (positions) => {
        const withinBounds = [positions.hebrew, positions.transliteration, positions.meaning]
          .every(pos => isWithinBounds(pos.x, pos.y));

        const spacingOk = !isTooClose(positions.hebrew.x, positions.hebrew.y, radii.hebrew, capsules) &&
          !isTooClose(positions.transliteration.x, positions.transliteration.y, radii.transliteration, capsules) &&
          !isTooClose(positions.meaning.x, positions.meaning.y, radii.meaning, capsules);

        const pairSpacingOk = [
          ['hebrew', 'transliteration'],
          ['hebrew', 'meaning'],
          ['transliteration', 'meaning']
        ].every(([first, second]) => {
          const dx = positions[first].x - positions[second].x;
          const dy = positions[first].y - positions[second].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance >= radii[first] + radii[second] + CAPSULE_CLEARANCE_BUFFER;
        });

        const lineOfSightOk = hasClearLineOfSight(positions, capsules);

        return withinBounds && spacingOk && pairSpacingOk && lineOfSightOk;
      };

      const applyPlacement = (positions) => {
        hebrewX = positions.hebrew.x;
        hebrewY = positions.hebrew.y;
        translitX = positions.transliteration.x;
        translitY = positions.transliteration.y;
        meaningX = positions.meaning.x;
        meaningY = positions.meaning.y;
      };

      const findPairPlacement = () => {
        for (const pairSpacing of pairSpacings) {
          let attempts = 0;
          const maxAttempts = 120;

          while (attempts < maxAttempts) {
            centerX = padding + Math.random() * usableWidth;
            centerY = padding + Math.random() * usableHeight;

            const baseAngles = [
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2,
              Math.random() * Math.PI * 2
            ];

            for (const baseAngle of baseAngles) {
              const angles = [baseAngle, baseAngle + (Math.PI * 2) / 3, baseAngle + (Math.PI * 4) / 3];
              const positions = {
                hebrew: { x: centerX + Math.cos(angles[0]) * pairSpacing, y: centerY + Math.sin(angles[0]) * pairSpacing },
                transliteration: { x: centerX + Math.cos(angles[1]) * pairSpacing, y: centerY + Math.sin(angles[1]) * pairSpacing },
                meaning: { x: centerX + Math.cos(angles[2]) * pairSpacing, y: centerY + Math.sin(angles[2]) * pairSpacing }
              };

              if (isValidPlacement(positions)) {
                applyPlacement(positions);
                return true;
              }
            }

            attempts++;
          }
        }

        const gridRows = Math.ceil(Math.sqrt(uniquePairs.length + 1));
        const gridCols = gridRows;
        for (const pairSpacing of pairSpacings) {
          for (let row = 0; row < gridRows; row += 1) {
            for (let col = 0; col < gridCols; col += 1) {
              centerX = padding + usableWidth * ((col + 0.5) / gridCols);
              centerY = padding + usableHeight * ((row + 0.5) / gridRows);

              const angleSteps = 6;
              for (let step = 0; step < angleSteps; step += 1) {
                const baseAngle = (step / angleSteps) * Math.PI * 2;
                const angles = [baseAngle, baseAngle + (Math.PI * 2) / 3, baseAngle + (Math.PI * 4) / 3];
                const positions = {
                  hebrew: { x: centerX + Math.cos(angles[0]) * pairSpacing, y: centerY + Math.sin(angles[0]) * pairSpacing },
                  transliteration: { x: centerX + Math.cos(angles[1]) * pairSpacing, y: centerY + Math.sin(angles[1]) * pairSpacing },
                  meaning: { x: centerX + Math.cos(angles[2]) * pairSpacing, y: centerY + Math.sin(angles[2]) * pairSpacing }
                };

                if (isValidPlacement(positions)) {
                  applyPlacement(positions);
                  return true;
                }
              }
            }
          }
        }

        return false;
      };

      if (!findPairPlacement()) {
        centerX = padding + usableWidth / 2;
        centerY = padding + usableHeight / 2;
        const fallbackSpacing = pairSpacings[pairSpacings.length - 1];
        const baseAngle = Math.random() * Math.PI * 2;
        const angles = [baseAngle, baseAngle + (Math.PI * 2) / 3, baseAngle + (Math.PI * 4) / 3];
        applyPlacement({
          hebrew: { x: centerX + Math.cos(angles[0]) * fallbackSpacing, y: centerY + Math.sin(angles[0]) * fallbackSpacing },
          transliteration: { x: centerX + Math.cos(angles[1]) * fallbackSpacing, y: centerY + Math.sin(angles[1]) * fallbackSpacing },
          meaning: { x: centerX + Math.cos(angles[2]) * fallbackSpacing, y: centerY + Math.sin(angles[2]) * fallbackSpacing }
        });
      }

      // Hebrew capsule
      const wanderDelay = 1200 + Math.random() * 1800;
      capsules.push({
        id: `hebrew-${index}`,
        type: 'hebrew',
        text: pair.hebrew,
        pairIndex: index,
        x: hebrewX,
        y: hebrewY,
        radius: radii.hebrew,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        targetVx: (Math.random() - 0.5) * 0.4,
        targetVy: (Math.random() - 0.5) * 0.4,
        nextWanderAt: Date.now() + wanderDelay,
        matched: false,
        shaking: false
      });

      // Transliteration capsule
      capsules.push({
        id: `transliteration-${index}`,
        type: 'transliteration',
        text: pair.transliteration || pair.hebrew,
        pairIndex: index,
        x: translitX,
        y: translitY,
        radius: radii.transliteration,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        targetVx: (Math.random() - 0.5) * 0.4,
        targetVy: (Math.random() - 0.5) * 0.4,
        nextWanderAt: Date.now() + wanderDelay,
        matched: false,
        shaking: false
      });

      // Meaning capsule
      capsules.push({
        id: `meaning-${index}`,
        type: 'meaning',
        text: pair.meaning,
        pairIndex: index,
        x: meaningX,
        y: meaningY,
        radius: radii.meaning,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        targetVx: (Math.random() - 0.5) * 0.4,
        targetVy: (Math.random() - 0.5) * 0.4,
        nextWanderAt: Date.now() + wanderDelay,
        matched: false,
        shaking: false
      });
    });

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

        // Bounce off walls
        const margin = 50;
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
