import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { DynamicBackground } from "./DynamicBackground";

export type BilibiliCoverProps = {
  /** Top punchy red/dark ribbon pill (e.g. "反常识警告 · 别再死背金句了！") */
  eyebrow: string;
  /** Line 1 of giant headline (5-7 chars, ultra-bold) */
  titleLine1: string;
  /** Highlighted giant word/phrase on Line 2 */
  titleHighlight: string;
  /** Optional suffix after highlight on Line 2 */
  titleSuffix?: string;
  /** Crisp benefit pills telling viewers what they will walk away with */
  takeaways: string[];
  /** Main expressive character sprite (relative to public/) */
  mainSprite: string;
  /** Optional secondary contrast/reaction sprite peeking on the side */
  accentSprite?: string;
  /** Small bottom-left corner stamp (e.g. "Evil_Neuro_CN 全程配音") */
  cornerBadge?: string;
  /** Visual theme: capdim (vintage paper) or dafeiyu (vibrant ocean sunburst) */
  theme?: "capdim" | "dafeiyu";
};

const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif";
const INK = "#141312";
const CRIMSON = "#d61f2c";

/**
 * Multi-platform high-CTR cover renderer supporting:
 *   - 16:9 (1920x1080) Bilibili main cover
 *   -  4:3 (1440x1080) Bilibili feed / dynamic cover
 *   -  3:4 (1080x1440) Douyin / Xiaohongshu vertical cover
 */
export const BilibiliCover: React.FC<BilibiliCoverProps> = ({
  eyebrow,
  titleLine1,
  titleHighlight,
  titleSuffix = "",
  takeaways,
  mainSprite,
  accentSprite,
  cornerBadge = "Evil_Neuro_CN · 萌版贴图解说",
  theme = "capdim",
}) => {
  const { width, height } = useVideoConfig();
  const isPortrait = height > width; // 3:4 (1080x1440) Douyin / Xiaohongshu
  const is4x3 = !isPortrait && width < 1700;
  const isDafeiyu = theme === "dafeiyu";

  const slabBg = isDafeiyu ? "#0284c7" : CRIMSON;

  const dieCutHeavy =
    "drop-shadow(5px 0 0 #ffffff) drop-shadow(-5px 0 0 #ffffff) drop-shadow(0 5px 0 #ffffff) drop-shadow(0 -5px 0 #ffffff) drop-shadow(4px 4px 0 #ffffff) drop-shadow(-4px -4px 0 #ffffff) drop-shadow(0 18px 30px rgba(10, 18, 36, 0.36))";

  // ---------------------------------------------------------------------------
  // 3:4 PORTRAIT LAYOUT (1080x1440 — Douyin / Xiaohongshu)
  // ---------------------------------------------------------------------------
  if (isPortrait) {
    return (
      <AbsoluteFill style={{ overflow: "hidden", fontFamily: FONT }}>
        {isDafeiyu ? (
          <DynamicBackground variant="sunburst" accent="#0284c7" secondary="#082f49" />
        ) : (
          <DynamicBackground variant="paper" />
        )}

        {/* Radial glow behind bottom hero character */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: -60,
            width: 960,
            height: 960,
            marginLeft: -480,
            borderRadius: "50%",
            background: isDafeiyu
              ? "radial-gradient(circle, rgba(56,189,248,0.48) 0%, rgba(250,204,21,0.16) 46%, transparent 72%)"
              : "radial-gradient(circle, rgba(220,38,38,0.16) 0%, rgba(251,191,36,0.16) 46%, transparent 72%)",
          }}
        />

        {/* Crisp frame border */}
        <div
          style={{
            position: "absolute",
            inset: 22,
            border: isDafeiyu
              ? "4px solid rgba(255, 255, 255, 0.35)"
              : "4px solid rgba(28, 25, 23, 0.22)",
            borderRadius: 28,
            pointerEvents: "none",
          }}
        />

        {/* Top editorial copy block (centered, giant mobile-readable type) */}
        <div
          style={{
            position: "absolute",
            top: 66,
            left: 54,
            right: 54,
            zIndex: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {/* Eyebrow ribbon */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 28px",
              borderRadius: 16,
              backgroundColor: isDafeiyu ? "#0f172a" : INK,
              color: "#fef08a",
              fontSize: 31,
              fontWeight: 900,
              letterSpacing: 0.5,
              transform: "rotate(-1.2deg)",
              boxShadow: isDafeiyu
                ? "0 0 0 5px #ffffff, 7px 9px 0 rgba(56, 189, 248, 0.95)"
                : "0 0 0 5px #ffffff, 7px 9px 0 rgba(214, 31, 44, 0.92)",
              marginBottom: 30,
            }}
          >
            <span style={{ color: isDafeiyu ? "#38bdf8" : "#ff5c67" }}>▶</span>
            <span>{eyebrow}</span>
          </div>

          {/* Giant Line 1 */}
          <div
            style={{
              fontSize: 112,
              fontWeight: 900,
              color: isDafeiyu ? "#ffffff" : INK,
              lineHeight: 1.08,
              letterSpacing: -2,
              WebkitTextStroke: isDafeiyu ? "5px #0f172a" : undefined,
              paintOrder: isDafeiyu ? "stroke fill" : undefined,
              textShadow: isDafeiyu
                ? "0 9px 0 #0f172a, 0 16px 30px rgba(0,0,0,0.45)"
                : "6px 0 0 #fffdf8, -6px 0 0 #fffdf8, 0 6px 0 #fffdf8, 0 -6px 0 #fffdf8, 4px 4px 0 #fffdf8, -4px -4px 0 #fffdf8, 0 12px 24px rgba(0,0,0,0.16)",
            }}
          >
            {titleLine1}
          </div>

          {/* Giant Line 2 */}
          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                padding: "10px 30px",
                borderRadius: 22,
                backgroundColor: slabBg,
                color: isDafeiyu ? "#fde047" : "#ffffff",
                fontSize: 120,
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: -1,
                border: `6px solid ${INK}`,
                transform: "rotate(-1.2deg)",
                boxShadow: "0 0 0 7px #ffffff, 9px 11px 0 rgba(20, 19, 18, 0.9)",
              }}
            >
              {titleHighlight}
            </div>
            {titleSuffix ? (
              <span
                style={{
                  fontSize: 108,
                  fontWeight: 900,
                  color: isDafeiyu ? "#ffffff" : INK,
                  WebkitTextStroke: isDafeiyu ? "5px #0f172a" : undefined,
                  paintOrder: isDafeiyu ? "stroke fill" : undefined,
                  textShadow: isDafeiyu
                    ? "0 9px 0 #0f172a, 0 16px 28px rgba(0,0,0,0.45)"
                    : "6px 0 0 #fffdf8, -6px 0 0 #fffdf8, 0 6px 0 #fffdf8, 0 -6px 0 #fffdf8, 0 10px 20px rgba(0,0,0,0.16)",
                }}
              >
                {titleSuffix}
              </span>
            ) : null}
          </div>

          {/* Takeaway pills row */}
          <div
            style={{
              marginTop: 34,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 16,
            }}
          >
            {takeaways.map((item, idx) => (
              <div
                key={item}
                style={{
                  padding: "12px 24px",
                  borderRadius: 16,
                  backgroundColor: idx === 0 ? "#fef9c3" : "#fffdf8",
                  border: `4px solid ${INK}`,
                  boxShadow: "0 0 0 4px #ffffff, 5px 7px 0 rgba(20,19,18,0.18)",
                  fontSize: 30,
                  fontWeight: 900,
                  color: INK,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: CRIMSON }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mini contrast sticker peeking left-mid */}
        {accentSprite ? (
          <div
            style={{
              position: "absolute",
              left: 42,
              bottom: 390,
              width: 245,
              height: 245,
              transform: "rotate(-10deg)",
              filter: dieCutHeavy,
              zIndex: 15,
            }}
          >
            <Img
              src={staticFile(accentSprite)}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        ) : null}

        {/* Big Hero Character centered-bottom */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 108,
            marginLeft: -335,
            width: 670,
            height: 670,
            transform: "rotate(-1.5deg)",
            filter: dieCutHeavy,
            zIndex: 18,
          }}
        >
          <Img
            src={staticFile(mainSprite)}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Clean centered bottom badge */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 46,
            display: "flex",
            justifyContent: "center",
            zIndex: 25,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 26px",
              borderRadius: 999,
              backgroundColor: "rgba(20, 19, 18, 0.90)",
              color: "#fafafa",
              fontSize: 26,
              fontWeight: 800,
              boxShadow: "0 0 0 4px rgba(255,255,255,0.94)",
            }}
          >
            <span style={{ color: "#fde047" }}>★</span>
            <span>{cornerBadge}</span>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // ---------------------------------------------------------------------------
  // 16:9 (1920x1080) & 4:3 (1440x1080) LANDSCAPE LAYOUTS (Bilibili)
  // ---------------------------------------------------------------------------
  const padX = is4x3 ? 64 : 92;
  const h1Size = is4x3 ? 112 : 134;
  const h2Size = is4x3 ? 124 : 148;
  const mainSize = is4x3 ? 650 : 790;

  return (
    <AbsoluteFill style={{ overflow: "hidden", fontFamily: FONT }}>
      {isDafeiyu ? (
        <DynamicBackground variant="sunburst" accent="#0284c7" secondary="#082f49" />
      ) : (
        <DynamicBackground variant="paper" />
      )}

      {/* Dramatic radial accent behind character */}
      <div
        style={{
          position: "absolute",
          right: is4x3 ? -120 : -80,
          top: -90,
          width: is4x3 ? 900 : 1080,
          height: is4x3 ? 900 : 1080,
          borderRadius: "50%",
          background: isDafeiyu
            ? "radial-gradient(circle, rgba(56,189,248,0.45) 0%, rgba(250,204,21,0.18) 44%, transparent 72%)"
            : "radial-gradient(circle, rgba(220,38,38,0.16) 0%, rgba(251,191,36,0.14) 44%, transparent 72%)",
        }}
      />

      {/* Crisp frame border */}
      <div
        style={{
          position: "absolute",
          inset: 22,
          border: isDafeiyu
            ? "4px solid rgba(255, 255, 255, 0.35)"
            : "4px solid rgba(28, 25, 23, 0.22)",
          borderRadius: 24,
          pointerEvents: "none",
        }}
      />

      {/* Left copy block */}
      <div
        style={{
          position: "absolute",
          left: padX,
          top: is4x3 ? 82 : 88,
          width: is4x3 ? 820 : 1080,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {/* Punchy eyebrow ribbon */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 30px",
            borderRadius: 16,
            backgroundColor: isDafeiyu ? "#0f172a" : INK,
            color: "#fef08a",
            fontSize: is4x3 ? 32 : 36,
            fontWeight: 900,
            letterSpacing: 1,
            transform: "rotate(-1.5deg)",
            boxShadow: isDafeiyu
              ? "0 0 0 6px #ffffff, 8px 10px 0 rgba(56, 189, 248, 0.95)"
              : "0 0 0 6px #ffffff, 8px 10px 0 rgba(214, 31, 44, 0.92)",
            marginBottom: 34,
          }}
        >
          <span style={{ color: isDafeiyu ? "#38bdf8" : "#ff5c67" }}>▶</span>
          <span>{eyebrow}</span>
        </div>

        {/* Giant Line 1 */}
        <div
          style={{
            fontSize: h1Size,
            fontWeight: 900,
            color: isDafeiyu ? "#ffffff" : INK,
            lineHeight: 1.08,
            letterSpacing: -2,
            WebkitTextStroke: isDafeiyu ? "6px #0f172a" : undefined,
            paintOrder: isDafeiyu ? "stroke fill" : undefined,
            textShadow: isDafeiyu
              ? "0 10px 0 #0f172a, 0 18px 34px rgba(0,0,0,0.45)"
              : "6px 0 0 #fffdf8, -6px 0 0 #fffdf8, 0 6px 0 #fffdf8, 0 -6px 0 #fffdf8, 4px 4px 0 #fffdf8, -4px -4px 0 #fffdf8, 0 12px 24px rgba(0,0,0,0.16)",
          }}
        >
          {titleLine1}
        </div>

        {/* Giant Line 2 with high-contrast sticker slab */}
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div
            style={{
              padding: is4x3 ? "10px 28px" : "12px 36px",
              borderRadius: 24,
              backgroundColor: slabBg,
              color: isDafeiyu ? "#fde047" : "#ffffff",
              fontSize: h2Size,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -1,
              border: `6px solid ${INK}`,
              transform: "rotate(-1.2deg)",
              boxShadow: "0 0 0 7px #ffffff, 10px 12px 0 rgba(20, 19, 18, 0.9)",
            }}
          >
            {titleHighlight}
          </div>
          {titleSuffix ? (
            <span
              style={{
                fontSize: h1Size * 0.92,
                fontWeight: 900,
                color: isDafeiyu ? "#ffffff" : INK,
                WebkitTextStroke: isDafeiyu ? "6px #0f172a" : undefined,
                paintOrder: isDafeiyu ? "stroke fill" : undefined,
                textShadow: isDafeiyu
                  ? "0 10px 0 #0f172a, 0 18px 30px rgba(0,0,0,0.45)"
                  : "6px 0 0 #fffdf8, -6px 0 0 #fffdf8, 0 6px 0 #fffdf8, 0 -6px 0 #fffdf8, 0 10px 20px rgba(0,0,0,0.16)",
              }}
            >
              {titleSuffix}
            </span>
          ) : null}
        </div>

        {/* Clear viewer takeaway pills */}
        <div
          style={{
            marginTop: is4x3 ? 42 : 48,
            display: "flex",
            flexWrap: "wrap",
            gap: 18,
            maxWidth: is4x3 ? 780 : 980,
          }}
        >
          {takeaways.map((item, idx) => (
            <div
              key={item}
              style={{
                padding: is4x3 ? "14px 24px" : "16px 30px",
                borderRadius: 18,
                backgroundColor: idx === 0 ? "#fef9c3" : "#fffdf8",
                border: `4px solid ${INK}`,
                boxShadow: "0 0 0 5px #ffffff, 6px 8px 0 rgba(20,19,18,0.18)",
                fontSize: is4x3 ? 30 : 34,
                fontWeight: 900,
                color: INK,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ color: CRIMSON }}>✓</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optional mini reaction contrast sticker top-right */}
      {accentSprite ? (
        <div
          style={{
            position: "absolute",
            right: is4x3 ? 34 : 54,
            top: 44,
            width: is4x3 ? 250 : 295,
            height: is4x3 ? 250 : 295,
            transform: "rotate(9deg)",
            filter: dieCutHeavy,
            zIndex: 12,
          }}
        >
          <Img
            src={staticFile(accentSprite)}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      ) : null}

      {/* Main hero character die-cut sticker */}
      <div
        style={{
          position: "absolute",
          right: is4x3 ? 12 : 46,
          bottom: is4x3 ? 72 : 66,
          width: mainSize,
          height: mainSize,
          transform: "rotate(-2.5deg)",
          filter: dieCutHeavy,
          zIndex: 18,
        }}
      >
        <Img
          src={staticFile(mainSprite)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

      {/* Subtle bottom-left creator / voice stamp */}
      <div
        style={{
          position: "absolute",
          left: padX,
          bottom: 58,
          display: "inline-flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 24px",
          borderRadius: 999,
          backgroundColor: "rgba(20, 19, 18, 0.88)",
          color: "#fafafa",
          fontSize: 26,
          fontWeight: 800,
          boxShadow: "0 0 0 4px rgba(255,255,255,0.92)",
          zIndex: 25,
        }}
      >
        <span style={{ color: "#fde047" }}>★</span>
        <span>{cornerBadge}</span>
      </div>
    </AbsoluteFill>
  );
};
