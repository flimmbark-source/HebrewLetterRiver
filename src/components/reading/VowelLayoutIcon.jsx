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

// Triangle icon (3 beats - CLOCKWISE: top, bottom-right, bottom-left)
function TriangleIcon({ center, size, colors, segments }) {
  const height = (size * Math.sqrt(3)) / 2;
  const top = center - height * 0.6;
  const bottom = center + height * 0.4;
  const left = center - size / 2;
  const right = center + size / 2;

  if (segments === 1) {
    return (
      <path
        d={`M ${center},${top} L ${right},${bottom} L ${left},${bottom} Z`}
        fill={colors[0]}
      />
    );
  }

  // CLOCKWISE from top: top wedge (12 o'clock), bottom-right wedge (4 o'clock), bottom-left wedge (8 o'clock)
  return (
    <g>
      {/* Top wedge - colors[0] */}
      <path
        d={`M ${center},${top} L ${right},${bottom} L ${center},${center} Z`}
        fill={colors[0]}
      />
      {/* Bottom-right wedge - colors[1] */}
      <path
        d={`M ${center},${center} L ${right},${bottom} L ${left},${bottom} Z`}
        fill={colors[1] || colors[0]}
      />
      {/* Bottom-left wedge - colors[2] */}
      <path
        d={`M ${left},${bottom} L ${center},${center} L ${center},${top} Z`}
        fill={colors[2] || colors[0]}
      />
    </g>
  );
}

function TriangleStroke({ center, size }) {
  const height = (size * Math.sqrt(3)) / 2;
  const top = center - height * 0.6;
  const bottom = center + height * 0.4;
  const left = center - size / 2;
  const right = center + size / 2;

  return (
    <path
      d={`M ${center},${top} L ${right},${bottom} L ${left},${bottom} Z`}
      fill="none"
      stroke="#64748B"
      strokeWidth={3}
    />
  );
}

// Square icon (4 beats - CLOCKWISE: top-left, top-right, bottom-right, bottom-left)
function SquareIcon({ center, size, colors, segments }) {
  const half = size / 2;
  const left = center - half;
  const right = center + half;
  const top = center - half;
  const bottom = center + half;

  if (segments === 1) {
    return (
      <rect
        x={left}
        y={top}
        width={size}
        height={size}
        fill={colors[0]}
      />
    );
  }

  if (segments === 2) {
    // Two halves: top and bottom (CLOCKWISE)
    return (
      <g>
        <rect x={left} y={top} width={size} height={half} fill={colors[0]} />
        <rect x={left} y={center} width={size} height={half} fill={colors[1] || colors[0]} />
      </g>
    );
  }

  // CLOCKWISE from top-left: top-left (10:30), top-right (1:30), bottom-right (4:30), bottom-left (7:30)
  return (
    <g>
      {/* Top-left - colors[0] */}
      <rect x={left} y={top} width={half} height={half} fill={colors[0]} />
      {/* Top-right - colors[1] */}
      <rect x={center} y={top} width={half} height={half} fill={colors[1] || colors[0]} />
      {/* Bottom-right - colors[2] */}
      <rect x={center} y={center} width={half} height={half} fill={colors[2] || colors[0]} />
      {/* Bottom-left - colors[3] */}
      <rect x={left} y={center} width={half} height={half} fill={colors[3] || colors[0]} />
    </g>
  );
}

function SquareStroke({ center, size }) {
  const half = size / 2;
  return (
    <rect
      x={center - half}
      y={center - half}
      width={size}
      height={size}
      fill="none"
      stroke="#64748B"
      strokeWidth={3}
    />
  );
}

// Hexagon icon (5-6 beats - CLOCKWISE: top, top-right, bottom-right, bottom, bottom-left, top-left)
function HexagonIcon({ center, size, colors, segments }) {
  const radius = size / 2;

  // Calculate hexagon points (pointy-top orientation)
  // Starting from top and going clockwise
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (90 - i * 60); // Start at top (90°), go clockwise
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

  // Calculate hexagon points (pointy-top orientation)
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (90 - i * 60); // Start at top (90°), go clockwise
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

// Heptagon icon (7 beats - CLOCKWISE from top: 7 wedges)
function HeptagonIcon({ center, size, colors, segments }) {
  const radius = size / 2;

  // Calculate heptagon points (7 sides, pointy-top)
  const points = [];
  for (let i = 0; i < 7; i++) {
    const angle = (Math.PI / 180) * (90 - i * (360 / 7)); // Start at top, go clockwise
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
    const angle = (Math.PI / 180) * (90 - i * (360 / 7));
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

// Octagon icon (8 beats - CLOCKWISE from top: 8 wedges)
function OctagonIcon({ center, size, colors, segments }) {
  const radius = size / 2;

  // Calculate octagon points (8 sides, pointy-top)
  const points = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 180) * (90 - i * 45); // Start at top, go clockwise (360/8 = 45°)
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
    const angle = (Math.PI / 180) * (90 - i * 45);
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
