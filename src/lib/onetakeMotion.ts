/**
 * Continuous motion primitives inspired by feitangyuan/onetake (lib/motion.js).
 * Every helper is a pure function of time (seconds or frames) returning plain
 * numeric values for smooth, carry-driven Remotion animations — zero PPT stiffness.
 */

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const seg = (t: number, t0: number, t1: number): number =>
  t1 <= t0 ? (t >= t0 ? 1 : 0) : clamp((t - t0) / (t1 - t0), 0, 1);

export const sstep = (x: number): number => {
  const c = clamp(x, 0, 1);
  return c * c * (3 - 2 * c);
};

export const ssstep = (x: number): number => {
  const c = clamp(x, 0, 1);
  return c * c * c * (c * (c * 6 - 15) + 10);
};

export const easeOutCubic = (x: number): number => 1 - Math.pow(1 - clamp(x, 0, 1), 3);

export const easeOutBack = (x: number, overshoot = 1.45): number => {
  const c = clamp(x, 0, 1) - 1;
  return 1 + (overshoot + 1) * c * c * c + overshoot * c * c;
};

/** Analytical underdamped spring response from 0 -> 1 starting at t0 (seconds). */
export const springAt = (
  t: number,
  t0: number,
  opts?: { omega?: number; zeta?: number }
): number => {
  const dt = t - t0;
  if (dt <= 0) return 0;
  const omega = opts?.omega ?? 15.5;
  const zeta = opts?.zeta ?? 0.68;
  if (zeta < 1) {
    const wd = omega * Math.sqrt(1 - zeta * zeta);
    const env = Math.exp(-zeta * omega * dt);
    return 1 - env * (Math.cos(wd * dt) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * dt));
  }
  const env = Math.exp(-omega * dt);
  return 1 - env * (1 + omega * dt);
};

/** OneTake wordRise: opacity leads spring rise so typography feels crisp, never floaty-fade. */
export const wordRise = (
  t: number,
  t0: number,
  opts?: { dist?: number; s0?: number; omega?: number; zeta?: number }
) => {
  const dist = opts?.dist ?? 34;
  const s0 = opts?.s0 ?? 0.92;
  const sp = springAt(t, t0, { omega: opts?.omega ?? 17, zeta: opts?.zeta ?? 0.72 });
  const op = easeOutCubic(seg(t, t0, t0 + 0.14));
  return {
    op,
    y: lerp(dist, 0, sp),
    s: lerp(s0, 1, sp),
  };
};

/** OneTake popIn: tactile sticker / card arrival with subtle overshoot. */
export const popIn = (
  t: number,
  t0: number,
  opts?: { rise?: number; s0?: number; rot0?: number }
) => {
  const sp = springAt(t, t0, { omega: 16.5, zeta: 0.64 });
  const op = easeOutCubic(seg(t, t0, t0 + 0.12));
  return {
    op,
    dy: lerp(opts?.rise ?? 42, 0, sp),
    s: lerp(opts?.s0 ?? 0.82, 1, sp),
    rot: lerp(opts?.rot0 ?? -3, 0, sp),
  };
};

/** OneTake maskRise: line rises from behind an overflow:hidden mask. */
export const maskRise = (t: number, t0: number, index: number, stagger = 0.08, dist = 115) => {
  const start = t0 + index * stagger;
  const p = ssstep(seg(t, start, start + 0.42));
  return {
    yPct: lerp(dist, 0, p),
    op: seg(t, start, start + 0.06),
  };
};

/** Press pulse at clickTime (seconds): dips scale to 0.92 then rebounds cleanly. */
export const pressPulse = (t: number, clickT: number): { scale: number; ripple: number; pressed: boolean } => {
  const dt = t - clickT;
  if (dt < 0) return { scale: 1, ripple: 0, pressed: false };
  const down = seg(dt, 0, 0.06);
  const up = seg(dt, 0.06, 0.24);
  const scale = dt < 0.06 ? lerp(1, 0.91, easeOutCubic(down)) : lerp(0.91, 1, easeOutBack(up, 1.2));
  const ripple = seg(dt, 0, 0.42);
  return { scale, ripple, pressed: dt >= 0.03 };
};

export interface CursorWaypoint {
  t: number;
  x: number;
  y: number;
  click?: boolean;
}

/** Smooth cursor path across waypoints with click press feedback. */
export const sampleCursor = (t: number, pts: CursorWaypoint[]) => {
  if (pts.length === 0) return { x: 0, y: 0, op: 0, pressing: 0, clickRipple: 0 };
  const first = pts[0];
  const last = pts[pts.length - 1];
  const op =
    seg(t, first.t - 0.12, first.t + 0.12) *
    (1 - seg(t, last.t + 0.35, last.t + 0.6));

  let x = first.x;
  let y = first.y;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = ssstep(seg(t, a.t, b.t));
      x = lerp(a.x, b.x, p);
      y = lerp(a.y, b.y, p);
      break;
    } else if (t > b.t) {
      x = b.x;
      y = b.y;
    }
  }

  let pressing = 0;
  let clickRipple = 0;
  for (const wp of pts) {
    if (!wp.click) continue;
    const dt = t - wp.t;
    if (dt >= 0 && dt <= 0.42) {
      pressing = Math.max(pressing, dt < 0.1 ? 1 - dt / 0.1 : 0);
      clickRipple = Math.max(clickRipple, dt / 0.42);
    }
  }
  return { x, y, op, pressing, clickRipple };
};

export interface CameraKeyframe {
  t: number;
  x: number;
  y: number;
  zoom: number;
  rot?: number;
}

/** OneTake continuous tracking camera: gently leans, tracks focal points, settles smoothly. */
export const sampleCamera = (t: number, keys: CameraKeyframe[]) => {
  if (keys.length === 0) return { x: 0, y: 0, zoom: 1, rot: 0 };
  if (t <= keys[0].t) {
    return { x: keys[0].x, y: keys[0].y, zoom: keys[0].zoom, rot: keys[0].rot ?? 0 };
  }
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const p = ssstep(seg(t, a.t, b.t));
      return {
        x: lerp(a.x, b.x, p),
        y: lerp(a.y, b.y, p),
        zoom: lerp(a.zoom, b.zoom, p),
        rot: lerp(a.rot ?? 0, b.rot ?? 0, p),
      };
    }
  }
  const last = keys[keys.length - 1];
  return { x: last.x, y: last.y, zoom: last.zoom, rot: last.rot ?? 0 };
};
