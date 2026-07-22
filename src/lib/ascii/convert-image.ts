import type { AsciiResult, AsciiSettings } from "@/types/ascii";

export const DEFAULT_CHARACTER_ASPECT_RATIO = 0.55;

export type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculateBrightness(
  red: number,
  green: number,
  blue: number,
): number {
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function adjustChannel(
  value: number,
  brightness: number,
  contrast: number,
): number {
  const contrastFactor = (contrast + 100) / 100;
  const contrasted = ((value / 255 - 0.5) * contrastFactor + 0.5) * 255;
  const brightened = contrasted + (brightness / 100) * 255;

  return clamp(Math.round(brightened), 0, 255);
}

export function parseHexColor(color: string): RgbColor {
  const normalized = color.trim().replace(/^#/, "");

  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    return {
      red: Number.parseInt(normalized[0] + normalized[0], 16),
      green: Number.parseInt(normalized[1] + normalized[1], 16),
      blue: Number.parseInt(normalized[2] + normalized[2], 16),
    };
  }

  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return {
      red: Number.parseInt(normalized.slice(0, 2), 16),
      green: Number.parseInt(normalized.slice(2, 4), 16),
      blue: Number.parseInt(normalized.slice(4, 6), 16),
    };
  }

  return { red: 0, green: 0, blue: 0 };
}

export function compositeRgba(
  foreground: RgbColor,
  alpha: number,
  background: RgbColor,
): RgbColor {
  const normalizedAlpha = clamp(alpha / 255, 0, 1);

  return {
    red: Math.round(
      foreground.red * normalizedAlpha + background.red * (1 - normalizedAlpha),
    ),
    green: Math.round(
      foreground.green * normalizedAlpha + background.green * (1 - normalizedAlpha),
    ),
    blue: Math.round(
      foreground.blue * normalizedAlpha + background.blue * (1 - normalizedAlpha),
    ),
  };
}

export function calculateRows(
  columns: number,
  imageWidth: number,
  imageHeight: number,
  characterAspectRatio = DEFAULT_CHARACTER_ASPECT_RATIO,
): number {
  if (columns <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return 1;
  }

  return Math.max(
    1,
    Math.round(columns * (imageHeight / imageWidth) * characterAspectRatio),
  );
}

export function getCharacter(
  brightness: number,
  characters: string,
  invert: boolean,
): string {
  const normalizedCharacters = characters.length > 0 ? characters : " ";
  const normalizedBrightness = clamp(brightness / 255, 0, 1);
  const value = invert ? 1 - normalizedBrightness : normalizedBrightness;
  const index = Math.min(
    normalizedCharacters.length - 1,
    Math.floor(value * normalizedCharacters.length),
  );

  return normalizedCharacters[index] ?? " ";
}

export function convertImageToAscii(
  image: HTMLImageElement,
  settings: AsciiSettings,
): AsciiResult {
  const columns = clamp(Math.round(settings.columns), 20, 120);
  const rows = calculateRows(
    columns,
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
  );
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Canvas is not available in this browser.");
  }

  canvas.width = columns;
  canvas.height = rows;
  context.clearRect(0, 0, columns, rows);
  context.drawImage(image, 0, 0, columns, rows);

  const imageData = context.getImageData(0, 0, columns, rows);
  const cells = [] as AsciiResult["cells"];
  const backgroundColor = parseHexColor(settings.backgroundColor);
  const foregroundColor = parseHexColor(settings.foregroundColor);
  const brightnessBackground = settings.transparentBackground
    ? { red: 255, green: 255, blue: 255 }
    : backgroundColor;
  const characters = settings.characterSet || " ";

  for (let rowIndex = 0; rowIndex < rows; rowIndex += 1) {
    const row = [] as AsciiResult["cells"][number];

    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const pixelIndex = (rowIndex * columns + columnIndex) * 4;
      const sourceAlpha = imageData.data[pixelIndex + 3];
      const sampledColor = {
        red: adjustChannel(
          imageData.data[pixelIndex],
          settings.brightness,
          settings.contrast,
        ),
        green: adjustChannel(
          imageData.data[pixelIndex + 1],
          settings.brightness,
          settings.contrast,
        ),
        blue: adjustChannel(
          imageData.data[pixelIndex + 2],
          settings.brightness,
          settings.contrast,
        ),
      };
      const brightnessSample = compositeRgba(
        sampledColor,
        sourceAlpha,
        brightnessBackground,
      );
      const brightness = calculateBrightness(
        brightnessSample.red,
        brightnessSample.green,
        brightnessSample.blue,
      );
      const character =
        sourceAlpha < 12 ? " " : getCharacter(brightness, characters, settings.invert);
      const displayColor =
        settings.outputMode === "monochrome" ? foregroundColor : sampledColor;
      const finalColor = settings.transparentBackground
        ? displayColor
        : compositeRgba(displayColor, sourceAlpha, backgroundColor);
      const finalAlpha = settings.transparentBackground ? sourceAlpha : 255;

      row.push({
        character,
        red: finalColor.red,
        green: finalColor.green,
        blue: finalColor.blue,
        alpha: finalAlpha,
      });
    }

    cells.push(row);
  }

  return {
    columns,
    rows,
    cells,
    sourceWidth: image.naturalWidth || image.width,
    sourceHeight: image.naturalHeight || image.height,
    characterAspectRatio: DEFAULT_CHARACTER_ASPECT_RATIO,
  };
}
