// Renders abstract visual cues that ground answer correctness in
// Pack Scenes. The cue itself is the correctness source for grounded
// identification scenes — it must not render the answer in any language
// (no digits, no number words, no spelled-out colors).

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

export default function VisualCue({ visualCue }) {
  if (!visualCue) return null;
  if (visualCue.type === 'colorCircle') {
    return <ColorCircleCue colorConceptId={visualCue.colorConceptId} />;
  }
  if (visualCue.type === 'countDots') {
    return <CountDotsCue count={visualCue.count} />;
  }
  return null;
}
