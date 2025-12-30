#!/usr/bin/env node

/**
 * Generate transliterations for all Cafe Talk lexicons
 * Converts non-Latin scripts to romanized versions
 */

import { transliterate } from 'transliteration';
import pinyinLib from 'pinyin';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all lexicons
const lexiconDir = path.join(__dirname, '../src/data/readingTexts/cafeTalk/lexicon');

async function generateTransliterationsForLanguage(langCode, lexicon) {
  const transliterations = {};

  for (const [wordId, word] of Object.entries(lexicon)) {
    let romanized;

    switch (langCode) {
      case 'mandarin':
        // Use pinyin for Chinese
        try {
          const pinyinArray = pinyinLib.default ? pinyinLib.default(word, { style: 0 }) : pinyinLib(word, { style: 0 });
          romanized = pinyinArray.map(p => Array.isArray(p) ? p[0] : p).join('');
        } catch (e) {
          // Fallback to transliteration
          romanized = transliterate(word);
        }
        break;

      case 'japanese':
        // For Japanese, use transliteration library
        romanized = transliterate(word);
        break;

      case 'arabic':
      case 'russian':
      case 'hindi':
      case 'bengali':
      case 'amharic':
        // Use the general transliteration library
        romanized = transliterate(word);
        break;

      default:
        romanized = word; // Fallback to original
    }

    transliterations[wordId] = romanized;
  }

  return transliterations;
}

async function loadLexicon(langCode) {
  const lexiconPath = path.join(lexiconDir, `${langCode}.js`);
  const content = await fs.readFile(lexiconPath, 'utf-8');

  // Extract the cafeTalkLexicon object
  const match = content.match(/export const cafeTalkLexicon = ({[\s\S]*?});/);
  if (!match) {
    throw new Error(`Could not parse lexicon for ${langCode}`);
  }

  // Use eval to parse (safe since we control the source)
  const lexicon = eval(`(${match[1]})`);
  return lexicon;
}

async function saveTransliterations(langCode, transliterations) {
  const lexiconPath = path.join(lexiconDir, `${langCode}.js`);
  const content = await fs.readFile(lexiconPath, 'utf-8');

  // Check if transliterations already exist
  const hasTranslit = content.includes('export const cafeTalkTransliterations');

  let newContent;
  if (hasTranslit) {
    // Replace existing transliterations
    newContent = content.replace(
      /export const cafeTalkTransliterations = {[\s\S]*?};/,
      `export const cafeTalkTransliterations = ${JSON.stringify(transliterations, null, 2)};`
    );
  } else {
    // Add transliterations at the end
    newContent = content.trimEnd() + '\n\n' +
      `// Transliterations for typing validation\n` +
      `export const cafeTalkTransliterations = ${JSON.stringify(transliterations, null, 2)};\n`;
  }

  await fs.writeFile(lexiconPath, newContent, 'utf-8');
}

async function updateLanguageFile(langCode) {
  const langFilePath = path.join(__dirname, `../src/data/readingTexts/cafeTalk/${langCode}.js`);
  let content = await fs.readFile(langFilePath, 'utf-8');

  // Add import for transliterations if not already present
  if (!content.includes('cafeTalkTransliterations')) {
    content = content.replace(
      /import { cafeTalkLexicon } from/,
      `import { cafeTalkLexicon, cafeTalkTransliterations } from`
    );

    // Remove any temporary transliteration assignment
    content = content.replace(/const cafeTalkTransliterations = englishLexicon;?\n?/g, '');
    content = content.replace(/import { cafeTalkLexicon as englishLexicon }.*?\n/g, '');

    await fs.writeFile(langFilePath, content, 'utf-8');
  }
}

async function main() {
  const languagesToProcess = ['arabic', 'russian', 'hindi', 'bengali', 'japanese', 'mandarin', 'amharic'];

  console.log('Generating transliterations for non-Latin script languages...\n');

  for (const langCode of languagesToProcess) {
    try {
      console.log(`Processing ${langCode}...`);

      // Load lexicon
      const lexicon = await loadLexicon(langCode);

      // Generate transliterations
      const transliterations = await generateTransliterationsForLanguage(langCode, lexicon);

      // Save to lexicon file
      await saveTransliterations(langCode, transliterations);

      // Update language file imports
      await updateLanguageFile(langCode);

      console.log(`✓ Generated ${Object.keys(transliterations).length} transliterations for ${langCode}\n`);
    } catch (error) {
      console.error(`✗ Error processing ${langCode}:`, error.message);
    }
  }

  console.log('Done!');
}

main().catch(console.error);
