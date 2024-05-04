import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { internalIpV4 } from 'internal-ip';
import svgr from 'vite-plugin-svgr';
import topLevelAwait from 'vite-plugin-top-level-await';

const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM);

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [svgr(), react(), topLevelAwait()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: mobile ? '0.0.0.0' : false,
    hmr: mobile
      ? {
          protocol: 'ws',
          host: await internalIpV4(),
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ['**/src-tauri/**', '**/designs/**', '**/plugins/**'],
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
}));
