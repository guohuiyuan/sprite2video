#!/usr/bin/env python3
"""
Serial character sprite pack generator powered by latent-media (latent.moe).

Supports two consistency-first modes verified for pure text-to-image:
  - grid_2x2:    1024x1024 2x2 expression sheet (highest consistency, 4 poses/call)
  - single_seed: 1024x1024 single sprite with locked DNA + locked seed (HD + rerollable)
"""
from __future__ import annotations

import argparse
import datetime
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = SKILL_DIR.parent.parent.parent
LATENT_SCRIPT = PROJECT_ROOT / ".agents" / "skills" / "latent-media" / "scripts" / "latent.py"
PRESETS_FILE = SKILL_DIR / "presets" / "pose_slots.json"
NEG_FILE = SKILL_DIR / "presets" / "negative_base.txt"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        k = k.strip()
        v = v.strip().strip('"').strip("'")
        if k and v and k not in os.environ:
            os.environ[k] = v


def load_negatives() -> tuple[str, str]:
    single_lines: list[str] = []
    grid_lines: list[str] = []
    section = None
    for raw in NEG_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("# SINGLE_NEGATIVE"):
            section = "single"
            continue
        if line.startswith("# GRID_NEGATIVE"):
            section = "grid"
            continue
        if line.startswith("#"):
            continue
        if section == "single":
            single_lines.append(line)
        elif section == "grid":
            grid_lines.append(line)
    return ", ".join(single_lines), ", ".join(grid_lines)


def ensure_bg_tag(dna: str, bg: str) -> str:
    lower = dna.lower()
    if "background" in lower:
        return dna
    if bg == "green":
        return f"{dna}, simple background, solid chroma key green background"
    return f"{dna}, simple background, solid white background"


def run_latent_image(
    prompt: str,
    negative: str,
    out_dir: Path,
    stem: str,
    seed: int,
    resolution: str,
    steps: int,
    sampler: str,
    scheduler: str,
    dry_run: bool,
) -> dict:
    cmd = [
        sys.executable,
        str(LATENT_SCRIPT),
        "image",
        "--prompt",
        prompt,
        "--negative",
        negative,
        "--resolution",
        resolution,
        "--steps",
        str(steps),
        "--sampler",
        sampler,
        "--scheduler",
        scheduler,
        "--seed",
        str(seed),
        "-o",
        str(out_dir),
        "--name",
        stem,
        "--json",
    ]
    if dry_run:
        print(f"[DRY-RUN] {stem} (seed={seed}, res={resolution})")
        print(f"  prompt:   {prompt}")
        print(f"  negative: {negative}\n")
        return {"stem": stem, "dry_run": True, "seed": seed, "prompt": prompt}

    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if proc.returncode != 0:
        print(proc.stderr or proc.stdout, file=sys.stderr)
        raise RuntimeError(f"latent.py failed for {stem} (exit {proc.returncode})")
    # stdout contains the JSON emitted by --json
    data = json.loads(proc.stdout.strip())
    data["stem"] = stem
    print(f"[OK] {stem} -> {data.get('file')} ({data.get('width')}x{data.get('height')}, seed={data.get('seed')})")
    return data


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate a consistent character sprite pack via latent.moe")
    parser.add_argument("--name", required=True, help="Character pack folder name under public/characters/")
    parser.add_argument("--dna", required=True, help="Immutable Danbooru-style character DNA tags")
    parser.add_argument("--mode", choices=["grid_2x2", "single_seed"], default="grid_2x2")
    parser.add_argument("--groups", default="", help="Comma-separated grid groups (e.g. grid_core,grid_react)")
    parser.add_argument("--only", default="", help="Comma-separated slot IDs for single_seed mode")
    parser.add_argument("--seed", type=int, default=20261126, help="Base seed to lock character identity")
    parser.add_argument("--seed-offset", type=int, default=0, help="Added to base seed (handy for single rerolls)")
    parser.add_argument("--bg", choices=["white", "green"], default="white", help="Solid backdrop color")
    parser.add_argument("--resolution", choices=["square", "portrait", "landscape"], default="square")
    parser.add_argument("--steps", type=int, default=10)
    parser.add_argument("--sampler", default="euler", choices=["euler", "res_multistep", "er_sde"])
    parser.add_argument("--scheduler", default="sgm_uniform", choices=["sgm_uniform", "beta", "beta57", "linear_quadratic"])
    parser.add_argument("--force", action="store_true", help="Archive existing raw images and regenerate")
    parser.add_argument("--ref-image", default="", help="Optional reference image path to preserve in reference/")
    parser.add_argument("--extra-negative", default="", help="Extra negative prompt terms appended to base negative")
    parser.add_argument("--notes", default="", help="Optional character design / reverse-prompt notes for dna_spec.json")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts without calling API")
    args = parser.parse_args()

    load_env_file(PROJECT_ROOT / "keys.env")
    load_env_file(PROJECT_ROOT / ".agents" / "skills" / "latent-media" / "keys.env")
    if not args.dry_run and not os.environ.get("LATENT_IMAGE_KEY"):
        print("Error: LATENT_IMAGE_KEY not found in environment or keys.env", file=sys.stderr)
        return 1

    presets = json.loads(PRESETS_FILE.read_text(encoding="utf-8"))
    neg_single, neg_grid = load_negatives()
    if args.extra_negative.strip():
        extra = args.extra_negative.strip().strip(",")
        neg_single = f"{neg_single}, {extra}"
        neg_grid = f"{neg_grid}, {extra}"
    pack_dir = PROJECT_ROOT / "public" / "characters" / args.name
    raw_dir = pack_dir / "raw"
    archive_dir = raw_dir / "archive"
    ref_dir = pack_dir / "reference"
    trace_dir = pack_dir / "trace"
    if not args.dry_run:
        raw_dir.mkdir(parents=True, exist_ok=True)
        ref_dir.mkdir(parents=True, exist_ok=True)
        trace_dir.mkdir(parents=True, exist_ok=True)
        if args.ref_image:
            ref_src = Path(args.ref_image)
            if ref_src.is_file():
                ref_dst = ref_dir / f"ref_source{ref_src.suffix.lower() or '.png'}"
                shutil.copy2(ref_src, ref_dst)
                print(f"[REF] Preserved reference image -> {ref_dst}")

    now_iso = datetime.datetime.now().isoformat(timespec="seconds")
    dna_spec_path = ref_dir / "dna_spec.json"
    if not args.dry_run:
        dna_spec = {
            "name": args.name,
            "updated_at": now_iso,
            "dna": args.dna,
            "bg": args.bg,
            "mode": args.mode,
            "base_seed": args.seed,
            "steps": args.steps,
            "sampler": args.sampler,
            "scheduler": args.scheduler,
            "resolution": args.resolution,
            "negative_single": neg_single,
            "negative_grid": neg_grid,
            "notes": args.notes,
        }
        dna_spec_path.write_text(json.dumps(dna_spec, ensure_ascii=False, indent=2), encoding="utf-8")

    log_path = pack_dir / "generation_log.json"
    trace_jsonl = trace_dir / "generation_trace.jsonl"
    log_data = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else {"name": args.name, "dna": args.dna, "runs": []}
    log_data["dna"] = args.dna
    log_data["base_seed"] = args.seed

    dna_full = ensure_bg_tag(args.dna.strip().rstrip(","), args.bg)
    seed_to_use = args.seed + args.seed_offset

    tasks: list[tuple[str, str, str]] = []
    if args.mode == "grid_2x2":
        all_groups = presets["grid_groups"]
        chosen = [g.strip() for g in args.groups.split(",") if g.strip()] or list(all_groups.keys())
        for g in chosen:
            if g not in all_groups:
                print(f"Unknown grid group: {g}. Available: {list(all_groups.keys())}", file=sys.stderr)
                return 1
            gp = all_groups[g]["grid_prompt"]
            if args.bg == "green":
                gp = gp.replace("white background", "solid chroma key green background")
            prompt = f"{gp}, {dna_full}"
            tasks.append((g, prompt, neg_grid))
    else:
        all_slots = presets["slots"]
        chosen = [s.strip() for s in args.only.split(",") if s.strip()] or list(all_slots.keys())
        for s in chosen:
            if s not in all_slots:
                print(f"Unknown slot: {s}. Available: {list(all_slots.keys())}", file=sys.stderr)
                return 1
            tail = all_slots[s]["prompt_tail"]
            prompt = f"{dna_full}, centered, {tail}"
            tasks.append((s, prompt, neg_single))

    for stem, prompt, negative in tasks:
        existing = [p for p in raw_dir.glob(f"{stem}.*") if p.is_file()]
        if existing and not args.force and not args.dry_run:
            print(f"[SKIP] {stem} already exists ({existing[0].name}); pass --force to regenerate.")
            continue
        if existing and args.force and not args.dry_run:
            archive_dir.mkdir(parents=True, exist_ok=True)
            stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            for old_f in existing:
                dst = archive_dir / f"{old_f.stem}_{stamp}{old_f.suffix}"
                shutil.move(str(old_f), str(dst))
                print(f"[ARCHIVE] Preserved previous attempt -> {dst.name}")
        res = run_latent_image(
            prompt=prompt,
            negative=negative,
            out_dir=raw_dir,
            stem=stem,
            seed=seed_to_use,
            resolution=args.resolution,
            steps=args.steps,
            sampler=args.sampler,
            scheduler=args.scheduler,
            dry_run=args.dry_run,
        )
        if not args.dry_run:
            trace_entry = {
                **res,
                "timestamp": datetime.datetime.now().isoformat(timespec="seconds"),
                "mode": args.mode,
                "prompt": prompt,
                "negative": negative,
                "requested_seed": seed_to_use,
                "steps": args.steps,
                "sampler": args.sampler,
                "scheduler": args.scheduler,
                "resolution": args.resolution,
            }
            log_data["runs"].append(trace_entry)
            log_path.write_text(json.dumps(log_data, ensure_ascii=False, indent=2), encoding="utf-8")
            with trace_jsonl.open("a", encoding="utf-8") as tf:
                tf.write(json.dumps(trace_entry, ensure_ascii=False) + "\n")

    print(f"\nDone. Next step:\n  python .agents/skills/video-sprite-pack/scripts/process_sprites.py --pack public/characters/{args.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
