// Map Configuration
export const TILE_SIZE = 40;
export const MAP_COLS = 60;
export const MAP_ROWS = 45;
export const MAP_WIDTH = MAP_COLS * TILE_SIZE;  // 2400
export const MAP_HEIGHT = MAP_ROWS * TILE_SIZE; // 1800

// Tile Types
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  RESTRICTED: 2,
  EXIT: 3,
  FLOOR_ALT: 4,   // Slightly different shade for visual variety
  DOOR: 5,
};

// Color palette for tiles
export const TILE_COLORS = {
  [TILE.FLOOR]:      0x1a1a2e,
  [TILE.FLOOR_ALT]:  0x16162a,
  [TILE.WALL]:       0x2d2d44,
  [TILE.RESTRICTED]: 0x2e1a1a,
  [TILE.EXIT]:       0x1a2e1a,
  [TILE.DOOR]:       0x2a2a1a,
};

export const WALL_TOP_COLOR = 0x3d3d5c;
export const WALL_SHADOW_COLOR = 0x0d0d15;

// Helper to create a filled rectangle in the map
const fillRect = (map, x, y, w, h, tile) => {
  for (let row = y; row < y + h && row < MAP_ROWS; row++) {
    for (let col = x; col < x + w && col < MAP_COLS; col++) {
      map[row][col] = tile;
    }
  }
};

// Helper to draw border walls around a room
const drawRoom = (map, x, y, w, h) => {
  // Top and bottom walls
  for (let col = x; col < x + w; col++) {
    map[y][col] = TILE.WALL;
    map[y + h - 1][col] = TILE.WALL;
  }
  // Left and right walls
  for (let row = y; row < y + h; row++) {
    map[row][x] = TILE.WALL;
    map[row][x + w - 1] = TILE.WALL;
  }
  // Fill interior with floor
  fillRect(map, x + 1, y + 1, w - 2, h - 2, TILE.FLOOR);
};

// Add a door (gap) in a wall
const addDoor = (map, x, y, size = 2) => {
  for (let i = 0; i < size; i++) {
    if (x + i < MAP_COLS && y < MAP_ROWS) {
      map[y][x + i] = TILE.DOOR;
    }
  }
};

const addVertDoor = (map, x, y, size = 2) => {
  for (let i = 0; i < size; i++) {
    if (x < MAP_COLS && y + i < MAP_ROWS) {
      map[y + i][x] = TILE.DOOR;
    }
  }
};

// Generate the stealth compound map
const generateMap = () => {
  // Start with all walls
  const map = Array.from({ length: MAP_ROWS }, () =>
    Array(MAP_COLS).fill(TILE.WALL)
  );

  // === OUTER COMPOUND ===
  // Main compound area — large open space surrounded by thick walls
  fillRect(map, 2, 2, 56, 41, TILE.FLOOR);

  // Add alternating floor tiles for visual texture (checkerboard)
  for (let r = 2; r < 43; r++) {
    for (let c = 2; c < 58; c++) {
      if (map[r][c] === TILE.FLOOR && (r + c) % 4 === 0) {
        map[r][c] = TILE.FLOOR_ALT;
      }
    }
  }

  // === ROOMS ===

  // --- Top-left: Security Office ---
  drawRoom(map, 3, 3, 12, 10);
  addDoor(map, 10, 12, 2);  // Door at bottom

  // --- Top-right: Server Room (restricted) ---
  drawRoom(map, 42, 3, 14, 10);
  fillRect(map, 43, 4, 12, 8, TILE.RESTRICTED);
  addDoor(map, 48, 12, 2);

  // --- Middle-left: Barracks ---
  drawRoom(map, 3, 16, 14, 12);
  addDoor(map, 12, 22, 2);  // Door on right side area
  addVertDoor(map, 16, 21, 2);

  // --- Central Courtyard (open area with pillars) ---
  // Pillar columns in the courtyard
  const pillarPositions = [
    [24, 18], [30, 18], [36, 18],
    [24, 24], [30, 24], [36, 24],
    [24, 30], [30, 30], [36, 30],
  ];
  pillarPositions.forEach(([col, row]) => {
    map[row][col] = TILE.WALL;
    map[row][col + 1] = TILE.WALL;
    map[row + 1][col] = TILE.WALL;
    map[row + 1][col + 1] = TILE.WALL;
  });

  // --- Middle-right: Armory ---
  drawRoom(map, 44, 16, 12, 10);
  addVertDoor(map, 44, 20, 2);

  // --- Bottom-left: Mess Hall ---
  drawRoom(map, 3, 31, 16, 11);
  addDoor(map, 14, 31, 2);  // Door at top

  // --- Bottom-center: Storage ---
  drawRoom(map, 22, 34, 14, 8);
  addDoor(map, 28, 34, 2);  // Door at top

  // --- Bottom-right: Command Center (restricted) ---
  drawRoom(map, 42, 30, 14, 12);
  fillRect(map, 43, 31, 12, 10, TILE.RESTRICTED);
  addVertDoor(map, 42, 35, 2);

  // --- Top-center: Corridor Rooms ---
  drawRoom(map, 18, 3, 10, 8);
  addDoor(map, 22, 10, 2);

  drawRoom(map, 30, 3, 10, 8);
  addDoor(map, 34, 10, 2);

  // === CORRIDORS ===
  // Horizontal corridor across middle
  fillRect(map, 2, 14, 56, 2, TILE.FLOOR_ALT);

  // Vertical corridor on left
  fillRect(map, 17, 2, 2, 41, TILE.FLOOR_ALT);

  // Vertical corridor on right  
  fillRect(map, 41, 2, 2, 41, TILE.FLOOR_ALT);

  // Horizontal corridor at bottom
  fillRect(map, 2, 32, 56, 2, TILE.FLOOR_ALT);

  // === EXIT POINT ===
  fillRect(map, 28, 0, 4, 3, TILE.EXIT);

  return map;
};

export const MAP_DATA = generateMap();

// Check if a position (in pixels) is walkable
export const isWalkable = (pixelX, pixelY) => {
  const col = Math.floor(pixelX / TILE_SIZE);
  const row = Math.floor(pixelY / TILE_SIZE);
  
  if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
  
  const tile = MAP_DATA[row][col];
  return tile !== TILE.WALL;
};

// Check if a bounding box can move to a position
export const canMoveTo = (x, y, halfWidth = 12, halfHeight = 12) => {
  return (
    isWalkable(x - halfWidth, y - halfHeight) &&
    isWalkable(x + halfWidth, y - halfHeight) &&
    isWalkable(x - halfWidth, y + halfHeight) &&
    isWalkable(x + halfWidth, y + halfHeight)
  );
};

// Guard/NPC spawn points (on walkable tiles)
export const GUARD_SPAWNS = [
  {
    id: 1,
    x: 10 * TILE_SIZE, y: 15 * TILE_SIZE,
    path: [
      { x: 10 * TILE_SIZE, y: 15 * TILE_SIZE },
      { x: 38 * TILE_SIZE, y: 15 * TILE_SIZE },
      { x: 38 * TILE_SIZE, y: 15 * TILE_SIZE },
      { x: 10 * TILE_SIZE, y: 15 * TILE_SIZE },
    ]
  },
  {
    id: 2,
    x: 42 * TILE_SIZE, y: 8 * TILE_SIZE,
    path: [
      { x: 42 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 42 * TILE_SIZE, y: 12 * TILE_SIZE },
    ]
  },
  {
    id: 3,
    x: 30 * TILE_SIZE, y: 22 * TILE_SIZE,
    path: [
      { x: 24 * TILE_SIZE, y: 20 * TILE_SIZE },
      { x: 36 * TILE_SIZE, y: 20 * TILE_SIZE },
      { x: 36 * TILE_SIZE, y: 28 * TILE_SIZE },
      { x: 24 * TILE_SIZE, y: 28 * TILE_SIZE },
    ]
  },
  {
    id: 4,
    x: 48 * TILE_SIZE, y: 33 * TILE_SIZE,
    path: [
      { x: 44 * TILE_SIZE, y: 33 * TILE_SIZE },
      { x: 54 * TILE_SIZE, y: 33 * TILE_SIZE },
      { x: 54 * TILE_SIZE, y: 40 * TILE_SIZE },
      { x: 44 * TILE_SIZE, y: 40 * TILE_SIZE },
    ]
  },
];

export const NPC_SPAWNS = [
  { id: 'npc_informant', x: 8 * TILE_SIZE, y: 7 * TILE_SIZE, role: 'Informant', name: 'Shadow Broker' },
  { id: 'npc_civilian', x: 8 * TILE_SIZE, y: 36 * TILE_SIZE, role: 'Civilian', name: 'Kitchen Worker' },
  { id: 'npc_hacker', x: 26 * TILE_SIZE, y: 6 * TILE_SIZE, role: 'Hacker', name: 'Ghost' },
  { id: 'npc_guard_captain', x: 48 * TILE_SIZE, y: 20 * TILE_SIZE, role: 'Guard Captain', name: 'Ironjaw' },
];

// Player spawn
export const PLAYER_SPAWN = { x: 20 * TILE_SIZE, y: 14 * TILE_SIZE };
