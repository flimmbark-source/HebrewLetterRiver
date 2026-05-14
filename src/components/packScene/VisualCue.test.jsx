import React, { act } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import VisualCue from './VisualCue.jsx';

describe('VisualCue', () => {
  let container;
  let root;

  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
    document.body.innerHTML = '';
  });

  function render(element) {
    act(() => {
      root.render(element);
    });
  }

  it('returns nothing when visualCue is missing', () => {
    render(<VisualCue visualCue={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns nothing for an unsupported cue type', () => {
    render(<VisualCue visualCue={{ type: 'mystery' }} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a colorCircle swatch element', () => {
    render(<VisualCue visualCue={{ type: 'colorCircle', colorConceptId: 'red' }} />);
    const outer = container.firstChild;
    expect(outer).not.toBeNull();
    expect(outer.getAttribute('aria-hidden')).toBe('true');
    const swatch = outer.firstChild;
    expect(swatch).not.toBeNull();
    // jsdom does not preserve unknown CSS values reliably; assert by
    // class instead. Visual fidelity is verified manually in the app.
    expect(swatch.className).toMatch(/rounded-full/);
  });

  it('renders countDots with N dots for count N', () => {
    render(<VisualCue visualCue={{ type: 'countDots', count: 3, conceptId: 'three' }} />);
    const dots = container.querySelectorAll('[data-testid="count-dot"]');
    expect(dots.length).toBe(3);
  });

  it('renders countDots with no dots for non-positive count', () => {
    render(<VisualCue visualCue={{ type: 'countDots', count: 0, conceptId: 'one' }} />);
    expect(container.firstChild).toBeNull();
  });

  it('countDots renders nothing language-specific (no digits or words)', () => {
    render(<VisualCue visualCue={{ type: 'countDots', count: 4, conceptId: 'four' }} />);
    const text = container.textContent || '';
    // The cue must not leak the answer in any language. No digits, no
    // number words, no Hebrew. Just dots.
    expect(text.trim()).toBe('');
  });

  it('renders an objectGlyph wrapper with data-visual-cue="objectGlyph"', () => {
    render(<VisualCue visualCue={{ type: 'objectGlyph', objectConceptId: 'book' }} />);
    const el = container.querySelector('[data-visual-cue="objectGlyph"]');
    expect(el).not.toBeNull();
  });

  it('objectGlyph carries data-object-concept matching the objectConceptId', () => {
    for (const id of ['book', 'phone', 'table', 'door', 'thing']) {
      render(<VisualCue visualCue={{ type: 'objectGlyph', objectConceptId: id }} />);
      const el = container.querySelector('[data-visual-cue="objectGlyph"]');
      expect(el.getAttribute('data-object-concept')).toBe(id);
    }
  });

  it('objectGlyph renders an SVG element', () => {
    render(<VisualCue visualCue={{ type: 'objectGlyph', objectConceptId: 'phone' }} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('objectGlyph renders no text content (no language leakage)', () => {
    for (const id of ['book', 'phone', 'table', 'door', 'thing']) {
      render(<VisualCue visualCue={{ type: 'objectGlyph', objectConceptId: id }} />);
      expect((container.textContent || '').trim()).toBe('');
    }
  });

  it('objectGlyph falls back to the thing glyph for an unregistered concept', () => {
    render(<VisualCue visualCue={{ type: 'objectGlyph', objectConceptId: 'banana' }} />);
    const el = container.querySelector('[data-visual-cue="objectGlyph"]');
    expect(el).not.toBeNull();
    // data-object-concept still carries the original id for debugging
    expect(el.getAttribute('data-object-concept')).toBe('banana');
    // An SVG is still rendered (the thing fallback)
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
