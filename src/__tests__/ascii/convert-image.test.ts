import { describe, expect, it } from "vitest";
import {
  adjustChannel,
  calculateBrightness,
  calculateRows,
  compositeRgba,
  getCharacter,
  parseHexColor,
} from "@/lib/ascii/convert-image";

describe("convert-image helpers", () => {
  it("calculates brightness with the expected weighted formula", () => {
    expect(calculateBrightness(255, 255, 255)).toBeCloseTo(255, 10);
    expect(Math.round(calculateBrightness(255, 0, 0))).toBe(54);
  });

  it("maps dark pixels to denser characters by default", () => {
    expect(getCharacter(0, "@%#*+=-:. ", false)).toBe("@");
    expect(getCharacter(255, "@%#*+=-:. ", false)).toBe(" ");
  });

  it("supports inverted brightness mapping", () => {
    expect(getCharacter(0, "@%#*+=-:. ", true)).toBe(" ");
    expect(getCharacter(255, "@%#*+=-:. ", true)).toBe("@");
  });

  it("calculates rows with monospace aspect-ratio correction", () => {
    expect(calculateRows(80, 400, 400)).toBe(44);
    expect(calculateRows(80, 800, 400)).toBe(22);
  });

  it("adjusts channels with brightness and contrast", () => {
    expect(adjustChannel(128, 0, 0)).toBe(128);
    expect(adjustChannel(128, 10, 0)).toBeGreaterThan(128);
    expect(adjustChannel(128, -10, 0)).toBeLessThan(128);
  });

  it("parses hex colors and composites transparency", () => {
    expect(parseHexColor("#abc")).toEqual({ red: 170, green: 187, blue: 204 });
    expect(parseHexColor("#123456")).toEqual({ red: 18, green: 52, blue: 86 });
    expect(
      compositeRgba(
        { red: 255, green: 0, blue: 0 },
        128,
        { red: 0, green: 0, blue: 0 },
      ),
    ).toEqual({ red: 128, green: 0, blue: 0 });
  });
});
