import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  // --- PLAYER STATE ---
  player: {
    x: 100,
    y: 100,
    speed: 4,
    reputation: 50, // 0-100, starts neutral
    inventory: [],
  },
  
  // --- WORLD STATE ---
  world: {
    suspicion: 0, // 0-100, global alarm level
    guards: [], // Array of guard objects
    npcs: [],   // Array of NPC objects
  },

  // --- MISSION STATE ---
  missions: {
    active: null,
    completed: [],
  },

  // --- UI STATE ---
  ui: {
    dialogue: {
      isOpen: false,
      npcId: null,
      messages: [], // { sender: 'player' | 'npc', text: '' }
    }
  },

  // --- ACTIONS ---
  
  // Player Actions
  movePlayer: (dx, dy) => set((state) => ({
    player: { ...state.player, x: state.player.x + dx, y: state.player.y + dy }
  })),

  setPlayerPosition: (x, y) => set((state) => ({
    player: { ...state.player, x, y }
  })),

  updateReputation: (amount) => set((state) => ({
    player: { ...state.player, reputation: Math.max(0, Math.min(100, state.player.reputation + amount)) }
  })),

  // World Actions
  setSuspicion: (level) => set((state) => ({
    world: { ...state.world, suspicion: Math.max(0, Math.min(100, level)) }
  })),
  
  initWorld: (guards, npcs) => set((state) => ({
    world: { ...state.world, guards, npcs }
  })),

  // Interaction Actions
  startDialogue: (npcId) => set((state) => ({
    ui: { ...state.ui, dialogue: { isOpen: true, npcId, messages: [] } }
  })),

  closeDialogue: () => set((state) => ({
    ui: { ...state.ui, dialogue: { ...state.ui.dialogue, isOpen: false, npcId: null } }
  })),

  addMessage: (sender, text) => set((state) => ({
    ui: { 
      ...state.ui, 
      dialogue: { 
        ...state.ui.dialogue, 
        messages: [...state.ui.dialogue.messages, { sender, text }] 
      } 
    }
  })),

  updateGuard: (id, updates) => set((state) => ({
    world: {
      ...state.world,
      guards: state.world.guards.map(g => g.id === id ? { ...g, ...updates } : g)
    }
  })),

  // Mission Actions
  setActiveMission: (mission) => set((state) => ({
    missions: { ...state.missions, active: mission }
  })),

  completeMission: () => set((state) => {
    const active = state.missions.active;
    if (!active) return state;
    return {
      missions: {
        active: null,
        completed: [...state.missions.completed, { ...active, completedAt: Date.now() }]
      }
    };
  }),
}));
