---
name: video-sprite-pack
description: "用纯文生图（latent-media / latent.moe）批量生产视频专用角色贴图库：自动规划 12 个高频表情动作槽位，支持「2x2 表情网格一次出 4 张（最高一致性、省额度）」与「锁 DNA + 锁 Seed 单张 1024px 高清」双模式；内置自动切片、防误抠外围泛洪去白边、画布锚点归一化、验收拼图 contact-sheet.png，以及 QQ 秀式台词情绪路由清单 manifest.json。当用户需要创建新角色贴图库、补画/重抽某个表情、给视频角色抠图对齐、或把口播文案自动匹配角色反应时使用。"
display_name: "视频角色贴图库生成器"
version: 1.0.0
tags: [sprite, character-pack, mascot, 贴图库, 表情包, 抠图, latent-media, qq-show, remotion]
---

# Video Sprite Pack（视频角色贴图库 Skill）

本 Skill 用于把一句话人设变成**可直接给代码视频（Remotion）调用的透明角色贴图资产包**，并支持类似 **QQ 秀 / Galgame** 的「台词情绪自动触发贴图 + 微动效 + 音效」。

---

## 核心原则（基于 `latent.moe` 实测总结）

1. **先 1 张试水，再批量补齐**：`latent.moe` 有周额度且同账号并发为 1，永远先生成 1 张 `grid_2x2`（或 2 张 `single_seed`）确认画风与锁脸效果，再出全套。
2. **双模式选型**：
   - **`grid_2x2`（默认首选，一致性 ~100%）**：单次 `1024×1024` 一次出 4 个表情，同一画布共享注意力，发饰/衣领/瞳色/线稿完全统一，每格 512×512 足够 1080p 视频底部或侧边使用，3 次生图即可凑齐 12 表情。
   - **`single_seed`（1024×1024 高清大图 / 大幅度动作）**：锁定完整 Character DNA + 固定 `--seed` + 固定 `--sampler euler --scheduler sgm_uniform`，只替换末尾情绪与手势 tag；适合封面、主视觉或带明显道具的大动作。
3. **写死 Character DNA（防漂移关键）**：
   必须显式锁定以下 7 项，缺一不可：
   - 人数与景别：`1girl, chibi`（Q 版）或 `1girl, anime illustration`（日系立绘）+ `upper body` / `waist up`
   - 上色风格：`anime coloring, cel shading, clean lineart`（必须带闭合深色外描边，抠图极干净）
   - 呆毛/刘海：显式写 `single ahoge` 或 `no ahoge`（不写就会时有时无！）
   - 发型发色发饰：具体到颜色和位置（如 `navy blue long hair, twin side braids, white hair ribbons`）
   - 瞳色：`golden yellow eyes`
   - 服装细节：`white collared blouse, red necktie, dark blue vest`
   - 纯色背景：`simple background, solid white background`（若角色主色是纯白发+白帽，则改为 `solid chroma key green background`）
4. **密钥安全**：绝不把 `lat_sk_...` 写入脚本或提交到 git；统一通过项目根目录 `keys.env` 或环境变量 `LATENT_IMAGE_KEY` 读取。

---

## 标准 4 步工作流

### 第 1 步：生成原始贴图（`generate_pack.py`）

先用 `--dry-run` 检查拼出来的 Prompt，确认无误再去掉 `--dry-run` 真正调用 API：

```powershell
# 模式 B：先生成第 1 组 2x2 表情网格（核心 4 表情：招手笑 / 疑问 / 破防握拳 / 托下巴思考）
python .agents/skills/video-sprite-pack/scripts/generate_pack.py `
  --name my-char `
  --mode grid_2x2 `
  --groups grid_core `
  --dna "chibi, 1girl, anime coloring, cel shading, clean lineart, single ahoge, navy blue long hair, twin side braids, white hair ribbons, golden yellow eyes, white collared blouse, red necktie, dark blue vest, upper body" `
  --seed 20261126

# 确认风格满意后，一次补齐全部 3 组网格（共 12 个高频视频表情）
python .agents/skills/video-sprite-pack/scripts/generate_pack.py `
  --name my-char --mode grid_2x2 --dna "..." --seed 20261126

# 模式 A：单独生成/重抽某 1~2 张 1024px 高清大动作贴图
python .agents/skills/video-sprite-pack/scripts/generate_pack.py `
  --name my-char --mode single_seed --dna "..." --seed 20261126 --only happy_point,angry_fist
```

### 第 2 步：自动切片 + 抠图去白边 + 锚点对齐 + 生成 `manifest.json`（`process_sprites.py`）

```powershell
python .agents/skills/video-sprite-pack/scripts/process_sprites.py `
  --pack public/characters/my-char
```

脚本会自动完成：
1. 识别 `raw/grid_*.png` 为 2×2 四象限并自动切片，其余 `raw/<slot>.png` 按单图处理；
2. 检测外围纯色底，用**外围泛洪去背 + 边缘脱白边**算法生成真透明 PNG（闭合描边内的白衬衫、白蝴蝶结、眼白不会被误抠！）；
3. 裁剪主体有效区域，按统一画布（默认 `1024×1024`）缩放并以**底部中心（`x=0.5, y=1.0`）**锚点对齐；
4. 输出 `contact-sheet.png`（棋盘格透明底验收总览图）和 `manifest.json`（含情绪标签、中文触发词、Latent Audio 气声标签、推荐微动效与音效）。

### 第 3 步：肉眼验收 `contact-sheet.png`（不可跳过）

用 `read_file` 查看 `public/characters/<name>/contact-sheet.png`：
- 检查边缘是否干净、白衣/眼白是否完整；
- 检查每张贴图的手指、表情、是否被截断；
- 哪一张不满意，用 `--only <slot> --seed-offset 1 --force` 单独重抽后再跑一遍 `process_sprites.py`。

### 第 4 步：QQ 秀式台词自动路由（`match_script.py`）

把口播台词（每行一句，可含 `[叹气]` `[轻笑]` 等 Latent Audio 气声事件）交给路由器，自动输出带角色表情、微动效和音效的分镜 JSON：

```powershell
python .agents/skills/video-sprite-pack/scripts/match_script.py `
  --manifest public/characters/my-char/manifest.json `
  --script my_script.txt `
  -o routed_storyboard.json
```

---

## 资产包标准结构（强制保留素材、Trace 与一致性资产）

```text
public/characters/<name>/
├── reference/
│   ├── ref_source.<ext>      # 反推提示词所用的原始参考图（--ref-image 自动归档）
│   └── dna_spec.json         # 锁定的人物 DNA、负向词、seed、采样器与设计说明
├── raw/
│   ├── grid_*.png / *.png    # 每次生图的原始未抠图底片（不删除）
│   └── archive/              # --force 重抽时自动归档旧尝试，保留完整迭代史
├── sprites/                  # 透明底、统一锚点对齐的成品 PNG
├── trace/
│   └── generation_trace.jsonl# 逐次 API 调用全量 trace（时间戳/prompt/negative/seed/artwork_id）
├── consistency/
│   └── consistency_sheet.png # 参考图 + 全套贴纸（带白边压在方格纸上）一致性验收图
├── contact-sheet.png         # 棋盘格透明底验收拼图
├── generation_log.json       # 结构化生图日志
└── manifest.json             # QQ 秀式情绪语义清单（供 Remotion 与路由器读取）
```
