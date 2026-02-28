/**
 * Signaling Server for y-webrtc
 *
 * A lightweight WebSocket signaling server that enables WebRTC peer discovery
 * for the P2P Habbo Hotel. Peers connect to this server to exchange SDP offers
 * and ICE candidates, then communicate directly via WebRTC data channels.
 *
 * Protocol: y-webrtc signaling protocol
 * Default port: 4444
 *
 * Usage:
 *   node server.mjs [port]
 *
 * The server is optional — if unavailable, the client falls back to public
 * signaling servers or runs in solo mode.
 */

import http from "http";
import { WebSocketServer } from "ws";

const PORT = parseInt(process.argv[2] || "4444", 10);

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("y-webrtc signaling server\n");
});

const wss = new WebSocketServer({ server });

/** @type {Map<string, Set<WebSocket>>} */
const topics = new Map();

/** @type {Map<WebSocket, Set<string>>} */
const subscribedTopics = new Map();

/**
 * Send a message to a WebSocket client.
 * @param {WebSocket} conn
 * @param {object} message
 */
const send = (conn, message) => {
  try {
    if (conn.readyState === 1) {
      conn.send(JSON.stringify(message));
    }
  } catch (e) {
    // Ignore send errors
  }
};

wss.on("connection", (conn) => {
  const subs = new Set();
  subscribedTopics.set(conn, subs);

  // Track liveness for zombie detection
  conn.isAlive = true;
  conn.on("pong", () => { conn.isAlive = true; });

  let closed = false;

  conn.on("message", (raw) => {
    // Reject oversized messages to prevent memory abuse
    const rawStr = typeof raw === "string" ? raw : raw.toString();
    if (rawStr.length > 65536) return;

    let message;
    try {
      message = JSON.parse(rawStr);
    } catch (e) {
      return;
    }

    if (message && message.type) {
      switch (message.type) {
        case "subscribe": {
          const topicNames = message.topics || [];
          for (const topicName of topicNames) {
            if (typeof topicName !== "string") continue;

            if (!topics.has(topicName)) {
              topics.set(topicName, new Set());
            }
            topics.get(topicName).add(conn);
            subs.add(topicName);
          }
          break;
        }

        case "unsubscribe": {
          const topicNames = message.topics || [];
          for (const topicName of topicNames) {
            if (typeof topicName !== "string") continue;

            const topicSet = topics.get(topicName);
            if (topicSet) {
              topicSet.delete(conn);
              if (topicSet.size === 0) {
                topics.delete(topicName);
              }
            }
            subs.delete(topicName);
          }
          break;
        }

        case "publish": {
          const topic = message.topic;
          if (typeof topic !== "string") break;

          const receivers = topics.get(topic);
          if (receivers) {
            message.clients = receivers.size;
            for (const receiver of receivers) {
              if (receiver !== conn) {
                send(receiver, message);
              }
            }
          }
          break;
        }

        case "ping": {
          send(conn, { type: "pong" });
          break;
        }
      }
    }
  });

  const onClose = () => {
    if (closed) return;
    closed = true;

    subscribedTopics.delete(conn);

    for (const topicName of subs) {
      const topicSet = topics.get(topicName);
      if (topicSet) {
        topicSet.delete(conn);
        if (topicSet.size === 0) {
          topics.delete(topicName);
        }
      }
    }
  };

  conn.on("close", onClose);
  conn.on("error", onClose);
});

// Ping all clients every 30 seconds — terminate unresponsive zombie connections.
// Without this, crashed browsers leave stale entries in the topics map forever.
const PING_INTERVAL_MS = 30000;
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, PING_INTERVAL_MS);

wss.on("close", () => clearInterval(pingInterval));

server.listen(PORT, () => {
  console.log(`[Signaling] y-webrtc signaling server running on port ${PORT}`);
});
