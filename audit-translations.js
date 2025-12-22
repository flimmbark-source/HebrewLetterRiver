#!/usr/bin/env node

/**
 * Translation Audit Script
 *
 * This script audits translation files by:
 * 1. Checking for untranslated strings (English in non-English files)
 * 2. Comparing translations against MyMemory API
 * 3. Generating detailed reports for each language
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
  'mandarin.json': { name: 'Chinese', code: 'zh' },
  'hindi.json': { name: 'Hindi', code: 'hi' },
  'japanese.json': { name: 'Japanese', code: 'ja' },
  'bengali.json': { name: 'Bengali', code: 'bn' },
  'amharic.json': { name: 'Amharic', code: 'am' }
};

// Common English words to detect untranslated content
const ENGLISH_INDICATORS = [
  'the', 'and', 'for', 'with', 'you', 'your', 'this', 'that',
  'game', 'play', 'level', 'score', 'complete', 'session',
  'click', 'start', 'continue', 'back', 'next', 'settings'
];

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
 * Check if a string appears to be in English
 */
function appearsEnglish(text) {
  if (typeof text !== 'string') return false;

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);

  // Check for English indicator words
  const englishWordCount = words.filter(word =>
    ENGLISH_INDICATORS.includes(word)
  ).length;

  // If more than 20% of words are English indicators, consider it English
  return englishWordCount > 0 && (englishWordCount / words.length) > 0.2;
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
 * Audit a single translation file
 */
async function auditTranslationFile(filename, langConfig, englishData) {
  console.log(`\nAuditing ${langConfig.name} (${filename})...`);

  const filePath = path.join(I18N_DIR, filename);
  const targetData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const flatEnglish = flattenObject(englishData);
  const flatTarget = flattenObject(targetData);

  const issues = {
    untranslated: [],
    suspicious: [],
    missing: [],
    apiComparison: []
  };

  // Check for untranslated and suspicious translations
  for (const [key, enValue] of Object.entries(flatEnglish)) {
    const targetValue = flatTarget[key];

    // Skip if key doesn't exist in target
    if (targetValue === undefined) {
      issues.missing.push({ key, englishValue: enValue });
      continue;
    }

    // Check if value is exactly the same (untranslated)
    if (enValue === targetValue && typeof enValue === 'string') {
      issues.untranslated.push({ key, value: enValue });
    }
    // Check if translation appears to still be in English
    else if (appearsEnglish(targetValue)) {
      issues.suspicious.push({ key, value: targetValue, englishValue: enValue });
    }
  }

  // Sample API checks for high-priority strings (limit to avoid rate limiting)
  const priorityKeys = Object.keys(flatEnglish)
    .filter(key =>
      key.includes('.name') ||
      key.includes('.title') ||
      key.includes('.description') ||
      key.includes('.label')
    )
    .slice(0, 20); // Limit to 20 checks per language

  for (const key of priorityKeys) {
    const enValue = flatEnglish[key];
    const targetValue = flatTarget[key];

    if (!enValue || !targetValue || typeof enValue !== 'string') continue;

    // Add delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const apiResult = await queryMyMemory(enValue, langConfig.code);

      if (apiResult.translation && targetValue) {
        // Normalize for comparison
        const normalizedTarget = targetValue.toLowerCase().trim();
        const normalizedApi = apiResult.translation.toLowerCase().trim();

        // Calculate similarity (simple approach)
        const similarity = normalizedTarget === normalizedApi ? 1.0 :
          (normalizedTarget.includes(normalizedApi) || normalizedApi.includes(normalizedTarget)) ? 0.7 : 0;

        if (similarity < 0.5 && apiResult.match > 0.8) {
          issues.apiComparison.push({
            key,
            englishValue: enValue,
            currentTranslation: targetValue,
            suggestedTranslation: apiResult.translation,
            confidence: apiResult.match
          });
        }
      }
    } catch (e) {
      console.error(`Error checking ${key}: ${e.message}`);
    }
  }

  return issues;
}

/**
 * Generate markdown report
 */
function generateReport(langName, langCode, issues) {
  const lines = [];

  lines.push(`# Translation Audit Report: ${langName} (${langCode})`);
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Untranslated Strings:** ${issues.untranslated.length}`);
  lines.push(`- **Suspicious Translations:** ${issues.suspicious.length}`);
  lines.push(`- **Missing Keys:** ${issues.missing.length}`);
  lines.push(`- **API Comparison Suggestions:** ${issues.apiComparison.length}`);
  lines.push('');

  if (issues.untranslated.length > 0) {
    lines.push('## Untranslated Strings');
    lines.push('');
    lines.push('These strings are identical to English and need translation:');
    lines.push('');
    issues.untranslated.slice(0, 50).forEach(item => {
      lines.push(`- \`${item.key}\`: "${item.value}"`);
    });
    if (issues.untranslated.length > 50) {
      lines.push(`- ... and ${issues.untranslated.length - 50} more`);
    }
    lines.push('');
  }

  if (issues.suspicious.length > 0) {
    lines.push('## Suspicious Translations');
    lines.push('');
    lines.push('These translations appear to still be in English or partially untranslated:');
    lines.push('');
    issues.suspicious.slice(0, 30).forEach(item => {
      lines.push(`- \`${item.key}\``);
      lines.push(`  - English: "${item.englishValue}"`);
      lines.push(`  - Current: "${item.value}"`);
    });
    if (issues.suspicious.length > 30) {
      lines.push(`- ... and ${issues.suspicious.length - 30} more`);
    }
    lines.push('');
  }

  if (issues.missing.length > 0) {
    lines.push('## Missing Translation Keys');
    lines.push('');
    lines.push('These keys exist in English but are missing from this translation:');
    lines.push('');
    issues.missing.slice(0, 30).forEach(item => {
      lines.push(`- \`${item.key}\`: "${item.englishValue}"`);
    });
    if (issues.missing.length > 30) {
      lines.push(`- ... and ${issues.missing.length - 30} more`);
    }
    lines.push('');
  }

  if (issues.apiComparison.length > 0) {
    lines.push('## API Translation Suggestions');
    lines.push('');
    lines.push('MyMemory API suggests these alternative translations (review carefully):');
    lines.push('');
    issues.apiComparison.forEach(item => {
      lines.push(`### \`${item.key}\``);
      lines.push(`- **English:** "${item.englishValue}"`);
      lines.push(`- **Current:** "${item.currentTranslation}"`);
      lines.push(`- **Suggested:** "${item.suggestedTranslation}"`);
      lines.push(`- **Confidence:** ${(item.confidence * 100).toFixed(0)}%`);
      lines.push('');
    });
  }

  return lines.join('\n');
}

/**
 * Main audit function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Translation Audit Tool');
  console.log('='.repeat(60));

  // Create reports directory
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  // Load English reference
  const englishPath = path.join(I18N_DIR, 'en.json');
  const englishData = JSON.parse(fs.readFileSync(englishPath, 'utf8'));

  const summaryReport = [];
  summaryReport.push('# Translation Audit Summary');
  summaryReport.push('');
  summaryReport.push(`**Generated:** ${new Date().toISOString()}`);
  summaryReport.push('');
  summaryReport.push('| Language | Untranslated | Suspicious | Missing | API Suggestions |');
  summaryReport.push('|----------|-------------|------------|---------|-----------------|');

  // Audit each language
  for (const [filename, langConfig] of Object.entries(LANGUAGES)) {
    try {
      const issues = await auditTranslationFile(filename, langConfig, englishData);

      // Generate individual report
      const report = generateReport(langConfig.name, langConfig.code, issues);
      const reportPath = path.join(REPORTS_DIR, `${langConfig.code}-report.md`);
      fs.writeFileSync(reportPath, report, 'utf8');

      console.log(`✓ Generated report: ${reportPath}`);

      // Add to summary
      summaryReport.push(`| ${langConfig.name} | ${issues.untranslated.length} | ${issues.suspicious.length} | ${issues.missing.length} | ${issues.apiComparison.length} |`);

    } catch (err) {
      console.error(`✗ Error auditing ${langConfig.name}: ${err.message}`);
      summaryReport.push(`| ${langConfig.name} | ERROR | ERROR | ERROR | ERROR |`);
    }
  }

  // Write summary report
  const summaryPath = path.join(REPORTS_DIR, 'SUMMARY.md');
  fs.writeFileSync(summaryPath, summaryReport.join('\n'), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log(`✓ Audit complete! Reports saved to: ${REPORTS_DIR}`);
  console.log(`✓ Summary report: ${summaryPath}`);
  console.log('='.repeat(60));
}

// Run the audit
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
