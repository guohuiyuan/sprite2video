import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { BilingualSubtitle } from "../components/BilingualSubtitle";
import { CharacterSprite } from "../components/CharacterSprite";
import { DynamicBackground } from "../components/DynamicBackground";
import { CompareBar, CountUpCard, StampBadge, TerminalBox } from "../components/MotionWidgets";
import { SfxTrack, type SfxCue } from "../components/SfxTrack";
import { TopProgressBar } from "../components/TopProgressBar";

const SCENE_LEN = 90; // 3s per demo scene @ 30fps

export const VerticalDafeiyuDemo: React.FC = () => {
  const sfxCues: SfxCue[] = [
    { frame: 4, sound: "pop" },
    { frame: 26, sound: "ding" },
    { frame: SCENE_LEN, sound: "whoosh" },
    { frame: SCENE_LEN + 24, sound: "stamp" },
    { frame: SCENE_LEN * 2, sound: "whoosh" },
    { frame: SCENE_LEN * 2 + 12, sound: "tick" },
    { frame: SCENE_LEN * 2 + 56, sound: "sparkle" },
  ];

  return (
    <AbsoluteFill>
      <Series>
        {/* Scene 1: 数据亮眼 + 开心指点 */}
        <Series.Sequence durationInFrames={SCENE_LEN}>
          <DynamicBackground variant="sunburst" accent="#4338ca" secondary="#1e1b4b" />
          <TopProgressBar
            totalSegments={3}
            currentSegment={1}
            badgeText="贴图代码视频"
            title="动效+贴图才不单调"
            titleBg="linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)"
          />
          <div
            style={{
              position: "absolute",
              top: 410,
              left: 72,
              right: 72,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <CountUpCard target={12} suffix=" 套" label="统一透明角色表情" delay={6} accent="#2563eb" />
            <CountUpCard target={7} suffix=" 种" label="帧级防撞车音效" delay={18} accent="#ea580c" />
          </div>
          <CharacterSprite
            src="characters/demo-chibi/sprites/happy_point.png"
            motion="bounce_happy"
            placement="bottom"
            size={600}
          />
          <BilingualSubtitle
            zh="单靠代码动画太单调，配上角色贴图库立马活了！"
            en="Code motion comes alive with a consistent character sprite pack!"
          />
        </Series.Sequence>

        {/* Scene 2: 痛点对比 + 吐槽握拳 + 盖章 */}
        <Series.Sequence durationInFrames={SCENE_LEN}>
          <DynamicBackground variant="grid3d" accent="#b91c1c" secondary="#450a0a" />
          <TopProgressBar
            totalSegments={3}
            currentSegment={2}
            badgeText="贴图代码视频"
            title="拒绝脸崩和白边"
            titleBg="linear-gradient(135deg, #dc2626 0%, #f97316 100%)"
          />
          <div
            style={{
              position: "absolute",
              top: 430,
              left: 64,
              right: 64,
              display: "flex",
              flexDirection: "column",
              gap: 28,
              alignItems: "center",
            }}
          >
            <CompareBar
              label="盲抽单图"
              value={35}
              max={100}
              displayValue="35%"
              color="#94a3b8"
              delay={6}
            />
            <CompareBar
              label="网格+锁Seed"
              value={96}
              max={100}
              displayValue="96%"
              color="linear-gradient(90deg, #facc15, #f97316)"
              delay={12}
            />
            <div style={{ marginTop: 18 }}>
              <StampBadge text="零白边！" delay={24} color="#ef4444" />
            </div>
          </div>
          <CharacterSprite
            src="characters/demo-chibi/sprites/angry_fist.png"
            motion="shake_angry"
            placement="bottom"
            size={590}
          />
          <BilingualSubtitle
            zh="外围泛洪去背+锚点对齐，切表情绝不乱跳！"
            en="Floodfill matting + bottom anchoring keeps every pose rock-steady!"
          />
        </Series.Sequence>

        {/* Scene 3: 终端命令 + 角落避让模式 */}
        <Series.Sequence durationInFrames={SCENE_LEN}>
          <DynamicBackground variant="coderain" accent="#0f766e" secondary="#042f2e" />
          <TopProgressBar
            totalSegments={3}
            currentSegment={3}
            badgeText="贴图代码视频"
            title="台词自动触发动作"
            titleBg="linear-gradient(135deg, #059669 0%, #14b8a6 100%)"
          />
          <div style={{ position: "absolute", top: 440, left: 64, right: 64 }}>
            <TerminalBox
              command="python match_script.py --script demo.txt"
              resultLine="✓ matched 12 beats -> sprites + motion + sfx"
              startFrame={8}
            />
          </div>
          <CharacterSprite
            src="characters/demo-chibi/sprites/wave_happy.png"
            motion="pop_in"
            placement="corner"
            size={410}
          />
          <BilingualSubtitle
            zh="像 QQ 秀一样读台词自动选动作，一键渲染成片！"
            en="Auto-routes poses & SFX from your script, then renders to MP4!"
          />
        </Series.Sequence>
      </Series>
      <SfxTrack cues={sfxCues} />
    </AbsoluteFill>
  );
};
