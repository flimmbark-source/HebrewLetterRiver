import { describe, expect, it } from 'vitest';
import { tokenizeHebrewSentence } from './sentenceTokenizer.ts';

describe('tokenizeHebrewSentence', () => {
  it('splits basic words with correct spans', () => {
    const text = 'שלום אני פה';
    const spans = tokenizeHebrewSentence(text);

    expect(spans).toEqual([
      { hebrew: 'שלום', start: 0, end: 3, surface: 'שלום' },
      { hebrew: 'אני', start: 5, end: 7, surface: 'אני' },
      { hebrew: 'פה', start: 9, end: 10, surface: 'פה' }
    ]);
  });

  it('ignores punctuation while keeping offsets correct', () => {
    const text = 'שלום, אני כאן.';
    const spans = tokenizeHebrewSentence(text);

    expect(spans).toEqual([
      { hebrew: 'שלום', start: 0, end: 3, surface: 'שלום' },
      { hebrew: 'אני', start: 6, end: 8, surface: 'אני' },
      { hebrew: 'כאן', start: 10, end: 12, surface: 'כאן' }
    ]);
  });

  it('handles mixed punctuation and spacing', () => {
    const text = 'בוקר טוב! אתם באים?';
    const spans = tokenizeHebrewSentence(text);

    expect(spans).toEqual([
      { hebrew: 'בוקר', start: 0, end: 3, surface: 'בוקר' },
      { hebrew: 'טוב', start: 5, end: 7, surface: 'טוב' },
      { hebrew: 'אתם', start: 10, end: 12, surface: 'אתם' },
      { hebrew: 'באים', start: 14, end: 17, surface: 'באים' }
    ]);
  });
});
