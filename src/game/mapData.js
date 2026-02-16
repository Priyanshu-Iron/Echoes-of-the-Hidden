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

// Color palette for tiles — clean light theme
export const TILE_COLORS = {
  [TILE.FLOOR]:      0xf0f0f5,
  [TILE.FLOOR_ALT]:  0xe8e8f0,
  [TILE.WALL]:       0xc8c8d4,
  [TILE.RESTRICTED]: 0xfce4e4,
  [TILE.EXIT]:       0xd4f5d4,
  [TILE.DOOR]:       0xe0dcc8,
};

export const WALL_TOP_COLOR = 0xd8d8e4;
export const WALL_SHADOW_COLOR = 0xb0b0c0;

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
  // Original 4 guards
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
  // 4 NEW guards
  {
    id: 5,
    x: 8 * TILE_SIZE, y: 5 * TILE_SIZE,
    path: [
      { x: 5 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 14 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 14 * TILE_SIZE, y: 11 * TILE_SIZE },
      { x: 5 * TILE_SIZE, y: 11 * TILE_SIZE },
    ]
  },
  {
    id: 6,
    x: 10 * TILE_SIZE, y: 36 * TILE_SIZE,
    path: [
      { x: 5 * TILE_SIZE, y: 34 * TILE_SIZE },
      { x: 16 * TILE_SIZE, y: 34 * TILE_SIZE },
      { x: 16 * TILE_SIZE, y: 40 * TILE_SIZE },
      { x: 5 * TILE_SIZE, y: 40 * TILE_SIZE },
    ]
  },
  {
    id: 7,
    x: 28 * TILE_SIZE, y: 5 * TILE_SIZE,
    path: [
      { x: 20 * TILE_SIZE, y: 5 * TILE_SIZE },
      { x: 38 * TILE_SIZE, y: 5 * TILE_SIZE },
    ]
  },
  {
    id: 8,
    x: 42 * TILE_SIZE, y: 34 * TILE_SIZE,
    path: [
      { x: 38 * TILE_SIZE, y: 34 * TILE_SIZE },
      { x: 42 * TILE_SIZE, y: 34 * TILE_SIZE },
      { x: 42 * TILE_SIZE, y: 40 * TILE_SIZE },
      { x: 38 * TILE_SIZE, y: 40 * TILE_SIZE },
    ]
  },
];

/** NPC Spawns with personality, backstory, and available missions for AI. */
export const NPC_SPAWNS = [
  {
    id: 'npc_informant', x: 8 * TILE_SIZE, y: 7 * TILE_SIZE,
    role: 'Informant', name: 'Shadow Broker',
    personality: 'Paranoid, cryptic, speaks in riddles. Trusts no one but respects bold agents.',
    backstory: 'Former intelligence analyst who went rogue after discovering corruption. Now trades secrets from the shadows.',
    missions: [
      { id: 'shadow_intel', title: 'Stolen Intelligence', description: 'Recover the classified dossier from the Server Room before it gets wiped.' },
      { id: 'shadow_wiretap', title: 'Wiretap the Captain', description: 'Plant a listening device near the Guard Captain in the Armory.' },
    ],
  },
  {
    id: 'npc_civilian', x: 8 * TILE_SIZE, y: 36 * TILE_SIZE,
    role: 'Civilian', name: 'Kitchen Worker',
    personality: 'Friendly but nervous. Gossips a lot. Knows secrets from overhearing guard conversations.',
    backstory: 'Works in the mess hall. Overhears guard rotations and supply schedules. Desperate for someone to help her brother escape.',
    missions: [
      { id: 'kitchen_distraction', title: 'Create a Distraction', description: 'Set off the fire alarm in the Mess Hall so the guards leave their posts.' },
      { id: 'kitchen_rescue', title: 'Find My Brother', description: 'My brother is held somewhere in the Command Center. Please find any sign of him.' },
    ],
  },
  {
    id: 'npc_hacker', x: 26 * TILE_SIZE, y: 6 * TILE_SIZE,
    role: 'Hacker', name: 'Ghost',
    personality: 'Sarcastic tech genius. Speaks in tech jargon. Loves showing off skills but is genuinely helpful.',
    backstory: 'Elite hacker implanted inside the compound. Can access security systems and disable cameras, but needs physical access to terminals.',
    missions: [
      { id: 'hack_cameras', title: 'Disable Surveillance', description: 'Reach the Security Office and plug in my USB drive to disable all cameras for 5 minutes.' },
      { id: 'hack_download', title: 'Data Extraction', description: 'Access the Server Room terminal and download the encrypted files to this drive.' },
    ],
  },
  {
    id: 'npc_guard_captain', x: 48 * TILE_SIZE, y: 20 * TILE_SIZE,
    role: 'Guard Captain', name: 'Ironjaw',
    personality: 'Stern, authoritative, but secretly conflicted about orders. Respects strength and directness.',
    backstory: 'Veteran guard captain who suspects the compound leadership is corrupt. Might help if you earn his respect, but will attack if provoked.',
    missions: [
      { id: 'captain_proof', title: 'Evidence of Corruption', description: 'Bring me proof of the Commander\'s illegal orders from the Command Center.' },
      { id: 'captain_defect', title: 'Convince the Ranks', description: 'Talk to 3 guards and show them the evidence. I\'ll handle the rest.' },
    ],
  },
  {
    id: 'npc_doctor', x: 10 * TILE_SIZE, y: 22 * TILE_SIZE,
    role: 'Doctor', name: 'Dr. Voss',
    personality: 'Quiet, empathetic, morally conflicted. Heals anyone who asks but knows too much about experiments.',
    backstory: 'The compound\'s medic. Has been forced to perform unethical experiments on prisoners. Wants to expose the truth but fears retaliation.',
    missions: [
      { id: 'doctor_samples', title: 'Destroy the Samples', description: 'There are biological samples in the restricted Server Room. Destroy them before they\'re shipped out.' },
      { id: 'doctor_records', title: 'Medical Records', description: 'Steal the experiment logs from the Command Center. The world needs to know.' },
    ],
  },
  {
    id: 'npc_dealer', x: 48 * TILE_SIZE, y: 22 * TILE_SIZE,
    role: 'Arms Dealer', name: 'Viper',
    personality: 'Charming, untrustworthy, always angling for profit. Speaks in deals and negotiations.',
    backstory: 'Black market dealer who smuggles weapons through the Armory. Has connections everywhere and will sell anything — for the right price.',
    missions: [
      { id: 'dealer_supply', title: 'Smuggle the Package', description: 'Pick up a package from the Storage room and bring it to me. No questions asked.' },
      { id: 'dealer_sabotage', title: 'Sabotage the Armory', description: 'Tamper with the weapon crates in the Armory to make them malfunction.' },
    ],
  },
];

// Player spawn
export const PLAYER_SPAWN = { x: 20 * TILE_SIZE, y: 14 * TILE_SIZE };
