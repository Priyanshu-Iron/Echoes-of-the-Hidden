/**
 * Shared sprite drawing utilities for top-down character rendering.
 * Eliminates duplication across Player, Guard, and NPC components.
 * @module spriteUtils
 */

/**
 * Draw a drop shadow beneath a character.
 * @param {PIXI.Graphics} g - The graphics context.
 * @param {number} [radiusX=14] - Horizontal radius of the shadow ellipse.
 * @param {number} [radiusY=8] - Vertical radius of the shadow ellipse.
 * @param {number} [offsetY=2] - Vertical offset of the shadow below center.
 * @param {number} [alpha=0.3] - Shadow opacity.
 */
export const drawShadow = (g, radiusX = 14, radiusY = 8, offsetY = 2, alpha = 0.3) => {
  g.ellipse(0, offsetY, radiusX, radiusY);
  g.fill({ color: 0x000000, alpha });
};

/**
 * Draw humanoid legs.
 * @param {PIXI.Graphics} g - The graphics context.
 * @param {number} color - Base color for the legs.
 * @param {number} [alpha=0.7] - Leg opacity.
 */
export const drawLegs = (g, color, alpha = 0.7) => {
  g.roundRect(-8, 14, 6, 8, 2);
  g.fill({ color, alpha });
  g.roundRect(2, 14, 6, 8, 2);
  g.fill({ color, alpha });
};

/**
 * Draw a humanoid torso with shoulders.
 * @param {PIXI.Graphics} g - The graphics context.
 * @param {number} bodyColor - Main body color.
 * @param {number} [highlightColor] - Optional lighter highlight color for body.
 * @param {Object} [options] - Drawing options.
 * @param {number} [options.shoulderWidth=6] - Width of each shoulder pad.
 * @param {number} [options.shoulderHeight=10] - Height of each shoulder pad.
 * @param {boolean} [options.armored=false] - Whether shoulders are wider (for guards).
 */
export const drawTorso = (g, bodyColor, highlightColor, options = {}) => {
  const { shoulderWidth = 6, shoulderHeight = 10, armored = false } = options;
  const sOff = armored ? 14 : 12;

  // Main torso
  g.roundRect(-10, -8, 20, 22, 4);
  g.fill(bodyColor);

  // Highlight overlay
  if (highlightColor) {
    g.roundRect(-8, -6, 16, 18, 3);
    g.fill(highlightColor);
  }

  // Shoulders
  g.roundRect(-sOff, -6, shoulderWidth + (armored ? 2 : 0), shoulderHeight + (armored ? 2 : 0), 3);
  g.fill(bodyColor);
  g.roundRect(sOff - shoulderWidth - (armored ? 2 : 0), -6, shoulderWidth + (armored ? 2 : 0), shoulderHeight + (armored ? 2 : 0), 3);
  g.fill(bodyColor);
};

/**
 * Draw a belt/waist detail.
 * @param {PIXI.Graphics} g - The graphics context.
 * @param {number} [color=0x333355] - Belt color.
 */
export const drawBelt = (g, color = 0x333355) => {
  g.rect(-9, 4, 18, 3);
  g.fill(color);
};

/**
 * Draw a simple head (circle).
 * @param {PIXI.Graphics} g - The graphics context.
 * @param {number} color - Head fill color.
 * @param {number} [radius=7] - Head radius.
 * @param {number} [y=-11] - Vertical position of head center.
 */
export const drawHead = (g, color, radius = 7, y = -11) => {
  g.circle(0, y, radius);
  g.fill(color);
};

/**
 * Draw simple dot eyes.
 * @param {PIXI.Graphics} g - The graphics context.
 * @param {number} [y=-12] - Vertical position of eyes.
 * @param {number} [color=0x222222] - Eye color.
 */
export const drawEyes = (g, y = -12, color = 0x222222) => {
  g.circle(-3, y, 1.5);
  g.fill(color);
  g.circle(3, y, 1.5);
  g.fill(color);
};
