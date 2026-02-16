/**
 * Unit tests for the storage service.
 * Tests save/load round-trips, error handling, and data validation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Firebase before importing store (store imports firebase)
vi.mock('../../services/firebase', () => ({
  logNPCInteraction: vi.fn(),
  logMissionStarted: vi.fn(),
  logMissionCompleted: vi.fn(),
  logSuspicionMaxed: vi.fn(),
}));

import { saveGame, loadGame, clearSave } from '../storage';
import { useGameStore } from '../../state/store';
import { STORAGE_KEY } from '../../game/constants';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Storage Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    // Reset store
    useGameStore.setState({
      player: { x: 500, y: 400, speed: 4, reputation: 50, inventory: [], direction: 0 },
      world: { suspicion: 0, guards: [], npcs: [] },
      missions: { active: null, completed: [] },
    });
  });

  describe('saveGame', () => {
    it('saves game state to localStorage', () => {
      const result = saveGame();
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String)
      );
    });

    it('includes player, world, and missions in save data', () => {
      saveGame();
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData).toHaveProperty('player');
      expect(savedData).toHaveProperty('world');
      expect(savedData).toHaveProperty('missions');
      expect(savedData).toHaveProperty('savedAt');
    });

    it('returns false on localStorage error', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceeded');
      });
      const result = saveGame();
      expect(result).toBe(false);
    });
  });

  describe('loadGame', () => {
    it('loads saved state into the store', () => {
      // Save modified state
      useGameStore.setState({ player: { ...useGameStore.getState().player, reputation: 75 } });
      saveGame();

      // Reset store
      useGameStore.setState({ player: { ...useGameStore.getState().player, reputation: 50 } });

      // Load
      const result = loadGame();
      expect(result).toBe(true);
      expect(useGameStore.getState().player.reputation).toBe(75);
    });

    it('returns false when no save data exists', () => {
      const result = loadGame();
      expect(result).toBe(false);
    });

    it('returns false for corrupted JSON', () => {
      localStorageMock.getItem.mockReturnValueOnce('not valid json{{{');
      const result = loadGame();
      expect(result).toBe(false);
    });

    it('returns false for invalid save structure', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ invalid: true }));
      const result = loadGame();
      expect(result).toBe(false);
    });
  });

  describe('clearSave', () => {
    it('removes save data from localStorage', () => {
      saveGame();
      clearSave();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  describe('Round-trip', () => {
    it('save → load preserves player position', () => {
      useGameStore.setState({
        player: { ...useGameStore.getState().player, x: 123, y: 456 },
      });
      saveGame();

      useGameStore.setState({
        player: { ...useGameStore.getState().player, x: 0, y: 0 },
      });
      loadGame();

      expect(useGameStore.getState().player.x).toBe(123);
      expect(useGameStore.getState().player.y).toBe(456);
    });

    it('save → load preserves active mission', () => {
      const mission = { id: 'm1', title: 'Test', description: 'Do it', status: 'ACTIVE' };
      useGameStore.setState({ missions: { active: mission, completed: [] } });
      saveGame();

      useGameStore.setState({ missions: { active: null, completed: [] } });
      loadGame();

      expect(useGameStore.getState().missions.active).toEqual(mission);
    });
  });
});
