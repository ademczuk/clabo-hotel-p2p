/**
 * P2PNetworkResilience
 *
 * Provides network resilience for the P2P room:
 *  - Heartbeat-based dead peer detection
 *  - Automatic seeder election (lowest peerId wins)
 *  - Reconnection with exponential backoff
 *  - Graceful departure cleanup
 *  - Metrics collection
 */
import * as Y from "yjs";
// @ts-ignore
import { WebrtcProvider } from "y-webrtc";
import { NitroLogger } from "../../../api";

export interface P2PResilienceConfig {
  heartbeatIntervalMs: number;
  heartbeatTimeoutMs: number;
  maxReconnectAttempts: number;
  reconnectBaseDelayMs: number;
  gcIntervalMs: number;
}

const DEFAULT_CONFIG: P2PResilienceConfig = {
  heartbeatIntervalMs: 5000,
  heartbeatTimeoutMs: 15000,
  maxReconnectAttempts: 10,
  reconnectBaseDelayMs: 1000,
  gcIntervalMs: 10000,
};

export class P2PNetworkResilience {
  private _localPeerId: string;
  private _doc: Y.Doc;
  private _userPositions: Y.Map<any>;
  private _provider: WebrtcProvider | null;
  private _roomName: string;
  private _config: P2PResilienceConfig;

  private _heartbeatMap: Y.Map<any>;
  private _heartbeatInterval: any;
  private _gcInterval: any;
  private _heartbeatSeq: number;
  private _reconnectAttempts: number;

  private _onPeerDeathCallbacks: Array<(peerId: string) => void>;
  private _onSeederChangeCallbacks: Array<(seederId: string, isSelf: boolean) => void>;
  private _onReconnectCallbacks: Array<(attempt: number, success: boolean) => void>;

  private _currentSeederId: string | null;
  private _destroyed: boolean;

  // Metrics
  private _metrics: {
    heartbeatsSent: number;
    heartbeatsReceived: number;
    peersDetectedDead: number;
    reconnectAttempts: number;
    seederChanges: number;
  };

  constructor(
    localPeerId: string,
    doc: Y.Doc,
    userPositions: Y.Map<any>,
    provider: WebrtcProvider | null,
    roomName: string,
    config: Partial<P2PResilienceConfig> = {}
  ) {
    this._localPeerId = localPeerId;
    this._doc = doc;
    this._userPositions = userPositions;
    this._provider = provider;
    this._roomName = roomName;
    this._config = { ...DEFAULT_CONFIG, ...config };

    this._heartbeatMap = doc.getMap("peer_heartbeats");
    this._heartbeatInterval = null;
    this._gcInterval = null;
    this._heartbeatSeq = 0;
    this._reconnectAttempts = 0;

    this._onPeerDeathCallbacks = [];
    this._onSeederChangeCallbacks = [];
    this._onReconnectCallbacks = [];

    this._currentSeederId = null;
    this._destroyed = false;

    this._metrics = {
      heartbeatsSent: 0,
      heartbeatsReceived: 0,
      peersDetectedDead: 0,
      reconnectAttempts: 0,
      seederChanges: 0,
    };
  }

  public start(): void {
    if (this._destroyed) return;

    // Start heartbeat
    this._heartbeatInterval = setInterval(() => this.sendHeartbeat(), this._config.heartbeatIntervalMs);
    this.sendHeartbeat();

    // Start garbage collection (dead peer detection)
    this._gcInterval = setInterval(() => this.detectDeadPeers(), this._config.gcIntervalMs);

    // Observe heartbeat changes for seeder election
    this._heartbeatMap.observe(() => {
      if (!this._destroyed) this.electSeeder();
    });

    NitroLogger.log("[P2P Resilience] Started for peer:", this._localPeerId);
  }

  private sendHeartbeat(): void {
    if (this._destroyed || !this._heartbeatMap) return;

    this._heartbeatSeq++;
    this._heartbeatMap.set(this._localPeerId, {
      ts: Date.now(),
      seq: this._heartbeatSeq,
      peerId: this._localPeerId,
    });
    this._metrics.heartbeatsSent++;
  }

  private detectDeadPeers(): void {
    if (this._destroyed || !this._heartbeatMap || !this._userPositions) return;

    const now = Date.now();
    const timeout = this._config.heartbeatTimeoutMs;

    this._heartbeatMap.forEach((value: any, peerId: string) => {
      if (peerId === this._localPeerId) return;

      if (value && value.ts && (now - value.ts) > timeout) {
        NitroLogger.log("[P2P Resilience] Dead peer detected:", peerId, "last heartbeat:", now - value.ts, "ms ago");
        this._metrics.peersDetectedDead++;

        // Clean up the dead peer
        try {
          this._doc.transact(() => {
            this._heartbeatMap.delete(peerId);
            this._userPositions.delete(peerId);
          });
        } catch (e) {
          NitroLogger.error("[P2P Resilience] Error cleaning dead peer:", e);
        }

        // Notify callbacks
        for (const cb of this._onPeerDeathCallbacks) {
          try { cb(peerId); } catch (e) { /* */ }
        }
      }
    });
  }

  private electSeeder(): void {
    if (this._destroyed || !this._heartbeatMap) return;

    // Collect all live peer IDs
    const livePeers: string[] = [];
    this._heartbeatMap.forEach((_value: any, peerId: string) => {
      livePeers.push(peerId);
    });

    if (livePeers.length === 0) return;

    // Lowest peerId wins
    livePeers.sort();
    const newSeeder = livePeers[0];

    if (newSeeder !== this._currentSeederId) {
      this._currentSeederId = newSeeder;
      this._metrics.seederChanges++;

      for (const cb of this._onSeederChangeCallbacks) {
        try { cb(newSeeder, newSeeder === this._localPeerId); } catch (e) { /* */ }
      }
    }
  }

  // ─── Reconnection ──────────────────────────────────────────

  public async attemptReconnect(): Promise<boolean> {
    if (this._destroyed) return false;

    this._reconnectAttempts++;
    this._metrics.reconnectAttempts++;

    if (this._reconnectAttempts > this._config.maxReconnectAttempts) {
      NitroLogger.warn("[P2P Resilience] Max reconnect attempts reached");
      for (const cb of this._onReconnectCallbacks) {
        try { cb(this._reconnectAttempts, false); } catch (e) { /* */ }
      }
      return false;
    }

    const delay = this._config.reconnectBaseDelayMs * Math.pow(2, this._reconnectAttempts - 1);
    NitroLogger.log("[P2P Resilience] Reconnect attempt", this._reconnectAttempts, "in", delay, "ms");

    await new Promise(resolve => setTimeout(resolve, delay));

    if (this._destroyed) return false;

    // Try to reconnect the provider
    if (this._provider) {
      try {
        this._provider.connect();
        this._reconnectAttempts = 0;

        for (const cb of this._onReconnectCallbacks) {
          try { cb(this._reconnectAttempts, true); } catch (e) { /* */ }
        }
        return true;
      } catch (e) {
        NitroLogger.error("[P2P Resilience] Reconnect failed:", e);
        return this.attemptReconnect();
      }
    }

    return false;
  }

  // ─── Event Callbacks ───────────────────────────────────────

  public onPeerDeath(callback: (peerId: string) => void): void {
    this._onPeerDeathCallbacks.push(callback);
  }

  public onSeederChange(callback: (seederId: string, isSelf: boolean) => void): void {
    this._onSeederChangeCallbacks.push(callback);
  }

  public onReconnect(callback: (attempt: number, success: boolean) => void): void {
    this._onReconnectCallbacks.push(callback);
  }

  // ─── Getters ───────────────────────────────────────────────

  public getMetrics(): any {
    return { ...this._metrics };
  }

  public set provider(p: WebrtcProvider | null) {
    this._provider = p;
  }

  public get provider(): WebrtcProvider | null {
    return this._provider;
  }

  // ─── Cleanup ───────────────────────────────────────────────

  public destroy(): void {
    this._destroyed = true;

    if (this._heartbeatInterval) {
      clearInterval(this._heartbeatInterval);
      this._heartbeatInterval = null;
    }

    if (this._gcInterval) {
      clearInterval(this._gcInterval);
      this._gcInterval = null;
    }

    // Remove our heartbeat
    try {
      if (this._heartbeatMap) {
        this._heartbeatMap.delete(this._localPeerId);
      }
    } catch (e) { /* best effort */ }

    this._onPeerDeathCallbacks = [];
    this._onSeederChangeCallbacks = [];
    this._onReconnectCallbacks = [];

    NitroLogger.log("[P2P Resilience] Destroyed");
  }
}
