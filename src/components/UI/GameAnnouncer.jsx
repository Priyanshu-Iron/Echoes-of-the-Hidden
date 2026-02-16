/**
 * GameAnnouncer — Hidden ARIA live region for screen reader accessibility.
 * Announces gameplay events (suspicion changes, NPC proximity, missions)
 * to assistive technology without affecting visual display.
 * 
 * @module components/UI/GameAnnouncer
 */

import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../../state/store';

/**
 * Invisible component that provides screen reader announcements
 * for important game state changes.
 */
const GameAnnouncer = () => {
    const [announcement, setAnnouncement] = useState('');
    const prevSuspicionRef = useRef(0);
    const prevMissionRef = useRef(null);

    const suspicion = useGameStore(s => s.world.suspicion);
    const activeMission = useGameStore(s => s.missions.active);
    const isDialogueOpen = useGameStore(s => s.ui.dialogue.isOpen);
    const npcName = useGameStore(s => s.ui.dialogue.npcName);

    // Announce suspicion level changes
    useEffect(() => {
        const prev = prevSuspicionRef.current;
        prevSuspicionRef.current = suspicion;

        if (suspicion >= 80 && prev < 80) {
            setAnnouncement('Warning: Suspicion level critical! You are in danger of being caught.');
        } else if (suspicion >= 50 && prev < 50) {
            setAnnouncement('Caution: Guards are becoming suspicious of your presence.');
        } else if (suspicion === 0 && prev > 0) {
            setAnnouncement('You are now hidden. Suspicion cleared.');
        }
    }, [suspicion]);

    // Announce mission updates
    useEffect(() => {
        if (activeMission && activeMission !== prevMissionRef.current) {
            setAnnouncement(`New mission: ${activeMission.title}. ${activeMission.description}`);
        }
        prevMissionRef.current = activeMission;
    }, [activeMission]);

    // Announce dialogue open/close
    useEffect(() => {
        if (isDialogueOpen && npcName) {
            setAnnouncement(`Conversation started with ${npcName}. Type your message and press Enter.`);
        } else if (!isDialogueOpen && npcName) {
            setAnnouncement('Conversation ended.');
        }
    }, [isDialogueOpen, npcName]);

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
            }}
        >
            {announcement}
        </div>
    );
};

export default GameAnnouncer;
