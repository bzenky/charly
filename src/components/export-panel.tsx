"use client";

import type { ReactNode } from "react";

type ExportPanelProps = {
  baseName: string;
  disabled: boolean;
  error: string | null;
  onBaseNameChange: (value: string) => void;
  onExportPng: () => void | Promise<void>;
  onExportSvg: () => void | Promise<void>;
};

function ExportButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        void onClick();
      }}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-4 py-2.5 text-sm font-medium text-slate-950 transition-all duration-200 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
    >
      {children}
    </button>
  );
}

export function ExportPanel({
  baseName,
  disabled,
  error,
  onBaseNameChange,
  onExportPng,
  onExportSvg,
}: ExportPanelProps) {
  return (
    <section
      aria-disabled={disabled}
      className={`min-w-0 rounded-3xl border p-5 shadow-lg shadow-slate-950/10 transition ${
        disabled
          ? "border-slate-800/70 bg-slate-900/40 opacity-60"
          : "border-slate-800 bg-slate-900/70"
      } transition-colors duration-200`}
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">4. Export</h2>
        <p className="mt-1 text-sm text-slate-300">
          Download a raster PNG or a crisp SVG for your README.
        </p>
      </div>

      <label className="mb-2 block text-sm font-medium text-slate-200">Filename</label>
      <input
        type="text"
        value={baseName}
        onChange={(event) => {
          onBaseNameChange(event.target.value);
        }}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 transition-colors duration-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-400"
        spellCheck={false}
      />

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ExportButton disabled={disabled} onClick={onExportPng}>
          Export PNG
        </ExportButton>
        <ExportButton disabled={disabled} onClick={onExportSvg}>
          Export SVG
        </ExportButton>
      </div>

      <div
        aria-hidden={!disabled}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          disabled
            ? "mt-4 max-h-16 translate-y-0 opacity-100"
            : "max-h-0 -translate-y-1 opacity-0"
        }`}
      >
        <p className="text-sm text-slate-400">Upload an image to enable exports.</p>
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
