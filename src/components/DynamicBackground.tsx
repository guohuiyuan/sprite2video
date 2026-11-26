import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { BackgroundVariant } from "../types/storyboard";

export interface DynamicBackgroundProps {
  variant: BackgroundVariant;
  /** Primary theme color for Dafeiyu-style vibrant scenes */
  accent?: string;
  secondary?: string;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  variant,
  accent = "#4c1d95",
  secondary = "#1e1b4b",
}) => {
  const frame = useCurrentFrame();

  if (variant === "paper") {
    // Capdim-style warm retro textured graph paper (matching DSH benchmark)
    return (
      <AbsoluteFill
        style={{
          backgroundColor: "#e8e6d8",
          backgroundImage: `
            radial-gradient(rgba(115, 108, 92, 0.14) 1px, transparent 1px),
            linear-gradient(to right, rgba(132, 124, 105, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(132, 124, 105, 0.14) 1px, transparent 1px),
            linear-gradient(to right, rgba(120, 112, 92, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(120, 112, 92, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: "10px 10px, 32px 32px, 32px 32px, 160px 160px, 160px 160px",
        }}
      >
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(circle at 50% 44%, rgba(255,253,245,0.22) 0%, rgba(162,152,126,0.16) 100%)",
          }}
        />
      </AbsoluteFill>
    );
  }

  if (variant === "sunburst") {
    const rot = frame * 0.45;
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, ${accent} 0%, ${secondary} 75%, #090714 100%)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "42%",
            width: 2400,
            height: 2400,
            marginLeft: -1200,
            marginTop: -1200,
            transform: `rotate(${rot}deg)`,
            background:
              "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.11) 0deg 8deg, transparent 8deg 20deg)",
          }}
        />
      </AbsoluteFill>
    );
  }

  if (variant === "grid3d") {
    const shift = (frame * 2.5) % 80;
    return (
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${secondary} 0%, ${accent} 55%, #120905 100%)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            backgroundPosition: `0 ${shift}px`,
            transform: "perspective(520px) rotateX(55deg) translateY(260px) scale(1.6)",
            opacity: 0.6,
          }}
        />
      </AbsoluteFill>
    );
  }

  if (variant === "spectrum") {
    const bars = Array.from({ length: 18 }, (_, i) => {
      const h = 80 + Math.abs(Math.sin(frame * 0.14 + i * 0.65)) * 220;
      return h;
    });
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 35%, ${accent} 0%, ${secondary} 80%)`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 40,
            right: 40,
            top: "42%",
            height: 320,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            opacity: 0.25,
          }}
        >
          {bars.map((h, idx) => (
            <div
              key={idx}
              style={{
                width: 34,
                height: h,
                borderRadius: 10,
                backgroundColor: "#ffffff",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
    );
  }

  // coderain
  const lines = [
    "const sprite = routeEmotion(text);",
    "npx skills add video-sprite-pack",
    "if (hasSprite) renderMagic(frame);",
    "spring({ frame, fps, damping: 12 });",
    "sfx.trigger('pop', { hitFrame });",
    "manifest.match('[叹气] 太离谱了');",
  ];
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 38%, ${accent} 0%, ${secondary} 78%, #041214 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -40,
          fontFamily: "Consolas, monospace",
          fontSize: 24,
          lineHeight: 1.9,
          color: "rgba(180, 255, 220, 0.14)",
          transform: `translateY(${-((frame * 1.4) % 160)}px)`,
          whiteSpace: "pre",
          padding: 40,
        }}
      >
        {Array.from({ length: 24 }, (_, i) => lines[i % lines.length]).join("\n")}
      </div>
    </AbsoluteFill>
  );
};
