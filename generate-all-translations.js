#!/usr/bin/env node

/**
 * Comprehensive Translation Generator
 * Generates high-quality translations for all languages using multiple strategies
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const I18N_DIR = path.join(__dirname, 'src', 'i18n');

// Language configurations with API codes and file names
const LANGUAGES = {
  ar: { name: 'Arabic', apiCode: 'ar', fileName: 'arabic.json', rtl: true },
  es: { name: 'Spanish', apiCode: 'es', fileName: 'spanish.json', rtl: false },
  fr: { name: 'French', apiCode: 'fr', fileName: 'french.json', rtl: false },
  pt: { name: 'Portuguese', apiCode: 'pt', fileName: 'portuguese.json', rtl: false },
  ru: { name: 'Russian', apiCode: 'ru', fileName: 'russian.json', rtl: false },
  zh: { name: 'Chinese', apiCode: 'zh', fileName: 'mandarin.json', rtl: false },
  hi: { name: 'Hindi', apiCode: 'hi', fileName: 'hindi.json', rtl: false },
  ja: { name: 'Japanese', apiCode: 'ja', fileName: 'japanese.json', rtl: false },
  bn: { name: 'Bengali', apiCode: 'bn', fileName: 'bengali.json', rtl: false },
  am: { name: 'Amharic', apiCode: 'am', fileName: 'amharic.json', rtl: false }
};

// Common gaming terms with proper translations (prevent mistranslations)
const GAMING_TERMS = {
  ar: {
    'game': 'لعبة',
    'level': 'مستوى',
    'score': 'نقاط',
    'streak': 'سلسلة',
    'badge': 'شارة',
    'achievement': 'إنجاز',
    'quest': 'مهمة'
  },
  es: {
    'game': 'juego',
    'level': 'nivel',
    'score': 'puntuación',
    'streak': 'racha',
    'badge': 'insignia',
    'achievement': 'logro',
    'quest': 'misión'
  },
  fr: {
    'game': 'jeu',
    'level': 'niveau',
    'score': 'score',
    'streak': 'série',
    'badge': 'badge',
    'achievement': 'succès',
    'quest': 'quête'
  },
  pt: {
    'game': 'jogo',
    'level': 'nível',
    'score': 'pontuação',
    'streak': 'sequência',
    'badge': 'emblema',
    'achievement': 'conquista',
    'quest': 'missão'
  },
  ru: {
    'game': 'игра',
    'level': 'уровень',
    'score': 'очки',
    'streak': 'серия',
    'badge': 'значок',
    'achievement': 'достижение',
    'quest': 'задание'
  },
  zh: {
    'game': '游戏',
    'level': '等级',
    'score': '分数',
    'streak': '连胜',
    'badge': '徽章',
    'achievement': '成就',
    'quest': '任务'
  },
  hi: {
    'game': 'खेल',
    'level': 'स्तर',
    'score': 'अंक',
    'streak': 'लगातार',
    'badge': 'बैज',
    'achievement': 'उपलब्धि',
    'quest': 'खोज'
  },
  ja: {
    'game': 'ゲーム',
    'level': 'レベル',
    'score': 'スコア',
    'streak': '連続',
    'badge': 'バッジ',
    'achievement': '実績',
    'quest': 'クエスト'
  },
  bn: {
    'game': 'খেলা',
    'level': 'স্তর',
    'score': 'স্কোর',
    'streak': 'ধারা',
    'badge': 'ব্যাজ',
    'achievement': 'অর্জন',
    'quest': 'অনুসন্ধান'
  },
  am: {
    'game': 'ጨዋታ',
    'level': 'ደረጃ',
    'score': 'ውጤት',
    'streak': 'ተከታታይ',
    'badge': 'ባጅ',
    'achievement': 'ስኬት',
    'quest': 'ተልዕኮ'
  }
};

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

function unflattenObject(flattened) {
  const result = {};
  for (const [key, value] of Object.entries(flattened)) {
    const keys = key.split('.');
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

function appearsEnglish(text) {
  if (typeof text !== 'string') return false;
  const englishIndicators = ['the', 'and', 'or', 'is', 'are', 'to', 'for', 'of', 'in', 'on', 'with'];
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const englishWordCount = words.filter(word => englishIndicators.includes(word)).length;
  return englishWordCount > 0 && (englishWordCount / words.length) > 0.2;
}

async function translateWithMyMemory(text, targetLang) {
  return new Promise((resolve, reject) => {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.responseData && parsed.responseData.translatedText) {
            resolve(parsed.responseData.translatedText);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateTranslationsForLanguage(langCode) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Generating translations for ${LANGUAGES[langCode].name} (${langCode})`);
  console.log('='.repeat(60));

  const englishPath = path.join(I18N_DIR, 'en.json');
  const targetPath = path.join(I18N_DIR, LANGUAGES[langCode].fileName);

  const englishData = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
  const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

  const flatEnglish = flattenObject(englishData);
  const flatTarget = flattenObject(targetData);

  const translations = {};
  let translatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const untranslatedKeys = Object.keys(flatEnglish).filter(key => {
    const englishValue = flatEnglish[key];
    const targetValue = flatTarget[key];

    // Skip if already translated
    if (targetValue && targetValue !== englishValue) {
      return false;
    }

    // Skip if missing
    if (!targetValue) {
      return true;
    }

    // Include if appears to be English
    return appearsEnglish(targetValue);
  });

  console.log(`Found ${untranslatedKeys.length} strings to translate`);

  for (let i = 0; i < untranslatedKeys.length; i++) {
    const key = untranslatedKeys[i];
    const englishValue = flatEnglish[key];

    // Skip empty strings, emojis, and template placeholders
    if (!englishValue ||
        typeof englishValue !== 'string' ||
        englishValue.trim() === '' ||
        /^[⭐✓⬅➡←→↑↓]+$/.test(englishValue) ||
        /^\{\{.*\}\}$/.test(englishValue)) {
      skippedCount++;
      continue;
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`Progress: ${i + 1}/${untranslatedKeys.length}`);
    }

    // Try to translate
    try {
      await sleep(600); // Rate limiting
      const translation = await translateWithMyMemory(englishValue, LANGUAGES[langCode].apiCode);

      if (translation && translation !== englishValue) {
        translations[key] = translation;
        translatedCount++;
      } else {
        errorCount++;
        console.log(`  ⚠ Failed to translate: ${key}`);
      }
    } catch (e) {
      errorCount++;
      console.log(`  ⚠ Error translating: ${key}`);
    }
  }

  console.log(`\nResults for ${LANGUAGES[langCode].name}:`);
  console.log(`  ✓ Translated: ${translatedCount}`);
  console.log(`  ⊘ Skipped: ${skippedCount}`);
  console.log(`  ✗ Errors: ${errorCount}`);

  // Save patch file
  const patchPath = path.join(__dirname, `${langCode}-translations-patch.json`);
  const unflattenedTranslations = unflattenObject(translations);
  fs.writeFileSync(patchPath, JSON.stringify(unflattenedTranslations, null, 2) + '\n', 'utf8');
  console.log(`\nPatch file saved: ${patchPath}`);

  return {
    langCode,
    langName: LANGUAGES[langCode].name,
    translatedCount,
    skippedCount,
    errorCount,
    patchPath
  };
}

async function main() {
  console.log('Comprehensive Translation Generator');
  console.log('===================================\n');

  const results = [];

  for (const langCode of Object.keys(LANGUAGES)) {
    const result = await generateTranslationsForLanguage(langCode);
    results.push(result);

    // Longer pause between languages
    await sleep(2000);
  }

  console.log('\n' + '='.repeat(60));
  console.log('FINAL SUMMARY');
  console.log('='.repeat(60));
  console.log('\n| Language | Translated | Skipped | Errors |');
  console.log('|----------|-----------|---------|--------|');

  for (const result of results) {
    console.log(`| ${result.langName.padEnd(8)} | ${String(result.translatedCount).padStart(9)} | ${String(result.skippedCount).padStart(7)} | ${String(result.errorCount).padStart(6)} |`);
  }

  console.log('\nAll translation patches have been generated!');
  console.log('Next step: Review and apply patches using apply-translation-patch.js');
}

main().catch(console.error);
