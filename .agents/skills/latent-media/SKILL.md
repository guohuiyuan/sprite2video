---
name: latent-media
description: "调用 Latent 两个云端 API 出声与出图：audio.latent.moe 做文本转语音（音色库 165 个社区音色，按 slug 指定，台词内可嵌 [轻笑] [叹气] [耳语] 等气声事件），latent.moe 做文生图（异步排队，方形/竖版/横版三档）。当用户要求「用某个声音念这段」「给这句台词配音」「换个音色」「生成一张插画/配图」「按 tag 找张参考图」时使用。音色列表需站点 cookie，合成与出图只需 API key。"
display_name: "Latent 配音·出图"
agent_created: true
version: 1.2.1
license: AGPL-3.0
tags: [tts, 语音合成, 配音, 音色库, text-to-speech, 文生图, image-generation, latent, audio.latent.moe, latent.moe]
---

# Latent 配音 · 出图

`scripts/latent.py` 用标准库封装两个云端服务，**Python 3.8+ 直接跑，无需 pip、无本地依赖**。

| 服务 | 能力 | 端点 |
|---|---|---|
| Latent Audio | 165 个社区音色转语音，台词内可嵌情绪/气声 | `https://audio.latent.moe/v1/audio/speech` |
| Latent | 文生图（异步排队）+ 公开图库检索 | `https://latent.moe/api/generate` |

## 准备

```bash
python scripts/latent.py keys --audio lat_tk_xxx --image lat_sk_xxx   # 写入 keys.env（已 gitignore）
python scripts/latent.py doctor                                        # audio.ok / image.ok 都为 true 再往下
```

- 语音 key 前缀 `lat_tk_`，图像 key 前缀 `lat_sk_`，**不能混用**；也支持 `LATENT_AUDIO_KEY` / `LATENT_IMAGE_KEY` 环境变量或单次 `--key`。
- 语音 key 30 天过期（重登站点续期），一账号最多 5 把。

## 先看有哪些声音（语音列表要 cookie）

音色库是 audio.latent.moe 的首页，**没有公开的列表 API**，只能带站点登录 cookie 解析；脚本抓完缓存成 `voices.json`，之后秒回。

```bash
python scripts/latent.py keys --cookie '__Secure-authjs.session-token=...; cf_clearance=...'  # 一次配好
python scripts/latent.py voices                      # 默认列 30 个（按上传时间倒序）
python scripts/latent.py voices -q 台湾              # 搜 slug / 名字 / 作者 / 描述
python scripts/latent.py voices --lang zh --sex Female --limit 10
python scripts/latent.py voices --json               # 全量结构化，含 uuid
```

当前缓存 **165 个**：`zh` 104、`ja` 34、`en` 26；性别 Male 57 / Female 57 / 未标 51。

- cookie 只用于列音色库，**合成和出图不读 cookie**；过期会明确报「cookie 失效」，重新登录复制即可。
- 条目地址形如 `/v/<slug>`，**slug 就是 `--voice` 的值**（也可传条目 uuid）；新音色用 `--refresh` 重抓。
- 别猜 slug——拼错或未发布的音色一律 `404 voice_not_found`。

## 命令

| 命令 | 用途 |
|---|---|
| `voices` | 列/搜音色库（`-q` `--lang` `--sex` `--limit` `--refresh` `--json`） |
| `tts` | 文本转语音，多段一次出多个文件 |
| `image` | 提交渲染 → 轮询 → 自动下载 |
| `job <id>` | 查任务，`--download` 顺带取图 |
| `cancel <id>` | 取消任务 |
| `status` | 图像队列/worker 状态 |
| `resolve` | 按 tag 从公开图库挑图（唯一免 key 接口） |
| `doctor` / `keys` | 自检 / 管理凭证 |

`tts` 与 `image` 默认落到 `./out/`，加 `--json` 得到 `file`、`seed`、`duration_ms`、`artwork_id`，可直接给流水线接。

## 例子

```bash
# 用某个声音念一句
python scripts/latent.py tts --voice voice-158 --text "灯笼已经点上了，她才走到桥边。" -o line.mp3

# 带情绪的台词（全角方括号，原样照抄）
python scripts/latent.py tts --voice voice-158 --text "[叹气] 还能听见你的声音，真好。[轻笑] 你一点都没变。" -o line.mp3

# 换音色：台湾腔 / 日语腔
python scripts/latent.py tts --voice voice-178 --text "欸，你怎麼這麼慢啦。" -o tw.mp3

# 多段旁白（几个 --text 就是几段，自动编号 -01/-02）或整份脚本
python scripts/latent.py tts --voice voice-158 --text "第一段。" --text "第二段。" -o out/narration/
python scripts/latent.py tts --voice voice-158 --text-file lines.txt --split-lines -o out/narration/

# 出图：竖版水彩；换种子再来一版；只要排队不等
python scripts/latent.py image --prompt "1girl, solo, watercolor pencil (medium), soft light" --resolution portrait -o pic.png
python scripts/latent.py image --prompt "1girl, solo, watercolor" --seed 1234567 -o pic-b.png
python scripts/latent.py image --prompt "..." --no-wait      # → {"id": "..."}，稍后 job <id> --download out/

# 找参考图
python scripts/latent.py resolve --tag 1girl --tag watercolor --download out/ref.webp
```

## 气声事件

写在文本里，**全角**方括号、大小写敏感；表外的方括号内容会被当标点念出来，也算进时长（即计费）。

`[笑]` `[轻笑]` `[咯咯笑]` · `[叹气]` `[惊呼]` `[吸气]` `[呼气]` `[喘息]` · `[耳语]` `[喊叫]` `[惨叫]` `[唱歌]` `[哼歌]` `[结巴]` `[停顿]` · `[哭声]` `[抽泣]` `[呜咽]` `[呻吟]` `[哀号]` · `[清嗓]` `[咳嗽]` `[吸鼻子]` · `[咂嘴]` `[啧嘴]` · `[打哈欠]` `[打喷嚏]` `[打嗝]` `[打饱嗝]` `[吞咽]` `[干呕]` · `[闷哼]` `[冷笑]` `[哼鼻子]`

## 配额与限制

| 项 | 语音 | 图像 |
|---|---|---|
| 额度 | 14400 秒/周（滚动，只计成功） | 独立周额度 |
| 并发 | 4 请求 | 1 任务（多提交 `409 too_many_active`） |
| 单次 | 300 秒估算音频，超了先切段 | prompt 1–2000 字符 |
| 尺寸 | — | `square` 1024² / `portrait` 920×1536 / `landscape` 1536×920 |
| 步数 | — | 8–12，超出被夹紧 |
| 产物 | 保留 30 天 | 存成私有作品，只有同一把 key 能取 |

图像 `sampler`：`euler`/`res_multistep`/`er_sde`；`scheduler`：`sgm_uniform`/`beta`/`beta57`/`linear_quadratic`。没有站点默认负向词，要排除什么得自己写 `--negative`。

## 重试与幂等

每次调用生成 `Idempotency-Key` 并打在 `--json` 里；**重试复用同一个**，否则重复排队、重复扣额度：`--idem <key>`。
语音 `429`/`503` 按 `Retry-After` 自动重试 3 次；语音 `504` 自动改走 `/api/jobs/{id}/audio` 领取（不再计费）；图像超时后先 `job <id>` 再决定。

## 排错

| 现象 | 原因 | 处理 |
|---|---|---|
| `401 invalid_api_key` | key 抄错 / 两个前缀用反 | 核对 `lat_tk_` vs `lat_sk_` |
| `404 voice_not_found` | slug 错或音色未发布 | `voices -q 关键词` 查真 slug |
| `voices` 报 cookie 失效 | 站点登录态过期 | 重登后复制 cookie，`keys --cookie '...'` |
| `403` 但浏览器能开 | 缺 User-Agent 被 CDN 拦 | 用本脚本（已带 UA），别用裸 urllib |
| `429 quota_exhausted` | 周额度用完 | 等滚动周刷新 |
| 全站超时/`doctor` 卡住 | 环境代理是死端口 | 脚本先直连再走代理；也可 `unset http_proxy https_proxy` |
| 文件打不开 | `-o` 扩展名与服务端格式不符 | 省略 `-o` 让脚本按 `Content-Type` 命名 |
