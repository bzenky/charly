import type {
  CharacterPresetKey,
  CharacterPresetSelection,
} from "@/types/ascii";

export const CHARACTER_PRESETS: Record<CharacterPresetKey, string> = {
  detailed:
    "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  blocks: "█▓▒░ ",
  minimal: "#*:. ",
  binary: "10 ",
  letters: "ABCDEFGHI ",
};

export const PRESET_OPTIONS: Array<{
  key: CharacterPresetSelection;
  label: string;
}> = [
  { key: "detailed", label: "Detailed" },
  { key: "blocks", label: "Blocks" },
  { key: "minimal", label: "Minimal" },
  { key: "binary", label: "Binary" },
  { key: "letters", label: "Letters" },
  { key: "custom", label: "Custom" },
];

export function findPresetForCharacterSet(
  characterSet: string,
): CharacterPresetKey | null {
  for (const [presetKey, presetValue] of Object.entries(CHARACTER_PRESETS)) {
    if (presetValue === characterSet) {
      return presetKey as CharacterPresetKey;
    }
  }

  return null;
}
