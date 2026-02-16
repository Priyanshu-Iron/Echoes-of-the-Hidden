/**
 * Unit tests for the AI chat service.
 * Tests mock fallback, input sanitization, and rate limiting.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// We need to re-import after setting up mock
let chatWithNPC;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  mockFetch.mockReset();
  
  // Dynamic import to reset module state (rate limit timestamps)
  const mod = await import('../ai');
  chatWithNPC = mod.chatWithNPC;
});

describe('chatWithNPC', () => {
  it('sends request to /api/chat endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ text: 'Hello there.', mission: null }),
    });

    const result = await chatWithNPC(
      { npcId: 'npc1', role: 'Informant', name: 'Ada' },
      'Hello'
    );

    expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
    expect(result.text).toBe('Hello there.');
  });

  it('returns mission data when provided', async () => {
    const mission = { id: 'm1', title: 'Test', description: 'Do it', status: 'ACTIVE' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ text: 'Here is your mission.', mission }),
    });

    const result = await chatWithNPC({ npcId: 'npc1' }, 'Give me a mission');
    expect(result.mission).toEqual(mission);
  });

  it('falls back to mock response on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await chatWithNPC({ npcId: 'npc1' }, 'hello');
    expect(result.text).toBeTruthy();
    expect(result).toHaveProperty('mission');
  });

  it('falls back to mock on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const result = await chatWithNPC({ npcId: 'npc1' }, 'hello');
    expect(result.text).toBeTruthy();
  });

  it('returns mock response for mission keywords', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));

    const result = await chatWithNPC({ npcId: 'npc1' }, 'Do you have a mission for me?');
    expect(result.mission).not.toBeNull();
    expect(result.mission).toHaveProperty('title');
  });

  it('returns empty response for empty input', async () => {
    const result = await chatWithNPC({ npcId: 'npc1' }, '');
    expect(result.text).toBe('...');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('strips HTML from input', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ text: 'Got it.', mission: null }),
    });

    await chatWithNPC({ npcId: 'npc1' }, '<script>alert("xss")</script>hello');

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.playerInput).not.toContain('<script>');
    expect(body.playerInput).toContain('hello');
  });
});
