/// <reference types="vitest" />
import react from "@vitejs/plugin-react-swc";
import {existsSync, createReadStream, statSync} from "fs";
import {resolve, extname} from "path";
import {defineConfig, searchForWorkspaceRoot} from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  cacheDir: "../../node_modules/.vite/frontend",

  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "~": resolve(__dirname, "node_modules"),
    },
  },

  server: {
    port: 4200,
    host: "0.0.0.0",
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
    proxy: {
      "/proxy-assets": {
        target: "https://assets.nitrodev.co",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-assets/, ""),
        secure: true,
      },
    },
  },

  preview: {
    port: 4300,
    host: "0.0.0.0",
  },

  plugins: [
    {
      name: "local-assets",
      configureServer(server) {
        // Serve local assets before the CDN proxy intercepts.
        // Maps /proxy-assets/<subpath> → public/<subpath> when a local file exists.
        const publicDir = resolve(__dirname, "public");
        const mimeTypes: Record<string, string> = {
          ".png": "image/png", ".jpg": "image/jpeg", ".gif": "image/gif",
          ".svg": "image/svg+xml", ".webp": "image/webp",
          ".nitro": "application/octet-stream", ".mp3": "audio/mpeg",
        };
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith("/proxy-assets/")) {
            const relPath = req.url.replace("/proxy-assets/", "");
            const localPath = resolve(publicDir, relPath);
            if (existsSync(localPath) && statSync(localPath).isFile()) {
              const ext = extname(localPath).toLowerCase();
              res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");
              res.setHeader("Cache-Control", "public, max-age=86400");
              createReadStream(localPath).pipe(res);
              return;
            }
          }
          next();
        });
      },
    },
    react(),
    viteTsConfigPaths({
      root: "../../",
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: "../../node_modules/.vitest",
    },
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
