#!/usr/bin/env python3
"""
Post-process raw character images into clean, anchor-aligned transparent PNG sprites:
  1. Auto-slice 2x2 grid sheets (grid_*.png) into quadrant slots
  2. Outer-border floodfill background removal (preserves enclosed white clothes/eyes!)
     + gentle anti-aliased fringe decontamination (eliminates white halo on dark video BGs)
  3. Subject bounding-box normalization & bottom-center anchor alignment (no jump on pose swap)
  4. Checkerboard QA contact sheet (contact-sheet.png) + QQ-show semantic manifest.json
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

SKILL_DIR = Path(__file__).resolve().parent.parent
PRESETS_FILE = SKILL_DIR / "presets" / "pose_slots.json"
IMAGE_EXTS = {".png", ".webp", ".jpg", ".jpeg"}


def detect_bg_color(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    border = np.concatenate(
        [
            rgb[0, :, :],
            rgb[h - 1, :, :],
            rgb[:, 0, :],
            rgb[:, w - 1, :],
        ],
        axis=0,
    )
    return np.median(border, axis=0).astype(np.float32)


def cutout_solid_background(pil_img: Image.Image, tol: float = 28.0, soft_band: float = 18.0) -> Image.Image:
    """
    Remove outer solid backdrop (white or chroma green/blue) via border-seeded floodfill,
    preserving interior white clothing/eyes protected by anime lineart, then softly
    feather & decontaminate the 1-2px outer halo.
    """
    rgba = np.array(pil_img.convert("RGBA"))
    rgb = rgba[:, :, :3].astype(np.float32)
    h, w, _ = rgb.shape

    bg = detect_bg_color(rgb)
    dist = np.linalg.norm(rgb - bg[None, None, :], axis=2)

    # Candidate background pixels: within tol of detected backdrop color
    bg_candidate = (dist <= tol).astype(np.uint8)

    # Connected components on bg_candidate; keep components touching the outer border
    num_labels, labels = cv2.connectedComponents(bg_candidate, connectivity=4)
    border_labels = set(
        np.concatenate([labels[0, :], labels[h - 1, :], labels[:, 0], labels[:, w - 1]]).tolist()
    )
    border_labels.discard(0)

    is_outer_bg = np.isin(labels, list(border_labels))

    # Also catch clean inner pockets completely matching bg if they are large enough (>0.15% area)
    # and very close to bg color (e.g. gap between bent arm and torso) while sparing eyes/tiny shine
    strict_bg = (dist <= tol * 0.55).astype(np.uint8)
    n2, l2, stats, _ = cv2.connectedComponentsWithStats(strict_bg, connectivity=4)
    min_pocket = int(h * w * 0.0018)
    for lbl in range(1, n2):
        area = stats[lbl, cv2.CC_STAT_AREA]
        if area >= min_pocket:
            # Verify it's truly close to pure background color on average
            mask_lbl = l2 == lbl
            if float(dist[mask_lbl].mean()) < tol * 0.35:
                # Only treat as background if it does NOT sit in the upper-center face/shirt core
                cx = stats[lbl, cv2.CC_STAT_LEFT] + stats[lbl, cv2.CC_STAT_WIDTH] / 2
                cy = stats[lbl, cv2.CC_STAT_TOP] + stats[lbl, cv2.CC_STAT_HEIGHT] / 2
                in_core = (0.32 * w <= cx <= 0.68 * w) and (0.25 * h <= cy <= 0.85 * h)
                if not in_core:
                    is_outer_bg |= mask_lbl

    alpha = np.where(is_outer_bg, 0.0, 255.0).astype(np.float32)

    # Soft anti-aliased transition band ONLY on 2px perimeter touching outer bg
    bg_u8 = is_outer_bg.astype(np.uint8)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    near_bg = (cv2.dilate(bg_u8, kernel, iterations=1) > 0) & (~is_outer_bg)

    # For near-bg pixels whose color is close to backdrop, ramp alpha smoothly and defringe color
    ramp = np.clip((dist - tol * 0.7) / max(soft_band, 1.0), 0.0, 1.0)
    alpha[near_bg] = np.minimum(alpha[near_bg], ramp[near_bg] * 255.0)

    # Color decontamination on semi-transparent fringe pixels to kill white halo on dark BGs
    fringe = near_bg & (alpha > 0) & (alpha < 245)
    if np.any(fringe):
        a = np.clip(alpha[fringe] / 255.0, 0.15, 1.0)[:, None]
        fg = (rgb[fringe] - (1.0 - a) * bg[None, :]) / a
        rgb[fringe] = np.clip(fg, 0, 255)

    # Remove tiny stray 1-2px detached dust islands outside the main character
    fg_mask = (alpha > 20).astype(np.uint8)
    nf, lf, fstats, _ = cv2.connectedComponentsWithStats(fg_mask, connectivity=8)
    if nf > 2:
        max_area = max(fstats[1:, cv2.CC_STAT_AREA])
        for lbl in range(1, nf):
            if fstats[lbl, cv2.CC_STAT_AREA] < max(25, int(max_area * 0.0008)):
                alpha[lf == lbl] = 0.0

    out = np.dstack([rgb.astype(np.uint8), np.clip(alpha, 0, 255).astype(np.uint8)])
    return Image.fromarray(out, mode="RGBA")


def normalize_sprite(sprite: Image.Image, canvas_size: int = 1024, fill_ratio: float = 0.90) -> tuple[Image.Image, dict]:
    """Crop transparent margins, uniformly scale subject, and anchor bottom-center."""
    arr = np.array(sprite)
    ys, xs = np.where(arr[:, :, 3] > 24)
    if len(xs) == 0 or len(ys) == 0:
        blank = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        return blank, {"x": 0.5, "y": 1.0}

    x0, x1 = int(xs.min()), int(xs.max()) + 1
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    cropped = sprite.crop((x0, y0, x1, y1))
    cw, ch = cropped.size

    max_dim = int(canvas_size * fill_ratio)
    scale = min(max_dim / max(cw, 1), max_dim / max(ch, 1))
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    px = (canvas_size - nw) // 2
    py = canvas_size - nh  # bottom-anchored so character never floats/jumps when swapping poses
    canvas.paste(resized, (px, py), resized)
    return canvas, {"x": 0.5, "y": 1.0}


def slice_grid_2x2(img: Image.Image, trim_px: int = 4) -> list[Image.Image]:
    w, h = img.size
    mx, my = w // 2, h // 2
    boxes = [
        (0, 0, mx - trim_px, my - trim_px),        # top-left
        (mx + trim_px, 0, w, my - trim_px),        # top-right
        (0, my + trim_px, mx - trim_px, h),        # bottom-left
        (mx + trim_px, my + trim_px, w, h),        # bottom-right
    ]
    return [img.crop(b) for b in boxes]


def make_checkerboard(w: int, h: int, tile: int = 16) -> Image.Image:
    y, x = np.indices((h, w))
    board = (((x // tile) + (y // tile)) % 2 == 0)
    c1 = np.array([220, 224, 232, 255], dtype=np.uint8)
    c2 = np.array([188, 194, 206, 255], dtype=np.uint8)
    arr = np.where(board[:, :, None], c1, c2)
    return Image.fromarray(arr, mode="RGBA")


def make_paper_tile(w: int, h: int, grid: int = 24) -> Image.Image:
    """Warm Capdim-style graph-paper tile for consistency QA preview."""
    arr = np.full((h, w, 4), [235, 232, 217, 255], dtype=np.uint8)
    arr[::grid, :, :3] = [214, 210, 195]
    arr[:, ::grid, :3] = [214, 210, 195]
    return Image.fromarray(arr, mode="RGBA")


def add_die_cut_border(sprite: Image.Image, border_px: int = 8) -> Image.Image:
    """Preview crisp white die-cut sticker outline around transparent sprite."""
    arr = np.array(sprite.convert("RGBA"))
    alpha = (arr[:, :, 3] > 32).astype(np.uint8) * 255
    k = border_px * 2 + 1
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    dilated = cv2.dilate(alpha, kernel, iterations=1)
    border_layer = np.zeros_like(arr)
    border_layer[:, :, :3] = 255
    border_layer[:, :, 3] = dilated
    base = Image.fromarray(border_layer, mode="RGBA")
    base.alpha_composite(sprite)
    return base


def build_consistency_sheet(
    items: list[tuple[str, str, Image.Image]],
    ref_dir: Path,
    out_path: Path,
    cell: int = 300,
    cols: int = 5,
) -> None:
    """Build side-by-side consistency QA sheet: reference image + all sprites as die-cut stickers on graph paper."""
    tiles: list[tuple[str, Image.Image, bool]] = []
    if ref_dir.exists():
        for rp in sorted(ref_dir.iterdir()):
            if rp.suffix.lower() in IMAGE_EXTS:
                ref_img = Image.open(rp).convert("RGBA")
                rw, rh = ref_img.size
                s = min((cell - 24) / max(rw, 1), (cell - 24) / max(rh, 1))
                thumb = ref_img.resize((max(1, int(rw * s)), max(1, int(rh * s))), Image.Resampling.LANCZOS)
                box = Image.new("RGBA", (cell, cell), (32, 34, 42, 255))
                box.alpha_composite(thumb, ((cell - thumb.width) // 2, (cell - thumb.height) // 2))
                tiles.append(("REFERENCE", box, True))
                break

    paper = make_paper_tile(cell, cell)
    for slot_id, label, sprite in items:
        sticker = add_die_cut_border(sprite, border_px=12)
        thumb = sticker.resize((cell, cell), Image.Resampling.LANCZOS)
        tile = paper.copy()
        tile.alpha_composite(thumb, (0, 0))
        tiles.append((f"{slot_id} ({label})", tile, False))

    if not tiles:
        return
    cols = min(cols, len(tiles))
    rows = math.ceil(len(tiles) / cols)
    label_h = 36
    pad = 16
    W = cols * cell + (cols + 1) * pad
    H = rows * (cell + label_h) + (rows + 1) * pad
    sheet = Image.new("RGBA", (W, H), (28, 27, 25, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 17)
    except Exception:
        font = ImageFont.load_default()

    for idx, (caption, tile, is_ref) in enumerate(tiles):
        r, c = divmod(idx, cols)
        x = pad + c * (cell + pad)
        y = pad + r * (cell + label_h + pad)
        sheet.alpha_composite(tile, (x, y))
        bar_col = (180, 38, 48, 255) if is_ref else (22, 22, 26, 255)
        draw.rectangle([x, y + cell, x + cell, y + cell + label_h], fill=bar_col)
        draw.text((x + 10, y + cell + 7), caption, fill=(250, 250, 250, 255), font=font)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.convert("RGB").save(out_path, "PNG")


def build_contact_sheet(items: list[tuple[str, str, Image.Image]], out_path: Path, cell: int = 320, cols: int = 4) -> None:
    if not items:
        return
    cols = min(cols, len(items))
    rows = math.ceil(len(items) / cols)
    label_h = 38
    pad = 16
    W = cols * cell + (cols + 1) * pad
    H = rows * (cell + label_h) + (rows + 1) * pad

    sheet = Image.new("RGBA", (W, H), (24, 28, 38, 255))
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 18)
    except Exception:
        font = ImageFont.load_default()

    checker = make_checkerboard(cell, cell)
    for idx, (slot_id, label, sprite) in enumerate(items):
        r, c = divmod(idx, cols)
        x = pad + c * (cell + pad)
        y = pad + r * (cell + label_h + pad)
        sheet.paste(checker, (x, y))
        thumb = sprite.resize((cell, cell), Image.Resampling.LANCZOS)
        sheet.alpha_composite(thumb, (x, y))
        draw.rectangle([x, y + cell, x + cell, y + cell + label_h], fill=(15, 19, 28, 255))
        draw.text((x + 10, y + cell + 8), f"{slot_id}  ({label})", fill=(240, 244, 255, 255), font=font)

    sheet.convert("RGB").save(out_path, "PNG")


def main() -> int:
    parser = argparse.ArgumentParser(description="Slice, cutout, normalize, and manifest a character sprite pack")
    parser.add_argument("--pack", required=True, help="Path to character pack dir (e.g. public/characters/demo-chibi)")
    parser.add_argument("--canvas", type=int, default=1024, help="Output square PNG size")
    parser.add_argument("--tol", type=float, default=28.0, help="Background floodfill color distance tolerance")
    parser.add_argument("--fill-ratio", type=float, default=0.90, help="Subject fill ratio on output canvas")
    parser.add_argument("--display-name", default="", help="Human-readable character name for manifest.json")
    args = parser.parse_args()

    pack_dir = Path(args.pack).resolve()
    raw_dir = pack_dir / "raw"
    sprites_dir = pack_dir / "sprites"
    sprites_dir.mkdir(parents=True, exist_ok=True)

    if not raw_dir.exists():
        raise SystemExit(f"Raw directory not found: {raw_dir}")

    presets = json.loads(PRESETS_FILE.read_text(encoding="utf-8"))
    grid_groups = presets["grid_groups"]
    slot_meta = presets["slots"]

    raw_images = sorted(p for p in raw_dir.iterdir() if p.suffix.lower() in IMAGE_EXTS)
    if not raw_images:
        raise SystemExit(f"No raw images found in {raw_dir}")

    # Collect (slot_id, PIL.Image, source_name)
    # Single-sprite files override grid quadrants of the same slot_id (so HD rerolls win!)
    collected: dict[str, tuple[Image.Image, str]] = {}

    for p in raw_images:
        stem = p.stem
        img = Image.open(p)
        if stem in grid_groups:
            quads = slice_grid_2x2(img)
            for slot_id, qimg in zip(grid_groups[stem]["quadrants"], quads):
                if slot_id not in collected:
                    collected[slot_id] = (qimg, f"raw/{p.name}")
        elif stem.startswith("grid_"):
            quads = slice_grid_2x2(img)
            for idx, qimg in enumerate(quads, 1):
                slot_id = f"{stem}_q{idx}"
                collected[slot_id] = (qimg, f"raw/{p.name}")
        else:
            collected[stem] = (img, f"raw/{p.name}")

    pack_name = pack_dir.name
    manifest_sprites = []
    sheet_items: list[tuple[str, str, Image.Image]] = []

    for slot_id, (raw_img, source_rel) in collected.items():
        cut = cutout_solid_background(raw_img, tol=args.tol)
        norm, anchor = normalize_sprite(cut, canvas_size=args.canvas, fill_ratio=args.fill_ratio)
        out_png = sprites_dir / f"{slot_id}.png"
        norm.save(out_png, "PNG")

        meta = slot_meta.get(slot_id, {})
        label = meta.get("label", slot_id)
        entry = {
            "id": slot_id,
            "label": label,
            "file": f"characters/{pack_name}/sprites/{slot_id}.png",
            "source": source_rel,
            "framing": meta.get("framing", "bust"),
            "emotions": meta.get("emotions", ["neutral"]),
            "triggers": meta.get("triggers", []),
            "audio_tags": meta.get("audio_tags", []),
            "default_motion": meta.get("default_motion", "pop_in"),
            "default_sfx": meta.get("default_sfx", "pop"),
            "anchor": anchor,
            "size": [args.canvas, args.canvas],
        }
        manifest_sprites.append(entry)
        sheet_items.append((slot_id, label, norm))
        print(f"[SPRITE] {slot_id:16s} ({label}) <- {source_rel}")

    contact_path = pack_dir / "contact-sheet.png"
    build_contact_sheet(sheet_items, contact_path)

    consistency_path = pack_dir / "consistency" / "consistency_sheet.png"
    build_consistency_sheet(sheet_items, pack_dir / "reference", consistency_path)

    sprite_ids = [s["id"] for s in manifest_sprites]
    preferred_default = next(
        (pid for pid in ("wave_happy", "happy_point", "curious") if pid in sprite_ids),
        sprite_ids[0] if sprite_ids else "wave_happy",
    )
    manifest = {
        "schema": "video-sprite-pack/v1",
        "character": {
            "id": pack_name,
            "name": args.display_name or pack_name,
            "default_pose": preferred_default,
            "canvas": [args.canvas, args.canvas],
        },
        "sprites": manifest_sprites,
    }
    manifest_path = pack_dir / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nSaved {len(manifest_sprites)} transparent sprites -> {sprites_dir}")
    print(f"Contact sheet -> {contact_path}")
    print(f"Manifest      -> {manifest_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
