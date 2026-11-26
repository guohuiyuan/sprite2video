import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  type CameraKeyframe,
  type CursorWaypoint,
  popIn,
  sampleCamera,
  sampleCursor,
} from "../lib/onetakeMotion";

/**
 * OneTake-inspired continuous camera container.
 * Subtly pans, zooms, and leans across keyframed focal beats so the canvas feels alive.
 */
export const CameraRig: React.FC<{
  keyframes: CameraKeyframe[];
  children: React.ReactNode;
}> = ({ keyframes, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = sampleCamera(t, keyframes);
  // Subtle organic breathing drift so frame is never dead-static
  const driftX = Math.sin(t * 0.7) * 3;
  const driftY = Math.cos(t * 0.55) * 2.5;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transformOrigin: "50% 48%",
        transform: `translate(${-cam.x + driftX}px, ${-cam.y + driftY}px) scale(${cam.zoom}) rotate(${cam.rot}deg)`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
};

/**
 * Capdim-style die-cut paper sticker card with white outer border & crisp ink border.
 */
export const DieCutCard: React.FC<{
  delaySec?: number;
  rotate?: number;
  width?: number | string;
  bg?: string;
  borderColor?: string;
  padding?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  delaySec = 0.08,
  rotate = 0,
  width,
  bg = "#fffdf8",
  borderColor = "#24211d",
  padding = "32px 38px",
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = popIn(frame / fps, delaySec, { rise: 32, s0: 0.9, rot0: rotate - 2.5 });

  return (
    <div
      style={{
        width,
        opacity: m.op,
        transform: `translateY(${m.dy}px) scale(${m.s}) rotate(${rotate + m.rot * 0.4}deg)`,
        backgroundColor: bg,
        border: `3px solid ${borderColor}`,
        borderRadius: 20,
        padding,
        boxShadow:
          "0 0 0 7px rgba(255,255,255,0.92), 0 14px 30px rgba(40, 34, 24, 0.18)",
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Animated macOS/editorial pointer cursor with click ripple — pairs with `click` SFX cues!
 */
export const AnimatedCursor: React.FC<{
  waypoints: CursorWaypoint[];
}> = ({ waypoints }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cur = sampleCursor(frame / fps, waypoints);
  if (cur.op <= 0.01) return null;

  const scale = 1 - cur.pressing * 0.18;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 60,
        opacity: cur.op,
        transform: `translate(${cur.x}px, ${cur.y}px)`,
      }}
    >
      {cur.clickRipple > 0 && cur.clickRipple < 1 ? (
        <div
          style={{
            position: "absolute",
            left: -26,
            top: -26,
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "4px solid #dc2626",
            opacity: 1 - cur.clickRipple,
            transform: `scale(${0.35 + cur.clickRipple * 1.45})`,
          }}
        />
      ) : null}
      <svg
        width={42}
        height={42}
        viewBox="0 0 36 36"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "4px 4px",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.28))",
        }}
      >
        <path
          d="M5 3 L5 28 L12 21 L17 31 L21 29 L16 19 L26 19 Z"
          fill="#18181b"
          stroke="#ffffff"
          strokeWidth={2.8}
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
