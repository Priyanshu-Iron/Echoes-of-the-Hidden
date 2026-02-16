import React, { useState } from 'react';
import { useTick } from '@pixi/react';
import { useGameStore } from '../state/store';
import { getDistance, getAngle, isPointInCone } from '../utils/geometry';
import { soundManager } from '../utils/sound';

const FOV = Math.PI / 3;
const VIEW_RANGE = 200;

const Guard = ({ id, initialX, initialY, patrolPath }) => {
    const [state, setState] = useState('PATROL');
    const [pos, setPos] = useState({ x: initialX, y: initialY });
    const [rotation, setRotation] = useState(0);
    const [pathIndex, setPathIndex] = useState(0);

    const player = useGameStore((state) => state.player);
    const setSuspicion = useGameStore((state) => state.setSuspicion);

    useTick((ticker) => {
        const delta = ticker.deltaTime;

        // Read latest suspicion from store to avoid stale closure
        const currentSuspicion = useGameStore.getState().world.suspicion;

        const dist = getDistance(pos, player);
        const seen = isPointInCone(pos, player, rotation, FOV, VIEW_RANGE);

        if (seen) {
            if (currentSuspicion < 100) {
                setSuspicion(currentSuspicion + 1 * delta);
            }
            // Reputation penalty when suspicion maxes out (handled in store now via setGameOver)

            // CAUGHT CONDITION: If very close and seen AND suspicion is high (>= 70%)
            if (dist < 30 && currentSuspicion >= 70) {
                useGameStore.getState().setGameOver(true);
            }

            if (state !== 'CHASE') {
                setState('CHASE');
                soundManager.playGuardChase(); // Siren
            }
        } else {
            if (currentSuspicion > 0 && state !== 'CHASE') {
                setSuspicion(Math.max(0, currentSuspicion - 0.1 * delta));
            }
            if (state === 'CHASE' && !seen) {
                setState('ALERT');
                soundManager.playGuardAlert(); // "Huh?"
            }
        }

        const speed = (state === 'CHASE' ? 3 : 1.5) * delta;

        if (state === 'PATROL') {
            if (!patrolPath || patrolPath.length === 0) return;

            const target = patrolPath[pathIndex];
            const d = getDistance(pos, target);

            if (d < 5) {
                setPathIndex((prev) => (prev + 1) % patrolPath.length);
            } else {
                const angle = getAngle(pos, target);
                setRotation(angle);
                setPos({
                    x: pos.x + Math.cos(angle) * speed,
                    y: pos.y + Math.sin(angle) * speed
                });
            }
        } else if (state === 'CHASE') {
            const angle = getAngle(pos, player);
            setRotation(angle);
            setPos({
                x: pos.x + Math.cos(angle) * speed,
                y: pos.y + Math.sin(angle) * speed
            });
        }
    });

    // State-based colors — designed for white background visibility
    const bodyColor = state === 'CHASE' ? 0xb91c1c : (state === 'ALERT' ? 0xb45309 : 0x6b7280);
    const helmetColor = state === 'CHASE' ? 0xef4444 : (state === 'ALERT' ? 0xf59e0b : 0x4b5563);
    const coneColor = state === 'CHASE' ? 0xef4444 : (state === 'ALERT' ? 0xf59e0b : 0x6366f1);
    const coneAlpha = state === 'CHASE' ? 0.18 : 0.08;

    return (
        <graphics
            draw={(g) => {
                g.clear();

                // === VISION CONE ===
                g.moveTo(0, 0);
                g.arc(0, 0, VIEW_RANGE, -FOV / 2, FOV / 2);
                g.lineTo(0, 0);
                g.fill({ color: coneColor, alpha: coneAlpha });

                // Cone edge lines
                g.moveTo(0, 0);
                const edgeX1 = Math.cos(-FOV / 2) * VIEW_RANGE;
                const edgeY1 = Math.sin(-FOV / 2) * VIEW_RANGE;
                g.lineTo(edgeX1, edgeY1);
                g.stroke({ width: 1, color: coneColor, alpha: coneAlpha * 2.5 });

                g.moveTo(0, 0);
                const edgeX2 = Math.cos(FOV / 2) * VIEW_RANGE;
                const edgeY2 = Math.sin(FOV / 2) * VIEW_RANGE;
                g.lineTo(edgeX2, edgeY2);
                g.stroke({ width: 1, color: coneColor, alpha: coneAlpha * 2.5 });

                // === GUARD BODY (top-down) ===

                // Shadow
                g.ellipse(0, 2, 14, 8);
                g.fill({ color: 0x000000, alpha: 0.15 });

                // Body armor
                g.roundRect(-10, -8, 20, 22, 4);
                g.fill(bodyColor);
                // Armor highlight
                g.roundRect(-8, -6, 16, 18, 3);
                g.fill({ color: bodyColor, alpha: 0.8 });

                // Shoulders (bulkier — armored)
                g.roundRect(-14, -6, 8, 12, 3);
                g.fill(bodyColor);
                g.roundRect(6, -6, 8, 12, 3);
                g.fill(bodyColor);

                // Helmet
                g.circle(0, -12, 9);
                g.fill(helmetColor);
                // Visor
                g.roundRect(-6, -14, 12, 5, 2);
                g.fill({ color: 0xffffff, alpha: 0.7 });

                // Weapon indicator
                g.roundRect(10, -4, 4, 16, 2);
                g.fill(0x9ca3af);

                // Belt
                g.rect(-9, 4, 18, 3);
                g.fill(0x374151);

                // Legs
                g.roundRect(-8, 14, 7, 8, 2);
                g.fill({ color: bodyColor, alpha: 0.7 });
                g.roundRect(1, 14, 7, 8, 2);
                g.fill({ color: bodyColor, alpha: 0.7 });
            }}
            x={pos.x}
            y={pos.y}
            rotation={rotation}
        />
    );
};

export default Guard;
