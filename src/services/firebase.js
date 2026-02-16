/**
 * Firebase Analytics integration for gameplay event tracking.
 * Logs key game events to Google Analytics via Firebase.
 * 
 * @module services/firebase
 */

import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';

/**
 * Firebase configuration.
 * Replace these values with your Firebase project config from:
 * https://console.firebase.google.com/project/_/settings/general
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

let analytics = null;

/**
 * Initialize Firebase Analytics.
 * Silently no-ops if Firebase config is missing or analytics is unsupported.
 */
export const initFirebase = async () => {
  try {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('[Firebase] No config found. Analytics disabled.');
      return;
    }

    const supported = await isSupported();
    if (!supported) {
      console.warn('[Firebase] Analytics not supported in this environment.');
      return;
    }

    const app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  } catch (error) {
    console.warn('[Firebase] Init failed:', error.message);
  }
};

/**
 * Log a gameplay event to Firebase Analytics.
 * Silently no-ops if analytics is not initialized.
 * 
 * @param {string} eventName - Event name (e.g., 'npc_interaction').
 * @param {Object} [params] - Event parameters.
 */
export const logGameEvent = (eventName, params = {}) => {
  if (!analytics) return;

  try {
    logEvent(analytics, eventName, {
      ...params,
      timestamp: Date.now(),
    });
  } catch (error) {
    // Silently fail — analytics should never break gameplay
    console.warn('[Firebase] Log event failed:', error.message);
  }
};

// Pre-defined game event helpers

/** Log when a player starts interacting with an NPC */
export const logNPCInteraction = (npcId, npcRole) => {
  logGameEvent('npc_interaction', { npc_id: npcId, npc_role: npcRole });
};

/** Log when a mission is started */
export const logMissionStarted = (missionId, missionTitle) => {
  logGameEvent('mission_started', { mission_id: missionId, mission_title: missionTitle });
};

/** Log when a mission is completed */
export const logMissionCompleted = (missionId) => {
  logGameEvent('mission_completed', { mission_id: missionId });
};

/** Log when suspicion reaches maximum */
export const logSuspicionMaxed = () => {
  logGameEvent('suspicion_maxed');
};

/** Log game save */
export const logGameSave = () => {
  logGameEvent('game_saved');
};

/** Log game load */
export const logGameLoad = () => {
  logGameEvent('game_loaded');
};
