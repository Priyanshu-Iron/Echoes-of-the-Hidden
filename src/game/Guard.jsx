import React, { useState } from 'react';
import { useTick } from '@pixi/react';
import { useGameStore } from '../state/store';
import { getDistance, getAngle, isPointInCone } from '../utils/geometry';

const FOV = Math.PI / 3; // 60 degrees
const VIEW_RANGE = 200;

const Guard = ({ id, initialX, initialY, patrolPath }) => {
    const [state, setState] = useState('PATROL'); // IDLE, PATROL, ALERT, CHASE
    const [pos, setPos] = useState({ x: initialX, y: initialY });
    const [rotation, setRotation] = useState(0);
    const [pathIndex, setPathIndex] = useState(0);

    // Store actions
    const player = useGameStore((state) => state.player);
    const setSuspicion = useGameStore((state) => state.setSuspicion);
    const suspicion = useGameStore((state) => state.world.suspicion);

    useTick((ticker) => {
        const delta = ticker.deltaTime;

        // 1. Detection Logic
        const dist = getDistance(pos, player);
        const seen = isPointInCone(pos, player, rotation, FOV, VIEW_RANGE);

        if (seen) {
            if (suspicion < 100) {
                setSuspicion(suspicion + 1 * delta); // Increase suspicion
            }
            if (state !== 'CHASE') setState('CHASE');
        } else {
            if (suspicion > 0 && state !== 'CHASE') {
                setSuspicion(Math.max(0, suspicion - 0.1 * delta)); // Decay
            }
            if (state === 'CHASE' && !seen) {
                // Lost sight, go to ALERT or back to PATROL
                setState('ALERT');
            }
        }

        // 2. Movement Logic based on State
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
        // ALERT state: maybe look around or move to last seen position (simplified: just wait)
    });

    // Visuals
    const color = state === 'CHASE' ? 0xff0000 : (state === 'ALERT' ? 0xffea00 : 0x0000ff);

    return (
        <graphics
            draw={(g) => {
                g.clear();

                // Vision Cone visualization
                g.moveTo(0, 0);
                g.arc(0, 0, VIEW_RANGE, -FOV / 2, FOV / 2);
                g.lineTo(0, 0);
                g.fill({ color: 0xffff00, alpha: 0.2 });

                // Guard Body
                g.circle(0, 0, 16);
                g.fill(color);
            }}
            x={pos.x}
            y={pos.y}
            rotation={rotation}
        />
    );
};

export default Guard;
