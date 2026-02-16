import React, { useState } from 'react';
import { useTick } from '@pixi/react';
import { useGameStore } from '../state/store';
import { getDistance } from '../utils/geometry';

const ROLE_COLORS = {
    'Informant': { body: 0x0f766e, head: 0xd4a574, accent: 0x14b8a6 },
    'Civilian': { body: 0x78716c, head: 0xd4a574, accent: 0xa8a29e },
    'Hacker': { body: 0x4c1d95, head: 0xd4a574, accent: 0x8b5cf6 },
    'Guard Captain': { body: 0x713f12, head: 0xd4a574, accent: 0xf59e0b },
    'default': { body: 0x555555, head: 0xd4a574, accent: 0x888888 },
};

const NPC = ({ id, x, y, role, name }) => {
    const [indicatorPhase, setIndicatorPhase] = useState(0);
    const playerPos = useGameStore((state) => state.player);

    const dist = getDistance({ x, y }, playerPos);
    const isNearby = dist < 60;

    useTick((ticker) => {
        setIndicatorPhase((prev) => (prev + 0.05 * ticker.deltaTime) % (Math.PI * 2));
    });

    const colors = ROLE_COLORS[role] || ROLE_COLORS['default'];
    const floatOffset = Math.sin(indicatorPhase) * 3;

    return (
        <graphics
            draw={(g) => {
                g.clear();

                // === INTERACTION INDICATOR ===
                if (isNearby) {
                    // Floating "?" or interaction ring
                    const indicatorY = -28 + floatOffset;

                    // Glow circle
                    g.circle(0, indicatorY, 8);
                    g.fill({ color: colors.accent, alpha: 0.3 });
                    g.circle(0, indicatorY, 5);
                    g.fill({ color: colors.accent, alpha: 0.7 });

                    // "E" key hint  
                    // (We draw a small square with "E")
                    g.roundRect(-6, indicatorY + 12, 12, 10, 2);
                    g.fill({ color: 0x000000, alpha: 0.6 });
                    g.roundRect(-5, indicatorY + 13, 10, 8, 2);
                    g.stroke({ width: 1, color: colors.accent, alpha: 0.8 });

                    // Interaction range circle
                    g.circle(0, 0, 50);
                    g.stroke({ width: 1, color: colors.accent, alpha: 0.15 });
                }

                // === NPC BODY (top-down civilian) ===

                // Shadow
                g.ellipse(0, 2, 12, 7);
                g.fill({ color: 0x000000, alpha: 0.25 });

                // Body
                g.roundRect(-9, -7, 18, 20, 4);
                g.fill(colors.body);

                // Shirt detail
                g.roundRect(-7, -5, 14, 16, 3);
                g.fill({ color: colors.body, alpha: 0.7 });

                // Arms
                g.roundRect(-11, -4, 4, 10, 2);
                g.fill(colors.body);
                g.roundRect(7, -4, 4, 10, 2);
                g.fill(colors.body);

                // Head
                g.circle(0, -11, 7);
                g.fill(colors.head);

                // Hair/hat based on role
                if (role === 'Hacker') {
                    // Hoodie
                    g.arc(0, -11, 8, Math.PI, 0);
                    g.fill({ color: 0x3b0764, alpha: 0.9 });
                } else if (role === 'Guard Captain') {
                    // Cap
                    g.roundRect(-7, -17, 14, 5, 2);
                    g.fill(0x713f12);
                }

                // Eyes (small dots)
                g.circle(-3, -12, 1.5);
                g.fill(0x222222);
                g.circle(3, -12, 1.5);
                g.fill(0x222222);

                // Legs
                g.roundRect(-7, 13, 5, 7, 2);
                g.fill({ color: colors.body, alpha: 0.6 });
                g.roundRect(2, 13, 5, 7, 2);
                g.fill({ color: colors.body, alpha: 0.6 });

                // Role indicator dot
                g.circle(0, -20, 3);
                g.fill({ color: colors.accent, alpha: 0.5 + Math.sin(indicatorPhase) * 0.3 });
            }}
            x={x}
            y={y}
        />
    );
};

export default NPC;
