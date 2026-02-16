<div align="center">

# 👁️ Echoes of the Hidden 👁️

### **AI-Powered Top-Down Stealth Experience**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PixiJS](https://img.shields.io/badge/PixiJS-E72264?style=for-the-badge&logo=webgl&logoColor=white)
![Gemini](https://img.shields.io/badge/AI_Powered-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

<br/>

**Echoes of the Hidden** is a browser-based stealth game set in a living, ever-evolving city. 
Players take the role of a hidden operative who gathers intelligence, completes dynamic missions, and interacts with NPCs driven by large language models. 

Every citizen has memory, motives, and reactions — conversations change based on past choices, rumors spread through the city, and guards adapt to the player’s behavior.

[Start the Mission](#getting-started) • [Features](#-features) • [Controls](#-controls)

---
</div>

## 🕵️ Features

| Feature | Description |
| :--- | :--- |
| **Silent Operator** | Navigate a city patrolled by guards with cone-based vision detection. Avoid line-of-sight to keep suspicion low. |
| **Living AI World** | Interact with NPCs who offer dynamic dialogue and missions, powered by LLM integration. |
| **Reputation System** | Your actions influence how the world reacts to you. Build trust or become a wanted criminal. |
| **Persistent State** | Game state (position, reputation, missions) is saved locally and survives browser reloads. |

## 🛠️ Tech Stack

- **Core**: React + Vite
- **Engine**: PixiJS (`@pixi/react`)
- **State**: Zustand (Global Store)
- **AI**: Mock LLM Service (Extensible to Gemini/GPT)
- **Persistence**: LocalStorage

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Priyanshu-Iron/Echoes-of-the-Hidden.git
   cd Echoes-of-the-Hidden
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the game**
   ```bash
   npm run dev
   ```

4. **Infiltrate**: Open `http://localhost:5173` in your browser.

## 🎮 Controls

| Action | Key(s) |
| :--- | :---: |
| **Move** | `W` `A` `S` `D` / Arrows |
| **Interact** | `E` (Near NPC) |
| **Save Game** | `HUD Button` |
| **Load Game** | `HUD Button` |

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with ❤️ by Priyanshu-Iron</sub>
</div>
