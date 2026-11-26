import React from "react";

export interface BilingualSubtitleProps {
  zh: string;
  en?: string;
  styleMode?: "dafeiyu" | "capdim";
  /** Optional [0..1] karaoke sweep progress highlighting spoken Chinese characters in gold */
  highlightProgress?: number;
}

export const BilingualSubtitle: React.FC<BilingualSubtitleProps> = ({
  zh,
  en,
  styleMode = "dafeiyu",
  highlightProgress,
}) => {
  if (styleMode === "capdim") {
    return (
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 78,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "10px 28px",
            borderRadius: 8,
            backgroundColor: "rgba(24, 24, 27, 0.86)",
            color: "#fafafa",
            fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
            fontSize: 34,
            fontWeight: 700,
            lineHeight: 1.35,
            textAlign: "center",
            boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
          }}
        >
          {zh}
        </div>
      </div>
    );
  }

  const splitIdx =
    typeof highlightProgress === "number"
      ? Math.max(0, Math.min(zh.length, Math.ceil(zh.length * highlightProgress)))
      : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        right: 40,
        bottom: 68,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textAlign: "center",
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        zIndex: 55,
      }}
    >
      <div
        style={{
          fontSize: 52,
          fontWeight: 900,
          color: "#ffffff",
          lineHeight: 1.24,
          WebkitTextStroke: "3.5px #0f172a",
          paintOrder: "stroke fill",
          textShadow:
            "0 4px 0 #0f172a, 0 8px 20px rgba(0,0,0,0.72)",
        }}
      >
        {splitIdx > 0 ? (
          <>
            <span style={{ color: "#fde047" }}>{zh.slice(0, splitIdx)}</span>
            <span>{zh.slice(splitIdx)}</span>
          </>
        ) : (
          zh
        )}
      </div>
      {en ? (
        <div
          style={{
            fontSize: 27,
            fontWeight: 800,
            color: "#f8fafc",
            WebkitTextStroke: "2px #0f172a",
            paintOrder: "stroke fill",
            textShadow: "0 3px 10px rgba(0,0,0,0.9)",
          }}
        >
          {en}
        </div>
      ) : null}
    </div>
  );
};
