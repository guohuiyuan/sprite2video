import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import type { SfxName } from "../types/storyboard";

export interface SfxSpec {
  src: string;
  volume: number;
  /** Frames before cue to start audio so peak aligns with cut/hit */
  hitOffsetFrames: number;
}

export const SFX_REGISTRY: Record<SfxName, SfxSpec> = {
  whoosh: { src: "sfx/whoosh.wav", volume: 0.30, hitOffsetFrames: 5 },
  pop: { src: "sfx/pop.wav", volume: 0.32, hitOffsetFrames: 0 },
  ding: { src: "sfx/ding.wav", volume: 0.34, hitOffsetFrames: 0 },
  sparkle: { src: "sfx/sparkle.wav", volume: 0.32, hitOffsetFrames: 0 },
  tick: { src: "sfx/tick.wav", volume: 0.24, hitOffsetFrames: 0 },
  stamp: { src: "sfx/stamp.wav", volume: 0.38, hitOffsetFrames: 0 },
  thud: { src: "sfx/thud.wav", volume: 0.34, hitOffsetFrames: 0 },
  mallet: { src: "sfx/mallet.wav", volume: 0.36, hitOffsetFrames: 0 },
  click: { src: "sfx/click.wav", volume: 0.34, hitOffsetFrames: 0 },
  chime: { src: "sfx/chime.wav", volume: 0.38, hitOffsetFrames: 0 },
};

export interface SfxCue {
  frame: number;
  sound: SfxName;
  volumeMultiplier?: number;
}

const MIN_GAP_FRAMES = 10; // ~0.33s at 30fps: prevents audio clutter
const REPEAT_ATTENUATION = 0.65;
const MAX_CLIP_FRAMES = 45;

export const planSfxCues = (cues: SfxCue[]) => {
  const planned: Array<SfxCue & { startFrame: number; volume: number }> = [];
  for (const cue of [...cues].sort((a, b) => a.frame - b.frame)) {
    const spec = SFX_REGISTRY[cue.sound];
    if (!spec) continue;
    const startFrame = Math.max(0, cue.frame - spec.hitOffsetFrames);
    const prev = planned[planned.length - 1];
    if (prev && startFrame - prev.startFrame < MIN_GAP_FRAMES) {
      continue;
    }
    const repeated = prev?.sound === cue.sound;
    const vol =
      spec.volume *
      (cue.volumeMultiplier ?? 1) *
      (repeated ? REPEAT_ATTENUATION : 1);
    planned.push({ ...cue, startFrame, volume: vol });
  }
  return planned;
};

export const SfxTrack: React.FC<{ cues: SfxCue[] }> = ({ cues }) => {
  const planned = planSfxCues(cues);
  return (
    <>
      {planned.map((cue, idx) => (
        <Sequence
          key={`${idx}-${cue.startFrame}-${cue.sound}`}
          from={cue.startFrame}
          durationInFrames={MAX_CLIP_FRAMES}
        >
          <Audio src={staticFile(SFX_REGISTRY[cue.sound].src)} volume={cue.volume} />
        </Sequence>
      ))}
    </>
  );
};
