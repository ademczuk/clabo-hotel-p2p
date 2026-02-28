/**
 * P2PRoomState
 *
 * Manages the shared room state via Yjs + y-webrtc.
 * Each room (identified by URL hash) has its own Y.Doc.
 * The first peer to join becomes the "Seeder" and initializes room data.
 *
 * Integrates P2PNetworkResilience for:
 *  - Heartbeat-based dead peer detection
 *  - Automatic seeder election
 *  - Reconnection with exponential backoff
 *  - Graceful departure cleanup
 *
 * Shared state:
 *  - user_positions: Y.Map<string, P2PUserData>
 *  - room_meta: Y.Map<string, any> (heightmap, room name, etc.)
 *  - chat_messages: Y.Array<ChatMessage>
 *  - peer_heartbeats: Y.Map<string, { ts, seq, peerId }> (managed by resilience)
 */
import * as Y from "yjs";
// @ts-ignore
import { WebrtcProvider } from "y-webrtc";
// @ts-ignore
import { IndexeddbPersistence } from "y-indexeddb";
import { BinaryWriter, NitroLogger } from "../../../api";
import { IncomingHeader } from "../messages/incoming/IncomingHeader";
import { OutgoingHeader } from "../messages/outgoing/OutgoingHeader";
import { P2PNetworkResilience } from "./P2PNetworkResilience";
import type { P2PLoopbackConnection } from "./P2PLoopbackConnection";
import type { IMessageComposer } from "../../../api";

// Default heightmap for a simple room (model "a")
// Model "a" heightmap - the door tile is at (3,5) which is the boundary
// between blocked (x) and open (0) tiles. The door detection algorithm
// looks for tiles where adjacent tiles are blocked on 3 sides.
// We place the door at x=3 by making that column open in the door row.
const DEFAULT_HEIGHTMAP =
  "xxxxxxxxxxxx\r" +
  "xxxxx0000000\r" +
  "xxxxx0000000\r" +
  "xxx000000000\r" +
  "xxx000000000\r" +
  "xx0000000000\r" +
  "xxx000000000\r" +
  "xxx000000000\r" +
  "xxxxx0000000\r" +
  "xxxxx0000000\r" +
  "xxxxx0000000\r" +
  "xxxxx0000000\r" +
  "xxxxx0000000\r" +
  "xxxxx0000000\r" +
  "xxxxx0000000\r" +
  "xxxxx0000000\r";

const DEFAULT_ROOM_ID = 1;
const DEFAULT_ROOM_MODEL = "model_a";
const ENTRY_TILE_X = 2;
const ENTRY_TILE_Y = 5;
const ENTRY_TILE_DIR = 2;

// Default figure strings for avatars
const DEFAULT_FIGURES = [
  "hr-115-42.hd-190-1.ch-215-62.lg-285-91.sh-305-62.ha-1002-62.wa-2001-62",
  "hr-828-61.hd-180-1.ch-255-91.lg-280-110.sh-305-62",
  "hr-890-61.hd-209-1.ch-250-62.lg-270-110.sh-300-91.wa-2001-62",
  "hr-100-61.hd-180-2.ch-3030-62.lg-275-110.sh-295-62",
  "hr-515-61.hd-600-1.ch-635-70.lg-710-62.sh-725-62",
];

function randomFigure(): string {
  return DEFAULT_FIGURES[Math.floor(Math.random() * DEFAULT_FIGURES.length)];
}

function randomName(): string {
  const adjectives = ["Cool", "Happy", "Swift", "Brave", "Chill", "Pixel", "Retro", "Neon"];
  const nouns = ["Habbo", "Guest", "Player", "Dude", "Star", "Hero", "Buddy", "Fox"];
  return adjectives[Math.floor(Math.random() * adjectives.length)] + nouns[Math.floor(Math.random() * nouns.length)] + Math.floor(Math.random() * 999);
}

/** Deterministic unit ID from peerId — ensures all peers agree on the same ID for a given peer */
function deterministicUnitId(peerId: string): number {
  let hash = 0;
  for (let i = 0; i < peerId.length; i++) {
    hash = ((hash << 5) - hash + peerId.charCodeAt(i)) | 0;
  }
  // Use full 32-bit positive range to minimize birthday-problem collisions
  return (Math.abs(hash) % 2147483646) + 1;
}

const MAX_CHAT_MESSAGES = 200;

export interface P2PUserData {
  peerId: string;
  unitId: number;
  userId: number;
  name: string;
  figure: string;
  sex: string;
  motto: string;
  x: number;
  y: number;
  z: number;
  dir: number;
  prevX: number;
  prevY: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  didMove: boolean;
}

export class P2PRoomState {
  private _connection: P2PLoopbackConnection;
  private _doc: Y.Doc;
  private _provider: WebrtcProvider | null;
  private _persistence: IndexeddbPersistence | null;
  private _userPositions: Y.Map<any>;
  private _roomMeta: Y.Map<any>;
  private _chatMessages: Y.Array<any>;
  private _resilience: P2PNetworkResilience | null;

  private _localPeerId: string;
  private _localUserId: number;
  private _localUnitId: number;
  private _localName: string;
  private _localFigure: string;
  private _localSex: string;
  private _localMotto: string;

  private _roomId: number;
  private _roomName: string;
  private _isSeeder: boolean;
  private _isInRoom: boolean;
  private _knownPeers: Map<string, number>; // peerId -> unitId
  private _initialConnectionDone: boolean;
  private _roomEntryInProgress: boolean;
  private _roomModelSent: boolean;
  private _walkQueue: Array<{x: number, y: number}>;
  private _walkTimer: any;
  private _isWalking: boolean;
  private _chatReady: boolean;
  private _firstGuestRoomDone: boolean;

  // Stored observer refs for cleanup
  private _userPositionsObserver: ((event: Y.YMapEvent<any>) => void) | null;
  private _chatMessagesObserver: ((event: Y.YArrayEvent<any>) => void) | null;

  // Deferred signaling timers (stored for cleanup)
  private _signalingConnectTimeout: any;
  private _signalingCheckInterval: any;

  constructor(connection: P2PLoopbackConnection) {
    this._connection = connection;
    this._doc = null;
    this._provider = null;
    this._persistence = null;
    this._userPositions = null;
    this._roomMeta = null;
    this._chatMessages = null;
    this._resilience = null;

    this._localPeerId = "peer_" + Math.random().toString(36).substring(2, 10);
    this._localUserId = Math.floor(Math.random() * 90000) + 10000;
    this._localUnitId = 1;
    this._localName = randomName();
    this._localFigure = randomFigure();
    this._localSex = Math.random() > 0.5 ? "M" : "F";
    this._localMotto = "P2P Habbo";

    this._roomId = DEFAULT_ROOM_ID;
    this._roomName = "p2p-lobby";
    this._isSeeder = false;
    this._isInRoom = false;
    this._knownPeers = new Map();
    this._initialConnectionDone = false;
    this._roomEntryInProgress = false;
    this._roomModelSent = false;
    this._walkQueue = [];
    this._walkTimer = null;
    this._isWalking = false;
    this._chatReady = false;
    this._firstGuestRoomDone = false;
    this._userPositionsObserver = null;
    this._chatMessagesObserver = null;
    this._signalingConnectTimeout = null;
    this._signalingCheckInterval = null;
  }

  // ─── Outgoing Message Router ────────────────────────────────

  public handleOutgoingMessage(header: number, name: string, composer: IMessageComposer<unknown[]>): void {
    const args = composer.getMessageArray();

    switch (header) {
      case OutgoingHeader.SECURITY_TICKET:
        this.handleSSOTicket();
        break;
      case OutgoingHeader.USER_INFO:
        this.sendUserInfo();
        break;
      case OutgoingHeader.ROOM_ENTER:
        this.handleRoomEnter(args[0] as number);
        break;
      case OutgoingHeader.ROOM_MODEL:
        // GetRoomEntryDataMessageComposer → send room model data
        // CRITICAL: Delay to allow React to process the session creation
        // (RoomSessionEvent.CREATED must be handled by useRoom before INITIALIZED fires)
        setTimeout(() => this.sendRoomModelData(), 200);
        break;
      case OutgoingHeader.FURNITURE_ALIASES:
        // FurnitureAliasesComposer → respond with empty aliases
        // Also delay to break the synchronous chain
        setTimeout(() => this.sendFurnitureAliases(), 50);
        break;
      case OutgoingHeader.GO_TO_FLAT:
        // GoToFlatMessageComposer → respond with room enter sequence
        this.handleGoToFlat(args[0] as number);
        break;
      case OutgoingHeader.GET_GUEST_ROOM:
        // GetGuestRoomMessageComposer → respond with room info
        this.handleGetGuestRoom(args[0] as number);
        break;
      case OutgoingHeader.GET_USER_FLAT_CATS:
        this.sendUserFlatCats();
        break;
      case OutgoingHeader.GET_USER_EVENT_CATS:
        this.sendUserEventCats();
        break;
      case OutgoingHeader.UNIT_WALK:
        this.handleLocalWalk(args[0] as number, args[1] as number);
        break;
      case OutgoingHeader.UNIT_CHAT:
      case OutgoingHeader.UNIT_CHAT_SHOUT:
        this.handleLocalChat(args[0] as string, header === OutgoingHeader.UNIT_CHAT_SHOUT ? 1 : 0);
        break;
      case OutgoingHeader.CLIENT_PONG:
      case OutgoingHeader.DESKTOP_VIEW:
      case OutgoingHeader.NAVIGATOR_INIT:
      case OutgoingHeader.NAVIGATOR_SEARCH:
      case OutgoingHeader.UNIT_ACTION:
      case OutgoingHeader.UNIT_DANCE:
      case OutgoingHeader.UNIT_LOOK:
        break; // Silently ignore
      default:
        NitroLogger.log("[P2P] Unhandled outgoing:", header, name);
        break;
    }
  }

  // ─── Authentication ─────────────────────────────────────────

  private handleSSOTicket(): void {
    NitroLogger.log("[P2P] Auto-authenticate");
    // Step 1: Send AUTHENTICATED → triggers NitroCommunicationDemo.onAuthenticatedEvent
    // which dispatches CONNECTION_AUTHENTICATED and sends InfoRetrieveMessageComposer
    this._connection.injectIncomingMessage(IncomingHeader.AUTHENTICATED);
    // After auth, the App.tsx handler calls GetNitroInstance().init()
    // Then MainView mounts and calls connection.onReady()
    // The InfoRetrieveMessageComposer will trigger sendUserInfo()
  }

  /**
   * Called when the client sends InfoRetrieveMessageComposer (OutgoingHeader.USER_INFO)
   * This is the first message after authentication completes.
   */
  private sendUserInfo(): void {
    NitroLogger.log("[P2P] Sending user info and navigator data");

    // USER_INFO response
    this._connection.injectIncomingMessage(
      IncomingHeader.USER_INFO,
      this._localUserId, this._localName, this._localFigure, this._localSex,
      this._localMotto, this._localName, false, 10, 3, 3, false,
      "01-01-2025 00:00:00", false, false
    );

    // USER_PERMISSIONS (needed by navigator and other systems)
    // clubLevel: 2 (HC), securityLevel: 7 (admin), isAmbassador: false
    this._connection.injectIncomingMessage(IncomingHeader.USER_PERMISSIONS, 2, 7, false);

    // AVAILABILITY_STATUS
    this._connection.injectIncomingMessage(IncomingHeader.AVAILABILITY_STATUS, true, false, true);

    // Credits and subscription
    this.sendUserCredits();
    this.sendUserSubscription();

    // The UserInfoEvent handler in useNavigator sends:
    //   GetUserFlatCatsMessageComposer → we handle in sendUserFlatCats()
    //   GetUserEventCatsMessageComposer → we handle in sendUserEventCats()
    // After those responses, we send the navigator data that triggers room entry

    // Schedule navigator data after a short delay to ensure React hooks have processed
    setTimeout(() => this.sendNavigatorData(), 300);
  }

  private sendUserCredits(): void {
    const w = new BinaryWriter();
    w.writeShort(IncomingHeader.USER_CREDITS);
    w.writeString("99999", true);
    this.injectRawPacket(w);
  }

  private sendUserSubscription(): void {
    const w = new BinaryWriter();
    w.writeShort(IncomingHeader.USER_SUBSCRIPTION);
    w.writeString("habbo_club", true);
    w.writeInt(365); w.writeInt(1); w.writeInt(1); w.writeInt(2);
    w.writeByte(1); w.writeByte(1);
    w.writeInt(365); w.writeInt(365); w.writeInt(525600); w.writeInt(0);
    this.injectRawPacket(w);
  }

  // ─── Navigator Data ─────────────────────────────────────────

  private sendUserFlatCats(): void {
    // NAVIGATOR_CATEGORIES (1562) - empty list
    this._connection.injectIncomingMessage(IncomingHeader.NAVIGATOR_CATEGORIES, 0);
  }

  private sendUserEventCats(): void {
    // NAVIGATOR_EVENT_CATEGORIES (3244) - empty list
    this._connection.injectIncomingMessage(IncomingHeader.NAVIGATOR_EVENT_CATEGORIES, 0);
  }

  private sendNavigatorData(): void {
    NitroLogger.log("[P2P] Sending navigator data to trigger room entry");

    // NAVIGATOR_METADATA (3052) - empty contexts
    this._connection.injectIncomingMessage(IncomingHeader.NAVIGATOR_METADATA, 0);

    // NAVIGATOR_SEARCHES (3984) - empty saved searches
    this._connection.injectIncomingMessage(IncomingHeader.NAVIGATOR_SEARCHES, 0);

    // NAVIGATOR_SETTINGS (518) - window position
    this._connection.injectIncomingMessage(IncomingHeader.NAVIGATOR_SETTINGS, 100, 100, 400, 500, false, 0);

    // USER_HOME_ROOM (2875) - THIS triggers room entry!
    // homeRoomId, roomIdToEnter
    // When roomIdToEnter > 0, the navigator calls CreateRoomSession(roomIdToEnter)
    // which creates a RoomSession and sends RoomEnterComposer
    this._connection.injectIncomingMessage(IncomingHeader.USER_HOME_ROOM, this._roomId, this._roomId);
  }

  // ─── Room Entry ─────────────────────────────────────────────

  /**
   * Called when the client sends RoomEnterComposer (OutgoingHeader.ROOM_ENTER)
   * This happens after CreateRoomSession() is called by the navigator.
   */
  private handleRoomEnter(roomId: number): void {
    if (this._roomEntryInProgress) {
      NitroLogger.log("[P2P] Room enter already in progress, skipping duplicate");
      return;
    }
    this._roomEntryInProgress = true;
    this._roomModelSent = false;
    this._roomId = roomId || DEFAULT_ROOM_ID;
    const hash = window.location.hash.replace("#", "");
    this._roomName = hash || "p2p-lobby";

    NitroLogger.log("[P2P] Room enter request for room:", this._roomId, "name:", this._roomName);

    // Step 1: ROOM_ENTER (incoming 758) - empty parser, just signals entry
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_ENTER);

    // Step 2: ROOM_MODEL_NAME (incoming 2031) - triggers RoomReadyMessageEvent
    // The RoomMessageHandler.onRoomReadyMessageEvent will:
    //   - If _initialConnection: send FurnitureAliasesComposer → we handle in sendFurnitureAliases
    //   - Else: send GetRoomEntryDataMessageComposer → we handle in sendRoomModelData
    setTimeout(() => {
      this._connection.injectIncomingMessage(IncomingHeader.ROOM_MODEL_NAME, DEFAULT_ROOM_MODEL, this._roomId);
    }, 100);
  }

  /**
   * Called when the client sends GoToFlatMessageComposer (OutgoingHeader.GO_TO_FLAT)
   * This is sent by the doorbell flow.
   */
  private handleGoToFlat(roomId: number): void {
    NitroLogger.log("[P2P] GoToFlat for room:", roomId);
    this.handleRoomEnter(roomId);
  }

  /**
   * Called when the client sends GetGuestRoomMessageComposer (OutgoingHeader.GET_GUEST_ROOM)
   * Responds with ROOM_INFO (687) containing full room data.
   * When called from TryVisitRoom, roomForward must be true to trigger CreateRoomSession.
   */
  private handleGetGuestRoom(roomId: number): void {
    const isFirstRequest = !this._firstGuestRoomDone;
    this._firstGuestRoomDone = true;
    NitroLogger.log("[P2P] GetGuestRoom for room:", roomId, "isFirst:", isFirstRequest);
    // Only set roomForward=true for the first request (which triggers CreateRoomSession).
    // Subsequent requests are info refreshes and should NOT recreate the session.
    this.sendGuestRoomResult(roomId || this._roomId, false, isFirstRequest);
  }

  /**
   * Called when the client sends FurnitureAliasesComposer (OutgoingHeader.FURNITURE_ALIASES)
   * This is the first thing sent on initial connection after ROOM_MODEL_NAME.
   * After receiving the aliases response, the RoomMessageHandler sends GetRoomEntryDataMessageComposer.
   */
  private sendFurnitureAliases(): void {
    NitroLogger.log("[P2P] Sending furniture aliases (empty)");
    // FURNITURE_ALIASES (1723) - empty map (count = 0)
    this._connection.injectIncomingMessage(IncomingHeader.FURNITURE_ALIASES, 0);
    // After this, the RoomMessageHandler.onFurnitureAliasesEvent will send
    // GetRoomEntryDataMessageComposer which triggers sendRoomModelData()
  }

  /**
   * Called when the client sends GetRoomEntryDataMessageComposer (OutgoingHeader.ROOM_MODEL = 2300)
   * This is the main room data request. We respond with all the room model data.
   */
  public sendRoomModelData(): void {
    if (this._roomModelSent) {
      NitroLogger.log("[P2P] Room model already sent, skipping duplicate");
      return;
    }
    this._roomModelSent = true;
    NitroLogger.log("[P2P] Sending room model data");

    // CRITICAL: Entry tile MUST come BEFORE FloorHeightMap!
    // onRoomModelEvent reads _latestEntryTileEvent to determine the door position.
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_MODEL_DOOR, ENTRY_TILE_X, ENTRY_TILE_Y, ENTRY_TILE_DIR);

    // FloorHeightMap (ROOM_MODEL = 1301) - the main room model
    // scale=true means parser._scale=32 which avoids restrictsScaling=true and restrictedScale=0.5
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_MODEL, true, -1, DEFAULT_HEIGHTMAP);

    // RoomHeightMap (ROOM_HEIGHT_MAP = 2753) - binary tile heights for stacking
    this.sendRoomHeightMap();

    // Blocked tiles (none)
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_MODEL_BLOCKED_TILES, 0);

    // Room thickness / visualization settings (ROOM_THICKNESS = 3547)
    // hideWalls=false, thicknessWall=0, thicknessFloor=0
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_THICKNESS, false, 0, 0);

    // Paint
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_PAINT, "floor", "110");
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_PAINT, "wallpaper", "203");
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_PAINT, "landscape", "1.1");

    // Rights
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_RIGHTS, 4);
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_RIGHTS_OWNER);

    // Score
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_SCORE, 0, true);

    // Room entry info (ROOM_INFO_OWNER = 749)
    this._connection.injectIncomingMessage(IncomingHeader.ROOM_INFO_OWNER, this._roomId, true);

    // Room info (GetGuestRoomResult = ROOM_INFO = 687) with roomEnter=true
    this.sendGuestRoomResult(this._roomId, true, false);

    // Spawn local user and start P2P
    setTimeout(() => {
      this.sendLocalUserUnit();
      this.sendLocalUserStatus();
      this.initializeP2P();
    }, 300);
  }

  private sendRoomHeightMap(): void {
    const rows = DEFAULT_HEIGHTMAP.split("\r").filter(r => r.length > 0);
    const height = rows.length;
    const width = Math.max(...rows.map(r => r.length));
    const totalTiles = width * height;

    const w = new BinaryWriter();
    w.writeShort(IncomingHeader.ROOM_HEIGHT_MAP);
    w.writeInt(width);
    w.writeInt(totalTiles);

    for (let y = 0; y < height; y++) {
      const row = rows[y] || "";
      for (let x = 0; x < width; x++) {
        const char = x < row.length ? row.charAt(x) : "x";
        w.writeShort(char === "x" || char === "X" ? -1 : parseInt(char, 36) * 256);
      }
    }
    this.injectRawPacket(w);
  }

  /**
   * Send the GetGuestRoomResult (ROOM_INFO = 687) message.
   * This is a complex message with RoomDataParser, moderation, and chat settings.
   * @param roomEnter - true when the user has already entered the room
   * @param roomForward - true when this is a forward/redirect (triggers CreateRoomSession)
   */
  private sendGuestRoomResult(roomId: number, roomEnter: boolean = true, roomForward: boolean = false): void {
    const w = new BinaryWriter();
    w.writeShort(IncomingHeader.ROOM_INFO);

    // roomEnter: boolean
    w.writeByte(roomEnter ? 1 : 0);

    // RoomDataParser fields:
    w.writeInt(roomId);                              // roomId
    w.writeString("P2P Room - " + this._roomName, true); // roomName
    w.writeInt(this._roomMeta?.get("seederUserId") || this._localUserId); // ownerId (seeder = owner)
    w.writeString(this._roomMeta?.get("seederName") || this._localName, true); // ownerName
    w.writeInt(0);                                   // doorMode (OPEN_STATE)
    w.writeInt(1);                                   // userCount
    w.writeInt(25);                                  // maxUserCount
    w.writeString("A peer-to-peer room", true);      // description
    w.writeInt(0);                                   // tradeMode
    w.writeInt(0);                                   // score
    w.writeInt(0);                                   // ranking
    w.writeInt(0);                                   // categoryId
    w.writeInt(0);                                   // tags count (no tags)
    w.writeInt(8);                                   // bitMask (SHOWOWNER_BITMASK = 8)

    // roomForward: boolean
    w.writeByte(roomForward ? 1 : 0);
    // staffPick: boolean
    w.writeByte(0);
    // isGroupMember: boolean
    w.writeByte(0);
    // allInRoomMuted: boolean
    w.writeByte(0);

    // RoomModerationSettings: allowMute, allowKick, allowBan
    w.writeInt(0); w.writeInt(0); w.writeInt(0);

    // canMute: boolean
    w.writeByte(1);

    // RoomChatSettings: mode, weight, speed, distance, protection
    w.writeInt(0); w.writeInt(1); w.writeInt(1); w.writeInt(50); w.writeInt(0);

    this.injectRawPacket(w);
  }

  private sendLocalUserUnit(): void {
    this._localUnitId = deterministicUnitId(this._localPeerId);
    this._knownPeers.set(this._localPeerId, this._localUnitId);

    const w = new BinaryWriter();
    w.writeShort(IncomingHeader.UNIT);
    w.writeInt(1); // count
    w.writeInt(this._localUserId);
    w.writeString(this._localName, true);
    w.writeString(this._localMotto, true);
    w.writeString(this._localFigure, true);
    w.writeInt(this._localUnitId);
    w.writeInt(ENTRY_TILE_X); w.writeInt(ENTRY_TILE_Y);
    w.writeString("0.0", true);
    w.writeInt(2); // direction
    w.writeInt(1); // type = user
    w.writeString(this._localSex, true);
    w.writeInt(0); w.writeInt(0);
    w.writeString("", true); w.writeString("", true);
    w.writeInt(0); w.writeByte(0);
    this.injectRawPacket(w);
  }

  private sendLocalUserStatus(): void {
    const w = new BinaryWriter();
    w.writeShort(IncomingHeader.UNIT_STATUS);
    w.writeInt(1);
    w.writeInt(this._localUnitId);
    w.writeInt(ENTRY_TILE_X); w.writeInt(ENTRY_TILE_Y);
    w.writeString("0.0", true);
    w.writeInt(2); w.writeInt(2);
    w.writeString("/flatctrl 4/", true);
    this.injectRawPacket(w);
  }

  // ─── P2P Initialization with Resilience ─────────────────────

  private initializeP2P(): void {
    NitroLogger.log("[P2P] Initializing Yjs P2P for room:", this._roomName);

    this._doc = new Y.Doc();
    this._userPositions = this._doc.getMap("user_positions");
    this._roomMeta = this._doc.getMap("room_meta");
    this._chatMessages = this._doc.getArray("chat_messages");

    // Local persistence — survives page reloads and all-peers-leave scenarios.
    // State is loaded from IndexedDB before the WebRTC provider connects,
    // so the Yjs sync protocol will delta-sync only what's changed.
    try {
      this._persistence = new IndexeddbPersistence("p2p-nitro-" + this._roomName, this._doc);
      this._persistence.on("synced", () => {
        NitroLogger.log("[P2P] Local state loaded from IndexedDB");
      });
    } catch (e) {
      NitroLogger.warn("[P2P] IndexedDB persistence unavailable:", e);
      this._persistence = null;
    }

    // Create WebRTC provider - defer until signaling server is confirmed available
    // For now, run in solo mode to avoid signaling spam
    this._provider = null;
    NitroLogger.log("[P2P] Running in solo mode (signaling deferred)");
    this._initSignalingDeferred();

    // ── Resilience layer ──
    this._resilience = new P2PNetworkResilience(
      this._localPeerId,
      this._doc,
      this._userPositions,
      this._provider,
      this._roomName,
      {
        heartbeatIntervalMs: 5000,
        heartbeatTimeoutMs: 10000,
        maxReconnectAttempts: 10,
        reconnectBaseDelayMs: 1000,
        gcIntervalMs: 5000,
      }
    );

    // When resilience detects a dead peer, remove their avatar
    this._resilience.onPeerDeath((deadPeerId: string) => {
      this.onPeerLeft(deadPeerId);
    });

    // When seeder changes, initialize room meta if needed and track seeder identity.
    // Deferred via queueMicrotask to let any in-flight Yjs sync settle before we
    // write seeder identity — avoids the race where both peers think they're seeder
    // before the provider has synced remote heartbeats.
    this._resilience.onSeederChange((newSeederId: string, isSelf: boolean) => {
      this._isSeeder = isSelf;
      if (isSelf && this._roomMeta) {
        // Initialize room meta if not already set (first seeder or re-election after seeder drop)
        if (!this._roomMeta.get("initialized")) {
          this._roomMeta.set("initialized", true);
          this._roomMeta.set("heightmap", DEFAULT_HEIGHTMAP);
          this._roomMeta.set("roomId", this._roomId);
          this._roomMeta.set("roomName", this._roomName);
        }
        // Defer seeder identity write — re-verify we're still the lowest peerId
        // after any pending Yjs operations complete
        queueMicrotask(() => {
          if (!this._doc || !this._isSeeder) return;
          const hb = this._doc.getMap("peer_heartbeats");
          const peers: string[] = [];
          hb.forEach((_v: any, k: string) => peers.push(k));
          peers.sort();
          if (peers.length === 0 || peers[0] === this._localPeerId) {
            this._roomMeta.set("seederId", this._localPeerId);
            this._roomMeta.set("seederName", this._localName);
            this._roomMeta.set("seederUserId", this._localUserId);
          }
        });
      }
      NitroLogger.log(`[P2P] Seeder changed to ${newSeederId}${isSelf ? " (this peer)" : ""}`);
    });

    // When reconnection happens
    this._resilience.onReconnect((attempt: number, success: boolean) => {
      if (success) {
        NitroLogger.log("[P2P] Reconnected successfully");
        // Re-announce ourselves
        this.announceLocalUser();
      } else {
        NitroLogger.warn("[P2P] Reconnection failed after", attempt, "attempts. Solo mode.");
      }
    });

    this._resilience.start();

    // Set local user position in shared state
    this.announceLocalUser();

    // Seeder election is handled entirely by P2PNetworkResilience (lowest peerId wins).
    // The onSeederChange callback above initializes room_meta when this peer becomes seeder.

    // Listen for changes to user_positions (store ref for cleanup)
    this._userPositionsObserver = (event: Y.YMapEvent<any>) => {
      event.changes.keys.forEach((change, key) => {
        if (key === this._localPeerId) return;

        if (change.action === "add") {
          this.onPeerJoined(key);
        } else if (change.action === "update") {
          this.onPeerMoved(key);
        } else if (change.action === "delete") {
          this.onPeerLeft(key);
        }
      });
    };
    this._userPositions.observe(this._userPositionsObserver);

    // Listen for chat messages (with replay protection)
    // Gate on _chatReady to skip the initial Yjs sync replay of existing messages.
    // In connected mode, _chatReady is set by the provider 'sync' event (see _initSignalingDeferred).
    // This timeout is the solo-mode fallback (no provider will ever connect).
    setTimeout(() => { if (!this._chatReady) { this._chatReady = true; } }, 3000);

    this._chatMessagesObserver = (event: Y.YArrayEvent<any>) => {
      if (!this._chatReady) return;
      if (event.changes.added.size > 0) {
        event.changes.added.forEach((item) => {
          const content = item.content.getContent();
          for (const msg of content) {
            if (msg && msg.peerId !== this._localPeerId) {
              this.onPeerChat(msg);
            }
          }
        });
      }
    };
    this._chatMessages.observe(this._chatMessagesObserver);

    // Handle existing peers already in the room
    this._userPositions.forEach((_value: any, key: string) => {
      if (key !== this._localPeerId) {
        this.onPeerJoined(key);
      }
    });

    this._isInRoom = true;

    // Register page unload cleanup
    window.addEventListener("beforeunload", this._handleBeforeUnload);
    window.addEventListener("pagehide", this._handleBeforeUnload);

    // Expose metrics globally for debugging / testing
    (window as any).__p2pMetrics = () => this._resilience?.getMetrics();
    (window as any).__p2pState = () => ({
      localPeerId: this._localPeerId,
      localUnitId: this._localUnitId,
      isSeeder: this._isSeeder,
      isInRoom: this._isInRoom,
      knownPeers: Array.from(this._knownPeers.entries()),
      roomName: this._roomName,
    });
  }

  /**
   * Announce local user in the shared Y.Map
   */
  private announceLocalUser(): void {
    if (!this._userPositions) return;
    this._userPositions.set(this._localPeerId, {
      peerId: this._localPeerId,
      unitId: this._localUnitId,
      userId: this._localUserId,
      name: this._localName,
      figure: this._localFigure,
      sex: this._localSex,
      motto: this._localMotto,
      x: ENTRY_TILE_X,
      y: ENTRY_TILE_Y,
      z: 0,
      dir: 2,
      prevX: ENTRY_TILE_X,
      prevY: ENTRY_TILE_Y,
      targetX: ENTRY_TILE_X,
      targetY: ENTRY_TILE_Y,
      targetZ: 0,
      didMove: false,
    });
  }

  // ─── Local User Actions ─────────────────────────────────────

  /**
   * BFS pathfinding on the heightmap grid.
   * Returns array of {x, y} steps from start to end (excluding start).
   */
  private findPath(startX: number, startY: number, endX: number, endY: number): Array<{x: number, y: number}> {
    const heightmap: string = this._roomMeta?.get("heightmap") || DEFAULT_HEIGHTMAP;
    const rows = heightmap.split("\r").filter((r: string) => r.length > 0);
    const maxY = rows.length;
    const maxX = rows[0]?.length || 0;

    const isWalkable = (tx: number, ty: number): boolean => {
      if (tx < 0 || ty < 0 || ty >= maxY || tx >= maxX) return false;
      const ch = rows[ty]?.[tx];
      return ch !== undefined && ch !== 'x';
    };

    if (!isWalkable(endX, endY)) return [];

    const dirs = [
      {dx: 0, dy: -1}, {dx: 1, dy: -1}, {dx: 1, dy: 0}, {dx: 1, dy: 1},
      {dx: 0, dy: 1}, {dx: -1, dy: 1}, {dx: -1, dy: 0}, {dx: -1, dy: -1},
    ];

    const visited = new Set<string>();
    const queue: Array<{x: number, y: number, path: Array<{x: number, y: number}>}> = [];
    visited.add(`${startX},${startY}`);
    queue.push({x: startX, y: startY, path: []});

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.x === endX && current.y === endY) return current.path;

      for (const d of dirs) {
        const nx = current.x + d.dx;
        const ny = current.y + d.dy;
        const key = `${nx},${ny}`;
        if (!visited.has(key) && isWalkable(nx, ny)) {
          if (d.dx !== 0 && d.dy !== 0) {
            if (!isWalkable(current.x + d.dx, current.y) || !isWalkable(current.x, current.y + d.dy)) continue;
          }
          visited.add(key);
          queue.push({x: nx, y: ny, path: [...current.path, {x: nx, y: ny}]});
        }
      }
    }
    return [];
  }

  private calcDirection(fromX: number, fromY: number, toX: number, toY: number): number {
    const dx = toX - fromX;
    const dy = toY - fromY;
    if (dx === 0 && dy < 0) return 0;
    if (dx > 0 && dy < 0) return 1;
    if (dx > 0 && dy === 0) return 2;
    if (dx > 0 && dy > 0) return 3;
    if (dx === 0 && dy > 0) return 4;
    if (dx < 0 && dy > 0) return 5;
    if (dx < 0 && dy === 0) return 6;
    if (dx < 0 && dy < 0) return 7;
    return 2;
  }

  /** Standard Habbo walk step interval in ms (matches original client timing) */
  private static readonly WALK_STEP_MS = 400;

  private handleLocalWalk(x: number, y: number): void {
    if (!this._isInRoom) return;
    const currentData = this._userPositions?.get(this._localPeerId);
    if (!currentData) return;

    // Cancel any existing walk
    if (this._walkTimer) {
      clearInterval(this._walkTimer);
      this._walkTimer = null;
    }

    const startX = currentData.x;
    const startY = currentData.y;
    if (startX === x && startY === y) return;

    const path = this.findPath(startX, startY, x, y);
    if (path.length === 0) return;

    this._walkQueue = path;
    this._isWalking = true;

    const sendStandStatus = (data: any) => {
      const iw = new BinaryWriter();
      iw.writeShort(IncomingHeader.UNIT_STATUS);
      iw.writeInt(1);
      iw.writeInt(this._localUnitId);
      iw.writeInt(data.x); iw.writeInt(data.y);
      iw.writeString("0.0", true);
      iw.writeInt(data.dir); iw.writeInt(data.dir);
      iw.writeString("/", true);
      this.injectRawPacket(iw);
    };

    const processStep = () => {
      if (this._walkQueue.length === 0) {
        this._isWalking = false;
        if (this._walkTimer) { clearInterval(this._walkTimer); this._walkTimer = null; }
        const data = this._userPositions?.get(this._localPeerId);
        if (data) {
          sendStandStatus(data);
          // Update shared state to reflect standing
          this._userPositions.set(this._localPeerId, {
            ...data, didMove: false,
          });
        }
        return;
      }

      const step = this._walkQueue.shift()!;
      const data = this._userPositions?.get(this._localPeerId);
      if (!data) return;

      const oldX = data.x;
      const oldY = data.y;
      const dir = this.calcDirection(oldX, oldY, step.x, step.y);

      // Send movement status with /mv for walk animation
      const w = new BinaryWriter();
      w.writeShort(IncomingHeader.UNIT_STATUS);
      w.writeInt(1);
      w.writeInt(this._localUnitId);
      w.writeInt(oldX); w.writeInt(oldY);
      w.writeString("0.0", true);
      w.writeInt(dir); w.writeInt(dir);
      w.writeString("/mv " + step.x + "," + step.y + ",0.0/", true);
      this.injectRawPacket(w);

      // Update shared state with prevX/prevY so remote peers can animate the walk
      this._userPositions.set(this._localPeerId, {
        ...data, x: step.x, y: step.y, z: 0, dir,
        prevX: oldX, prevY: oldY,
        targetX: x, targetY: y, targetZ: 0,
        didMove: this._walkQueue.length > 0,
      });
    };

    processStep();
    if (this._walkQueue.length > 0) {
      this._walkTimer = setInterval(processStep, P2PRoomState.WALK_STEP_MS);
    }
  }

  private handleLocalChat(message: string, type: number): void {
    if (!this._isInRoom) return;

    const chatHeader = type === 1 ? IncomingHeader.UNIT_CHAT_SHOUT : IncomingHeader.UNIT_CHAT;
    const w = new BinaryWriter();
    w.writeShort(chatHeader);
    w.writeInt(this._localUnitId);
    w.writeString(message, true);
    w.writeInt(0); w.writeInt(0); w.writeInt(0); w.writeInt(0);
    this.injectRawPacket(w);

    if (this._chatMessages) {
      this._chatMessages.push([{
        peerId: this._localPeerId, unitId: this._localUnitId,
        userId: this._localUserId, name: this._localName,
        message, type, timestamp: Date.now(),
      }]);

      // Evict old messages to prevent unbounded growth (seeder-only to avoid double-delete race)
      if (this._isSeeder && this._chatMessages.length > MAX_CHAT_MESSAGES) {
        this._doc.transact(() => {
          const excess = this._chatMessages.length - MAX_CHAT_MESSAGES;
          if (excess > 0) this._chatMessages.delete(0, excess);
        });
      }
    }
  }

  // ─── Peer Events ────────────────────────────────────────────

  private onPeerJoined(peerId: string): void {
    const data = this._userPositions?.get(peerId);
    if (!data) return;

    // Don't re-add if already known
    if (this._knownPeers.has(peerId)) return;

    NitroLogger.log("[P2P] Peer joined:", peerId, data.name);

    let unitId = data.unitId || deterministicUnitId(peerId);
    // Collision guard: if another peer already has this unitId, bump until free
    const usedIds = new Set(this._knownPeers.values());
    while (usedIds.has(unitId)) {
      unitId = (unitId % 2147483646) + 1;
    }
    this._knownPeers.set(peerId, unitId);

    const w = new BinaryWriter();
    w.writeShort(IncomingHeader.UNIT);
    w.writeInt(1);
    w.writeInt(data.userId || unitId);
    w.writeString(data.name || "Peer", true);
    w.writeString(data.motto || "", true);
    w.writeString(data.figure || randomFigure(), true);
    w.writeInt(unitId);
    w.writeInt(data.x || ENTRY_TILE_X);
    w.writeInt(data.y || ENTRY_TILE_Y);
    w.writeString((data.z || 0).toString(), true);
    w.writeInt(data.dir || 2);
    w.writeInt(1); // type = user
    w.writeString(data.sex || "M", true);
    w.writeInt(0); w.writeInt(0);
    w.writeString("", true); w.writeString("", true);
    w.writeInt(0); w.writeByte(0);
    this.injectRawPacket(w);

    // Initial status
    const sw = new BinaryWriter();
    sw.writeShort(IncomingHeader.UNIT_STATUS);
    sw.writeInt(1);
    sw.writeInt(unitId);
    sw.writeInt(data.x || ENTRY_TILE_X);
    sw.writeInt(data.y || ENTRY_TILE_Y);
    sw.writeString((data.z || 0).toString(), true);
    sw.writeInt(data.dir || 2); sw.writeInt(data.dir || 2);
    sw.writeString("/", true);
    this.injectRawPacket(sw);
  }

  private onPeerMoved(peerId: string): void {
    const data = this._userPositions?.get(peerId);
    if (!data) return;

    const unitId = this._knownPeers.get(peerId);
    if (unitId === undefined) {
      this.onPeerJoined(peerId);
      return;
    }

    const w = new BinaryWriter();
    w.writeShort(IncomingHeader.UNIT_STATUS);
    w.writeInt(1);
    w.writeInt(unitId);

    if (data.didMove) {
      // For walking: send the PREVIOUS position with /mv to the CURRENT position
      // The Habbo client expects: current pos = where avatar IS, /mv = where avatar is GOING
      // Since the shared state already has x,y updated to the new step position,
      // we use prevX,prevY (stored in the state) as the display position
      const prevX = data.prevX !== undefined ? data.prevX : data.x;
      const prevY = data.prevY !== undefined ? data.prevY : data.y;
      w.writeInt(prevX); w.writeInt(prevY);
      w.writeString((data.z || 0).toString(), true);
      w.writeInt(data.dir || 2); w.writeInt(data.dir || 2);
      w.writeString("/mv " + data.x + "," + data.y + "," + (data.z || 0) + "/", true);
    } else {
      // Standing still
      w.writeInt(data.x); w.writeInt(data.y);
      w.writeString((data.z || 0).toString(), true);
      w.writeInt(data.dir || 2); w.writeInt(data.dir || 2);
      w.writeString("/", true);
    }
    this.injectRawPacket(w);
  }

  private onPeerLeft(peerId: string): void {
    const unitId = this._knownPeers.get(peerId);
    if (unitId === undefined) return;

    NitroLogger.log("[P2P] Peer left:", peerId);
    this._connection.injectIncomingMessage(IncomingHeader.UNIT_REMOVE, unitId.toString());
    this._knownPeers.delete(peerId);
  }

  private onPeerChat(msg: any): void {
    const unitId = this._knownPeers.get(msg.peerId);
    if (unitId === undefined) return;

    const chatHeader = msg.type === 1 ? IncomingHeader.UNIT_CHAT_SHOUT : IncomingHeader.UNIT_CHAT;
    const w = new BinaryWriter();
    w.writeShort(chatHeader);
    w.writeInt(unitId);
    w.writeString(msg.message, true);
    w.writeInt(0); w.writeInt(0); w.writeInt(0); w.writeInt(0);
    this.injectRawPacket(w);
  }

  // ─── Packet Helpers ─────────────────────────────────────────

  private injectRawPacket(writer: BinaryWriter): void {
    const innerBuffer = writer.getBuffer();
    const outerWriter = new BinaryWriter();
    outerWriter.writeInt(innerBuffer.byteLength);
    outerWriter.writeBytes(innerBuffer);
    const packet = outerWriter.getBuffer();
    this._connection.dataBuffer = this.concatArrayBuffers(this._connection.dataBuffer, packet);
    this._connection.processReceivedData();
  }

  /** Concatenate two ArrayBuffers */
  private concatArrayBuffers(a: ArrayBuffer, b: ArrayBuffer): ArrayBuffer {
    const result = new Uint8Array(a.byteLength + b.byteLength);
    result.set(new Uint8Array(a), 0);
    result.set(new Uint8Array(b), a.byteLength);
    return result.buffer;
  }

  // ─── Lifecycle ──────────────────────────────────────────────

  public destroy(): void {
    this._isInRoom = false;

    // Cancel any active walk
    if (this._walkTimer) {
      clearInterval(this._walkTimer);
      this._walkTimer = null;
    }
    this._isWalking = false;
    this._walkQueue = [];

    // Clear deferred signaling timers
    if (this._signalingConnectTimeout) {
      clearTimeout(this._signalingConnectTimeout);
      this._signalingConnectTimeout = null;
    }
    if (this._signalingCheckInterval) {
      clearInterval(this._signalingCheckInterval);
      this._signalingCheckInterval = null;
    }

    // Remove page unload listener
    window.removeEventListener("beforeunload", this._handleBeforeUnload);
    window.removeEventListener("pagehide", this._handleBeforeUnload);

    // Unregister Yjs observers before destroying doc
    if (this._userPositions && this._userPositionsObserver) {
      try { this._userPositions.unobserve(this._userPositionsObserver); } catch (e) { /* */ }
      this._userPositionsObserver = null;
    }
    if (this._chatMessages && this._chatMessagesObserver) {
      try { this._chatMessages.unobserve(this._chatMessagesObserver); } catch (e) { /* */ }
      this._chatMessagesObserver = null;
    }

    if (this._resilience) {
      this._resilience.destroy();
      this._resilience = null;
    }
    if (this._userPositions) {
      try { this._userPositions.delete(this._localPeerId); } catch (e) { /* */ }
    }
    if (this._provider) {
      this._provider.destroy();
      this._provider = null;
    }
    if (this._persistence) {
      this._persistence.destroy();
      this._persistence = null;
    }
    if (this._doc) {
      this._doc.destroy();
      this._doc = null;
    }

    // Clear debug refs to allow GC
    if (typeof window !== 'undefined') {
      delete (window as any).__p2pMetrics;
      delete (window as any).__p2pState;
    }
  }

  private _handleBeforeUnload = (): void => {
    // Best-effort cleanup on page unload
    try {
      if (this._doc && this._userPositions) {
        this._doc.transact(() => {
          this._userPositions.delete(this._localPeerId);
        });
      }
    } catch (e) { /* best effort */ }
  };

  /**
   * Deferred signaling: try to connect to a signaling server in the background.
   * Prioritizes local signaling server, then falls back to public servers.
   * If a server responds, create the WebRTC provider. Otherwise, stay in solo mode.
   */
  private _initSignalingDeferred(): void {
    // Determine local signaling server URL based on current page location
    const loc = typeof window !== 'undefined' ? window.location : null;
    const localWsProtocol = loc?.protocol === 'https:' ? 'wss:' : 'ws:';
    const localHost = loc?.hostname || 'localhost';
    const localSignaling = `${localWsProtocol}//${localHost}:4444`;

    const signalingServers = [
      localSignaling,
      "wss://signaling.yjs.dev",
    ];

    // Try each server sequentially - create provider directly (no wasteful test connection)
    let connected = false;
    const tryServer = (index: number) => {
      if (connected || index >= signalingServers.length || !this._doc) return;
      const server = signalingServers[index];
      NitroLogger.log("[P2P] Trying signaling server:", server);

      try {
        this._provider = new WebrtcProvider("p2p-nitro-" + this._roomName, this._doc, {
          signaling: [server],
          maxConns: 20,
          peerOpts: {
            config: {
              iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                // Add TURN server here for NAT traversal in production:
                // { urls: "turn:your-turn-server:3478", username: "user", credential: "pass" },
              ],
            },
          },
        });

        // Give the provider a few seconds to connect, then check
        this._signalingConnectTimeout = setTimeout(() => {
          if (!connected && this._provider) {
            // Check if any signaling connection succeeded
            let anyConnected = false;
            if (this._provider.signalingConns) {
              for (const conn of this._provider.signalingConns) {
                if (conn && conn.connected) { anyConnected = true; break; }
              }
            }
            if (!anyConnected) {
              NitroLogger.log("[P2P] Signaling server timed out:", server);
              try { this._provider.destroy(); } catch(e) {}
              this._provider = null;
              tryServer(index + 1);
            }
          }
        }, 5000);

        // Listen for successful connection
        if (this._provider.signalingConns) {
          this._signalingCheckInterval = setInterval(() => {
            if (connected) { clearInterval(this._signalingCheckInterval); this._signalingCheckInterval = null; return; }
            if (!this._provider?.signalingConns) { clearInterval(this._signalingCheckInterval); this._signalingCheckInterval = null; return; }
            for (const conn of this._provider.signalingConns) {
              if (conn && conn.connected) {
                connected = true;
                clearTimeout(this._signalingConnectTimeout); this._signalingConnectTimeout = null;
                clearInterval(this._signalingCheckInterval); this._signalingCheckInterval = null;
                NitroLogger.log("[P2P] Signaling server connected:", server);
                // Update resilience with the provider and start connection monitoring
                if (this._resilience) {
                  this._resilience.provider = this._provider;
                  this._resilience.monitorConnection();
                  // Re-send heartbeat immediately so remote peers don't GC us
                  // (initial heartbeat may be stale if signaling took >15s)
                  this._resilience.refreshHeartbeat();
                }
                // Enable chat after Yjs sync completes (not on a fixed timer)
                if (this._provider) {
                  this._provider.on('synced', (isSynced: { synced: boolean }) => {
                    if (!this._chatReady) {
                      this._chatReady = true;
                      NitroLogger.log("[P2P] Initial sync complete, chat ready");
                    }
                  });
                }
                return;
              }
            }
          }, 500);
        }
      } catch(e) {
        NitroLogger.error("[P2P] Failed to create provider for", server, e);
        this._provider = null;
        tryServer(index + 1);
      }
    };
    tryServer(0);
  }

  // ─── Getters ────────────────────────────────────────────────

  public get localPeerId(): string { return this._localPeerId; }
  public get localUserId(): number { return this._localUserId; }
  public get localUnitId(): number { return this._localUnitId; }
  public get isSeeder(): boolean { return this._isSeeder; }
  public get resilience(): P2PNetworkResilience | null { return this._resilience; }
}
