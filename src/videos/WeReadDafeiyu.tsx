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
import { CompareBar, CountUpCard, StampBadge, TerminalBox } from "../components/MotionWidgets";
import { AnimatedCursor, CameraRig } from "../components/OneTakePrimitives";
import { SfxTrack } from "../components/SfxTrack";
import { TopProgressBar } from "../components/TopProgressBar";
import { clamp, easeOutCubic, popIn, pressPulse, seg, wordRise } from "../lib/onetakeMotion";
import {
  WEREAD_BEATS,
  WEREAD_SFX_CUES,
  WEREAD_TOTAL_FRAMES,
  type DafeiyuBeatSpec,
} from "./wereadData";

const FONT = "'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', sans-serif";

/** Soft floating bokeh orbs + bottom dark vignette matching Reference Video 1 (Dafeiyu 9:16) */
const DafeiyuAtmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const orbs = [
    { x: 130, y: 520, r: 44, sp: 0.04, ph: 0 },
    { x: 920, y: 660, r: 34, sp: 0.055, ph: 1.5 },
    { x: 240, y: 980, r: 28, sp: 0.045, ph: 3.1 },
    { x: 840, y: 1120, r: 52, sp: 0.035, ph: 4.2 },
    { x: 540, y: 760, r: 24, sp: 0.06, ph: 2.0 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Subtle halftone dot texture */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1.5px, transparent 1.5px)",
          backgroundSize: "26px 26px",
        }}
      />
      {orbs.map((o, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: o.x + Math.sin(frame * o.sp + o.ph) * 24,
            top: o.y + Math.cos(frame * o.sp * 0.8 + o.ph) * 30,
            width: o.r * 2,
            height: o.r * 2,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 72%)",
            opacity: 0.6,
          }}
        />
      ))}
      {/* Bottom dark vignette so Dafeiyu sprite & karaoke bilingual subtitles pop */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(4,10,24,0.22) 0%, rgba(4,10,24,0) 24%, rgba(4,10,24,0.05) 60%, rgba(2,8,20,0.88) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Luminous glass/white Dafeiyu info card matching Ref Video 1's clean glowing rounded pills */
const GlowCard: React.FC<{
  delaySec?: number;
  glowColor?: string;
  padding?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({
  delaySec = 0.08,
  glowColor = "rgba(56, 189, 248, 0.55)",
  padding = "28px 34px",
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = popIn(frame / fps, delaySec, { rise: 36, s0: 0.88, rot0: -1.5 });
  return (
    <div
      style={{
        opacity: m.op,
        transform: `translateY(${m.dy}px) scale(${m.s})`,
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        borderRadius: 28,
        border: "4px solid #ffffff",
        boxShadow: `0 0 34px ${glowColor}, 0 18px 36px rgba(0, 0, 0, 0.34)`,
        padding,
        fontFamily: FONT,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// 10 HIGH-DENSITY 9:16 DAFEIYU + ONETAKE VISUAL STAGES
// ============================================================================

const Beat01Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pill1 = wordRise(t, 0.65);
  const pill2 = wordRise(t, 1.35);
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 18, zoom: 0.96 },
        { t: 3.0, x: 0, y: 0, zoom: 1.02 },
        { t: 9.2, x: 0, y: -10, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", top: 435, left: 62, right: 62, display: "flex", flexDirection: "column", gap: 26 }}>
        <GlowCard delaySec={0.08} glowColor="rgba(56, 189, 248, 0.65)" padding="34px 36px">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span
              style={{
                padding: "6px 18px",
                borderRadius: 999,
                backgroundColor: "#0f172a",
                color: "#38bdf8",
                fontSize: 24,
                fontWeight: 900,
                fontFamily: "Consolas, monospace",
              }}
            >
              GitHub · Go
            </span>
            <span style={{ fontSize: 32, fontWeight: 900, color: "#d97706" }}>⭐ 1,040 Stars</span>
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#0f172a", lineHeight: 1.25 }}>
            able8 / weread-hot-booklists
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#475569", marginTop: 10 }}>
            微信读书热门书单榜 · 全书高赞划线 Markdown 宝库
          </div>
        </GlowCard>

        <div style={{ display: "flex", gap: 20 }}>
          <div
            style={{
              flex: 1,
              opacity: pill1.op,
              transform: `translateY(${pill1.y}px) scale(${pill1.s})`,
              backgroundColor: "#0f172a",
              border: "3px solid #38bdf8",
              borderRadius: 24,
              padding: "22px 20px",
              textAlign: "center",
              boxShadow: "0 12px 26px rgba(0,0,0,0.35)",
              fontFamily: FONT,
            }}
          >
            <div style={{ fontSize: 58, fontWeight: 900, color: "#fde047" }}>98 个</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0", marginTop: 4 }}>微信读书热门书单</div>
          </div>
          <div
            style={{
              flex: 1,
              opacity: pill2.op,
              transform: `translateY(${pill2.y}px) scale(${pill2.s})`,
              backgroundColor: "#0f172a",
              border: "3px solid #34d399",
              borderRadius: 24,
              padding: "22px 20px",
              textAlign: "center",
              boxShadow: "0 12px 26px rgba(0,0,0,0.35)",
              fontFamily: FONT,
            }}
          >
            <div style={{ fontSize: 58, fontWeight: 900, color: "#4ade80" }}>2,416 本</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#e2e8f0", marginTop: 4 }}>高分好书 Markdown</div>
          </div>
        </div>
      </div>
    </CameraRig>
  );
};

const Beat02Stage: React.FC = () => {
  const pains = [
    { icon: "😵", text: "热门榜单刷半天，真假好书分不清", delay: 0.15 },
    { icon: "📚", text: "冲动买了十几本，拆封都没拆直接吃灰", delay: 0.9 },
    { icon: "⏳", text: "动辄几十万字，没时间先扫核心干货", delay: 1.65 },
  ];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 12, zoom: 0.98 },
        { t: 3.4, x: 0, y: -4, zoom: 1.03 },
        { t: 6.8, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", top: 435, left: 64, right: 64, display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
        {pains.map((p) => (
          <GlowCard key={p.text} delaySec={p.delay} glowColor="rgba(248, 113, 113, 0.55)" style={{ width: "100%" }} padding="26px 32px">
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: 48 }}>{p.icon}</span>
              <span style={{ fontSize: 34, fontWeight: 900, color: "#1e293b", lineHeight: 1.3 }}>{p.text}</span>
            </div>
          </GlowCard>
        ))}
        <div style={{ marginTop: 10 }}>
          <StampBadge text="选书太内耗！" delay={106} color="#dc2626" rotate={-6} />
        </div>
      </div>
    </CameraRig>
  );
};

const Beat03Stage: React.FC = () => {
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 14, zoom: 0.97 },
        { t: 5.0, x: 0, y: -4, zoom: 1.02 },
        { t: 10.6, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", top: 430, left: 64, right: 64, display: "flex", flexDirection: "column", gap: 26 }}>
        <CountUpCard target={98} suffix=" 个" label="微信读书高赞书单" delay={8} accent="#4f46e5" />
        <CountUpCard target={2944} suffix=" 份" label="书籍 Markdown 笔记" delay={30} accent="#0284c7" />
        <GlowCard delaySec={1.8} glowColor="rgba(129, 140, 248, 0.6)" padding="24px 32px">
          <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
            <div>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#4f46e5" }}>2,416 本</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#475569" }}>去重真实好书</div>
            </div>
            <div style={{ width: 3, backgroundColor: "#e2e8f0" }} />
            <div>
              <div style={{ fontSize: 44, fontWeight: 900, color: "#059669" }}>329 Forks</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#475569" }}>社区持续复用</div>
            </div>
          </div>
        </GlowCard>
      </div>
    </CameraRig>
  );
};

const Beat04Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cats = [
    { icon: "🌍", name: "英文原版 Fiction", cnt: "300 本", clickT: 2.0 },
    { icon: "📈", name: "投资与经济金融", cnt: "88 本", clickT: 4.4 },
    { icon: "🦉", name: "牛津通识读本", cnt: "76 本", clickT: 6.8 },
    { icon: "🗣️", name: "沟通与表达能力", cnt: "61 本", clickT: 99 },
    { icon: "🏆", name: "茅盾文学奖", cnt: "58 本", clickT: 99 },
    { icon: "💎", name: "比尔·盖茨书单", cnt: "全球最贵", clickT: 99 },
  ];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 12, zoom: 0.98 },
        { t: 5.5, x: 0, y: -6, zoom: 1.02 },
        { t: 11.5, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div
        style={{
          position: "absolute",
          top: 430,
          left: 56,
          right: 56,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 22,
        }}
      >
        {cats.map((c, idx) => {
          const p = pressPulse(t, c.clickT);
          const ent = popIn(t, 0.1 + idx * 0.14);
          return (
            <div
              key={c.name}
              style={{
                opacity: ent.op,
                transform: `translateY(${ent.dy}px) scale(${ent.s * p.scale})`,
                backgroundColor: p.pressed ? "#fef9c3" : "rgba(255,255,255,0.96)",
                border: `4px solid ${p.pressed ? "#facc15" : "#ffffff"}`,
                borderRadius: 24,
                padding: "22px 24px",
                boxShadow: p.pressed
                  ? "0 0 32px rgba(250, 204, 21, 0.8), 0 12px 24px rgba(0,0,0,0.3)"
                  : "0 12px 24px rgba(0,0,0,0.28)",
                fontFamily: FONT,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 40 }}>{c.icon}</span>
                <span
                  style={{
                    padding: "4px 14px",
                    borderRadius: 999,
                    backgroundColor: p.pressed ? "#15803d" : "#0f172a",
                    color: "#ffffff",
                    fontSize: 22,
                    fontWeight: 900,
                  }}
                >
                  {c.cnt}
                </span>
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#0f172a", marginTop: 12 }}>
                {c.name}
              </div>
            </div>
          );
        })}
      </div>
      <AnimatedCursor
        waypoints={[
          { t: 0.8, x: 540, y: 420 },
          { t: 2.0, x: 290, y: 520, click: true },
          { t: 4.4, x: 790, y: 520, click: true },
          { t: 6.8, x: 290, y: 710, click: true },
        ]}
      />
    </CameraRig>
  );
};

const Beat05Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const q1 = wordRise(t, 1.1);
  const q2 = wordRise(t, 3.0);
  // Mirrors Ref Video 1 f_07.jpg large white document card + corner Dafeiyu!
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 14, zoom: 0.98 },
        { t: 4.5, x: 0, y: -4, zoom: 1.02 },
        { t: 9.4, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", top: 425, left: 54, right: 54 }}>
        <GlowCard delaySec={0.08} glowColor="rgba(45, 212, 191, 0.6)" padding="34px 36px">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e2e8f0", paddingBottom: 18 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0d9488", fontFamily: "Consolas, monospace" }}>
                books/比尔·盖茨书单/一生的旅程.md
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", marginTop: 6 }}>
                《一生的旅程：迪士尼CEO自述》
              </div>
            </div>
            <span style={{ padding: "8px 18px", borderRadius: 99, backgroundColor: "#ccfbf1", color: "#0f766e", fontSize: 24, fontWeight: 900 }}>
              按章节汇总
            </span>
          </div>

          <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                opacity: q1.op,
                transform: `translateY(${q1.y}px)`,
                padding: "20px 24px",
                borderRadius: 18,
                backgroundColor: "#fefce8",
                border: "3px solid #facc15",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#a16207" }}>### 序言 · 高赞划线</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#dc2626" }}>🔥 5,601 人划线</span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 800, color: "#1e293b", lineHeight: 1.5 }}>
                “我习惯把坏消息当成可以处理和解决的问题，是可以主动掌控的东西。”
              </div>
            </div>

            <div
              style={{
                opacity: q2.op,
                transform: `translateY(${q2.y}px)`,
                padding: "20px 24px",
                borderRadius: 18,
                backgroundColor: "#f0fdfa",
                border: "3px solid #14b8a6",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#0f766e" }}>### 经营哲学 · 高赞划线</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: "#0284c7" }}>🔥 3,876 人划线</span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 800, color: "#1e293b", lineHeight: 1.5 }}>
                “鼓励冒险与创造力，保持深刻持久的好奇心，拥抱变化。”
              </div>
            </div>
          </div>
        </GlowCard>

        <div style={{ marginTop: 26, display: "inline-block" }}>
          <GlowCard delaySec={2.4} glowColor="rgba(250, 204, 21, 0.7)" padding="18px 34px">
            <div style={{ fontSize: 34, fontWeight: 900, color: "#0f172a" }}>
              🔍 简介 + 章节划线 + <span style={{ color: "#d97706" }}>划线热度</span> 全都有
            </div>
          </GlowCard>
        </div>
      </div>
    </CameraRig>
  );
};

const Beat06Stage: React.FC = () => {
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 14, zoom: 0.98 },
        { t: 4.5, x: 0, y: -4, zoom: 1.03 },
        { t: 9.2, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", top: 435, left: 56, right: 56, display: "flex", flexDirection: "column", gap: 28, alignItems: "center" }}>
        <div
          style={{
            width: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.76)",
            borderRadius: 28,
            border: "3px solid rgba(255,255,255,0.35)",
            padding: "32px 30px",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 900, color: "#fde047", textAlign: "center", fontFamily: FONT }}>
            🔥 真实单条金句划线人数排行（README 实测）
          </div>
          <CompareBar
            label="影响力"
            value={28222}
            max={30000}
            displayValue="28,222"
            color="linear-gradient(90deg, #facc15, #f97316)"
            delay={10}
          />
          <CompareBar
            label="生命意义"
            value={22306}
            max={30000}
            displayValue="22,306"
            color="linear-gradient(90deg, #38bdf8, #818cf8)"
            delay={26}
          />
          <CompareBar
            label="梦的解析"
            value={10653}
            max={30000}
            displayValue="10,653"
            color="linear-gradient(90deg, #34d399, #10b981)"
            delay={42}
          />
        </div>
        <StampBadge text="几分钟吸干全书精华！" delay={134} color="#dc2626" rotate={-4} />
      </div>
    </CameraRig>
  );
};

const Beat07Stage: React.FC = () => {
  const pills = ["🔒 仅 238 行代码", "🔒 纯 Go 标准库", "🔒 填 Cookie 增量同步"];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 12, zoom: 0.98 },
        { t: 5.0, x: 0, y: -4, zoom: 1.02 },
        { t: 10.3, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", top: 430, left: 56, right: 56, display: "flex", flexDirection: "column", gap: 26 }}>
        <TerminalBox
          command="wc -l main.go && go run main.go"
          resultLine="✓ 238 lines pure Go -> synced 98 booklists & 2,944 .md files"
          startFrame={10}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {pills.map((p, i) => (
            <GlowCard key={p} delaySec={1.4 + i * 0.5} glowColor="rgba(96, 165, 250, 0.55)" padding="20px 30px" style={{ width: "fit-content" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a" }}>{p}</div>
            </GlowCard>
          ))}
        </div>
      </div>
    </CameraRig>
  );
};

const Beat08Stage: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p1 = pressPulse(t, 3.2);
  const p2 = pressPulse(t, 6.0);
  const steps = [
    { icon: "📦", title: "1. Git Clone 到本地", sub: "2,944 份结构化 Markdown 离线可用", active: true, sc: 1 },
    { icon: "🟣", title: "2. 直接拖进 Obsidian", sub: "秒建个人双链读书知识图谱", active: p1.pressed, sc: p1.scale },
    { icon: "🤖", title: "3. 喂给 AI 当 RAG 知识库", sub: "让大模型结合 2416 本名著精准答疑！", active: p2.pressed, sc: p2.scale },
  ];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 12, zoom: 0.98 },
        { t: 4.8, x: 0, y: -4, zoom: 1.02 },
        { t: 9.8, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", top: 430, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 22 }}>
        {steps.map((s, idx) => (
          <div key={s.title} style={{ transform: `scale(${s.sc})` }}>
            <GlowCard
              delaySec={0.12 + idx * 0.28}
              glowColor={s.active ? "rgba(192, 132, 252, 0.85)" : "rgba(255,255,255,0.3)"}
              style={{
                backgroundColor: s.active ? "#faf5ff" : "rgba(255,255,255,0.92)",
                borderColor: s.active ? "#a855f7" : "#ffffff",
              }}
              padding="24px 30px"
            >
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <span style={{ fontSize: 48 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 34, fontWeight: 900, color: "#0f172a" }}>{s.title}</div>
                  <div style={{ fontSize: 25, fontWeight: 700, color: "#475569", marginTop: 4 }}>{s.sub}</div>
                </div>
              </div>
            </GlowCard>
          </div>
        ))}
      </div>
      <AnimatedCursor
        waypoints={[
          { t: 1.6, x: 540, y: 500 },
          { t: 3.2, x: 540, y: 690, click: true },
          { t: 6.0, x: 540, y: 880, click: true },
        ]}
      />
    </CameraRig>
  );
};

const Beat09Stage: React.FC = () => {
  const badges = ["✅ 无需登录", "✅ 免装客户端", "✅ 497 KB 总目录直达"];
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 12, zoom: 0.98 },
        { t: 4.8, x: 0, y: -4, zoom: 1.02 },
        { t: 9.6, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", top: 430, left: 54, right: 54, display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {badges.map((b, i) => (
            <GlowCard key={b} delaySec={0.1 + i * 0.22} glowColor="rgba(52, 211, 153, 0.6)" padding="14px 24px">
              <span style={{ fontSize: 28, fontWeight: 900, color: "#065f46" }}>{b}</span>
            </GlowCard>
          ))}
        </div>
        <TerminalBox
          command="git clone https://github.com/able8/weread-hot-booklists.git"
          resultLine="✓ Done! 98 booklists / 2,416 books ready offline"
          startFrame={26}
        />
      </div>
    </CameraRig>
  );
};

const Beat10Stage: React.FC = () => {
  return (
    <CameraRig
      keyframes={[
        { t: 0, x: 0, y: 12, zoom: 0.97 },
        { t: 3.5, x: 0, y: -4, zoom: 1.03 },
        { t: 8.0, x: 0, y: 0, zoom: 1.0 },
      ]}
    >
      <div style={{ position: "absolute", top: 445, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
        <GlowCard delaySec={0.08} glowColor="rgba(56, 189, 248, 0.8)" style={{ width: "100%", textAlign: "center" }} padding="38px 32px">
          <div style={{ fontSize: 26, fontWeight: 900, color: "#0284c7", letterSpacing: 1 }}>GITHUB 开源仓库地址</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: "#0f172a", marginTop: 14, fontFamily: "Consolas, monospace" }}>
            github.com/able8/
            <br />
            weread-hot-booklists
          </div>
          <div
            style={{
              marginTop: 22,
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 28px",
              borderRadius: 999,
              backgroundColor: "#fef9c3",
              border: "3px solid #f59e0b",
              fontSize: 30,
              fontWeight: 900,
              color: "#b45309",
            }}
          >
            <span>⭐ 点赞 · 收藏 · 顺手点颗 Star</span>
          </div>
        </GlowCard>
      </div>
    </CameraRig>
  );
};

const STAGE_MAP: Record<number, React.FC> = {
  1: Beat01Stage,
  2: Beat02Stage,
  3: Beat03Stage,
  4: Beat04Stage,
  5: Beat05Stage,
  6: Beat06Stage,
  7: Beat07Stage,
  8: Beat08Stage,
  9: Beat09Stage,
  10: Beat10Stage,
};

const DafeiyuScene: React.FC<{ beat: DafeiyuBeatSpec }> = ({ beat }) => {
  const localFrame = useCurrentFrame();
  const Stage = STAGE_MAP[beat.index];
  const ratio = localFrame / Math.max(1, beat.durationFrames);

  // Pick active bilingual subtitle chunk + compute smooth karaoke gold sweep progress
  let activeIdx = 0;
  for (let i = 0; i < beat.subtitles.length; i++) {
    if (ratio >= beat.subtitles[i].fromRatio) activeIdx = i;
  }
  const chunk = beat.subtitles[activeIdx];
  const nextRatio = beat.subtitles[activeIdx + 1]?.fromRatio ?? 0.95;
  const chunkProg = clamp(
    (ratio - chunk.fromRatio) / Math.max(0.05, nextRatio - chunk.fromRatio),
    0,
    1
  );

  const enterOp = interpolate(localFrame, [0, 5], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: enterOp }}>
      <DynamicBackground variant={beat.bgVariant} accent={beat.accent} secondary={beat.secondary} />
      <DafeiyuAtmosphere />

      <TopProgressBar
        totalSegments={WEREAD_BEATS.length}
        currentSegment={beat.index}
        badgeText="微信读书热门书单"
        title={beat.title}
        titleBg={beat.titleBg}
        watermark="大肥鱼 · 开源雷达"
      />

      {Stage ? <Stage /> : null}

      {/* Soft cyan glow halo behind Dafeiyu chibi */}
      <div
        style={{
          position: "absolute",
          left: beat.placement === "corner" ? undefined : "50%",
          right: beat.placement === "corner" ? 16 : undefined,
          bottom: beat.placement === "corner" ? 210 : 140,
          marginLeft: beat.placement === "corner" ? undefined : -280,
          width: beat.placement === "corner" ? 390 : 560,
          height: beat.placement === "corner" ? 390 : 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56,189,248,0.42) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <CharacterSprite
        src={`characters/dafeiyu-chibi/sprites/${beat.pose}.png`}
        motion={beat.motion}
        placement={beat.placement}
        size={beat.placement === "corner" ? 375 : 640}
        offsetY={beat.placement === "corner" ? 85 : 35}
        dieCut={false}
      />

      <BilingualSubtitle
        styleMode="dafeiyu"
        zh={chunk.zh}
        en={chunk.en}
        highlightProgress={easeOutCubic(chunkProg)}
      />
    </AbsoluteFill>
  );
};

export const WeReadDafeiyu: React.FC = () => {
  return (
    <AbsoluteFill>
      {WEREAD_BEATS.map((beat) => (
        <Sequence
          key={beat.index}
          from={beat.startFrame}
          durationInFrames={beat.durationFrames}
        >
          <DafeiyuScene beat={beat} />
          <Audio src={staticFile(beat.audioFile)} volume={1.0} />
        </Sequence>
      ))}

      {/* Upbeat anime instrumental BGM from go-music-dl (smooth fade in/out, steady 0.11 bed) */}
      <Audio
        src={staticFile("audio/weread/bgm.mp3")}
        loop
        volume={(f) => {
          const fadeIn = interpolate(f, [0, 36], [0, 1], { extrapolateRight: "clamp" });
          const fadeOut = interpolate(
            f,
            [WEREAD_TOTAL_FRAMES - 60, WEREAD_TOTAL_FRAMES],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return 0.11 * fadeIn * fadeOut;
        }}
      />

      <SfxTrack cues={WEREAD_SFX_CUES} />
    </AbsoluteFill>
  );
};
