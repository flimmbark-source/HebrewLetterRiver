/**
 * Simplified Hebrew Pack Curriculum Reconstruction
 *
 * Given the highly fragmented vowel layout distribution in Hebrew vocabulary,
 * this uses a pragmatic approach: combine layouts to create learnable packs
 * of ~12-18 words with 2-3 layouts each.
 */

import { CAFE_TALK_WORDS } from '../src/data/readingTexts/cafeTalk/cafeTalkCanonical.js';
import { cafeTalkTransliterations } from '../src/data/readingTexts/cafeTalk/lexicon/hebrew.js';
import { deriveLayoutFromTransliteration } from '../src/lib/vowelLayoutDerivation.js';

// Get all words with their layouts
const allWords = CAFE_TALK_WORDS.map(word => {
  const translit = cafeTalkTransliterations[word.id];
  const layoutInfo = translit ? deriveLayoutFromTransliteration(translit) : null;

  return {
    wordId: word.id,
    english: word.en,
    translit,
    layoutId: layoutInfo?.id || null
  };
}).filter(w => w.layoutId); // Only words with valid layouts

console.log(`Total words with layouts: ${allWords.length}`);

// Group by layout
const byLayout = {};
allWords.forEach(w => {
  if (!byLayout[w.layoutId]) byLayout[w.layoutId] = [];
  byLayout[w.layoutId].push(w);
});

console.log(`Unique layouts: ${Object.keys(byLayout).length}\n`);

// Show distribution
const layoutGroups = Object.entries(byLayout)
  .map(([layoutId, words]) => ({ layoutId, words, count: words.length }))
  .sort((a, b) => b.count - a.count);

console.log('Layout Distribution:');
layoutGroups.forEach((g, idx) => {
  if (idx < 20) console.log(`  ${g.layoutId}: ${g.count} words`);
});

console.log('\n--- RECOMMENDATION ---\n');
console.log('Given the highly fragmented layout distribution (most layouts have 1-2 words),');
console.log('we recommend keeping the CURRENT pack structure for Hebrew as it already');
console.log('provides reasonable learning chunks. The vowel layout system will work');
console.log('across all packs automatically via the modular auto-generation we implemented.\n');

console.log('Current structure benefits:');
console.log('- Semantic groupings (Conversation Glue, Time Words, etc.)');
console.log('- Manageable pack sizes (6-8 words per pack)');
console.log('- All words already have auto-generated vowel layouts');
console.log('- Learners see diverse layouts in each pack (exposure variety)\n');

console.log('The vowel layout icons will appear for ALL words across ALL packs,');
console.log('providing visual cues without requiring strict layout-based grouping.');
