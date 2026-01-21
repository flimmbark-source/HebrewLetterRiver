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

  // Initialize capsules with random positions
  useEffect(() => {
    if (!playAreaRef.current) return;

    const bounds = playAreaRef.current.getBoundingClientRect();
    setPlayAreaBounds({ width: bounds.width, height: bounds.height });

    // Ensure we have unique pairs (handle duplicates by adding disambiguation)
    const uniquePairs = ensureUniquePairs(wordPairs);

    const capsules = [];
    const padding = 60;
    const usableWidth = bounds.width - padding * 2;
    const usableHeight = bounds.height - padding * 2;

    // Create Hebrew capsules (left side)
    uniquePairs.forEach((pair, index) => {
      capsules.push({
        id: `hebrew-${index}`,
        type: 'hebrew',
        text: pair.hebrew,
        pairIndex: index,
        x: padding + Math.random() * (usableWidth * 0.4),
        y: padding + Math.random() * usableHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        matched: false,
        shaking: false
      });
    });

    // Create meaning capsules (right side)
    uniquePairs.forEach((pair, index) => {
      capsules.push({
        id: `meaning-${index}`,
        type: 'meaning',
        text: pair.meaning,
        pairIndex: index,
        x: padding + usableWidth * 0.6 + Math.random() * (usableWidth * 0.4),
        y: padding + Math.random() * usableHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        matched: false
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

  // Animation loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    function animate() {
      const capsules = capsulesRef.current;
      const bounds = playAreaBounds;

      capsules.forEach(capsule => {
        if (capsule.matched || dragStateRef.current.isDragging) return;

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

  // Pointer event handlers
  const handlePointerDown = useCallback((e, capsule, index) => {
    if (capsule.type !== 'hebrew' || capsule.matched) return;

    e.preventDefault();
    const rect = playAreaRef.current.getBoundingClientRect();
    dragStateRef.current = {
      isDragging: true,
      capsuleIndex: index,
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
    const hebrewCapsule = capsulesRef.current[index];

    // Check for matches with meaning capsules
    let matched = false;
    capsulesRef.current.forEach(capsule => {
      if (capsule.type === 'meaning' && !capsule.matched) {
        const dx = hebrewCapsule.x - capsule.x;
        const dy = hebrewCapsule.y - capsule.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CAPSULE_RADIUS * 2) {
          // Check if correct match
          if (hebrewCapsule.pairIndex === capsule.pairIndex) {
            // Correct match!
            hebrewCapsule.matched = true;
            capsule.matched = true;
            matched = true;

            setMatchedPairs(prev => new Set([...prev, hebrewCapsule.pairIndex]));

            // Add ghost
            setGhostPairs(prev => [...prev, {
              hebrew: hebrewCapsule.text,
              meaning: capsule.text,
              x: (hebrewCapsule.x + capsule.x) / 2,
              y: (hebrewCapsule.y + capsule.y) / 2,
              timestamp: Date.now()
            }]);

            // Check if all matched
            const allMatched = capsulesRef.current
              .filter(c => c.type === 'hebrew')
              .every(c => c.matched);

            if (allMatched) {
              const time = Date.now() - startTimeRef.current;
              setCompletionTime(time);
              setGameState('completed');
            }
          } else {
            // Incorrect match
            hebrewCapsule.shaking = true;
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
        <p className="text-sm text-slate-200">Drag Hebrew words to their meanings</p>
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
        {/* Ghost pairs (afterimages) */}
        {ghostPairs.map((ghost, i) => {
          const age = Date.now() - ghost.timestamp;
          const opacity = Math.max(0, 1 - age / 2000);
          return (
            <div
              key={`ghost-${i}`}
              className="absolute pointer-events-none transition-opacity duration-1000"
              style={{
                left: ghost.x,
                top: ghost.y,
                transform: 'translate(-50%, -50%)',
                opacity
              }}
            >
              <div className="flex flex-col items-center gap-1 text-slate-400 text-sm">
                <span className="hebrew-font" dir="rtl">{ghost.hebrew}</span>
                <span>{ghost.meaning}</span>
              </div>
            </div>
          );
        })}

        {/* Capsules */}
        {capsulesRef.current.map((capsule, index) => {
          if (capsule.matched) return null;

          const isHebrew = capsule.type === 'hebrew';
          const isDragging = dragStateRef.current.isDragging && dragStateRef.current.capsuleIndex === index;

          return (
            <div
              key={capsule.id}
              className={`absolute select-none transition-all ${
                isHebrew ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              } ${
                capsule.shaking ? 'animate-shake' : ''
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
                className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap shadow-lg ${
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
      `}</style>
    </div>
  );
}
