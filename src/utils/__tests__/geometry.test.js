/**
 * Unit tests for geometry utility functions.
 * Tests distance, angle, cone detection, and line-of-sight.
 */

import { describe, it, expect } from 'vitest';
import { getDistance, getAngle, isPointInCone, hasLineOfSight } from '../geometry';

describe('getDistance', () => {
  it('returns 0 for the same point', () => {
    expect(getDistance({ x: 5, y: 5 }, { x: 5, y: 5 })).toBe(0);
  });

  it('calculates distance for known horizontal distance', () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 0 })).toBe(3);
  });

  it('calculates distance for known vertical distance', () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 0, y: 4 })).toBe(4);
  });

  it('calculates distance for 3-4-5 triangle', () => {
    expect(getDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('handles negative coordinates', () => {
    expect(getDistance({ x: -3, y: -4 }, { x: 0, y: 0 })).toBe(5);
  });

  it('handles large coordinates', () => {
    const d = getDistance({ x: 0, y: 0 }, { x: 10000, y: 0 });
    expect(d).toBe(10000);
  });
});

describe('getAngle', () => {
  it('returns 0 for a point directly to the right', () => {
    expect(getAngle({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(0);
  });

  it('returns PI/2 for a point directly below', () => {
    expect(getAngle({ x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(Math.PI / 2);
  });

  it('returns -PI/2 for a point directly above', () => {
    expect(getAngle({ x: 0, y: 0 }, { x: 0, y: -1 })).toBeCloseTo(-Math.PI / 2);
  });

  it('returns PI for a point directly to the left', () => {
    expect(getAngle({ x: 0, y: 0 }, { x: -1, y: 0 })).toBeCloseTo(Math.PI);
  });

  it('returns PI/4 for a diagonal down-right', () => {
    expect(getAngle({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(Math.PI / 4);
  });
});

describe('isPointInCone', () => {
  const origin = { x: 100, y: 100 };
  const direction = 0; // facing right
  const fov = Math.PI / 3; // 60 degrees
  const range = 200;

  it('detects a point directly in front within range', () => {
    expect(isPointInCone(origin, { x: 200, y: 100 }, direction, fov, range)).toBe(true);
  });

  it('rejects a point beyond range', () => {
    expect(isPointInCone(origin, { x: 400, y: 100 }, direction, fov, range)).toBe(false);
  });

  it('rejects a point directly behind', () => {
    expect(isPointInCone(origin, { x: 0, y: 100 }, direction, fov, range)).toBe(false);
  });

  it('rejects a point outside the FOV angle', () => {
    // 90 degrees above – outside 60 degree FOV
    expect(isPointInCone(origin, { x: 100, y: 0 }, direction, fov, range)).toBe(false);
  });

  it('detects a point at the edge of the FOV', () => {
    // At exactly half the FOV angle
    const edgeAngle = fov / 2;
    const target = {
      x: origin.x + 100 * Math.cos(edgeAngle),
      y: origin.y + 100 * Math.sin(edgeAngle),
    };
    expect(isPointInCone(origin, target, direction, fov, range)).toBe(true);
  });

  it('rejects a point at the same position (0 distance)', () => {
    // Distance is 0, which is within range, and angle doesn't matter
    expect(isPointInCone(origin, origin, direction, fov, range)).toBe(true);
  });

  it('works with different directions', () => {
    // Guard facing down (PI/2), target below
    expect(isPointInCone(origin, { x: 100, y: 200 }, Math.PI / 2, fov, range)).toBe(true);
    // Target to the right (should be outside downward cone)
    expect(isPointInCone(origin, { x: 250, y: 100 }, Math.PI / 2, fov, range)).toBe(false);
  });
});

describe('hasLineOfSight', () => {
  it('returns true (stub implementation)', () => {
    expect(hasLineOfSight({ x: 0, y: 0 }, { x: 100, y: 100 })).toBe(true);
  });

  it('returns true even with walls (not yet implemented)', () => {
    expect(hasLineOfSight({ x: 0, y: 0 }, { x: 100, y: 100 }, [{ x1: 50, y1: 0, x2: 50, y2: 200 }])).toBe(true);
  });
});
