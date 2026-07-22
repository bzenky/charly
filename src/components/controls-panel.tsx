"use client";

import type { ReactNode } from "react";
import { PRESET_OPTIONS } from "@/lib/ascii/presets";
import type {
  AsciiSettings,
  CharacterPresetSelection,
} from "@/types/ascii";

type ControlsPanelProps = {
  selectedPreset: CharacterPresetSelection;
  settings: AsciiSettings;
  disabled: boolean;
  onPresetChange: (presetKey: CharacterPresetSelection) => void;
  onCharacterSetChange: (characterSet: string) => void;
  onSettingsChange: (nextSettings: Partial<AsciiSettings>) => void;
};

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-slate-200">{children}</label>;
}

export function ControlsPanel({
  selectedPreset,
  settings,
  disabled,
  onPresetChange,
  onCharacterSetChange,
  onSettingsChange,
}: ControlsPanelProps) {
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
        <h2 className="text-base font-semibold text-white">2. Customize output</h2>
        <p className="mt-1 text-sm text-slate-300">
          Tune resolution, characters, and color behavior.
        </p>
      </div>

      <div className="space-y-5">
        <div
          aria-hidden={!disabled}
          className={`overflow-hidden transition-all duration-300 ease-out ${
            disabled
              ? "max-h-20 translate-y-0 opacity-100"
              : "max-h-0 -translate-y-1 opacity-0"
          }`}
        >
          <p className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-400">
            Upload an image to unlock the customization controls.
          </p>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
            <span className="font-medium">Columns</span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-100">
              {settings.columns}
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={120}
            step={1}
            value={settings.columns}
            onChange={(event) => {
              onSettingsChange({ columns: Number(event.target.value) });
            }}
            disabled={disabled}
            className="w-full accent-cyan-400 transition-all duration-200 disabled:cursor-not-allowed disabled:accent-slate-600"
          />
        </div>

        <div>
          <FieldLabel>Character preset</FieldLabel>
          <select
            value={selectedPreset}
            onChange={(event) => {
              onPresetChange(event.target.value as CharacterPresetSelection);
            }}
            disabled={disabled}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 transition-colors duration-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-400"
          >
            {PRESET_OPTIONS.map((preset) => (
              <option key={preset.key} value={preset.key}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Characters</FieldLabel>
          <input
            type="text"
            value={settings.characterSet}
            onChange={(event) => {
              onCharacterSetChange(event.target.value || " ");
            }}
            disabled={disabled}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 transition-colors duration-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-400"
            spellCheck={false}
          />
          <p className="mt-2 text-xs text-slate-400">
            Denser characters should appear earlier in the string. A longer ramp usually
            produces a more recognizable result.
          </p>
        </div>

        <div>
          <FieldLabel>Output mode</FieldLabel>
          <select
            value={settings.outputMode}
            onChange={(event) => {
              onSettingsChange({ outputMode: event.target.value as AsciiSettings["outputMode"] });
            }}
            disabled={disabled}
            className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 transition-colors duration-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-400"
          >
            <option value="color">Color</option>
            <option value="monochrome">Monochrome</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Background color</FieldLabel>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(event) => {
                  onSettingsChange({ backgroundColor: event.target.value });
                }}
                disabled={disabled}
                className="h-10 w-12 rounded border-0 bg-transparent p-0 transition-opacity duration-200 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-slate-200">{settings.backgroundColor}</span>
            </div>
          </div>

          <div>
            <FieldLabel>Monochrome color</FieldLabel>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/60 px-3 py-2">
              <input
                type="color"
                value={settings.foregroundColor}
                onChange={(event) => {
                  onSettingsChange({ foregroundColor: event.target.value });
                }}
                disabled={disabled}
                className="h-10 w-12 rounded border-0 bg-transparent p-0 transition-opacity duration-200 disabled:cursor-not-allowed"
              />
              <span className="text-sm text-slate-200">{settings.foregroundColor}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
            <span className="font-medium">Brightness</span>
            <span>{settings.brightness}</span>
          </div>
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={settings.brightness}
            onChange={(event) => {
              onSettingsChange({ brightness: Number(event.target.value) });
            }}
            disabled={disabled}
            className="w-full accent-cyan-400 transition-all duration-200 disabled:cursor-not-allowed disabled:accent-slate-600"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
            <span className="font-medium">Contrast</span>
            <span>{settings.contrast}</span>
          </div>
          <input
            type="range"
            min={-100}
            max={100}
            step={1}
            value={settings.contrast}
            onChange={(event) => {
              onSettingsChange({ contrast: Number(event.target.value) });
            }}
            disabled={disabled}
            className="w-full accent-cyan-400 transition-all duration-200 disabled:cursor-not-allowed disabled:accent-slate-600"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={settings.invert}
              onChange={(event) => {
                onSettingsChange({ invert: event.target.checked });
              }}
              disabled={disabled}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 accent-cyan-400 transition-all duration-200 disabled:cursor-not-allowed disabled:accent-slate-600"
            />
            Invert brightness
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/50 px-3 py-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={settings.transparentBackground}
              onChange={(event) => {
                onSettingsChange({ transparentBackground: event.target.checked });
              }}
              disabled={disabled}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400 accent-cyan-400 transition-all duration-200 disabled:cursor-not-allowed disabled:accent-slate-600"
            />
            Transparent background
          </label>
        </div>
      </div>
    </section>
  );
}
