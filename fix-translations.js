#!/usr/bin/env node

/**
 * Translation Fixer Script
 *
 * This script automatically translates missing strings using translation APIs
 * and updates the translation files.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const I18N_DIR = path.join(__dirname, 'src', 'i18n');
const REPORTS_DIR = path.join(__dirname, 'translation-reports');

// Language configurations
const LANGUAGES = {
  'he.json': { name: 'Hebrew', code: 'he', rtl: true },
  'arabic.json': { name: 'Arabic', code: 'ar', rtl: true },
  'spanish.json': { name: 'Spanish', code: 'es' },
  'french.json': { name: 'French', code: 'fr' },
  'portuguese.json': { name: 'Portuguese', code: 'pt' },
  'russian.json': { name: 'Russian', code: 'ru' },
  'mandarin.json': { name: 'Chinese (Simplified)', code: 'zh-CN' },
  'hindi.json': { name: 'Hindi', code: 'hi' },
  'japanese.json': { name: 'Japanese', code: 'ja' },
  'bengali.json': { name: 'Bengali', code: 'bn' },
  'amharic.json': { name: 'Amharic', code: 'am' }
};

/**
 * Flatten nested JSON object to dot-notation paths
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else {
      flattened[newKey] = value;
    }
  }

  return flattened;
}

/**
 * Unflatten dot-notation paths back to nested object
 */
function unflattenObject(flattened) {
  const result = {};

  for (const [path, value] of Object.entries(flattened)) {
    const keys = path.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  return result;
}

/**
 * Query MyMemory Translation API
 */
function queryMyMemory(text, targetLang) {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            translation: json.responseData?.translatedText || null,
            match: json.responseData?.match || 0
          });
        } catch (e) {
          resolve({ translation: null, match: 0 });
        }
      });
    }).on('error', (err) => {
      resolve({ translation: null, match: 0 });
    });
  });
}

/**
 * Check if a string appears to be in English
 */
function appearsEnglish(text) {
  if (typeof text !== 'string') return false;

  const englishPatterns = [
    /\b(the|and|for|with|you|your|this|that|game|play|level|score)\b/i,
    /^[a-zA-Z0-9\s\-_.,!?'"()]+$/
  ];

  return englishPatterns.some(pattern => pattern.test(text));
}

/**
 * Fix translations for a single language file
 */
async function fixTranslationFile(filename, langConfig, englishData, dryRun = false) {
  console.log(`\nProcessing ${langConfig.name} (${filename})...`);

  const filePath = path.join(I18N_DIR, filename);
  const targetData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const flatEnglish = flattenObject(englishData);
  const flatTarget = flattenObject(targetData);

  let fixedCount = 0;
  let errorCount = 0;
  const changes = [];

  // Find all strings that need translation
  const toTranslate = [];

  for (const [key, enValue] of Object.entries(flatEnglish)) {
    const targetValue = flatTarget[key];

    // Skip non-string values
    if (typeof enValue !== 'string') continue;

    // Need translation if:
    // 1. Key is missing in target
    // 2. Value is identical to English (untranslated)
    // 3. Value appears to be in English
    if (
      targetValue === undefined ||
      (enValue === targetValue && appearsEnglish(enValue)) ||
      (targetValue && appearsEnglish(targetValue) && enValue !== targetValue)
    ) {
      toTranslate.push({ key, enValue });
    }
  }

  console.log(`Found ${toTranslate.length} strings needing translation`);

  // Translate strings (with rate limiting)
  for (let i = 0; i < toTranslate.length; i++) {
    const { key, enValue } = toTranslate[i];

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`  Progress: ${i + 1}/${toTranslate.length}`);
    }

    // Add delay to respect API rate limits (500ms between requests)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      const apiResult = await queryMyMemory(enValue, langConfig.code);

      if (apiResult.translation) {
        flatTarget[key] = apiResult.translation;
        changes.push({
          key,
          from: flatTarget[key] || '(missing)',
          to: apiResult.translation,
          confidence: apiResult.match
        });
        fixedCount++;
      } else {
        console.warn(`  Warning: Could not translate "${key}"`);
        errorCount++;
      }
    } catch (err) {
      console.error(`  Error translating "${key}": ${err.message}`);
      errorCount++;
    }
  }

  // Save the updated file (if not dry run)
  if (!dryRun && fixedCount > 0) {
    const updatedData = unflattenObject(flatTarget);
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated ${filename}: ${fixedCount} translations applied`);
  } else if (dryRun) {
    console.log(`✓ Dry run complete: ${fixedCount} translations would be applied`);
  }

  // Generate change report
  if (changes.length > 0) {
    const reportPath = path.join(REPORTS_DIR, `${langConfig.code}-fixes.md`);
    const reportLines = [
      `# Translation Fixes: ${langConfig.name}`,
      '',
      `**Generated:** ${new Date().toISOString()}`,
      `**Total Fixes:** ${fixedCount}`,
      `**Errors:** ${errorCount}`,
      '',
      '## Changes Made',
      ''
    ];

    changes.slice(0, 100).forEach(change => {
      reportLines.push(`### \`${change.key}\``);
      reportLines.push(`- **English:** "${change.from}"`);
      reportLines.push(`- **Translated:** "${change.to}"`);
      reportLines.push(`- **Confidence:** ${(change.confidence * 100).toFixed(0)}%`);
      reportLines.push('');
    });

    if (changes.length > 100) {
      reportLines.push(`... and ${changes.length - 100} more changes`);
    }

    fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
  }

  return { fixedCount, errorCount };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetLang = args.find(arg => arg.startsWith('--lang='))?.split('=')[1];

  console.log('='.repeat(60));
  console.log('Translation Fixer Tool');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log('');

  // Create reports directory if it doesn't exist
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  // Load English reference
  const englishPath = path.join(I18N_DIR, 'en.json');
  const englishData = JSON.parse(fs.readFileSync(englishPath, 'utf8'));

  const summary = [];
  let totalFixed = 0;
  let totalErrors = 0;

  // Process languages
  const languagesToProcess = targetLang
    ? Object.entries(LANGUAGES).filter(([file]) => file.includes(targetLang))
    : Object.entries(LANGUAGES);

  for (const [filename, langConfig] of languagesToProcess) {
    try {
      const { fixedCount, errorCount } = await fixTranslationFile(
        filename,
        langConfig,
        englishData,
        dryRun
      );

      summary.push({ name: langConfig.name, fixed: fixedCount, errors: errorCount });
      totalFixed += fixedCount;
      totalErrors += errorCount;

    } catch (err) {
      console.error(`✗ Error processing ${langConfig.name}: ${err.message}`);
      summary.push({ name: langConfig.name, fixed: 0, errors: 1 });
      totalErrors++;
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log('');
  summary.forEach(item => {
    console.log(`${item.name}: ${item.fixed} fixed, ${item.errors} errors`);
  });
  console.log('');
  console.log(`Total: ${totalFixed} translations fixed, ${totalErrors} errors`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\nThis was a dry run. Use without --dry-run to apply changes.');
  }
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
