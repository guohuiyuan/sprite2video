import React from "react";

export interface BilingualSubtitleProps {
  zh: string;
  en?: string;
  styleMode?: "dafeiyu" | "capdim";
}

export const BilingualSubtitle: React.FC<BilingualSubtitleProps> = ({
  zh,
  en,
  styleMode = "dafeiyu",
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

  return (
    <div
      style={{
        position: "absolute",
        left: 44,
        right: 44,
        bottom: 58,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        textAlign: "center",
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 44,
          fontWeight: 900,
          color: "#ffffff",
          lineHeight: 1.25,
          WebkitTextStroke: "2px #0f172a",
          textShadow:
            "0 3px 0 #0f172a, 0 6px 16px rgba(0,0,0,0.55)",
        }}
      >
        {zh}
      </div>
      {en ? (
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#e2e8f0",
            textShadow: "0 2px 6px rgba(0,0,0,0.85)",
          }}
        >
          {en}
        </div>
      ) : null}
    </div>
  );
};
