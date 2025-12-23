#!/usr/bin/env node

/**
 * Universal Translation Patch Applicator
 * Applies translation patches to any language file with backup and reporting
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const I18N_DIR = path.join(__dirname, 'src', 'i18n');

// Language code to file name mapping
const LANG_FILE_MAP = {
  ar: 'arabic.json',
  es: 'spanish.json',
  fr: 'french.json',
  pt: 'portuguese.json',
  ru: 'russian.json',
  zh: 'mandarin.json',
  hi: 'hindi.json',
  ja: 'japanese.json',
  bn: 'bengali.json',
  am: 'amharic.json',
  he: 'he.json'
};

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

async function applyPatch(langCode, patchPath) {
  console.log(`\nApplying patch for ${langCode}...`);

  const fileName = LANG_FILE_MAP[langCode] || `${langCode}.json`;
  const targetPath = path.join(I18N_DIR, fileName);
  const backupPath = `${targetPath}.backup`;

  // Read files
  const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  const patchData = JSON.parse(fs.readFileSync(patchPath, 'utf8'));

  // Create backup
  fs.writeFileSync(backupPath, JSON.stringify(targetData, null, 2) + '\n', 'utf8');
  console.log(`  ✓ Backup created: ${backupPath}`);

  // Flatten for comparison
  const flatBefore = flattenObject(targetData);
  const flatPatch = flattenObject(patchData);

  // Merge
  const merged = deepMerge(targetData, patchData);

  // Write updated file
  fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');

  // Generate change report
  const flatAfter = flattenObject(merged);
  const changes = [];

  for (const key in flatPatch) {
    const before = flatBefore[key] || '(missing)';
    const after = flatAfter[key];

    if (before !== after) {
      changes.push({
        key,
        before,
        after
      });
    }
  }

  console.log(`  ✓ Applied ${changes.length} changes to ${targetPath}`);

  // Save change report
  const reportPath = path.join(__dirname, 'translation-reports', `${langCode}-changes-applied.md`);
  let report = `# Translation Changes Applied: ${langCode}\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `**Total Changes:** ${changes.length}\n\n`;
  report += `## Changes\n\n`;

  for (const change of changes) {
    report += `### \`${change.key}\`\n\n`;
    report += `- **Before:** ${change.before}\n`;
    report += `- **After:** ${change.after}\n\n`;
  }

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`  ✓ Change report saved: ${reportPath}`);

  return changes.length;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node apply-translation-patch.js <lang-code> [patch-file]');
    console.log('Example: node apply-translation-patch.js ar ar-translations-patch.json');
    console.log('\nOr apply all patches at once:');
    console.log('  node apply-translation-patch.js --all');
    process.exit(1);
  }

  if (args[0] === '--all') {
    console.log('Applying all translation patches...\n');

    const patchFiles = fs.readdirSync(__dirname)
      .filter(f => f.endsWith('-translations-patch.json') && f !== 'hebrew-translations-patch.json');

    let totalChanges = 0;

    for (const patchFile of patchFiles) {
      const langCode = patchFile.replace('-translations-patch.json', '');
      const patchPath = path.join(__dirname, patchFile);

      try {
        const changeCount = await applyPatch(langCode, patchPath);
        totalChanges += changeCount;
      } catch (error) {
        console.error(`  ✗ Error applying patch for ${langCode}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Total changes applied across all languages: ${totalChanges}`);
    console.log('='.repeat(60));

  } else {
    const langCode = args[0];
    const patchFile = args[1] || `${langCode}-translations-patch.json`;
    const patchPath = path.join(__dirname, patchFile);

    if (!fs.existsSync(patchPath)) {
      console.error(`Error: Patch file not found: ${patchPath}`);
      process.exit(1);
    }

    await applyPatch(langCode, patchPath);
    console.log('\n✓ Patch applied successfully!');
  }
}

main().catch(console.error);
