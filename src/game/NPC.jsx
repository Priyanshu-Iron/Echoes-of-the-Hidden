import React, { useState } from 'react';
import { useTick } from '@pixi/react';
import { useGameStore } from '../state/store';
import { getDistance } from '../utils/geometry';

/** Role-based color palettes — vibrant against white background */
const ROLE_COLORS = {
    'Informant': { body: 0x0d9488, head: 0xc9956b, accent: 0x14b8a6 },
    'Civilian': { body: 0x78716c, head: 0xc9956b, accent: 0x92857a },
    'Hacker': { body: 0x7c3aed, head: 0xc9956b, accent: 0x8b5cf6 },
    'Guard Captain': { body: 0xb45309, head: 0xc9956b, accent: 0xf59e0b },
    'Doctor': { body: 0x2563eb, head: 0xc9956b, accent: 0x60a5fa },
    'Arms Dealer': { body: 0x991b1b, head: 0xc9956b, accent: 0xf87171 },
    'default': { body: 0x6b7280, head: 0xc9956b, accent: 0x9ca3af },
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
                    const indicatorY = -28 + floatOffset;

                    // Glow circle
                    g.circle(0, indicatorY, 8);
                    g.fill({ color: colors.accent, alpha: 0.25 });
                    g.circle(0, indicatorY, 5);
                    g.fill({ color: colors.accent, alpha: 0.7 });

                    // "E" key hint box
                    g.roundRect(-6, indicatorY + 12, 12, 10, 2);
                    g.fill({ color: 0x1f2937, alpha: 0.7 });
                    g.roundRect(-5, indicatorY + 13, 10, 8, 2);
                    g.stroke({ width: 1, color: colors.accent, alpha: 0.8 });

                    // Interaction range circle
                    g.circle(0, 0, 50);
                    g.stroke({ width: 1, color: colors.accent, alpha: 0.12 });
                }

                // === NPC BODY (top-down) ===

                // Shadow
                g.ellipse(0, 2, 12, 7);
                g.fill({ color: 0x000000, alpha: 0.12 });

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
                    g.arc(0, -11, 8, Math.PI, 0);
                    g.fill({ color: 0x581c87, alpha: 0.9 });
                } else if (role === 'Guard Captain') {
                    g.roundRect(-7, -17, 14, 5, 2);
                    g.fill(0xb45309);
                } else if (role === 'Doctor') {
                    // White coat collar
                    g.roundRect(-8, -5, 16, 6, 2);
                    g.fill({ color: 0xffffff, alpha: 0.85 });
                    // Red cross
                    g.rect(-2, -16, 4, 8);
                    g.fill({ color: 0xef4444, alpha: 0.8 });
                    g.rect(-4, -14, 8, 4);
                    g.fill({ color: 0xef4444, alpha: 0.8 });
                } else if (role === 'Arms Dealer') {
                    // Bandana
                    g.roundRect(-7, -16, 14, 4, 1);
                    g.fill(0x991b1b);
                    // Scar mark
                    g.rect(4, -13, 2, 5);
                    g.fill({ color: 0xfca5a5, alpha: 0.6 });
                }

                // Eyes
                g.circle(-3, -12, 1.5);
                g.fill(0x1f2937);
                g.circle(3, -12, 1.5);
                g.fill(0x1f2937);

                // Legs
                g.roundRect(-7, 13, 5, 7, 2);
                g.fill({ color: colors.body, alpha: 0.6 });
                g.roundRect(2, 13, 5, 7, 2);
                g.fill({ color: colors.body, alpha: 0.6 });

                // Role indicator dot (pulsing)
                g.circle(0, -20, 3);
                g.fill({ color: colors.accent, alpha: 0.5 + Math.sin(indicatorPhase) * 0.3 });
            }}
            x={x}
            y={y}
        />
    );
};

export default NPC;
