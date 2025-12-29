#!/usr/bin/env node

/**
 * Cafe Talk Lexicon Generator using DeepL API
 * 
 * This script generates language-specific lexicons for all Cafe Talk words using DeepL.
 * It creates src/data/readingTexts/cafeTalk/lexicon/<lang>.js for each supported language.
 * 
 * SECURITY REQUIREMENTS:
 * - Reads DEEPL_AUTH_KEY from process.env.DEEPL_AUTH_KEY ONLY
 * - Never logs, writes, or exposes the key
 * - Designed to run in GitHub Codespaces with secrets configured
 * 
 * USAGE:
 *   node scripts/generateCafeTalkLexiconsWithDeepL.mjs
 * 
 * Then run tests/build to ensure validation passes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate DeepL API key is available
const DEEPL_AUTH_KEY = process.env.DEEPL_AUTH_KEY;
if (!DEEPL_AUTH_KEY) {
  console.error('ERROR: DEEPL_AUTH_KEY environment variable is not set.');
  console.error('In GitHub Codespaces, add it as a secret and restart.');
  process.exit(1);
}

// Supported languages (from readingTextsByLanguage keys)
const SUPPORTED_LANGUAGES = [
  'hebrew', 'arabic', 'mandarin', 'hindi', 'english',
  'spanish', 'french', 'portuguese', 'russian',
  'japanese', 'bengali', 'amharic'
];

// Map internal language IDs to DeepL target language codes
const DEEPL_LANGUAGE_MAP = {
  english: 'EN',
  spanish: 'ES',
  french: 'FR',
  portuguese: 'PT-PT', // Using European Portuguese; change to PT-BR for Brazilian
  russian: 'RU',
  mandarin: 'ZH',
  japanese: 'JA',
  hindi: 'HI',
  bengali: 'BN',
  amharic: null, // DeepL doesn't support Amharic - will skip with warning
  arabic: 'AR',
  hebrew: null // DeepL may not support Hebrew - will try or skip
};

// Import the canonical word list
const canonicalPath = path.join(__dirname, '../src/data/readingTexts/cafeTalk/cafeTalkCanonical.js');
let CAFE_TALK_WORDS;

// Dynamically import the canonical list
try {
  const module = await import(`file://${canonicalPath}`);
  CAFE_TALK_WORDS = module.CAFE_TALK_WORDS;
  console.log(`✓ Loaded ${CAFE_TALK_WORDS.length} canonical words from cafeTalkCanonical.js`);
} catch (error) {
  console.error('ERROR: Failed to load cafeTalkCanonical.js:', error.message);
  process.exit(1);
}

/**
 * Call DeepL API to translate text
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - DeepL target language code
 * @returns {Promise<string[]>} Translated texts
 */
async function translateWithDeepL(texts, targetLang) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams();
    texts.forEach(text => postData.append('text', text));
    postData.append('target_lang', targetLang);
    postData.append('auth_key', DEEPL_AUTH_KEY);

    const options = {
      hostname: 'api-free.deepl.com',
      path: '/v2/translate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData.toString())
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const translations = json.translations.map(t => t.text);
            resolve(translations);
          } catch (error) {
            reject(new Error(`Failed to parse DeepL response: ${error.message}`));
          }
        } else {
          reject(new Error(`DeepL API returned status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`DeepL API request failed: ${error.message}`));
    });

    req.write(postData.toString());
    req.end();
  });
}

/**
 * Prepare contextual strings for better translation quality
 * @param {string} word - The word to translate
 * @param {string} wordId - The word ID
 * @returns {string} Contextualized string
 */
function prepareForTranslation(word, wordId) {
  // For discourse markers, add punctuation for context
  const discourseMarkers = ['so', 'but', 'well', 'actually', 'maybe', 'probably', 'basically', 'anyway'];
  if (discourseMarkers.includes(wordId)) {
    return `${word.charAt(0).toUpperCase()}${word.slice(1)},`;
  }
  
  // For question words, keep as-is or add context
  if (['who', 'when', 'what', 'where', 'why', 'how'].includes(wordId)) {
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}?`;
  }
  
  // Default: capitalize first letter for proper noun handling
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Post-process translated text
 * @param {string} translated - Translated text
 * @param {string} originalWord - Original English word
 * @returns {string} Cleaned translation
 */
function postProcessTranslation(translated, originalWord) {
  // Remove added punctuation if it was just for context
  let cleaned = translated.trim();
  
  // If we added a comma for context and it's still there, remove it
  if (cleaned.endsWith(',')) {
    cleaned = cleaned.slice(0, -1).trim();
  }
  
  // If we added a question mark and it's preserved, keep it only if appropriate
  // (In many languages, question words don't need the ? at word level)
  if (cleaned.endsWith('?') && !originalWord.endsWith('?')) {
    cleaned = cleaned.slice(0, -1).trim();
  }
  
  // Lowercase unless it's a pronoun like "I"
  if (originalWord !== 'I') {
    cleaned = cleaned.toLowerCase();
  }
  
  return cleaned;
}

/**
 * Translate all words to a target language
 * @param {string} languageId - Internal language ID
 * @param {string} deeplLang - DeepL language code
 * @returns {Promise<Object>} Lexicon object {wordId: translation}
 */
async function generateLexicon(languageId, deeplLang) {
  console.log(`\nTranslating to ${languageId} (DeepL: ${deeplLang})...`);
  
  if (!deeplLang) {
    console.warn(`⚠ DeepL doesn't support ${languageId}. Skipping.`);
    return null;
  }
  
  // If English, just use the canonical words
  if (languageId === 'english') {
    const lexicon = {};
    CAFE_TALK_WORDS.forEach(word => {
      lexicon[word.id] = word.en;
    });
    console.log(`✓ English lexicon created (${Object.keys(lexicon).length} words)`);
    return lexicon;
  }
  
  // Prepare texts for translation
  const textsToTranslate = CAFE_TALK_WORDS.map(word => 
    prepareForTranslation(word.en, word.id)
  );
  
  // Translate in batches (DeepL allows up to 50 texts per request)
  const BATCH_SIZE = 50;
  const allTranslations = [];
  
  for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
    const batch = textsToTranslate.slice(i, i + BATCH_SIZE);
    console.log(`  Translating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(textsToTranslate.length / BATCH_SIZE)}...`);
    
    try {
      const translations = await translateWithDeepL(batch, deeplLang);
      allTranslations.push(...translations);
      
      // Rate limiting: wait 1 second between batches
      if (i + BATCH_SIZE < textsToTranslate.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`  ✗ Batch translation failed: ${error.message}`);
      throw error;
    }
  }
  
  // Post-process and build lexicon
  const lexicon = {};
  CAFE_TALK_WORDS.forEach((word, index) => {
    lexicon[word.id] = postProcessTranslation(allTranslations[index], word.en);
  });
  
  console.log(`✓ ${languageId} lexicon created (${Object.keys(lexicon).length} words)`);
  return lexicon;
}

/**
 * Write lexicon to file
 * @param {string} languageId - Language ID
 * @param {Object} lexicon - Lexicon object
 */
function writeLexicon(languageId, lexicon) {
  const outputDir = path.join(__dirname, '../src/data/readingTexts/cafeTalk/lexicon');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, `${languageId}.js`);
  
  // Format as a JS module with stable key ordering
  const sortedKeys = Object.keys(lexicon).sort();
  const lines = [
    '/**',
    ` * Cafe Talk Lexicon - ${languageId.charAt(0).toUpperCase() + languageId.slice(1)}`,
    ' * Generated by scripts/generateCafeTalkLexiconsWithDeepL.mjs',
    ' * DO NOT EDIT MANUALLY',
    ' */',
    '',
    'export const cafeTalkLexicon = {'
  ];
  
  sortedKeys.forEach(key => {
    const value = lexicon[key].replace(/'/g, "\\'"); // Escape single quotes
    lines.push(`  '${key}': '${value}',`);
  });
  
  // Remove trailing comma from last entry
  if (lines.length > 7) {
    const lastLine = lines[lines.length - 1];
    lines[lines.length - 1] = lastLine.slice(0, -1);
  }
  
  lines.push('};');
  lines.push('');
  
  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
  console.log(`  Written to ${outputPath}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('Cafe Talk Lexicon Generator');
  console.log('============================\n');
  console.log(`DeepL API key: ${DEEPL_AUTH_KEY ? '✓ configured' : '✗ missing'}`);
  console.log(`Supported languages: ${SUPPORTED_LANGUAGES.length}`);
  console.log(`Words to translate: ${CAFE_TALK_WORDS.length}\n`);
  
  const results = {
    success: [],
    skipped: [],
    failed: []
  };
  
  for (const languageId of SUPPORTED_LANGUAGES) {
    const deeplLang = DEEPL_LANGUAGE_MAP[languageId];
    
    try {
      const lexicon = await generateLexicon(languageId, deeplLang);
      
      if (lexicon) {
        writeLexicon(languageId, lexicon);
        results.success.push(languageId);
      } else {
        results.skipped.push(languageId);
      }
    } catch (error) {
      console.error(`✗ Failed to generate ${languageId} lexicon:`, error.message);
      results.failed.push(languageId);
    }
  }
  
  console.log('\n============================');
  console.log('Summary:');
  console.log(`✓ Success: ${results.success.length} languages`);
  if (results.success.length > 0) {
    console.log(`  ${results.success.join(', ')}`);
  }
  
  if (results.skipped.length > 0) {
    console.log(`⚠ Skipped: ${results.skipped.length} languages (not supported by DeepL)`);
    console.log(`  ${results.skipped.join(', ')}`);
  }
  
  if (results.failed.length > 0) {
    console.log(`✗ Failed: ${results.failed.length} languages`);
    console.log(`  ${results.failed.join(', ')}`);
    process.exit(1);
  }
  
  console.log('\nNext steps:');
  console.log('1. Update Cafe Talk modules to use lexicons');
  console.log('2. Run tests: npm test');
  console.log('3. Build: npm run build');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
