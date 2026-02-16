import React, { useMemo } from 'react';
import {
    MAP_DATA, MAP_COLS, MAP_ROWS, TILE_SIZE,
    TILE, TILE_COLORS, WALL_TOP_COLOR, WALL_SHADOW_COLOR
} from './mapData';

const TileMap = () => {
    const drawMap = useMemo(() => {
        return (g) => {
            g.clear();

            for (let row = 0; row < MAP_ROWS; row++) {
                for (let col = 0; col < MAP_COLS; col++) {
                    const tile = MAP_DATA[row][col];
                    const x = col * TILE_SIZE;
                    const y = row * TILE_SIZE;

                    // Base tile color
                    const baseColor = TILE_COLORS[tile] || TILE_COLORS[TILE.FLOOR];
                    g.rect(x, y, TILE_SIZE, TILE_SIZE);
                    g.fill(baseColor);

                    if (tile === TILE.WALL || tile === TILE.BUILDING) {
                        // Wall/Building top face
                        g.rect(x, y, TILE_SIZE, TILE_SIZE * 0.6);
                        g.fill(tile === TILE.BUILDING ? 0x888899 : WALL_TOP_COLOR);

                        // Side/Shadow
                        g.rect(x, y + TILE_SIZE * 0.6, TILE_SIZE, TILE_SIZE * 0.4);
                        g.fill(tile === TILE.BUILDING ? 0x666677 : WALL_SHADOW_COLOR);

                        // Highlights
                        g.rect(x, y, TILE_SIZE, 2);
                        g.fill({ color: 0xffffff, alpha: 0.4 });
                    }

                    if (tile === TILE.STREET) {
                        // Lane markings (dashed line in middle of street tiles)
                        // Simple logic: if row is even, draw a dash
                        if (row % 2 === 0) {
                            g.rect(x + TILE_SIZE / 2 - 2, y + 10, 4, 20);
                            g.fill({ color: 0xffffff, alpha: 0.3 });
                        }
                    }

                    if (tile === TILE.RESTRICTED) {
                        // Red warning stripes on light pink
                        g.rect(x, y, TILE_SIZE, 2);
                        g.fill({ color: 0xdd4444, alpha: 0.2 });
                        g.rect(x, y + TILE_SIZE - 2, TILE_SIZE, 2);
                        g.fill({ color: 0xdd4444, alpha: 0.2 });
                    }

                    if (tile === TILE.EXIT) {
                        // Green glow border
                        g.rect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
                        g.fill({ color: 0x22cc44, alpha: 0.12 });
                        g.rect(x, y, TILE_SIZE, 2);
                        g.fill({ color: 0x22cc44, alpha: 0.35 });
                    }

                    if (tile === TILE.DOOR) {
                        // Slightly warmer than floor, with a gap indicator
                        g.rect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
                        g.fill({ color: 0xc8c090, alpha: 0.4 });
                    }

                    // Grid lines (subtle gray on white)
                    if (tile !== TILE.WALL) {
                        g.rect(x, y, TILE_SIZE, 1);
                        g.fill({ color: 0x000000, alpha: 0.04 });
                        g.rect(x, y, 1, TILE_SIZE);
                        g.fill({ color: 0x000000, alpha: 0.04 });
                    }
                }
            }
        };
    }, []);

    return <graphics draw={drawMap} />;
};

export default TileMap;
