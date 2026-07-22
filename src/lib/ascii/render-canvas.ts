import {
  ASCII_FONT_FAMILY,
  CELL_WIDTH_FACTOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_PADDING,
} from "@/lib/ascii/render-constants";
import type { AsciiResult, AsciiSettings } from "@/types/ascii";

export type CanvasRenderOptions = {
  fontSize?: number;
  lineHeight?: number;
  padding?: number;
};

export function estimateCellWidth(fontSize: number): number {
  return fontSize * CELL_WIDTH_FACTOR;
}

export function rgbaToCss(
  red: number,
  green: number,
  blue: number,
  alpha: number,
): string {
  const normalizedAlpha = Math.max(0, Math.min(1, alpha / 255));
  return `rgba(${red}, ${green}, ${blue}, ${normalizedAlpha})`;
}

export function renderAsciiToCanvas(
  canvas: HTMLCanvasElement,
  result: AsciiResult,
  settings: AsciiSettings,
  options: CanvasRenderOptions = {},
): { width: number; height: number } {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  const fontSize = options.fontSize ?? 12;
  const lineHeight = options.lineHeight ?? DEFAULT_LINE_HEIGHT;
  const padding = options.padding ?? DEFAULT_PADDING;
  const cellWidth = estimateCellWidth(fontSize);
  const lineHeightPx = fontSize * lineHeight;
  const width = Math.ceil(result.columns * cellWidth + padding * 2);
  const height = Math.ceil(result.rows * lineHeightPx + padding * 2);

  canvas.width = width;
  canvas.height = height;

  context.clearRect(0, 0, width, height);

  if (!settings.transparentBackground) {
    context.fillStyle = settings.backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  context.font = `${fontSize}px ${ASCII_FONT_FAMILY}`;
  context.textBaseline = "top";
  context.textAlign = "left";
  context.imageSmoothingEnabled = true;

  for (let rowIndex = 0; rowIndex < result.rows; rowIndex += 1) {
    const row = result.cells[rowIndex];

    for (let columnIndex = 0; columnIndex < result.columns; columnIndex += 1) {
      const cell = row[columnIndex];

      if (!cell || cell.character === " ") {
        continue;
      }

      context.fillStyle = rgbaToCss(cell.red, cell.green, cell.blue, cell.alpha);
      context.fillText(
        cell.character,
        padding + columnIndex * cellWidth,
        padding + rowIndex * lineHeightPx,
      );
    }
  }

  return { width, height };
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("The browser could not create an export file."));
        return;
      }

      resolve(blob);
    }, type);
  });
}
