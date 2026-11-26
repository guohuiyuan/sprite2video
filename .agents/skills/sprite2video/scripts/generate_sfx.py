#!/usr/bin/env python3
"""
Deterministic royalty-free SFX synthesizer for programmatic videos.
Generates 7 crisp WAV sound effects into public/sfx/ with zero external audio assets.
"""
from __future__ import annotations

import argparse
import math
import wave
from pathlib import Path

import numpy as np

SR = 44100


def write_wav(path: Path, samples: np.ndarray) -> None:
    samples = np.clip(samples, -1.0, 1.0)
    # 2ms anti-click fade in/out
    edge = max(1, int(0.002 * SR))
    if len(samples) > edge * 2:
        samples[:edge] *= np.linspace(0.0, 1.0, edge)
        samples[-edge:] *= np.linspace(1.0, 0.0, edge)
    pcm = (samples * 32767.0).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


def sfx_pop() -> np.ndarray:
    dur = 0.11
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    p = t / dur
    freq = 320.0 + 780.0 * (1.0 - p) ** 1.6
    phase = 2.0 * math.pi * np.cumsum(freq) / SR
    env = np.exp(-26.0 * t) * np.minimum(1.0, t / 0.004)
    return 0.85 * np.sin(phase) * env


def sfx_whoosh() -> np.ndarray:
    dur = 0.36
    n = int(SR * dur)
    rng = np.random.default_rng(42)
    noise = rng.standard_normal(n)
    # Simple moving-average band shaping swept over time
    t = np.linspace(0, dur, n, endpoint=False)
    p = t / dur
    # Bell envelope peaking at ~60% (clean cut hit-point)
    env = np.sin(math.pi * (p ** 0.8)) ** 2.2
    # Lowpass-like smoothing via FFT bandpass
    freqs = np.fft.rfftfreq(n, 1.0 / SR)
    spec = np.fft.rfft(noise)
    band = np.exp(-0.5 * ((freqs - 900.0) / 550.0) ** 2)
    shaped = np.fft.irfft(spec * band, n=n)
    shaped /= max(1e-6, np.max(np.abs(shaped)))
    # Add subtle rising tonal swoosh
    tone_f = 180.0 + 520.0 * p
    tone = 0.25 * np.sin(2.0 * math.pi * np.cumsum(tone_f) / SR)
    return 0.78 * (0.8 * shaped + tone) * env


def sfx_ding() -> np.ndarray:
    dur = 0.55
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    # Bright bell chord (E6 + B6 overtone)
    s = (
        0.65 * np.sin(2 * math.pi * 1318.5 * t) * np.exp(-7.5 * t)
        + 0.30 * np.sin(2 * math.pi * 2637.0 * t) * np.exp(-13.0 * t)
        + 0.15 * np.sin(2 * math.pi * 1975.5 * t) * np.exp(-10.0 * t)
    )
    return 0.85 * s


def sfx_sparkle() -> np.ndarray:
    dur = 0.48
    n = int(SR * dur)
    t = np.linspace(0, dur, n, endpoint=False)
    notes = [1046.5, 1318.5, 1568.0, 2093.0]  # C6 E6 G6 C7 arpeggio
    out = np.zeros(n)
    for i, f in enumerate(notes):
        start = i * 0.055
        local = np.maximum(0.0, t - start)
        mask = t >= start
        out[mask] += 0.4 * np.sin(2 * math.pi * f * local[mask]) * np.exp(-12.0 * local[mask])
        out[mask] += 0.15 * np.sin(2 * math.pi * f * 2 * local[mask]) * np.exp(-20.0 * local[mask])
    return 0.85 * out / max(1.0, np.max(np.abs(out)))


def sfx_tick() -> np.ndarray:
    dur = 0.045
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    s = (
        0.7 * np.sin(2 * math.pi * 1800.0 * t) * np.exp(-120.0 * t)
        + 0.35 * np.sin(2 * math.pi * 3400.0 * t) * np.exp(-180.0 * t)
    )
    return 0.8 * s


def sfx_stamp() -> np.ndarray:
    dur = 0.24
    n = int(SR * dur)
    t = np.linspace(0, dur, n, endpoint=False)
    # Punchy low pitch drop + short impact noise burst
    f = 190.0 * np.exp(-18.0 * t) + 52.0
    body = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-14.0 * t)
    rng = np.random.default_rng(7)
    slap = rng.standard_normal(n) * np.exp(-55.0 * t) * 0.35
    out = body + slap
    return 0.9 * out / max(1e-6, np.max(np.abs(out)))


def sfx_thud() -> np.ndarray:
    dur = 0.22
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    f = 135.0 * np.exp(-14.0 * t) + 48.0
    s = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-16.0 * t)
    return 0.85 * s


def sfx_mallet() -> np.ndarray:
    """Cuongit-style warm two-note wooden mallet rise (E5 -> A5) for scene/carry transitions."""
    dur = 0.34
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    out = np.zeros_like(t)
    for i, freq in enumerate((659.25, 880.0)):
        start = i * 0.07
        mask = t >= start
        local = t[mask] - start
        body = np.sin(2 * math.pi * freq * local) * np.exp(-14.0 * local)
        strike = 0.25 * np.sin(2 * math.pi * freq * 4.0 * local) * np.exp(-40.0 * local)
        out[mask] += body + strike
    return 0.85 * out / max(1e-6, np.max(np.abs(out)))


def sfx_click() -> np.ndarray:
    """Crisp tactile mouse/UI click bound to cursor press & toggle actions."""
    dur = 0.04
    n = int(SR * dur)
    t = np.linspace(0, dur, n, endpoint=False)
    rng = np.random.default_rng(19)
    transient = rng.standard_normal(n) * np.exp(-220.0 * t) * 0.55
    body = np.sin(2 * math.pi * 2400.0 * t) * np.exp(-150.0 * t) * 0.65
    low = np.sin(2 * math.pi * 920.0 * t) * np.exp(-95.0 * t) * 0.35
    out = transient + body + low
    return 0.88 * out / max(1e-6, np.max(np.abs(out)))


def sfx_chime() -> np.ndarray:
    """Cuongit-style warm C6-E6-G6 bell arpeggio for outro & milestone emphasis."""
    dur = 1.05
    t = np.linspace(0, dur, int(SR * dur), endpoint=False)
    out = np.zeros_like(t)
    for i, freq in enumerate((1046.5, 1318.5, 1568.0)):
        start = i * 0.09
        mask = t >= start
        local = t[mask] - start
        out[mask] += (
            np.sin(2 * math.pi * freq * local) + 0.3 * np.sin(2 * math.pi * freq * 2.0 * local)
        ) * np.exp(-6.0 * local)
    return 0.82 * out / max(1e-6, np.max(np.abs(out)))


def main() -> int:
    parser = argparse.ArgumentParser(description="Synthesize royalty-free video SFX WAV files")
    parser.add_argument("-o", "--out", default="public/sfx", help="Output directory")
    args = parser.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    generators = {
        "pop": sfx_pop,
        "whoosh": sfx_whoosh,
        "ding": sfx_ding,
        "sparkle": sfx_sparkle,
        "tick": sfx_tick,
        "stamp": sfx_stamp,
        "thud": sfx_thud,
        "mallet": sfx_mallet,
        "click": sfx_click,
        "chime": sfx_chime,
    }
    for name, fn in generators.items():
        wav_path = out_dir / f"{name}.wav"
        write_wav(wav_path, fn())
        print(f"[SFX] {wav_path.name} ({wav_path.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
