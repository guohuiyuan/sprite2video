import type { BackgroundVariant, MotionPreset, SpritePlacement } from "../types/storyboard";
import type { SfxCue } from "../components/SfxTrack";

export const WEREAD_FPS = 30;
export const WEREAD_TOTAL_FRAMES = 2895; // 2865 VO + 30f graceful outro hold

export interface BilingualChunk {
  zh: string;
  en: string;
  fromRatio: number;
}

export interface DafeiyuBeatSpec {
  index: number; // 1..10
  startFrame: number;
  durationFrames: number;
  audioFile: string;
  title: string;
  bgVariant: BackgroundVariant;
  accent: string;
  secondary: string;
  titleBg: string;
  pose: string;
  placement: SpritePlacement;
  motion: MotionPreset;
  subtitles: BilingualChunk[];
}

export const WEREAD_BEATS: DafeiyuBeatSpec[] = [
  {
    index: 1,
    startFrame: 0,
    durationFrames: 277,
    audioFile: "audio/weread/vo/beat_01.mp3",
    title: "开源项目",
    bgVariant: "sunburst",
    accent: "#0284c7",
    secondary: "#082f49",
    titleBg: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
    pose: "celebrate_star",
    placement: "bottom",
    motion: "bounce_happy",
    subtitles: [
      {
        zh: "GitHub 又出狠活！98 个微信读书书单、",
        en: "Another GitHub gem: 98 WeRead hot booklists,",
        fromRatio: 0,
      },
      {
        zh: "2416 本好书划线全变 Markdown，斩获 1.0k Stars！",
        en: "2,416 books turned into Markdown — 1.0k Stars!",
        fromRatio: 0.44,
      },
    ],
  },
  {
    index: 2,
    startFrame: 277,
    durationFrames: 207,
    audioFile: "audio/weread/vo/beat_02.mp3",
    title: "选书痛点",
    bgVariant: "grid3d",
    accent: "#b91c1c",
    secondary: "#450a0a",
    titleBg: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
    pose: "sigh_facepalm",
    placement: "bottom",
    motion: "nod",
    subtitles: [
      {
        zh: "平时想找好书，翻半天榜单也不知道哪本真值得读，",
        en: "Hard to pick truly great books from endless lists,",
        fromRatio: 0,
      },
      {
        zh: "买了书还经常吃灰。",
        en: "and bought books often just gather dust.",
        fromRatio: 0.65,
      },
    ],
  },
  {
    index: 3,
    startFrame: 484,
    durationFrames: 326,
    audioFile: "audio/weread/vo/beat_03.mp3",
    title: "一库全收",
    bgVariant: "sunburst",
    accent: "#4338ca",
    secondary: "#1e1b4b",
    titleBg: "linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)",
    pose: "wave_happy",
    placement: "bottom",
    motion: "bounce_happy",
    subtitles: [
      {
        zh: "这个叫 weread-hot-booklists 的开源仓库，",
        en: "This open-source repo weread-hot-booklists,",
        fromRatio: 0,
      },
      {
        zh: "直接把微信读书最火的 98 个书单、2944 份笔记全打包好了。",
        en: "packs 98 top WeRead lists and 2,944 book notes.",
        fromRatio: 0.46,
      },
    ],
  },
  {
    index: 4,
    startFrame: 810,
    durationFrames: 355,
    audioFile: "audio/weread/vo/beat_04.mp3",
    title: "豪华分类",
    bgVariant: "spectrum",
    accent: "#15803d",
    secondary: "#052e16",
    titleBg: "linear-gradient(135deg, #16a34a 0%, #4ade80 100%)",
    pose: "curious",
    placement: "bottom",
    motion: "float_idle",
    subtitles: [
      {
        zh: "从 300 本英文原版、88 本投资理财，",
        en: "From 300 English classics & 88 investing books,",
        fromRatio: 0,
      },
      {
        zh: "到 76 本牛津通识、58 本茅盾文学奖和比尔盖茨书单，一点直达！",
        en: "to Oxford VSI, Mao Dun Prize & Bill Gates' list!",
        fromRatio: 0.42,
      },
    ],
  },
  {
    index: 5,
    startFrame: 1165,
    durationFrames: 289,
    audioFile: "audio/weread/vo/beat_05.mp3",
    title: "高赞精华",
    bgVariant: "sunburst",
    accent: "#0f766e",
    secondary: "#042f2e",
    titleBg: "linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)",
    pose: "detective_glass",
    placement: "corner",
    motion: "pop_in",
    subtitles: [
      {
        zh: "最香的是点进任意一本书，不只有书籍简介，",
        en: "Open any book for not just its summary,",
        fromRatio: 0,
      },
      {
        zh: "还按章节汇总了全书高赞读者划线和实时划线人数。",
        en: "but chapter-by-chapter top reader highlights & counts.",
        fromRatio: 0.48,
      },
    ],
  },
  {
    index: 6,
    startFrame: 1454,
    durationFrames: 284,
    audioFile: "audio/weread/vo/beat_06.mp3",
    title: "万人共识",
    bgVariant: "grid3d",
    accent: "#c2410c",
    secondary: "#431407",
    titleBg: "linear-gradient(135deg, #ea580c 0%, #facc15 100%)",
    pose: "shocked_fist",
    placement: "bottom",
    motion: "shake_angry",
    subtitles: [
      {
        zh: "比如《影响力》单条核心规律就有两万八千人划线，",
        en: "A single highlight in Influence hits 28,222 readers,",
        fromRatio: 0,
      },
      {
        zh: "《活出生命的意义》破两万二，几分钟吸干全书精华！",
        en: "Man's Search for Meaning tops 22k — pure distilled gold!",
        fromRatio: 0.48,
      },
    ],
  },
  {
    index: 7,
    startFrame: 1738,
    durationFrames: 317,
    audioFile: "audio/weread/vo/beat_07.mp3",
    title: "硬核源码",
    bgVariant: "coderain",
    accent: "#1d4ed8",
    secondary: "#0f172a",
    titleBg: "linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)",
    pose: "typing_laptop",
    placement: "corner",
    motion: "float_idle",
    subtitles: [
      {
        zh: "更硬核的是，抓取脚本 main.go 只有 238 行纯 Go 代码，",
        en: "Even cleaner: main.go is just 238 lines of pure Go,",
        fromRatio: 0,
      },
      {
        zh: "零外部框架，自己填入 Cookie 就能随时增量更新。",
        en: "zero frameworks — add your cookie to sync anytime.",
        fromRatio: 0.50,
      },
    ],
  },
  {
    index: 8,
    startFrame: 2055,
    durationFrames: 300,
    audioFile: "audio/weread/vo/beat_08.mp3",
    title: "AI 知识库",
    bgVariant: "spectrum",
    accent: "#6d28d9",
    secondary: "#2e1065",
    titleBg: "linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)",
    pose: "smug_wink",
    placement: "bottom",
    motion: "bounce_happy",
    subtitles: [
      {
        zh: "玩法还不止在线看：一键克隆到本地，",
        en: "Not just for browsing: clone it locally,",
        fromRatio: 0,
      },
      {
        zh: "拖进 Obsidian 或喂给 AI 当 RAG 知识库，结合名著回答你！",
        en: "drop into Obsidian or feed an AI RAG knowledge base!",
        fromRatio: 0.42,
      },
    ],
  },
  {
    index: 9,
    startFrame: 2355,
    durationFrames: 294,
    audioFile: "audio/weread/vo/beat_09.mp3",
    title: "一行上手",
    bgVariant: "coderain",
    accent: "#047857",
    secondary: "#022c22",
    titleBg: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
    pose: "thinking",
    placement: "corner",
    motion: "nod",
    subtitles: [
      {
        zh: "不用登录、不装客户端，打开 497 KB 总目录就能直接看，",
        en: "No login, no app — browse the 497 KB master index,",
        fromRatio: 0,
      },
      {
        zh: "一行 git clone 把整座数字图书馆搬回家。",
        en: "or run one git clone to own the entire library.",
        fromRatio: 0.54,
      },
    ],
  },
  {
    index: 10,
    startFrame: 2649,
    durationFrames: 246, // 216 + 30 outro hold
    audioFile: "audio/weread/vo/beat_10.mp3",
    title: "开源安利",
    bgVariant: "sunburst",
    accent: "#0284c7",
    secondary: "#082f49",
    titleBg: "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
    pose: "salute_bye",
    placement: "bottom",
    motion: "bounce_happy",
    subtitles: [
      {
        zh: "项目地址打在屏幕上了，觉得实用记得点赞收藏，",
        en: "Repo link is right on screen — like & bookmark,",
        fromRatio: 0,
      },
      {
        zh: "别忘了去 GitHub 给作者点颗免费的 Star！",
        en: "and drop a free Star on GitHub!",
        fromRatio: 0.54,
      },
    ],
  },
];

export const WEREAD_SFX_CUES: SfxCue[] = [
  // Beat 1: Opening hook
  { frame: 4, sound: "mallet" },
  { frame: 48, sound: "sparkle" },
  { frame: 138, sound: "ding" },
  // Beat 2: Pain point
  { frame: 277, sound: "whoosh" },
  { frame: 277 + 20, sound: "thud" },
  { frame: 277 + 110, sound: "stamp" },
  // Beat 3: Stats count-up
  { frame: 484, sound: "mallet" },
  { frame: 484 + 26, sound: "pop" },
  { frame: 484 + 78, sound: "ding" },
  // Beat 4: Cursor clicks 3 booklist cards (local t = 2.0s, 4.4s, 6.8s)
  { frame: 810, sound: "whoosh" },
  { frame: 810 + 60, sound: "click" },
  { frame: 810 + 132, sound: "click" },
  { frame: 810 + 204, sound: "click" },
  // Beat 5: Markdown note preview
  { frame: 1165, sound: "mallet" },
  { frame: 1165 + 42, sound: "pop" },
  { frame: 1165 + 140, sound: "ding" },
  // Beat 6: 28,222 & 22,306 leaderboard shock
  { frame: 1454, sound: "whoosh" },
  { frame: 1454 + 24, sound: "thud" },
  { frame: 1454 + 138, sound: "stamp" },
  // Beat 7: main.go 238 lines pure Go
  { frame: 1738, sound: "mallet" },
  { frame: 1738 + 30, sound: "tick" },
  { frame: 1738 + 90, sound: "tick" },
  { frame: 1738 + 165, sound: "ding" },
  // Beat 8: AI RAG pipeline cursor click (local t = 3.2s, 6.0s)
  { frame: 2055, sound: "whoosh" },
  { frame: 2055 + 96, sound: "click" },
  { frame: 2055 + 180, sound: "click" },
  { frame: 2055 + 210, sound: "sparkle" },
  // Beat 9: git clone terminal
  { frame: 2355, sound: "mallet" },
  { frame: 2355 + 36, sound: "tick" },
  { frame: 2355 + 148, sound: "ding" },
  // Beat 10: Outro Star CTA
  { frame: 2649, sound: "whoosh" },
  { frame: 2649 + 36, sound: "sparkle" },
  { frame: 2649 + 148, sound: "chime" },
];
