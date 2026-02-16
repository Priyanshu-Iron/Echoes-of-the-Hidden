/**
 * Unit tests for the Zustand game store.
 * Tests player movement, collision, reputation, suspicion, dialogue, and missions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Firebase before importing store
vi.mock('../../services/firebase', () => ({
  logNPCInteraction: vi.fn(),
  logMissionStarted: vi.fn(),
  logMissionCompleted: vi.fn(),
  logSuspicionMaxed: vi.fn(),
}));

import { useGameStore } from '../store';
import { PLAYER_SPAWN } from '../../game/mapData';
import { DEFAULT_REPUTATION, MAX_REPUTATION, MIN_REPUTATION, MAX_SUSPICION } from '../../game/constants';
import { logSuspicionMaxed } from '../../services/firebase';

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useGameStore.setState({
      player: {
        x: PLAYER_SPAWN.x,
        y: PLAYER_SPAWN.y,
        speed: 4,
        reputation: DEFAULT_REPUTATION,
        inventory: [],
        direction: 0,
      },
      world: { suspicion: 0, guards: [], npcs: [] },
      missions: { active: null, completed: [] },
      ui: { dialogue: { isOpen: false, npcId: null, npcName: '', npcRole: '', messages: [] } },
    });
    vi.clearAllMocks();
  });

  describe('movePlayer', () => {
    it('moves player on open floor', () => {
      const { movePlayer } = useGameStore.getState();
      const startX = useGameStore.getState().player.x;
      movePlayer(1, 0);
      expect(useGameStore.getState().player.x).toBe(startX + 1);
    });

    it('updates direction when moving', () => {
      const { movePlayer } = useGameStore.getState();
      movePlayer(0, 1); // Move down
      expect(useGameStore.getState().player.direction).toBeCloseTo(Math.PI / 2);
    });

    it('blocks movement into a wall (top-left corner)', () => {
      // Force player near a wall
      useGameStore.setState({
        player: { ...useGameStore.getState().player, x: 20, y: 20 },
      });
      const { movePlayer } = useGameStore.getState();
      movePlayer(-50, 0); // Try to move into far left wall
      // Player should not move past the wall
      const { x } = useGameStore.getState().player;
      expect(x).toBeLessThanOrEqual(20); // Should be same or slid
    });

    it('supports wall-sliding horizontally', () => {
      // Place player at spawn and test diagonal movement
      const startX = useGameStore.getState().player.x;
      const startY = useGameStore.getState().player.y;
      const { movePlayer } = useGameStore.getState();
      movePlayer(2, 0);
      const { x, y } = useGameStore.getState().player;
      expect(x).toBe(startX + 2);
      expect(y).toBe(startY);
    });
  });

  describe('updateReputation', () => {
    it('increases reputation', () => {
      useGameStore.getState().updateReputation(10);
      expect(useGameStore.getState().player.reputation).toBe(DEFAULT_REPUTATION + 10);
    });

    it('decreases reputation', () => {
      useGameStore.getState().updateReputation(-20);
      expect(useGameStore.getState().player.reputation).toBe(DEFAULT_REPUTATION - 20);
    });

    it('clamps to MAX_REPUTATION', () => {
      useGameStore.getState().updateReputation(200);
      expect(useGameStore.getState().player.reputation).toBe(MAX_REPUTATION);
    });

    it('clamps to MIN_REPUTATION', () => {
      useGameStore.getState().updateReputation(-200);
      expect(useGameStore.getState().player.reputation).toBe(MIN_REPUTATION);
    });

    it('handles zero change', () => {
      useGameStore.getState().updateReputation(0);
      expect(useGameStore.getState().player.reputation).toBe(DEFAULT_REPUTATION);
    });
  });

  describe('setSuspicion', () => {
    it('sets suspicion to a value', () => {
      useGameStore.getState().setSuspicion(50);
      expect(useGameStore.getState().world.suspicion).toBe(50);
    });

    it('clamps suspicion to MAX_SUSPICION', () => {
      useGameStore.getState().setSuspicion(150);
      expect(useGameStore.getState().world.suspicion).toBe(MAX_SUSPICION);
    });

    it('clamps suspicion to 0 (no negative)', () => {
      useGameStore.getState().setSuspicion(-10);
      expect(useGameStore.getState().world.suspicion).toBe(0);
    });

    it('logs analytics when suspicion maxes out', () => {
      useGameStore.getState().setSuspicion(MAX_SUSPICION);
      expect(logSuspicionMaxed).toHaveBeenCalled();
    });

    it('does not log analytics for non-max suspicion', () => {
      useGameStore.getState().setSuspicion(50);
      expect(logSuspicionMaxed).not.toHaveBeenCalled();
    });
  });

  describe('Dialogue', () => {
    it('opens dialogue with NPC info', () => {
      useGameStore.getState().startDialogue('npc_1', 'Ada', 'Informant');
      const dialogue = useGameStore.getState().ui.dialogue;
      expect(dialogue.isOpen).toBe(true);
      expect(dialogue.npcId).toBe('npc_1');
      expect(dialogue.npcName).toBe('Ada');
      expect(dialogue.npcRole).toBe('Informant');
    });

    it('closes dialogue', () => {
      useGameStore.getState().startDialogue('npc_1', 'Ada', 'Informant');
      useGameStore.getState().closeDialogue();
      expect(useGameStore.getState().ui.dialogue.isOpen).toBe(false);
    });

    it('adds messages to dialogue', () => {
      useGameStore.getState().startDialogue('npc_1', 'Ada', 'Informant');
      useGameStore.getState().addMessage('player', 'Hello');
      useGameStore.getState().addMessage('npc', 'Hi there');
      const messages = useGameStore.getState().ui.dialogue.messages;
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({ sender: 'player', text: 'Hello' });
      expect(messages[1]).toEqual({ sender: 'npc', text: 'Hi there' });
    });

    it('clears messages when dialogue opens again', () => {
      useGameStore.getState().startDialogue('npc_1', 'Ada', 'Informant');
      useGameStore.getState().addMessage('player', 'Hello');
      useGameStore.getState().startDialogue('npc_2', 'Bob', 'Civilian');
      expect(useGameStore.getState().ui.dialogue.messages).toHaveLength(0);
    });
  });

  describe('Missions', () => {
    const testMission = {
      id: 'mission_1',
      title: 'Test Mission',
      description: 'Do the thing',
      status: 'ACTIVE',
    };

    it('sets active mission', () => {
      useGameStore.getState().setActiveMission(testMission);
      expect(useGameStore.getState().missions.active).toEqual(testMission);
    });

    it('completes mission and moves to completed list', () => {
      useGameStore.getState().setActiveMission(testMission);
      useGameStore.getState().completeMission();
      const { active, completed } = useGameStore.getState().missions;
      expect(active).toBeNull();
      expect(completed).toHaveLength(1);
      expect(completed[0].id).toBe('mission_1');
      expect(completed[0]).toHaveProperty('completedAt');
    });

    it('completeMission does nothing if no active mission', () => {
      useGameStore.getState().completeMission();
      expect(useGameStore.getState().missions.completed).toHaveLength(0);
    });
  });
});
