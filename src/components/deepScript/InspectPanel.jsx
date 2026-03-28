import React from 'react';

/**
 * InspectPanel — overlay shown when the player inspects an in-world object.
 * Shows flavor text, loot options, or descriptions.
 */
export default function InspectPanel({ interactable, onClose }) {
  if (!interactable) return null;

  const isLoot = interactable.isLoot;

  return (
    <div className="ds-inspect-overlay" onClick={onClose}>
      <div className="ds-inspect-panel" onClick={e => e.stopPropagation()}>
        <div className="ds-inspect-icon">
          {getInspectIcon(interactable.type)}
        </div>
        <h3 className="ds-inspect-title">{interactable.label}</h3>
        <p className="ds-inspect-text">
          {interactable.flavorText || getDefaultText(interactable)}
        </p>
        <button
          type="button"
          className="ds-inspect-close"
          onClick={onClose}
        >
          {isLoot ? 'Take' : 'Close'}
        </button>
      </div>
    </div>
  );
}

function getInspectIcon(type) {
  switch (type) {
    case 'sigil': return '🔮';
    case 'bookshelf': return '📚';
    case 'scroll-stand': return '📜';
    case 'mural': return '🖼️';
    case 'altar': return '⛩️';
    case 'brazier': return '🔥';
    case 'statue': return '🗿';
    case 'chest': return '📦';
    case 'cracked-wall': return '🪨';
    case 'note-tablet': return '📋';
    default: return '❓';
  }
}

function getDefaultText(interactable) {
  switch (interactable.type) {
    case 'chest':
      return 'A dusty chest sits against the wall. Something glints inside. You recover a small healing draught.';
    case 'bookshelf':
      return 'Rows of ancient texts, their spines cracked with age. One volume seems to pulse with faint light.';
    case 'scroll-stand':
      return 'A scroll unfurled on a bronze stand. The ink still shimmers as if freshly written.';
    case 'mural':
      return 'A wall painting depicting ancient root patterns branching like a great tree.';
    case 'altar':
      return 'An altar of polished obsidian. Runes carved along its edge glow softly, awaiting an offering of attention.';
    case 'sigil':
      return 'A sigil burns in the air before you — a word-creature awaits.';
    default:
      return 'You examine the object closely.';
  }
}
