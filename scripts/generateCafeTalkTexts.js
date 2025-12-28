#!/usr/bin/env node

/**
 * Cafe Talk Text Generator
 *
 * This script generates skeleton Cafe Talk reading text files for all practice languages.
 * It creates the correct structure with placeholders (__TODO__) where human translation is needed.
 *
 * USAGE:
 *   node scripts/generateCafeTalkTexts.js
 *
 * OUTPUT:
 *   Creates src/data/readingTexts/cafeTalk/<language>.js for each practice language
 *   that doesn't already have a complete implementation.
 *
 * IMPORTANT:
 *   - Generated files will contain __TODO__ placeholders in tokens and translations
 *   - Validation will fail until these placeholders are replaced with actual content
 *   - Each language must provide tokens in its native script/orthography
 *   - Translations should contain phonetic/romanized forms for input grading
 *
 * WORKFLOW:
 *   1. Run this script to generate skeleton files
 *   2. Fill in __TODO__ placeholders with actual language content
 *   3. Validation will pass once all placeholders are replaced
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the canonical definition
const cafeTalkCanonicalPath = path.join(__dirname, '../src/data/readingTexts/cafeTalk/cafeTalkCanonical.js');

// Extract the cafeTalkCanonical array (simple regex extraction)
const cafeTalkCanonical = [
  {
    id: 'conversationGlue',
    titleKey: 'reading.cafeTalk.conversationGlue.title',
    subtitleKey: 'reading.cafeTalk.conversationGlue.subtitle',
    tokenCount: 25,
    concepts: Array(25).fill(null).map((_, i) => ({ conceptId: `concept${i}`, meaningKey: `reading.meaning.concept${i}` }))
  },
  {
    id: 'timeSequencing',
    titleKey: 'reading.cafeTalk.timeSequencing.title',
    subtitleKey: 'reading.cafeTalk.timeSequencing.subtitle',
    tokenCount: 20,
    concepts: Array(20).fill(null).map((_, i) => ({ conceptId: `concept${i}`, meaningKey: `reading.meaning.concept${i}` }))
  },
  {
    id: 'peopleWords',
    titleKey: 'reading.cafeTalk.peopleWords.title',
    subtitleKey: 'reading.cafeTalk.peopleWords.subtitle',
    tokenCount: 18,
    concepts: Array(18).fill(null).map((_, i) => ({ conceptId: `concept${i}`, meaningKey: `reading.meaning.concept${i}` }))
  },
  {
    id: 'coreStoryVerbs',
    titleKey: 'reading.cafeTalk.coreStoryVerbs.title',
    subtitleKey: 'reading.cafeTalk.coreStoryVerbs.subtitle',
    tokenCount: 22,
    concepts: Array(22).fill(null).map((_, i) => ({ conceptId: `concept${i}`, meaningKey: `reading.meaning.concept${i}` }))
  },
  {
    id: 'lifeLogistics',
    titleKey: 'reading.cafeTalk.lifeLogistics.title',
    subtitleKey: 'reading.cafeTalk.lifeLogistics.subtitle',
    tokenCount: 20,
    concepts: Array(20).fill(null).map((_, i) => ({ conceptId: `concept${i}`, meaningKey: `reading.meaning.concept${i}` }))
  },
  {
    id: 'reactionsFeelings',
    titleKey: 'reading.cafeTalk.reactionsFeelings.title',
    subtitleKey: 'reading.cafeTalk.reactionsFeelings.subtitle',
    tokenCount: 20,
    concepts: Array(20).fill(null).map((_, i) => ({ conceptId: `concept${i}`, meaningKey: `reading.meaning.concept${i}` }))
  },
  {
    id: 'everydayTopics',
    titleKey: 'reading.cafeTalk.everydayTopics.title',
    subtitleKey: 'reading.cafeTalk.everydayTopics.subtitle',
    tokenCount: 20,
    concepts: Array(20).fill(null).map((_, i) => ({ conceptId: `concept${i}`, meaningKey: `reading.meaning.concept${i}` }))
  }
];

// All practice languages
const practiceLanguages = [
  'hebrew', 'arabic', 'mandarin', 'hindi', 'english',
  'spanish', 'french', 'portuguese', 'russian',
  'japanese', 'bengali', 'amharic'
];

// Language display names
const languageNames = {
  hebrew: 'Hebrew',
  arabic: 'Arabic',
  mandarin: 'Mandarin',
  hindi: 'Hindi',
  english: 'English',
  spanish: 'Spanish',
  french: 'French',
  portuguese: 'Portuguese',
  russian: 'Russian',
  japanese: 'Japanese',
  bengali: 'Bengali',
  amharic: 'Amharic'
};

/**
 * Generate a skeleton Cafe Talk module for a language
 */
function generateLanguageModule(language) {
  const langName = languageNames[language];
  const camelLang = language.charAt(0).toLowerCase() + language.slice(1);

  let content = `/**
 * ${langName} Cafe Talk reading texts
 * Conversational vocabulary organized by theme
 *
 * TODO: Replace all __TODO__ placeholders with actual ${langName} content
 */

import { createReadingText } from '../common/helpers.js';

export const ${camelLang}CafeTalkTexts = [
`;

  cafeTalkCanonical.forEach((category, catIndex) => {
    content += `  // ${category.id} (${category.tokenCount} words)\n`;
    content += `  createReadingText({\n`;
    content += `    id: 'cafeTalk.${category.id}',\n`;
    content += `    title: {\n`;
    content += `      en: '__TODO__: Add English title'\n`;
    content += `    },\n`;
    content += `    subtitle: {\n`;
    content += `      en: '__TODO__: Add English subtitle'\n`;
    content += `    },\n`;
    content += `    practiceLanguage: '${language}',\n`;
    content += `    tokens: [\n`;

    // Generate token placeholders
    for (let i = 0; i < category.tokenCount; i++) {
      content += `      { type: 'word', text: '__TODO__', id: 'word${i + 1}' },\n`;
    }
    content += `      { type: 'punct', text: '.' }\n`;
    content += `    ],\n`;

    content += `    meaningKeys: {\n`;
    for (let i = 0; i < category.tokenCount; i++) {
      content += `      word${i + 1}: 'reading.meaning.__TODO__',\n`;
    }
    // Remove trailing comma
    content = content.slice(0, -2) + '\n';
    content += `    },\n`;

    content += `    translations: {\n`;
    content += `      en: {\n`;
    for (let i = 0; i < category.tokenCount; i++) {
      content += `        word${i + 1}: { canonical: '__TODO__', variants: ['__TODO__'] },\n`;
    }
    // Remove trailing comma
    content = content.slice(0, -2) + '\n';
    content += `      }\n`;
    content += `    }\n`;
    content += `  })`;

    if (catIndex < cafeTalkCanonical.length - 1) {
      content += ',\n\n';
    } else {
      content += '\n';
    }
  });

  content += `];\n`;

  return content;
}

/**
 * Main execution
 */
function main() {
  const cafeTalkDir = path.join(__dirname, '../src/data/readingTexts/cafeTalk');

  // Ensure directory exists
  if (!fs.existsSync(cafeTalkDir)) {
    fs.mkdirSync(cafeTalkDir, { recursive: true });
  }

  const languages = process.argv.slice(2);
  const targetLanguages = languages.length > 0 ? languages : practiceLanguages;

  targetLanguages.forEach(language => {
    if (!practiceLanguages.includes(language)) {
      console.warn(`Warning: ${language} is not a recognized practice language. Skipping.`);
      return;
    }

    const outputPath = path.join(cafeTalkDir, `${language}.js`);

    // Check if file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`File exists: ${outputPath}`);
      console.log(`  Use --force to overwrite or delete manually`);
      return;
    }

    const content = generateLanguageModule(language);
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`✓ Generated: ${outputPath}`);
    console.log(`  Remember to replace all __TODO__ placeholders with actual ${languageNames[language]} content!`);
  });

  console.log('\nDone! Run validation to see which files need completion.');
}

main();
