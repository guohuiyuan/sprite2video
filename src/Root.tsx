import React from "react";
import { Composition, Still } from "remotion";
import { BilibiliCover } from "./components/BilibiliCover";
import { HorizontalCapdimDemo } from "./demos/HorizontalCapdimDemo";
import { VerticalDafeiyuDemo } from "./demos/VerticalDafeiyuDemo";
import { WeReadDafeiyu } from "./videos/WeReadDafeiyu";
import { WellSpokenEvilNeuro } from "./videos/WellSpokenEvilNeuro";
import { WELL_SPOKEN_FPS, WELL_SPOKEN_TOTAL_FRAMES } from "./videos/wellSpokenData";
import { WEREAD_FPS, WEREAD_TOTAL_FRAMES } from "./videos/wereadData";

const WELL_SPOKEN_COVER_PROPS = {
  eyebrow: "别再练口才了！90%的人只是热搜复读机？",
  titleLine1: "嘴笨真不是词穷",
  titleHighlight: "5招逆袭",
  titleSuffix: "好口才",
  takeaways: ["2套万能说话框架", "冷场救命话术", "社恐→400人演讲"],
  mainSprite: "characters/evil-neuro-chibi/sprites/smug_wink.png",
  accentSprite: "characters/evil-neuro-chibi/sprites/shocked_fist.png",
  cornerBadge: "Evil_Neuro_CN 配音 · 看完直接套用",
  theme: "capdim" as const,
};

const WEREAD_COVER_PROPS = {
  eyebrow: "GitHub 1.0k Stars · 238行纯Go神库",
  titleLine1: "98个微信读书榜",
  titleHighlight: "2416本",
  titleSuffix: "全变MD",
  takeaways: ["2.8万人高赞划线", "直接喂AI当RAG库", "一行git clone搬回家"],
  mainSprite: "characters/dafeiyu-chibi/sprites/celebrate_star.png",
  accentSprite: "characters/dafeiyu-chibi/sprites/detective_glass.png",
  cornerBadge: "大肥鱼配音 · able8/weread-hot-booklists",
  theme: "dafeiyu" as const,
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WeReadDafeiyu"
        component={WeReadDafeiyu}
        durationInFrames={WEREAD_TOTAL_FRAMES}
        fps={WEREAD_FPS}
        width={1080}
        height={1920}
      />
      <Still
        id="WeReadCover16x9"
        component={BilibiliCover}
        width={1920}
        height={1080}
        defaultProps={WEREAD_COVER_PROPS}
      />
      <Still
        id="WeReadCover4x3"
        component={BilibiliCover}
        width={1440}
        height={1080}
        defaultProps={WEREAD_COVER_PROPS}
      />
      <Still
        id="WeReadCover3x4"
        component={BilibiliCover}
        width={1080}
        height={1440}
        defaultProps={WEREAD_COVER_PROPS}
      />
      <Composition
        id="WellSpokenEvilNeuro"
        component={WellSpokenEvilNeuro}
        durationInFrames={WELL_SPOKEN_TOTAL_FRAMES}
        fps={WELL_SPOKEN_FPS}
        width={1920}
        height={1080}
      />
      <Still
        id="WellSpokenCover16x9"
        component={BilibiliCover}
        width={1920}
        height={1080}
        defaultProps={WELL_SPOKEN_COVER_PROPS}
      />
      <Still
        id="WellSpokenCover4x3"
        component={BilibiliCover}
        width={1440}
        height={1080}
        defaultProps={WELL_SPOKEN_COVER_PROPS}
      />
      <Still
        id="WellSpokenCover3x4"
        component={BilibiliCover}
        width={1080}
        height={1440}
        defaultProps={WELL_SPOKEN_COVER_PROPS}
      />
      <Composition
        id="VerticalDafeiyuDemo"
        component={VerticalDafeiyuDemo}
        durationInFrames={270}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="HorizontalCapdimDemo"
        component={HorizontalCapdimDemo}
        durationInFrames={270}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
