// Renders abstract visual cues that ground answer correctness in
// Pack Scenes. The cue itself is the correctness source for grounded
// identification scenes — it must not render the answer in any language
// (no digits, no number words, no spelled-out colors, no object labels).

const COLOR_CIRCLE_STYLES = {
  red: '#d94b3d',
  blue: '#3275d1',
  green: '#2f9d62',
  yellow: '#f0c84b',
};

function ColorCircleCue({ colorConceptId }) {
  const fill = COLOR_CIRCLE_STYLES[colorConceptId] || '#9ca3af';
  return (
    <div className="my-4 flex justify-center" aria-hidden="true">
      <div
        className="h-24 w-24 rounded-full border-[6px] border-white shadow-xl ring-1 ring-black/10"
        style={{ backgroundColor: fill }}
      />
    </div>
  );
}

function CountDotsCue({ count }) {
  if (!Number.isInteger(count) || count <= 0) return null;
  const dots = Array.from({ length: count }, (_, i) => i);
  return (
    <div
      className="my-4 flex flex-wrap items-center justify-center gap-3"
      aria-hidden="true"
      data-visual-cue="countDots"
      data-count={count}
    >
      {dots.map((i) => (
        <div
          key={i}
          data-testid="count-dot"
          className="h-8 w-8 rounded-full border-[3px] border-white bg-[#183d2e] shadow-md ring-1 ring-black/10"
        />
      ))}
    </div>
  );
}

// ─── Object Glyph ────────────────────────────────────────────────────────────
// Each glyph is a minimal inline SVG that suggests the object's silhouette
// without showing any text or target-language content.
// The 64×64 viewBox is shared across all glyphs for consistent sizing.
// Fill / stroke colours match the countDots palette for visual cohesion.

const FILL = '#183d2e';
const STROKE = 'white';
const SW = '3'; // strokeWidth

const OBJECT_GLYPH_SVG = {
  // Book: portrait rectangle with a vertical spine line and ruled page lines
  book: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="9" y="8" width="46" height="48" rx="3" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <line x1="22" y1="8" x2="22" y2="56" stroke={STROKE} strokeWidth="2.5" />
      <line x1="29" y1="22" x2="48" y2="22" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29" y1="30" x2="48" y2="30" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29" y1="38" x2="48" y2="38" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  // Phone: narrow portrait rounded-rect with speaker notch and home button
  phone: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="18" y="5" width="28" height="54" rx="7" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <line x1="27" y1="13" x2="37" y2="13" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="49" r="3.5" fill={STROKE} />
    </svg>
  ),
  // Table: wide horizontal tabletop with two legs below
  table: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="19" width="52" height="9" rx="3" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <rect x="13" y="28" width="7" height="24" rx="2" fill={FILL} stroke={STROKE} strokeWidth="2.5" />
      <rect x="44" y="28" width="7" height="24" rx="2" fill={FILL} stroke={STROKE} strokeWidth="2.5" />
    </svg>
  ),
  // Door: tall portrait rectangle with a small knob circle
  door: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="13" y="6" width="38" height="55" rx="3" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <circle cx="43" cy="33" r="3.5" fill={STROKE} />
    </svg>
  ),
  // Thing: ellipse with a dashed border — suggests "unknown / generic object"
  thing: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="32" cy="33" rx="23" ry="21" fill={FILL} stroke={STROKE} strokeWidth={SW} strokeDasharray="7 4" />
    </svg>
  ),
};

function ObjectGlyphCue({ objectConceptId }) {
  const glyph = OBJECT_GLYPH_SVG[objectConceptId] ?? OBJECT_GLYPH_SVG.thing;
  return (
    <div
      className="my-4 flex justify-center"
      aria-hidden="true"
      data-visual-cue="objectGlyph"
      data-object-concept={objectConceptId}
    >
      <div className="h-24 w-24">{glyph}</div>
    </div>
  );
}

// ─── Day Part Cue ─────────────────────────────────────────────────────────────
// morning → sun with 8 rays; night → right-facing crescent moon with 3 stars.
// No text, no labels. Pure silhouette SVGs in the shared fill/stroke palette.

const DAY_PART_SVG = {
  morning: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="12" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <line x1="32" y1="10" x2="32" y2="18" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="46" x2="32" y2="54" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="10" y1="32" x2="18" y2="32" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="32" x2="54" y2="32" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="22" x2="16" y2="16" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="22" x2="48" y2="16" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="22" y1="42" x2="16" y2="48" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="42" y1="42" x2="48" y2="48" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  night: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M 32 12 C 52 12 60 20 60 32 C 60 44 52 52 32 52 C 42 48 48 40 48 32 C 48 24 42 16 32 12 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="16" r="2.5" fill={FILL} stroke={STROKE} strokeWidth="1.5" />
      <circle cx="8" cy="30" r="2" fill={FILL} stroke={STROKE} strokeWidth="1.5" />
      <circle cx="16" cy="44" r="2" fill={FILL} stroke={STROKE} strokeWidth="1.5" />
    </svg>
  ),
};

function DayPartCue({ dayPart }) {
  const glyph = DAY_PART_SVG[dayPart] ?? DAY_PART_SVG.morning;
  return (
    <div
      className="my-4 flex justify-center"
      aria-hidden="true"
      data-visual-cue="dayPart"
      data-day-part={dayPart}
    >
      <div className="h-24 w-24">{glyph}</div>
    </div>
  );
}

export default function VisualCue({ visualCue }) {
  if (!visualCue) return null;
  if (visualCue.type === 'colorCircle') {
    return <ColorCircleCue colorConceptId={visualCue.colorConceptId} />;
  }
  if (visualCue.type === 'countDots') {
    return <CountDotsCue count={visualCue.count} />;
  }
  if (visualCue.type === 'objectGlyph') {
    return <ObjectGlyphCue objectConceptId={visualCue.objectConceptId} />;
  }
  if (visualCue.type === 'dayPart') {
    return <DayPartCue dayPart={visualCue.dayPart} />;
  }
  return null;
}
