import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      fileName: 'index',
      formats: ['es'],
    },
    outDir: resolve(__dirname, '../../src-tauri/plugins/build/importer-yaak'),
  },
});
