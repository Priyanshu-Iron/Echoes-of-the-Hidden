import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './utils/pixi' // Register Pixi components
import App from './App.jsx'
import { initFirebase } from './services/firebase'

// Initialize Firebase Analytics (non-blocking)
initFirebase();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
