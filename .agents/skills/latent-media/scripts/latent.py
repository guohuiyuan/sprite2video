#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""latent.py — 一个脚本打通 Latent 的语音合成（audio.latent.moe）与图像生成（latent.moe）。

只用标准库，Python 3.8+ 直接跑，不需要 pip install。

  python scripts/latent.py tts   --voice <slug> --text "台词" -o line.mp3
  python scripts/latent.py image --prompt "1girl, watercolor" -o pic.webp
  python scripts/latent.py voices | status | resolve | job | doctor | keys

密钥来源优先级：--key / 环境变量 / keys.env（skill 根目录）/ ~/.config/latent/keys.env
列音色库需要站点登录 cookie（LATENT_COOKIE），合成与出图只需要 key。
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import os
import re
import sys
import time
import uuid
from pathlib import Path
from urllib import error, parse, request

SKILL_ROOT = Path(__file__).resolve().parent.parent
AUDIO_BASE = "https://audio.latent.moe"
IMAGE_BASE = "https://latent.moe"
AUDIO_ENV, IMAGE_ENV = "LATENT_AUDIO_KEY", "LATENT_IMAGE_KEY"
AUDIO_ALIASES = (AUDIO_ENV, "AUDIO_KEY", "LATENT_TTS_KEY")
IMAGE_ALIASES = (IMAGE_ENV, "IMAGE_KEY", "LATENT_SK_KEY")
COOKIE_ALIASES = ("LATENT_COOKIE", "LATENT_AUDIO_COOKIE")
KEY_FILES = [SKILL_ROOT / "keys.env", Path.home() / ".config" / "latent" / "keys.env"]
USER_CONFIG_DIR = Path.home() / ".config" / "latent"
VOICE_PAGE_SIZE = 24
USER_AGENT = "latent-media-skill/1.2"
FMT_EXT = {"mp3": ".mp3", "wav": ".wav", "opus": ".opus"}
MEDIA_EXT = {"image/webp": ".webp", "image/png": ".png", "image/jpeg": ".jpg", "audio/mpeg": ".mp3",
             "audio/wav": ".wav", "audio/x-wav": ".wav", "audio/ogg": ".opus", "audio/opus": ".opus"}

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except Exception:
        pass


# ---------------------------------------------------------------- 基础工具

class Fail(Exception):
    def __init__(self, msg: str, code: str | None = None, status: int | None = None):
        super().__init__(msg)
        self.code, self.status = code, status


def die(msg: str, code: str | None = None, status: int | None = None) -> None:
    raise Fail(msg, code, status)


def say(msg: str) -> None:
    sys.stderr.write(f"[latent] {msg}\n")
    sys.stderr.flush()


def emit(obj) -> None:
    print(json.dumps(obj, ensure_ascii=False, indent=2))


def mask(key: str | None) -> str:
    if not key:
        return "(未配置)"
    return f"{key[:8]}…{key[-4:]}" if len(key) > 16 else "***"


def writable_dir(path: Path) -> bool:
    try:
        path.mkdir(parents=True, exist_ok=True)
        probe = path / ".probe"
        probe.write_bytes(b"")
        probe.unlink()
        return True
    except OSError:
        return False


def state_file(name: str) -> Path:
    """写入位置：优先 skill 目录，只读安装时退回 ~/.config/latent，再不行用 cwd。"""
    for folder in (SKILL_ROOT, USER_CONFIG_DIR, Path.cwd()):
        if writable_dir(folder):
            return folder / name
    die(f"没有可写目录，无法保存 {name}")


def read_env_file(path: Path) -> dict:
    data = {}
    if not path.is_file():
        return data
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        data[k.strip()] = v.strip().strip('"').strip("'")
    return data


def lookup(aliases: tuple, cli_value: str | None, label: str, hint: str) -> str:
    if cli_value:
        return cli_value.strip()
    for name in aliases:
        val = os.environ.get(name)
        if val and val.strip():
            return val.strip()
    for path in KEY_FILES:
        table = read_env_file(path)
        for name in aliases:
            if table.get(name):
                return table[name].strip()
    die(f"缺少 {label}：{hint}")


def get_key(kind: str, cli_value: str | None = None) -> str:
    if kind == "audio":
        return lookup(AUDIO_ALIASES, cli_value, "语音 API key",
                      f"设置环境变量 {AUDIO_ENV}，或写入 {KEY_FILES[0]}（见 keys.env.example）")
    return lookup(IMAGE_ALIASES, cli_value, "图像 API key",
                  f"设置环境变量 {IMAGE_ENV}，或写入 {KEY_FILES[0]}（见 keys.env.example）")


def get_cookie(cli_value: str | None = None) -> str:
    return lookup(COOKIE_ALIASES, cli_value, "站点 cookie（只有列音色库用得上）",
                  f"设置环境变量 {COOKIE_ALIASES[0]}，或 python scripts/latent.py keys --cookie '...'")


def _open(req: request.Request, timeout: float):
    """先直连，失败再走环境变量里的代理（本机代理经常是死端口）。"""
    try:
        return request.build_opener(request.ProxyHandler({})).open(req, timeout=timeout)
    except error.HTTPError:
        raise
    except Exception as exc:  # noqa: BLE001 - 网络层什么都可能抛
        proxy = next((os.environ.get(k) for k in
                      ("https_proxy", "HTTPS_PROXY", "http_proxy", "HTTP_PROXY") if os.environ.get(k)), None)
        if not proxy:
            raise
        say(f"直连失败（{type(exc).__name__}），改用代理 {proxy} 重试")
        return request.build_opener(request.ProxyHandler()).open(req, timeout=timeout)


def call(method: str, url: str, key: str | None = None, body: dict | None = None,
         timeout: float = 180, headers: dict | None = None) -> tuple[int, dict, bytes]:
    hdrs = {"Accept": "application/json", "User-Agent": USER_AGENT}
    if key:
        hdrs["Authorization"] = f"Bearer {key}"
    data = None
    if body is not None:
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        hdrs["Content-Type"] = "application/json"
    if headers:
        hdrs.update(headers)
    req = request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with _open(req, timeout) as resp:
            return resp.status, dict(resp.headers.items()), resp.read()
    except error.HTTPError as exc:
        return exc.code, dict(exc.headers.items()), exc.read()
    except Exception as exc:  # noqa: BLE001
        die(f"请求失败：{method} {url} → {type(exc).__name__}: {exc}")


def hget(headers: dict, name: str):
    low = name.lower()
    for k, v in headers.items():
        if k.lower() == low:
            return v
    return None


def parse_error(raw: bytes) -> tuple[str | None, str]:
    text = raw.decode("utf-8", "replace")
    try:
        data = json.loads(text)
    except Exception:  # noqa: BLE001
        return None, text[:300]
    if isinstance(data, dict):
        err = data.get("error")
        if isinstance(err, dict):
            return err.get("code"), str(err.get("message") or "")
        if data.get("message"):
            return str(data.get("code") or data.get("statusCode") or "") or None, str(data["message"])
    return None, text[:300]


def find_job_id(raw: bytes, headers: dict) -> str | None:
    head = hget(headers, "X-Job-Id") or hget(headers, "X-Job-ID")
    if head:
        return head
    try:
        data = json.loads(raw.decode("utf-8", "replace"))
    except Exception:  # noqa: BLE001
        return None

    def walk(node):
        if isinstance(node, dict):
            for k, v in node.items():
                if k.replace("_", "").lower() in ("jobid", "id") and isinstance(v, str):
                    if k.lower() != "id" or "job" in k.lower():
                        return v
                found = walk(v)
                if found:
                    return found
        elif isinstance(node, list):
            for item in node:
                found = walk(item)
                if found:
                    return found
        return None

    return walk(data)


def retry_after(headers: dict, default: float = 3.0) -> float:
    val = hget(headers, "Retry-After")
    try:
        return max(1.0, float(val)) if val else default
    except (TypeError, ValueError):
        return default


def media_ext(content_type: str | None, fallback: str) -> str:
    if not content_type:
        return fallback
    ctype = content_type.split(";")[0].strip().lower()
    return MEDIA_EXT.get(ctype) or mimetypes.guess_extension(ctype) or fallback


def save(raw: bytes, path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(raw)
    return path


def resolve_out(user_out: str | None, stem: str, ext: str, index: int | None, total: int) -> Path:
    """-o 可以是文件、目录（以 / 结尾或已存在），多段时自动编号。"""
    tag = f"-{index:02d}" if total > 1 and index else ""
    if not user_out:
        return Path.cwd() / "out" / f"{stem}{tag}{ext}"
    raw = Path(user_out).expanduser()
    if user_out.endswith(("/", os.sep)) or raw.is_dir():
        return raw / f"{stem}{tag}{ext}"
    if total > 1:
        return raw.with_name(f"{raw.stem}{tag}{raw.suffix or ext}")
    if raw.suffix and raw.suffix.lower() != ext.lower():
        say(f"提示：服务端实际返回 {ext}，文件仍按你给的 {raw.suffix} 命名（内容未转码）")
    return raw if raw.suffix else raw.with_suffix(ext)


def collect_texts(args) -> list[str]:
    if args.text:
        texts = [t for t in args.text]
    elif args.text_file:
        src = sys.stdin.read() if args.text_file == "-" else Path(args.text_file).read_text(encoding="utf-8")
        texts = [ln.strip() for ln in src.splitlines() if ln.strip()] if args.split_lines else [src.strip()]
    else:
        texts = []
    texts = [t for t in texts if t and t.strip()]
    if not texts:
        die("没有可读的文本：用 --text、--text-file 或从 stdin 传入")
    return texts


# ---------------------------------------------------------------- 语音

def do_tts_one(args, key: str, text: str, idem: str) -> tuple[bytes, dict]:
    payload = {"model": "latent-audio", "voice": args.voice, "input": text,
               "response_format": args.format}
    if args.language:
        payload["language"] = args.language
    url = f"{AUDIO_BASE}/v1/audio/speech"
    attempt = 0
    while True:
        attempt += 1
        status, headers, raw = call("POST", url, key, payload, timeout=args.timeout,
                                    headers={"Idempotency-Key": idem})
        if status == 200:
            return raw, headers
        code, msg = parse_error(raw)
        if status == 504:
            job = find_job_id(raw, headers)
            if not job:
                die("合成超时且响应里没有 job_id，无法续取", "timeout", 504)
            say(f"超时，改为领取已完成的任务 {job}")
            st2, h2, r2 = call("GET", f"{AUDIO_BASE}/api/jobs/{job}/audio", key, timeout=args.timeout)
            if st2 == 200:
                return r2, h2
            c2, m2 = parse_error(r2)
            die(f"领取任务 {job} 失败：{st2} {c2} {m2}", c2, st2)
        retryable = status in (429, 503) and (code in (None, "concurrent_limit", "queue_full"))
        if retryable and attempt <= args.retries:
            wait = retry_after(headers)
            say(f"{code or status}，{wait:.0f}s 后重试（{attempt}/{args.retries}）")
            time.sleep(wait)
            continue
        hint = {"voice_not_found": "语音 slug 不对或未发布：用 latent.py voices -q 关键词 查已发布音色（也可传条目 UUID）",
                "quota_exhausted": "本周语音额度已用完（14400 秒/周）",
                "concurrent_limit": "已有请求在跑（同账号 4 并发），稍后再试",
                "input_too_long": "文本过长（>300 秒估算），请切段",
                "invalid_api_key": "key 失效：语音 key 必须 lat_tk_ 开头"}.get(code or "", "")
        die(f"合成失败：{status} {code or ''} {msg}".strip() + (f" —— {hint}" if hint else ""), code, status)


def cmd_tts(args) -> None:
    key = get_key("audio", args.key)
    texts = collect_texts(args)
    stem = args.name or f"tts-{args.voice}-{time.strftime('%H%M%S')}"
    results = []
    for i, text in enumerate(texts, start=1):
        idem = args.idem or str(uuid.uuid4())
        raw, headers = do_tts_one(args, key, text, idem)
        ext = FMT_EXT.get(args.format, ".mp3")
        path = save(raw, resolve_out(args.out, stem, ext, i, len(texts)))
        item = {"file": str(path), "bytes": len(raw), "voice": args.voice,
                "duration_ms": int(hget(headers, "X-Audio-Duration-Ms") or 0) or None,
                "format": args.format, "idempotency_key": idem,
                "chars": len(text), "text": text[:80]}
        results.append(item)
        if not args.json:
            secs = (item["duration_ms"] or 0) / 1000
            print(f"{path}  {len(raw)/1024:.0f} KB  {secs:.1f}s  voice={args.voice}")
    if args.json:
        emit(results[0] if len(results) == 1 else results)


# ---------------------------------------------------------------- 音色库

CARD_RE = re.compile(r'<a title="(?P<name>[^"]*)"[^>]*?href="/v/(?P<slug>[^"]+)"')
KINDS = ("Fictional character", "Synthetic", "Own voice")


def parse_voice_cards(html: str) -> list[dict]:
    html = html.replace("<!-- -->", "")
    marks = [(m.start(), m) for m in CARD_RE.finditer(html)]
    cards = []
    for idx, (start, m) in enumerate(marks):
        end = marks[idx + 1][0] if idx + 1 < len(marks) else start + 4000
        block, before = html[m.end():end], html[max(0, start - 2500):start]
        meta = re.search(r'text-meta text-muted">(.*?)</p>', block, re.S)
        desc = re.search(r'line-clamp-2[^"]*">(.*?)</p>', block, re.S)
        uses = re.search(r">(\d+)\s*uses?</span>", block)
        gen = re.search(r">([^<]{1,20}?)\s*generated</span>", block)
        uid = re.search(r"/api/voices/([0-9a-f-]{36})/", block)
        parts = [p.strip() for p in re.sub(r"<[^>]+>", "", meta.group(1)).split("·")] if meta else []
        tail = before[-600:]
        kind = next((k for k in KINDS if k in tail), None)
        cards.append({
            "slug": m.group("slug"), "name": re.sub(r"<[^>]+>", "", m.group("name")).strip(),
            "owner": parts[0] if len(parts) > 0 else None,
            "lang": parts[1] if len(parts) > 1 else None,
            "sex": parts[2] if len(parts) > 2 else None,
            "kind": kind,
            "desc": re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", desc.group(1))).strip() if desc else None,
            "uses": int(uses.group(1)) if uses else 0,
            "generated": re.sub(r"\s+", " ", gen.group(1)).strip() if gen else None,
            "uuid": uid.group(1) if uid else None,
        })
    return cards


def fetch_voice_library(cookie: str) -> list[dict]:
    seen, items = set(), []
    for page in range(1, 21):
        url = f"{AUDIO_BASE}/" + (f"?page={page}" if page > 1 else "")
        status, _, raw = call("GET", url, None, timeout=60, headers={"Cookie": cookie})
        html = raw.decode("utf-8", "replace")
        if status != 200:
            die(f"读取音色库失败：HTTP {status}")
        cards = parse_voice_cards(html)
        if not cards:
            if "Sign in" in html[:6000] or "使用 Discord 登录" in html:
                die("cookie 失效：音色库要 Discord 登录态（浏览器里重新复制一次 cookie）")
            break
        fresh = [c for c in cards if c["slug"] not in seen]
        if not fresh:
            break
        for c in fresh:
            seen.add(c["slug"])
            items.append(c)
        if len(cards) < VOICE_PAGE_SIZE:
            break
    return items


def cmd_voices(args) -> None:
    cache_file = state_file("voices.json")
    cache = {}
    if cache_file.is_file():
        try:
            cache = json.loads(cache_file.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            cache = {}
    items = cache.get("voices") or []
    if args.refresh or not items:
        say("抓取音色库…")
        items = fetch_voice_library(get_cookie(args.cookie))
        cache_file.write_text(json.dumps(
            {"fetched_at": time.strftime("%Y-%m-%dT%H:%M:%S"), "count": len(items), "voices": items},
            ensure_ascii=False, indent=2), encoding="utf-8")
        say(f"已缓存 {len(items)} 个音色 → {cache_file}")

    query = (args.query or "").lower()
    selected = []
    for v in items:
        if args.lang and (v.get("lang") or "").lower() != args.lang.lower():
            continue
        if args.sex and (v.get("sex") or "").lower() != args.sex.lower():
            continue
        if query:
            blob = " ".join(str(v.get(k) or "") for k in ("slug", "name", "owner", "desc")).lower()
            if query not in blob:
                continue
        selected.append(v)

    if args.json:
        emit({"total_cached": len(items), "matched": len(selected),
              "cached_at": cache.get("fetched_at"), "voices": selected[:args.limit or None]})
        return
    if not selected:
        print("没有匹配的音色，试试 --refresh 或放宽条件")
        return
    limit = args.limit or 30
    print(f"{'slug':<18} {'lang':<5} {'sex':<7} {'uses':>5}  name｜说明")
    for v in selected[:limit]:
        name = v.get("name") or ""
        desc = (v.get("desc") or "").replace("\n", " ")[:44]
        print(f"{v['slug']:<18} {(v.get('lang') or '-'):<5} {(v.get('sex') or '-'):<7} "
              f"{v.get('uses') or 0:>5}  {name}｜{desc}")
    if len(selected) > limit:
        print(f"… 还有 {len(selected) - limit} 个，用 --limit 或 --json 取全量")
    print(f"共缓存 {len(items)} 个音色（{cache.get('fetched_at') or '刚刷新'}）；--refresh 重新抓")


# ---------------------------------------------------------------- 图像

def poll_job(key: str, job_id: str, timeout: float, interval: float, quiet: bool) -> dict:
    deadline = time.time() + timeout
    last = None
    while time.time() < deadline:
        status, _, raw = call("GET", f"{IMAGE_BASE}/api/generate/{job_id}", key, timeout=60)
        if status != 200:
            code, msg = parse_error(raw)
            die(f"查询任务失败：{status} {code or ''} {msg}".strip(), code, status)
        job = json.loads(raw.decode("utf-8"))
        last = job
        state = job.get("status")
        if state in ("succeeded", "failed", "cancelled"):
            if state != "succeeded":
                die(f"任务 {job_id} {state}：{job.get('errorCode') or '无错误码'}")
            return job
        if not quiet:
            prog = job.get("progress")
            sys.stderr.write(f"\r[latent] {state} {str(prog or '') + '%' if prog is not None else ''}   ")
            sys.stderr.flush()
        time.sleep(interval)
    if not quiet:
        sys.stderr.write("\n")
    die(f"等待超时（{timeout:.0f}s），任务仍在跑：{job_id}（稍后用 job {job_id} 取）")


def fetch_media(key: str, artwork_id: str, size: str) -> tuple[bytes, str | None]:
    status, headers, raw = call("GET", f"{IMAGE_BASE}/api/media/{artwork_id}?size={size}", key, timeout=180)
    if status != 200:
        code, msg = parse_error(raw)
        die(f"下载图片失败：{status} {code or ''} {msg}".strip(), code, status)
    return raw, hget(headers, "Content-Type")


def cmd_image(args) -> None:
    key = get_key("image", args.key)
    payload = {"prompt": args.prompt, "resolution": args.resolution,
               "steps": max(8, min(12, args.steps)), "sampler": args.sampler, "scheduler": args.scheduler}
    if args.negative:
        payload["negativePrompt"] = args.negative
    if args.seed is not None:
        payload["seed"] = args.seed
    idem = args.idem or str(uuid.uuid4())
    status, headers, raw = call("POST", f"{IMAGE_BASE}/api/generate", key, payload,
                                headers={"Idempotency-Key": idem})
    if status not in (200, 202):
        code, msg = parse_error(raw)
        hint = {"too_many_active": "同账号同时只能有 1 个任务，等它跑完",
                "quota_exhausted": "本周图像额度已用完",
                "queue_full": "队列满了，按 Retry-After 等一会"}.get(code or "", "")
        die(f"提交失败：{status} {code or ''} {msg}".strip() + (f" —— {hint}" if hint else ""), code, status)
    job = json.loads(raw.decode("utf-8"))
    job_id = job.get("id")
    if args.no_wait:
        job["idempotency_key"] = idem
        emit(job)
        return
    say(f"已入队 {job_id}（seed={job.get('seed')}），等渲染…")
    done = poll_job(key, job_id, args.timeout, args.interval, args.json)
    artwork = done.get("artworkId")
    if not artwork:
        die("任务成功但没有 artworkId")
    data, ctype = fetch_media(key, artwork, args.size)
    ext = media_ext(ctype, ".webp")
    stem = args.name or f"img-{str(job_id)[:8]}"
    path = save(data, resolve_out(args.out, stem, ext, None, 1))
    info = {"file": str(path), "bytes": len(data), "job_id": job_id, "artwork_id": artwork,
            "seed": done.get("seed"), "width": done.get("width"), "height": done.get("height"),
            "steps": done.get("steps"), "sampler": done.get("sampler"), "scheduler": done.get("scheduler"),
            "resolution": done.get("resolution"), "prompt": args.prompt,
            "negative_prompt": args.negative, "size": args.size,
            "artwork_url": f"{IMAGE_BASE}/art/{artwork}"}
    if args.json:
        emit(info)
    else:
        print(f"{path}  {len(data)/1024:.0f} KB  {info['width']}x{info['height']}  seed={info['seed']}")


def cmd_job(args) -> None:
    key = get_key("image", args.key)
    status, _, raw = call("GET", f"{IMAGE_BASE}/api/generate/{args.id}", key, timeout=60)
    if status != 200:
        code, msg = parse_error(raw)
        die(f"查询失败：{status} {code or ''} {msg}".strip(), code, status)
    job = json.loads(raw.decode("utf-8"))
    if args.download and job.get("status") == "succeeded" and job.get("artworkId"):
        data, ctype = fetch_media(key, job["artworkId"], args.size)
        path = save(data, resolve_out(args.download, f"img-{args.id[:8]}", media_ext(ctype, ".webp"), None, 1))
        job["file"] = str(path)
    emit(job)


def cmd_cancel(args) -> None:
    key = get_key("image", args.key)
    status, _, raw = call("POST", f"{IMAGE_BASE}/api/generate/{args.id}/cancel", key, {}, timeout=60)
    if status not in (200, 202, 204):
        code, msg = parse_error(raw)
        die(f"取消失败：{status} {code or ''} {msg}".strip(), code, status)
    emit(json.loads(raw.decode("utf-8")) if raw.strip() else {"cancelled": args.id})


def cmd_status(args) -> None:
    key = get_key("image", args.key)
    status, _, raw = call("GET", f"{IMAGE_BASE}/api/generate/status", key, timeout=60)
    if status != 200:
        code, msg = parse_error(raw)
        die(f"读取状态失败：{status} {code or ''} {msg}".strip(), code, status)
    emit(json.loads(raw.decode("utf-8")))


def cmd_resolve(args) -> None:
    query = [("tag", t) for t in args.tag]
    if args.source:
        query.append(("source", args.source))
    if args.model:
        query.append(("model", args.model))
    if args.rank:
        query.append(("rank", str(args.rank)))
    if not args.download:
        query.append(("format", "json"))
    url = f"{IMAGE_BASE}/api/v1/images/resolve?{parse.urlencode(query, doseq=True)}"
    status, headers, raw = call("GET", url, None, timeout=60)
    if status == 200 and args.download:
        path = save(raw, resolve_out(args.download, f"resolve-{args.tag[0]}" if args.tag else "resolve",
                                     media_ext(hget(headers, "Content-Type"), ".webp"), None, 1))
        emit({"file": str(path), "bytes": len(raw), "tags": args.tag})
        return
    if status != 200:
        code, msg = parse_error(raw)
        die(f"检索失败：{status} {code or ''} {msg}".strip(), code, status)
    emit(json.loads(raw.decode("utf-8")))


def cmd_doctor(args) -> None:
    report = {"audio_key": None, "image_key": None, "audio": None, "image": None, "notes": []}
    for kind, field_name in (("audio", "audio_key"), ("image", "image_key")):
        try:
            report[field_name] = mask(get_key(kind, getattr(args, kind + "_key", None)))
        except Fail:
            report[field_name] = "(未配置)"
            report["notes"].append(f"{kind} key 未配置")
    try:
        key = get_key("image")
        st, _, raw = call("GET", f"{IMAGE_BASE}/api/generate/status", key, timeout=60)
        report["image"] = {"ok": st == 200, "http": st, **(json.loads(raw.decode("utf-8")) if st == 200 else {})}
    except Fail as exc:
        report["image"] = {"ok": False, "error": str(exc)}
    try:
        st, _, _ = call("GET", f"{AUDIO_BASE}/docs/api", None, timeout=60)
        report["audio"] = {"ok": st == 200, "docs_http": st}
    except Fail as exc:
        report["audio"] = {"ok": False, "error": str(exc)}
    emit(report)
    if any(not (report[k] or {}).get("ok") for k in ("audio", "image")):
        sys.exit(1)


def cmd_keys(args) -> None:
    path = state_file("keys.env")
    table = read_env_file(path)
    if args.audio:
        table[AUDIO_ENV] = args.audio.strip()
    if args.image:
        table[IMAGE_ENV] = args.image.strip()
    if args.cookie:
        table[COOKIE_ALIASES[0]] = args.cookie.strip()
    if args.audio or args.image or args.cookie:
        path.parent.mkdir(parents=True, exist_ok=True)
        lines = ["# Latent 凭证 —— 不要提交到 git（.gitignore 已忽略本文件）"]
        for name in (AUDIO_ENV, IMAGE_ENV, COOKIE_ALIASES[0]):
            if table.get(name):
                lines.append(f"{name}={table[name]}")
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")
        try:
            os.chmod(path, 0o600)
        except OSError:
            pass
        say(f"已写入 {path}")
    emit({"file": str(path), "audio": mask(table.get(AUDIO_ENV)), "image": mask(table.get(IMAGE_ENV)),
          "cookie": "已配置" if table.get(COOKIE_ALIASES[0]) else "(未配置)"})


# ---------------------------------------------------------------- CLI

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="latent.py", description="Latent 语音合成 + 图像生成的命令行封装")
    sub = p.add_subparsers(dest="cmd", required=True)

    t = sub.add_parser("tts", help="文字转语音（audio.latent.moe）")
    t.add_argument("--voice", required=True, help="语音 slug（如 aria）或条目 UUID；必须已发布")
    t.add_argument("--text", action="append", help="要读的文本，可重复（多段各出一个文件）")
    t.add_argument("--text-file", help="从文件读文本，传 - 读 stdin")
    t.add_argument("--split-lines", action="store_true", help="配合 --text-file：每行一段")
    t.add_argument("-o", "--out", help="输出文件/目录；默认 ./out/tts-<voice>-<时间>.mp3")
    t.add_argument("--name", help="输出文件名主干")
    t.add_argument("--format", default="mp3", choices=sorted(FMT_EXT), help="mp3|wav|opus（默认 mp3）")
    t.add_argument("--language", help="仅影响时长估算与计费（Chinese/English…）")
    t.add_argument("--idem", help="幂等键，重试复用同一 key 不会重复扣额度")
    t.add_argument("--retries", type=int, default=3, help="429/503 时的重试次数（默认 3）")
    t.add_argument("--timeout", type=float, default=300, help="单次请求超时秒数（默认 300）")
    t.add_argument("--key", help="临时指定语音 key（默认读环境变量/keys.env）")
    t.add_argument("--json", action="store_true", help="输出 JSON")
    t.set_defaults(func=cmd_tts)

    v = sub.add_parser("voices", help="列音色库（首次需要站点 cookie，之后读本地缓存）")
    v.add_argument("--refresh", action="store_true", help="重新从站点抓取并刷新缓存")
    v.add_argument("-q", "--query", help="按 slug/名字/作者/描述模糊搜")
    v.add_argument("--lang", help="zh | ja | en …")
    v.add_argument("--sex", help="Male | Female | Other")
    v.add_argument("--limit", type=int, help="最多显示多少条（默认 30）")
    v.add_argument("--cookie", help="站点登录 cookie（默认读 LATENT_COOKIE / keys.env）")
    v.add_argument("--json", action="store_true", help="输出 JSON")
    v.set_defaults(func=cmd_voices)

    i = sub.add_parser("image", help="文生图（latent.moe，异步排队）")
    i.add_argument("--prompt", required=True, help="正向提示词，Danbooru 风格 tag 用逗号分隔")
    i.add_argument("--negative", help="负向提示词（API 没有站点默认值，需要就自己写）")
    i.add_argument("--resolution", default="portrait", choices=["square", "portrait", "landscape"])
    i.add_argument("--steps", type=int, default=8, help="8–12，超出会被夹紧")
    i.add_argument("--sampler", default="euler", choices=["euler", "res_multistep", "er_sde"])
    i.add_argument("--scheduler", default="sgm_uniform",
                   choices=["sgm_uniform", "beta", "beta57", "linear_quadratic"])
    i.add_argument("--seed", type=int, help="随机种子，默认随机")
    i.add_argument("--size", default="original", choices=["original", "preview", "thumb"])
    i.add_argument("-o", "--out", help="输出文件；默认 ./out/img-<jobid8>.webp")
    i.add_argument("--name", help="输出文件名主干")
    i.add_argument("--no-wait", action="store_true", help="只入队，立即返回 job id")
    i.add_argument("--interval", type=float, default=2.0, help="轮询间隔秒（默认 2）")
    i.add_argument("--timeout", type=float, default=300, help="等待渲染完成的上限秒（默认 300）")
    i.add_argument("--idem", help="幂等键，超时重试时复用")
    i.add_argument("--key", help="临时指定图像 key")
    i.add_argument("--json", action="store_true", help="输出 JSON")
    i.set_defaults(func=cmd_image)

    j = sub.add_parser("job", help="查看某个图像任务（可顺带下载）")
    j.add_argument("id", help="任务 id")
    j.add_argument("--download", help="已完成则下载到该路径/目录")
    j.add_argument("--size", default="original", choices=["original", "preview", "thumb"])
    j.add_argument("--key")
    j.set_defaults(func=cmd_job, json=True)

    c = sub.add_parser("cancel", help="取消图像任务")
    c.add_argument("id")
    c.add_argument("--key")
    c.set_defaults(func=cmd_cancel, json=True)

    s = sub.add_parser("status", help="图像队列与 worker 状态")
    s.add_argument("--key")
    s.set_defaults(func=cmd_status, json=True)

    r = sub.add_parser("resolve", help="按 tag 从公开图库挑一张图（无需 key）")
    r.add_argument("--tag", action="append", required=True, help="可重复，AND 匹配")
    r.add_argument("--source", choices=["novelai", "sd-webui", "comfyui", "invokeai"])
    r.add_argument("--model", help="checkpoint 名子串")
    r.add_argument("--rank", type=int, help="第几张（1–1000）")
    r.add_argument("--download", help="直接下载到该路径/目录")
    r.set_defaults(func=cmd_resolve, json=True)

    d = sub.add_parser("doctor", help="检查 key 与两个服务是否可达")
    d.set_defaults(func=cmd_doctor, json=True)

    k = sub.add_parser("keys", help="查看/写入 keys.env")
    k.add_argument("--audio", help="写入语音 key")
    k.add_argument("--image", help="写入图像 key")
    k.add_argument("--cookie", help="写入站点登录 cookie（仅列音色库用）")
    k.set_defaults(func=cmd_keys, json=True)
    return p


def main() -> int:
    args = build_parser().parse_args()
    try:
        args.func(args)
    except Fail as exc:
        msg = str(exc)
        if exc.status == 401 or exc.code == "invalid_api_key":
            msg = f"{msg}\n  提示：语音 key 前缀 lat_tk_，图像 key 前缀 lat_sk_，两者不能混用。"
        sys.stderr.write(f"[latent] 错误：{msg}\n")
        return 1
    except KeyboardInterrupt:
        return 130
    return 0


if __name__ == "__main__":
    sys.exit(main())
