import type { SentenceWord } from '../types/sentences.ts';

/**
 * Tokenize a Hebrew sentence into tappable word spans.
 * Splits on whitespace and punctuation while preserving character offsets.
 */
export function tokenizeHebrewSentence(text: string): SentenceWord[] {
  const spans: SentenceWord[] = [];
  const wordPattern = /[\p{L}\p{M}\u05BE]+/gu; // Letters, marks, and Hebrew maqaf
  let match: RegExpExecArray | null;

  while ((match = wordPattern.exec(text)) !== null) {
    const hebrew = match[0];
    const start = match.index;
    const end = start + hebrew.length - 1;

    spans.push({
      hebrew,
      start,
      end,
      surface: hebrew
    });
  }

  return spans;
}
