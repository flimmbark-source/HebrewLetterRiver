/**
 * Vowel Layout Icon Component
 *
 * Renders an SVG icon whose:
 * - Shape encodes beat count (circle=1, diamond=2, triangle=3, square=4)
 * - Internal colors encode vowel sequence
 * - Segments split by beats
 */

import React from 'react';
import { deriveLayoutFromTransliteration, VOWEL_COLORS } from '../../lib/vowelLayoutDerivation.js';

/**
 * VowelLayoutIcon Component
 *
 * @param {Object} props
 * @param {string} props.layoutId - Vowel layout ID (e.g., "VL_2_A-A")
 * @param {string} [props.transliteration] - Alternative: derive from transliteration
 * @param {number} [props.size=40] - Icon size in pixels
 * @param {boolean} [props.showNewDot=false] - Show NEW indicator dot
 * @param {function} [props.onClick] - Click handler
 * @param {string} [props.accessibilityLabel] - Accessibility label
 * @param {string} [props.className] - Additional CSS classes
 */
export function VowelLayoutIcon({
  layoutId,
  transliteration,
  size = 40,
  showNewDot = false,
  onClick,
  accessibilityLabel,
  className = ''
}) {
  // Derive layout info
  let layoutInfo;

  if (transliteration) {
    layoutInfo = deriveLayoutFromTransliteration(transliteration);
  } else if (layoutId) {
    // Parse layoutId to extract vowel tokens
    // Format: VL_<beatCount>_<vowel1>-<vowel2>-...
    const parts = layoutId.split('_');
    if (parts.length >= 3) {
      const vowelTokens = parts.slice(2).join('_').split('-');
      const beatCount = vowelTokens.length;
      const colors = vowelTokens.map(token => VOWEL_COLORS[token] || '#999');

      layoutInfo = {
        id: layoutId,
        vowelTokens,
        beatCount,
        iconSpec: {
          shape: getShapeForBeatCount(beatCount),
          colors,
          segments: Math.min(beatCount, 4),
          showBadge: beatCount > 4,
          fullBeatCount: beatCount
        }
      };
    }
  }

  if (!layoutInfo || !layoutInfo.iconSpec) {
    return null; // Defensive: no valid layout
  }

  const { iconSpec } = layoutInfo;
  const { shape, colors, segments, showBadge } = iconSpec;

  const viewBoxSize = 100;
  const center = viewBoxSize / 2;

  return (
    <div
      className={`vowel-layout-icon relative inline-block ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={accessibilityLabel || `Vowel layout: ${layoutInfo.vowelTokens.join('-')}`}
      tabIndex={onClick ? 0 : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Render shape with segmented fills */}
        {shape === 'circle' && (
          <CircleIcon center={center} radius={45} color={colors[0]} />
        )}

        {shape === 'diamond' && (
          <DiamondIcon center={center} size={70} colors={colors} segments={segments} />
        )}

        {shape === 'triangle' && (
          <TriangleIcon center={center} size={80} colors={colors} segments={segments} />
        )}

        {shape === 'square' && (
          <SquareIcon center={center} size={70} colors={colors} segments={segments} />
        )}

        {shape === 'hexagon' && (
          <HexagonIcon center={center} size={72} colors={colors} segments={segments} />
        )}

        {shape === 'heptagon' && (
          <HeptagonIcon center={center} size={72} colors={colors} segments={segments} />
        )}

        {shape === 'octagon' && (
          <OctagonIcon center={center} size={72} colors={colors} segments={segments} />
        )}

        {/* Badge for >8 beats */}
        {showBadge && (
          <g>
            <circle cx={85} cy={15} r={12} fill="#3B82F6" stroke="#fff" strokeWidth={2} />
            <text
              x={85}
              y={20}
              textAnchor="middle"
              fontSize={14}
              fontWeight="bold"
              fill="#fff"
            >
              +
            </text>
          </g>
        )}

        {/* Border stroke */}
        {shape === 'circle' && (
          <circle cx={center} cy={center} r={45} fill="none" stroke="#64748B" strokeWidth={3} />
        )}
        {shape === 'diamond' && (
          <DiamondStroke center={center} size={70} />
        )}
        {shape === 'triangle' && (
          <TriangleStroke center={center} size={80} />
        )}
        {shape === 'square' && (
          <SquareStroke center={center} size={70} />
        )}
        {shape === 'hexagon' && (
          <HexagonStroke center={center} size={72} />
        )}
        {shape === 'heptagon' && (
          <HeptagonStroke center={center} size={72} />
        )}
        {shape === 'octagon' && (
          <OctagonStroke center={center} size={72} />
        )}
      </svg>

      {/* NEW dot indicator */}
      {showNewDot && (
        <div
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white"
          title="New layout"
        />
      )}
    </div>
  );
}

// Helper to determine shape from beat count
function getShapeForBeatCount(beatCount) {
  if (beatCount === 1) return 'circle';
  if (beatCount === 2) return 'diamond';
  if (beatCount === 3) return 'triangle';
  return 'square'; // 4 or more
}

// Circle icon (1 beat - solid fill)
function CircleIcon({ center, radius, color }) {
  return <circle cx={center} cy={center} r={radius} fill={color} />;
}

// Diamond icon (2 beats - CLOCKWISE: top half, then bottom half)
function DiamondIcon({ center, size, colors, segments }) {
  const halfDiag = size / 2;

  if (segments === 1) {
    // Solid fill
    return (
      <path
        d={`M ${center},${center - halfDiag} L ${center + halfDiag},${center} L ${center},${center + halfDiag} L ${center - halfDiag},${center} Z`}
        fill={colors[0]}
      />
    );
  }

  // CLOCKWISE from top: top half (12 o'clock), bottom half (6 o'clock)
  return (
    <g>
      {/* Top half - colors[0] */}
      <path
        d={`M ${center},${center - halfDiag} L ${center + halfDiag},${center} L ${center - halfDiag},${center} Z`}
        fill={colors[0]}
      />
      {/* Bottom half - colors[1] */}
      <path
        d={`M ${center - halfDiag},${center} L ${center + halfDiag},${center} L ${center},${center + halfDiag} Z`}
        fill={colors[1] || colors[0]}
      />
    </g>
  );
}

function DiamondStroke({ center, size }) {
  const halfDiag = size / 2;
  return (
    <path
      d={`M ${center},${center - halfDiag} L ${center + halfDiag},${center} L ${center},${center + halfDiag} L ${center - halfDiag},${center} Z`}
      fill="none"
      stroke="#64748B"
      strokeWidth={3}
    />
  );
}

// Triangle icon (3 beats - CLOCKWISE from 12 o'clock)
function TriangleIcon({ center, size, colors, segments }) {
  const radius = size / 2;

  // Calculate triangle points (pointy-top orientation)
  // Offset by 60° (half of 120°) to center first wedge at 12 o'clock
  const points = [];
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI / 180) * (90 + 60 - i * 120); // Start at 150°, go clockwise by 120°
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  if (segments === 1) {
    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    return <path d={pathData} fill={colors[0]} />;
  }

  // CLOCKWISE from 12 o'clock: 3 wedges emanating from center
  return (
    <g>
      {points.map((point, i) => {
        if (i >= segments) return null;
        const nextPoint = points[(i + 1) % 3];
        return (
          <path
            key={i}
            d={`M ${center},${center} L ${point.x},${point.y} L ${nextPoint.x},${nextPoint.y} Z`}
            fill={colors[i] || colors[0]}
          />
        );
      })}
    </g>
  );
}

function TriangleStroke({ center, size }) {
  const radius = size / 2;

  const points = [];
  for (let i = 0; i < 3; i++) {
    const angle = (Math.PI / 180) * (90 + 60 - i * 120);
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <path
      d={pathData}
      fill="none"
      stroke="#64748B"
      strokeWidth={3}
    />
  );
}

// Square icon (4 beats - CLOCKWISE from 12 o'clock)
function SquareIcon({ center, size, colors, segments }) {
  const radius = size / 2;

  // Calculate square points (diamond orientation - point at top)
  // Offset by 45° (half of 90°) to center first wedge at 12 o'clock
  const points = [];
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 180) * (90 + 45 - i * 90); // Start at 135°, go clockwise by 90°
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  if (segments === 1) {
    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    return <path d={pathData} fill={colors[0]} />;
  }

  // CLOCKWISE from 12 o'clock: 4 wedges emanating from center
  return (
    <g>
      {points.map((point, i) => {
        if (i >= segments) return null;
        const nextPoint = points[(i + 1) % 4];
        return (
          <path
            key={i}
            d={`M ${center},${center} L ${point.x},${point.y} L ${nextPoint.x},${nextPoint.y} Z`}
            fill={colors[i] || colors[0]}
          />
        );
      })}
    </g>
  );
}

function SquareStroke({ center, size }) {
  const radius = size / 2;

  const points = [];
  for (let i = 0; i < 4; i++) {
    const angle = (Math.PI / 180) * (90 + 45 - i * 90);
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <path
      d={pathData}
      fill="none"
      stroke="#64748B"
      strokeWidth={3}
    />
  );
}

// Hexagon icon (5-6 beats - CLOCKWISE from 12 o'clock)
function HexagonIcon({ center, size, colors, segments }) {
  const radius = size / 2;

  // Calculate hexagon points (pointy-top orientation)
  // Offset by 30° (half of 60°) to center first wedge at 12 o'clock
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (90 + 30 - i * 60); // Start at 120°, go clockwise by 60°
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  if (segments === 1) {
    // Solid fill
    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    return <path d={pathData} fill={colors[0]} />;
  }

  // CLOCKWISE from top: 6 wedges emanating from center
  return (
    <g>
      {points.map((point, i) => {
        if (i >= segments) return null;

        const nextPoint = points[(i + 1) % 6];

        return (
          <path
            key={i}
            d={`M ${center},${center} L ${point.x},${point.y} L ${nextPoint.x},${nextPoint.y} Z`}
            fill={colors[i] || colors[0]}
          />
        );
      })}
    </g>
  );
}

function HexagonStroke({ center, size }) {
  const radius = size / 2;

  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (90 + 30 - i * 60);
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <path
      d={pathData}
      fill="none"
      stroke="#64748B"
      strokeWidth={3}
    />
  );
}

// Heptagon icon (7 beats - CLOCKWISE from 12 o'clock)
function HeptagonIcon({ center, size, colors, segments }) {
  const radius = size / 2;

  // Calculate heptagon points (7 sides, pointy-top)
  // Offset by 180/7° to center first wedge at 12 o'clock
  const points = [];
  for (let i = 0; i < 7; i++) {
    const angle = (Math.PI / 180) * (90 + 180/7 - i * (360 / 7)); // Start offset, go clockwise
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  if (segments === 1) {
    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    return <path d={pathData} fill={colors[0]} />;
  }

  // CLOCKWISE from top: 7 wedges emanating from center
  return (
    <g>
      {points.map((point, i) => {
        if (i >= segments) return null;
        const nextPoint = points[(i + 1) % 7];
        return (
          <path
            key={i}
            d={`M ${center},${center} L ${point.x},${point.y} L ${nextPoint.x},${nextPoint.y} Z`}
            fill={colors[i] || colors[0]}
          />
        );
      })}
    </g>
  );
}

function HeptagonStroke({ center, size }) {
  const radius = size / 2;

  const points = [];
  for (let i = 0; i < 7; i++) {
    const angle = (Math.PI / 180) * (90 + 180/7 - i * (360 / 7));
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <path
      d={pathData}
      fill="none"
      stroke="#64748B"
      strokeWidth={3}
    />
  );
}

// Octagon icon (8 beats - CLOCKWISE from 12 o'clock)
function OctagonIcon({ center, size, colors, segments }) {
  const radius = size / 2;

  // Calculate octagon points (8 sides, pointy-top)
  // Offset by 22.5° (half of 45°) to center first wedge at 12 o'clock
  const points = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 180) * (90 + 22.5 - i * 45); // Start at 112.5°, go clockwise by 45°
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  if (segments === 1) {
    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
    return <path d={pathData} fill={colors[0]} />;
  }

  // CLOCKWISE from top: 8 wedges emanating from center
  return (
    <g>
      {points.map((point, i) => {
        if (i >= segments) return null;
        const nextPoint = points[(i + 1) % 8];
        return (
          <path
            key={i}
            d={`M ${center},${center} L ${point.x},${point.y} L ${nextPoint.x},${nextPoint.y} Z`}
            fill={colors[i] || colors[0]}
          />
        );
      })}
    </g>
  );
}

function OctagonStroke({ center, size }) {
  const radius = size / 2;

  const points = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 180) * (90 + 22.5 - i * 45);
    const x = center + radius * Math.cos(angle);
    const y = center - radius * Math.sin(angle);
    points.push({ x, y });
  }

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;

  return (
    <path
      d={pathData}
      fill="none"
      stroke="#64748B"
      strokeWidth={3}
    />
  );
}

export default VowelLayoutIcon;
