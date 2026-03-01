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

// ── Per-Model Layouts ──────────────────────────────────────────────
// Each layout is hand-placed per model's actual heightmap shape.
// Furniture is distributed along walls, leaving entry paths clear.

const MODEL_LAYOUTS: Record<string, RoomFurnitureLayout> = {
  // ─── Small rooms (model_a through model_d, model_e, model_f) ────

  // model_a: 8x13 walkable area, entry at (3,5), cols 4-11, rows 1-13
  model_a: {
    floor: [
      { spriteId: LAMP_ARMAS, x: 4, y: 1, z: 0, dir: 2 },
      { spriteId: SOFA_SILO, x: 5, y: 3, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 6, y: 1, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 8, y: 1, z: 0, dir: 6 },
      { spriteId: CHAIR_POLYFON, x: 8, y: 2, z: 0, dir: 6 },
      { spriteId: SHELVES_NORJA, x: 10, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 10, y: 2, z: 0, dir: 4 },
      { spriteId: DOORMAT_LOVE, x: 4, y: 5, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=2,0 l=0,24 r" },
    ],
  },

  // model_b: L-shape. Upper pocket cols 5-11 rows 1-4, full width rows 5-10, entry (0,5)
  model_b: {
    floor: [
      // Upper pocket — north wall (y=1)
      { spriteId: SHELVES_NORJA, x: 5, y: 1, z: 0, dir: 4 },
      { spriteId: TABLE_POLY_SM, x: 7, y: 1, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 9, y: 1, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 11, y: 1, z: 0, dir: 6 },
      // Upper pocket — east wall (x=11)
      { spriteId: SHELVES_NORJA, x: 11, y: 3, z: 0, dir: 6 },
      // Lower section — west wall (x=1)
      { spriteId: SOFA_SILO, x: 1, y: 7, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 9, z: 0, dir: 2 },
      // Lower section — south wall (y=10)
      { spriteId: TABLE_NORJA_MED, x: 5, y: 9, z: 0, dir: 0 },
      { spriteId: CHAIR_SILO, x: 4, y: 9, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 7, y: 9, z: 0, dir: 6 },
      // Lower section — east wall (x=11)
      { spriteId: BAR_POLYFON, x: 11, y: 7, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 11, y: 8, z: 0, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=8,0 l=0,24 r" },
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

  // model_e: Rectangle cols 2-11, rows 3-10, entry (1,5)
  model_e: {
    floor: [
      // North wall (y=3)
      { spriteId: TABLE_POLY_SM, x: 3, y: 3, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 2, y: 3, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 5, y: 3, z: 0, dir: 6 },
      { spriteId: PIZZA, x: 4, y: 4, z: 0.7, dir: 0 },
      // East wall (x=11)
      { spriteId: BAR_POLYFON, x: 11, y: 4, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 11, y: 7, z: 0, dir: 6 },
      // North wall right side
      { spriteId: SHELVES_NORJA, x: 9, y: 3, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 10, y: 3, z: 0, dir: 4 },
      // South wall (y=10)
      { spriteId: TABLE_PLASTO_RND, x: 7, y: 9, z: 0, dir: 0 },
      { spriteId: CHAIR_SILO, x: 6, y: 9, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 9, y: 9, z: 0, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=8,0 l=0,24 r" },
    ],
  },

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

  // model_g: H-shape. West h=1 (cols 2-5,y=5-9), east h=0 (cols 7-11,y=2-12), entry (1,7)
  model_g: {
    floor: [
      // East section — north wall (y=2)
      { spriteId: SHELVES_NORJA, x: 7, y: 2, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 8, y: 2, z: 0, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 11, y: 2, z: 0, dir: 6 },
      // East section — east wall (x=11)
      { spriteId: BAR_POLYFON, x: 11, y: 5, z: 0, dir: 6 },
      // East section — south wall (y=12)
      { spriteId: TABLE_POLY_SM, x: 8, y: 11, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 7, y: 11, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 10, y: 11, z: 0, dir: 6 },
      // West section h=1 — along walls
      { spriteId: SOFA_SILO, x: 2, y: 5, z: 1, dir: 2 },
      { spriteId: LAMP_BASIC, x: 2, y: 8, z: 1, dir: 2 },
      { spriteId: EDICE, x: 4, y: 7, z: 1, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_TORCH, location: ":w=4,0 l=0,20 r" },
      { spriteId: WALL_LAMP, location: ":w=9,0 l=0,24 r" },
    ],
  },

  // model_h: Stepped-L. Upper h=1 (cols 5-10,y=2-6), lower h=0 (cols 3-10,y=7-12), entry (4,4)
  model_h: {
    floor: [
      // Upper room h=1 — north wall
      { spriteId: SOFA_SILO, x: 6, y: 2, z: 1, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 5, y: 2, z: 1, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 10, y: 2, z: 1, dir: 6 },
      { spriteId: SHELVES_NORJA, x: 10, y: 3, z: 1, dir: 6 },
      // Lower room h=0 — west wall
      { spriteId: FIREPLACE_ARMAS, x: 3, y: 9, z: 0, dir: 2 },
      // Lower room h=0 — south wall
      { spriteId: TABLE_NORJA_MED, x: 6, y: 11, z: 0, dir: 0 },
      { spriteId: CHAIR_SILO, x: 5, y: 11, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 8, y: 11, z: 0, dir: 6 },
      // Lower room — east wall
      { spriteId: BAR_POLYFON, x: 10, y: 10, z: 0, dir: 6 },
      { spriteId: LAMP_BASIC, x: 10, y: 12, z: 0, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=8,0 l=0,24 r" },
    ],
  },

  // model_i: Large rectangle. cols 1-16, rows 1-26, entry (0,10)
  model_i: {
    floor: [
      // North wall (y=1)
      { spriteId: SHELVES_POLYFON, x: 1, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 3, y: 1, z: 0, dir: 2 },
      { spriteId: FIREPLACE_ARMAS, x: 8, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 14, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 15, y: 1, z: 0, dir: 4 },
      // West wall (x=1)
      { spriteId: LAMP_ARMAS, x: 1, y: 5, z: 0, dir: 2 },
      { spriteId: SOFA_SILO, x: 1, y: 14, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 1, y: 20, z: 0, dir: 2 },
      // East wall (x=16)
      { spriteId: BAR_POLYFON, x: 16, y: 3, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 16, y: 4, z: 0, dir: 6 },
      { spriteId: CHAIR_SILO, x: 16, y: 8, z: 0, dir: 6 },
      { spriteId: LAMP_BASIC, x: 16, y: 15, z: 0, dir: 6 },
      // Center — lounge area
      { spriteId: TABLE_NORJA_MED, x: 7, y: 12, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 6, y: 12, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 9, y: 12, z: 0, dir: 6 },
      // South wall (y=26)
      { spriteId: TABLE_POLY_SM, x: 5, y: 25, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 25, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 7, y: 25, z: 0, dir: 6 },
      { spriteId: EDICE, x: 12, y: 25, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=10,0 l=0,24 r" },
    ],
  },

  // model_j: T-shape. NE pocket (cols 11-20,y=1-6), full (y=7-16,x=1-20), SW (y=17-22,x=1-10), entry (0,10)
  model_j: {
    floor: [
      // NE pocket — north wall
      { spriteId: SHELVES_POLYFON, x: 11, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 13, y: 1, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 20, y: 1, z: 0, dir: 6 },
      { spriteId: FIREPLACE_ARMAS, x: 17, y: 1, z: 0, dir: 4 },
      // Full band — north wall left half
      { spriteId: SOFA_SILO, x: 1, y: 7, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 9, z: 0, dir: 2 },
      // Full band — east wall
      { spriteId: BAR_POLYFON, x: 20, y: 8, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 20, y: 9, z: 0, dir: 6 },
      // Center table
      { spriteId: TABLE_NORJA_MED, x: 10, y: 11, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 9, y: 11, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 12, y: 11, z: 0, dir: 6 },
      // SW section — south wall
      { spriteId: TABLE_POLY_SM, x: 3, y: 21, z: 0, dir: 0 },
      { spriteId: CHAIR_SILO, x: 2, y: 21, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 5, y: 21, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 1, y: 19, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=15,0 l=0,24 r" },
    ],
  },

  // model_k: Plus/cross. NE pocket (x=17-24,y=1-4), mid (x=9-24,y=5-8),
  //          full (x=1-24,y=9-16), SE (x=9-24,y=17-26), entry (0,13)
  model_k: {
    floor: [
      // NE pocket
      { spriteId: SHELVES_NORJA, x: 17, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 18, y: 1, z: 0, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 24, y: 1, z: 0, dir: 6 },
      // Mid section — north edge
      { spriteId: FIREPLACE_ARMAS, x: 12, y: 5, z: 0, dir: 4 },
      { spriteId: SOFA_SILO, x: 9, y: 5, z: 0, dir: 4 },
      // Full band — west wall
      { spriteId: SOFA_SILO, x: 1, y: 10, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 12, z: 0, dir: 2 },
      // Full band — east wall
      { spriteId: BAR_POLYFON, x: 24, y: 10, z: 0, dir: 6 },
      { spriteId: SHELVES_NORJA, x: 24, y: 12, z: 0, dir: 6 },
      // Center
      { spriteId: TABLE_POLY_SM, x: 14, y: 12, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 13, y: 12, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 16, y: 12, z: 0, dir: 6 },
      // SE section — south area
      { spriteId: TABLE_NORJA_MED, x: 15, y: 24, z: 0, dir: 0 },
      { spriteId: CHAIR_SILO, x: 14, y: 24, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 17, y: 24, z: 0, dir: 6 },
      { spriteId: EDICE, x: 20, y: 22, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=6,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=18,0 l=0,24 r" },
    ],
  },

  // model_l: Split rectangle. Full y=1-8, then void cols 9-12 for y=9-20, entry (0,16)
  model_l: {
    floor: [
      // North wall (y=1) — full width
      { spriteId: SHELVES_POLYFON, x: 1, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 3, y: 1, z: 0, dir: 2 },
      { spriteId: FIREPLACE_ARMAS, x: 10, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 18, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 19, y: 1, z: 0, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 20, y: 1, z: 0, dir: 6 },
      // Left half (x=1-8) — furniture along inner wall edge (x=8)
      { spriteId: SOFA_SILO, x: 1, y: 11, z: 0, dir: 2 },
      { spriteId: TABLE_NORJA_MED, x: 1, y: 13, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 3, y: 14, z: 0, dir: 0 },
      { spriteId: LAMP_BASIC, x: 1, y: 18, z: 0, dir: 2 },
      // Right half (x=13-20) — furniture along inner wall edge (x=13)
      { spriteId: BED_POLYFON, x: 13, y: 11, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 13, y: 14, z: 0, dir: 2 },
      { spriteId: BAR_POLYFON, x: 20, y: 11, z: 0, dir: 6 },
      { spriteId: CHAIR_SILO, x: 20, y: 14, z: 0, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=4,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=14,0 l=0,24 r" },
    ],
  },

  // model_m: Plus/cross. N corridor (y=1-10,x=11-18), horizontal band (y=11-18,x=1-28),
  //          S corridor (y=19-28,x=11-18), entry (0,15)
  model_m: {
    floor: [
      // North corridor — along corridor walls
      { spriteId: SHELVES_POLYFON, x: 11, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 13, y: 1, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 15, y: 1, z: 0, dir: 4 },
      { spriteId: CHAIR_SILO, x: 18, y: 3, z: 0, dir: 6 },
      { spriteId: CHAIR_SILO, x: 18, y: 5, z: 0, dir: 6 },
      // Left arm (x=1-10, y=11-18)
      { spriteId: SOFA_SILO, x: 1, y: 12, z: 0, dir: 2 },
      { spriteId: TABLE_NORJA_MED, x: 1, y: 14, z: 0, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 1, y: 16, z: 0, dir: 2 },
      { spriteId: FIREPLACE_ARMAS, x: 4, y: 11, z: 0, dir: 4 },
      // Right arm (x=19-28, y=11-18)
      { spriteId: TABLE_POLY_SM, x: 22, y: 11, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 21, y: 11, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 24, y: 11, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 28, y: 12, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 28, y: 13, z: 0, dir: 6 },
      { spriteId: SHELVES_NORJA, x: 28, y: 16, z: 0, dir: 6 },
      { spriteId: LAMP_BASIC, x: 28, y: 18, z: 0, dir: 6 },
      // South corridor
      { spriteId: EDICE, x: 14, y: 22, z: 0, dir: 0 },
      { spriteId: BOTTLE, x: 15, y: 24, z: 0, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 11, y: 27, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=15,0 l=0,24 r" },
      { spriteId: WALL_TORCH, location: ":w=25,0 l=0,20 r" },
    ],
  },

  // model_n: Rectangle with internal void (cols 7-13,y=7-14). Full x=1-20, y=1-20, entry (0,16)
  model_n: {
    floor: [
      // North wall (y=1)
      { spriteId: SHELVES_POLYFON, x: 1, y: 1, z: 0, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 3, y: 1, z: 0, dir: 2 },
      { spriteId: FIREPLACE_ARMAS, x: 10, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 18, y: 1, z: 0, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 20, y: 1, z: 0, dir: 6 },
      // West wall (x=1)
      { spriteId: SOFA_SILO, x: 1, y: 4, z: 0, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 12, z: 0, dir: 2 },
      // East wall (x=20)
      { spriteId: BAR_POLYFON, x: 20, y: 5, z: 0, dir: 6 },
      { spriteId: CHAIR_SILO, x: 20, y: 10, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 20, y: 17, z: 0, dir: 6 },
      // South wall (y=20)
      { spriteId: TABLE_NORJA_MED, x: 10, y: 19, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 9, y: 19, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 12, y: 19, z: 0, dir: 6 },
      // Around the internal void — north face (y=6, table must not extend into y=7 void)
      { spriteId: TABLE_POLY_SM, x: 4, y: 5, z: 0, dir: 0 },
      // Around the internal void — south face (y=15)
      { spriteId: EDICE, x: 10, y: 15, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=15,0 l=0,24 r" },
    ],
  },

  // model_o: Cross multi-level. N pocket h=1 (x=13-20,y=1-7), center h=0 (x=9-24,y=9-26),
  //          west stub h=1 (x=1-7,y=15-22), entry (0,18)
  model_o: {
    floor: [
      // N pocket h=1
      { spriteId: SHELVES_POLYFON, x: 13, y: 1, z: 1, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 15, y: 1, z: 1, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 20, y: 1, z: 1, dir: 6 },
      { spriteId: CHAIR_SILO, x: 20, y: 4, z: 1, dir: 6 },
      // West stub h=1
      { spriteId: SOFA_SILO, x: 1, y: 16, z: 1, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 20, z: 1, dir: 2 },
      { spriteId: TABLE_NORJA_MED, x: 4, y: 15, z: 1, dir: 0 },
      // Center h=0 — north wall
      { spriteId: FIREPLACE_ARMAS, x: 14, y: 9, z: 0, dir: 4 },
      // Center h=0 — east wall
      { spriteId: BAR_POLYFON, x: 24, y: 12, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 24, y: 13, z: 0, dir: 6 },
      // Center h=0 — south wall
      { spriteId: TABLE_POLY_SM, x: 15, y: 25, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 14, y: 25, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 17, y: 25, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 9, y: 25, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=6,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=16,0 l=0,24 r" },
    ],
  },

  // model_p: Stepped-Z, 3 levels. NE h=2 (x=7-18,y=1-7), cross h=1 (x=1-18,y=9-16),
  //          SE h=0 (x=7-18,y=19-24), entry (0,23)
  model_p: {
    floor: [
      // NE h=2 — north wall
      { spriteId: SHELVES_POLYFON, x: 7, y: 1, z: 2, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 9, y: 1, z: 2, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 18, y: 1, z: 2, dir: 6 },
      { spriteId: FIREPLACE_ARMAS, x: 14, y: 1, z: 2, dir: 4 },
      // Cross h=1 — west side
      { spriteId: SOFA_SILO, x: 1, y: 10, z: 2, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 14, z: 2, dir: 2 },
      // Cross h=1 — east side
      { spriteId: BAR_POLYFON, x: 18, y: 10, z: 1, dir: 6 },
      { spriteId: CHAIR_SILO, x: 18, y: 13, z: 1, dir: 6 },
      // Cross h=1 — center
      { spriteId: TABLE_NORJA_MED, x: 10, y: 12, z: 1, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 9, y: 12, z: 1, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 12, y: 12, z: 1, dir: 6 },
      // SE h=0 — south wall
      { spriteId: TABLE_POLY_SM, x: 10, y: 23, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 9, y: 23, z: 0, dir: 2 },
      { spriteId: EDICE, x: 15, y: 22, z: 0, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=4,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=12,0 l=0,24 r" },
    ],
  },

  // model_q: Irregular multi-section. NE pocket h=2 (x=11-18,y=1-6), full h=2 (x=1-18,y=7-14),
  //          lower sub-rooms, entry (10,4)
  model_q: {
    floor: [
      // NE pocket — north wall
      { spriteId: SHELVES_NORJA, x: 11, y: 1, z: 2, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 12, y: 1, z: 2, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 18, y: 1, z: 2, dir: 6 },
      // Full band — west wall
      { spriteId: SOFA_SILO, x: 1, y: 8, z: 2, dir: 2 },
      { spriteId: LAMP_BASIC, x: 1, y: 11, z: 2, dir: 2 },
      // Full band — east wall
      { spriteId: FIREPLACE_ARMAS, x: 17, y: 8, z: 2, dir: 6 },
      // Center
      { spriteId: TABLE_NORJA_MED, x: 8, y: 10, z: 2, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 7, y: 10, z: 2, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 10, y: 10, z: 2, dir: 6 },
      // Lower sections
      { spriteId: BAR_POLYFON, x: 1, y: 13, z: 2, dir: 2 },
      { spriteId: EDICE, x: 8, y: 21, z: 1, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=14,0 l=0,24 r" },
    ],
  },

  // model_r: multi-level staircase. Upper NE h=3 (x=11-24,y=1-12), SW h=4 (x=1-5,y=13-16),
  //          mid h=3 (x=7-10,y=7-16), lower h=0 (x=17-22,y=15-24)
  model_r: {
    floor: [
      // Upper NE section h=3 — north wall (y=1, x=11-24)
      { spriteId: SOFA_SILO, x: 12, y: 1, z: 3, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 14, y: 1, z: 3, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 11, y: 1, z: 3, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 22, y: 1, z: 3, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 23, y: 1, z: 3, dir: 4 },
      // Upper NE — east wall
      { spriteId: BAR_POLYFON, x: 24, y: 5, z: 3, dir: 6 },
      // Mid section h=3 — center
      { spriteId: TABLE_POLY_SM, x: 8, y: 9, z: 3, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 7, y: 9, z: 3, dir: 2 },
      // Lower section h=0 — south wall (x=17-22, y=21-24)
      { spriteId: CHAIR_SILO, x: 18, y: 22, z: 0, dir: 4 },
      { spriteId: LAMP_BASIC, x: 17, y: 21, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
    ],
  },

  // model_s: tiny room 6x8, walkable cols 1-5, rows 1-7, entry (0,3)
  model_s: {
    floor: [
      { spriteId: SHELVES_NORJA, x: 5, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 5, y: 2, z: 0, dir: 4 },
      { spriteId: LAMP_BASIC, x: 1, y: 1, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 4, y: 5, z: 0, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 1, y: 5, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_MIRROR, location: ":w=2,0 l=0,20 r" },
      { spriteId: WALL_LAMP, location: ":w=1,0 l=0,24 r" },
    ],
  },

  // model_t: concentric arena. Outer ring h=2 (rows 1-4,23-26, cols 1-4,24-27), inner ring h=1, core h=0
  model_t: {
    floor: [
      // Outer ring h=2 — north wall
      { spriteId: SOFA_SILO, x: 3, y: 2, z: 2, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 3, y: 4, z: 2, dir: 0 },
      { spriteId: SOFA_SILO, x: 3, y: 6, z: 2, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 3, y: 8, z: 2, dir: 2 },
      { spriteId: FIREPLACE_ARMAS, x: 7, y: 2, z: 2, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 10, y: 2, z: 2, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 11, y: 2, z: 2, dir: 4 },
      { spriteId: LAMP_BASIC, x: 25, y: 2, z: 2, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=8,0 l=0,24 r" },
    ],
  },

  // model_v: split-level. Upper rows 1-6: cols 1-5 h=2, cols 6-18 h=1. Lower rows 8+ h=0.
  model_v: {
    floor: [
      // Upper h=2 zone (cols 1-5, rows 1-6)
      { spriteId: LAMP_ARMAS, x: 1, y: 1, z: 2, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 2, y: 2, z: 2, dir: 4 },
      // Upper h=1 zone (cols 6-18, rows 1-6)
      { spriteId: TABLE_POLY_SM, x: 8, y: 2, z: 1, dir: 0 },
      { spriteId: EDICE, x: 8, y: 2, z: 1.7, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 7, y: 2, z: 1, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 10, y: 2, z: 1, dir: 6 },
      { spriteId: CHAIR_POLYFON, x: 7, y: 3, z: 1, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 10, y: 3, z: 1, dir: 6 },
      { spriteId: SHELVES_NORJA, x: 18, y: 2, z: 1, dir: 6 },
      { spriteId: LAMP_BASIC, x: 18, y: 5, z: 1, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_TORCH, location: ":w=5,0 l=0,20 r" },
    ],
  },

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
      { spriteId: CHAIR_POLYFON, x: 1, y: 2, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 1, z: 0, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 1, y: 4, z: 0, dir: 2 },
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

  // model_w: three-level. Left col h=2 (cols 1-5), center h=1 (cols 7-16), right pockets h=0
  model_w: {
    floor: [
      // Center h=1 zone (cols 7-16, rows 3-6 open corridor)
      { spriteId: SOFA_SILO, x: 8, y: 3, z: 1, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 8, y: 5, z: 1, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 7, y: 3, z: 1, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 10, y: 5, z: 1, dir: 6 },
      { spriteId: SHELVES_NORJA, x: 14, y: 3, z: 1, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 15, y: 3, z: 1, dir: 4 },
      { spriteId: FIREPLACE_ARMAS, x: 11, y: 3, z: 1, dir: 4 },
      { spriteId: LAMP_BASIC, x: 16, y: 7, z: 1, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=5,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=11,0 l=0,24 r" },
    ],
  },

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
  model_0: {
    floor: [
      { spriteId: SOFA_SILO, x: 2, y: 1, z: 0, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 2, y: 3, z: 0, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 1, y: 1, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 3, z: 0, dir: 6 },
      { spriteId: SHELVES_NORJA, x: 7, y: 1, z: 0, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 8, y: 1, z: 0, dir: 4 },
      { spriteId: FIREPLACE_ARMAS, x: 12, y: 1, z: 0, dir: 4 },
      { spriteId: LAMP_BASIC, x: 1, y: 6, z: 0, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=10,0 l=0,24 r" },
    ],
  },

  // ─── Numbered models ──────────────────────────────────────────

  // model_room_15: gallery style. Left corridor h=1 (cols 1-5, rows 1-34), main floor h=0 (cols 6-22, rows 13-28)
  model_room_15: {
    floor: [
      // Left corridor h=1
      { spriteId: LAMP_ARMAS, x: 1, y: 1, z: 1, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 5, y: 1, z: 1, dir: 4 },
      // Main floor h=0 (cols 6-22, rows 13-28)
      { spriteId: TABLE_POLY_SM, x: 8, y: 14, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 7, y: 14, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 10, y: 14, z: 0, dir: 6 },
      { spriteId: PIZZA, x: 9, y: 15, z: 0.7, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=4,0 l=0,24 r" },
    ],
  },

  // model_1: grand staircase. Upper h=14 (cols 1-16, rows 1-5,10-31), entry at (0,10)
  model_1: {
    floor: [
      // Upper h=14 zone — north wall (y=1, cols 1-16)
      { spriteId: TABLE_POLY_SM, x: 2, y: 1, z: 14, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 1, y: 1, z: 14, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 4, y: 1, z: 14, dir: 6 },
      { spriteId: SOFA_SILO, x: 8, y: 1, z: 14, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 8, y: 3, z: 14, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 7, y: 1, z: 14, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 14, y: 1, z: 14, dir: 4 },
      { spriteId: BAR_POLYFON, x: 14, y: 3, z: 14, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=4,0 l=0,24 r" },
    ],
  },

  // model_2: staircase tower. Top h=19 (cols 1-13, rows 1-8), entry at (0,15) h=14
  model_2: {
    floor: [
      // Top h=19 zone (cols 1-13, rows 1-8)
      { spriteId: SHELVES_POLYFON, x: 3, y: 1, z: 19, dir: 2 },
      { spriteId: SHELVES_POLYFON, x: 5, y: 1, z: 19, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 7, y: 1, z: 19, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 8, y: 1, z: 19, dir: 4 },
      { spriteId: CHAIR_SILO, x: 4, y: 4, z: 19, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 4, y: 5, z: 19, dir: 0 },
      { spriteId: LAMP_BASIC, x: 5, y: 5, z: 19.7, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 3, y: 3, z: 19, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=7,0 l=0,24 r" },
    ],
  },
  model_5: {
    floor: [
      { spriteId: BAR_POLYFON, x: 2, y: 2, z: 0, dir: 2 },
      { spriteId: BAR_POLYFON, x: 2, y: 3, z: 0, dir: 2 },
      { spriteId: SOFA_SILO, x: 2, y: 5, z: 0, dir: 2 },
      { spriteId: TABLE_POLY_SM, x: 2, y: 7, z: 0, dir: 0 },
      { spriteId: PIZZA, x: 3, y: 7, z: 0.7, dir: 0 },
      { spriteId: FIREPLACE_POLY, x: 7, y: 2, z: 0, dir: 4 },
      { spriteId: LAMP_ARMAS, x: 2, y: 9, z: 0, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 9, y: 5, z: 0, dir: 6 },
      { spriteId: CHAIR_POLYFON, x: 5, y: 7, z: 0, dir: 6 },
    ],
    wall: [
      { spriteId: WALL_TORCH, location: ":w=2,0 l=0,20 r" },
      { spriteId: WALL_TORCH, location: ":w=7,0 l=0,20 r" },
    ],
  },
  // model_6: upper h=2 zone (cols 1-9, rows 1-9), lower h=0 (entry at row 15)
  model_6: {
    floor: [
      // Upper h=2 zone — game table
      { spriteId: TABLE_POLY_SM, x: 4, y: 1, z: 2, dir: 0 },
      { spriteId: EDICE, x: 4, y: 1, z: 2.7, dir: 0 },
      { spriteId: BOTTLE, x: 5, y: 2, z: 2.7, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 3, y: 1, z: 2, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 6, y: 1, z: 2, dir: 6 },
      { spriteId: CHAIR_POLYFON, x: 3, y: 2, z: 2, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 6, y: 2, z: 2, dir: 6 },
      { spriteId: LAMP_ARMAS, x: 2, y: 1, z: 2, dir: 2 },
    ],
    wall: [
      { spriteId: WALL_TORCH, location: ":w=4,0 l=0,20 r" },
    ],
  },
  // model_7: upper h=2 (cols 1-6, rows 1-12), lower h=0 (cols 1-6, rows 15-22), entry (0,17)
  model_7: {
    floor: [
      // Upper h=2 zone — bedroom
      { spriteId: BED_POLYFON, x: 3, y: 1, z: 2, dir: 2 },
      { spriteId: LAMP_BASIC, x: 2, y: 1, z: 2, dir: 2 },
      { spriteId: SHELVES_NORJA, x: 6, y: 1, z: 2, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 6, y: 2, z: 2, dir: 4 },
      { spriteId: CHAIR_SILO, x: 6, y: 5, z: 2, dir: 4 },
      { spriteId: DOORMAT_PLAIN, x: 2, y: 5, z: 2, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_MIRROR, location: ":w=5,0 l=0,20 r" },
      { spriteId: WALL_LAMP, location: ":w=2,0 l=0,24 r" },
    ],
  },
  // model_8: upper h=5 platform (cols 1-10, rows 1-26), lower h=0 (cols 8-32, rows 8-36)
  model_8: {
    floor: [
      // Upper h=5 zone — lounge
      { spriteId: SOFA_SILO, x: 2, y: 1, z: 5, dir: 4 },
      { spriteId: SOFA_SILO, x: 2, y: 4, z: 5, dir: 4 },
      { spriteId: TABLE_NORJA_MED, x: 2, y: 2, z: 5, dir: 0 },
      { spriteId: LAMP_ARMAS, x: 1, y: 1, z: 5, dir: 2 },
      { spriteId: LAMP_ARMAS, x: 1, y: 5, z: 5, dir: 2 },
      { spriteId: FIREPLACE_ARMAS, x: 6, y: 1, z: 5, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 9, y: 1, z: 5, dir: 4 },
      { spriteId: SHELVES_NORJA, x: 10, y: 1, z: 5, dir: 4 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=2,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=6,0 l=0,24 r" },
    ],
  },
  model_9: {
    floor: [
      { spriteId: TABLE_POLY_SM, x: 4, y: 2, z: 0, dir: 0 },
      { spriteId: CHAIR_POLYFON, x: 3, y: 2, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 3, y: 3, z: 0, dir: 2 },
      { spriteId: CHAIR_POLYFON, x: 6, y: 2, z: 0, dir: 6 },
      { spriteId: TABLE_PLASTO_RND, x: 4, y: 6, z: 0, dir: 0 },
      { spriteId: CHAIR_SILO, x: 3, y: 6, z: 0, dir: 2 },
      { spriteId: CHAIR_SILO, x: 6, y: 6, z: 0, dir: 6 },
      { spriteId: BAR_POLYFON, x: 9, y: 2, z: 0, dir: 6 },
      { spriteId: PIZZA, x: 5, y: 3, z: 0.7, dir: 0 },
    ],
    wall: [
      { spriteId: WALL_LAMP, location: ":w=3,0 l=0,24 r" },
      { spriteId: WALL_LAMP, location: ":w=7,0 l=0,24 r" },
    ],
  },
};

// ── Public API ─────────────────────────────────────────────────────

export function getFurnitureLayout(modelKey: string): RoomFurnitureLayout | null {
  return MODEL_LAYOUTS[modelKey] || null;
}
