"use client";

import { useId, useState } from "react";

type AvatarUploaderProps = {
  previewUrl: string | null;
  error: string | null;
  isLoading: boolean;
  onFileSelect: (file: File | null) => void;
};

export function AvatarUploader({
  previewUrl,
  error,
  isLoading,
  onFileSelect,
}: AvatarUploaderProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-slate-950/10">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white">1. Upload avatar</h2>
          <p className="mt-1 text-sm text-slate-300">
            Supports JPG, PNG, and WebP up to 10 MB.
          </p>
        </div>
        {isLoading ? (
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
            Loading...
          </span>
        ) : null}
      </div>

      <label
        htmlFor={inputId}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          onFileSelect(event.dataTransfer.files?.[0] ?? null);
        }}
        className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition ${
          isDragging
            ? "border-cyan-400 bg-cyan-400/10"
            : "border-slate-700 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-950/60"
        }`}
      >
        <span className="text-sm font-medium text-white">
          Drop an image here or click to browse
        </span>
        <span className="mt-2 text-xs text-slate-400">
          Files stay on your device and are processed locally.
        </span>
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          onFileSelect(event.target.files?.[0] ?? null);
          event.currentTarget.value = "";
        }}
      />

      {error ? (
        <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/40">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Original uploaded avatar preview"
            className="aspect-square w-full object-cover"
          />
        ) : (
          <div className="flex aspect-square items-center justify-center px-6 text-center text-sm text-slate-400">
            Upload an avatar to generate a live ASCII preview.
          </div>
        )}
      </div>
    </section>
  );
}
