export type OutputMode = "color" | "monochrome";

export type CharacterPresetKey =
  | "detailed"
  | "blocks"
  | "minimal"
  | "binary"
  | "letters";

export type CharacterPresetSelection = CharacterPresetKey | "custom";

export type AsciiSettings = {
  columns: number;
  characterSet: string;
  outputMode: OutputMode;
  foregroundColor: string;
  backgroundColor: string;
  brightness: number;
  contrast: number;
  invert: boolean;
  transparentBackground: boolean;
};

export type AsciiCell = {
  character: string;
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

export type AsciiResult = {
  columns: number;
  rows: number;
  cells: AsciiCell[][];
  sourceWidth: number;
  sourceHeight: number;
  characterAspectRatio: number;
};
