import React from "react";
import { Composition, Still } from "remotion";
import { BilibiliCover } from "./components/BilibiliCover";
import { HorizontalCapdimDemo } from "./demos/HorizontalCapdimDemo";
import { VerticalDafeiyuDemo } from "./demos/VerticalDafeiyuDemo";
import { WellSpokenEvilNeuro } from "./videos/WellSpokenEvilNeuro";
import { WELL_SPOKEN_FPS, WELL_SPOKEN_TOTAL_FRAMES } from "./videos/wellSpokenData";

const WELL_SPOKEN_COVER_PROPS = {
  eyebrow: "别再练口才了！90%的人只是热搜复读机？",
  titleLine1: "嘴笨真不是词穷",
  titleHighlight: "5招逆袭",
  titleSuffix: "好口才",
  takeaways: ["2套万能说话框架", "冷场救命话术", "社恐→400人演讲"],
  mainSprite: "characters/evil-neuro-chibi/sprites/smug_wink.png",
  accentSprite: "characters/evil-neuro-chibi/sprites/shocked_fist.png",
  cornerBadge: "Evil_Neuro_CN 配音 · 看完直接套用",
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
