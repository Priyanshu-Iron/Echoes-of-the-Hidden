/**
 * Unit tests for map data, collision, and walkability.
 * Tests tile types, boundary conditions, and spawn point validity.
 */

import { describe, it, expect } from 'vitest';
import {
  TILE_SIZE, MAP_COLS, MAP_ROWS, MAP_WIDTH, MAP_HEIGHT,
  TILE, MAP_DATA, isWalkable, canMoveTo,
  PLAYER_SPAWN, GUARD_SPAWNS, NPC_SPAWNS,
} from '../mapData';

describe('Map Constants', () => {
  it('has correct dimensions', () => {
    expect(MAP_WIDTH).toBe(MAP_COLS * TILE_SIZE);
    expect(MAP_HEIGHT).toBe(MAP_ROWS * TILE_SIZE);
  });

  it('MAP_DATA has correct number of rows', () => {
    expect(MAP_DATA.length).toBe(MAP_ROWS);
  });

  it('MAP_DATA has correct number of columns in each row', () => {
    for (let row = 0; row < MAP_ROWS; row++) {
      expect(MAP_DATA[row].length).toBe(MAP_COLS);
    }
  });

  it('TILE_SIZE is a positive number', () => {
    expect(TILE_SIZE).toBeGreaterThan(0);
  });
});

describe('isWalkable (pixel coordinates)', () => {
  it('returns true for FLOOR tile center', () => {
    // Find a floor tile and test its pixel center
    let found = false;
    for (let r = 0; r < MAP_ROWS && !found; r++) {
      for (let c = 0; c < MAP_COLS && !found; c++) {
        if (MAP_DATA[r][c] === TILE.FLOOR) {
          const pixelX = c * TILE_SIZE + TILE_SIZE / 2;
          const pixelY = r * TILE_SIZE + TILE_SIZE / 2;
          expect(isWalkable(pixelX, pixelY)).toBe(true);
          found = true;
        }
      }
    }
    expect(found).toBe(true);
  });

  it('returns false for WALL tile center', () => {
    // (0,0) is always a wall
    const pixelX = TILE_SIZE / 2;
    const pixelY = TILE_SIZE / 2;
    expect(isWalkable(pixelX, pixelY)).toBe(false);
  });

  it('returns false for out-of-bounds (negative)', () => {
    expect(isWalkable(-10, -10)).toBe(false);
  });

  it('returns false for out-of-bounds (beyond map)', () => {
    expect(isWalkable(MAP_WIDTH + 10, MAP_HEIGHT + 10)).toBe(false);
  });

  it('returns true for EXIT tile', () => {
    let found = false;
    for (let r = 0; r < MAP_ROWS && !found; r++) {
      for (let c = 0; c < MAP_COLS && !found; c++) {
        if (MAP_DATA[r][c] === TILE.EXIT) {
          const pixelX = c * TILE_SIZE + TILE_SIZE / 2;
          const pixelY = r * TILE_SIZE + TILE_SIZE / 2;
          expect(isWalkable(pixelX, pixelY)).toBe(true);
          found = true;
        }
      }
    }
  });

  it('returns true for DOOR tile', () => {
    let found = false;
    for (let r = 0; r < MAP_ROWS && !found; r++) {
      for (let c = 0; c < MAP_COLS && !found; c++) {
        if (MAP_DATA[r][c] === TILE.DOOR) {
          const pixelX = c * TILE_SIZE + TILE_SIZE / 2;
          const pixelY = r * TILE_SIZE + TILE_SIZE / 2;
          expect(isWalkable(pixelX, pixelY)).toBe(true);
          found = true;
        }
      }
    }
  });

  it('returns true for RESTRICTED tile (walkable but dangerous)', () => {
    let found = false;
    for (let r = 0; r < MAP_ROWS && !found; r++) {
      for (let c = 0; c < MAP_COLS && !found; c++) {
        if (MAP_DATA[r][c] === TILE.RESTRICTED) {
          const pixelX = c * TILE_SIZE + TILE_SIZE / 2;
          const pixelY = r * TILE_SIZE + TILE_SIZE / 2;
          expect(isWalkable(pixelX, pixelY)).toBe(true);
          found = true;
        }
      }
    }
  });
});

describe('canMoveTo', () => {
  it('allows movement to the player spawn point', () => {
    expect(canMoveTo(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 12, 12)).toBe(true);
  });

  it('blocks movement outside the map entirely', () => {
    expect(canMoveTo(-100, -100, 12, 12)).toBe(false);
    expect(canMoveTo(MAP_WIDTH + 100, MAP_HEIGHT + 100, 12, 12)).toBe(false);
  });

  it('blocks movement into a wall', () => {
    // (0, 0) tile is a wall, pixel center is (20, 20)
    expect(canMoveTo(20, 20, 12, 12)).toBe(false);
  });

  it('allows movement in a known floor area', () => {
    expect(canMoveTo(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 12, 12)).toBe(true);
  });
});

describe('Spawn Points', () => {
  it('player spawn is walkable', () => {
    expect(isWalkable(PLAYER_SPAWN.x, PLAYER_SPAWN.y)).toBe(true);
    expect(canMoveTo(PLAYER_SPAWN.x, PLAYER_SPAWN.y, 12, 12)).toBe(true);
  });

  it('all guard spawns are walkable', () => {
    GUARD_SPAWNS.forEach((spawn) => {
      expect(isWalkable(spawn.x, spawn.y)).toBe(true);
    });
  });

  it('all NPC spawns are walkable', () => {
    NPC_SPAWNS.forEach((spawn) => {
      expect(isWalkable(spawn.x, spawn.y)).toBe(true);
    });
  });

  it('guard spawns have required properties', () => {
    GUARD_SPAWNS.forEach((spawn) => {
      expect(spawn).toHaveProperty('id');
      expect(spawn).toHaveProperty('x');
      expect(spawn).toHaveProperty('y');
      expect(spawn).toHaveProperty('path');
      expect(typeof spawn.x).toBe('number');
      expect(typeof spawn.y).toBe('number');
      expect(Array.isArray(spawn.path)).toBe(true);
    });
  });

  it('NPC spawns have required properties', () => {
    NPC_SPAWNS.forEach((spawn) => {
      expect(spawn).toHaveProperty('id');
      expect(spawn).toHaveProperty('x');
      expect(spawn).toHaveProperty('y');
      expect(spawn).toHaveProperty('role');
      expect(spawn).toHaveProperty('name');
    });
  });
});
