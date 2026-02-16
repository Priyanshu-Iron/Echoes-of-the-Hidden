import React from 'react';
import { useTick } from '@pixi/react';
import { useGameStore } from '../state/store';
import { useInput } from '../utils/useInput';

const Player = () => {
    const { x, y, speed } = useGameStore((state) => state.player);
    const movePlayer = useGameStore((state) => state.movePlayer);
    const keys = useInput();

    // Game Loop for Player Movement
    useTick((ticker) => {
        // ticker.deltaTime is usually ~1.0 at 60fps
        const delta = ticker.deltaTime;
        let dx = 0;
        let dy = 0;
        const moveSpeed = speed * delta;

        if (keys['ArrowUp'] || keys['KeyW']) dy -= moveSpeed;
        if (keys['ArrowDown'] || keys['KeyS']) dy += moveSpeed;
        if (keys['ArrowLeft'] || keys['KeyA']) dx -= moveSpeed;
        if (keys['ArrowRight'] || keys['KeyD']) dx += moveSpeed;

        if (dx !== 0 || dy !== 0) {
            // Normalize diagonal movement
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
                // Player body
                g.rect(-16, -16, 32, 32);
                g.fill(0x00ff00);

                // Direction indicator
                g.moveTo(0, 0);
                g.lineTo(16, 0);
                g.stroke({ width: 2, color: 0xffffff });
            }}
            x={x}
            y={y}
        />
    );
};

export default Player;
