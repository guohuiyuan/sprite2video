export type MotionPreset =
  | "pop_in"
  | "float_idle"
  | "shake_angry"
  | "nod"
  | "bounce_happy";

export type SfxName =
  | "whoosh"
  | "pop"
  | "ding"
  | "sparkle"
  | "tick"
  | "stamp"
  | "thud"
  | "mallet"
  | "click"
  | "chime";

export type SpritePlacement = "bottom" | "corner" | "right" | "left" | "center";

export type BackgroundVariant =
  | "sunburst"
  | "grid3d"
  | "spectrum"
  | "coderain"
  | "paper";

export interface SpriteEntry {
  id: string;
  label: string;
  file: string;
  framing: string;
  emotions: string[];
  triggers: string[];
  audio_tags: string[];
  default_motion: MotionPreset;
  default_sfx: SfxName;
  anchor: { x: number; y: number };
  size: [number, number];
}

export interface CharacterManifest {
  schema: string;
  character: {
    id: string;
    name: string;
    default_pose: string;
    canvas: [number, number];
  };
  sprites: SpriteEntry[];
}

export interface RoutedBeat {
  index: number;
  raw_text: string;
  subtitle_zh: string;
  subtitle_en?: string;
  audio_tags: string[];
  duration_sec: number;
  duration_frames: number;
  pose: string;
  pose_label: string;
  sprite_file: string;
  motion: MotionPreset;
  sfx: SfxName;
}
