/**
 * Input sanitization middleware for the AI chat endpoint.
 * Validates and sanitizes user input before forwarding to the AI API.
 * @module middleware/sanitize
 */

const MAX_INPUT_LENGTH = 500;
const MAX_NPC_CONTEXT_LENGTH = 1000;

/**
 * Strip HTML tags and control characters from a string.
 * @param {string} str - Input string to sanitize.
 * @returns {string} Sanitized string.
 */
const stripTags = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')           // Remove HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .trim();
};

/**
 * Validate and sanitize the /api/chat request body.
 * Expects: { npcContext: object, playerInput: string }
 */
export const sanitizeChatInput = (req, res, next) => {
  const { npcContext, playerInput } = req.body;

  // Validate presence
  if (!playerInput || typeof playerInput !== 'string') {
    return res.status(400).json({ error: 'playerInput is required and must be a string.' });
  }

  if (!npcContext || typeof npcContext !== 'object') {
    return res.status(400).json({ error: 'npcContext is required and must be an object.' });
  }

  // Sanitize player input
  const sanitizedInput = stripTags(playerInput).slice(0, MAX_INPUT_LENGTH);
  if (sanitizedInput.length === 0) {
    return res.status(400).json({ error: 'playerInput cannot be empty after sanitization.' });
  }

  // Sanitize NPC context fields
  const sanitizedContext = {};
  for (const [key, value] of Object.entries(npcContext)) {
    if (typeof value === 'string') {
      sanitizedContext[key] = stripTags(value).slice(0, MAX_NPC_CONTEXT_LENGTH);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitizedContext[key] = value;
    }
    // Drop other types (arrays, objects with untrusted data, etc.)
  }

  // Attach sanitized values to request
  req.sanitizedBody = {
    npcContext: sanitizedContext,
    playerInput: sanitizedInput,
  };

  next();
};
