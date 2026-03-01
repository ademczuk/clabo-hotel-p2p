/**
 * Thorough audit: check all furniture coordinates against heightmaps.
 * Run with: node audit-furniture.mjs
 *
 * Checks:
 * 1. Items on void/wall tiles
 * 2. Items out of bounds
 * 3. Item z-value doesn't match tile height
 * 4. Multi-tile items spanning different heights
 * 5. Overlapping items (multiple items on same tile)
 * 6. Items blocking entry tile
 */

// Multi-tile item sizes: [widthX, depthY] in dir=0/4 orientation
// For dir=2/6, swap: [depthY, widthX]
const ITEM_SIZES = {
  28: [2, 1],   // SOFA_SILO
  17: [2, 2],   // TABLE_POLY_SM
  20: [2, 2],   // TABLE_NORJA_MED
  14: [2, 1],   // SHELVES_POLYFON
  41: [2, 3],   // BED_POLYFON
  56: [2, 1],   // FIREPLACE_ARMAS
  62: [2, 1],   // FIREPLACE_POLY
  59: [3, 5],   // CARPET_STD
  23: [2, 2],   // TABLE_PLASTO_RND
};

// Parse heightmap string into 2D array
function parseHeightmap(hm) {
  const rows = hm.split('\r').filter(r => r.length > 0);
  const grid = [];
  for (const row of rows) {
    const tiles = [];
    for (const ch of row) {
      if (ch === 'x' || ch === 'X') {
        tiles.push(-1); // void/wall
      } else {
        tiles.push(parseInt(ch, 36)); // 0-9, a-z
      }
    }
    grid.push(tiles);
  }
  return grid;
}

// Check if tile (x, y) is walkable in the grid
function isWalkable(grid, x, y) {
  if (y < 0 || y >= grid.length) return false;
  if (x < 0 || x >= grid[y].length) return false;
  return grid[y][x] >= 0;
}

function getTileHeight(grid, x, y) {
  if (y < 0 || y >= grid.length) return -1;
  if (x < 0 || x >= grid[y].length) return -1;
  return grid[y][x];
}

// Get tiles occupied by an item
function getOccupiedTiles(item) {
  const size = ITEM_SIZES[item.spriteId] || [1, 1];
  let [w, d] = size;

  // Direction 2 or 6: rotate 90 degrees (swap width and depth)
  if (item.dir === 2 || item.dir === 6) {
    [w, d] = [d, w];
  }

  const tiles = [];
  for (let dx = 0; dx < w; dx++) {
    for (let dy = 0; dy < d; dy++) {
      tiles.push([item.x + dx, item.y + dy]);
    }
  }
  return tiles;
}

import { readFileSync } from 'fs';

// Parse RoomModels.ts manually (it's TypeScript so we can't import directly)
const modelsSrc = readFileSync('./libs/renderer/src/nitro/communication/p2p/RoomModels.ts', 'utf-8');

// Extract heightmaps from source
function extractModels(src) {
  const models = {};
  const modelRegex = /(\w+):\s*\{\s*modelName:\s*"([^"]+)",\s*entryX:\s*(\d+),\s*entryY:\s*(\d+),\s*entryDir:\s*(\d+),\s*heightmap:\s*([\s\S]*?)\},/g;
  let m;
  while ((m = modelRegex.exec(src)) !== null) {
    // Reconstruct the heightmap string from the concatenated string literals
    const hmRaw = m[6];
    const parts = hmRaw.match(/"([^"]+)"/g);
    if (parts) {
      const hm = parts.map(p => p.slice(1, -1).replace(/\\r/g, '\r')).join('');
      models[m[1]] = {
        modelName: m[2],
        entryX: parseInt(m[3]),
        entryY: parseInt(m[4]),
        entryDir: parseInt(m[5]),
        heightmap: hm,
      };
    }
  }
  return models;
}

const ROOM_MODELS = extractModels(modelsSrc);

const furnitureSrc = readFileSync('./libs/renderer/src/nitro/communication/p2p/RoomFurniture.ts', 'utf-8');

// Map sprite names to IDs
const spriteMap = {
  'CHAIR_POLYFON': 18, 'CHAIR_SILO': 26, 'SOFA_SILO': 28,
  'TABLE_POLY_SM': 17, 'TABLE_NORJA_MED': 20, 'SHELVES_NORJA': 13,
  'SHELVES_POLYFON': 14, 'LAMP_ARMAS': 57, 'LAMP_BASIC': 199,
  'FIREPLACE_ARMAS': 56, 'FIREPLACE_POLY': 62, 'CARPET_STD': 59,
  'DOORMAT_LOVE': 32, 'PIZZA': 122, 'BAR_POLYFON': 127,
  'BOTTLE': 129, 'EDICE': 239, 'BED_POLYFON': 41,
  'DOORMAT_PLAIN': 33, 'TABLE_PLASTO_RND': 23,
};

let problems = [];
let warnings = [];

// Parse the furniture file to extract layouts
const sectionRegex = /^  (\w+):\s*\{$/gm;
let sections = [];
let m;
while ((m = sectionRegex.exec(furnitureSrc)) !== null) {
  sections.push({ name: m[1], index: m.index });
}

const modelLayouts = {};
for (let i = 0; i < sections.length; i++) {
  const name = sections[i].name;
  const start = sections[i].index;
  const end = i + 1 < sections.length ? sections[i + 1].index : furnitureSrc.length;
  const chunk = furnitureSrc.substring(start, end);

  const items = [];
  let im;
  const ir = /\{\s*spriteId:\s*(\w+),\s*x:\s*(\d+),\s*y:\s*(\d+),\s*z:\s*([\d.]+),\s*dir:\s*(\d+)/g;
  while ((im = ir.exec(chunk)) !== null) {
    const spriteName = im[1];
    const spriteId = spriteMap[spriteName] || parseInt(spriteName);
    items.push({
      spriteName,
      spriteId,
      x: parseInt(im[2]),
      y: parseInt(im[3]),
      z: parseFloat(im[4]),
      dir: parseInt(im[5]),
    });
  }
  modelLayouts[name] = items;
}

// Now audit each model
for (const modelKey of Object.keys(modelLayouts)) {
  const model = ROOM_MODELS[modelKey];
  if (!model) {
    warnings.push(`Layout defined for ${modelKey} but no room model exists`);
    continue;
  }

  const grid = parseHeightmap(model.heightmap);
  const items = modelLayouts[modelKey];
  const occupiedMap = {}; // "x,y" -> item name

  for (const item of items) {
    const tiles = getOccupiedTiles(item);

    for (const [tx, ty] of tiles) {
      if (!isWalkable(grid, tx, ty)) {
        const ch = (ty >= 0 && ty < grid.length && tx >= 0 && tx < grid[ty].length)
          ? grid[ty][tx] : 'OOB';
        problems.push({
          model: modelKey,
          item: item.spriteName,
          spriteId: item.spriteId,
          pos: `(${item.x},${item.y})`,
          tile: `(${tx},${ty})`,
          issue: ch === 'OOB' ? 'OUT OF BOUNDS' : `VOID TILE (${ch === -1 ? 'x' : ch})`,
          dir: item.dir,
        });
      } else {
        // Check z-value matches tile height
        const tileH = getTileHeight(grid, tx, ty);
        const baseZ = Math.floor(item.z);
        if (baseZ !== tileH) {
          problems.push({
            model: modelKey,
            item: item.spriteName,
            spriteId: item.spriteId,
            pos: `(${item.x},${item.y})`,
            tile: `(${tx},${ty})`,
            issue: `WRONG Z: item z=${item.z}, tile height=${tileH}`,
            dir: item.dir,
          });
        }

        // Check for multi-tile items spanning different heights
        if (tiles.length > 1) {
          const anchorH = getTileHeight(grid, item.x, item.y);
          if (tileH !== anchorH && tileH >= 0 && anchorH >= 0) {
            problems.push({
              model: modelKey,
              item: item.spriteName,
              spriteId: item.spriteId,
              pos: `(${item.x},${item.y})`,
              tile: `(${tx},${ty})`,
              issue: `HEIGHT BOUNDARY: anchor tile h=${anchorH}, extended tile h=${tileH}`,
              dir: item.dir,
            });
          }
        }

        // Track occupied tiles for overlap detection
        const key = `${tx},${ty}`;
        if (occupiedMap[key] && occupiedMap[key] !== item.spriteName + `@(${item.x},${item.y})`) {
          // Allow stacked items (one has fractional z — it's ON another item)
          const otherItem = items.find(i =>
            i.spriteName + `@(${i.x},${i.y})` === occupiedMap[key]
          );
          if (otherItem && Math.floor(item.z) === Math.floor(otherItem.z)) {
            warnings.push(`${modelKey}: ${item.spriteName}@(${item.x},${item.y}) overlaps ${occupiedMap[key]} at tile (${tx},${ty})`);
          }
        }
        occupiedMap[key] = item.spriteName + `@(${item.x},${item.y})`;
      }
    }

    // Check if item blocks entry
    for (const [tx, ty] of tiles) {
      if (tx === model.entryX && ty === model.entryY) {
        warnings.push(`${modelKey}: ${item.spriteName}@(${item.x},${item.y}) BLOCKS ENTRY TILE (${model.entryX},${model.entryY})`);
      }
    }
  }
}

// Print results
if (problems.length === 0 && warnings.length === 0) {
  console.log('✓ No problems found! All furniture coordinates are valid.');
} else {
  if (problems.length > 0) {
    console.log(`✗ Found ${problems.length} ERRORS:\n`);

    // Group by model
    const byModel = {};
    for (const p of problems) {
      if (!byModel[p.model]) byModel[p.model] = [];
      byModel[p.model].push(p);
    }

    for (const [model, probs] of Object.entries(byModel)) {
      console.log(`=== ${model} ===`);
      // Deduplicate (same item + same issue type)
      const seen = new Set();
      for (const p of probs) {
        const key = `${p.item}@${p.pos} ${p.issue}`;
        if (seen.has(key)) continue;
        seen.add(key);
        console.log(`  ${p.item}(${p.spriteId}) at ${p.pos} dir=${p.dir} -> tile ${p.tile}: ${p.issue}`);
      }
      console.log();
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠ ${warnings.length} WARNINGS:\n`);
    for (const w of warnings) {
      console.log(`  ${w}`);
    }
  }
}

// Check for models without furniture
const allModelKeys = Object.keys(ROOM_MODELS);
const furnishedKeys = Object.keys(modelLayouts);
const unfurnished = allModelKeys.filter(k => !furnishedKeys.includes(k));
if (unfurnished.length > 0) {
  console.log(`\n⚠ ${unfurnished.length} room models have NO furniture:`, unfurnished.join(', '));
}
