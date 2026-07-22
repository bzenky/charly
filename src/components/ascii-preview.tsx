"use client";

import { useEffect, useRef } from "react";
import {
  DEFAULT_PREVIEW_FONT_SIZE,
  DEFAULT_PADDING,
} from "@/lib/ascii/render-constants";
import { renderAsciiToCanvas } from "@/lib/ascii/render-canvas";
import type { AsciiResult, AsciiSettings } from "@/types/ascii";

type AsciiPreviewProps = {
  result: AsciiResult | null;
  settings: AsciiSettings;
  isProcessing: boolean;
  error: string | null;
};

const checkerboardBackground = {
  backgroundColor: "#0f172a",
  backgroundImage:
    "linear-gradient(45deg, rgba(148, 163, 184, 0.18) 25%, transparent 25%), linear-gradient(-45deg, rgba(148, 163, 184, 0.18) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(148, 163, 184, 0.18) 75%), linear-gradient(-45deg, transparent 75%, rgba(148, 163, 184, 0.18) 75%)",
  backgroundSize: "20px 20px",
  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
} as const;

export function AsciiPreview({
  result,
  settings,
  isProcessing,
  error,
}: AsciiPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!result || !canvasRef.current) {
      return;
    }

    renderAsciiToCanvas(canvasRef.current, result, settings, {
      fontSize: DEFAULT_PREVIEW_FONT_SIZE,
      padding: DEFAULT_PADDING,
    });
  }, [result, settings]);

  return (
    <section className="min-w-0 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">3. Live preview</h2>
          <p className="mt-1 text-sm text-slate-300">
            Rendered with a monospace canvas preview.
          </p>
        </div>
        {result ? (
          <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
            {result.columns} × {result.rows}
          </div>
        ) : null}
      </div>

      <div
        className="flex min-h-[280px] min-w-0 items-center justify-center overflow-auto rounded-2xl border border-slate-800 p-3 sm:min-h-[420px] sm:p-4"
        style={settings.transparentBackground ? checkerboardBackground : { backgroundColor: settings.backgroundColor }}
      >
        {error ? (
          <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
            {error}
          </p>
        ) : isProcessing ? (
          <p className="text-sm text-slate-200">Generating ASCII preview...</p>
        ) : result ? (
          <canvas
            ref={canvasRef}
            className="h-auto max-w-full rounded-xl shadow-xl shadow-slate-950/30"
            aria-label="Charly ASCII preview"
          />
        ) : (
          <p className="max-w-md text-center text-sm text-slate-300">
            Upload an image to see the generated ASCII art here.
          </p>
        )}
      </div>
    </section>
  );
}
