# latent-media

给 agent 用的 skill：一个零依赖脚本封装 [Latent Audio](https://audio.latent.moe/docs/api) 的语音合成与 [Latent](https://latent.moe/docs/api) 的文生图。
纯标准库，Python 3.8+ 直接跑，不需要 `pip install`，也不依赖任何本地服务。

- **语音**：`POST /v1/audio/speech`，音色按 slug 指定，台词里可内嵌 `[轻笑]` `[叹气]` `[耳语]` 等气声事件。
- **音色库**：165 个社区音色，列表没有公开 API，用站点登录 cookie 解析首页并缓存。
- **图像**：`POST /api/generate` 异步排队 → 轮询 → 自动下载；另有公开图库 `resolve` 按 tag 找参考图。

完整用法见 [`SKILL.md`](./SKILL.md)（agent 读这份）。

协议 **AGPL-3.0**（见 [`LICENSE`](./LICENSE)）。

## 快速开始

```bash
python scripts/latent.py keys --audio lat_tk_xxx --image lat_sk_xxx   # 写进 keys.env（已 gitignore）
python scripts/latent.py doctor                                        # 自检
python scripts/latent.py voices -q 台湾                                # 挑音色（需 LATENT_COOKIE，只此一处用）
python scripts/latent.py tts --voice voice-158 --text "灯笼已经点上了。" -o line.mp3
python scripts/latent.py image --prompt "1girl, solo, watercolor pencil (medium)" -o pic.png
```

key 也可走环境变量 `LATENT_AUDIO_KEY` / `LATENT_IMAGE_KEY`，或单次 `--key`。

## 安装成 skill

```bash
cp -r latent-media ~/.workbuddy/skills/            # 用户级
cp -r latent-media <project>/.workbuddy/skills/    # 或项目级
```

之后 agent 在需要配音/出图时会自动读到 `SKILL.md`。

## 密钥安全

真实 key 与 cookie 只存在于 `keys.env`、环境变量或 `--key`，均被 `.gitignore` 拦截。
提交前自查：`git grep -nE "lat_(tk|sk)_[A-Za-z0-9_-]{10,}"` 应无输出。

## 协议

**AGPL-3.0**，见 [LICENSE](./LICENSE)。

这意味着：你可以自由使用、修改、再分发；但如果把它（或修改版）作为网络服务提供给别人用，必须同样以 AGPL-3.0 公开源码。

## 声明

第三方封装，与 Latent 官方无隶属关系，仓库里的 AGPL-3.0 只覆盖本项目的代码。额度、条款与内容政策以站点为准；**生成内容的授权不随代码协议走**——语音模型权重为 CC-BY-NC，商用需另行确认。
