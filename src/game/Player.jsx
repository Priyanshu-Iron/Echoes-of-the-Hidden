import React from 'react';
import { useTick } from '@pixi/react';
import { useGameStore } from '../state/store';
import { useInput } from '../utils/useInput';

const Player = () => {
    const { x, y, speed, direction } = useGameStore((state) => state.player);
    const movePlayer = useGameStore((state) => state.movePlayer);
    const keys = useInput();

    useTick((ticker) => {
        const delta = ticker.deltaTime;
        let dx = 0;
        let dy = 0;
        const moveSpeed = speed * delta;

        if (keys['ArrowUp'] || keys['KeyW']) dy -= moveSpeed;
        if (keys['ArrowDown'] || keys['KeyS']) dy += moveSpeed;
        if (keys['ArrowLeft'] || keys['KeyA']) dx -= moveSpeed;
        if (keys['ArrowRight'] || keys['KeyD']) dx += moveSpeed;

        if (dx !== 0 || dy !== 0) {
            if (dx !== 0 && dy !== 0) {
                const factor = 1 / Math.sqrt(2);
                dx *= factor;
                dy *= factor;
            }
            movePlayer(dx, dy);
        }
    });

    return (
        <graphics
            draw={(g) => {
                g.clear();

                // === TOP-DOWN PLAYER CHARACTER ===

                // Shadow
                g.ellipse(0, 2, 14, 8);
                g.fill({ color: 0x000000, alpha: 0.3 });

                // Body (torso)
                g.roundRect(-10, -8, 20, 22, 4);
                g.fill(0x1a1a2e);
                // Body highlight
                g.roundRect(-8, -6, 16, 18, 3);
                g.fill(0x252545);

                // Shoulders
                g.roundRect(-12, -6, 6, 10, 3);
                g.fill(0x1a1a2e);
                g.roundRect(6, -6, 6, 10, 3);
                g.fill(0x1a1a2e);

                // Head
                g.circle(0, -12, 8);
                g.fill(0x0f3460);
                // Head inner (face area)
                g.circle(0, -12, 6);
                g.fill(0xd4a574);
                // Eye visor / mask
                g.roundRect(-5, -14, 10, 4, 2);
                g.fill({ color: 0x00ffaa, alpha: 0.8 });

                // Direction indicator (pointing forward)
                g.moveTo(0, -22);
                g.lineTo(-4, -18);
                g.lineTo(4, -18);
                g.lineTo(0, -22);
                g.fill({ color: 0x00ffaa, alpha: 0.6 });

                // Belt
                g.rect(-9, 4, 18, 3);
                g.fill(0x333355);

                // Legs
                g.roundRect(-8, 14, 6, 8, 2);
                g.fill(0x151528);
                g.roundRect(2, 14, 6, 8, 2);
                g.fill(0x151528);
            }}
            x={x}
            y={y}
            rotation={direction}
        />
    );
};

export default Player;
