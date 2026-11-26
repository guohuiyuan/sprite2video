import type { MotionPreset, SfxName, SpritePlacement } from "../types/storyboard";
import type { SfxCue } from "../components/SfxTrack";

export const WELL_SPOKEN_FPS = 30;
export const WELL_SPOKEN_TOTAL_FRAMES = 4931; // 4901 VO frames + 30f graceful outro hold

export const CHAPTERS = [
  "开场",
  "建思想库",
  "写清楚",
  "留白独处",
  "不怕冷场",
  "掌控停顿",
  "两大框架",
  "收官",
] as const;

export interface SubChunk {
  text: string;
  /** Fraction [0..1] of beat duration when this chunk starts */
  fromRatio: number;
}

export interface BeatSpec {
  index: number;
  chapterIndex: number;
  startFrame: number;
  durationFrames: number;
  audioFile: string;
  subtitles: SubChunk[];
  pose: string;
  placement: SpritePlacement;
  motion: MotionPreset;
  flipX?: boolean;
}

export const BEATS: BeatSpec[] = [
  {
    index: 1,
    chapterIndex: 0,
    startFrame: 0,
    durationFrames: 182,
    audioFile: "audio/well-spoken/vo/beat_01.mp3",
    subtitles: [
      { text: "这世上最危险的超能力，其实不是高智商，", fromRatio: 0 },
      { text: "而是把话说得极度清晰动人。", fromRatio: 0.56 },
    ],
    pose: "smug_wink",
    placement: "right",
    motion: "bounce_happy",
  },
  {
    index: 2,
    chapterIndex: 0,
    startFrame: 182,
    durationFrames: 218,
    audioFile: "audio/well-spoken/vo/beat_02.mp3",
    subtitles: [
      { text: "只要你能准确表达观点，", fromRatio: 0 },
      { text: "不管是拿大厂 Offer、找伴侣还是签客户，几乎无往不利。", fromRatio: 0.34 },
    ],
    pose: "celebrate_star",
    placement: "right",
    motion: "float_idle",
  },
  {
    index: 3,
    chapterIndex: 0,
    startFrame: 400,
    durationFrames: 238,
    audioFile: "audio/well-spoken/vo/beat_03.mp3",
    subtitles: [
      { text: "作者从小学到七年级，一上台自我介绍就社恐大哭，", fromRatio: 0 },
      { text: "甚至几周不跟人说话。", fromRatio: 0.64 },
    ],
    pose: "shocked_fist",
    placement: "left",
    motion: "shake_angry",
  },
  {
    index: 4,
    chapterIndex: 0,
    startFrame: 638,
    durationFrames: 235,
    audioFile: "audio/well-spoken/vo/beat_04.mp3",
    subtitles: [
      { text: "可如今他站上 400 人演讲台、攒下 52,000 粉丝，", fromRatio: 0 },
      { text: "全靠这 5 个可复制的表达策略！", fromRatio: 0.56 },
    ],
    pose: "wave_happy",
    placement: "right",
    motion: "bounce_happy",
  },
  {
    index: 5,
    chapterIndex: 1,
    startFrame: 873,
    durationFrames: 197,
    audioFile: "audio/well-spoken/vo/beat_05.mp3",
    subtitles: [
      { text: "先说底层前提：你的表达深度，", fromRatio: 0 },
      { text: "永远不可能超过你的思考深度。", fromRatio: 0.50 },
    ],
    pose: "thinking",
    placement: "right",
    motion: "nod",
  },
  {
    index: 6,
    chapterIndex: 1,
    startFrame: 1070,
    durationFrames: 273,
    audioFile: "audio/well-spoken/vo/beat_06.mp3",
    subtitles: [
      { text: "和大多数人聊天，", fromRatio: 0 },
      { text: "你其实是在跟他们刷过的热搜、新闻和网络热梗对话。", fromRatio: 0.28 },
    ],
    pose: "sigh_facepalm",
    placement: "left",
    motion: "nod",
  },
  {
    index: 7,
    chapterIndex: 1,
    startFrame: 1343,
    durationFrames: 182,
    audioFile: "audio/well-spoken/vo/beat_07.mp3",
    subtitles: [
      { text: "你嘴笨，真不是词汇量不够，", fromRatio: 0 },
      { text: "而是你压根没把想说的话彻底想明白。", fromRatio: 0.45 },
    ],
    pose: "deadpan_hips",
    placement: "right",
    motion: "float_idle",
  },
  {
    index: 8,
    chapterIndex: 1,
    startFrame: 1525,
    durationFrames: 261,
    audioFile: "audio/well-spoken/vo/beat_08.mp3",
    subtitles: [
      { text: "怎么逼自己深度思考？答案是写作，", fromRatio: 0 },
      { text: "把你的 5 到 9 个核心观点反复打磨成专属弹药库！", fromRatio: 0.44 },
    ],
    pose: "typing_laptop",
    placement: "left",
    motion: "pop_in",
  },
  {
    index: 9,
    chapterIndex: 2,
    startFrame: 1786,
    durationFrames: 291,
    audioFile: "audio/well-spoken/vo/beat_09.mp3",
    subtitles: [
      { text: "第一招：为了清晰而写作。", fromRatio: 0 },
      { text: "说话不过是把脑子里的想法念出来，写作则是安全演练场。", fromRatio: 0.34 },
    ],
    pose: "typing_laptop",
    placement: "right",
    motion: "float_idle",
  },
  {
    index: 10,
    chapterIndex: 2,
    startFrame: 2077,
    durationFrames: 226,
    audioFile: "audio/well-spoken/vo/beat_10.mp3",
    subtitles: [
      { text: "别写成流水账日记，", fromRatio: 0 },
      { text: "去把你的观点、经历和判断放到聚光灯下解剖、验证。", fromRatio: 0.32 },
    ],
    pose: "detective_glass",
    placement: "left",
    motion: "pop_in",
  },
  {
    index: 11,
    chapterIndex: 3,
    startFrame: 2303,
    durationFrames: 278,
    audioFile: "audio/well-spoken/vo/beat_11.mp3",
    subtitles: [
      { text: "第二招：学会在安静里独处。", fromRatio: 0 },
      { text: "如果大脑整天塞满信息流，好想法根本没空间浮出来。", fromRatio: 0.35 },
    ],
    pose: "reject_wave",
    placement: "right",
    motion: "shake_angry",
  },
  {
    index: 12,
    chapterIndex: 3,
    startFrame: 2581,
    durationFrames: 222,
    audioFile: "audio/well-spoken/vo/beat_12.mp3",
    subtitles: [
      { text: "绝妙点子总在洗澡、跑步或睡前冒出来——", fromRatio: 0 },
      { text: "每天给自己留一块独处时间。", fromRatio: 0.56 },
    ],
    pose: "curious",
    placement: "left",
    motion: "float_idle",
  },
  {
    index: 13,
    chapterIndex: 4,
    startFrame: 2803,
    durationFrames: 276,
    audioFile: "audio/well-spoken/vo/beat_13.mp3",
    subtitles: [
      { text: "第三招：跟「冷场」交朋友。", fromRatio: 0 },
      { text: "对话只要安静两秒，大脑就拉警报，嘴巴抢跑自然结巴。", fromRatio: 0.34 },
    ],
    pose: "shocked_fist",
    placement: "right",
    motion: "shake_angry",
  },
  {
    index: 14,
    chapterIndex: 4,
    startFrame: 3079,
    durationFrames: 236,
    audioFile: "audio/well-spoken/vo/beat_14.mp3",
    subtitles: [
      { text: "其实冷场并不可怕：直接说「我想两秒」，", fromRatio: 0 },
      { text: "或者把对方的问题反问一遍，顺便理清思路。", fromRatio: 0.48 },
    ],
    pose: "thinking",
    placement: "left",
    motion: "nod",
  },
  {
    index: 15,
    chapterIndex: 4,
    startFrame: 3315,
    durationFrames: 226,
    audioFile: "audio/well-spoken/vo/beat_15.mp3",
    subtitles: [
      { text: "要是真没想法，大方承认「我不知道」反而更显聪明，", fromRatio: 0 },
      { text: "因为你知道自己认知的边界在哪。", fromRatio: 0.56 },
    ],
    pose: "smug_wink",
    placement: "right",
    motion: "bounce_happy",
  },
  {
    index: 16,
    chapterIndex: 5,
    startFrame: 3541,
    durationFrames: 277,
    audioFile: "audio/well-spoken/vo/beat_16.mp3",
    subtitles: [
      { text: "第四招：主动掌控停顿。", fromRatio: 0 },
      { text: "二倍速、四倍速刷视频的时代，大家早就忘了停顿有多值钱。", fromRatio: 0.32 },
    ],
    pose: "deadpan_hips",
    placement: "left",
    motion: "float_idle",
  },
  {
    index: 17,
    chapterIndex: 5,
    startFrame: 3818,
    durationFrames: 240,
    audioFile: "audio/well-spoken/vo/beat_17.mp3",
    subtitles: [
      { text: "在关键金句前故意停一下，既说明你珍惜每个词，", fromRatio: 0 },
      { text: "也能瞬间把全场的注意力拉回你身上。", fromRatio: 0.52 },
    ],
    pose: "detective_glass",
    placement: "right",
    motion: "pop_in",
  },
  {
    index: 18,
    chapterIndex: 6,
    startFrame: 4058,
    durationFrames: 289,
    audioFile: "audio/well-spoken/vo/beat_18.mp3",
    subtitles: [
      { text: "第五招：用结构框架当大脑的辅助轮，", fromRatio: 0 },
      { text: "最管用的就两套：宗师三段论和微故事框架。", fromRatio: 0.44 },
    ],
    pose: "curious",
    placement: "right",
    motion: "pop_in",
  },
  {
    index: 19,
    chapterIndex: 6,
    startFrame: 4347,
    durationFrames: 296,
    audioFile: "audio/well-spoken/vo/beat_19.mp3",
    subtitles: [
      { text: "宗师三段论：论点、逻辑、例子；", fromRatio: 0 },
      { text: "微故事则是：痛点、放大低谷、给解法。", fromRatio: 0.52 },
    ],
    pose: "smug_wink",
    placement: "corner",
    motion: "bounce_happy",
  },
  {
    index: 20,
    chapterIndex: 7,
    startFrame: 4643,
    durationFrames: 288, // 258 + 30 outro hold
    audioFile: "audio/well-spoken/vo/beat_20.mp3",
    subtitles: [
      { text: "把这五块积木拼进日常，公开发声打磨观点，", fromRatio: 0 },
      { text: "下一个出口成章的狠人就是你！", fromRatio: 0.54 },
    ],
    pose: "salute_bye",
    placement: "right",
    motion: "bounce_happy",
  },
];

/**
 * Action-bound SFX timeline (inspired by Cuongyd196/remotion-cuongit-template):
 * - mallet: chapter transitions
 * - click: strictly synchronized to AnimatedCursor clicks & UI toggle hits
 * - pop / tick / ding / stamp / thud / sparkle / chime: synchronized to visual peaks
 */
export const SFX_CUES: SfxCue[] = [
  // Ch 0: Opening
  { frame: 4, sound: "mallet" },
  { frame: 36, sound: "sparkle" },
  // Beat 2: Cursor clicks 4 life-unlock chips at local t = 1.2s, 2.5s, 3.8s, 5.1s
  { frame: 182 + 36, sound: "click" },
  { frame: 182 + 75, sound: "click" },
  { frame: 182 + 114, sound: "click" },
  { frame: 182 + 153, sound: "click" },
  // Beat 3: Social anxiety shock
  { frame: 400 + 8, sound: "thud" },
  { frame: 400 + 78, sound: "tick" },
  // Beat 4: 400+ & 52,000 glow-up + stamp
  { frame: 638 + 10, sound: "pop" },
  { frame: 638 + 65, sound: "ding" },
  { frame: 638 + 126, sound: "stamp" },

  // Ch 1: Knowledge Base
  { frame: 873, sound: "mallet" },
  { frame: 873 + 52, sound: "tick" },
  // Beat 6: Social media noise swarm + facepalm
  { frame: 1070 + 10, sound: "pop" },
  { frame: 1070 + 48, sound: "thud" },
  // Beat 7: Bold highlight truth
  { frame: 1343 + 12, sound: "stamp" },
  // Beat 8: Cursor clicks to pin core ideas (local t = 1.6s, 3.2s, 4.8s)
  { frame: 1525 + 48, sound: "click" },
  { frame: 1525 + 96, sound: "click" },
  { frame: 1525 + 144, sound: "click" },
  { frame: 1525 + 188, sound: "sparkle" },

  // Ch 2: Write for Clarity
  { frame: 1786, sound: "mallet" },
  { frame: 1786 + 60, sound: "tick" },
  { frame: 1786 + 130, sound: "ding" },
  // Beat 10: Cursor clicks deep-writing pedestal (local t = 2.6s)
  { frame: 2077 + 16, sound: "pop" },
  { frame: 2077 + 78, sound: "click" },
  { frame: 2077 + 115, sound: "ding" },

  // Ch 3: Sit in Silence
  { frame: 2303, sound: "mallet" },
  { frame: 2303 + 45, sound: "thud" },
  // Beat 11: Cursor clicks "专注留白" toggle switch at local t = 4.4s (frame 132)
  { frame: 2303 + 132, sound: "click" },
  { frame: 2303 + 150, sound: "sparkle" },
  // Beat 12: 3 golden inspiration moments pop in
  { frame: 2581 + 20, sound: "pop" },
  { frame: 2581 + 60, sound: "pop" },
  { frame: 2581 + 100, sound: "ding" },

  // Ch 4: Comfort with Silence
  { frame: 2803, sound: "mallet" },
  { frame: 2803 + 66, sound: "tick" },
  { frame: 2803 + 96, sound: "tick" },
  { frame: 2803 + 128, sound: "thud" },
  // Beat 14: Cursor clicks 2 silence-handling cards (local t = 1.8s, 4.1s)
  { frame: 3079 + 54, sound: "click" },
  { frame: 3079 + 123, sound: "click" },
  // Beat 15: "我不知道" stamp
  { frame: 3315 + 18, sound: "pop" },
  { frame: 3315 + 88, sound: "stamp" },

  // Ch 5: Command Pauses
  { frame: 3541, sound: "mallet" },
  // Beat 16: Cursor clicks speed pill 4x -> 1x -> Pause (local t = 2.2s, 4.4s)
  { frame: 3541 + 66, sound: "click" },
  { frame: 3541 + 132, sound: "click" },
  // Beat 17: Spotlight pause reveal
  { frame: 3818 + 75, sound: "ding" },

  // Ch 6: Frameworks
  { frame: 4058, sound: "mallet" },
  // Beat 18: Cursor clicks Tab 1 & Tab 2 (local t = 2.8s, 5.2s)
  { frame: 4058 + 84, sound: "click" },
  { frame: 4058 + 156, sound: "click" },
  // Beat 19: Guru 3-step & Micro Story valley
  { frame: 4347 + 20, sound: "tick" },
  { frame: 4347 + 72, sound: "tick" },
  { frame: 4347 + 152, sound: "ding" },

  // Ch 7: Outro
  { frame: 4643, sound: "mallet" },
  { frame: 4643 + 30, sound: "pop" },
  { frame: 4643 + 70, sound: "pop" },
  { frame: 4643 + 110, sound: "sparkle" },
  { frame: 4643 + 195, sound: "chime" },
];
