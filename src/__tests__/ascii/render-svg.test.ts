import { describe, expect, it } from "vitest";
import { renderAsciiToSvg } from "@/lib/ascii/render-svg";
import type { AsciiResult, AsciiSettings } from "@/types/ascii";

const result: AsciiResult = {
  columns: 2,
  rows: 1,
  cells: [
    [
      { character: "<", red: 255, green: 255, blue: 255, alpha: 255 },
      { character: "&", red: 0, green: 255, blue: 255, alpha: 128 },
    ],
  ],
  sourceWidth: 2,
  sourceHeight: 1,
  characterAspectRatio: 0.55,
};

const settings: AsciiSettings = {
  columns: 2,
  characterSet: "@# ",
  outputMode: "color",
  foregroundColor: "#ffffff",
  backgroundColor: "#000000",
  brightness: 0,
  contrast: 0,
  invert: false,
  transparentBackground: false,
};

describe("renderAsciiToSvg", () => {
  it("creates standalone svg output and escapes text content", () => {
    const svg = renderAsciiToSvg(result, settings, { fontSize: 16, padding: 8 });

    expect(svg).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    expect(svg).toContain("<svg ");
    expect(svg).toContain("&lt;");
    expect(svg).toContain("&amp;");
    expect(svg).toContain("<rect width=\"100%\" height=\"100%\" fill=\"#000000\" />");
  });

  it("omits the background rectangle for transparent exports", () => {
    const svg = renderAsciiToSvg(result, {
      ...settings,
      transparentBackground: true,
    });

    expect(svg).not.toContain("<rect width=\"100%\" height=\"100%\"");
  });
});
