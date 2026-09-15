// @ts-ignore
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { createRequire } from "node:module";
import path from "node:path";
import { defineConfig, normalizePath } from "vite-plus";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";
import wasm from "vite-plugin-wasm";

const require = createRequire(import.meta.url);
const cMapsDir = normalizePath(
  path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "cmaps"),
);
const standardFontsDir = normalizePath(
  path.join(path.dirname(require.resolve("pdfjs-dist/package.json")), "standard_fonts"),
);

// The app's own icons, served as the page icon rather than copied into the client:
// the bundled app and the tab should not be able to disagree about what Yaak looks like.
const iconsDir = normalizePath(
  path.join(import.meta.dirname, "../../crates-tauri/yaak-app-client/icons/release"),
);

/**
 * Which host the platform package installs. `web` builds Yaak to run in a plain
 * browser tab, with its own IndexedDB store instead of the Rust engine; anything
 * else builds the desktop app exactly as before.
 */
const yaakTarget = process.env.YAAK_TARGET === "web" ? "web" : "desktop";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  return {
    resolve: {
      alias:
        yaakTarget === "web"
          ? {
              // Resolve the platform package to its browser entry, so a web
              // build never pulls `@tauri-apps/*` into the graph at all. A
              // build-time branch inside the package would not manage that:
              // the dead branch folds away, but the imports it guarded stay.
              "@yaakapp-internal/platform": path.resolve(
                import.meta.dirname,
                "../../packages/platform/src/index.web.ts",
              ),
            }
          : {},
    },
    // The browser host runs the model layer in a worker; that bundle needs the
    // same wasm handling as the main one. Top-level await needs no transform
    // because the build targets esnext.
    worker: {
      format: "es" as const,
      plugins: () => [wasm()],
    },
    plugins: [
      wasm(),
      tanstackRouter({
        target: "react",
        routesDirectory: "./routes",
        generatedRouteTree: "./routeTree.gen.ts",
        autoCodeSplitting: true,
      }),
      svgr(),
      react(),
      viteStaticCopy({
        targets: [
          { src: cMapsDir, dest: "" },
          { src: standardFontsDir, dest: "" },
          // `/favicon.ico` is requested by browsers whether or not anything links to it,
          // so it is served under that name to keep a 404 out of every console.
          { src: `${iconsDir}/icon.ico`, dest: "", rename: "favicon.ico" },
          { src: `${iconsDir}/128x128.png`, dest: "", rename: "icon-128.png" },
        ],
      }),
    ],
    build: {
      target: "esnext",
      sourcemap: true,
      outDir: "../../dist/apps/yaak-client",
      emptyOutDir: true,
      rolldownOptions: {
        output: {
          // Make chunk names readable
          chunkFileNames: "assets/chunk-[name]-[hash].js",
          entryFileNames: "assets/entry-[name]-[hash].js",
          assetFileNames: "assets/asset-[name]-[hash][extname]",
          // Vite-Plus/Rolldown 0.1.20 can emit a stale style-mod export when
          // top-level var rewriting combines with OXC minification.
          topLevelVar: false,
        },
      },
    },
    clearScreen: false,
    server: {
      // `HOST` names the interface, as it does most places: unset leaves Vite on
      // loopback, `0.0.0.0` exposes it for reaching the dev server from another
      // device.
      host: process.env.HOST,
      // Vite refuses a `Host` it does not recognise, which is the right default for a
      // server on loopback that only a browser on this machine should reach. Setting
      // `HOST` is the decision to expose it, and a dev server reached across a network
      // is reached by a name — so the guard has already been answered by then, and
      // keeping it would only reject the hostname the user deliberately came in on.
      allowedHosts: process.env.HOST ? true : undefined,
      port: parseInt(process.env.YAAK_CLIENT_DEV_PORT ?? process.env.YAAK_DEV_PORT ?? "1420", 10),
      strictPort: true,
      // A web dev server is one origin, the way the built app is: `/v1` is passed
      // through to `yaak-web` rather than the tab being told to call it directly.
      // That is one address to open instead of two, no CORS in the loop, and a
      // dev build that sends exactly the way a production build does.
      proxy:
        yaakTarget === "web"
          ? { "/v1": { target: "http://127.0.0.1:9227", changeOrigin: true } }
          : undefined,
    },
    envPrefix: ["VITE_", "TAURI_"],
  };
});
