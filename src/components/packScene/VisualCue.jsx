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

const FILL = '#183d2e';
const STROKE = 'white';
const SW = '3';
const ACTIVE = '#d98818';

const OBJECT_GLYPH_SVG = {
  book: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="9" y="8" width="46" height="48" rx="3" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <line x1="22" y1="8" x2="22" y2="56" stroke={STROKE} strokeWidth="2.5" />
      <line x1="29" y1="22" x2="48" y2="22" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29" y1="30" x2="48" y2="30" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="29" y1="38" x2="48" y2="38" stroke={STROKE} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="18" y="5" width="28" height="54" rx="7" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <line x1="27" y1="13" x2="37" y2="13" stroke={STROKE} strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="49" r="3.5" fill={STROKE} />
    </svg>
  ),
  table: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="19" width="52" height="9" rx="3" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <rect x="13" y="28" width="7" height="24" rx="2" fill={FILL} stroke={STROKE} strokeWidth="2.5" />
      <rect x="44" y="28" width="7" height="24" rx="2" fill={FILL} stroke={STROKE} strokeWidth="2.5" />
    </svg>
  ),
  door: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="13" y="6" width="38" height="55" rx="3" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      <circle cx="43" cy="33" r="3.5" fill={STROKE} />
    </svg>
  ),
  thing: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="32" cy="33" rx="23" ry="21" fill={FILL} stroke={STROKE} strokeWidth={SW} strokeDasharray="7 4" />
    </svg>
  ),
};

function ObjectGlyphCue({ objectConceptId }) {
  const glyph = OBJECT_GLYPH_SVG[objectConceptId] ?? OBJECT_GLYPH_SVG.thing;
  return (
    <div className="my-4 flex justify-center" aria-hidden="true" data-visual-cue="objectGlyph" data-object-concept={objectConceptId}>
      <div className="h-24 w-24">{glyph}</div>
    </div>
  );
}

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
      <path d="M 32 12 C 52 12 60 20 60 32 C 60 44 52 52 32 52 C 42 48 48 40 48 32 C 48 24 42 16 32 12 Z" fill={FILL} stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <circle cx="12" cy="16" r="2.5" fill={FILL} stroke={STROKE} strokeWidth="1.5" />
      <circle cx="8" cy="30" r="2" fill={FILL} stroke={STROKE} strokeWidth="1.5" />
      <circle cx="16" cy="44" r="2" fill={FILL} stroke={STROKE} strokeWidth="1.5" />
    </svg>
  ),
};

function DayPartCue({ dayPart }) {
  const glyph = DAY_PART_SVG[dayPart] ?? DAY_PART_SVG.morning;
  return (
    <div className="my-4 flex justify-center" aria-hidden="true" data-visual-cue="dayPart" data-day-part={dayPart}>
      <div className="h-24 w-24">{glyph}</div>
    </div>
  );
}

function Marker({ x, y }) {
  return <circle cx={x} cy={y} r="5" fill={ACTIVE} stroke={STROKE} strokeWidth="2" />;
}

function Person({ x, y, scale = 1, active = false }) {
  const fill = active ? ACTIVE : FILL;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cx="0" cy="-14" r="8" fill={fill} stroke={STROKE} strokeWidth="2.5" />
      <path d="M -14 15 C -11 0 -7 -5 0 -5 C 7 -5 11 0 14 15 Z" fill={fill} stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
    </g>
  );
}

function ComparisonCue({ conceptId }) {
  const isHeight = conceptId === 'tall' || conceptId === 'short';
  const leftTarget = conceptId === 'big' || conceptId === 'tall';
  const left = isHeight ? { x: 21, y: 12, w: 13, h: 40 } : { x: 10, y: 17, w: 25, h: 25 };
  const right = isHeight ? { x: 42, y: 27, w: 13, h: 25 } : { x: 46, y: 25, w: 16, h: 16 };
  const shape = isHeight ? 'rect' : 'circle';
  const draw = (box, active) => shape === 'rect'
    ? <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="4" fill={active ? ACTIVE : FILL} stroke={STROKE} strokeWidth={SW} />
    : <circle cx={box.x + box.w / 2} cy={box.y + box.h / 2} r={box.w / 2} fill={active ? ACTIVE : FILL} stroke={STROKE} strokeWidth={SW} />;
  return (
    <div className="my-4 flex justify-center" aria-hidden="true" data-visual-cue="comparisonCue" data-concept={conceptId}>
      <div className="h-24 w-24">
        <svg viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {draw(left, leftTarget)}
          {draw(right, !leftTarget)}
        </svg>
      </div>
    </div>
  );
}

function CharacterCue({ conceptId }) {
  const active = (id) => id === conceptId;
  return (
    <div className="my-4 flex justify-center" aria-hidden="true" data-visual-cue="characterCue" data-concept={conceptId}>
      <div className="h-24 w-32">
        <svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <Person x="22" y="34" active={active('i') || active('we')} />
          <Person x="48" y="34" active={active('you-m') || active('you-f')} />
          <Person x="74" y="34" active={active('he') || active('she') || active('they')} />
          {(active('we') || active('they')) && <Person x={active('we') ? '10' : '86'} y="38" scale="0.78" active />}
          {active('i') && <Marker x="22" y="7" />}
          {(active('you-m') || active('you-f')) && <Marker x="48" y="7" />}
          {(active('he') || active('she') || active('they')) && <Marker x="74" y="7" />}
          {active('you-f') || active('she') ? <path d="M 42 12 L 54 12" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" /> : null}
          {active('you-m') || active('he') ? <path d="M 43 8 L 53 16" stroke={STROKE} strokeWidth="2.5" strokeLinecap="round" /> : null}
        </svg>
      </div>
    </div>
  );
}

function HouseIcon({ active = false }) {
  return (
    <g>
      <path d="M 14 34 L 32 18 L 50 34 V 55 H 14 Z" fill={active ? ACTIVE : FILL} stroke={STROKE} strokeWidth={SW} strokeLinejoin="round" />
      <rect x="27" y="40" width="10" height="15" rx="2" fill={STROKE} />
    </g>
  );
}

function FamilyCue({ conceptId }) {
  const active = (id) => id === conceptId;
  return (
    <div className="my-4 flex justify-center" aria-hidden="true" data-visual-cue="familyCue" data-concept={conceptId}>
      <div className="h-24 w-32">
        <svg viewBox="0 0 96 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {active('home') ? <HouseIcon active /> : null}
          {!active('home') && <>
            <Person x="22" y="36" scale={active('child') ? 0.72 : 1} active={active('mom') || active('parent') || active('family') || active('neighbor')} />
            <Person x="48" y="36" scale={active('child') ? 0.72 : 1} active={active('dad') || active('friend') || active('family')} />
            <Person x="74" y="36" scale={active('child') ? 0.72 : 1} active={active('child') || active('stranger') || active('family')} />
            {active('mom') && <Marker x="22" y="7" />}
            {active('dad') && <Marker x="48" y="7" />}
            {active('child') && <Marker x="74" y="7" />}
            {active('parent') && <path d="M 16 8 H 28" stroke={ACTIVE} strokeWidth="5" strokeLinecap="round" />}
            {active('friend') && <path d="M 31 18 C 38 12 42 12 48 18 C 54 12 58 12 65 18" stroke={ACTIVE} strokeWidth="4" strokeLinecap="round" fill="none" />}
            {active('neighbor') && <path d="M 4 56 H 32 M 64 56 H 92" stroke={ACTIVE} strokeWidth="4" strokeLinecap="round" />}
            {active('stranger') && <path d="M 68 7 H 80 M 74 1 V 13" stroke={ACTIVE} strokeWidth="3" strokeLinecap="round" />}
          </>}
        </svg>
      </div>
    </div>
  );
}

export default function VisualCue({ visualCue }) {
  if (!visualCue) return null;
  if (visualCue.type === 'colorCircle') return <ColorCircleCue colorConceptId={visualCue.colorConceptId} />;
  if (visualCue.type === 'countDots') return <CountDotsCue count={visualCue.count} />;
  if (visualCue.type === 'objectGlyph') return <ObjectGlyphCue objectConceptId={visualCue.objectConceptId} />;
  if (visualCue.type === 'dayPart') return <DayPartCue dayPart={visualCue.dayPart} />;
  if (visualCue.type === 'comparisonCue') return <ComparisonCue conceptId={visualCue.conceptId} />;
  if (visualCue.type === 'characterCue') return <CharacterCue conceptId={visualCue.conceptId} />;
  if (visualCue.type === 'familyCue') return <FamilyCue conceptId={visualCue.conceptId} />;
  return null;
}
