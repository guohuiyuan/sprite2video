import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const CountUpCard: React.FC<{
  target: number;
  suffix?: string;
  label: string;
  delay?: number;
  accent?: string;
}> = ({ target, suffix = "", label, delay = 6, accent = "#f59e0b" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: Math.max(0, frame - delay), fps, config: { damping: 14, stiffness: 180 } });
  const val = Math.round(
    interpolate(frame, [delay, delay + 28], [0, target], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        transform: `scale(${interpolate(enter, [0, 1], [0.86, 1])})`,
        opacity: enter,
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: "22px 36px",
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        gap: 14,
        boxShadow: "0 12px 30px rgba(0,0,0,0.22)",
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      }}
    >
      <span style={{ fontSize: 64, fontWeight: 900, color: accent }}>
        {val.toLocaleString()}
        {suffix}
      </span>
      <span style={{ fontSize: 34, fontWeight: 800, color: "#1e293b" }}>{label}</span>
    </div>
  );
};

export const CompareBar: React.FC<{
  label: string;
  value: number;
  max: number;
  displayValue: string;
  color: string;
  delay?: number;
}> = ({ label, value, max, displayValue, color, delay = 10 }) => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [delay, delay + 26], [0, Math.min(1, value / max)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        width: "100%",
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      }}
    >
      <div style={{ width: 120, textAlign: "right", fontSize: 32, fontWeight: 800, color: "#ffffff" }}>
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 44,
          borderRadius: 99,
          backgroundColor: "rgba(255,255,255,0.18)",
          border: "2px solid rgba(255,255,255,0.45)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            borderRadius: 99,
            background: color,
          }}
        />
      </div>
      <div style={{ width: 110, fontSize: 32, fontWeight: 900, color: "#fde047" }}>
        {displayValue}
      </div>
    </div>
  );
};

export const StampBadge: React.FC<{
  text: string;
  delay?: number;
  color?: string;
  rotate?: number;
}> = ({ text, delay = 22, color = "#ef4444", rotate = -11 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < delay) return null;
  const slam = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 260, mass: 0.6 },
  });
  const scale = interpolate(slam, [0, 1], [2.4, 1]);

  return (
    <div
      style={{
        display: "inline-block",
        padding: "10px 28px",
        borderRadius: 16,
        border: `6px solid ${color}`,
        backgroundColor: "rgba(255,255,255,0.94)",
        color,
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        fontSize: 46,
        fontWeight: 900,
        transform: `rotate(${rotate}deg) scale(${scale})`,
        boxShadow: "0 10px 24px rgba(0,0,0,0.3)",
      }}
    >
      {text}
    </div>
  );
};

export const TerminalBox: React.FC<{
  command: string;
  resultLine?: string;
  startFrame?: number;
}> = ({ command, resultLine = "✓ done", startFrame = 8 }) => {
  const frame = useCurrentFrame();
  const typedCount = Math.floor(
    interpolate(frame, [startFrame, startFrame + 42], [0, command.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const showResult = frame >= startFrame + 48;

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 22,
        backgroundColor: "#0f172a",
        border: "3px solid rgba(148, 163, 184, 0.45)",
        boxShadow: "0 18px 42px rgba(0,0,0,0.45)",
        overflow: "hidden",
        fontFamily: "Consolas, 'Cascadia Code', monospace",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "14px 20px",
          backgroundColor: "#1e293b",
        }}
      >
        <div style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: "#f87171" }} />
        <div style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: "#fbbf24" }} />
        <div style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: "#34d399" }} />
      </div>
      <div style={{ padding: "26px 30px", fontSize: 32, lineHeight: 1.55, color: "#f8fafc" }}>
        <div>
          <span style={{ color: "#34d399", fontWeight: 700 }}>$ </span>
          <span>{command.slice(0, typedCount)}</span>
          {typedCount < command.length ? (
            <span style={{ color: "#38bdf8" }}>▌</span>
          ) : null}
        </div>
        {showResult ? (
          <div style={{ marginTop: 12, color: "#4ade80", fontWeight: 700 }}>{resultLine}</div>
        ) : null}
      </div>
    </div>
  );
};
