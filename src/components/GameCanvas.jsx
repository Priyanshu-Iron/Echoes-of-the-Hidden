import React, { useEffect, useState } from 'react';
import { Application } from '@pixi/react';
import { useGameStore } from '../state/store';
import Player from '../game/Player';
import Guard from '../game/Guard';
import NPC from '../game/NPC';
import TileMap from '../game/TileMap';
import DialogueBox from './UI/DialogueBox';
import { getDistance } from '../utils/geometry';
import { useInput } from '../utils/useInput';
import { GUARD_SPAWNS, NPC_SPAWNS, MAP_WIDTH, MAP_HEIGHT } from '../game/mapData';

const GameCanvas = () => {
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    const playerPos = useGameStore((state) => state.player);
    const { dialogue } = useGameStore((state) => state.ui);
    const startDialogue = useGameStore((state) => state.startDialogue);

    const keys = useInput();

    // Responsive resize
    useEffect(() => {
        const handleResize = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Interaction check
    useEffect(() => {
        const checkInteraction = () => {
            if (keys['KeyE'] && !dialogue.isOpen) {
                const interactionRange = 50;
                const target = NPC_SPAWNS.find(npc => getDistance(playerPos, npc) < interactionRange);

                if (target) {
                    startDialogue(target.id, target.name, target.role, {
                        personality: target.personality,
                        backstory: target.backstory,
                        missions: target.missions,
                    });
                }
            }
        };

        const interval = setInterval(checkInteraction, 100);
        return () => clearInterval(interval);
    }, [keys, playerPos, dialogue.isOpen, startDialogue]);

    // Camera: center on player, clamped to map bounds
    const cameraX = Math.max(
        -(MAP_WIDTH - size.width),
        Math.min(0, -playerPos.x + size.width / 2)
    );
    const cameraY = Math.max(
        -(MAP_HEIGHT - size.height),
        Math.min(0, -playerPos.y + size.height / 2)
    );

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Application
                width={size.width}
                height={size.height}
                background={0xf0f0f5}
                antialias={true}
            >
                <container x={cameraX} y={cameraY}>
                    {/* Background map layer */}
                    <TileMap />

                    {/* NPCs (render below player) */}
                    {NPC_SPAWNS.map(npc => (
                        <NPC
                            key={npc.id}
                            id={npc.id}
                            x={npc.x}
                            y={npc.y}
                            role={npc.role}
                            name={npc.name}
                        />
                    ))}

                    {/* Guards */}
                    {GUARD_SPAWNS.map(g => (
                        <Guard
                            key={g.id}
                            id={g.id}
                            initialX={g.x}
                            initialY={g.y}
                            patrolPath={g.path}
                        />
                    ))}

                    {/* Player (top layer) */}
                    <Player />
                </container>
            </Application>

            <DialogueBox />
        </div>
    );
};

export default GameCanvas;
