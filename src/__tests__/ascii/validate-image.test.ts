import { describe, expect, it } from "vitest";
import { MAX_IMAGE_FILE_SIZE, validateImageFile } from "@/lib/ascii/validate-image";

describe("validateImageFile", () => {
  it("accepts supported image types within the size limit", () => {
    const file = new File([new Uint8Array([1, 2, 3])], "avatar.png", {
      type: "image/png",
    });

    expect(validateImageFile(file)).toEqual({ ok: true });
  });

  it("rejects unsupported image types", () => {
    const file = new File(["hello"], "avatar.gif", { type: "image/gif" });

    expect(validateImageFile(file)).toEqual({
      ok: false,
      error: "Please choose a JPG, PNG, or WebP image.",
    });
  });

  it("rejects oversized images", () => {
    const file = new File([new Uint8Array(MAX_IMAGE_FILE_SIZE + 1)], "big.png", {
      type: "image/png",
    });

    expect(validateImageFile(file)).toEqual({
      ok: false,
      error: "Image files must be 10 MB or smaller.",
    });
  });
});
