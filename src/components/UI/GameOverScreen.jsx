import React from 'react';
import { useGameStore } from '../../state/store';
import { glassPanel, buttonStyle } from '../../utils/styles';

const GameOverScreen = () => {
    const gameOver = useGameStore((state) => state.world.gameOver);
    const resetGame = useGameStore((state) => state.resetGame);

    if (!gameOver) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 100,
            backdropFilter: 'blur(5px)',
        }}>
            <div style={{
                ...glassPanel,
                padding: '40px',
                textAlign: 'center',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                boxShadow: '0 0 30px rgba(220, 38, 38, 0.2)',
                maxWidth: '500px',
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    color: '#ef4444',
                    marginBottom: '10px',
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    textShadow: '0 0 20px rgba(239, 68, 68, 0.6)',
                }}>
                    Mission Failed
                </h1>
                <p style={{
                    color: '#e5e7eb',
                    fontSize: '1.2rem',
                    marginBottom: '30px',
                    lineHeight: '1.6',
                }}>
                    You have been compromised. The stealth operation is over.
                </p>
                <button
                    onClick={() => {
                        resetGame();
                        // window.location.reload(); // Optional hard reload if needed, but state reset is smoother
                    }}
                    style={{
                        ...buttonStyle,
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    RETRY MISSION
                </button>
            </div>
        </div>
    );
};

export default GameOverScreen;
