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
  const { npcContext, playerInput } = req.sanitizedBody;

  // Real Gemini API call
  if (model) {
    try {
      const prompt = `You are a character in a stealth game called "Echoes of the Hidden".
Role: ${npcContext.role || 'Citizen'}
Name: ${npcContext.name || 'Unknown'}
Context: ${JSON.stringify(npcContext)}
Player says: "${playerInput}"

Respond in valid JSON format only (no markdown, no code blocks):
{
  "text": "Your dialogue response (max 2 sentences, stay in character)",
  "mission": null
}

If the player asks for a mission or job, include a mission object:
{
  "text": "Your dialogue response",
  "mission": {
    "id": "mission_unique_id",
    "title": "Mission Title",
    "description": "Brief objective description",
    "status": "ACTIVE"
  }
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean up any markdown code blocks Gemini might include
      const cleanJson = responseText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      // Validate response structure
      if (!parsed.text || typeof parsed.text !== 'string') {
        throw new Error('Invalid response structure from AI');
      }

      return res.json({
        text: parsed.text,
        mission: parsed.mission || null,
      });
    } catch (error) {
      console.error('Gemini API error:', error.message);
      return res.json({
        text: "I can't think straight right now. Come back later.",
        mission: null,
      });
    }
  }

  // Mock fallback
  const lowerInput = playerInput.toLowerCase();

  if (lowerInput.includes('mission') || lowerInput.includes('job')) {
    return res.json({
      text: "Shh. I have a job for you. There's a data drive in the northern warehouse. Retrieve it and I'll make it worth your while.",
      mission: {
        id: 'mission_' + Date.now(),
        title: 'Retrieve Data Drive',
        description: 'Get the drive from the North Warehouse.',
        status: 'ACTIVE',
      },
    });
  } else if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    return res.json({
      text: "Keep your voice down. The guards are everywhere today.",
      mission: null,
    });
  } else {
    return res.json({
      text: "I don't know what you're talking about. Move along.",
      mission: null,
    });
  }
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
