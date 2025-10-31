#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

import englishDictionary from '../src/i18n/en.json' with { type: 'json' };
import { languagePacks } from '../src/data/languages/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dictionariesDir = path.resolve(__dirname, '../src/i18n');

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY ?? null;
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}

const languageCodes = {
  arabic: 'ar',
  bengali: 'bn',
  english: 'en',
  french: 'fr',
  hebrew: 'he',
  hindi: 'hi',
  japanese: 'ja',
  mandarin: 'zh-CN',
  portuguese: 'pt',
  russian: 'ru',
  spanish: 'es'
};

const nonTranslatablePaths = new Set(['language.id']);

function cloneDictionary() {
  return JSON.parse(JSON.stringify(englishDictionary));
}

function flattenDictionary(dictionary, prefix = []) {
  const entries = [];
  Object.entries(dictionary).forEach(([key, value]) => {
    const currentPath = [...prefix, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...flattenDictionary(value, currentPath));
    } else {
      entries.push([currentPath, value]);
    }
  });
  return entries;
}

function setDeepValue(target, pathSegments, value) {
  let cursor = target;
  for (let i = 0; i < pathSegments.length - 1; i += 1) {
    const segment = pathSegments[i];
    if (!cursor[segment] || typeof cursor[segment] !== 'object') {
      cursor[segment] = {};
    }
    cursor = cursor[segment];
  }
  cursor[pathSegments[pathSegments.length - 1]] = value;
}

function shouldTranslate(pathSegments, value) {
  if (typeof value !== 'string') return false;
  const joinedPath = pathSegments.join('.');
  if (nonTranslatablePaths.has(joinedPath)) return false;
  return true;
}

function maskPlaceholders(value) {
  const placeholders = [];
  const maskedValue = value.replace(/{{\s*.+?\s*}}/g, (match) => {
    const token = `__PLACEHOLDER_${placeholders.length}__`;
    placeholders.push({ token, match });
    return token;
  });
  return { maskedValue, placeholders };
}

function restorePlaceholders(value, placeholders) {
  let restored = value;
  placeholders.forEach(({ token, match }) => {
    const regex = new RegExp(token, 'g');
    restored = restored.replace(regex, match);
  });
  return restored;
}

function toSearchParams(params) {
  return new URLSearchParams(
    Object.entries(params).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((entry) => [key, entry]);
      }
      return [[key, value]];
    })
  );
}

async function translateText(value, targetLanguageCode) {
  const { maskedValue, placeholders } = maskPlaceholders(value);
  const searchParams = toSearchParams({
    client: 'gtx',
    sl: 'en',
    tl: targetLanguageCode,
    dt: 't',
    q: maskedValue
  });

  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }

  const data = await response.json();
  const translated = (data?.[0] ?? [])
    .map((segment) => {
      if (!segment) return '';
      const [translatedSegment] = segment;
      return translatedSegment ?? '';
    })
    .join('');

  return restorePlaceholders(translated, placeholders);
}

function applyPackSpecificOverrides(dictionary, languageId) {
  const pack = languagePacks[languageId];
  if (!pack) return dictionary;
  const result = JSON.parse(JSON.stringify(dictionary));

  const introductions = pack.introductions ?? {};
  if (introductions.nounFallback) {
    result.game ??= {};
    result.game.setup ??= {};
    result.game.setup.defaultNoun = introductions.nounFallback;
  }
  if (introductions.subtitleTemplate) {
    result.game ??= {};
    result.game.setup ??= {};
    result.game.setup.subtitleFallback = introductions.subtitleTemplate;
  }

  const practiceModes = Array.isArray(pack.practiceModes) ? pack.practiceModes : [];
  if (practiceModes.length) {
    result.game ??= {};
    result.game.modes ??= {};
    practiceModes.forEach((mode) => {
      const modeId = mode.id;
      if (!modeId) return;
      const existing = result.game.modes[modeId] ?? {};
      result.game.modes[modeId] = {
        ...existing,
        noun: mode.noun ?? existing.noun ?? introductions.nounFallback ?? existing.noun,
        label: existing.label ?? mode.label,
        description: existing.description ?? mode.description
      };
    });
  }

  return result;
}

async function buildDictionary(languageId, existingDictionary) {
  const languageCode = languageCodes[languageId];
  if (!languageCode) {
    throw new Error(`Missing translation mapping for language: ${languageId}`);
  }

  const dictionary = cloneDictionary();
  dictionary.language.id = languageId;
  const pack = languagePacks[languageId];
  if (pack?.name) {
    dictionary.language.name = pack.name;
  }

  const entries = flattenDictionary(dictionary);

  const results = new Array(entries.length);
  const concurrency = Math.max(1, Math.min(entries.length, Number.parseInt(process.env.TRANSLATE_CONCURRENCY ?? '5', 10) || 5));
  let cursor = 0;
  let completed = 0;

  async function worker() {
    while (cursor < entries.length) {
      const index = cursor;
      cursor += 1;
      const [pathSegments, value] = entries[index];
      if (!shouldTranslate(pathSegments, value)) {
        results[index] = value;
        completed += 1;
        if ((completed % 25 === 0 || completed === entries.length) && entries.length > 0) {
          console.log(`  [${languageId}] translated ${completed}/${entries.length}`);
        }
        continue;
      }

      try {
        results[index] = await translateText(value, languageCode);
      } catch (error) {
        console.warn(`  [${languageId}] failed to translate ${pathSegments.join('.')}: ${error.message}`);
        results[index] = value;
      } finally {
        completed += 1;
        if ((completed % 25 === 0 || completed === entries.length) && entries.length > 0) {
          console.log(`  [${languageId}] translated ${completed}/${entries.length}`);
        }
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  entries.forEach(([pathSegments], index) => {
    const translatedValue = results[index];
    if (translatedValue !== undefined) {
      setDeepValue(dictionary, pathSegments, translatedValue);
    }
  });

  const merged = applyPackSpecificOverrides(dictionary, languageId);

  if (existingDictionary) {
    const existingEntries = flattenDictionary(existingDictionary);
    existingEntries.forEach(([pathSegments, value]) => {
      if (typeof value === 'string') {
        setDeepValue(merged, pathSegments, value);
      }
    });
  }

  return merged;
}

async function ensureDirectory() {
  await fs.mkdir(dictionariesDir, { recursive: true });
}

async function loadExistingDictionaries() {
  const files = await fs.readdir(dictionariesDir);
  const map = new Map();
  for (const filename of files) {
    if (!filename.endsWith('.json')) continue;
    const filePath = path.join(dictionariesDir, filename);
    try {
      const buffer = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(buffer);
      const languageId = parsed?.language?.id ?? filename.replace(/\.json$/i, '');
      if (typeof languageId === 'string') {
        map.set(languageId, parsed);
      }
    } catch (error) {
      console.warn(`Unable to parse ${filename}: ${error.message}`);
    }
  }
  return map;
}

async function writeDictionary(languageId, dictionary) {
  const filePath = path.join(dictionariesDir, `${languageId}.json`);
  const contents = `${JSON.stringify(dictionary, null, 2)}\n`;
  await fs.writeFile(filePath, contents, 'utf8');
}

async function main() {
  await ensureDirectory();
  const existingDictionaries = await loadExistingDictionaries();

  const requestedLanguages = process.argv.slice(2);
  const idsToProcess = requestedLanguages.length
    ? requestedLanguages
    : Object.keys(languagePacks).filter((id) => id !== 'english');

  for (const languageId of idsToProcess) {
    if (!languageCodes[languageId]) {
      console.warn(`Skipping ${languageId}: missing language code mapping.`);
      continue;
    }

    if (!requestedLanguages.length && existingDictionaries.has(languageId)) {
      console.log(`Skipping ${languageId}: dictionary already exists.`);
      continue;
    }

    try {
      console.log(`Translating dictionary for ${languageId}...`);
      const existingDictionary = existingDictionaries.get(languageId);
      const dictionary = await buildDictionary(languageId, existingDictionary);
      await writeDictionary(languageId, dictionary);
      console.log(`Saved src/i18n/${languageId}.json`);
    } catch (error) {
      console.error(`Failed to translate ${languageId}:`, error.message);
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
