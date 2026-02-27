# Build Instructions for Claude Code

This document provides step-by-step instructions for building and running the Clabo Hotel P2P project.

## Prerequisites

Ensure you have:
- Node.js >= 18
- pnpm (install with `npm install -g pnpm`)

## Step 1: Install Dependencies

```bash
cd nitro-base
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

## Step 2: Build the Renderer Library

```bash
npx nx build renderer
```

This compiles the TypeScript renderer library (including all P2P code) using SWC.

## Step 3: Build the Frontend

```bash
npx nx build frontend
```

The production build output will be in `dist/apps/frontend/`.

## Step 4: Start the Signaling Server (for multi-peer)

```bash
cd signaling-server
npm install
node server.mjs &
cd ..
```

The signaling server runs on port 3001 by default.

## Step 5: Run the Development Server

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
7. **`package.json`** — Added `yjs` and `y-webrtc` dependencies

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
1. Check that the signaling server is running on port 3001
2. Check browser console for WebRTC errors
3. Ensure both peers are using the same room hash in the URL
