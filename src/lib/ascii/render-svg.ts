import {
  ASCII_FONT_FAMILY,
  CELL_WIDTH_FACTOR,
  DEFAULT_LINE_HEIGHT,
  DEFAULT_PADDING,
} from "@/lib/ascii/render-constants";
import { rgbaToCss } from "@/lib/ascii/render-canvas";
import type { AsciiResult, AsciiSettings } from "@/types/ascii";

export type SvgRenderOptions = {
  fontSize?: number;
  lineHeight?: number;
  padding?: number;
};

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function renderAsciiToSvg(
  result: AsciiResult,
  settings: AsciiSettings,
  options: SvgRenderOptions = {},
): string {
  const fontSize = options.fontSize ?? 16;
  const lineHeight = options.lineHeight ?? DEFAULT_LINE_HEIGHT;
  const padding = options.padding ?? DEFAULT_PADDING;
  const cellWidth = fontSize * CELL_WIDTH_FACTOR;
  const lineHeightPx = fontSize * lineHeight;
  const width = Math.ceil(result.columns * cellWidth + padding * 2);
  const height = Math.ceil(result.rows * lineHeightPx + padding * 2);
  const textElements: string[] = [];

  for (let rowIndex = 0; rowIndex < result.rows; rowIndex += 1) {
    const row = result.cells[rowIndex];

    for (let columnIndex = 0; columnIndex < result.columns; columnIndex += 1) {
      const cell = row[columnIndex];

      if (!cell || cell.character === " ") {
        continue;
      }

      const x = padding + columnIndex * cellWidth;
      const y = padding + rowIndex * lineHeightPx + fontSize;

      textElements.push(
        `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" fill="${rgbaToCss(
          cell.red,
          cell.green,
          cell.blue,
          cell.alpha,
        )}" font-size="${fontSize}" xml:space="preserve">${escapeXml(cell.character)}</text>`,
      );
    }
  }

  const background = settings.transparentBackground
    ? ""
    : `<rect width="100%" height="100%" fill="${escapeXml(settings.backgroundColor)}" />`;

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Charly ASCII avatar" font-family="${escapeXml(ASCII_FONT_FAMILY)}">`,
    background,
    ...textElements,
    `</svg>`,
  ]
    .filter(Boolean)
    .join("\n");
}
