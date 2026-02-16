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

                // Shadow
                g.ellipse(0, 2, 14, 8);
                g.fill({ color: 0x000000, alpha: 0.15 });

                // Body (dark navy — high contrast on white)
                g.roundRect(-10, -8, 20, 22, 4);
                g.fill(0x1e293b);
                // Body highlight
                g.roundRect(-8, -6, 16, 18, 3);
                g.fill(0x334155);

                // Shoulders
                g.roundRect(-12, -6, 6, 10, 3);
                g.fill(0x1e293b);
                g.roundRect(6, -6, 6, 10, 3);
                g.fill(0x1e293b);

                // Head
                g.circle(0, -12, 8);
                g.fill(0x1e3a5f);
                // Face
                g.circle(0, -12, 6);
                g.fill(0xd4a574);
                // Eye visor / mask (teal)
                g.roundRect(-5, -14, 10, 4, 2);
                g.fill({ color: 0x06b6d4, alpha: 0.9 });

                // Direction indicator
                g.moveTo(0, -22);
                g.lineTo(-4, -18);
                g.lineTo(4, -18);
                g.lineTo(0, -22);
                g.fill({ color: 0x06b6d4, alpha: 0.7 });

                // Belt
                g.rect(-9, 4, 18, 3);
                g.fill(0x475569);

                // Legs
                g.roundRect(-8, 14, 6, 8, 2);
                g.fill(0x0f172a);
                g.roundRect(2, 14, 6, 8, 2);
                g.fill(0x0f172a);
            }}
            x={x}
            y={y}
            rotation={direction}
        />
    );
};

export default Player;
