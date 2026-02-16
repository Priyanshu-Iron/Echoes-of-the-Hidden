/**
 * Root application component.
 * Sets up game container with ARIA attributes for accessibility.
 * @module App
 */

import React, { Suspense, lazy } from 'react';
import './App.css';
import GameCanvas from './components/GameCanvas';
import HUD from './components/UI/HUD';
import GameAnnouncer from './components/UI/GameAnnouncer';
import GameOverScreen from './components/UI/GameOverScreen';

function App() {
  return (
    <div
      className="game-container"
      role="application"
      aria-label="Echoes of the Hidden game world"
    >
      <GameCanvas />
      <HUD />
      <GameAnnouncer />
      <GameOverScreen />
      <div className="controls-hint" aria-hidden="true" style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(30, 41, 59, 0.4)',
        fontSize: '0.75rem',
        letterSpacing: '2px',
        fontFamily: "'JetBrains Mono', monospace",
        pointerEvents: 'none',
      }}>
        WASD — Move &nbsp;&nbsp;|&nbsp;&nbsp; E — Interact
      </div>
    </div>
  );
}

export default App;
