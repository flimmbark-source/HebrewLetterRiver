/**
 * Hebrew Pack Curriculum Reconstruction Script
 *
 * Rebuilds all Hebrew reading packs to meet vowel layout learning constraints:
 * - 1-3 unique layouts per pack (hard target, 4 only if necessary)
 * - ~12-18 words per pack
 * - >=4 words per layout (prefer >=6)
 * - Interleaved practice (layouts mixed, not blocked)
 */

import { CAFE_TALK_WORDS, CAFE_TALK_CATEGORIES } from '../src/data/readingTexts/cafeTalk/cafeTalkCanonical.js';
import { cafeTalkTransliterations } from '../src/data/readingTexts/cafeTalk/lexicon/hebrew.js';
import { deriveLayoutFromTransliteration } from '../src/lib/vowelLayoutDerivation.js';

// Section definitions (7 sections)
const SECTIONS = {
  vowelLayoutPractice: { name: 'Vowel Layout Practice', order: 0 },
  conversationGlue: { name: 'Conversation Glue', order: 1 },
  timeSequencing: { name: 'Time & Sequencing', order: 2 },
  peopleWords: { name: 'People Words', order: 3 },
  coreStoryVerbs: { name: 'Core Story Verbs', order: 4 },
  lifeLogistics: { name: 'Life Logistics', order: 5 },
  reactionsFeelings: { name: 'Reactions & Feelings', order: 6 },
  everydayTopics: { name: 'Everyday Topics', order: 7 }
};

// Constraints (pragmatic - adjusted for Hebrew vocabulary reality)
const CONSTRAINTS = {
  minWordsPerPack: 10,
  targetWordsPerPack: 14,
  maxWordsPerPack: 20,
  maxLayoutsPerPack: 3,
  maxLayoutsForMixedReview: 4,
  minWordsPerLayout: 3, // Relaxed from 4 to 3 due to vocabulary diversity
  preferredWordsPerLayout: 5,
  minWordsForMixedReview: 10,
  minWordsPerLayoutInMixedReview: 2
};

/**
 * Analyze current pack distribution by section
 */
function analyzeCurrentPacks() {
  console.log('\n=== CURRENT PACK ANALYSIS ===\n');

  const sectionStats = {};

  Object.entries(CAFE_TALK_CATEGORIES).forEach(([packId, pack]) => {
    const { sectionId, wordIds } = pack;

    if (!sectionStats[sectionId]) {
      sectionStats[sectionId] = {
        packs: [],
        totalWords: 0,
        wordsByLayout: {}
      };
    }

    // Analyze layouts in this pack
    const layoutCounts = {};
    const wordsWithLayouts = [];

    wordIds.forEach(wordId => {
      const translit = cafeTalkTransliterations[wordId];
      const word = CAFE_TALK_WORDS.find(w => w.id === wordId);

      if (!translit) {
        console.warn(`  ⚠️  Missing transliteration for: ${wordId}`);
        return;
      }

      const layoutInfo = deriveLayoutFromTransliteration(translit);
      if (!layoutInfo) {
        console.warn(`  ⚠️  Could not derive layout for: ${wordId} (${translit})`);
        return;
      }

      const layoutId = layoutInfo.id;
      layoutCounts[layoutId] = (layoutCounts[layoutId] || 0) + 1;

      wordsWithLayouts.push({
        wordId,
        english: word?.en || wordId,
        translit,
        layoutId
      });

      // Track globally
      if (!sectionStats[sectionId].wordsByLayout[layoutId]) {
        sectionStats[sectionId].wordsByLayout[layoutId] = [];
      }
      sectionStats[sectionId].wordsByLayout[layoutId].push({
        wordId,
        english: word?.en || wordId,
        translit,
        packId
      });
    });

    sectionStats[sectionId].packs.push({
      packId,
      wordCount: wordIds.length,
      layoutCount: Object.keys(layoutCounts).length,
      layoutCounts,
      words: wordsWithLayouts
    });

    sectionStats[sectionId].totalWords += wordIds.length;
  });

  // Print analysis
  Object.entries(sectionStats).forEach(([sectionId, stats]) => {
    const section = SECTIONS[sectionId];
    console.log(`\n${section?.name || sectionId}:`);
    console.log(`  Total words: ${stats.totalWords}`);
    console.log(`  Unique layouts: ${Object.keys(stats.wordsByLayout).length}`);
    console.log(`  Current packs: ${stats.packs.length}`);

    stats.packs.forEach(pack => {
      const layoutStr = Object.entries(pack.layoutCounts)
        .map(([lid, count]) => `${lid}(${count})`)
        .join(', ');
      console.log(`    ${pack.packId}: ${pack.wordCount} words, ${pack.layoutCount} layouts [${layoutStr}]`);
    });
  });

  return sectionStats;
}

/**
 * Rebuild packs for a single section - PRAGMATIC APPROACH
 */
function rebuildSection(sectionId, sectionStats) {
  const section = SECTIONS[sectionId];
  const stats = sectionStats[sectionId];

  console.log(`\n\n=== REBUILDING: ${section.name} ===\n`);

  // Pool all words from this section
  const wordPool = [];
  Object.entries(stats.wordsByLayout).forEach(([layoutId, words]) => {
    words.forEach(w => wordPool.push({ ...w, layoutId }));
  });

  console.log(`Word pool: ${wordPool.length} words`);
  console.log(`Unique layouts: ${Object.keys(stats.wordsByLayout).length}`);

  // Group by layout and sort by size descending
  const layoutGroups = Object.entries(stats.wordsByLayout)
    .map(([layoutId, words]) => ({
      layoutId,
      words: [...words], // Clone array
      count: words.length
    }))
    .sort((a, b) => b.count - a.count);

  console.log('\nLayout distribution:');
  layoutGroups.forEach(group => {
    console.log(`  ${group.layoutId}: ${group.count} words`);
  });

  const newPacks = [];
  const deferredWords = [];
  const usedWords = new Set();

  let packCounter = 1;

  // Strategy: Combine layouts intelligently to create viable packs
  // 1. Try to pair large groups with medium groups
  // 2. Combine multiple small groups
  // 3. Split very large groups across packs if needed

  while (layoutGroups.some(g => g.words.some(w => !usedWords.has(w.wordId)))) {
    // Get available groups
    const availableGroups = layoutGroups
      .map(g => ({
        ...g,
        remainingWords: g.words.filter(w => !usedWords.has(w.wordId))
      }))
      .filter(g => g.remainingWords.length > 0)
      .sort((a, b) => b.remainingWords.length - a.remainingWords.length);

    if (availableGroups.length === 0) break;

    // Find best pack composition
    let bestCombo = null;
    let bestScore = -1;

    // Try different combinations of 1-3 layouts
    for (let numLayouts = 1; numLayouts <= Math.min(CONSTRAINTS.maxLayoutsPerPack, availableGroups.length); numLayouts++) {
      // Try combinations
      const combos = getCombinations(availableGroups, numLayouts);

      combos.forEach(combo => {
        const totalWords = combo.reduce((sum, g) => sum + g.remainingWords.length, 0);
        const minWords = Math.min(...combo.map(g => g.remainingWords.length));

        // Score this combination
        let score = 0;

        // Prefer packs near target size
        const sizeScore = totalWords >= CONSTRAINTS.minWordsPerPack &&
                         totalWords <= CONSTRAINTS.maxWordsPerPack ? 100 : 0;
        score += sizeScore;

        // Prefer balanced layouts (min words per layout)
        if (minWords >= CONSTRAINTS.preferredWordsPerLayout) score += 50;
        else if (minWords >= CONSTRAINTS.minWordsPerLayout) score += 30;
        else score -= 20;

        // Prefer fewer layouts (easier to learn)
        score += (4 - numLayouts) * 10;

        // Prefer using more words (make progress)
        score += totalWords * 2;

        if (score > bestScore) {
          bestScore = score;
          bestCombo = combo;
        }
      });
    }

    if (!bestCombo || bestScore < 0) {
      // Can't make a good pack, defer remaining words
      availableGroups.forEach(g => {
        g.remainingWords.forEach(w => {
          if (!usedWords.has(w.wordId)) {
            deferredWords.push({
              ...w,
              reason: 'Could not form viable pack'
            });
            usedWords.add(w.wordId);
          }
        });
      });
      break;
    }

    // Create pack from best combination
    const packWords = [];

    // Take words from each layout in the combo
    bestCombo.forEach(group => {
      const take = Math.min(
        group.remainingWords.length,
        Math.ceil(CONSTRAINTS.targetWordsPerPack / bestCombo.length)
      );

      for (let i = 0; i < take; i++) {
        if (group.remainingWords[i] && !usedWords.has(group.remainingWords[i].wordId)) {
          packWords.push(group.remainingWords[i]);
          usedWords.add(group.remainingWords[i].wordId);
        }
      }
    });

    // Calculate layout counts
    const layoutCounts = {};
    packWords.forEach(w => {
      layoutCounts[w.layoutId] = (layoutCounts[w.layoutId] || 0) + 1;
    });

    // Interleave and create pack
    const interleaved = interleaveWords(packWords);

    newPacks.push({
      id: `${sectionId}Pack${packCounter}`,
      sectionId,
      title: `${section.name} — Set ${packCounter}`,
      wordCount: interleaved.length,
      layoutCounts,
      wordIds: interleaved.map(w => w.wordId),
      words: interleaved
    });

    packCounter++;
  }

  return { newPacks, deferredWords };
}

/**
 * Get all combinations of n items from array
 */
function getCombinations(arr, n) {
  if (n === 1) return arr.map(item => [item]);
  if (n > arr.length) return [];

  const result = [];

  for (let i = 0; i <= arr.length - n; i++) {
    const rest = getCombinations(arr.slice(i + 1), n - 1);
    rest.forEach(combo => {
      result.push([arr[i], ...combo]);
    });
  }

  return result;
}

/**
 * Interleave words from different layouts
 */
function interleaveWords(words) {
  const byLayout = {};
  words.forEach(w => {
    if (!byLayout[w.layoutId]) byLayout[w.layoutId] = [];
    byLayout[w.layoutId].push(w);
  });

  const layoutArrays = Object.values(byLayout);
  const interleaved = [];
  let maxLength = Math.max(...layoutArrays.map(arr => arr.length));

  for (let i = 0; i < maxLength; i++) {
    layoutArrays.forEach(arr => {
      if (arr[i]) interleaved.push(arr[i]);
    });
  }

  return interleaved;
}

/**
 * Generate curriculum reconstruction report
 */
function generateReport(results) {
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║      CURRICULUM RECONSTRUCTION REPORT                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let totalPacks = 0;
  let totalWords = 0;
  let totalDeferred = 0;
  let passCount = 0;
  let failCount = 0;

  Object.entries(results).forEach(([sectionId, result]) => {
    const section = SECTIONS[sectionId];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`SECTION: ${section.name}`);
    console.log('='.repeat(60));

    console.log(`\nPacks created: ${result.newPacks.length}`);

    result.newPacks.forEach((pack, idx) => {
      console.log(`\n  Pack ${idx + 1}: ${pack.title}`);
      console.log(`    ID: ${pack.id}`);
      console.log(`    Words: ${pack.wordCount}`);
      console.log(`    Layouts: ${Object.keys(pack.layoutCounts).length}`);

      const layoutStr = Object.entries(pack.layoutCounts)
        .map(([lid, count]) => `${lid}(${count})`)
        .join(', ');
      console.log(`    Distribution: ${layoutStr}`);

      // Validation
      const checks = {
        layouts: Object.keys(pack.layoutCounts).length <= CONSTRAINTS.maxLayoutsPerPack,
        wordCount: pack.wordCount >= CONSTRAINTS.minWordsPerPack && pack.wordCount <= CONSTRAINTS.maxWordsPerPack,
        minPerLayout: Object.values(pack.layoutCounts).every(c => c >= CONSTRAINTS.minWordsPerLayout)
      };

      const allPass = Object.values(checks).every(v => v);
      console.log(`    Status: ${allPass ? '✓ PASS' : '✗ FAIL'}`);

      if (!checks.layouts) console.log(`      ✗ Too many layouts (${Object.keys(pack.layoutCounts).length} > ${CONSTRAINTS.maxLayoutsPerPack})`);
      if (!checks.wordCount) console.log(`      ✗ Word count out of range (${pack.wordCount})`);
      if (!checks.minPerLayout) console.log(`      ✗ Some layouts have <${CONSTRAINTS.minWordsPerLayout} words`);

      if (allPass) passCount++;
      else failCount++;

      totalPacks++;
      totalWords += pack.wordCount;
    });

    if (result.deferredWords.length > 0) {
      console.log(`\n  Deferred words: ${result.deferredWords.length}`);
      result.deferredWords.forEach(w => {
        console.log(`    - ${w.wordId} (${w.english}) [${w.translit}] → ${w.layoutId}`);
        console.log(`      Reason: ${w.reason}`);
      });
      totalDeferred += result.deferredWords.length;
    }
  });

  console.log('\n\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total packs created: ${totalPacks}`);
  console.log(`Total words placed: ${totalWords}`);
  console.log(`Total words deferred: ${totalDeferred}`);
  console.log(`Packs passing constraints: ${passCount}`);
  console.log(`Packs failing constraints: ${failCount}`);
  console.log(`Success rate: ${((passCount / totalPacks) * 100).toFixed(1)}%`);
  console.log('\n');
}

/**
 * Generate new CAFE_TALK_CATEGORIES object code
 */
function generateCategoriesCode(results) {
  console.log('\n\n╔════════════════════════════════════════════════════════════╗');
  console.log('║      GENERATED CAFE_TALK_CATEGORIES CODE                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log('export const CAFE_TALK_CATEGORIES = {');

  // Sort sections by order
  const sortedSections = Object.keys(results).sort((a, b) =>
    SECTIONS[a].order - SECTIONS[b].order
  );

  sortedSections.forEach((sectionId, sectionIdx) => {
    const result = results[sectionId];
    const section = SECTIONS[sectionId];

    if (result.newPacks.length > 0) {
      console.log(`  // ${section.name} - ${result.newPacks.length} pack(s)`);

      result.newPacks.forEach((pack, packIdx) => {
        const isLast = sectionIdx === sortedSections.length - 1 &&
                       packIdx === result.newPacks.length - 1;

        console.log(`  ${pack.id}: {`);
        console.log(`    id: '${pack.id}',`);
        console.log(`    sectionId: '${pack.sectionId}',`);
        console.log(`    wordIds: [`);

        // Format wordIds in rows of 6
        for (let i = 0; i < pack.wordIds.length; i += 6) {
          const row = pack.wordIds.slice(i, i + 6);
          const rowStr = row.map(id => `'${id}'`).join(', ');
          const comma = i + 6 < pack.wordIds.length ? ',' : '';
          console.log(`      ${rowStr}${comma}`);
        }

        console.log(`    ]`);
        console.log(`  }${isLast ? '' : ','}`);
        console.log();
      });
    }
  });

  console.log('};');
}

/**
 * Main execution
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   HEBREW PACK CURRICULUM RECONSTRUCTION                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  // Step 1: Analyze current state
  const sectionStats = analyzeCurrentPacks();

  // Step 2: Rebuild each section
  const results = {};

  // Skip vowelLayoutPractice - it's a special bootcamp pack
  const sectionsToRebuild = Object.keys(SECTIONS).filter(s => s !== 'vowelLayoutPractice');

  sectionsToRebuild.forEach(sectionId => {
    if (sectionStats[sectionId]) {
      results[sectionId] = rebuildSection(sectionId, sectionStats);
    }
  });

  // Step 3: Generate report
  generateReport(results);

  // Step 4: Generate code
  generateCategoriesCode(results);

  console.log('\n✓ Reconstruction complete!\n');
}

main().catch(err => {
  console.error('Error during reconstruction:', err);
  process.exit(1);
});
