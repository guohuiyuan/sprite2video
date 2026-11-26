import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { MotionPreset, SpritePlacement } from "../types/storyboard";

export interface CharacterSpriteProps {
  /** Path relative to public/, e.g. "characters/demo-chibi/sprites/wave_happy.png" */
  src: string;
  motion?: MotionPreset;
  placement?: SpritePlacement;
  /** Override width in px */
  size?: number;
  /** Flip horizontally (useful when character points right/left) */
  flipX?: boolean;
  /** Extra vertical offset in px */
  offsetY?: number;
  /** Extra horizontal offset in px */
  offsetX?: number;
  /** Capdim-style crisp white die-cut sticker outline */
  dieCut?: boolean;
}

export const CharacterSprite: React.FC<CharacterSpriteProps> = ({
  src,
  motion = "pop_in",
  placement = "bottom",
  size,
  flipX = false,
  offsetY = 0,
  offsetX = 0,
  dieCut = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 190, mass: 0.7 },
  });

  // Motion choreography layered on top of entrance spring
  let tx = 0;
  let ty = interpolate(enter, [0, 1], [65, 0]);
  let rot = 0;
  let scale = interpolate(enter, [0, 1], [0.78, 1]);

  if (motion === "float_idle") {
    ty += Math.sin(frame * 0.11) * 7;
    scale *= 1 + Math.sin(frame * 0.08) * 0.014;
  } else if (motion === "bounce_happy") {
    ty += -Math.abs(Math.sin(frame * 0.18)) * 16;
    rot = Math.sin(frame * 0.18) * 2.8;
  } else if (motion === "shake_angry") {
    const decay = Math.max(0.25, Math.exp(-frame / 28));
    tx = Math.sin(frame * 1.45) * 11 * decay;
    rot = Math.sin(frame * 1.45) * 2.4 * decay;
    scale *= 1 + 0.04 * decay;
  } else if (motion === "nod") {
    ty += Math.sin(frame * 0.14) * 9;
    rot = Math.sin(frame * 0.14) * 1.6;
  } else {
    // pop_in + subtle breathing
    ty += Math.sin(frame * 0.1) * 4;
  }

  const defaultSizes: Record<SpritePlacement, number> = {
    bottom: 620,
    corner: 370,
    right: 600,
    left: 600,
    center: 660,
  };
  const finalSize = size ?? defaultSizes[placement];

  const posStyle: React.CSSProperties =
    placement === "bottom"
      ? {
          position: "absolute",
          left: "50%",
          bottom: 120 + offsetY,
          marginLeft: -finalSize / 2 + offsetX,
        }
      : placement === "corner"
        ? {
            position: "absolute",
            right: 36 - offsetX,
            bottom: 132 + offsetY,
          }
        : placement === "right"
          ? {
              position: "absolute",
              right: 84 - offsetX,
              bottom: 134 + offsetY,
            }
          : placement === "left"
            ? {
                position: "absolute",
                left: 84 + offsetX,
                bottom: 134 + offsetY,
              }
            : {
                position: "absolute",
                left: "50%",
                bottom: 138 + offsetY,
                marginLeft: -finalSize / 2 + offsetX,
              };

  const dieCutFilter = dieCut
    ? "drop-shadow(3px 0 0 #ffffff) drop-shadow(-3px 0 0 #ffffff) drop-shadow(0 3px 0 #ffffff) drop-shadow(0 -3px 0 #ffffff) drop-shadow(2px 2px 0 #ffffff) drop-shadow(-2px -2px 0 #ffffff) drop-shadow(0 12px 20px rgba(38, 32, 24, 0.22))"
    : "drop-shadow(0 12px 24px rgba(0, 0, 0, 0.28))";

  return (
    <div
      style={{
        ...posStyle,
        width: finalSize,
        height: finalSize,
        pointerEvents: "none",
        transformOrigin: "50% 100%",
        transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${flipX ? -scale : scale}, ${scale})`,
        filter: dieCutFilter,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  );
};
