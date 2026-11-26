#!/usr/bin/env python3
"""
QQ-Show style semantic router: maps each narration line in a script to the best
character sprite, micro-motion, and SFX from a character pack's manifest.json.

Matching priority:
  1. Latent Audio inline emotion/breath tags: [叹气], [轻笑], [惊呼], [喊叫]...
  2. Chinese/English semantic triggers defined in manifest.json
  3. Punctuation / rhetoric cues (? / ！ / 对比 / 代码命令)
  4. Anti-monotony penalty so consecutive beats feel lively instead of frozen
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

AUDIO_TAG_RE = re.compile(r"\[[^\]]+\]")


def estimate_duration_sec(text: str, cps: float = 4.6) -> float:
    clean = AUDIO_TAG_RE.sub("", text).strip()
    chars = len(re.sub(r"\s+", "", clean))
    return round(max(1.8, chars / cps + 0.45), 2)


def route_lines(lines: list[str], manifest: dict, fps: int = 30) -> dict:
    sprites = manifest.get("sprites", [])
    if not sprites:
        raise ValueError("manifest.json has no sprites")

    default_id = manifest.get("character", {}).get("default_pose") or sprites[0]["id"]
    recent_ids: list[str] = []
    scenes = []

    for idx, raw_line in enumerate(lines, 1):
        line = raw_line.strip()
        if not line:
            continue
        lower = line.lower()
        tags_found = AUDIO_TAG_RE.findall(line)
        clean_text = AUDIO_TAG_RE.sub("", line).strip()

        best_sprite = None
        best_score = -999.0
        best_reasons: list[str] = []

        for sp in sprites:
            score = 0.0
            reasons: list[str] = []

            # 1. Exact Latent Audio [气声] tag match (strongest signal)
            for tag in tags_found:
                if tag in sp.get("audio_tags", []):
                    score += 12.0
                    reasons.append(f"audio_tag:{tag}")

            # 2. Keyword trigger match
            for kw in sp.get("triggers", []):
                if kw.lower() in lower:
                    score += 5.0 + min(len(kw), 4) * 0.5
                    reasons.append(f"trigger:{kw}")

            # 3. Structural / punctuation cues
            emotions = set(sp.get("emotions", []))
            if idx == 1 and ("greeting" in emotions or "happy" in emotions):
                score += 2.5
                reasons.append("opening_hook")
            if idx == len(lines) and ("outro" in emotions or "cta" in emotions):
                score += 3.0
                reasons.append("closing_beat")
            if ("?" in line or "？" in line) and ("curious" in emotions or "thinking" in emotions):
                score += 2.8
                reasons.append("question_mark")
            if ("!" in line or "！" in line) and ("shocked" in emotions or "angry" in emotions or "excited" in emotions):
                score += 1.6
                reasons.append("exclamation")
            if any(tok in lower for tok in ("npx ", "git ", "pip ", "python ", "npm ", "cli", "github")):
                if "coding" in emotions or "explain" in emotions:
                    score += 2.2
                    reasons.append("code_cue")

            # 4. Anti-monotony: softly discourage repeating the exact same pose back-to-back
            if recent_ids and recent_ids[-1] == sp["id"]:
                score -= 2.5
            if len(recent_ids) >= 2 and recent_ids[-2] == sp["id"]:
                score -= 1.0

            if score > best_score:
                best_score = score
                best_sprite = sp
                best_reasons = reasons

        if best_sprite is None or best_score <= 0:
            # Rotate gracefully across available sprites if no keyword hit
            fallback_idx = (idx - 1) % len(sprites)
            best_sprite = sprites[fallback_idx]
            if best_sprite["id"] == (recent_ids[-1] if recent_ids else None):
                best_sprite = sprites[(fallback_idx + 1) % len(sprites)]
            best_reasons = [f"fallback_rotate({default_id})"]

        recent_ids.append(best_sprite["id"])
        dur_sec = estimate_duration_sec(line)
        scenes.append(
            {
                "index": idx,
                "raw_text": line,
                "subtitle_zh": clean_text,
                "audio_tags": tags_found,
                "duration_sec": dur_sec,
                "duration_frames": int(round(dur_sec * fps)),
                "pose": best_sprite["id"],
                "pose_label": best_sprite.get("label", best_sprite["id"]),
                "sprite_file": best_sprite["file"],
                "motion": best_sprite.get("default_motion", "pop_in"),
                "sfx": best_sprite.get("default_sfx", "pop"),
                "match_score": round(best_score, 2),
                "match_reasons": best_reasons,
            }
        )

    total_frames = sum(s["duration_frames"] for s in scenes)
    return {
        "character": manifest.get("character", {}),
        "fps": fps,
        "total_frames": total_frames,
        "total_sec": round(total_frames / fps, 2),
        "beats": scenes,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Route script lines to character sprites/motions/SFX")
    parser.add_argument("--manifest", required=True, help="Path to character manifest.json")
    parser.add_argument("--script", required=True, help="Plain text script (one sentence per line)")
    parser.add_argument("--fps", type=int, default=30)
    parser.add_argument("-o", "--out", default="", help="Optional output JSON file")
    args = parser.parse_args()

    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8-sig"))
    raw_lines = [ln for ln in Path(args.script).read_text(encoding="utf-8-sig").splitlines() if ln.strip() and not ln.strip().startswith("#")]
    result = route_lines(raw_lines, manifest, fps=args.fps)

    text_out = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text_out, encoding="utf-8")
        print(f"Routed {len(result['beats'])} beats ({result['total_sec']}s) -> {args.out}")
    else:
        print(text_out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
