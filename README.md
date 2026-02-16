# Echoes of the Hidden

**Echoes of the Hidden** is an AI-powered top-down stealth exploration game set in a living, ever-evolving city. Players take the role of a hidden operative who gathers intelligence, completes dynamic missions, and interacts with NPCs driven by large language models. Every citizen has memory, motives, and reactions — conversations change based on past choices, rumors spread through the city, and guards adapt to the player’s behavior. Built as a web application using modern frontend technologies and generative AI, the project focuses on creating a playable MVP where stealth is not just about hiding in shadows, but about manipulating information, trust, and reputation in a truly sentient urban world.

## Features

- **Stealth Mechanics**: Navigate a city patrolled by guards with vision cone detection. Avoid line-of-sight to keep suspicion low.
- **AI-Driven NPCs**: Interact with characters who offer dynamic dialogue and missions (Powered by Mock AI / LLM integration).
- **Reputation System**: Your actions influence how the world reacts to you.
- **Persistent World**: Game state (position, reputation, missions) is saved locally and persists across sessions.

## Tech Stack

- **Frontend**: React + Vite
- **Rendering**: PixiJS (`@pixi/react`)
- **State Management**: Zustand
- **UI Animations**: Framer Motion
- **Architecture**: Component-based Game Object system (Entity-Component style)

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Priyanshu-Iron/Echoes-of-the-Hidden.git
   cd Echoes-of-the-Hidden
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`.

## Controls

- **WASD / Arrows**: Move Player
- **E**: Interact with NPCs
- **HUD Buttons**: Save / Load / Reset

## License

MIT
