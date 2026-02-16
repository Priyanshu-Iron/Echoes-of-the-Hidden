import React, { useEffect } from 'react';
import { Application } from '@pixi/react';
import { useGameStore } from '../state/store';
import Player from '../game/Player';
import Guard from '../game/Guard';
import NPC from '../game/NPC';
import DialogueBox from './UI/DialogueBox';
import { getDistance } from '../utils/geometry';
import { useInput } from '../utils/useInput';

const GameCanvas = () => {
    // Canvas size
    const width = 800;
    const height = 600;

    // Use store state
    const playerPos = useGameStore((state) => state.player);
    const { dialogue } = useGameStore((state) => state.ui);
    const startDialogue = useGameStore((state) => state.startDialogue);

    // Initial data
    const guards = [
        { id: 1, x: 300, y: 300, path: [{ x: 300, y: 300 }, { x: 500, y: 300 }, { x: 500, y: 500 }, { x: 300, y: 500 }] },
        { id: 2, x: 600, y: 100, path: [{ x: 600, y: 100 }, { x: 700, y: 100 }, { x: 600, y: 100 }] }
    ];

    const npcs = [
        { id: 'npc_1', x: 400, y: 100, role: 'Informant' },
        { id: 'npc_2', x: 100, y: 500, role: 'Civilian' }
    ];

    const keys = useInput();

    // Interaction Check Loop
    useEffect(() => {
        const checkInteraction = () => {
            if (keys['KeyE'] && !dialogue.isOpen) {
                const interactionRange = 50;
                const target = npcs.find(npc => getDistance(playerPos, npc) < interactionRange);

                if (target) {
                    startDialogue(target.id);
                }
            }
        };

        const interval = setInterval(checkInteraction, 100);
        return () => clearInterval(interval);
    }, [keys, playerPos, dialogue.isOpen, startDialogue]);

    return (
        <div style={{ position: 'relative' }}>
            <Application width={width} height={height} background={0x1099bb}>
                <container>
                    {guards.map(g => (
                        <Guard
                            key={g.id}
                            id={g.id}
                            initialX={g.x}
                            initialY={g.y}
                            patrolPath={g.path}
                        />
                    ))}
                    {npcs.map(npc => (
                        <NPC
                            key={npc.id}
                            id={npc.id}
                            x={npc.x}
                            y={npc.y}
                            role={npc.role}
                        />
                    ))}
                    <Player />
                </container>
            </Application>

            <DialogueBox />
        </div>
    );
};

export default GameCanvas;
