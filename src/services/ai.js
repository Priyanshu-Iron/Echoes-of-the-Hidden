/**
 * AI chat service for NPC interactions.
 * Routes requests through the backend API proxy to keep the API key server-side.
 * Falls back to role-specific mock responses if the backend is unreachable.
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
    .replace(/<[^>]*>/g, '')           // Strip HTML tags (XSS prevention)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Strip control chars
    .trim()
    .slice(0, MAX_DIALOGUE_INPUT_LENGTH);
};

/**
 * Send a chat message to an NPC and receive a response.
 * Passes full NPC context (personality, backstory, missions) to the server
 * for rich, in-character AI responses.
 * 
 * @param {Object} npcContext - Context about the NPC being spoken to.
 * @param {string} npcContext.npcId - Unique NPC identifier.
 * @param {string} [npcContext.role] - NPC's role (e.g., 'Informant', 'Civilian').
 * @param {string} [npcContext.name] - NPC's display name.
 * @param {string} [npcContext.personality] - NPC's personality description.
 * @param {string} [npcContext.backstory] - NPC's backstory.
 * @param {Array} [npcContext.missions] - Available missions for this NPC.
 * @param {string} playerInput - The player's message text.
 * @returns {Promise<{text: string, mission: Object|null}>} NPC response.
 */
export const chatWithNPC = async (npcContext, playerInput, conversationHistory = []) => {
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
          personality: npcContext.personality || '',
          backstory: npcContext.backstory || '',
          missions: npcContext.missions || [],
        },
        playerInput: sanitizedInput,
        conversationHistory: conversationHistory
          .filter(m => m.sender !== 'system')
          .slice(-10)
          .map(m => ({ sender: m.sender, text: m.text })),
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
    return getMockResponse(sanitizedInput, npcContext);
  }
};

/**
 * Generate a role-specific mock response for offline/fallback mode.
 * @param {string} input - Sanitized player input.
 * @param {Object} npcContext - NPC context info.
 * @returns {{text: string, mission: Object|null}} Mock NPC response.
 */
const getMockResponse = (input, npcContext = {}) => {
  const lowerInput = input.toLowerCase();
  const role = npcContext.role || 'Civilian';

  const wantsMission = lowerInput.includes('mission') || lowerInput.includes('job') || lowerInput.includes('help') || lowerInput.includes('work');
  const isGreeting = lowerInput.includes('hello') || lowerInput.includes('hey') || lowerInput.match(/^hi$/) || lowerInput.includes('hi ');
  const aboutGuards = lowerInput.includes('guard') || lowerInput.includes('patrol') || lowerInput.includes('soldier');
  const aboutEscape = lowerInput.includes('escape') || lowerInput.includes('get away') || lowerInput.includes('get out') || lowerInput.includes('leave') || lowerInput.includes('exit');
  const aboutSecurity = lowerInput.includes('camera') || lowerInput.includes('security') || lowerInput.includes('surveillance');

  const roleResponses = {
    'Informant': {
      greeting: "You don't look like one of them. I'm the Shadow Broker — former intel analyst, now freelance truth dealer. What brought you to this place?",
      mission: { text: "There's a classified dossier in the Server Room. Get it before they wipe it — it has names, dates, everything.", mission: { id: 'shadow_intel', title: 'Stolen Intelligence', description: 'Recover the classified dossier from the Server Room before it gets wiped.', status: 'ACTIVE' }},
      guards: "Guards patrol in predictable patterns — east corridor first, then they loop through the courtyard. Wait for the gap near the pillars.",
      escape: "North exit is your best bet. Get past the courtyard patrols first — stick to the corridors and use the pillars for cover.",
      security: "Cameras cover the restricted zones but there are blind spots near doorways. The hacker Ghost might be able to shut them down entirely.",
      fallback: "Interesting... you're not the usual type. I trade in secrets — guard rotations, room layouts, who's dirty. What do you need to know?",
    },
    'Civilian': {
      greeting: "Oh! You startled me... I'm the kitchen worker but I hear things — the guards talk when they think no one's listening. What brings you here?",
      mission: { text: "My brother was taken to the Command Center. Please find any sign of him! I'll tell you everything I know about guard schedules.", mission: { id: 'kitchen_rescue', title: 'Find My Brother', description: 'My brother is held somewhere in the Command Center. Please find any sign of him.', status: 'ACTIVE' }},
      guards: "The morning shift patrols in pairs near restricted areas. Evening shift gets lazy near the Mess Hall — that's your window.",
      escape: "There's an exit at the north end. It's guarded, but a distraction — like the fire alarm in the Mess Hall — might clear the way.",
      security: "The Security Office controls everything — cameras, alarms, door locks. Disable their systems and you'd have free run of the place.",
      fallback: "I shouldn't be talking to you, but you seem different. What do you want to know? I've overheard more than I should.",
    },
    'Hacker': {
      greeting: "Call me Ghost — I make security systems cry for mercy. So are you just wandering, or do you actually have a plan?",
      mission: { text: "Plant my USB in the Security Office. I'll blind every camera for 5 minutes — that's your window.", mission: { id: 'hack_cameras', title: 'Disable Surveillance', description: 'Reach the Security Office and plug in my USB drive to disable all cameras for 5 minutes.', status: 'ACTIVE' }},
      guards: "Guards are analog — but their comms run through the Security Office. Cut the comms and they can't coordinate. They become dumb solo units.",
      escape: "The north gate has electronic locks. They can be overridden from the Security Office terminal. Help me get access and I'll open it.",
      security: "Camera feeds all route through the Security Office top-left. One USB drive and I can loop the footage or shut them down. Cameras only cover rooms, not corridors.",
      fallback: "I don't do chitchat — I do exploits. But you seem useful. Tell me what you're trying to do and I'll tell you how to hack through it.",
    },
    'Guard Captain': {
      greeting: "I'm Captain Ironjaw — 15 years in this place. You move like someone with a purpose. What do you want?",
      mission: { text: "Bring me proof of the Commander's illegal orders from the Command Center. I'll turn the guards against him.", mission: { id: 'captain_proof', title: 'Evidence of Corruption', description: "Bring me proof of the Commander's illegal orders from the Command Center.", status: 'ACTIVE' }},
      guards: "My men patrol set routes — corridor guards sweep east-to-west, courtyard unit does a clockwise loop. There's a 30-second gap at the far side.",
      escape: "The north exit is the only way out. Bring me evidence the Commander's gone rogue and I'll clear the path myself.",
      security: "Security Office top-left runs the surveillance grid. I can't disable it without suspicion, but if someone else did... that's another story.",
      fallback: "You want my help? Show me you're serious. What's your situation? I need to trust you before I stick my neck out.",
    },
    'Doctor': {
      greeting: "I'm Dr. Voss — the compound medic. The things they ask me to do... go far beyond medicine. Are you someone I can trust?",
      mission: { text: "Biological samples in the Server Room — unethical experiments. Destroy them before they ship out tomorrow.", mission: { id: 'doctor_samples', title: 'Destroy the Samples', description: "There are biological samples in the restricted Server Room. Destroy them before they're shipped out.", status: 'ACTIVE' }},
      guards: "Guards avoid the medical bay — superstitious about the experiments. This is one of the safer spots. But Server Room guards are armed and paranoid.",
      escape: "Come to me if you're hurt — I'll patch you up. The north exit is your way out, but you'll need to be in one piece for it.",
      security: "The medical wing has no cameras — they don't want footage of what happens here. Use it as a safe passage.",
      fallback: "Everyone here is a victim of the same machine. Tell me what's happening out there — what do you need from me?",
    },
    'Arms Dealer': {
      greeting: "Name's Viper — I move things that aren't supposed to move. Weapons, supplies, info... everything has a price. What's yours?",
      mission: { text: "Simple job: pick up a package from Storage, bring it to me. No questions. I'll give you intel on the guard routes in return.", mission: { id: 'dealer_supply', title: 'Smuggle the Package', description: 'Pick up a package from the Storage room and bring it to me. No questions asked.', status: 'ACTIVE' }},
      guards: "Guards can be bought, bribed, or bypassed. East patrol guards are greedy — distract them near the Armory. Courtyard guards are tougher.",
      escape: "The north gate has an electronic lock. You need the code from the Security Office or a techie to crack it. I can get you supplies for the trip.",
      security: "Cameras have blind spots near every door. Feeds are monitored from the Security Office — knock that out and you're invisible.",
      fallback: "I don't chat for fun, but I do business. Supplies? Information? A way out? Tell me what you're after.",
    },
  };

  const mock = roleResponses[role] || roleResponses['Civilian'];

  if (wantsMission) return mock.mission;
  if (isGreeting) return { text: mock.greeting, mission: null };
  if (aboutGuards) return { text: mock.guards, mission: null };
  if (aboutEscape) return { text: mock.escape, mission: null };
  if (aboutSecurity) return { text: mock.security, mission: null };
  return { text: mock.fallback, mission: null };
};
