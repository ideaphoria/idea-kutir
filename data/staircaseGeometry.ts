// data/staircaseGeometry.ts

export const STAIRCASE_CONFIG = {
  // Center of spiral in world coordinates
  centerX: 0.0,
  centerZ: -21.2,

  // Spindle & Tread Dimensions
  spindleRadius: 0.22,
  spindleCollisionRadius: 0.38,
  outerRadius: 1.55,
  walkingRadius: 0.95,
  walkMinRadius: 0.40,
  walkMaxRadius: 1.50,

  // Heights & Steps
  numPlayableSteps: 21,
  numContinuationSteps: 63,
  totalSteps: 84, // 21 playable + 63 continuation
  stepRise: 0.20, // 21 * 0.20 = 4.20m to mezzanine
  mezzanineFloorY: 4.20,
  continuationMaxY: 16.80, // 84 * 0.20 = 16.80m

  // Angular progression
  // Counterclockwise: angle decreases as step index increases
  startAngle: Math.PI / 2, // Facing South towards approaching visitor
  stepAngle: (2 * Math.PI * 1.05) / 21, // ~0.314 rad (~18.0 deg) per step

  // Mezzanine Landing boundaries at Y = 4.20m
  landing: {
    minX: -2.4,
    maxX: 2.4,
    minZ: -22.8,
    maxZ: -20.2,
    floorY: 4.20,
    eyeY: 5.90, // 4.20 + 1.70m
  },

  // Shaft Dimensions
  shaft: {
    minX: -2.8,
    maxX: 2.8,
    minZ: -23.0,
    maxZ: -19.5,
    ceilingY: 18.0,
  },
} as const;

export interface TreadGeometryData {
  index: number;
  x: number;
  y: number;
  z: number;
  theta: number;
  rotationY: number;
  isPlayable: boolean;
  colorMultiplier: number;
}

/**
 * Returns world position, rotation, and metadata for any step index [0..83].
 */
export function getTreadData(stepIndex: number): TreadGeometryData {
  const theta = STAIRCASE_CONFIG.startAngle - stepIndex * STAIRCASE_CONFIG.stepAngle;
  const x = STAIRCASE_CONFIG.centerX - STAIRCASE_CONFIG.walkingRadius * Math.cos(theta);
  const z = STAIRCASE_CONFIG.centerZ + STAIRCASE_CONFIG.walkingRadius * Math.sin(theta);
  const y = (stepIndex + 1) * STAIRCASE_CONFIG.stepRise;
  const isPlayable = stepIndex < STAIRCASE_CONFIG.numPlayableSteps;

  // Progressive darkening for continuation steps into vertical shadow
  let colorMultiplier = 1.0;
  if (!isPlayable) {
    const continuationProgress =
      (stepIndex - STAIRCASE_CONFIG.numPlayableSteps) / STAIRCASE_CONFIG.numContinuationSteps;
    colorMultiplier = Math.max(0.12, 1.0 - continuationProgress * 0.88);
  }

  return {
    index: stepIndex,
    x,
    y,
    z,
    theta,
    rotationY: -theta + Math.PI / 2,
    isPlayable,
    colorMultiplier,
  };
}

/**
 * Resolves player elevation when ascending or descending the spiral staircase.
 * Uses exact polar coordinates (r, theta) relative to spindle center.
 *
 * Prevents:
 * 1. Cutting through central spindle (blocked if r < spindleCollisionRadius)
 * 2. Walking off outer edge (blocked if r > outerRadius)
 * 3. Skipping across steps or jumping vertical levels
 *
 * Returns step floor elevation in meters, or null if position is not on a valid tread.
 */
export function getSpiralFloorElevation(
  x: number,
  z: number,
  currentFloorY: number
): number | null {
  const dx = x - STAIRCASE_CONFIG.centerX;
  const dz = z - STAIRCASE_CONFIG.centerZ;
  const r = Math.hypot(dx, dz);

  // Check radial boundary
  if (r < STAIRCASE_CONFIG.spindleCollisionRadius || r > STAIRCASE_CONFIG.outerRadius) {
    return null;
  }

  // Polar angle relative to staircase orientation
  const rawAngle = Math.atan2(dz, -dx); // [-PI, PI]

  // Estimate candidate step from current floor height
  const estStep = Math.max(
    0,
    Math.min(
      STAIRCASE_CONFIG.numPlayableSteps - 1,
      Math.round(currentFloorY / STAIRCASE_CONFIG.stepRise)
    )
  );

  let bestStep = -1;
  let minAngleDiff = Infinity;

  // Check candidate steps within adjacent step window (+/- 2 steps)
  const minSearch = Math.max(0, estStep - 2);
  const maxSearch = Math.min(STAIRCASE_CONFIG.numPlayableSteps - 1, estStep + 2);

  for (let s = minSearch; s <= maxSearch; s++) {
    const targetTheta = STAIRCASE_CONFIG.startAngle - s * STAIRCASE_CONFIG.stepAngle;
    let diff = ((rawAngle - targetTheta) % (2 * Math.PI));
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    const tolerance = STAIRCASE_CONFIG.stepAngle * 0.70;
    if (Math.abs(diff) < tolerance && Math.abs(diff) < minAngleDiff) {
      minAngleDiff = Math.abs(diff);
      bestStep = s;
    }
  }

  if (bestStep >= 0) {
    return (bestStep + 1) * STAIRCASE_CONFIG.stepRise;
  }

  return null;
}

/**
 * Checks if a given coordinate (x, z) is walkable on the staircase or landing.
 */
export function isSpiralWalkable(
  x: number,
  z: number,
  currentFloorY: number
): boolean {
  // 1. Landing at Y = 4.2m
  if (currentFloorY >= 3.8) {
    const l = STAIRCASE_CONFIG.landing;
    const margin = 0.25;
    if (
      x >= l.minX + margin &&
      x <= l.maxX - margin &&
      z >= l.minZ + margin &&
      z <= l.maxZ - margin
    ) {
      // Exclude hole where upper spindle continues if within spindle collision radius
      const dx = x - STAIRCASE_CONFIG.centerX;
      const dz = z - STAIRCASE_CONFIG.centerZ;
      if (Math.hypot(dx, dz) < STAIRCASE_CONFIG.spindleCollisionRadius) {
        return false;
      }
      return true;
    }
  }

  // 2. Treads
  const elevation = getSpiralFloorElevation(x, z, currentFloorY);
  return elevation !== null;
}
