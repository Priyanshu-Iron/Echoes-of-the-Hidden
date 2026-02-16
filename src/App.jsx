import React from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/UI/HUD';
import { useGameStore } from './state/store';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#222', position: 'relative' }}>
      <GameCanvas />
      <HUD />
      <div style={{ color: '#aaa', marginTop: '10px', fontSize: '0.8rem', position: 'absolute', bottom: '10px' }}>
        WASD to Move | E to Interact
      </div>
    </div>
  );
}

export default App;
