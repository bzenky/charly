"use client";

type MarkdownSnippetProps = {
  snippet: string;
  disabled: boolean;
  copyStatus: "idle" | "copied" | "error";
  onCopy: () => void | Promise<void>;
};

export function MarkdownSnippet({
  snippet,
  disabled,
  copyStatus,
  onCopy,
}: MarkdownSnippetProps) {
  return (
    <section
      aria-disabled={disabled}
      className={`min-w-0 rounded-3xl border p-5 shadow-lg shadow-slate-950/10 transition ${
        disabled
          ? "border-slate-800/70 bg-slate-900/40 opacity-60"
          : "border-slate-800 bg-slate-900/70"
      } transition-colors duration-200`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">5. Markdown snippet</h2>
          <p className="mt-1 text-sm text-slate-300">
            Copy this after exporting and adding the file to your repository.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void onCopy();
          }}
          disabled={disabled}
          className="rounded-2xl border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm font-medium text-slate-100 transition-all duration-200 hover:border-slate-500 hover:bg-slate-950 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-400"
        >
          Copy
        </button>
      </div>

      <pre className="max-w-full overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-cyan-100 transition-colors duration-200">
        <code>
          {disabled
            ? "Upload an image to generate a Markdown snippet."
            : snippet}
        </code>
      </pre>

      <div
        aria-hidden={!disabled}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          disabled
            ? "mt-3 max-h-16 translate-y-0 opacity-100"
            : "max-h-0 -translate-y-1 opacity-0"
        }`}
      >
        <p className="text-sm text-slate-400">
          Export a file first, then copy the generated Markdown.
        </p>
      </div>

      {copyStatus === "copied" ? (
        <p className="mt-3 text-sm text-emerald-300">Copied to clipboard.</p>
      ) : null}
      {copyStatus === "error" ? (
        <p className="mt-3 text-sm text-rose-300">
          Clipboard access failed. You can still copy the snippet manually.
        </p>
      ) : null}
    </section>
  );
}
