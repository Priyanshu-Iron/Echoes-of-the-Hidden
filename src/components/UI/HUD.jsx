import React from 'react';
import { useGameStore } from '../../state/store';
import { saveGame, loadGame, clearSave } from '../../services/storage';

const HUD = () => {
    const suspicion = useGameStore((state) => state.world.suspicion);
    const reputation = useGameStore((state) => state.player.reputation);
    const activeMission = useGameStore((state) => state.missions.active);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            padding: '20px',
            pointerEvents: 'none', // Let clicks pass through to game
            display: 'flex',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
        }}>
            {/* Left: Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Suspicion Meter */}
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #555'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '4px' }}>SUSPICION</div>
                    <div style={{
                        width: '200px',
                        height: '10px',
                        backgroundColor: '#333',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${suspicion}%`,
                            height: '100%',
                            backgroundColor: suspicion > 80 ? '#ff0000' : (suspicion > 50 ? '#ffff00' : '#00ff00'),
                            transition: 'width 0.2s, background-color 0.2s'
                        }} />
                    </div>
                </div>

                {/* Reputation */}
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #555',
                    color: '#fff'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#aaa' }}>REPUTATION</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{Math.round(reputation)}</div>
                </div>
            </div>

            {/* Center: Mission */}
            {activeMission && (
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #ffd700',
                    color: '#fff',
                    maxWidth: '400px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '0.8rem', color: '#ffd700', marginBottom: '4px' }}>CURRENT OBJECTIVE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{activeMission.title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#ccc' }}>{activeMission.description}</div>
                </div>
            )}

            {/* Right: System Controls (Enable pointer events) */}
            <div style={{ pointerEvents: 'auto', display: 'flex', gap: '10px' }}>
                <button onClick={saveGame} style={btnStyle}>Save</button>
                <button onClick={loadGame} style={btnStyle}>Load</button>
                <button onClick={() => { clearSave(); window.location.reload(); }} style={{ ...btnStyle, color: '#ff6666' }}>Reset</button>
            </div>
        </div>
    );
};

const btnStyle = {
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #555',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontFamily: 'monospace'
};

export default HUD;
