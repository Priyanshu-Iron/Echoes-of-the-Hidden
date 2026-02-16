/**
 * Echoes of the Hidden — Backend API Server
 * 
 * Express server that:
 * - Proxies /api/chat to Google Gemini API (keeps API key server-side)
 * - Uses the official @google/generative-ai SDK with gemini-2.0-flash
 * - Includes rate limiting, input sanitization, and security headers
 * - Serves the Vite production build in production mode
 * 
 * @module server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { aiRateLimiter } from './middleware/rateLimit.js';
import { sanitizeChatInput } from './middleware/sanitize.js';

// Load environment variables
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security Middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.gstatic.com", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com", "https://firebaseinstallations.googleapis.com", "https://www.google-analytics.com"],
      workerSrc: ["'self'", "blob:"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '10kb' })); // Limit request body size

// --- Gemini AI Setup ---
const API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('✅ Gemini AI initialized with gemini-2.0-flash');
} else {
  console.warn('⚠️  No GEMINI_API_KEY found. AI chat will use mock responses.');
}

// --- API Routes ---

/**
 * POST /api/chat
 * Proxies chat messages to the Gemini API.
 * 
 * Request body: { npcContext: object, playerInput: string }
 * Response: { text: string, mission: object|null }
 */
app.post('/api/chat', aiRateLimiter, sanitizeChatInput, async (req, res) => {
  const { npcContext, playerInput, conversationHistory = [] } = req.sanitizedBody;
  const role = npcContext.role || 'Citizen';
  const name = npcContext.name || 'Unknown';

  // Real Gemini API call
  if (model) {
    try {
      // Build conversation history string for context
      const historyBlock = conversationHistory.length > 0
        ? `## CONVERSATION SO FAR\n${conversationHistory.slice(-10).map(m => 
            m.sender === 'player' ? `Player: "${m.text}"` : `${name}: "${m.text}"`
          ).join('\n')}\n\n`
        : '';

      const prompt = `You are "${name}", a ${role} in a top-secret military compound in the stealth game "Echoes of the Hidden".

## YOUR IDENTITY
- **Name**: ${name}
- **Role**: ${role}
${npcContext.personality ? `- **Personality**: ${npcContext.personality}` : ''}
${npcContext.backstory ? `- **Backstory**: ${npcContext.backstory}` : ''}

## AVAILABLE MISSIONS YOU CAN ASSIGN
${npcContext.missions ? npcContext.missions.map((m, i) => `${i + 1}. "${m.title}" — ${m.description} (id: "${m.id}")`).join('\n') : 'No missions available.'}

## RULES — FOLLOW THESE STRICTLY
1. **Stay in character at all times.** You ARE this person. React emotionally, use speech patterns matching your personality.
2. **ALWAYS respond to what the player actually says.** If they ask about guards, tell them about guard patrols. If they ask about escape, give tips about exits. If they ask about the compound, share what you know. Be HELPFUL and SPECIFIC — give real in-world information and tactical advice.
3. **Be engaging and interactive.** Ask the player questions back. React to what they say. Show curiosity, suspicion, humor, or fear depending on your personality.
4. **Never break the fourth wall.** Never mention being an AI, a game character, JSON, or prompts.
5. **Keep responses 2-4 sentences.** Short, punchy, in-character dialogue. No monologues, but be substantive.
6. **Offer missions naturally.** If the conversation leads to it (player asks for help, work, missions, or something aligned with your backstory), assign one of your available missions. Don't offer missions immediately — build rapport first.
7. **React to context.** If the player is rude, react accordingly. If they're friendly, warm up. If they mention guards or danger, respond with urgency.
8. **Use your backstory to drop hints.** Tease secrets. Be mysterious. Make the player want to keep talking.
9. **If the player greets you**, introduce yourself briefly and hint at your situation to hook them into conversation.
10. **Remember the conversation.** Build on what was already said. Reference previous topics naturally. Don't repeat yourself.
11. **NEVER give vague dismissals** like "ask me about a job" or "walls have ears" as a complete response. Always engage with the player's actual topic and add something useful.

${historyBlock}## PLAYER SAYS NOW
"${playerInput}"

## RESPONSE FORMAT
Respond ONLY in valid JSON (no markdown, no code blocks):
{
  "text": "Your in-character dialogue response",
  "mission": null,
  "reputationChange": 1
}

reputationChange should be: 1 for friendly/helpful interactions, 2 for offering a mission, -1 for hostile/rude responses, 0 for neutral.

To assign a mission from your available list:
{
  "text": "Your dialogue introducing the mission",
  "mission": {
    "id": "mission_id_from_list",
    "title": "Mission Title from list",
    "description": "Mission description from list",
    "status": "ACTIVE"
  },
  "reputationChange": 2
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanJson = responseText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      if (!parsed.text || typeof parsed.text !== 'string') {
        throw new Error('Invalid response structure from AI');
      }

      return res.json({
        text: parsed.text,
        mission: parsed.mission || null,
        reputationChange: parsed.reputationChange || 0,
      });
    } catch (error) {
      console.error('❌ Gemini API error:', error.message);
      if (error.stack) console.error('   Stack:', error.stack.split('\n').slice(0, 3).join('\n'));
      console.error('   NPC:', name, '| Role:', role, '| Input:', playerInput.slice(0, 50));
      // Fall through to mock
    }
  }

  // --- Rich mock fallback (role-specific) ---
  const lowerInput = playerInput.toLowerCase();
  const wantsMission = lowerInput.includes('mission') || lowerInput.includes('job') || lowerInput.includes('help') || lowerInput.includes('work') || lowerInput.includes('task');
  const isGreeting = lowerInput.includes('hello') || lowerInput.includes('hi ') || lowerInput.match(/^hi$/) || lowerInput.includes('hey') || lowerInput.includes('greet');
  const isQuestion = lowerInput.includes('?');
  const aboutGuards = lowerInput.includes('guard') || lowerInput.includes('patrol') || lowerInput.includes('soldier');
  const aboutEscape = lowerInput.includes('escape') || lowerInput.includes('get away') || lowerInput.includes('get out') || lowerInput.includes('leave') || lowerInput.includes('exit') || lowerInput.includes('run');
  const aboutSecurity = lowerInput.includes('camera') || lowerInput.includes('security') || lowerInput.includes('surveillance') || lowerInput.includes('alarm');
  const aboutLocation = lowerInput.includes('where') || lowerInput.includes('room') || lowerInput.includes('server') || lowerInput.includes('command') || lowerInput.includes('armory') || lowerInput.includes('storage');
  const aboutDanger = lowerInput.includes('danger') || lowerInput.includes('safe') || lowerInput.includes('careful') || lowerInput.includes('risk') || lowerInput.includes('caught');

  const mockResponses = {
    'Informant': {
      greeting: { text: "You don't look like one of them. I'm the Shadow Broker — former intel analyst, now freelance truth dealer. I've got eyes and ears all over this compound. So tell me... what brought you to this little slice of hell?", reputationChange: 1 },
      mission: { text: "Listen carefully — there's a classified dossier in the Server Room. They're planning to wipe it tonight. Get it before it's gone, and I'll owe you one. That dossier has names, dates, everything.", mission: { id: 'shadow_intel', title: 'Stolen Intelligence', description: 'Recover the classified dossier from the Server Room before it gets wiped.', status: 'ACTIVE' }, reputationChange: 2 },
      question: { text: "I know things that could bring this whole place down. The Commander's been running black ops off the books. But information has a price — are you willing to do a job for me first?", reputationChange: 0 },
      guards: { text: "The guards patrol in predictable patterns — east corridor first, then they loop back through the courtyard. Wait for them to pass the pillars, then move. Timing is everything in here.", reputationChange: 0 },
      escape: { text: "The north exit is your best bet — there's a gap in the perimeter near the top of the map. But you'll need to get past the courtyard patrols first. Stick to the corridors and use the pillars for cover.", reputationChange: 0 },
      security: { text: "Cameras cover the restricted zones — Server Room and Command Center. But there's a blind spot near the doorways if you hug the walls. The hacker, Ghost, might be able to shut them down entirely.", reputationChange: 0 },
      location: { text: "The Server Room is top-right, heavily restricted. Command Center is bottom-right — that's where the real secrets are. The Security Office in the top-left controls the surveillance grid.", reputationChange: 0 },
      danger: { text: "Nowhere is truly safe here, but the corridors between rooms give you the most options to run. Stay out of restricted zones unless you've got a plan. The guards shoot first and ask questions never.", reputationChange: 0 },
      fallback: { text: "Interesting... you're not the usual type I see around here. I trade in secrets — guard rotations, room layouts, who's dirty — but I need to know you're serious first. What exactly do you need to know?", reputationChange: 0 },
    },
    'Civilian': {
      greeting: { text: "Oh! You startled me... I'm just the kitchen worker here but I've heard things — the guards talk when they think no one's listening. They mentioned something about late-night shipments from the Server Room. What brings you here?", reputationChange: 1 },
      mission: { text: "Please, you have to help me! My brother — they took him to the Command Center. I don't know what they're doing to him. Can you find any sign of him? I'll tell you everything I know about guard schedules in return.", mission: { id: 'kitchen_rescue', title: 'Find My Brother', description: 'My brother is held somewhere in the Command Center. Please find any sign of him.', status: 'ACTIVE' }, reputationChange: 2 },
      question: { text: "The guards change shifts every few hours. I hear them talking about something in the restricted area... something they're afraid of. One of them mentioned 'samples' last week.", reputationChange: 0 },
      guards: { text: "I see them every day from the kitchen. The morning shift is stricter — they patrol in pairs near the restricted areas. Evening shift gets lazy, especially near the Mess Hall. That's your window.", reputationChange: 0 },
      escape: { text: "There's an exit at the north end of the compound — I've seen supply trucks come through there. But it's guarded. Maybe if you could create a distraction... the fire alarm in the Mess Hall might do it.", reputationChange: 0 },
      security: { text: "The guards in the Security Office control everything — cameras, alarms, door locks. If you could get someone to disable their systems, you'd have free run of the place.", reputationChange: 0 },
      location: { text: "I mostly know the Mess Hall and the corridors. But I've overheard that the Command Center at the bottom-right is where they keep prisoners. Stay away from the Server Room — it's always watched.", reputationChange: 0 },
      danger: { text: "This whole place is dangerous, but the restricted areas... those are death traps. If a guard catches you in a red zone, they won't just arrest you. Please be careful.", reputationChange: 0 },
      fallback: { text: "I shouldn't be talking to you, but you seem different. The things happening here... they're not right. What do you want to know? I've overheard more than I should.", reputationChange: 0 },
    },
    'Hacker': {
      greeting: { text: "Well well, a visitor. Call me Ghost — I make security systems cry for mercy. I've already mapped half their network from this terminal. So are you just wandering around, or do you actually have a plan?", reputationChange: 1 },
      mission: { text: "Alright, here's the deal. I need physical access to the Security Office to plant my USB drive. Get in there, plug it in, and I'll blind every camera in this place for 5 minutes. That's your window to do whatever you need.", mission: { id: 'hack_cameras', title: 'Disable Surveillance', description: 'Reach the Security Office and plug in my USB drive to disable all cameras for 5 minutes.', status: 'ACTIVE' }, reputationChange: 2 },
      question: { text: "Their encryption is military-grade, but I've cracked better. The real problem is physical access — I need someone with legs and guts. That's where you come in, if you're up for it.", reputationChange: 0 },
      guards: { text: "Guards are analog — no tech can help with a guy who literally stares at a hallway. But their comms run through the Security Office. Cut the comms, and they can't coordinate. They become dumb solo units.", reputationChange: 0 },
      escape: { text: "I can see the exit on the north side from the compound map I've downloaded. The electronic locks on the perimeter gate can be overridden — but only from the Security Office terminal. Help me get access and I'll open it.", reputationChange: 0 },
      security: { text: "Their camera feeds all route through the Security Office in the top-left corner. One USB drive in the right port and I can loop the footage or shut them down entirely. The cameras don't cover the corridors, by the way — only rooms.", reputationChange: 0 },
      location: { text: "I've mapped the whole compound from intercepted radio chatter. The Server Room top-right has their data, Command Center bottom-right has their leadership. Armory on the mid-right is heavily guarded.", reputationChange: 0 },
      danger: { text: "Restricted zones have motion sensors on top of cameras. Double layers of security. But they're all digital — which means they're my domain. Get me physical access and I'll handle the rest.", reputationChange: 0 },
      fallback: { text: "Look, I don't do chitchat — I do exploits. But you seem useful. Tell me what you're trying to do and I'll tell you how to hack your way through it. What's your objective?", reputationChange: 0 },
    },
    'Guard Captain': {
      greeting: { text: "You've got guts approaching me directly. I'm Captain Ironjaw — 15 years in this place. Something tells me you're not just another trespasser. I've been watching you... you move like someone with a purpose. What do you want?", reputationChange: 1 },
      mission: { text: "I've been following orders I don't believe in anymore. If you can bring me proof of the Commander's illegal orders from the Command Center, I'll turn the guards against him. This ends tonight.", mission: { id: 'captain_proof', title: 'Evidence of Corruption', description: "Bring me proof of the Commander's illegal orders from the Command Center.", status: 'ACTIVE' }, reputationChange: 2 },
      question: { text: "I've served here 15 years. The things I've seen... the Commander's orders have gotten darker. Something's wrong at the top, and I'm tired of pretending otherwise. Ask me what you need to know.", reputationChange: 0 },
      guards: { text: "My men patrol in set routes — I designed those routes myself. The corridor guards sweep east-to-west, the courtyard unit does a clockwise loop around the pillars. There's a 30-second gap when they reach the far side.", reputationChange: 0 },
      escape: { text: "The north exit is the only viable way out. I could order my men to stand down, but I need a reason — proof that the Commander's gone rogue. Bring me evidence and I'll clear a path myself.", reputationChange: 0 },
      security: { text: "The Security Office in the top-left runs the whole surveillance grid. I have access but I can't disable it without raising suspicion. If someone else did it though... that'd be a different story.", reputationChange: 0 },
      location: { text: "Command Center bottom-right is the Commander's domain. The Server Room has the digital records. If you're looking for proof of corruption, those are your two targets.", reputationChange: 0 },
      danger: { text: "The restricted zones are kill-on-sight. My men have orders I can't override — yet. Stay in the corridors and public areas until you're ready to make your move. Plan it once, execute it fast.", reputationChange: 0 },
      fallback: { text: "I didn't get to this rank by being careless. You want my help? Show me you're serious. What's your situation? What have you seen so far? I need to know I can trust you before I stick my neck out.", reputationChange: 0 },
    },
    'Doctor': {
      greeting: { text: "Please, come in quietly. I'm Dr. Voss — officially the compound's medic, but... the things they're asking me to do go far beyond medicine. I can't sleep anymore. Are you someone I can trust? I desperately need help.", reputationChange: 1 },
      mission: { text: "There are biological samples in the restricted Server Room — the results of unethical experiments. They're planning to ship them out tomorrow. Please, destroy them before they leave this compound. The world can't have these.", mission: { id: 'doctor_samples', title: 'Destroy the Samples', description: "There are biological samples in the restricted Server Room. Destroy them before they're shipped out.", status: 'ACTIVE' }, reputationChange: 2 },
      question: { text: "They call it 'research' but I've seen the subjects. Those aren't volunteers in there. If only I could get the medical records out, the world would know the truth about what's happening.", reputationChange: 0 },
      guards: { text: "The guards avoid the medical bay — they're superstitious about the experiments. That makes this one of the safer spots in the compound. But the ones near the Server Room are armed and paranoid.", reputationChange: 0 },
      escape: { text: "If you're hurt, come to me first — I can patch you up. The north exit is your way out, but you'll need to be in one piece to make it. I've treated enough broken bodies to know the guards don't hold back.", reputationChange: 0 },
      security: { text: "The medical wing has no cameras — they don't want footage of what happens here. Use it as a safe passage when you can. The Barracks next door has minimal coverage too.", reputationChange: 0 },
      location: { text: "The Server Room is where they keep the experiment data and samples. The Command Center has the authorization records — proof of who ordered these atrocities. Both are in the restricted zones on the right side.", reputationChange: 0 },
      danger: { text: "The experiments... they've changed people. Some of the subjects in the restricted zone aren't fully... themselves anymore. Be extremely careful if you go in there. And if you see someone acting erratically, keep your distance.", reputationChange: 0 },
      fallback: { text: "Everyone who walks through that door is a victim of the same machine — guards and prisoners alike. I've patched up both sides. Tell me what's happening out there. What do you need from me?", reputationChange: 0 },
    },
    'Arms Dealer': {
      greeting: { text: "Hey there, friend. Name's Viper \u2014 I move things around here that aren't supposed to move. Weapons, supplies, information... everything has a price, and everyone here has a need. So what's yours?", reputationChange: 1 },
      mission: { text: "Simple job, good pay. There's a package in Storage that needs to reach me discreetly. No questions about what's inside, no questions about who it's for. You bring it, I make it worth your while \u2014 maybe some intel on the guard routes.", mission: { id: 'dealer_supply', title: 'Smuggle the Package', description: 'Pick up a package from the Storage room and bring it to me. No questions asked.', status: 'ACTIVE' }, reputationChange: 2 },
      question: { text: "I know every corridor, every blind spot, every guard's dirty secret in this compound. Knowledge like that is valuable \u2014 possibly the most valuable thing in here. What do you want to know?", reputationChange: 0 },
      guards: { text: "Guards can be bought, bribed, or bypassed. The ones on the east patrol are greedy \u2014 a distraction near the Armory pulls them away every time. The courtyard guards are harder \u2014 they actually care about their job.", reputationChange: 0 },
      escape: { text: "Getting out? That's a premium service, my friend. The north gate has an electronic lock \u2014 you'll need either the code from the Security Office or someone techie enough to crack it. I can get you supplies for the journey if you do something for me.", reputationChange: 0 },
      security: { text: "Cameras are your enemy, but they have blind spots near every door. The feeds are all monitored from the Security Office. Knock that out and you're invisible. I've got contacts who can help \u2014 for a price.", reputationChange: 0 },
      location: { text: "Storage is bottom-center \u2014 that's my turf, where I keep my... inventory. The Armory to the mid-right has the heavy stuff, but it's locked down tight. The corridors are neutral ground.", reputationChange: 0 },
      danger: { text: "The most dangerous thing in this compound isn't the guards \u2014 it's the Commander. He's paranoid, ruthless, and he's got eyes everywhere. Step wrong once and you won't get a second chance.", reputationChange: 0 },
      fallback: { text: "I don't chat for fun \u2014 but I do business with anyone who's useful. Tell me what you're after. Supplies? Information? A way out? Everyone wants something, and I'm the guy who can provide \u2014 for the right price.", reputationChange: 0 },
    },
  };

  const npcMock = mockResponses[role] || mockResponses['Civilian'];

  if (wantsMission) return res.json(npcMock.mission);
  if (isGreeting) return res.json({ ...npcMock.greeting, mission: null });
  if (aboutGuards) return res.json({ ...npcMock.guards, mission: null });
  if (aboutEscape) return res.json({ ...npcMock.escape, mission: null });
  if (aboutSecurity) return res.json({ ...npcMock.security, mission: null });
  if (aboutLocation) return res.json({ ...npcMock.location, mission: null });
  if (aboutDanger) return res.json({ ...npcMock.danger, mission: null });
  if (isQuestion) return res.json({ ...npcMock.question, mission: null });
  return res.json({ ...npcMock.fallback, mission: null });
});

/** GET /api/health — Health check endpoint */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ai: model ? 'gemini-2.0-flash' : 'mock',
    timestamp: new Date().toISOString(),
  });
});

// --- Serve Static Files in Production ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Echoes server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
