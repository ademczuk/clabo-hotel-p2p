/**
 * Pre-defined furniture layouts for P2P rooms.
 *
 * Each room model is assigned a themed furniture layout so rooms
 * feel furnished out-of-the-box. Furniture is static — every client
 * entering the same model sees the same items.
 *
 * Sprite IDs reference FurnitureData.json entries; .nitro bundles
 * are loaded from the configured asset server.
 */

// ── Sprite IDs (from FurnitureData.json) ──────────────────────────

const CHAIR_POLYFON   = 18;   // Dining Chair 1x1, sit
const CHAIR_SILO      = 26;   // Gray Dining Chair 1x1, sit
const SOFA_SILO       = 28;   // Gray Sofa 2x1, sit
const TABLE_POLY_SM   = 17;   // Small Coffee Table 2x2
const TABLE_NORJA_MED = 20;   // Beige Coffee Table 2x2
const SHELVES_NORJA   = 13;   // Beige Bookcase 1x1
const SHELVES_POLYFON = 14;   // Bookcase 2x1
const LAMP_ARMAS      = 57;   // Table Lamp 1x1
const LAMP_BASIC      = 199;  // Pura Lamp 1x1
const FIREPLACE_ARMAS = 56;   // Fireplace 2x1
const FIREPLACE_POLY  = 62;   // Aquamarine Fireplace 2x1
const CARPET_STD      = 59;   // Floor Rug 3x5
const DOORMAT_LOVE    = 32;   // Doormat 1x1
const PIZZA           = 122;  // Pizza Box 1x1
const BAR_POLYFON     = 127;  // Mini-bar 1x1
const BOTTLE          = 129;  // Spinning Bottle 1x1
const EDICE           = 239;  // Holodice 1x1
const BED_POLYFON     = 41;   // Double Bed 2x3
const DOORMAT_PLAIN   = 33;   // Doormat 1x1
const TABLE_PLASTO_RND = 23;  // Round Dining Table 2x2

// Wall sprite IDs (from wallitemtypes)
const WALL_LAMP       = 4003; // Retro Wall Lamp
const WALL_TORCH      = 4005; // Gothic Torch
const WALL_MIRROR     = 4007; // Romantique Wall Mirror

// ── Types ──────────────────────────────────────────────────────────

export interface FloorItem {
  spriteId: number;
  x: number;
  y: number;
  z: number;
  dir: number;        // 0,2,4,6
  state?: string;
  stackHeight?: number;
}

export interface WallItem {
  spriteId: number;
  location: string;   // ":w=X,Y l=X,Y r|l"
  state?: string;
}

export interface RoomFurnitureLayout {
  floor: FloorItem[];
  wall: WallItem[];
}

// ── Themed Layout Templates ────────────────────────────────────────

/** Cosy lounge: sofas, coffee table, rug, fireplace, lamps */
function lounge(ox: number, oy: number): RoomFurnitureLayout {
  return {
    floor: [
      { spriteId: SOFA_SILO, x: ox + 1, y: oy + 1, z: 0, dir: 2 },
      { spriteId: SOFA_SILO, x: ox + 1, y: oy + 4, z: 0, dir: 6 },
      { spriteId: TABLE_NORJA_MED, x: ox + 1, y: oy + 2, z: 0, dir: 0 },
      { spriteId: LAMP_ARMAS, x: ox, y: oy + 1, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: ox, y: oy + 4, z: 0, dir: 2 },
      { spriteId: FIREPLACE_ARMAS, x: ox + 4, y: oy, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: ox + 3, y: oy + 2, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: ox + 5, y: oy + 3, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: ox + 5, y: oy + 4, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=2,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=6,0 l=0,24 r" },
    ],
  };
}

/** Cafe: tables with chairs, mini-bar, pizza */
function cafe(ox: number, oy: number): RoomFurnitureLayout {
  return {
    floor: [
      { spriteId: TABLE_POLY_SM, x: ox + 1, y: oy + 1, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: ox, y: oy + 1, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: ox, y: oy + 2, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: ox + 3, y: oy + 1, z: 0, dir: 6 },
      { spriteId: CHAIR_POLYFON, x: ox + 3, y: oy + 2, z: 0, dir: 6 },
      { spriteId: TABLE_PLASTO_RND, x: ox + 1, y: oy + 5, z: 0, dir: 0 },
      { spriteId: CHAIR_SILO, x: ox, y: oy + 5, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: ox + 3, y: oy + 5, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: ox + 5, y: oy, z: 0, dir: 2 },
      { spriteId: PIZZA, x: ox + 2, y: oy + 2, z: 0.7, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=1,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
    ],
  };
}

/** Bedroom: bed, bookcase, lamp, rug */
function bedroom(ox: number, oy: number): RoomFurnitureLayout {
  return {
    floor: [
      { spriteId: BED_POLYFON, x: ox + 1, y: oy, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: ox, y: oy, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: ox + 4, y: oy, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: ox + 4, y: oy + 2, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: ox + 4, y: oy + 4, z: 0, dir: 4 },
      { spriteId: DOORMAT_PLAIN, x: ox, y: oy + 4, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_MIRROR, location: ":w=4,0 l=0,20 r" },
      { spriteId: WALL_LAMP, location: ":w=1,0 l=0,24 r" },
    ],
  };
}

/** Game room: dice, bottle, chairs around a table */
function gameRoom(ox: number, oy: number): RoomFurnitureLayout {
  return {
    floor: [
      { spriteId: TABLE_POLY_SM, x: ox + 2, y: oy + 2, z: 0, dir: 0 },
      { spriteId: EDICE, x: ox + 2, y: oy + 2, z: 0.7, dir: 0 },
      { spriteId: BOTTLE, x: ox + 3, y: oy + 3, z: 0.7, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: ox + 1, y: oy + 2, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: ox + 1, y: oy + 3, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: ox + 4, y: oy + 2, z: 0, dir: 6 },
      { spriteId: CHAIR_POLYFON, x: ox + 4, y: oy + 3, z: 0, dir: 6 },
      { spriteId: CHAIR_POLYFON, x: ox + 2, y: oy + 1, z: 0, dir: 4 },
      { spriteId: CHAIR_POLYFON, x: ox + 3, y: oy + 4, z: 0, dir: 0 },
      { spriteId: LAMP_ARMAS, x: ox, y: oy, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_TORCH, location: ":w=3,0 l=0,20 r" },
    ],
  };
}

/** Library: bookcases along wall, reading chairs, lamps */
function library(ox: number, oy: number): RoomFurnitureLayout {
  return {
    floor: [
      { spriteId: SHELVES_POLYFON, x: ox + 1, y: oy, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: ox + 3, y: oy, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: ox + 5, y: oy, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: ox + 6, y: oy, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: ox + 2, y: oy + 3, z: 0, dir: 4 },
      { spriteId: CHAIR_SILO, x: ox + 4, y: oy + 3, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: ox + 2, y: oy + 4, z: 0, dir: 0 },
      { spriteId: LAMP_BASIC, x: ox + 3, y: oy + 4, z: 0.7, dir: 0 },
      { spriteId: LAMP_ARMAS, x: ox, y: oy + 2, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=2,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
    ],
  };
}

/** Lobby: minimal — doormat, a few chairs, lamp */
function lobby(ox: number, oy: number): RoomFurnitureLayout {
  return {
    floor: [
      { spriteId: DOORMAT_LOVE, x: ox, y: oy, z: 0, dir: 0 },
      { spriteId: CHAIR_SILO, x: ox + 2, y: oy + 1, z: 0, dir: 4 },
      { spriteId: CHAIR_SILO, x: ox + 2, y: oy + 3, z: 0, dir: 4 },
      { spriteId: LAMP_BASIC, x: ox + 3, y: oy, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
    ],
  };
}

/** Bar/social: mini-bar, sofas, pizza, fireplace */
function barSocial(ox: number, oy: number): RoomFurnitureLayout {
  return {
    floor: [
      { spriteId: BAR_POLYFON, x: ox + 1, y: oy, z: 0, dir: 2 },
      { spriteId: BAR_POLYFON, x: ox + 2, y: oy, z: 0, dir: 2 },
      { spriteId: SOFA_SILO, x: ox + 1, y: oy + 3, z: 0, dir: 2 },
      { spriteId: SOFA_SILO, x: ox + 1, y: oy + 6, z: 0, dir: 6 },
      { spriteId: TABLE_POLY_SM, x: ox + 1, y: oy + 4, z: 0, dir: 0 },
      { spriteId: PIZZA, x: ox + 1, y: oy + 4, z: 0.7, dir: 0 },
      { spriteId: FIREPLACE_POLY, x: ox + 5, y: oy + 2, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: ox, y: oy + 3, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: ox, y: oy + 6, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: ox + 4, y: oy + 4, z: 0, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_TORCH, location: ":w=1,0 l=0,20 r" },
      { spriteId: WALL_TORCH, location: ":w=5,0 l=0,20 r" },
    ],
  };
}

// ── Per-Model Layouts ──────────────────────────────────────────────
// Coordinates are tuned to each model's walkable area.
// Format: getFurnitureLayout(modelKey) → layout or null

const MODEL_LAYOUTS: Record<string, RoomFurnitureLayout> = {
  // ─── Small rooms (model_a through model_d, model_e, model_f) ────

  // model_a: 8x13 walkable area, entry at (3,5), cols 4-11, rows 1-13
  model_a: {
    floor: [
      { spriteId: SOFA_SILO, x: 5, y: 1, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 6, y: 1, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 8, y: 1, z: 0, dir: 6 },
      { spriteId: CHAIR_POLYFON, x: 8, y: 2, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 4, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 10, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 10, y: 2, z: 0, dir: 4 },
      { spriteId: DOORMAT_LOVE, x: 4, y: 5, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=2,0 l=0,24 r" },
    ],
  },

  // model_b: walkable cols 5-11 (row 1-4), cols 0-11 (rows 5-10), entry (0,5)
  model_b: {
    floor: [
      { spriteId: TABLE_POLY_SM, x: 6, y: 1, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 5, y: 1, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 5, y: 2, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 8, y: 1, z: 0, dir: 6 },
      { spriteId: PIZZA, x: 6, y: 1, z: 0.7, dir: 0 },
      { spriteId: SOFA_SILO, x: 2, y: 6, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 6, z: 0, dir: 2 },
      { spriteId: BAR_POLYFON, x: 10, y: 6, z: 0, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
    ],
  },

  // model_c: small 6x6 area, cols 5-10, rows 5-10, entry (4,7)
  model_c: {
    floor: [
      { spriteId: TABLE_PLASTO_RND, x: 6, y: 5, z: 0, dir: 0 },
      { spriteId: CHAIR_SILO, x: 5, y: 5, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 8, y: 5, z: 0, dir: 6 },
      { spriteId: LAMP_BASIC, x: 10, y: 5, z: 0, dir: 4 },
      { spriteId: EDICE, x: 7, y: 8, z: 0, dir: 0 },
    ],
    wall: [],
  },

  // model_d: narrow 6x14, cols 5-10, rows 1-14, entry (4,7)
  model_d: {
    floor: [
      { spriteId: BED_POLYFON, x: 6, y: 1, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: 5, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 10, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 10, y: 2, z: 0, dir: 4 },
      { spriteId: CHAIR_SILO, x: 10, y: 4, z: 0, dir: 4 },
      { spriteId: TABLE_POLY_SM, x: 6, y: 10, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 5, y: 10, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 8, y: 10, z: 0, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_MIRROR, location: ":w=3,0 l=0,20 r" },
    ],
  },

  // model_e: 10x8 area, cols 2-11, rows 3-10, entry (1,5)
  model_e: cafe(3, 3),

  // model_f: L-shape, entry (2,5)
  model_f: {
    floor: [
      { spriteId: SOFA_SILO, x: 8, y: 1, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 8, y: 3, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 10, y: 3, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 7, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 1, y: 7, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 1, y: 8, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 9, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 3, y: 8, z: 0, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
    ],
  },

  // ─── Medium rooms ──────────────────────────────────────────────

  // model_g through model_n — assign themed templates

  // model_g: 7x7 + alcove, entry at bottom
  model_g: gameRoom(4, 1),

  // model_h: wide corridor
  model_h: barSocial(2, 2),

  // model_i: boxy
  model_i: library(2, 2),

  // model_j: medium
  model_j: lounge(2, 2),

  // model_k: medium
  model_k: cafe(2, 2),

  // model_l: medium L-shape
  model_l: bedroom(2, 2),

  // model_m: medium
  model_m: gameRoom(2, 2),

  // model_n: medium
  model_n: barSocial(3, 2),

  // model_o: larger room
  model_o: lounge(2, 2),

  // model_p: larger room
  model_p: library(2, 2),

  // model_q: larger room
  model_q: cafe(3, 3),

  // model_r: larger room
  model_r: {
    floor: [
      // Lounge area
      { spriteId: SOFA_SILO, x: 6, y: 1, z: 0, dir: 4 },
      { spriteId: SOFA_SILO, x: 6, y: 4, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 6, y: 2, z: 0, dir: 0 },
      { spriteId: FIREPLACE_ARMAS, x: 9, y: 1, z: 0, dir: 2 },
      // Cafe area
      { spriteId: TABLE_POLY_SM, x: 2, y: 6, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 1, y: 6, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 1, y: 7, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 6, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 9, y: 6, z: 0, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 5, y: 1, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 5, y: 4, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=2,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=7,0 l=0,24 r" },
    ],
  },

  // model_s: medium
  model_s: bedroom(2, 1),

  // model_t: medium
  model_t: lounge(3, 2),

  // model_v: medium
  model_v: gameRoom(3, 2),

  // ─── Large rooms ──────────────────────────────────────────────

  // model_basa: large 20x18 split-level, entry (1,15)
  model_basa: {
    floor: [
      // Upper platform (rows 1-7, height 2)
      { spriteId: SOFA_SILO, x: 2, y: 1, z: 2, dir: 4 },
      { spriteId: SOFA_SILO, x: 2, y: 4, z: 2, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 2, y: 2, z: 2, dir: 0 },
      { spriteId: FIREPLACE_ARMAS, x: 10, y: 1, z: 2, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 15, y: 1, z: 2, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 17, y: 1, z: 2, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 1, y: 1, z: 2, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 1, y: 6, z: 2, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 12, y: 3, z: 2, dir: 4 },
      { spriteId: CHAIR_POLYFON, x: 12, y: 5, z: 2, dir: 4 },
      // Lower area (rows 9-17, height 0)
      { spriteId: TABLE_POLY_SM, x: 4, y: 10, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 3, y: 10, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 3, y: 11, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 6, y: 10, z: 0, dir: 6 },
      { spriteId: PIZZA, x: 5, y: 10, z: 0.7, dir: 0 },
      { spriteId: BAR_POLYFON, x: 18, y: 9, z: 0, dir: 4 },
      { spriteId: BAR_POLYFON, x: 18, y: 10, z: 0, dir: 4 },
      { spriteId: EDICE, x: 15, y: 14, z: 0, dir: 0 },
      { spriteId: BOTTLE, x: 16, y: 14, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=10,0 l=0,24 r" },
      { spriteId: WALL_TORCH, location: ":w=16,0 l=0,20 r" },
    ],
  },

  // model_4: multi-level, entry (0,12)
  model_4: {
    floor: [
      // Lower area (height 0)
      { spriteId: TABLE_POLY_SM, x: 2, y: 5, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 1, y: 5, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 1, y: 6, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 5, z: 0, dir: 6 },
      { spriteId: SOFA_SILO, x: 2, y: 9, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 1, y: 9, z: 0, dir: 2 },
      // Upper level (height 9)
      { spriteId: SHELVES_POLYFON, x: 9, y: 1, z: 9, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 11, y: 1, z: 9, dir: 2 },
      { spriteId: FIREPLACE_ARMAS, x: 18, y: 1, z: 9, dir: 4 },
      { spriteId: CHAIR_SILO, x: 16, y: 3, z: 9, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
    ],
  },

  // model_3: rectangular, entry (0,10)
  model_3: {
    floor: [
      { spriteId: SOFA_SILO, x: 4, y: 1, z: 0, dir: 4 },
      { spriteId: SOFA_SILO, x: 4, y: 4, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 4, y: 2, z: 0, dir: 0 },
      { spriteId: FIREPLACE_ARMAS, x: 8, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 11, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 13, y: 1, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 3, y: 1, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 3, y: 5, z: 0, dir: 2 },
      { spriteId: TABLE_POLY_SM, x: 8, y: 7, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 7, y: 7, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 10, y: 7, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 14, y: 7, z: 0, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=4,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=10,0 l=0,24 r" },
    ],
  },

  // model_b2g: two-section room
  model_b2g: {
    floor: [
      { spriteId: TABLE_POLY_SM, x: 2, y: 1, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 1, y: 1, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 1, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 1, y: 3, z: 0, dir: 2 },
      { spriteId: SOFA_SILO, x: 8, y: 1, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 8, y: 3, z: 0, dir: 0 },
      { spriteId: SHELVES_NORJA, x: 12, y: 8, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 12, y: 9, z: 0, dir: 4 },
      { spriteId: FIREPLACE_ARMAS, x: 4, y: 14, z: 0, dir: 0 },
      { spriteId: LAMP_BASIC, x: 1, y: 14, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=2,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=8,0 l=0,24 r" },
    ],
  },

  // model_opening: large multi-level, entry (0,23)
  model_opening: {
    floor: [
      // Top platform (height 2)
      { spriteId: SHELVES_POLYFON, x: 8, y: 1, z: 2, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 10, y: 1, z: 2, dir: 2 },
      { spriteId: FIREPLACE_POLY, x: 16, y: 1, z: 2, dir: 4 },
      // Middle platform (height 1)
      { spriteId: SOFA_SILO, x: 8, y: 9, z: 1, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 8, y: 11, z: 1, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 10, y: 11, z: 1, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 7, y: 9, z: 1, dir: 2 },
      // Lower area (height 0)
      { spriteId: TABLE_POLY_SM, x: 10, y: 19, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 9, y: 19, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 12, y: 19, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 17, y: 18, z: 0, dir: 4 },
      // Left column (height 2)
      { spriteId: LAMP_BASIC, x: 1, y: 9, z: 2, dir: 2 },
      { spriteId: CHAIR_SILO, x: 3, y: 12, z: 2, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
      { spriteId: WALL_TORCH, location: ":w=12,0 l=0,20 r" },
    ],
  },

  // model_u: long corridor, entry (0,17)
  model_u: {
    floor: [
      { spriteId: SOFA_SILO, x: 7, y: 2, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 7, y: 4, z: 0, dir: 0 },
      { spriteId: SOFA_SILO, x: 7, y: 6, z: 0, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 6, y: 2, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 6, y: 6, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 15, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 17, y: 1, z: 0, dir: 2 },
      { spriteId: FIREPLACE_ARMAS, x: 20, y: 5, z: 0, dir: 4 },
      { spriteId: TABLE_POLY_SM, x: 12, y: 12, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 11, y: 12, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 14, y: 12, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 22, y: 15, z: 0, dir: 4 },
      { spriteId: EDICE, x: 18, y: 20, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=4,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=12,0 l=0,24 r" },
    ],
  },

  // model_x: cross-shaped, entry (0,12)
  model_x: {
    floor: [
      // Top room
      { spriteId: TABLE_POLY_SM, x: 5, y: 1, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 1, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 7, y: 1, z: 0, dir: 6 },
      { spriteId: SHELVES_NORJA, x: 17, y: 1, z: 0, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 1, y: 1, z: 0, dir: 2 },
      // Left wing
      { spriteId: SOFA_SILO, x: 2, y: 8, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 8, z: 0, dir: 2 },
      // Right wing
      { spriteId: SHELVES_POLYFON, x: 14, y: 8, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 16, y: 10, z: 0, dir: 4 },
      // Bottom room
      { spriteId: FIREPLACE_ARMAS, x: 5, y: 19, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 14, y: 20, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 10, y: 21, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=14,0 l=0,24 r" },
    ],
  },

  // model_w: complex multi-level, entry (0,3)
  model_w: lounge(8, 3),

  // model_z: two-section room, entry (0,9)
  model_z: {
    floor: [
      // Left room
      { spriteId: TABLE_POLY_SM, x: 2, y: 4, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 1, y: 4, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 4, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 1, y: 7, z: 0, dir: 2 },
      // Right room
      { spriteId: SOFA_SILO, x: 14, y: 1, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 14, y: 3, z: 0, dir: 0 },
      { spriteId: SOFA_SILO, x: 14, y: 5, z: 0, dir: 4 },
      { spriteId: FIREPLACE_ARMAS, x: 24, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_POLYFON, x: 20, y: 10, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: 11, y: 1, z: 0, dir: 2 },
      { spriteId: BAR_POLYFON, x: 28, y: 8, z: 0, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=15,0 l=0,24 r" },
    ],
  },

  // model_y: complex multi-room, entry (0,3)
  model_y: {
    floor: [
      // Top-left section
      { spriteId: TABLE_POLY_SM, x: 2, y: 1, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 1, y: 1, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 1, z: 0, dir: 6 },
      // Center section
      { spriteId: SOFA_SILO, x: 12, y: 1, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 12, y: 3, z: 0, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 11, y: 1, z: 0, dir: 2 },
      // Right section
      { spriteId: SHELVES_NORJA, x: 24, y: 1, z: 0, dir: 4 },
      { spriteId: LAMP_BASIC, x: 24, y: 3, z: 0, dir: 4 },
      // Bottom hall
      { spriteId: FIREPLACE_ARMAS, x: 5, y: 19, z: 0, dir: 0 },
      { spriteId: BAR_POLYFON, x: 22, y: 19, z: 0, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=12,0 l=0,24 r" },
    ],
  },

  // model_oscar: large auditorium-style
  model_oscar: {
    floor: [
      { spriteId: SOFA_SILO, x: 10, y: 2, z: 1, dir: 4 },
      { spriteId: SOFA_SILO, x: 10, y: 5, z: 1, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 10, y: 3, z: 1, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 9, y: 2, z: 1, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 14, y: 2, z: 1, dir: 2 },
      // Stage area
      { spriteId: CHAIR_POLYFON, x: 2, y: 11, z: 1, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 2, y: 13, z: 1, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 2, y: 15, z: 1, dir: 2 },
      // Lower area
      { spriteId: BAR_POLYFON, x: 24, y: 11, z: 0, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_TORCH, location: ":w=5,0 l=0,20 r" },
      { spriteId: WALL_TORCH, location: ":w=15,0 l=0,20 r" },
    ],
  },

  // model_0: large complex, entry (0,4)
  model_0: lounge(2, 1),

  // ─── Numbered models ──────────────────────────────────────────

  model_room_15: cafe(3, 2),

  model_1: {
    floor: [
      { spriteId: TABLE_POLY_SM, x: 2, y: 1, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 1, y: 1, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 1, z: 0, dir: 6 },
      { spriteId: SOFA_SILO, x: 8, y: 1, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 8, y: 3, z: 0, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 7, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 14, y: 1, z: 0, dir: 4 },
      { spriteId: BAR_POLYFON, x: 14, y: 3, z: 0, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=4,0 l=0,24 r" },
    ],
  },

  model_2: library(3, 1),
  model_5: barSocial(2, 2),
  model_6: gameRoom(2, 1),
  model_7: bedroom(2, 1),
  model_8: lounge(2, 1),
  model_9: cafe(3, 2),
};

// ── Public API ─────────────────────────────────────────────────────

export function getFurnitureLayout(modelKey: string): RoomFurnitureLayout | null {
  return MODEL_LAYOUTS[modelKey] || null;
}
