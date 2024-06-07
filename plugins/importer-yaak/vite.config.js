import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: 'index',
      formats: ['es'],
    },
    emptyOutDir: true,
    sourcemap: true,
    outDir: resolve(__dirname, 'build'),
  },
});
