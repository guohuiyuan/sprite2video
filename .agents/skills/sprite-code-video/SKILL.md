---
name: sprite-code-video
description: "从一篇文章（文案）或一个 GitHub 仓库，制作带角色贴图库、丰富代码动效和帧级音效的 Remotion 视频。原生支持两大标杆风格：① 大肥鱼风格（dafeiyu，9:16 竖屏强动效信息图科普，顶部进度条 + NO.xx 标题 + 变色动态背景 + 双语字幕 + 底部常驻 Q 版贴图）；② 卡普迪姆风格（capdim，16:9 横屏复古方格纸叙事/吐槽，底部章节导航条 + 截图/图表 + 右侧情绪立绘）。当用户丢来一篇文章、Markdown、或 GitHub 链接要求做成带角色贴图的代码视频时使用。"
display_name: "贴图驱动代码动画视频导演"
version: 1.0.0
tags: [remotion, video, storyboard, github, explainer, dafeiyu, capdim, sprite, sfx]
---

# Sprite Code Video（贴图驱动代码动画视频 Skill）

本 Skill 解决“纯代码动画太单调”的问题：**把文章或 GitHub 仓库拆解为高密度可视化分镜，再用 QQ 秀式情绪路由给每一幕配上透明角色贴图、微动效与帧级音效**。

---

## 两大基准版式（制作前先确认其一）

| 维度 | `dafeiyu`（大肥鱼风） | `capdim`（卡普迪姆风） |
|---|---|---|
| 画幅 | `1080×1920`（9:16 竖屏，30fps） | `1920×1080`（16:9 横屏，30fps） |
| 适用场景 | 60~90 秒快节奏开源项目/工具安利、干货清单 | 2~4 分钟深度杂谈、实测吐槽、项目故事、深度解读 |
| 背景 | 每幕切换主题色（紫→蓝→橙→红→绿）+ 放射线/透视网格/频谱/代码雨 | 统一温暖复古米色方格纸底纹（`#efeadd`） |
| 导航 | 顶部多段进度条 + `NO.xx` 胶囊 + 粗描边大标题 | 底部全宽多章标签栏（当前章黑底白字高亮） |
| 角色贴图 | 底部居中常驻 Q 版小人；遇到大截图自动切 `corner` 缩到右下角 | 右侧或居中演出立绘，按台词情绪反复切换同一套表情包 |
| 字幕 | 底部居中白字黑描边中文 + 英文副字幕 | 底部居中半透明黑底白字清晰中文单行字幕 |

---

## 端到端 6 步生产流程

### 第 1 步：提炼源素材（文案或 GitHub Repo）
- **若输入为 GitHub 仓库**：先拉取 `README.md` 与目录结构，**严禁瞎编数据**。提炼：
  1. 一句话痛点 Hook（前 3 秒抓住注意力）
  2. 核心数字证据（Star 数、实测样本量、核心指标对比）
  3. 3~6 个具象特性或改前/改后对比（可配合真实网页截图或终端命令）
  4. 一句安装/上手命令（放入 `TerminalBox`）
  5. 结尾一图总结 / CTA
- **若输入为文章/文案**：拆分为 6~13 个快节奏分镜（每幕 1 个核心观点，5~10 秒），为每幕提炼 4~6 字短标题和可视化的信息图类型（数字递增 / 进度条对比 / 印章结论 / 终端打字 / 截图高亮）。

### 第 2 步：准备角色贴图库
- 检查 `public/characters/` 下是否已有可用贴图包（开箱自带 `demo-chibi`）。
- 若需要新角色，先调用 `video-sprite-pack` Skill 生成并验收 `contact-sheet.png` 与 `manifest.json`。

### 第 3 步：QQ 秀式台词自动路由角色反应
将每幕口播台词写入临时文本（每行一句，可按需加入 `[叹气]` `[轻笑]` `[惊呼]` 气声标签），运行：
```powershell
python .agents/skills/video-sprite-pack/scripts/match_script.py `
  --manifest public/characters/<char>/manifest.json `
  --script work/<topic>/script.txt `
  -o work/<topic>/routed.json
```
人工/Agent 快速扫一遍 `routed.json`，必要时微调某幕的 `pose`、`motion` 或 `sfx`。

### 第 4 步：准备配音与 SFX（可选真实 TTS，或按字数预估时长）
- 若配置了 `LATENT_AUDIO_KEY`，调用 `.agents/skills/latent-media/scripts/latent.py tts` 逐幕生成 `.mp3` 并用 `duration_ms` 精确反推每幕 `durationInFrames = Math.ceil(duration_ms / 1000 * 30) + 8`。
- 确保 `public/sfx/` 下 7 个基础音效已就绪（缺失则跑 `python .agents/skills/sprite-code-video/scripts/generate_sfx.py -o public/sfx`）。

### 第 5 步：用内置组件组装 Remotion 视频
在 `src/videos/<TopicName>.tsx` 新建组合，并在 `src/Root.tsx` 注册 `<Composition>`。**优先复用内置组件，严禁手写简陋纯文字 PPT**：
- `DynamicBackground`（`sunburst` / `grid3d` / `spectrum` / `coderain` / `paper`）
- `TopProgressBar`（`dafeiyu` 顶部进度条 + 胶囊）或 `BottomChapterBar`（`capdim` 底部章节栏）
- `CharacterSprite`（传 `src`、`motion`、`placement="bottom" | "corner" | "right" | "center"`）
- `MotionWidgets`（`CountUpCard`、`CompareBar`、`StampBadge`、`TerminalBox`）
- `BilingualSubtitle`（`dafeiyu` 双语描边 / `capdim` 黑底条）
- `SfxTrack`（传入每幕转场 `whoosh` + 卡片 `pop` + 角色情绪 `sfx`，自动防撞车与连播降音）

### 第 6 步：抽帧视觉质检与渲染
渲染前先抽 3~4 个关键帧检查文字是否溢出、贴图是否遮挡正文：
```powershell
npx.cmd remotion still src/index.ts <CompId> out/<CompId>-f1.png --frame=45
npx.cmd remotion still src/index.ts <CompId> out/<CompId>-f2.png --frame=180
```
用 `read_file` 看图无遮挡后，渲染最终成片：
```powershell
npx.cmd remotion render src/index.ts <CompId> out/<CompId>.mp4
```

### 第 7 步：B 站发布三件套交付（标题 + 双规格封面 + 简介，不可跳过）

成片渲染完成后，**必须一并产出可直接投稿 B 站的发布资产包**（并落盘到 `out/<CompId>-bilibili-publish.md`）：

1. **吸睛标题（B 站主推 + 备选 + 抖音短标题）**
   - **B 站标题（22~36 字，核心词放前 14 字，提供 3 组风格主推 1 组）**：
     - **反串圆回流（主推）**：先抛出反常识/挑衅/自嘲钩子制造强烈点击欲（例：“别再练口才了！越想显得聪明，说话越像复读机？”），再在后半句或视频正文把观点稳稳圆回来，落到真实可验证的底层方法和收益，绝不做货不对板的空壳标题党。
     - **数据反差流**：把最硬的真实逆袭数字或反差放在前 15 字（例：“七年级上台就社恐大哭，如今 400 人演讲 5.2 万粉：他只做对了 5 件事”）。
     - **情绪共鸣/痛点直击流**：直戳观众日常尴尬瞬间 + 给出具体解决数字。
   - **抖音/小红书备用短标题（必填，严格 ≤ 30 字含标点与空格）**：
     - 提炼与 B 站主标题同口径的最狠反串/核心数字，压进 **20~30 字以内**（交付前必须实际统计字符数确认 `len <= 30`），提供 2 条（1 条反串/狠活 + 1 条直给干货）。

2. **三规格全平台封面图（B 站 `16:9` 1920×1080 + B 站动态 `4:3` 1440×1080 + 抖音/小红书 `3:4` 1080×1440）**
   - 复用内置 `src/components/BilibiliCover.tsx` 注册三组 `<Still>`（组件按画幅自动切换横版左文右图 / 竖版上文下图），用 `npx.cmd remotion still` 一键出图，**必须用 `read_file` 肉眼验收**：
     - 封面大字控制在 **8~14 字**（主标题 2 行巨字 + 1 条高对比红/蓝角标），手机端缩略图 1 秒看清；
     - 放 1~2 张角色最具戏剧张力的透明底白边贴图（如 `shocked_fist` 破防 / `smug_wink` 得意 / `celebrate_star` 举星），与主大字形成情绪互动；
     - 横版右下角预留 B 站时长角标避让区；`3:4` 竖版上下留安全边距，适配抖音/小红书推荐流裁切。

3. **B 站完整简介（固定四段式，直接复制粘贴）**
   - **第一段（反串钩子 → 圆回核心观点）**：1~2 句接住标题的反串/夸张悬念，自然圆回视频核心洞见；
   - **第二段（看完这期你能直接带走什么）**：用清晰条目列出 **3~5 个具体、可立刻上手的收获**（框架公式、冷场话术、训练动作等），让观众一眼明白“点进来值回票价”；
   - **第三段（精准章节空降时间轴）**：根据实际配音 `timeline.json` 换算 `MM:SS` 章节节点，适配 B 站自动分段进度条；
   - **第四段（互动提问 + 5~8 个精准 `#话题标签`）**：空格分隔、贴合真实可搜话题词（不造无人搜的长句）。
