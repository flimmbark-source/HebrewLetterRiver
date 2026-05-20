import { describe, expect, it } from 'vitest';
import { matchesPattern, getCanonicalFromPattern } from './patternMatcher.js';

describe('patternMatcher', () => {
  it('matches simple alternatives', () => {
    const pattern = "{Hi, Hello}, {I'm, I am} Dani.";

    expect(matchesPattern("Hi, I'm Dani.", pattern)).toBe(true);
    expect(matchesPattern('Hello, I am Dani.', pattern)).toBe(true);
    expect(matchesPattern('Hi, I am Dani.', pattern)).toBe(true);
    expect(matchesPattern("Hello, I'm Dani.", pattern)).toBe(true);
    expect(matchesPattern("Hey, I'm Dani.", pattern)).toBe(false);
  });

  it('matches longer sentence alternatives', () => {
    const pattern = "{Hi, Hello}, {I'm, I am} Dani, {nice to meet you, nice meeting you, it's nice to meet you}.";

    expect(matchesPattern("Hi, I'm Dani, nice to meet you.", pattern)).toBe(true);
    expect(matchesPattern('Hello, I am Dani, nice meeting you.', pattern)).toBe(true);
    expect(matchesPattern("Hi, I'm Dani, it's nice to meet you.", pattern)).toBe(true);
    expect(matchesPattern('Hello, I am Dani, nice to meet you.', pattern)).toBe(true);
  });

  it('is case-insensitive', () => {
    const pattern = '{Hi, Hello} there';

    expect(matchesPattern('hi there', pattern)).toBe(true);
    expect(matchesPattern('HELLO THERE', pattern)).toBe(true);
    expect(matchesPattern('Hi There', pattern)).toBe(true);
  });

  it('allows extra whitespace and optional punctuation', () => {
    const pattern = "{Hi, Hello}, {I'm, I am} Dani.";

    expect(matchesPattern("Hi,  I'm   Dani.", pattern)).toBe(true);
    expect(matchesPattern("Hi, I'm Dani", pattern)).toBe(true);
    expect(matchesPattern("Hi I'm Dani", pattern)).toBe(true);
    expect(matchesPattern('Hi Im Dani', pattern)).toBe(true);
  });

  it('extracts a clean canonical sentence', () => {
    expect(getCanonicalFromPattern("{Hi, Hello}, {I'm, I am} Dani.")).toBe("Hi, I'm Dani.");
    expect(getCanonicalFromPattern("{Hi, Hello}, {I'm, I am} Dani, {nice to meet you, nice meeting you, it's nice to meet you}.")).toBe("Hi, I'm Dani, nice to meet you.");
  });

  it('matches question and follow-up alternatives', () => {
    const pattern = "{Where are you from, Where do you come from}? {I am, I'm} new in the city.";

    expect(matchesPattern('Where are you from? I am new in the city.', pattern)).toBe(true);
    expect(matchesPattern("Where do you come from? I'm new in the city.", pattern)).toBe(true);
  });

  it('matches user input with missing punctuation', () => {
    const pattern = "{Hi, Hello}, {I'm, I am} Dani, {nice to meet you, nice meeting you, it's nice to meet you}.";

    expect(matchesPattern("hello I'm Dani, nice to meet you", pattern)).toBe(true);
    expect(matchesPattern('hello Im Dani nice to meet you', pattern)).toBe(true);
  });
});
