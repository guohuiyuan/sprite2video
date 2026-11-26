import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface TopProgressBarProps {
  totalSegments: number;
  currentSegment: number; // 1-based
  badgeText: string;
  title: string;
  titleBg?: string;
  /** Optional subtle top-left series watermark */
  watermark?: string;
}

/** Dafeiyu-style 9:16 segmented progress bar + NO.xx pill + skewed bold outlined title (matching ref video 1) */
export const TopProgressBar: React.FC<TopProgressBarProps> = ({
  totalSegments,
  currentSegment,
  badgeText,
  title,
  titleBg = "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
  watermark,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, stiffness: 220 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 52,
        left: 48,
        right: 48,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        zIndex: 40,
      }}
    >
      {watermark ? (
        <div
          style={{
            alignSelf: "flex-start",
            fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
            fontSize: 28,
            fontWeight: 900,
            color: "rgba(255,255,255,0.82)",
            letterSpacing: 1,
            textShadow: "0 2px 10px rgba(0,0,0,0.45)",
            marginBottom: -8,
          }}
        >
          {watermark}
        </div>
      ) : null}

      {/* Full-width segmented progress indicator */}
      <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center" }}>
        {Array.from({ length: totalSegments }, (_, i) => {
          const active = i + 1 === currentSegment;
          const passed = i + 1 < currentSegment;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 11,
                borderRadius: 99,
                backgroundColor: active
                  ? "#ffffff"
                  : passed
                    ? "rgba(255,255,255,0.88)"
                    : "rgba(255,255,255,0.28)",
                boxShadow: active ? "0 0 14px rgba(255,255,255,0.85)" : "none",
              }}
            />
          );
        })}
      </div>

      {/* NO.xx capsule (matching ref video 1 mint-cyan badge + dark pill) */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "8px 26px 8px 12px",
          borderRadius: 999,
          backgroundColor: "rgba(10, 18, 32, 0.78)",
          border: "2.5px solid rgba(255,255,255,0.36)",
          color: "#ffffff",
          fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
          fontSize: 30,
          fontWeight: 800,
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        <span
          style={{
            padding: "4px 18px",
            borderRadius: 999,
            backgroundColor: "#a7f3d0",
            color: "#0b1324",
            fontWeight: 900,
            fontSize: 28,
          }}
        >
          NO.{String(currentSegment).padStart(2, "0")}
        </span>
        <span>{badgeText}</span>
      </div>

      {/* Skewed parallelogram bold outlined title banner */}
      <div
        style={{
          transform: `scale(${interpolate(pop, [0, 1], [0.8, 1])}) skewX(-6deg)`,
          padding: "16px 56px",
          borderRadius: 22,
          background: titleBg,
          border: "5px solid #ffffff",
          boxShadow: "0 14px 32px rgba(0,0,0,0.42)",
        }}
      >
        <div
          style={{
            transform: "skewX(6deg)",
            color: "#ffffff",
            fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
            fontSize: 82,
            fontWeight: 900,
            letterSpacing: 3,
            WebkitTextStroke: "4px #0f172a",
            paintOrder: "stroke fill",
            textShadow: "0 6px 0 #0f172a",
          }}
        >
          {title}
        </div>
      </div>
    </div>
  );
};

export interface BottomChapterBarProps {
  chapters: string[];
  activeIndex: number; // 0-based
  /** Show Capdim-style cute animated badge riding the active chapter tab */
  showMascotBadge?: boolean;
}

/** Capdim-style 16:9 full-width bottom chapter navigation bar with animated badge */
export const BottomChapterBar: React.FC<BottomChapterBarProps> = ({
  chapters,
  activeIndex,
  showMascotBadge = true,
}) => {
  const frame = useCurrentFrame();
  const rock = Math.sin(frame * 0.11) * 10;
  const bob = Math.abs(Math.sin(frame * 0.09)) * -4;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 58,
        display: "flex",
        borderTop: "2px solid rgba(55, 50, 40, 0.28)",
        backgroundColor: "#f2efe4",
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        zIndex: 50,
      }}
    >
      {chapters.map((label, idx) => {
        const active = idx === activeIndex;
        return (
          <div
            key={label}
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 21,
              fontWeight: active ? 800 : 600,
              backgroundColor: active ? "#151517" : "transparent",
              color: active ? "#ffffff" : "#4b463d",
              borderRight:
                idx < chapters.length - 1
                  ? "1px solid rgba(60, 52, 42, 0.16)"
                  : "none",
            }}
          >
            {active && showMascotBadge ? (
              <svg
                width={44}
                height={44}
                viewBox="0 0 48 48"
                style={{
                  position: "absolute",
                  right: 12,
                  top: -22,
                  transform: `translateY(${bob}px) rotate(${rock}deg)`,
                  filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.22))",
                }}
              >
                {/* Capdim-inspired cute daisy/flower with Evil Neuro crimson core */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="24"
                    cy="11"
                    rx="5"
                    ry="9.5"
                    fill="#fffaf0"
                    stroke="#1c1917"
                    strokeWidth="2.2"
                    transform={`rotate(${deg} 24 24)`}
                  />
                ))}
                <circle cx="24" cy="24" r="8.5" fill="#dc2626" stroke="#1c1917" strokeWidth="2.4" />
                <path d="M22 19 L25 23 L22.5 25 L26 29" fill="none" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : null}
            {label}
          </div>
        );
      })}
    </div>
  );
};
