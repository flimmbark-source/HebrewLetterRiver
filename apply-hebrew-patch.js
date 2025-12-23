#!/usr/bin/env node

/**
 * Apply Hebrew Translation Patch
 *
 * Merges the Hebrew translation patch with the existing Hebrew translation file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HEBREW_FILE = path.join(__dirname, 'src', 'i18n', 'he.json');
const PATCH_FILE = path.join(__dirname, 'hebrew-translations-patch.json');
const BACKUP_FILE = path.join(__dirname, 'src', 'i18n', 'he.json.backup');

/**
 * Deep merge two objects
 */
function deepMerge(target, source) {
  const output = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (target[key] && typeof target[key] === 'object') {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    } else {
      output[key] = source[key];
    }
  }

  return output;
}

/**
 * Count changes made
 */
function countChanges(original, updated, prefix = '') {
  let count = 0;
  const changes = [];

  for (const key in updated) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (updated[key] && typeof updated[key] === 'object' && !Array.isArray(updated[key])) {
      const result = countChanges(original?.[key] || {}, updated[key], fullKey);
      count += result.count;
      changes.push(...result.changes);
    } else {
      if (!original?.[key] || original[key] !== updated[key]) {
        count++;
        changes.push({
          key: fullKey,
          old: original?.[key] || '(missing)',
          new: updated[key]
        });
      }
    }
  }

  return { count, changes };
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Apply Hebrew Translation Patch');
  console.log('='.repeat(60));
  console.log('');

  // Read files
  const hebrewData = JSON.parse(fs.readFileSync(HEBREW_FILE, 'utf8'));
  const patchData = JSON.parse(fs.readFileSync(PATCH_FILE, 'utf8'));

  // Create backup
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(hebrewData, null, 2) + '\n', 'utf8');
  console.log(`✓ Backup created: ${BACKUP_FILE}`);

  // Merge
  const mergedData = deepMerge(hebrewData, patchData);

  // Count changes
  const { count, changes } = countChanges(hebrewData, mergedData);

  console.log(`\nChanges to be applied: ${count}`);
  console.log('');

  // Show first 10 changes
  console.log('Sample changes:');
  changes.slice(0, 10).forEach((change, index) => {
    console.log(`${index + 1}. ${change.key}`);
    console.log(`   Old: "${change.old}"`);
    console.log(`   New: "${change.new}"`);
  });

  if (changes.length > 10) {
    console.log(`   ... and ${changes.length - 10} more`);
  }

  // Write updated file
  fs.writeFileSync(HEBREW_FILE, JSON.stringify(mergedData, null, 2) + '\n', 'utf8');
  console.log('');
  console.log(`✓ Hebrew translations updated: ${HEBREW_FILE}`);
  console.log(`✓ Total changes applied: ${count}`);

  // Generate change report
  const reportPath = path.join(__dirname, 'translation-reports', 'hebrew-changes-applied.md');
  const reportLines = [
    '# Hebrew Translation Changes Applied',
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**Total Changes:** ${count}`,
    '',
    '## Changes',
    ''
  ];

  changes.forEach((change, index) => {
    reportLines.push(`### ${index + 1}. \`${change.key}\``);
    reportLines.push(`- **Before:** "${change.old}"`);
    reportLines.push(`- **After:** "${change.new}"`);
    reportLines.push('');
  });

  fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');
  console.log(`✓ Change report saved: ${reportPath}`);

  console.log('');
  console.log('='.repeat(60));
  console.log('✓ Patch applied successfully!');
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
