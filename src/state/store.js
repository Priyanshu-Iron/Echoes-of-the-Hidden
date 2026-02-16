/**
 * Global game state management using Zustand.
 * Handles player state, world state, missions, UI, and game events.
 * 
 * @module state/store
 */

import { create } from 'zustand';
import { PLAYER_SPAWN, canMoveTo } from '../game/mapData';
import {
  PLAYER_SPEED, DEFAULT_REPUTATION, MAX_REPUTATION, MIN_REPUTATION, MAX_SUSPICION,
  PLAYER_HALF_WIDTH, PLAYER_HALF_HEIGHT,
} from '../game/constants';
import { logNPCInteraction, logMissionStarted, logMissionCompleted, logSuspicionMaxed } from '../services/firebase';

export const useGameStore = create((set, get) => ({
  // --- PLAYER STATE ---
  player: {
    x: PLAYER_SPAWN.x,
    y: PLAYER_SPAWN.y,
    speed: PLAYER_SPEED,
    reputation: DEFAULT_REPUTATION,
    inventory: [],
    direction: 0,
  },
  
  // --- WORLD STATE ---
  world: {
    suspicion: 0,
    guards: [],
    npcs: [],
    gameOver: false, // New state
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
      npcName: '',
      npcRole: '',
      voice: null,
      messages: [],
    }
  },

  // --- ACTIONS ---

  /**
   * Move player by delta, checking wall collisions.
   * Supports wall-sliding when movement is partially blocked.
   * @param {number} dx - Horizontal movement delta.
   * @param {number} dy - Vertical movement delta.
   */
  movePlayer: (dx, dy) => set((state) => {
    const newX = state.player.x + dx;
    const newY = state.player.y + dy;
    
    if (!canMoveTo(newX, newY, PLAYER_HALF_WIDTH, PLAYER_HALF_HEIGHT)) {
      const canX = canMoveTo(newX, state.player.y, PLAYER_HALF_WIDTH, PLAYER_HALF_HEIGHT);
      const canY = canMoveTo(state.player.x, newY, PLAYER_HALF_WIDTH, PLAYER_HALF_HEIGHT);
      
      if (canX) {
        return {
          player: { ...state.player, x: newX, direction: Math.atan2(0, dx) }
        };
      }
      if (canY) {
        return {
          player: { ...state.player, y: newY, direction: Math.atan2(dy, 0) }
        };
      }
      return state;
    }

    return {
      player: {
        ...state.player,
        x: newX,
        y: newY,
        direction: Math.atan2(dy, dx),
      }
    };
  }),

  /** Set player position directly (used by save/load). */
  setPlayerPosition: (x, y) => set((state) => ({
    player: { ...state.player, x, y }
  })),

  /**
   * Update player reputation clamped to [0, 100].
   * @param {number} amount - Reputation change (positive or negative).
   */
  updateReputation: (amount) => set((state) => ({
    player: {
      ...state.player,
      reputation: Math.max(MIN_REPUTATION, Math.min(MAX_REPUTATION, state.player.reputation + amount))
    }
  })),

  /**
   * Set global suspicion level, clamped to [0, 100].
   * Logs analytics event when suspicion maxes out.
   * @param {number} level - New suspicion level.
   */
  setSuspicion: (level) => set((state) => {
    const clamped = Math.max(0, Math.min(MAX_SUSPICION, level));
    
    // Trigger Game Over if suspicion hits max
    if (clamped >= MAX_SUSPICION && state.world.suspicion < MAX_SUSPICION) {
      logSuspicionMaxed();
      return { 
          world: { ...state.world, suspicion: clamped, gameOver: true } 
      };
    }
    
    return { world: { ...state.world, suspicion: clamped } };
  }),

  /** Set Game Over status directly */
  setGameOver: (status) => set((state) => ({
      world: { ...state.world, gameOver: status }
  })),

  /** Reset game state for retry */
  resetGame: () => set((state) => ({
      player: {
          ...state.player,
          x: PLAYER_SPAWN.x,
          y: PLAYER_SPAWN.y,
          reputation: DEFAULT_REPUTATION,
          inventory: [],
      },
      world: {
          ...state.world,
          suspicion: 0,
          gameOver: false,
      },
      // Keep completed missions? Or reset? Usually reset for full restart
      missions: { active: null, completed: [] },
  })),
  
  initWorld: (guards, npcs) => set((state) => ({
    world: { ...state.world, guards, npcs }
  })),

  /**
   * Open the dialogue UI and log the NPC interaction.
   * @param {string} npcId - NPC identifier.
   * @param {string} npcName - NPC display name.
   * @param {string} npcRole - NPC's role.
   * @param {Object} [extra] - Additional NPC context (personality, backstory, missions).
   */
  startDialogue: (npcId, npcName = 'Unknown', npcRole = 'Unknown', extra = {}) => {
    logNPCInteraction(npcId, npcRole);
    set((state) => ({
      ui: { ...state.ui, dialogue: {
        isOpen: true, npcId, npcName, npcRole,
        personality: extra.personality || '',
        backstory: extra.backstory || '',
        missions: extra.missions || [],
        voice: extra.voice || { pitch: 1.0, rate: 1.0 }, // Default voice
        messages: [],
      } }
    }));
  },

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

  /**
   * Set the active mission and log the event.
   * @param {Object} mission - Mission object to activate.
   */
  setActiveMission: (mission) => {
    logMissionStarted(mission.id, mission.title);
    set((state) => ({
      missions: { ...state.missions, active: mission }
    }));
  },

  /**
   * Complete the current active mission, moving it to the completed list.
   * Logs the completion event.
   */
  completeMission: () => set((state) => {
    const active = state.missions.active;
    if (!active) return state;
    logMissionCompleted(active.id);
    return {
      missions: {
        active: null,
        completed: [...state.missions.completed, { ...active, completedAt: Date.now() }]
      }
    };
  }),
}));
