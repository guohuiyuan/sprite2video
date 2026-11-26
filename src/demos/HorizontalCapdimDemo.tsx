import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { BilingualSubtitle } from "../components/BilingualSubtitle";
import { CharacterSprite } from "../components/CharacterSprite";
import { DynamicBackground } from "../components/DynamicBackground";
import { StampBadge, TerminalBox } from "../components/MotionWidgets";
import { SfxTrack, type SfxCue } from "../components/SfxTrack";
import { BottomChapterBar } from "../components/TopProgressBar";

const SCENE_LEN = 90;
const CHAPTERS = ["为什么加贴图", "一致性怎么解", "台词驱动反应", "收官"];

export const HorizontalCapdimDemo: React.FC = () => {
  const sfxCues: SfxCue[] = [
    { frame: 4, sound: "pop" },
    { frame: SCENE_LEN, sound: "whoosh" },
    { frame: SCENE_LEN + 18, sound: "thud" },
    { frame: SCENE_LEN * 2, sound: "whoosh" },
    { frame: SCENE_LEN * 2 + 42, sound: "sparkle" },
  ];

  return (
    <AbsoluteFill>
      <DynamicBackground variant="paper" />
      <Series>
        {/* Chapter 0: Intro card + curious sprite */}
        <Series.Sequence durationInFrames={SCENE_LEN}>
          <div
            style={{
              position: "absolute",
              left: 110,
              top: 150,
              width: 920,
              backgroundColor: "#ffffff",
              border: "3px solid #27272a",
              borderRadius: 20,
              padding: "46px 52px",
              boxShadow: "10px 10px 0 rgba(24,24,27,0.16)",
              fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: "#b45309", marginBottom: 14 }}>
              CHAPTER 01 · 说点实话
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: "#18181b", lineHeight: 1.25 }}>
              纯代码动画看十秒就腻，
              <br />
              缺的是“情绪锚点”
            </div>
            <div style={{ marginTop: 26, fontSize: 30, color: "#52525b", lineHeight: 1.6 }}>
              把同一套透明角色贴图库交给台词路由，讲文章、讲开源项目立刻有了人味。
            </div>
          </div>
          <CharacterSprite
            src="characters/demo-chibi/sprites/thinking.png"
            motion="nod"
            placement="right"
            size={640}
          />
          <BilingualSubtitle
            styleMode="capdim"
            zh="很多 AI 代码视频像流水线 PPT，因为画面里没有一个能接住情绪的角色。"
          />
          <BottomChapterBar chapters={CHAPTERS} activeIndex={0} />
        </Series.Sequence>

        {/* Chapter 1: Shocked reaction + stamp */}
        <Series.Sequence durationInFrames={SCENE_LEN}>
          <div
            style={{
              position: "absolute",
              left: 110,
              top: 170,
              width: 920,
              display: "flex",
              flexDirection: "column",
              gap: 28,
              fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
            }}
          >
            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "3px solid #92400e",
                borderRadius: 18,
                padding: "36px 44px",
                fontSize: 38,
                fontWeight: 800,
                color: "#27272a",
                lineHeight: 1.45,
              }}
            >
              实测纯文生图：用「2×2 网格 + 锁 DNA/Seed」，
              发饰、瞳色、校服纽扣全都稳得一批！
            </div>
            <div>
              <StampBadge text="一套贴图反复复用" delay={16} color="#dc2626" rotate={-4} />
            </div>
          </div>
          <CharacterSprite
            src="characters/demo-chibi/sprites/shocked_fist.png"
            motion="shake_angry"
            placement="right"
            size={640}
          />
          <BilingualSubtitle
            styleMode="capdim"
            zh="难绷的是，其实只要 12 张透明底差分图，就能撑起整期视频 80% 的镜头！"
          />
          <BottomChapterBar chapters={CHAPTERS} activeIndex={1} />
        </Series.Sequence>

        {/* Chapter 2: Terminal workflow + happy wave */}
        <Series.Sequence durationInFrames={SCENE_LEN}>
          <div style={{ position: "absolute", left: 110, top: 210, width: 960 }}>
            <TerminalBox
              command="python generate_pack.py --mode grid_2x2 && python process_sprites.py"
              resultLine="✓ 12 transparent PNGs + contact-sheet.png + manifest.json"
              startFrame={6}
            />
          </div>
          <CharacterSprite
            src="characters/demo-chibi/sprites/wave_happy.png"
            motion="bounce_happy"
            placement="right"
            size={640}
          />
          <BilingualSubtitle
            styleMode="capdim"
            zh="从文案或 GitHub 仓库出发，贴图、动效、音效一套流水线全自动对齐。"
          />
          <BottomChapterBar chapters={CHAPTERS} activeIndex={2} />
        </Series.Sequence>
      </Series>
      <SfxTrack cues={sfxCues} />
    </AbsoluteFill>
  );
};
