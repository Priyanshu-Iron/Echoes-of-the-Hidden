/**
 * AI chat service for NPC interactions.
 * Routes requests through the backend API proxy to keep the API key server-side.
 * Falls back to mock responses if the backend is unreachable.
 * 
 * @module services/ai
 */

import { MAX_DIALOGUE_INPUT_LENGTH, AI_RATE_LIMIT_MAX, AI_RATE_LIMIT_WINDOW } from '../game/constants';

// Client-side rate limiting (defense in depth — server also rate-limits)
let requestTimestamps = [];

/**
 * Check if the client-side rate limit has been exceeded.
 * @returns {boolean} True if rate limit exceeded.
 */
const isRateLimited = () => {
  const now = Date.now();
  requestTimestamps = requestTimestamps.filter(t => now - t < AI_RATE_LIMIT_WINDOW);
  return requestTimestamps.length >= AI_RATE_LIMIT_MAX;
};

/**
 * Sanitize user input before sending to the API.
 * @param {string} input - Raw user input.
 * @returns {string} Sanitized input string.
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Strip control chars
    .trim()
    .slice(0, MAX_DIALOGUE_INPUT_LENGTH);
};

/**
 * Send a chat message to an NPC and receive a response.
 * 
 * @param {Object} npcContext - Context about the NPC being spoken to.
 * @param {string} npcContext.npcId - Unique NPC identifier.
 * @param {string} [npcContext.role] - NPC's role (e.g., 'Informant', 'Civilian').
 * @param {string} [npcContext.name] - NPC's display name.
 * @param {string} playerInput - The player's message text.
 * @returns {Promise<{text: string, mission: Object|null}>} NPC response.
 */
export const chatWithNPC = async (npcContext, playerInput) => {
  // Client-side rate check
  if (isRateLimited()) {
    return {
      text: "I need a moment to think. Come back shortly.",
      mission: null,
    };
  }

  const sanitizedInput = sanitizeInput(playerInput);
  if (!sanitizedInput) {
    return { text: "...", mission: null };
  }

  // Try backend API first
  try {
    requestTimestamps.push(Date.now());

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        npcContext: {
          npcId: npcContext.npcId,
          role: npcContext.role || 'Citizen',
          name: npcContext.name || 'Unknown',
        },
        playerInput: sanitizedInput,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text || "...",
      mission: data.mission || null,
    };
  } catch (error) {
    console.warn('[AI] Backend unreachable, falling back to mock:', error.message);
    return getMockResponse(sanitizedInput);
  }
};

/**
 * Generate a mock response for offline/fallback mode.
 * @param {string} input - Sanitized player input.
 * @returns {{text: string, mission: Object|null}} Mock NPC response.
 */
const getMockResponse = (input) => {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('mission') || lowerInput.includes('job')) {
    return {
      text: "Shh. I have a job for you. There's a data drive in the northern warehouse. Retrieve it and I'll make it worth your while.",
      mission: {
        id: 'mission_' + Date.now(),
        title: 'Retrieve Data Drive',
        description: 'Get the drive from the North Warehouse.',
        status: 'ACTIVE',
      },
    };
  } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    return {
      text: "Keep your voice down. The guards are everywhere today.",
      mission: null,
    };
  } else {
    return {
      text: "I don't know what you're talking about. Move along.",
      mission: null,
    };
  }
};
