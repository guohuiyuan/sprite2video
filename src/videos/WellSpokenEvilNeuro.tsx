import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BilingualSubtitle } from "../components/BilingualSubtitle";
import { CharacterSprite } from "../components/CharacterSprite";
import { DynamicBackground } from "../components/DynamicBackground";
import { CountUpCard, StampBadge } from "../components/MotionWidgets";
import { AnimatedCursor, CameraRig, DieCutCard } from "../components/OneTakePrimitives";
import { SfxTrack } from "../components/SfxTrack";
import { BottomChapterBar } from "../components/TopProgressBar";
import {
  clamp,
  easeOutCubic,
  lerp,
  maskRise,
  popIn,
  pressPulse,
  seg,
  wordRise,
} from "../lib/onetakeMotion";
import {
  BEATS,
  CHAPTERS,
  SFX_CUES,
  WELL_SPOKEN_TOTAL_FRAMES,
  type BeatSpec,
} from "./wellSpokenData";

const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif";
const INK = "#1a1917";
const CRIMSON = "#c81e2b";
const AMBER = "#b45309";
const EMERALD = "#15803d";

/** Returns the active single-line Capdim subtitle for the current frame inside a beat. */
const pickSubtitle = (beat: BeatSpec, localFrame: number): string => {
  const ratio = localFrame / Math.max(1, beat.durationFrames);
  let active = beat.subtitles[0]?.text ?? "";
  for (const chunk of beat.subtitles) {
    if (ratio >= chunk.fromRatio) active = chunk.text;
  }
  return active;
};

/** Small editorial section pill sitting cleanly above cards */
const SectionTag: React.FC<{ text: string; accent?: string }> = ({
  text,
  accent = CRIMSON,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "6px 18px",
      borderRadius: 999,
      backgroundColor: accent,
      color: "#fffdf8",
      fontSize: 20,
      fontWeight: 800,
      letterSpacing: 1,
      boxShadow: "0 0 0 4px #ffffff, 0 5px 12px rgba(0,0,0,0.14)",
      marginBottom: 18,
      fontFamily: FONT,
    }}
  >
    <span style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: "#fde047" }} />
    {text}
  </div>
);

/** Capdim-style big editorial die-cut wordmark (inspired by "Agent = Model + Harness") */
const EditorialHeadline: React.FC<{
  lines: string[];
  highlightWord?: string;
  startSec?: number;
}> = ({ lines, highlightWord, startSec = 0.08 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, fontFamily: FONT }}>
      {lines.map((line, i) => {
        const m = maskRise(t, startSec, i, 0.14, 110);
        const parts = highlightWord && line.includes(highlightWord)
          ? line.split(highlightWord)
          : [line];
        return (
          <div key={i} style={{ overflow: "hidden", padding: "4px 6px" }}>
            <div
              style={{
                transform: `translateY(${m.yPct}%)`,
                opacity: m.op,
                fontSize: 74,
                fontWeight: 900,
                color: INK,
                lineHeight: 1.15,
                letterSpacing: -1,
                textShadow:
                  "3px 0 0 #fffdf8, -3px 0 0 #fffdf8, 0 3px 0 #fffdf8, 0 -3px 0 #fffdf8, 0 8px 18px rgba(40,32,20,0.12)",
              }}
            >
              {parts.length === 2 ? (
                <>
                  {parts[0]}
                  <span style={{ color: CRIMSON }}>{highlightWord}</span>
                  {parts[1]}
                </>
              ) : (
                line
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// BESPOKE VISUAL BEATS (OneTake Continuous Camera + Interactive Cursor + Capdim)
// ============================================================================

const Beat01Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const eq = wordRise(t, 0.9);
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -24, y: 12, zoom: 0.96, rot: -0.4 },
        { t: 2.2, x: 0, y: 0, zoom: 1.01, rot: 0 },
        { t: 6.0, x: 14, y: -6, zoom: 1.03, rot: 0.25 },
      ]}
    >
      <div style={{ position: "absolute", left: 112, top: 145, width: 1030 }}>
        <SectionTag text="HOW TO BECOME DANGEROUSLY WELL-SPOKEN" accent={INK} />
        <EditorialHeadline
          lines={["把话说得极度清晰", "是最危险的超能力"]}
          highlightWord="最危险"
          startSec={0.08}
        />
        <div
          style={{
            marginTop: 34,
            opacity: eq.op,
            transform: `translateY(${eq.y}px) scale(${eq.s})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 18,
            padding: "20px 34px",
            borderRadius: 18,
            backgroundColor: "#fffdf8",
            border: `3px solid ${INK}`,
            boxShadow: "0 0 0 6px rgba(255,255,255,0.92), 0 12px 26px rgba(0,0,0,0.14)",
            fontFamily: FONT,
            fontSize: 32,
            fontWeight: 900,
            color: INK,
          }}
        >
          <span style={{ color: CRIMSON }}>好口才</span>
          <span>=</span>
          <span>深度思考</span>
          <span style={{ color: AMBER }}>+</span>
          <span>掌控留白</span>
          <span style={{ color: AMBER }}>+</span>
          <span>结构框架</span>
        </div>
      </div>
    </CameraRig>
  );
};

const Beat02Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const items = [
    { icon: "💼", title: "拿大厂 Offer", sub: "面试一针见血", clickT: 1.2 },
    { icon: "❤️", title: "找到理想伴侣", sub: "聊天同频有魅力", clickT: 2.5 },
    { icon: "🤝", title: "签下大客户", sub: "方案直击痛点", clickT: 3.8 },
    { icon: "🚀", title: "赢得赞助合作", sub: "三句话讲清价值", clickT: 5.1 },
  ];

  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 18, y: 10, zoom: 0.98 },
        { t: 3.5, x: -12, y: -4, zoom: 1.02 },
        { t: 7.2, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 138, width: 1020 }}>
        <SectionTag text="表达力 = 人生杠杆" accent={CRIMSON} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 28,
            marginTop: 12,
          }}
        >
          {items.map((it, idx) => {
            const p = pressPulse(t, it.clickT);
            const ent = popIn(t, 0.1 + idx * 0.14);
            return (
              <div
                key={it.title}
                style={{
                  opacity: ent.op,
                  transform: `translateY(${ent.dy}px) scale(${ent.s * p.scale})`,
                  backgroundColor: p.pressed ? "#fef2f2" : "#fffdf8",
                  border: `3px solid ${p.pressed ? CRIMSON : INK}`,
                  borderRadius: 20,
                  padding: "28px 30px",
                  boxShadow:
                    "0 0 0 6px rgba(255,255,255,0.92), 0 12px 24px rgba(36,30,20,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: FONT,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <span style={{ fontSize: 44 }}>{it.icon}</span>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: INK }}>{it.title}</div>
                    <div style={{ fontSize: 21, color: "#57534e", marginTop: 4 }}>{it.sub}</div>
                  </div>
                </div>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 99,
                    backgroundColor: p.pressed ? EMERALD : "#e7e5e4",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  {p.pressed ? "✓" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AnimatedCursor
        waypoints={[
          { t: 0.4, x: 240, y: 180 },
          { t: 1.2, x: 410, y: 310, click: true },
          { t: 2.5, x: 920, y: 310, click: true },
          { t: 3.8, x: 410, y: 505, click: true },
          { t: 5.1, x: 920, y: 505, click: true },
        ]}
      />
    </CameraRig>
  );
};

const Beat03Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const meter = easeOutCubic(seg(t, 0.5, 2.2)) * 96;
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -20, y: 6, zoom: 0.99 },
        { t: 3.8, x: 12, y: -8, zoom: 1.03 },
        { t: 7.8, x: 4, y: 0, zoom: 1.01 },
      ]}
    >
      <div style={{ position: "absolute", right: 105, top: 148, width: 980 }}>
        <SectionTag text="作者真实起点 · 重度社恐" accent="#44403c" />
        <DieCutCard delaySec={0.12} rotate={-1} padding="38px 44px">
          <div style={{ fontSize: 38, fontWeight: 900, color: INK, lineHeight: 1.35 }}>
            小学 → 七年级：每次上台自我介绍
            <br />
            <span style={{ color: CRIMSON }}>当场紧张到大哭 · 几周零交流</span>
          </div>
          <div style={{ marginTop: 32 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 22,
                fontWeight: 800,
                color: "#57534e",
                marginBottom: 10,
              }}
            >
              <span>社交焦虑指数 (Social Anxiety)</span>
              <span style={{ color: CRIMSON }}>{Math.round(meter)}% OVERWHELMED</span>
            </div>
            <div
              style={{
                height: 30,
                borderRadius: 99,
                backgroundColor: "#e7e5e4",
                border: `2.5px solid ${INK}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${meter}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #f97316, #dc2626)",
                  borderRadius: 99,
                }}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: 26,
              padding: "16px 22px",
              borderRadius: 12,
              backgroundColor: "#f5f5f4",
              fontSize: 24,
              fontWeight: 700,
              color: "#44403c",
            }}
          >
            ❌ 曾经以为：「会说话是天生的，社恐没救了」
          </div>
        </DieCutCard>
      </div>
    </CameraRig>
  );
};

const Beat04Visual: React.FC = () => {
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 24, y: 8, zoom: 0.98 },
        { t: 3.2, x: 0, y: -4, zoom: 1.02 },
        { t: 7.5, x: -8, y: 0, zoom: 1.01 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 142, width: 1010 }}>
        <SectionTag text="一切技能皆可习得 · 逆袭结果" accent={EMERALD} />
        <div style={{ display: "flex", gap: 28, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <CountUpCard target={400} suffix="+" label="人现场演讲" delay={10} accent={CRIMSON} />
          </div>
          <div style={{ flex: 1 }}>
            <CountUpCard target={52000} suffix="" label="核心粉丝" delay={36} accent="#2563eb" />
          </div>
        </div>
        <DieCutCard delaySec={1.4} rotate={0.6} style={{ marginTop: 30 }} padding="30px 38px">
          <div style={{ fontSize: 34, fontWeight: 900, color: INK, lineHeight: 1.45 }}>
            就像学走路、学骑车一样——
            <br />
            <span style={{ color: CRIMSON }}>清晰表达</span>，完全可以通过训练练出来！
          </div>
          <div style={{ marginTop: 22 }}>
            <StampBadge text="5 个反常识实操策略" delay={122} color={CRIMSON} rotate={-3} />
          </div>
        </DieCutCard>
      </div>
    </CameraRig>
  );
};

const Beat05Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const depth = easeOutCubic(seg(t, 0.5, 2.4));
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -16, y: 12, zoom: 0.98 },
        { t: 3.4, x: 6, y: -6, zoom: 1.03 },
        { t: 6.4, x: 0, y: 0, zoom: 1.01 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 135, width: 1010 }}>
        <SectionTag text="底层前提 · 思想冰山" accent={INK} />
        <DieCutCard delaySec={0.1} padding="36px 44px">
          <div style={{ fontSize: 40, fontWeight: 900, color: INK, marginBottom: 24 }}>
            表达天花板 ＝ 思考深度
          </div>
          {/* Visual Iceberg */}
          <div
            style={{
              borderRadius: 16,
              overflow: "hidden",
              border: `3px solid ${INK}`,
              fontFamily: FONT,
            }}
          >
            <div
              style={{
                backgroundColor: "#fef3c7",
                padding: "22px 28px",
                borderBottom: `3px dashed ${AMBER}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 28, fontWeight: 900, color: "#92400e" }}>
                🎙️ 水面上：出口的语言（20%）
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#b45309" }}>
                流畅度 · 金句 · 感染力
              </span>
            </div>
            <div
              style={{
                backgroundColor: "#1e293b",
                color: "#f8fafc",
                padding: `${Math.round(lerp(24, 58, depth))}px 28px`,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 900, color: "#38bdf8" }}>
                🧠 水面下：深度思考与质疑（80%）
              </div>
              <div style={{ fontSize: 23, color: "#cbd5e1" }}>
                追问观点来源 → 拆解底层逻辑 → 用写作反复验证
              </div>
            </div>
          </div>
        </DieCutCard>
      </div>
    </CameraRig>
  );
};

const Beat06Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Capdim frame_02.jpg inspired floating speech bubble cluster!
  const bubbles = [
    { text: "# 今日热搜第一", x: 10, y: 12, bg: "#fee2e2", rot: -3, delay: 0.1 },
    { text: "网络热梗复读机", x: 350, y: 2, bg: "#fef3c7", rot: 2.2, delay: 0.25 },
    { text: "短视频情绪带节奏", x: 675, y: 34, bg: "#e0e7ff", rot: -2, delay: 0.4 },
    { text: "别人喂给你的新闻观点", x: 40, y: 158, bg: "#f3e8ff", rot: 1.8, delay: 0.55 },
    { text: "没质疑过就开喷！", x: 560, y: 170, bg: "#ffedd5", rot: -2.5, delay: 0.7 },
    { text: "算法推荐的二手世界观", x: 120, y: 300, bg: "#dcfce7", rot: 1.4, delay: 0.85 },
    { text: "90% 的话其实不是你自己的", x: 420, y: 410, bg: "#fecdd3", rot: -2, delay: 1.0 },
  ];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -16, y: 10, zoom: 0.98 },
        { t: 4.5, x: 10, y: -4, zoom: 1.03 },
        { t: 8.8, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", right: 86, top: 130, width: 1040, height: 590 }}>
        <SectionTag text="真相警告 · 你在和谁对话？" accent={CRIMSON} />
        <div style={{ position: "relative", width: "100%", height: 500, marginTop: 10 }}>
          {bubbles.map((b, i) => {
            const p = popIn(t, b.delay, { rise: 26, s0: 0.75, rot0: b.rot * 2 });
            const bob = Math.sin(t * 2.2 + i * 1.1) * 5;
            return (
              <div
                key={b.text}
                style={{
                  position: "absolute",
                  left: b.x,
                  top: b.y + bob,
                  opacity: p.op,
                  transform: `scale(${p.s}) rotate(${b.rot}deg)`,
                  backgroundColor: b.bg,
                  border: `3px solid ${INK}`,
                  borderRadius: 28,
                  padding: "18px 28px",
                  fontSize: 29,
                  fontWeight: 900,
                  color: INK,
                  fontFamily: FONT,
                  boxShadow: "0 0 0 5px #ffffff, 0 10px 20px rgba(0,0,0,0.12)",
                  whiteSpace: "nowrap",
                }}
              >
                💬 {b.text}
              </div>
            );
          })}
        </div>
      </div>
    </CameraRig>
  );
};

const Beat07Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sweep = easeOutCubic(seg(t, 1.1, 2.0)) * 100;
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 14, y: 8, zoom: 0.97 },
        { t: 3.0, x: 0, y: 0, zoom: 1.03 },
        { t: 6.0, x: -6, y: -4, zoom: 1.01 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 165, width: 1020 }}>
        <DieCutCard delaySec={0.08} rotate={-0.8} padding="48px 54px">
          <div style={{ fontSize: 28, fontWeight: 800, color: "#78716c", marginBottom: 16 }}>
            CORE INSIGHT · 一针见血
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: INK, lineHeight: 1.4 }}>
            你嘴笨，真不是词汇量不够，
            <br />
            而是你压根
            <span
              style={{
                position: "relative",
                display: "inline-block",
                padding: "0 10px",
                color: CRIMSON,
                background: `linear-gradient(90deg, rgba(254,226,226,0.95) ${sweep}%, transparent ${sweep}%)`,
                borderRadius: 8,
              }}
            >
              没彻底想明白
            </span>
          </div>
          <div style={{ marginTop: 28 }}>
            <StampBadge text="先想清 · 再开口" delay={14} color={INK} rotate={-2} />
          </div>
        </DieCutCard>
      </div>
    </CameraRig>
  );
};

const Beat08Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ideas = [
    { id: "01", title: "核心观点 #1", sub: "写作倒逼思考", clickT: 1.6 },
    { id: "02", title: "核心观点 #2", sub: "沉默是朋友", clickT: 3.2 },
    { id: "03", title: "核心观点 #3", sub: "公开发声迭代", clickT: 4.8 },
    { id: "04", title: "核心观点 #4", sub: "故事比道理抓人", clickT: 99 },
    { id: "05", title: "核心观点 #5", sub: "认知边界即智慧", clickT: 99 },
    { id: "06", title: "核心观点 #6", sub: "少即是多", clickT: 99 },
  ];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -12, y: 10, zoom: 0.98 },
        { t: 4.2, x: 10, y: -4, zoom: 1.02 },
        { t: 8.5, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", right: 92, top: 132, width: 1020 }}>
        <SectionTag text="无需背整本百科全书 · 5–9 个核心思想弹药库" accent={AMBER} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 22,
            marginTop: 12,
          }}
        >
          {ideas.map((c, idx) => {
            const p = pressPulse(t, c.clickT);
            const ent = popIn(t, 0.1 + idx * 0.1);
            return (
              <div
                key={c.id}
                style={{
                  opacity: ent.op,
                  transform: `translateY(${ent.dy}px) scale(${ent.s * p.scale})`,
                  backgroundColor: p.pressed ? "#fffbeb" : "#fffdf8",
                  border: `3px solid ${p.pressed ? AMBER : INK}`,
                  borderRadius: 18,
                  padding: "22px 24px",
                  boxShadow: "0 0 0 5px #ffffff, 0 10px 20px rgba(0,0,0,0.12)",
                  fontFamily: FONT,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 18, fontWeight: 900, color: AMBER }}>IDEA {c.id}</span>
                  <span style={{ fontSize: 22 }}>{p.pressed ? "⭐" : "📝"}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: INK }}>{c.title}</div>
                <div style={{ fontSize: 19, color: "#57534e", marginTop: 6 }}>{c.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
      <AnimatedCursor
        waypoints={[
          { t: 0.6, x: 1050, y: 200 },
          { t: 1.6, x: 970, y: 310, click: true },
          { t: 3.2, x: 1310, y: 310, click: true },
          { t: 4.8, x: 1650, y: 310, click: true },
        ]}
      />
    </CameraRig>
  );
};

const Beat09Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const typedText = "1. 把脑中模糊想法写到纸上\n2. 立刻暴露逻辑漏洞\n3. 改到一针见血 → 开口直接降维打击";
  const count = Math.floor(clamp((t - 1.2) * 14, 0, typedText.length));
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 16, y: 12, zoom: 0.98 },
        { t: 4.5, x: -6, y: -6, zoom: 1.02 },
        { t: 9.5, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 132, width: 1020 }}>
        <SectionTag text="策略 01 · WRITE FOR CLARITY" accent={CRIMSON} />
        <DieCutCard delaySec={0.08} padding="30px 36px" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 38, fontWeight: 900, color: INK, textAlign: "center" }}>
            说话 = 脑子里的想法念出来 &nbsp;⇄&nbsp; <span style={{ color: CRIMSON }}>写作 = 安全演练场</span>
          </div>
        </DieCutCard>
        <DieCutCard delaySec={0.45} bg="#18181b" borderColor="#18181b" padding="28px 34px">
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <div style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: "#ef4444" }} />
            <div style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: "#f59e0b" }} />
            <div style={{ width: 14, height: 14, borderRadius: 99, backgroundColor: "#22c55e" }} />
            <span style={{ marginLeft: 12, color: "#a1a1aa", fontSize: 18, fontFamily: "Consolas, monospace" }}>
              clarity_draft.md
            </span>
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 30,
              lineHeight: 1.7,
              color: "#fafafa",
              whiteSpace: "pre-line",
              minHeight: 165,
            }}
          >
            {typedText.slice(0, count)}
            <span style={{ color: "#fde047" }}>▌</span>
          </div>
        </DieCutCard>
      </div>
    </CameraRig>
  );
};

const Beat10Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = pressPulse(t, 2.6);
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -16, y: 10, zoom: 0.98 },
        { t: 3.4, x: 14, y: -4, zoom: 1.03 },
        { t: 7.4, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", right: 96, top: 146, width: 1020 }}>
        <SectionTag text="别混淆：日记 vs 深度写作" accent={INK} />
        <div style={{ display: "flex", gap: 28, marginTop: 10 }}>
          <DieCutCard
            delaySec={0.12}
            rotate={-1.5}
            bg="#f5f5f4"
            style={{ flex: 1, opacity: p.pressed ? 0.62 : 1 }}
            padding="32px 30px"
          >
            <div style={{ fontSize: 30, fontWeight: 900, color: "#78716c" }}>❌ 流水账日记</div>
            <div style={{ fontSize: 23, color: "#78716c", marginTop: 16, lineHeight: 1.65 }}>
              · 只关注今天发生了什么
              <br />
              · 停留在情绪宣泄
              <br />
              · 没经受过逻辑拷问
            </div>
          </DieCutCard>
          <div style={{ flex: 1, transform: `scale(${p.scale})` }}>
            <DieCutCard
              delaySec={0.3}
              rotate={1.2}
              bg={p.pressed ? "#fef2f2" : "#fffdf8"}
              borderColor={p.pressed ? CRIMSON : INK}
              padding="32px 30px"
            >
              <div style={{ fontSize: 30, fontWeight: 900, color: CRIMSON }}>✅ 聚光灯写作</div>
              <div style={{ fontSize: 23, color: INK, marginTop: 16, lineHeight: 1.65, fontWeight: 700 }}>
                · 把观点摆到聚光灯下
                <br />
                · 解剖经历与底层判断
                <br />
                · 反复打磨验证可信度
              </div>
            </DieCutCard>
          </div>
        </div>
      </div>
      <AnimatedCursor
        waypoints={[
          { t: 1.2, x: 1120, y: 390 },
          { t: 2.6, x: 1520, y: 380, click: true },
        ]}
      />
    </CameraRig>
  );
};

const Beat11Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const clickT = 4.4;
  const p = pressPulse(t, clickT);
  const calm = p.pressed ? easeOutCubic(seg(t, clickT, clickT + 0.7)) : 0;
  const loadPct = Math.round(lerp(98, 22, calm));
  const noiseTags = ["📱 刷短视频", "🔔 99+ 未读", "🔥 娱乐热搜", "📢 群聊轰炸", "📰 碎片新闻"];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 14, y: 10, zoom: 0.98 },
        { t: 4.5, x: -10, y: -6, zoom: 1.03 },
        { t: 9.2, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 135, width: 1020 }}>
        <SectionTag text="策略 02 · SIT IN SILENCE" accent={p.pressed ? EMERALD : CRIMSON} />
        <DieCutCard delaySec={0.1} padding="36px 42px">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: INK }}>
              {p.pressed ? "🌿 大脑留白消化模式：已开启" : "🤯 大脑信息流过载：无思考空间"}
            </div>
            {/* Interactive Toggle Switch */}
            <div
              style={{
                width: 112,
                height: 56,
                borderRadius: 999,
                backgroundColor: p.pressed ? EMERALD : "#d6d3d1",
                border: `3px solid ${INK}`,
                padding: 5,
                display: "flex",
                alignItems: "center",
                transform: `scale(${p.scale})`,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 99,
                  backgroundColor: "#ffffff",
                  border: `2.5px solid ${INK}`,
                  transform: `translateX(${lerp(0, 54, calm)}px)`,
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              <span style={{ color: "#57534e" }}>信息占用率</span>
              <span style={{ color: p.pressed ? EMERALD : CRIMSON }}>{loadPct}%</span>
            </div>
            <div style={{ height: 26, borderRadius: 99, backgroundColor: "#e7e5e4", border: `2px solid ${INK}`, overflow: "hidden" }}>
              <div
                style={{
                  width: `${loadPct}%`,
                  height: "100%",
                  backgroundColor: p.pressed ? EMERALD : CRIMSON,
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 28, minHeight: 74 }}>
            {noiseTags.map((tag, i) => (
              <div
                key={tag}
                style={{
                  padding: "10px 20px",
                  borderRadius: 99,
                  backgroundColor: "#fee2e2",
                  border: `2px solid ${CRIMSON}`,
                  fontSize: 22,
                  fontWeight: 800,
                  color: CRIMSON,
                  opacity: clamp(1 - calm * 1.4, 0, 1),
                  transform: `translateY(${calm * -28}px) scale(${1 - calm * 0.3})`,
                }}
              >
                {tag}
              </div>
            ))}
            {p.pressed ? (
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: EMERALD,
                  opacity: calm,
                }}
              >
                ✨ 好想法终于有了浮出水面的空间！
              </div>
            ) : null}
          </div>
        </DieCutCard>
      </div>
      <AnimatedCursor
        waypoints={[
          { t: 2.8, x: 640, y: 360 },
          { t: 4.4, x: 1020, y: 260, click: true },
        ]}
      />
    </CameraRig>
  );
};

const Beat12Visual: React.FC = () => {
  const cards = [
    { emoji: "🚿", title: "洗澡时", note: "彻底断网，灵感爆发", delay: 0.35, rot: -2.2 },
    { emoji: "🏃", title: "跑步 / 健身", note: "作者最爱的思考时间块", delay: 0.9, rot: 1.4 },
    { emoji: "🌙", title: "临睡前 / 晨咖", note: "消化白天输入的信息", delay: 1.5, rot: -1.6 },
  ];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -16, y: 12, zoom: 0.98 },
        { t: 3.6, x: 10, y: -4, zoom: 1.02 },
        { t: 7.4, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", right: 94, top: 145, width: 1020 }}>
        <SectionTag text="不必出家隐居 · 每天留一块思考时间块" accent={AMBER} />
        <div style={{ display: "flex", gap: 24, marginTop: 14 }}>
          {cards.map((c) => (
            <DieCutCard
              key={c.title}
              delaySec={c.delay}
              rotate={c.rot}
              style={{ flex: 1, textAlign: "center" }}
              padding="36px 22px"
            >
              <div style={{ fontSize: 64, marginBottom: 14 }}>{c.emoji}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: INK }}>{c.title}</div>
              <div style={{ fontSize: 21, color: "#57534e", marginTop: 10, lineHeight: 1.45 }}>
                {c.note}
              </div>
            </DieCutCard>
          ))}
        </div>
      </div>
    </CameraRig>
  );
};

const Beat13Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const secs = clamp((t - 1.2) * 0.85, 0, 2.0);
  const panic = t >= 3.2;
  const pulse = panic ? 1 + Math.sin(t * 18) * 0.03 : 1;
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 14, y: 8, zoom: 0.98 },
        { t: 3.6, x: -8, y: -6, zoom: 1.04 },
        { t: 9.0, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 140, width: 1010 }}>
        <SectionTag text="策略 03 · GET COMFORTABLE WITH SILENCE" accent={CRIMSON} />
        <DieCutCard
          delaySec={0.1}
          bg={panic ? "#fef2f2" : "#fffdf8"}
          borderColor={panic ? CRIMSON : INK}
          padding="42px 48px"
          style={{ textAlign: "center", transform: `scale(${pulse})` }}
        >
          <div style={{ fontSize: 24, fontWeight: 800, color: "#78716c" }}>
            对话安静计时器 · SILENCE TIMER
          </div>
          <div
            style={{
              fontSize: 112,
              fontWeight: 900,
              color: panic ? CRIMSON : INK,
              fontFamily: "Consolas, monospace",
              margin: "10px 0",
            }}
          >
            00:0{secs.toFixed(1)}s
          </div>
          <div
            style={{
              display: "inline-block",
              padding: "12px 26px",
              borderRadius: 14,
              backgroundColor: panic ? CRIMSON : "#f5f5f4",
              color: panic ? "#ffffff" : "#57534e",
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            {panic ? "🚨 大脑拉警报！嘴巴比脑子快 → 瞬间结巴！" : "等待思考中..."}
          </div>
        </DieCutCard>
      </div>
    </CameraRig>
  );
};

const Beat14Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p1 = pressPulse(t, 1.8);
  const p2 = pressPulse(t, 4.1);
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -12, y: 8, zoom: 0.98 },
        { t: 4.0, x: 10, y: -4, zoom: 1.02 },
        { t: 7.8, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", right: 94, top: 138, width: 1020 }}>
        <SectionTag text="化解冷场的 2 个高情商动作" accent={EMERALD} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 10 }}>
          <div style={{ transform: `scale(${p1.scale})` }}>
            <DieCutCard
              delaySec={0.12}
              bg={p1.pressed ? "#f0fdf4" : "#fffdf8"}
              borderColor={p1.pressed ? EMERALD : INK}
              padding="28px 36px"
            >
              <div style={{ fontSize: 32, fontWeight: 900, color: INK }}>
                ① 直接告诉对方：<span style={{ color: EMERALD }}>“给我两秒想一下”</span>
              </div>
              <div style={{ fontSize: 23, color: "#57534e", marginTop: 8 }}>
                反而说明你重视这场对话，愿意给出高质量回答
              </div>
            </DieCutCard>
          </div>
          <div style={{ transform: `scale(${p2.scale})` }}>
            <DieCutCard
              delaySec={0.35}
              bg={p2.pressed ? "#f0fdf4" : "#fffdf8"}
              borderColor={p2.pressed ? EMERALD : INK}
              padding="28px 36px"
            >
              <div style={{ fontSize: 32, fontWeight: 900, color: INK }}>
                ② <span style={{ color: EMERALD }}>把对方的问题反问 / 请对方具体化</span>
              </div>
              <div style={{ fontSize: 23, color: "#57534e", marginTop: 8 }}>
                一边赢得缓冲时间，一边让问题更聚焦好答！
              </div>
            </DieCutCard>
          </div>
        </div>
      </div>
      <AnimatedCursor
        waypoints={[
          { t: 0.8, x: 1020, y: 220 },
          { t: 1.8, x: 1320, y: 290, click: true },
          { t: 4.1, x: 1320, y: 495, click: true },
        ]}
      />
    </CameraRig>
  );
};

const Beat15Visual: React.FC = () => {
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 16, y: 10, zoom: 0.98 },
        { t: 3.5, x: -6, y: -4, zoom: 1.03 },
        { t: 7.5, x: 0, y: 0, zoom: 1.01 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 160, width: 1010 }}>
        <SectionTag text="顶级松弛感" accent={INK} />
        <DieCutCard delaySec={0.1} rotate={-0.8} padding="44px 50px">
          <div style={{ fontSize: 54, fontWeight: 900, color: INK, lineHeight: 1.25 }}>
            大方承认「<span style={{ color: CRIMSON }}>我不知道</span>」
          </div>
          <div style={{ fontSize: 28, color: "#44403c", marginTop: 18, lineHeight: 1.55 }}>
            无知的人，连自己不知道什么都不知道；
            <br />
            清楚认知边界，恰恰是聪明人的标志。
          </div>
          <div style={{ marginTop: 28 }}>
            <StampBadge text="反而更显聪明！" delay={86} color={EMERALD} rotate={-3} />
          </div>
        </DieCutCard>
      </div>
    </CameraRig>
  );
};

const Beat16Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p1 = pressPulse(t, 2.2);
  const p2 = pressPulse(t, 4.4);
  const activeIdx = p2.pressed ? 3 : p1.pressed ? 2 : 0;
  const pills = ["4x 狂飙", "2x 倍速", "1x 正常", "⏸ 刻意停顿"];
  const bars = Array.from({ length: 24 }, (_, i) => {
    if (activeIdx === 3 && i >= 10 && i <= 14) return 10; // dramatic silent gap!
    const speed = activeIdx === 0 ? 18 : activeIdx === 2 ? 7 : 4;
    return 24 + Math.abs(Math.sin(t * speed + i * 0.7)) * (activeIdx === 0 ? 96 : 64);
  });

  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -16, y: 10, zoom: 0.98 },
        { t: 4.5, x: 10, y: -4, zoom: 1.03 },
        { t: 9.2, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", right: 94, top: 138, width: 1020 }}>
        <SectionTag text="策略 04 · COMMAND YOUR PAUSES" accent={CRIMSON} />
        <DieCutCard delaySec={0.1} padding="36px 42px">
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 32 }}>
            {pills.map((label, idx) => {
              const active = idx === activeIdx;
              const sc = idx === 2 ? p1.scale : idx === 3 ? p2.scale : 1;
              return (
                <div
                  key={label}
                  style={{
                    padding: "14px 26px",
                    borderRadius: 14,
                    backgroundColor: active ? (idx === 3 ? CRIMSON : INK) : "#f5f5f4",
                    color: active ? "#ffffff" : "#57534e",
                    border: `3px solid ${active ? INK : "#d6d3d1"}`,
                    fontSize: 26,
                    fontWeight: 900,
                    transform: `scale(${sc})`,
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>

          <div
            style={{
              height: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              backgroundColor: "#fafaf9",
              borderRadius: 16,
              border: `2px solid #e7e5e4`,
              padding: "0 24px",
            }}
          >
            {bars.map((h, i) => {
              const inPause = activeIdx === 3 && i >= 10 && i <= 14;
              return (
                <div
                  key={i}
                  style={{
                    width: 18,
                    height: h,
                    borderRadius: 99,
                    backgroundColor: inPause ? CRIMSON : activeIdx === 0 ? "#f97316" : INK,
                    opacity: inPause ? 0.35 : 0.9,
                  }}
                />
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 22, fontSize: 25, fontWeight: 800, color: "#44403c" }}>
            {activeIdx === 3
              ? "✨ 恰到好处的停顿，就是语言里的聚光灯！"
              : "⚡ 现代人习惯 2x / 4x 狂飙，大脑早已过载"}
          </div>
        </DieCutCard>
      </div>
      <AnimatedCursor
        waypoints={[
          { t: 1.0, x: 1020, y: 270 },
          { t: 2.2, x: 1435, y: 275, click: true },
          { t: 4.4, x: 1665, y: 275, click: true },
        ]}
      />
    </CameraRig>
  );
};

const Beat17Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const reveal = wordRise(t, 2.3);
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 14, y: 8, zoom: 0.97 },
        { t: 2.6, x: 0, y: -4, zoom: 1.04 },
        { t: 8.0, x: -6, y: 0, zoom: 1.01 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 155, width: 1010 }}>
        <SectionTag text="停顿 ≠ 词穷 · 停顿 = 掌控感" accent={INK} />
        <DieCutCard delaySec={0.12} padding="44px 50px">
          <div style={{ fontSize: 32, fontWeight: 800, color: "#57534e" }}>
            在关键金句之前，故意停一拍……
          </div>
          <div
            style={{
              marginTop: 28,
              opacity: reveal.op,
              transform: `translateY(${reveal.y}px) scale(${reveal.s})`,
              padding: "28px 34px",
              borderRadius: 18,
              backgroundColor: "#18181b",
              color: "#fef08a",
              fontSize: 40,
              fontWeight: 900,
              lineHeight: 1.4,
            }}
          >
            「珍惜你吐出的每一个词，
            <br />
            瞬间把全场的注意力拉回你身上。」
          </div>
        </DieCutCard>
      </div>
    </CameraRig>
  );
};

const Beat18Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p1 = pressPulse(t, 2.8);
  const p2 = pressPulse(t, 5.2);
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 14, y: 12, zoom: 0.98 },
        { t: 4.5, x: -8, y: -4, zoom: 1.02 },
        { t: 9.5, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 140, width: 1010 }}>
        <SectionTag text="策略 05 · USE FRAMEWORKS TO SPEAK" accent={CRIMSON} />
        <div style={{ fontSize: 44, fontWeight: 900, color: INK, marginBottom: 26, fontFamily: FONT }}>
          结构框架 = 大脑的「辅助轮」🚲
        </div>
        <div style={{ display: "flex", gap: 26 }}>
          <div style={{ flex: 1, transform: `scale(${p1.scale})` }}>
            <DieCutCard
              delaySec={0.2}
              bg={p1.pressed ? "#fef2f2" : "#fffdf8"}
              borderColor={p1.pressed ? CRIMSON : INK}
              padding="34px 32px"
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: CRIMSON }}>FRAMEWORK 01</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: INK, marginTop: 8 }}>
                宗师三段论
              </div>
              <div style={{ fontSize: 22, color: "#57534e", marginTop: 12 }}>
                最直接、最有说服力的讲道理公式
              </div>
            </DieCutCard>
          </div>
          <div style={{ flex: 1, transform: `scale(${p2.scale})` }}>
            <DieCutCard
              delaySec={0.4}
              bg={p2.pressed ? "#fffbeb" : "#fffdf8"}
              borderColor={p2.pressed ? AMBER : INK}
              padding="34px 32px"
            >
              <div style={{ fontSize: 22, fontWeight: 900, color: AMBER }}>FRAMEWORK 02</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: INK, marginTop: 8 }}>
                微故事框架
              </div>
              <div style={{ fontSize: 22, color: "#57534e", marginTop: 12 }}>
                几秒内抓住任何人注意力的叙事引擎
              </div>
            </DieCutCard>
          </div>
        </div>
      </div>
      <AnimatedCursor
        waypoints={[
          { t: 1.5, x: 260, y: 240 },
          { t: 2.8, x: 350, y: 400, click: true },
          { t: 5.2, x: 860, y: 400, click: true },
        ]}
      />
    </CameraRig>
  );
};

const Beat19Visual: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const curveP = easeOutCubic(seg(t, 4.5, 6.8));
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: -20, y: 8, zoom: 0.99 },
        { t: 4.8, x: 22, y: -4, zoom: 1.02 },
        { t: 9.8, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div
        style={{
          position: "absolute",
          left: 88,
          right: 88,
          top: 112,
          display: "flex",
          gap: 32,
          alignItems: "stretch",
        }}
      >
        {/* Left: Guru Framework */}
        <DieCutCard delaySec={0.1} style={{ flex: 1 }} padding="32px 34px">
          <div style={{ fontSize: 20, fontWeight: 900, color: CRIMSON }}>① 宗师三段论 (GURU FRAMEWORK)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 22 }}>
            {[
              { step: "1. Claim", zh: "抛核心论点", desc: "开门见山亮出你的判断或结论", delay: 0.35 },
              { step: "2. Explanation", zh: "讲底层逻辑", desc: "解释为什么成立，给出你的视角", delay: 1.3 },
              { step: "3. Examples", zh: "举具体例子", desc: "用一个画面感案例把观点钉死", delay: 2.3 },
            ].map((s) => {
              const m = wordRise(t, s.delay);
              return (
                <div
                  key={s.step}
                  style={{
                    opacity: m.op,
                    transform: `translateY(${m.y}px)`,
                    padding: "16px 22px",
                    borderRadius: 14,
                    backgroundColor: "#fef2f2",
                    border: `2.5px solid ${CRIMSON}`,
                  }}
                >
                  <div style={{ fontSize: 25, fontWeight: 900, color: INK }}>
                    <span style={{ color: CRIMSON }}>{s.step}</span> · {s.zh}
                  </div>
                  <div style={{ fontSize: 19, color: "#57534e", marginTop: 4 }}>{s.desc}</div>
                </div>
              );
            })}
          </div>
        </DieCutCard>

        {/* Right: Micro Story with SVG Valley Curve */}
        <DieCutCard delaySec={0.3} style={{ flex: 1 }} padding="32px 34px">
          <div style={{ fontSize: 20, fontWeight: 900, color: AMBER }}>② 微故事框架 (MICRO STORY)</div>
          <svg width="100%" height="185" viewBox="0 0 600 185" style={{ marginTop: 14 }}>
            <path
              d="M 45 70 C 165 70, 215 162, 300 162 C 385 162, 445 36, 555 36"
              fill="none"
              stroke={AMBER}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="720"
              strokeDashoffset={720 * (1 - curveP)}
            />
            <circle cx="45" cy="70" r="11" fill={INK} />
            <circle cx="300" cy="162" r="12" fill={CRIMSON} />
            <circle cx="555" cy="36" r="12" fill={EMERALD} />
            <text x="20" y="45" fontSize="20" fontWeight="900" fill={INK}>A 痛点</text>
            <text x="235" y="140" fontSize="20" fontWeight="900" fill={CRIMSON}>▼ 放大低谷</text>
            <text x="485" y="24" fontSize="20" fontWeight="900" fill={EMERALD}>B 解法</text>
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8, fontSize: 22, fontWeight: 800, color: INK }}>
            <div>• Problem：点出听众感同身受的困境</div>
            <div>• Amplify：展示不解决会怎样蔓延恶化</div>
            <div>• Solution：给出清晰可落地的行动解法</div>
          </div>
        </DieCutCard>
      </div>
    </CameraRig>
  );
};

const Beat20Visual: React.FC = () => {
  const blocks = [
    { label: "① 写清楚 · 炼观点", tag: "CLARITY" },
    { label: "② 留白独处 · 消化输入", tag: "SILENCE" },
    { label: "③ 接住冷场 · 显松弛", tag: "COMPOSURE" },
    { label: "④ 掌控停顿 · 抓注意力", tag: "PAUSES" },
    { label: "⑤ 两大框架 · 稳输出", tag: "FRAMEWORKS" },
  ];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 16, y: 10, zoom: 0.98 },
        { t: 4.5, x: 0, y: -4, zoom: 1.02 },
        { t: 9.5, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", left: 108, top: 124, width: 920 }}>
        <SectionTag text="收官 · 你的表达积木清单" accent={CRIMSON} />
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {blocks.map((b, i) => (
            <DieCutCard
              key={b.label}
              delaySec={0.12 + i * 0.22}
              rotate={i % 2 === 0 ? -0.45 : 0.45}
              padding="16px 28px"
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: INK }}>{b.label}</span>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: EMERALD,
                    backgroundColor: "#f0fdf4",
                    border: `2px solid ${EMERALD}`,
                    borderRadius: 99,
                    padding: "4px 14px",
                  }}
                >
                  ✓ {b.tag}
                </span>
              </div>
            </DieCutCard>
          ))}
        </div>
        <div style={{ marginTop: 22 }}>
          <StampBadge text="公开发声 · 30天进化挑战" delay={112} color={CRIMSON} rotate={-2} />
        </div>
      </div>
    </CameraRig>
  );
};

const VISUAL_MAP: Record<number, React.FC> = {
  1: Beat01Visual,
  2: Beat02Visual,
  3: Beat03Visual,
  4: Beat04Visual,
  5: Beat05Visual,
  6: Beat06Visual,
  7: Beat07Visual,
  8: Beat08Visual,
  9: Beat09Visual,
  10: Beat10Visual,
  11: Beat11Visual,
  12: Beat12Visual,
  13: Beat13Visual,
  14: Beat14Visual,
  15: Beat15Visual,
  16: Beat16Visual,
  17: Beat17Visual,
  18: Beat18Visual,
  19: Beat19Visual,
  20: Beat20Visual,
};

const BeatScene: React.FC<{ beat: BeatSpec }> = ({ beat }) => {
  const localFrame = useCurrentFrame();
  const Visual = VISUAL_MAP[beat.index];
  const sub = pickSubtitle(beat, localFrame);

  // Smooth OneTake entrance/exit carry fade (short 6f cross-settle, never long sluggish fade)
  const enterOp = interpolate(localFrame, [0, 6], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: enterOp }}>
      {Visual ? <Visual /> : null}
      <CharacterSprite
        src={`characters/evil-neuro-chibi/sprites/${beat.pose}.png`}
        motion={beat.motion}
        placement={beat.placement}
        size={beat.placement === "corner" ? 310 : 535}
        offsetY={beat.placement === "corner" ? 26 : 36}
        flipX={beat.flipX}
        dieCut={true}
      />
      <BilingualSubtitle styleMode="capdim" zh={sub} />
      <BottomChapterBar chapters={[...CHAPTERS]} activeIndex={beat.chapterIndex} showMascotBadge={true} />
    </AbsoluteFill>
  );
};

export const WellSpokenEvilNeuro: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Persistent Capdim warm vintage textured graph paper */}
      <DynamicBackground variant="paper" />

      {/* Subtle top-left editorial watermark matching DSH benchmark */}
      <div
        style={{
          position: "absolute",
          left: 38,
          top: 26,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: FONT,
          fontSize: 24,
          fontWeight: 900,
          color: "rgba(92, 84, 70, 0.42)",
          letterSpacing: 1,
          zIndex: 40,
        }}
      >
        <span>Evil_Neuro_CN</span>
        <span style={{ opacity: 0.6 }}>|</span>
        <span style={{ fontWeight: 700, fontSize: 20 }}>表达进化论</span>
      </div>

      {/* 20 synchronized beats (visuals + Evil Neuro die-cut sprite + timed subtitles + VO) */}
      {BEATS.map((beat) => (
        <Sequence
          key={beat.index}
          from={beat.startFrame}
          durationInFrames={beat.durationFrames}
        >
          <BeatScene beat={beat} />
          <Audio src={staticFile(beat.audioFile)} volume={1.0} />
        </Sequence>
      ))}

      {/* Steady lofi editorial BGM from go-music-dl (smooth intro/outro fade, no ducking pump) */}
      <Audio
        src={staticFile("audio/well-spoken/bgm.mp3")}
        loop
        volume={(f) => {
          const fadeIn = interpolate(f, [0, 45], [0, 1], { extrapolateRight: "clamp" });
          const fadeOut = interpolate(
            f,
            [WELL_SPOKEN_TOTAL_FRAMES - 75, WELL_SPOKEN_TOTAL_FRAMES],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return 0.11 * fadeIn * fadeOut;
        }}
      />

      {/* Action-bound SFX track (Cuongit mallet/click/chime + pop/tick/ding/stamp/thud) */}
      <SfxTrack cues={SFX_CUES} />
    </AbsoluteFill>
  );
};
