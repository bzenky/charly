const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateImageFile(
  file: File,
  maxSize = MAX_IMAGE_FILE_SIZE,
): ImageValidationResult {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return {
      ok: false,
      error: "Please choose a JPG, PNG, or WebP image.",
    };
  }

  if (file.size > maxSize) {
    const maxSizeInMb = Math.round((maxSize / (1024 * 1024)) * 10) / 10;

    return {
      ok: false,
      error: `Image files must be ${maxSizeInMb} MB or smaller.`,
    };
  }

  return { ok: true };
}
