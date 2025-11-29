import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { webcrypto } from 'node:crypto';

// Polyfill for crypto.getRandomValues in Codespaces/container environments
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}

export default defineConfig({
  plugins: [react()]
});
