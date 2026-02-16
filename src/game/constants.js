/**
 * Game-wide constants for Echoes of the Hidden.
 * Centralizes magic numbers used across multiple modules.
 * @module constants
 */

/** Guard field of view in radians (60 degrees) */
export const GUARD_FOV = Math.PI / 3;

/** Guard vision range in pixels */
export const GUARD_VIEW_RANGE = 200;

/** Guard patrol speed (pixels per frame at 60fps) */
export const GUARD_PATROL_SPEED = 1.5;

/** Guard chase speed (pixels per frame at 60fps) */
export const GUARD_CHASE_SPEED = 3;

/** Player base movement speed (pixels per frame at 60fps) */
export const PLAYER_SPEED = 4;

/** Player collision half-width in pixels */
export const PLAYER_HALF_WIDTH = 12;

/** Player collision half-height in pixels */
export const PLAYER_HALF_HEIGHT = 12;

/** Distance in pixels within which the player can interact with an NPC */
export const INTERACTION_RANGE = 50;

/** NPC proximity indicator range in pixels */
export const NPC_NEARBY_RANGE = 60;

/** Rate at which suspicion increases per frame when detected */
export const SUSPICION_INCREASE_RATE = 1;

/** Rate at which suspicion decays per frame when not detected */
export const SUSPICION_DECAY_RATE = 0.1;

/** Maximum suspicion value */
export const MAX_SUSPICION = 100;

/** Maximum reputation value */
export const MAX_REPUTATION = 100;

/** Minimum reputation value */
export const MIN_REPUTATION = 0;

/** Default player starting reputation */
export const DEFAULT_REPUTATION = 50;

/** Diagonal movement normalization factor */
export const DIAGONAL_FACTOR = 1 / Math.sqrt(2);

/** Interaction check interval in milliseconds */
export const INTERACTION_CHECK_INTERVAL = 100;

/** LocalStorage key for game save data */
export const STORAGE_KEY = 'echoes_save_v1';

/** Maximum characters allowed in dialogue input */
export const MAX_DIALOGUE_INPUT_LENGTH = 500;

/** Rate limit: max AI requests per window */
export const AI_RATE_LIMIT_MAX = 10;

/** Rate limit window duration in milliseconds (1 minute) */
export const AI_RATE_LIMIT_WINDOW = 60000;
