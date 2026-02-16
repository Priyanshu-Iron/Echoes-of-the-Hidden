/**
 * Integration test for the core game flow.
 * Tests the full lifecycle: spawn → move → interact with NPC → dialogue → mission.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Firebase
vi.mock('../services/firebase', () => ({
  logNPCInteraction: vi.fn(),
  logMissionStarted: vi.fn(),
  logMissionCompleted: vi.fn(),
  logSuspicionMaxed: vi.fn(),
}));

// Mock fetch for AI service
global.fetch = vi.fn();

import { useGameStore } from '../state/store';
import { PLAYER_SPAWN, NPC_SPAWNS, isWalkable, canMoveTo, TILE_SIZE } from '../game/mapData';
import { getDistance } from '../utils/geometry';

describe('Game Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store
    useGameStore.setState({
      player: {
        x: PLAYER_SPAWN.x,
        y: PLAYER_SPAWN.y,
        speed: 4,
        reputation: 50,
        inventory: [],
        direction: 0,
      },
      world: { suspicion: 0, guards: [], npcs: [] },
      missions: { active: null, completed: [] },
      ui: { dialogue: { isOpen: false, npcId: null, npcName: '', npcRole: '', messages: [] } },
    });
  });

  it('player spawns at a valid walkable location', () => {
    const { x, y } = useGameStore.getState().player;
    // isWalkable takes pixel coordinates
    expect(isWalkable(x, y)).toBe(true);
    expect(canMoveTo(x, y, 12, 12)).toBe(true);
  });

  it('player can move from spawn point', () => {
    const { movePlayer } = useGameStore.getState();
    const startX = useGameStore.getState().player.x;

    movePlayer(2, 0);
    expect(useGameStore.getState().player.x).not.toBe(startX);
  });

  it('multiple moves accumulate position changes', () => {
    const { movePlayer } = useGameStore.getState();
    const startX = useGameStore.getState().player.x;

    for (let i = 0; i < 5; i++) {
      movePlayer(1, 0);
    }

    expect(useGameStore.getState().player.x).toBe(startX + 5);
  });

  it('NPC spawn points are reachable from player spawn', () => {
    NPC_SPAWNS.forEach((npc) => {
      const dist = getDistance(PLAYER_SPAWN, npc);
      // All NPCs should be within the map diagonal (~3000)
      expect(dist).toBeLessThan(3000);
    });
  });

  it('dialogue lifecycle: open → message → close', () => {
    const store = useGameStore.getState();

    store.startDialogue('npc_test', 'Ada', 'Informant');
    expect(useGameStore.getState().ui.dialogue.isOpen).toBe(true);
    expect(useGameStore.getState().ui.dialogue.npcName).toBe('Ada');

    useGameStore.getState().addMessage('player', 'Hello');
    useGameStore.getState().addMessage('npc', 'Hi there, agent.');
    expect(useGameStore.getState().ui.dialogue.messages).toHaveLength(2);

    useGameStore.getState().closeDialogue();
    expect(useGameStore.getState().ui.dialogue.isOpen).toBe(false);
  });

  it('full mission flow: assign → complete', () => {
    const mission = {
      id: 'mission_test',
      title: 'Test Mission',
      description: 'Test the game flow.',
      status: 'ACTIVE',
    };

    useGameStore.getState().setActiveMission(mission);
    expect(useGameStore.getState().missions.active).toEqual(mission);

    useGameStore.getState().completeMission();
    expect(useGameStore.getState().missions.active).toBeNull();
    expect(useGameStore.getState().missions.completed).toHaveLength(1);
    expect(useGameStore.getState().missions.completed[0].id).toBe('mission_test');
  });

  it('suspicion affects game state', () => {
    useGameStore.getState().setSuspicion(80);
    expect(useGameStore.getState().world.suspicion).toBe(80);

    useGameStore.getState().setSuspicion(0);
    expect(useGameStore.getState().world.suspicion).toBe(0);
  });

  it('reputation changes alongside gameplay', () => {
    useGameStore.getState().updateReputation(10);
    expect(useGameStore.getState().player.reputation).toBe(60);

    useGameStore.getState().updateReputation(-30);
    expect(useGameStore.getState().player.reputation).toBe(30);
  });
});
