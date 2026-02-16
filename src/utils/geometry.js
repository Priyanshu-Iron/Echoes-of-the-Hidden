/**
 * Geometric utility functions for game calculations.
 * Used by guard AI, NPC interaction ranges, and collision detection.
 * @module utils/geometry
 */

/**
 * Calculate the Euclidean distance between two points.
 * @param {{x: number, y: number}} p1 - First point.
 * @param {{x: number, y: number}} p2 - Second point.
 * @returns {number} Distance between the two points.
 */
export const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calculate the angle (in radians) from p1 to p2.
 * Returns value in range [-PI, PI], where 0 = right, PI/2 = down.
 * @param {{x: number, y: number}} p1 - Origin point.
 * @param {{x: number, y: number}} p2 - Target point.
 * @returns {number} Angle in radians.
 */
export const getAngle = (p1, p2) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

/**
 * Check if a target point is within a vision cone.
 * @param {{x: number, y: number}} origin - Cone origin (e.g., guard position).
 * @param {{x: number, y: number}} target - Point to test (e.g., player position).
 * @param {number} direction - Direction the cone faces (radians).
 * @param {number} fov - Field of view in radians (total arc width).
 * @param {number} range - Maximum range of the cone in pixels.
 * @returns {boolean} True if the target is within the cone.
 */
export const isPointInCone = (origin, target, direction, fov, range) => {
    const dist = getDistance(origin, target);
    if (dist > range) return false;

    const angleToTarget = getAngle(origin, target);
    let angleDiff = angleToTarget - direction;

    // Normalize angle to -PI to PI
    while (angleDiff <= -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    return Math.abs(angleDiff) <= fov / 2;
};

/**
 * Check if there is a clear line of sight between two points.
 * Currently returns true (no wall raycasting implemented yet).
 * @param {{x: number, y: number}} origin - Start point.
 * @param {{x: number, y: number}} target - End point.
 * @param {Array} [walls=[]] - Array of wall segments (unused).
 * @returns {boolean} True if line of sight is clear.
 */
export const hasLineOfSight = (origin, target, walls = []) => {
    // TODO: Implement actual raycasting against walls
    return true;
};
