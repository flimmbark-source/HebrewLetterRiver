import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * FloatingCapsulesGame - A word-matching mini-game with floating capsules
 *
 * Players drag Hebrew capsules onto their matching English meaning capsules.
 * Capsules float gently like leaves on water with connecting lines shown at start.
 */

const PREVIEW_DURATION = 3000; // Show lines for 3 seconds
const FADE_DURATION = 1000; // Fade lines over 1 second
const CAPSULE_RADIUS = 40; // Hit detection radius
const BOUNCE_DAMPING = 0.7; // Velocity reduction on bounce

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
  const [matchedPairs, setMatchedPairs] = useState(new Set());
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
    const minSpacing = 100; // Minimum distance between capsules
    const usableWidth = bounds.width - padding * 2;
    const usableHeight = bounds.height - padding * 2;

    // Helper to check if position is too close to existing capsules
    const isTooClose = (x, y, existingCapsules) => {
      return existingCapsules.some(cap => {
        const dx = cap.x - x;
        const dy = cap.y - y;
        return Math.sqrt(dx * dx + dy * dy) < minSpacing;
      });
    };

    // Helper to find a good random position
    const findGoodPosition = (xMin, xMax, existingCapsules, maxAttempts = 50) => {
      for (let i = 0; i < maxAttempts; i++) {
        const x = padding + xMin + Math.random() * (xMax - xMin);
        const y = padding + Math.random() * usableHeight;
        if (!isTooClose(x, y, existingCapsules)) {
          return { x, y };
        }
      }
      // Fallback to grid-based positioning if random fails
      const row = existingCapsules.length % 3;
      const col = Math.floor(existingCapsules.length / 3);
      return {
        x: padding + xMin + (xMax - xMin) * (col * 0.3),
        y: padding + usableHeight * ((row + 0.5) / 4)
      };
    };

    // Create capsules in pairs - place them near each other for clear preview lines
    uniquePairs.forEach((pair, index) => {
      const numPairs = uniquePairs.length;
      const rowHeight = usableHeight / (numPairs + 1);
      const yBase = padding + rowHeight * (index + 1);

      // Add some vertical variation so they're not perfectly aligned
      const yVariation = (Math.random() - 0.5) * 60;

      // Hebrew capsule (left side)
      capsules.push({
        id: `hebrew-${index}`,
        type: 'hebrew',
        text: pair.hebrew,
        pairIndex: index,
        x: padding + usableWidth * 0.25,
        y: yBase + yVariation,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        matched: false,
        shaking: false
      });

      // Meaning capsule (right side, roughly aligned with its pair)
      capsules.push({
        id: `meaning-${index}`,
        type: 'meaning',
        text: pair.meaning,
        pairIndex: index,
        x: padding + usableWidth * 0.75,
        y: yBase + yVariation,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
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

      capsules.forEach((capsule, index) => {
        // Skip matched capsules and the one currently being dragged
        if (capsule.matched) return;
        const isDragging = dragStateRef.current.isDragging && dragStateRef.current.capsuleIndex === index;
        if (isDragging) return;

        // Update position
        capsule.x += capsule.vx;
        capsule.y += capsule.vy;

        // Bounce off walls
        const margin = 50;
        if (capsule.x < margin || capsule.x > bounds.width - margin) {
          capsule.vx *= -BOUNCE_DAMPING;
          capsule.x = Math.max(margin, Math.min(bounds.width - margin, capsule.x));
        }
        if (capsule.y < margin || capsule.y > bounds.height - margin) {
          capsule.vy *= -BOUNCE_DAMPING;
          capsule.y = Math.max(margin, Math.min(bounds.height - margin, capsule.y));
        }

        // Occasionally change direction slightly
        if (Math.random() < 0.02) {
          capsule.vx += (Math.random() - 0.5) * 0.2;
          capsule.vy += (Math.random() - 0.5) * 0.2;
        }

        // Clear shaking after animation
        if (capsule.shaking) {
          setTimeout(() => {
            capsule.shaking = false;
          }, 500);
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

  // Pointer event handlers - both types are now draggable
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
    const targetType = draggedCapsule.type === 'hebrew' ? 'meaning' : 'hebrew';

    // Check for matches with opposite type capsules
    let matched = false;
    capsulesRef.current.forEach(capsule => {
      if (capsule.type === targetType && !capsule.matched) {
        const dx = draggedCapsule.x - capsule.x;
        const dy = draggedCapsule.y - capsule.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CAPSULE_RADIUS * 2) {
          // Check if correct match
          if (draggedCapsule.pairIndex === capsule.pairIndex) {
            // Correct match! Mark as popping before setting matched
            draggedCapsule.popping = true;
            capsule.popping = true;

            // Delay the actual match marking to show pop animation
            setTimeout(() => {
              draggedCapsule.matched = true;
              capsule.matched = true;
              matched = true;

              setMatchedPairs(prev => new Set([...prev, draggedCapsule.pairIndex]));

              // Check if all matched
              const allMatched = capsulesRef.current
                .filter(c => c.type === 'hebrew')
                .every(c => c.matched);

              if (allMatched) {
                const time = Date.now() - startTimeRef.current;
                setCompletionTime(time);
                setGameState('completed');
              }
            }, 400);

            // Determine which is hebrew and which is meaning
            const hebrewCapsule = draggedCapsule.type === 'hebrew' ? draggedCapsule : capsule;
            const meaningCapsule = draggedCapsule.type === 'meaning' ? draggedCapsule : capsule;

            // Add floating ghost that moves upward
            setGhostPairs(prev => [...prev, {
              hebrew: hebrewCapsule.text,
              meaning: meaningCapsule.text,
              x: (draggedCapsule.x + capsule.x) / 2,
              y: (draggedCapsule.y + capsule.y) / 2,
              startY: (draggedCapsule.y + capsule.y) / 2,
              timestamp: Date.now()
            }]);
          } else {
            // Incorrect match
            draggedCapsule.shaking = true;
            setMismatchCount(prev => prev + 1);
          }
        }
      }
    });

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
      const hebrewCapsules = capsules.filter(c => c.type === 'hebrew');
      const meaningCapsules = capsules.filter(c => c.type === 'meaning');

      ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity * 0.4})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      hebrewCapsules.forEach(hebrew => {
        const meaning = meaningCapsules.find(m => m.pairIndex === hebrew.pairIndex);
        if (meaning) {
          ctx.beginPath();
          ctx.moveTo(hebrew.x, hebrew.y);
          ctx.lineTo(meaning.x, meaning.y);
          ctx.stroke();
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
      {/* Instructions */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-slate-800/90 px-4 py-2 rounded-lg text-center">
        <p className="text-sm text-slate-200">Drag words together to match them</p>
        {showLines && (
          <p className="text-xs text-slate-400 mt-1">Lines will fade soon...</p>
        )}
      </div>

      {/* Stats */}
      <div className="absolute top-4 right-4 z-10 bg-slate-800/90 px-4 py-2 rounded-lg">
        <p className="text-sm text-slate-300">Mismatches: {mismatchCount}</p>
      </div>

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
        {/* Ghost pairs (afterimages) - float upward with color */}
        {ghostPairs.map((ghost, i) => {
          const age = Date.now() - ghost.timestamp;
          const duration = 2500; // Float for 2.5 seconds
          const progress = Math.min(age / duration, 1);

          // Float upward 150px over the duration
          const floatDistance = 150;
          const currentY = ghost.startY - (floatDistance * progress);

          // Scale grows slightly then shrinks
          const scale = 1 + Math.sin(progress * Math.PI) * 0.3;

          // Fade out in the last 30% of the animation
          const fadeStart = 0.7;
          const opacity = progress < fadeStart ? 1 : 1 - ((progress - fadeStart) / (1 - fadeStart));

          if (progress >= 1) return null; // Don't render if done

          return (
            <div
              key={`ghost-${i}`}
              className="absolute pointer-events-none"
              style={{
                left: ghost.x,
                top: currentY,
                transform: `translate(-50%, -50%) scale(${scale})`,
                opacity,
                transition: 'none'
              }}
            >
              <div className="flex flex-col items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-emerald-500/80 to-teal-500/80 rounded-lg shadow-lg">
                <span className="hebrew-font text-white font-bold text-sm" dir="rtl">{ghost.hebrew}</span>
                <span className="text-white font-semibold text-xs">{ghost.meaning}</span>
              </div>
            </div>
          );
        })}

        {/* Capsules */}
        {capsulesRef.current.map((capsule, index) => {
          if (capsule.matched) return null;

          const isHebrew = capsule.type === 'hebrew';
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
