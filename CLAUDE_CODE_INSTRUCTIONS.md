# Build Instructions for Claude Code

This document provides step-by-step instructions for building and running the Clabo Hotel P2P project.

## Prerequisites

Ensure you have:
- Node.js >= 18
- pnpm (install with `npm install -g pnpm`)

## Quick Start (Recommended)

```bash
pnpm install              # Install monorepo dependencies
npm run setup             # Copy configs, patch URLs, install signaling deps
npm run signaling         # Terminal 1: Start signaling server (:4444)
npm run dev               # Terminal 2: Start dev server (:4200)
```

Open `http://localhost:4200` in multiple browser tabs to test multi-peer.

## Available Scripts

| Script | Description |
|---|---|
| `npm run setup` | One-command setup: copies configs, patches URLs, installs signaling deps |
| `npm run dev` | Start Vite dev server with HMR on port 4200 |
| `npm run signaling` | Start the WebSocket signaling server on port 4444 |
| `npm run start` | Start both signaling + dev server together |
| `npm run build` | Build renderer library + frontend for production |
| `npm run build:renderer` | Build just the renderer library |
| `npm run build:frontend` | Build just the frontend app |

## Manual Setup (Step by Step)

### Step 1: Install Dependencies

```bash
pnpm install
```

If you see a warning about `tslib` not found, install it:
```bash
pnpm add tslib
```

If you see a warning about `react-transition-group` not found, install it:
```bash
pnpm add react-transition-group @types/react-transition-group
```

### Step 2: Copy Configuration Files

```bash
cp apps/frontend/public/renderer-config.json.example apps/frontend/public/renderer-config.json
cp apps/frontend/public/ui-config.json.example apps/frontend/public/ui-config.json
```

Edit `renderer-config.json` to point `asset.url` at a working Habbo asset server.

### Step 3: Build the Renderer Library

```bash
npx nx build renderer
```

This compiles the TypeScript renderer library (including all P2P code) using SWC.

### Step 4: Build the Frontend

```bash
npx nx build frontend
```

The production build output will be in `dist/apps/frontend/`.

### Step 5: Start the Signaling Server (for multi-peer)

```bash
cd signaling-server
npm install
node server.mjs &
cd ..
```

The signaling server runs on port 4444 by default.

### Step 6: Run the Development Server

```bash
npx nx serve frontend
```

Navigate to `http://localhost:4200`.

## Important Configuration Files

Before running, ensure these files exist:
- `apps/frontend/public/renderer-config.json` (copy from `.example` if needed)
- `apps/frontend/public/ui-config.json` (copy from `.example` if needed)

## Key Modified Files

These are the files that contain the P2P modifications (compared to the base Nitro repo):

1. **`libs/renderer/src/nitro/Nitro.ts`** — Uses `P2PCommunicationManager` instead of `NitroCommunicationManager`, resolution=1, autoDensity=true, screen dimensions for canvas size
2. **`libs/renderer/src/nitro/communication/p2p/`** — Entire directory is new (P2PLoopbackConnection, P2PCommunicationManager, P2PRoomState, P2PNetworkResilience, index.ts)
3. **`libs/renderer/src/nitro/communication/index.ts`** — Added `export * from "./p2p"`
4. **`apps/frontend/src/hooks/rooms/useRoom.ts`** — Uses `screen.width`/`screen.height` for canvas sizing
5. **`apps/frontend/src/App.tsx`** — Forces `imageRendering=true` (no DPR check)
6. **`signaling-server/`** — Entire directory is new
7. **`package.json`** — Added `yjs`, `y-webrtc`, and `y-indexeddb` dependencies

## Troubleshooting

### "tslib cannot be found" error
```bash
pnpm add tslib
```

### "react-transition-group" import error
```bash
pnpm add react-transition-group @types/react-transition-group
```

### Room appears tiny or offset
Verify that `Nitro.ts` uses `resolution: 1` and `window.screen.width`/`height` (not `innerWidth`/`innerHeight`).

### Clicks don't register on floor tiles
Verify that `P2PRoomState.ts` sends the heightmap with `true` (not `false`) as the scale parameter in the `injectIncomingMessage` call around line 405.

### Peers can't see each other
1. Check that the signaling server is running on port 4444
2. Check browser console for WebRTC errors
3. Ensure both peers are using the same room hash in the URL

### Peers behind corporate/mobile NAT can't connect
Free TURN servers from the Open Relay Project (openrelay.metered.ca) are now included by default in the ICE config in `P2PRoomState.ts`. These provide 20 GB/month of free relay traffic and should handle most NAT traversal scenarios including corporate firewalls (ports 80 and 443 with TLS). For production deployments with sustained traffic, self-host coturn instead.
