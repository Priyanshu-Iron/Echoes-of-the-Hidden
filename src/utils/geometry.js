export const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const getAngle = (p1, p2) => {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

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

// Simple raycast mock - implies no walls for MVP, or we add wall checking later
export const hasLineOfSight = (origin, target, walls = []) => {
    // TODO: Implement actual raycasting against walls
    return true; 
};
