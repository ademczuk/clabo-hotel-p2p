/**
 * y-websocket Relay Server
 *
 * Bridges headless Node.js peers (like The Hermit bot) with browser clients.
 * Browser clients connect via both y-webrtc (P2P) and y-websocket (this server).
 * The bot connects via y-websocket only.
 *
 * Yjs handles deduplication — browsers get updates from both providers
 * without processing them twice.
 *
 * Default port: 4445
 *
 * Usage:
 *   node ws-server.mjs [port]
 */

import { createServer } from "http";
import { WebSocketServer } from "ws";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { setupWSConnection } = require("y-websocket/bin/utils");

const PORT = parseInt(process.argv[2] || "4445", 10);

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("y-websocket relay server\n");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[WS Relay] y-websocket server running on ws://0.0.0.0:${PORT}`);
});
