import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config.js';
import { resolve } from 'node:path';
export default mergeConfig(base, defineConfig({
  root: resolve(import.meta.dirname, 'admin'),
  publicDir: resolve(import.meta.dirname, 'public'),
  build: { outDir: resolve(import.meta.dirname, 'dist-admin'), emptyOutDir: true },
  plugins: [{ name: 'admin-source', resolveId(id) {
    if (id === '/src/admin/main.js') return resolve(import.meta.dirname, 'src/admin/main.js');
  } }],
}));
