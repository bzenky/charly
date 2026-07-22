"use client";

import { useEffect, useMemo, useState } from "react";
import { AsciiPreview } from "@/components/ascii-preview";
import { AvatarUploader } from "@/components/avatar-uploader";
import { ControlsPanel } from "@/components/controls-panel";
import { ExportPanel } from "@/components/export-panel";
import { MarkdownSnippet } from "@/components/markdown-snippet";
import { convertImageToAscii } from "@/lib/ascii/convert-image";
import {
  buildDownloadFilename,
  downloadBlob,
  sanitizeBaseName,
} from "@/lib/ascii/download-file";
import { loadImageFromFile } from "@/lib/ascii/load-image";
import { createMarkdownSnippet } from "@/lib/ascii/markdown";
import {
  CHARACTER_PRESETS,
  findPresetForCharacterSet,
} from "@/lib/ascii/presets";
import {
  DEFAULT_EXPORT_FONT_SIZE,
  DEFAULT_PADDING,
} from "@/lib/ascii/render-constants";
import { canvasToBlob, renderAsciiToCanvas } from "@/lib/ascii/render-canvas";
import { renderAsciiToSvg } from "@/lib/ascii/render-svg";
import {
  MAX_IMAGE_FILE_SIZE,
  validateImageFile,
} from "@/lib/ascii/validate-image";
import type {
  AsciiResult,
  AsciiSettings,
  CharacterPresetKey,
  CharacterPresetSelection,
} from "@/types/ascii";

const DEFAULT_PRESET: CharacterPresetKey = "detailed";
const DEFAULT_SETTINGS: AsciiSettings = {
  columns: 72,
  characterSet: CHARACTER_PRESETS[DEFAULT_PRESET],
  outputMode: "color",
  foregroundColor: "#f8fafc",
  backgroundColor: "#020617",
  brightness: 0,
  contrast: 0,
  invert: false,
  transparentBackground: false,
};

type ExportFormat = "png" | "svg";

function deriveDefaultBaseName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  return `${sanitizeBaseName(withoutExtension)}-ascii`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function AsciiAvatarApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<CharacterPresetSelection>(DEFAULT_PRESET);
  const [settings, setSettings] = useState<AsciiSettings>(DEFAULT_SETTINGS);
  const [asciiResult, setAsciiResult] = useState<AsciiResult | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportBaseName, setExportBaseName] = useState("ascii-avatar");
  const [lastExportFormat, setLastExportFormat] = useState<ExportFormat>("svg");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  useEffect(() => {
    let cancelled = false;

    if (!selectedFile) {
      setSourceImage(null);
      setAsciiResult(null);
      return;
    }

    setIsLoadingImage(true);
    setProcessingError(null);

    loadImageFromFile(selectedFile)
      .then((image) => {
        if (cancelled) {
          return;
        }

        setSourceImage(image);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setSourceImage(null);
        setAsciiResult(null);
        setUploadError(getErrorMessage(error));
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingImage(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedFile]);

  useEffect(() => {
    if (!sourceImage) {
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);

    const timeoutId = window.setTimeout(() => {
      try {
        setAsciiResult(convertImageToAscii(sourceImage, settings));
      } catch (error: unknown) {
        setAsciiResult(null);
        setProcessingError(getErrorMessage(error));
      } finally {
        setIsProcessing(false);
      }
    }, 75);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [sourceImage, settings]);

  useEffect(() => {
    setCopyStatus("idle");
  }, [exportBaseName, lastExportFormat]);

  const markdownSnippet = useMemo(() => {
    const fileName = buildDownloadFilename(exportBaseName, lastExportFormat);
    return createMarkdownSnippet(fileName);
  }, [exportBaseName, lastExportFormat]);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      return;
    }

    const validation = validateImageFile(file, MAX_IMAGE_FILE_SIZE);

    if (!validation.ok) {
      setUploadError(validation.error);
      return;
    }

    setUploadError(null);
    setExportError(null);
    setSelectedFile(file);
    setExportBaseName(deriveDefaultBaseName(file.name));
  };

  const handleSettingsChange = (nextSettings: Partial<AsciiSettings>) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      ...nextSettings,
    }));
  };

  const handlePresetChange = (presetKey: CharacterPresetSelection) => {
    setSelectedPreset(presetKey);

    if (presetKey === "custom") {
      return;
    }

    handleSettingsChange({ characterSet: CHARACTER_PRESETS[presetKey] });
  };

  const handleCharacterSetChange = (characterSet: string) => {
    const nextCharacterSet = characterSet || " ";
    const matchingPreset = findPresetForCharacterSet(nextCharacterSet);

    setSelectedPreset(matchingPreset ?? "custom");
    handleSettingsChange({ characterSet: nextCharacterSet });
  };

  const handleExportPng = async () => {
    if (!asciiResult) {
      return;
    }

    try {
      setExportError(null);

      const canvas = document.createElement("canvas");
      renderAsciiToCanvas(canvas, asciiResult, settings, {
        fontSize: DEFAULT_EXPORT_FONT_SIZE,
        padding: DEFAULT_PADDING,
      });

      const blob = await canvasToBlob(canvas, "image/png");
      const fileName = buildDownloadFilename(exportBaseName, "png");

      downloadBlob(blob, fileName);
      setLastExportFormat("png");
    } catch (error: unknown) {
      setExportError(getErrorMessage(error));
    }
  };

  const handleExportSvg = () => {
    if (!asciiResult) {
      return;
    }

    try {
      setExportError(null);

      const svg = renderAsciiToSvg(asciiResult, settings, {
        fontSize: DEFAULT_EXPORT_FONT_SIZE,
        padding: DEFAULT_PADDING,
      });
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const fileName = buildDownloadFilename(exportBaseName, "svg");

      downloadBlob(blob, fileName);
      setLastExportFormat("svg");
    } catch (error: unknown) {
      setExportError(getErrorMessage(error));
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownSnippet);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">
              Charly
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Turn an avatar into README-ready ASCII art
            </h1>
            <p className="max-w-3xl text-sm text-slate-300 sm:text-base">
              Upload a JPG, PNG, or WebP image, tune the ASCII output in real time,
              then export it as PNG or SVG. All processing stays local in your
              browser.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            <p className="font-medium">Runs entirely in your browser</p>
            <p className="text-cyan-50/80">Your image never leaves the browser.</p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <AvatarUploader
            previewUrl={previewUrl}
            error={uploadError}
            isLoading={isLoadingImage}
            onFileSelect={handleFileSelect}
          />

          <ControlsPanel
            selectedPreset={selectedPreset}
            settings={settings}
            disabled={!selectedFile}
            onPresetChange={handlePresetChange}
            onCharacterSetChange={handleCharacterSetChange}
            onSettingsChange={handleSettingsChange}
          />
        </div>

        <div className="space-y-6">
          <AsciiPreview
            result={asciiResult}
            settings={settings}
            isProcessing={isProcessing || isLoadingImage}
            error={processingError}
          />

          <ExportPanel
            baseName={exportBaseName}
            disabled={!selectedFile || !asciiResult}
            error={exportError}
            onBaseNameChange={setExportBaseName}
            onExportPng={handleExportPng}
            onExportSvg={handleExportSvg}
          />

          <MarkdownSnippet
            disabled={!selectedFile}
            copyStatus={copyStatus}
            snippet={markdownSnippet}
            onCopy={handleCopyMarkdown}
          />
        </div>
      </section>
    </main>
  );
}
