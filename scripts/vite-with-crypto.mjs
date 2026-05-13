#!/usr/bin/env node
// Polyfill globalThis.crypto.getRandomValues BEFORE Vite's CLI loads.
//
// Some Node environments (notably older Node 18 builds shipped in some
// devcontainers) expose only a partial global crypto object. Vite's
// resolveConfig() calls crypto.getRandomValues() during startup, which
// runs *before* vite.config.js is evaluated — so a polyfill inside
// vite.config.js is too late.
//
// This script must be the entry point used by the npm "dev" / "build"
// scripts; it patches crypto and then dynamically imports the real
// Vite CLI (which reads process.argv as usual).

import { webcrypto } from 'node:crypto';

(function ensureGlobalCrypto() {
  if (!globalThis.crypto) {
    try {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
        writable: true,
        configurable: true,
      });
    } catch {
      globalThis.crypto = webcrypto;
    }
    return;
  }
  if (typeof globalThis.crypto.getRandomValues !== 'function') {
    try {
      globalThis.crypto.getRandomValues = webcrypto.getRandomValues.bind(webcrypto);
    } catch {
      try {
        Object.defineProperty(globalThis, 'crypto', {
          value: webcrypto,
          writable: true,
          configurable: true,
        });
      } catch {
        globalThis.crypto = webcrypto;
      }
    }
  }
})();

import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const viteBin = resolve(here, '..', 'node_modules', 'vite', 'bin', 'vite.js');
await import(pathToFileURL(viteBin).href);
