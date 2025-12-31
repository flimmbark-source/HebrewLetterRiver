/**
 * Analyze Hebrew Words and Group by Vowel Layout
 *
 * This script analyzes all Hebrew words in the Cafe Talk lexicon
 * and groups them by vowel layout to help create a test card.
 */

import { cafeTalkTransliterations } from '../src/data/readingTexts/cafeTalk/lexicon/hebrew.js';
import {
  deriveLayoutFromTransliteration,
  groupWordsByLayout
} from '../src/lib/vowelLayoutDerivation.js';

// Convert transliterations to word objects
const words = Object.entries(cafeTalkTransliterations).map(([id, transliteration]) => ({
  id,
  transliteration
}));

// Group by layout
const layoutGroups = groupWordsByLayout(words);

// Sort groups by word count (descending)
const sortedGroups = Object.entries(layoutGroups).sort((a, b) => {
  return b[1].words.length - a[1].words.length;
});

console.log('='.repeat(80));
console.log('HEBREW VOWEL LAYOUT ANALYSIS');
console.log('='.repeat(80));
console.log(`Total words analyzed: ${words.length}`);
console.log(`Unique layouts found: ${sortedGroups.length}`);
console.log('='.repeat(80));
console.log('');

// Show top layouts
console.log('TOP 10 MOST COMMON LAYOUTS:');
console.log('-'.repeat(80));

sortedGroups.slice(0, 10).forEach(([layoutId, group], idx) => {
  const { layoutInfo, words } = group;
  const { beatCount, vowelTokens } = layoutInfo;

  console.log(`\n${idx + 1}. ${layoutId}`);
  console.log(`   Beats: ${beatCount} | Vowels: ${vowelTokens.join('-')}`);
  console.log(`   Word count: ${words.length}`);
  console.log(`   Words: ${words.map(w => w.id).join(', ')}`);
  console.log(`   Examples: ${words.slice(0, 3).map(w => w.transliteration).join(', ')}`);
});

console.log('\n' + '='.repeat(80));
console.log('RECOMMENDED TEST CARD LAYOUTS:');
console.log('='.repeat(80));

// Find 2-3 layouts with good repetition (>=4 words each)
const goodLayouts = sortedGroups.filter(([_, group]) => group.words.length >= 4);

if (goodLayouts.length >= 2) {
  console.log('\nSuggested layouts for test card (2-3 layouts, balanced):');

  // Pick top 3
  const selected = goodLayouts.slice(0, 3);
  let totalWords = 0;

  selected.forEach(([layoutId, group], idx) => {
    const { layoutInfo, words } = group;
    console.log(`\nLayout ${idx + 1}: ${layoutId}`);
    console.log(`  Vowel sequence: ${layoutInfo.vowelTokens.join(' → ')}`);
    console.log(`  Available words: ${words.length}`);
    console.log(`  Suggested for card: ${Math.min(6, words.length)} words`);
    console.log(`  Words: ${words.map(w => w.id).slice(0, 6).join(', ')}`);

    totalWords += Math.min(6, words.length);
  });

  console.log(`\nTotal words in test card: ${totalWords}`);
}

console.log('\n' + '='.repeat(80));
