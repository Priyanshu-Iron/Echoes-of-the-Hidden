/**
 * HUD component — Heads-Up Display overlay.
 * Frosted white glassmorphism theme with dark text.
 * @module components/UI/HUD
 */

import React from 'react';
import { useGameStore } from '../../state/store';
import { saveGame, loadGame, clearSave } from '../../services/storage';
import { logGameSave, logGameLoad } from '../../services/firebase';
import { glassPanel, labelStyle, buttonStyle, monoValueStyle, ACCENT_COLORS } from '../../utils/styles';

const HUD = () => {
    const suspicion = useGameStore((state) => state.world.suspicion);
    const reputation = useGameStore((state) => state.player.reputation);
    const activeMission = useGameStore((state) => state.missions.active);

    const suspicionColor = suspicion > 80 ? ACCENT_COLORS.red : (suspicion > 50 ? ACCENT_COLORS.yellow : ACCENT_COLORS.green);
    const suspicionLabel = suspicion > 80 ? 'DANGER' : (suspicion > 50 ? 'ALERT' : 'HIDDEN');

    const handleSave = () => { saveGame(); logGameSave(); };
    const handleLoad = () => { loadGame(); logGameLoad(); };
    const handleReset = () => { clearSave(); window.location.reload(); };

    return (
        <nav
            aria-label="Game status and controls"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                padding: '20px',
                pointerEvents: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                boxSizing: 'border-box',
                zIndex: 20,
            }}
        >
            {/* Left: Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Suspicion Meter */}
                <div style={glassPanel} role="status" aria-live="polite" aria-label={`Suspicion: ${Math.round(suspicion)} percent, status ${suspicionLabel}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={labelStyle}>SUSPICION</span>
                        <span style={{ ...labelStyle, color: suspicionColor, fontWeight: 600 }}>{suspicionLabel}</span>
                    </div>
                    <div
                        role="progressbar"
                        aria-valuenow={Math.round(suspicion)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Suspicion level"
                        style={{
                            width: '220px',
                            height: '6px',
                            backgroundColor: 'rgba(0,0,0,0.08)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                        }}
                    >
                        <div style={{
                            width: `${suspicion}%`,
                            height: '100%',
                            backgroundColor: suspicionColor,
                            borderRadius: '3px',
                            transition: 'width 0.3s ease, background-color 0.3s ease',
                            boxShadow: `0 0 8px ${suspicionColor}30`,
                        }} />
                    </div>
                </div>

                {/* Reputation */}
                <div style={glassPanel} role="status" aria-label={`Reputation: ${Math.round(reputation)} out of 100`}>
                    <span style={labelStyle}>REPUTATION</span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                        <span style={monoValueStyle}>
                            {Math.round(reputation)}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(30,41,59,0.35)' }}>/ 100</span>
                    </div>
                </div>
            </div>

            {/* Center: Active Mission */}
            {activeMission && (
                <div
                    role="status"
                    aria-label={`Current objective: ${activeMission.title}. ${activeMission.description}`}
                    style={{
                        ...glassPanel,
                        borderColor: 'rgba(180, 83, 9, 0.25)',
                        maxWidth: '400px',
                        textAlign: 'center',
                    }}
                >
                    <div style={{
                        fontSize: '0.65rem',
                        color: ACCENT_COLORS.gold,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                    }}>
                        Current Objective
                    </div>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        marginBottom: '4px',
                    }}>
                        {activeMission.title}
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: 'rgba(30,41,59,0.55)',
                    }}>
                        {activeMission.description}
                    </div>
                </div>
            )}

            {/* Right: System Controls */}
            <div style={{ pointerEvents: 'auto', display: 'flex', gap: '8px' }} role="group" aria-label="System controls">
                <button onClick={handleSave} style={buttonStyle} aria-label="Save game">Save</button>
                <button onClick={handleLoad} style={buttonStyle} aria-label="Load saved game">Load</button>
                <button
                    onClick={handleReset}
                    style={{ ...buttonStyle, color: '#dc2626', borderColor: 'rgba(220, 38, 38, 0.2)' }}
                    aria-label="Reset game and clear save data"
                >
                    Reset
                </button>
            </div>
        </nav>
    );
};

export default HUD;
