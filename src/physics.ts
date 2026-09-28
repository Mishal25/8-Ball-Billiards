import { Ball, Pocket, AIDifficulty, BallGroup } from './types';
import { audio } from './audio';

export const TABLE = {
  x: 44,
  y: 44,
  w: 812,
  h: 362,
  cushionWidth: 24,
  pocketRadius: 21,
  cornerPocketRadius: 23,
  ballRadius: 11.5,
  friction: 0.988,
  stopVelocity: 0.04,
  cushionRestitution: 0.82,
  ballRestitution: 0.94,
};

export const BALL_COLORS: Record<number, string> = {
  1: '#FFC72C', // Yellow Solid
  2: '#0055D4', // Blue Solid
  3: '#DC2626', // Red Solid
  4: '#7C3AED', // Purple Solid
  5: '#EA580C', // Orange Solid
  6: '#16A34A', // Green Solid
  7: '#78350F', // Maroon Solid
  8: '#0A0A0A', // 8-Ball Black
  9: '#FFC72C', // Yellow Stripe
  10: '#0055D4', // Blue Stripe
  11: '#DC2626', // Red Stripe
  12: '#7C3AED', // Purple Stripe
  13: '#EA580C', // Orange Stripe
  14: '#16A34A', // Green Stripe
  15: '#78350F', // Maroon Stripe
};

export function getTablePockets(): Pocket[] {
  const { x, y, w, h, pocketRadius, cornerPocketRadius } = TABLE;
  return [
    { x: x + 6, y: y + 6, r: cornerPocketRadius, name: 'top-left' },
    { x: x + w / 2, y: y + 2, r: pocketRadius, name: 'top-middle' },
    { x: x + w - 6, y: y + 6, r: cornerPocketRadius, name: 'top-right' },
    { x: x + 6, y: y + h - 6, r: cornerPocketRadius, name: 'bottom-left' },
    { x: x + w / 2, y: y + h - 2, r: pocketRadius, name: 'bottom-middle' },
    { x: x + w - 6, y: y + h - 6, r: cornerPocketRadius, name: 'bottom-right' },
  ];
}

export function createStandardRack(): Ball[] {
  const balls: Ball[] = [];
  const { x, y, w, h, ballRadius } = TABLE;

  // 1. Cue Ball placed at Head String (left quarter of table)
  balls.push({
    id: 0,
    num: 0,
    x: x + w * 0.25,
    y: y + h * 0.5,
    vx: 0,
    vy: 0,
    radius: ballRadius,
    isCue: true,
    isStriped: false,
    isEight: false,
    color: '#FAFAFA',
    inPocket: false,
  });

  // 2. Triangle Rack setup at Foot Spot (right side)
  const apexX = x + w * 0.72;
  const apexY = y + h * 0.5;
  const r = ballRadius;
  const spacing = r * 2.05; // slight separation

  // Standard official 8-ball rack configuration:
  // Row 1: 1 ball
  // Row 2: 2 balls (stripe, solid)
  // Row 3: 3 balls (solid, 8-BALL in center, stripe)
  // Row 4: 4 balls (mixed)
  // Row 5: 5 balls (corners alternate: solid on one side, stripe on the other)
  const rackLayout: number[][] = [
    [1],
    [9, 2],
    [3, 8, 10],
    [11, 4, 12, 5],
    [6, 13, 7, 14, 15],
  ];

  rackLayout.forEach((row, rowIdx) => {
    const rowX = apexX + rowIdx * (spacing * Math.cos(Math.PI / 6));
    const startY = apexY - (row.length - 1) * (spacing * 0.5);

    row.forEach((ballNum, colIdx) => {
      const ballY = startY + colIdx * spacing;
      const isStriped = ballNum >= 9 && ballNum <= 15;
      balls.push({
        id: ballNum,
        num: ballNum,
        x: rowX,
        y: ballY,
        vx: 0,
        vy: 0,
        radius: ballRadius,
        isCue: false,
        isStriped: isStriped,
        isEight: ballNum === 8,
        color: BALL_COLORS[ballNum] || '#FFFFFF',
        inPocket: false,
      });
    });
  });

  return balls;
}

export interface PhysicsStepResult {
  anyMoving: boolean;
  pocketedBalls: Ball[];
  firstBallHit: Ball | null;
}

export function updatePhysics(
  balls: Ball[],
  pockets: Pocket[],
  substeps: number = 4,
  recordedFirstHit: Ball | null = null,
  vibration: boolean = true
): { anyMoving: boolean; newPocketed: Ball[]; firstHit: Ball | null } {
  let anyMoving = false;
  const newPocketed: Ball[] = [];
  let firstHit = recordedFirstHit;

  const minX = TABLE.x + TABLE.cushionWidth;
  const maxX = TABLE.x + TABLE.w - TABLE.cushionWidth;
  const minY = TABLE.y + TABLE.cushionWidth;
  const maxY = TABLE.y + TABLE.h - TABLE.cushionWidth;

  const cueBall = balls.find((b) => b.isCue);

  for (let step = 0; step < substeps; step++) {
    // 1. Move & apply friction
    for (const b of balls) {
      if (b.inPocket) continue;

      b.x += b.vx / substeps;
      b.y += b.vy / substeps;

      b.vx *= Math.pow(TABLE.friction, 1 / substeps);
      b.vy *= Math.pow(TABLE.friction, 1 / substeps);

      if (Math.hypot(b.vx, b.vy) < TABLE.stopVelocity) {
        b.vx = 0;
        b.vy = 0;
      } else {
        anyMoving = true;
      }

      // Pocket entry check
      for (const p of pockets) {
        const dist = Math.hypot(b.x - p.x, b.y - p.y);
        if (dist < p.r) {
          b.inPocket = true;
          b.vx = 0;
          b.vy = 0;
          newPocketed.push(b);
          audio.playPocket(vibration);
          break;
        }
      }
      if (b.inPocket) continue;

      // Cushions reflection
      if (b.x - b.radius < minX) {
        b.x = minX + b.radius;
        b.vx = -b.vx * TABLE.cushionRestitution;
        audio.playCushionBounce(Math.abs(b.vx));
      } else if (b.x + b.radius > maxX) {
        b.x = maxX - b.radius;
        b.vx = -b.vx * TABLE.cushionRestitution;
        audio.playCushionBounce(Math.abs(b.vx));
      }

      if (b.y - b.radius < minY) {
        b.y = minY + b.radius;
        b.vy = -b.vy * TABLE.cushionRestitution;
        audio.playCushionBounce(Math.abs(b.vy));
      } else if (b.y + b.radius > maxY) {
        b.y = maxY - b.radius;
        b.vy = -b.vy * TABLE.cushionRestitution;
        audio.playCushionBounce(Math.abs(b.vy));
      }
    }

    // 2. Ball-to-Ball Collisions
    for (let i = 0; i < balls.length; i++) {
      const b1 = balls[i];
      if (b1.inPocket) continue;

      for (let j = i + 1; j < balls.length; j++) {
        const b2 = balls[j];
        if (b2.inPocket) continue;

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist && dist > 0) {
          // Record first contact of cue ball
          if (cueBall && !firstHit) {
            if (b1 === cueBall) firstHit = b2;
            else if (b2 === cueBall) firstHit = b1;
          }

          const nx = dx / dist;
          const ny = dy / dist;

          // Push apart to prevent overlap
          const overlap = (minDist - dist) * 0.5;
          b1.x -= nx * overlap;
          b1.y -= ny * overlap;
          b2.x += nx * overlap;
          b2.y += ny * overlap;

          // Velocity along normal
          const kx = b1.vx - b2.vx;
          const ky = b1.vy - b2.vy;
          const p = nx * kx + ny * ky; // equal mass

          b1.vx -= p * nx * TABLE.ballRestitution;
          b1.vy -= p * ny * TABLE.ballRestitution;
          b2.vx += p * nx * TABLE.ballRestitution;
          b2.vy += p * ny * TABLE.ballRestitution;

          const speed = Math.hypot(kx, ky);
          if (speed > 0.4) {
            audio.playBallCollision(speed);
          }
        }
      }
    }
  }

  return { anyMoving, newPocketed, firstHit };
}

export interface AimRaycastResult {
  endX: number;
  endY: number;
  hitBall: Ball | null;
  targetDeflectionAngle: number | null;
  cueDeflectionAngle: number | null;
}

export function computeAimTrajectory(
  cueBall: Ball,
  aimAngle: number,
  balls: Ball[]
): AimRaycastResult {
  const maxDist = 750;
  const cos = Math.cos(aimAngle);
  const sin = Math.sin(aimAngle);

  let closestDist = maxDist;
  let hitBall: Ball | null = null;

  for (const b of balls) {
    if (b.inPocket || b.isCue) continue;

    const dx = b.x - cueBall.x;
    const dy = b.y - cueBall.y;
    const projection = dx * cos + dy * sin;

    if (projection > 0) {
      const perpDistSq = dx * dx + dy * dy - projection * projection;
      const radiusSum = cueBall.radius + b.radius;
      if (perpDistSq < radiusSum * radiusSum) {
        const d = projection - Math.sqrt(radiusSum * radiusSum - perpDistSq);
        if (d > 0 && d < closestDist) {
          closestDist = d;
          hitBall = b;
        }
      }
    }
  }

  const endX = cueBall.x + cos * closestDist;
  const endY = cueBall.y + sin * closestDist;

  let targetDeflectionAngle: number | null = null;
  let cueDeflectionAngle: number | null = null;

  if (hitBall) {
    // Normal vector from ghost ball to target ball
    const normalX = hitBall.x - endX;
    const normalY = hitBall.y - endY;
    const normDist = Math.hypot(normalX, normalY);
    if (normDist > 0) {
      targetDeflectionAngle = Math.atan2(normalY, normalX);
      // Tangent vector for cue ball deflection
      const dot = cos * (normalX / normDist) + sin * (normalY / normDist);
      const cueReflectX = cos - dot * (normalX / normDist);
      const cueReflectY = sin - dot * (normalY / normDist);
      cueDeflectionAngle = Math.atan2(cueReflectY, cueReflectX);
    }
  }

  return {
    endX,
    endY,
    hitBall,
    targetDeflectionAngle,
    cueDeflectionAngle,
  };
}

export interface AIShotPlan {
  aimAngle: number;
  power: number;
  targetBall: Ball;
  score: number;
}

export function calculateAIShot(
  cueBall: Ball,
  balls: Ball[],
  aiGroup: BallGroup | null,
  aiRemaining: number,
  openTable: boolean,
  difficulty: AIDifficulty
): AIShotPlan | null {
  const availableBalls = balls.filter((b) => {
    if (b.inPocket || b.isCue) return false;
    if (openTable || !aiGroup) return !b.isEight;
    if (aiRemaining === 0) return b.isEight;
    return aiGroup === 'solids' ? !b.isStriped && !b.isEight : b.isStriped;
  });

  const targets = availableBalls.length > 0 ? availableBalls : balls.filter((b) => !b.inPocket && !b.isCue);
  if (targets.length === 0) return null;

  const pockets = getTablePockets();
  let bestPlan: AIShotPlan | null = null;
  let highestScore = -999999;

  for (const ball of targets) {
    for (const pocket of pockets) {
      // Vector from ball to pocket
      const bpX = pocket.x - ball.x;
      const bpY = pocket.y - ball.y;
      const bpDist = Math.hypot(bpX, bpY);
      if (bpDist === 0) continue;

      const normBpX = bpX / bpDist;
      const normBpY = bpY / bpDist;

      // Ghost ball position directly behind target ball along pocket line
      const ghostX = ball.x - normBpX * (ball.radius * 2);
      const ghostY = ball.y - normBpY * (ball.radius * 2);

      // Cue ball to ghost ball vector
      const cueX = ghostX - cueBall.x;
      const cueY = ghostY - cueBall.y;
      const cueDist = Math.hypot(cueX, cueY);
      if (cueDist === 0) continue;

      const normCueX = cueX / cueDist;
      const normCueY = cueY / cueDist;

      // Cut angle dot product: 1 means straight shot, < 0 means impossible back-cut
      const dot = normCueX * normBpX + normCueY * normBpY;
      if (dot <= 0.1) continue; // Skip extreme impossible back cuts

      // Check obstacle balls between cue and ghost
      let pathBlocked = false;
      for (const obstacle of balls) {
        if (obstacle.inPocket || obstacle.isCue || obstacle === ball) continue;
        const odx = obstacle.x - cueBall.x;
        const ody = obstacle.y - cueBall.y;
        const proj = odx * normCueX + ody * normCueY;
        if (proj > 0 && proj < cueDist - ball.radius) {
          const perpSq = odx * odx + ody * ody - proj * proj;
          if (perpSq < (ball.radius * 2) ** 2) {
            pathBlocked = true;
            break;
          }
        }
      }

      if (pathBlocked) continue;

      // Score formula: prefer straight cuts, shorter pocket distances, shorter cue distance
      const score = dot * 120 - bpDist * 0.12 - cueDist * 0.08;

      if (score > highestScore) {
        highestScore = score;
        const baseAngle = Math.atan2(ghostY - cueBall.y, ghostX - cueBall.x);
        bestPlan = {
          aimAngle: baseAngle,
          power: Math.min(85, Math.max(35, Math.round(30 + (cueDist + bpDist) * 0.08))),
          targetBall: ball,
          score,
        };
      }
    }
  }

  // Fallback if no clean cut was found: aim directly at closest ball
  if (!bestPlan) {
    const closest = targets[0];
    const dx = closest.x - cueBall.x;
    const dy = closest.y - cueBall.y;
    bestPlan = {
      aimAngle: Math.atan2(dy, dx),
      power: 50,
      targetBall: closest,
      score: 0,
    };
  }

  // Modulate error noise according to AI difficulty level
  let noise = 0;
  if (difficulty === 'easy') {
    noise = (Math.random() - 0.5) * 0.16; // ~9 degrees variance
    bestPlan.power = Math.max(25, Math.min(65, bestPlan.power + (Math.random() - 0.5) * 20));
  } else if (difficulty === 'medium') {
    noise = (Math.random() - 0.5) * 0.045; // ~2.5 degrees variance
    bestPlan.power = Math.max(35, Math.min(80, bestPlan.power + (Math.random() - 0.5) * 10));
  } else {
    // Hard: pin-point accuracy, minimal human variance
    noise = (Math.random() - 0.5) * 0.012; // <0.7 degrees
  }

  bestPlan.aimAngle += noise;
  return bestPlan;
}
