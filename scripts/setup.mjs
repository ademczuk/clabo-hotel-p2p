#!/usr/bin/env node
/**
 * Clabo Hotel P2P — One-command setup script
 *
 * Copies .example config files if they don't exist,
 * installs signaling server deps, and validates prerequisites.
 */

import { existsSync, copyFileSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const FRONTEND_PUBLIC = resolve(ROOT, "apps/frontend/public");

const log = (msg) => console.log(`[setup] ${msg}`);
const warn = (msg) => console.warn(`[setup] WARNING: ${msg}`);
const ok = (msg) => console.log(`[setup] OK: ${msg}`);

// ── 1. Check Node version ──────────────────────────────────────────
const nodeVersion = parseInt(process.versions.node.split(".")[0], 10);
if (nodeVersion < 18) {
  console.error(`[setup] Node.js >= 18 required (you have ${process.versions.node})`);
  process.exit(1);
}
ok(`Node.js ${process.versions.node}`);

// ── 2. Copy config .example files ──────────────────────────────────
const configs = [
  { src: "renderer-config.json.example", dest: "renderer-config.json" },
  { src: "ui-config.json.example", dest: "ui-config.json" },
];

for (const { src, dest } of configs) {
  const srcPath = resolve(FRONTEND_PUBLIC, src);
  const destPath = resolve(FRONTEND_PUBLIC, dest);

  if (!existsSync(srcPath)) {
    warn(`${src} not found at ${srcPath}`);
    continue;
  }

  if (existsSync(destPath)) {
    ok(`${dest} already exists, skipping`);
  } else {
    copyFileSync(srcPath, destPath);
    ok(`Copied ${src} → ${dest}`);
  }
}

// ── 3. Patch renderer-config.json with a working asset server ──────
const rendererConfigPath = resolve(FRONTEND_PUBLIC, "renderer-config.json");
if (existsSync(rendererConfigPath)) {
  let content = readFileSync(rendererConfigPath, "utf-8");

  // Replace placeholder URLs with a known public Habbo asset server
  // Users should update these to their own asset server for production
  let patched = false;
  if (content.includes('"https://website.com"')) {
    content = content.replace(
      '"https://website.com"',
      '"https://swf.habboclient.net"'
    );
    patched = true;
  }
  if (content.includes('"https://website.com/c_images/"')) {
    content = content.replace(
      '"https://website.com/c_images/"',
      '"https://swf.habboclient.net/c_images/"'
    );
    patched = true;
  }
  if (content.includes('"https://website.com/dcr/hof_furni"')) {
    content = content.replace(
      '"https://website.com/dcr/hof_furni"',
      '"https://swf.habboclient.net/dcr/hof_furni"'
    );
    patched = true;
  }
  if (content.includes('"wss://ws.website.com:2096"')) {
    content = content.replace(
      '"wss://ws.website.com:2096"',
      '"wss://localhost:4444"'
    );
    patched = true;
  }
  if (patched) {
    writeFileSync(rendererConfigPath, content);
    ok("Patched renderer-config.json with default asset server URLs");
    log("  (Edit apps/frontend/public/renderer-config.json to use your own asset server)");
  } else {
    ok("renderer-config.json already has custom URLs");
  }
}

// ── 3b. Patch ui-config.json placeholder URLs ─────────────────────
const uiConfigPath = resolve(FRONTEND_PUBLIC, "ui-config.json");
if (existsSync(uiConfigPath)) {
  let uiContent = readFileSync(uiConfigPath, "utf-8");
  let uiPatched = false;
  if (uiContent.includes('"https://website.com"')) {
    uiContent = uiContent.replace(
      '"https://website.com"',
      '"https://swf.habboclient.net"'
    );
    uiPatched = true;
  }
  if (uiContent.includes('"https://camera.url"')) {
    uiContent = uiContent.replace(
      /"https:\/\/camera\.url"/g,
      '"https://swf.habboclient.net"'
    );
    uiPatched = true;
  }
  if (uiPatched) {
    writeFileSync(uiConfigPath, uiContent);
    ok("Patched ui-config.json placeholder URLs");
  } else {
    ok("ui-config.json already has custom URLs");
  }
}

// ── 4. Install signaling server dependencies ───────────────────────
const signalingDir = resolve(ROOT, "signaling-server");
const signalingModules = resolve(signalingDir, "node_modules");
if (!existsSync(signalingModules)) {
  log("Installing signaling server dependencies...");
  try {
    execSync("npm install", { cwd: signalingDir, stdio: "inherit" });
    ok("Signaling server dependencies installed");
  } catch (e) {
    warn("Failed to install signaling server deps: " + e.message);
  }
} else {
  ok("Signaling server dependencies already installed");
}

// ── 5. Summary ─────────────────────────────────────────────────────
console.log(`
╔══════════════════════════════════════════════════════════╗
║           Clabo Hotel P2P — Setup Complete              ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Quick Start:                                            ║
║    npm run signaling   # Start signaling server (:4444)  ║
║    npm run dev         # Start dev server (:4200)        ║
║                                                          ║
║  Or run both together:                                   ║
║    npm run start       # Signaling + dev server          ║
║                                                          ║
║  Build for production:                                   ║
║    npm run build       # Build renderer + frontend       ║
║                                                          ║
║  Multi-peer testing:                                     ║
║    Open http://localhost:4200 in multiple browser tabs    ║
║    Or from LAN: http://<your-ip>:4200                    ║
║                                                          ║
║  Config files:                                           ║
║    apps/frontend/public/renderer-config.json              ║
║    apps/frontend/public/ui-config.json                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);
