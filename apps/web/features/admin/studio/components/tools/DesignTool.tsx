"use client";

import type {
  AdminSceneDesign,
  AdminSceneDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

const backgrounds: NonNullable<AdminSceneDesign["background"]>[] = [
  "white",
  "soft-blue",
  "dark-lecture",
  "gradient",
  "mesh",
];

const layouts: NonNullable<AdminSceneDesign["layout"]>[] = [
  "centered",
  "split",
  "hero",
  "stacked",
  "formula",
  "comparison",
];

const themes: NonNullable<AdminSceneDesign["theme"]>[] = [
  "modern-learning",
  "scientific",
  "minimal",
  "exam-mode",
];
const shadows: NonNullable<AdminSceneDesign["shadow"]>[] = [
  "none",
  "soft",
  "deep",
];
const spacingOptions: NonNullable<AdminSceneDesign["spacing"]>[] = [
  "compact",
  "comfortable",
  "spacious",
];

const colorPalettes = [
  {
    accent: "#1557c0",
    background: "#ffffff",
    label: "Faazhi blue",
    text: "#0f172a",
  },
  {
    accent: "#0f766e",
    background: "#f0fdfa",
    label: "Scientific teal",
    text: "#134e4a",
  },
  {
    accent: "#7c3aed",
    background: "#f5f3ff",
    label: "Motion violet",
    text: "#1e1b4b",
  },
  {
    accent: "#b45309",
    background: "#fffbeb",
    label: "Exam amber",
    text: "#451a03",
  },
  {
    accent: "#e2e8f0",
    background: "#0f172a",
    label: "Dark lecture",
    text: "#f8fafc",
  },
];

export function DesignTool({
  onUpdateScene,
  scene,
}: {
  onUpdateScene: (sceneId: string, updates: Partial<AdminSceneDraft>) => void;
  scene?: AdminSceneDraft;
}) {
  function updateDesign(updates: AdminSceneDesign) {
    if (!scene) return;
    onUpdateScene(scene.id, {
      design: {
        ...scene.design,
        ...updates,
      },
    });
  }

  if (!scene) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
        Select a scene to edit its visual design.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Scene background
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {backgrounds.map((background) => (
            <button
              key={background}
              type="button"
              onClick={() => updateDesign({ background })}
              className={[
                "rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition",
                scene.design?.background === background
                  ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0]"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {background.replace("-", " ")}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Color palette
        </p>
        <div className="mt-3 space-y-2">
          {colorPalettes.map((palette) => {
            const active =
              scene.design?.backgroundColor === palette.background &&
              scene.design?.accentColor === palette.accent;

            return (
              <button
                key={palette.label}
                type="button"
                onClick={() =>
                  updateDesign({
                    accentColor: palette.accent,
                    backgroundColor: palette.background,
                    textColor: palette.text,
                  })
                }
                className={[
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition",
                  active
                    ? "border-[#1557c0] bg-[#eaf2ff]"
                    : "border-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="text-xs font-semibold text-slate-700">
                  {palette.label}
                </span>
                <span className="flex items-center gap-1">
                  {[palette.background, palette.accent, palette.text].map(
                    (color) => (
                      <span
                        key={color}
                        className="h-5 w-5 rounded-full ring-1 ring-slate-200"
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3">
          <ColorField
            label="Background"
            value={scene.design?.backgroundColor ?? "#ffffff"}
            onChange={(backgroundColor) => updateDesign({ backgroundColor })}
          />
          <ColorField
            label="Accent"
            value={scene.design?.accentColor ?? "#1557c0"}
            onChange={(accentColor) => updateDesign({ accentColor })}
          />
          <ColorField
            label="Text"
            value={scene.design?.textColor ?? "#0f172a"}
            onChange={(textColor) => updateDesign({ textColor })}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Layout
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {layouts.map((layout) => (
            <button
              key={layout}
              type="button"
              onClick={() => updateDesign({ layout })}
              className={[
                "rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition",
                scene.design?.layout === layout
                  ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0]"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {layout.replace("-", " ")}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Theme
        </p>
        <div className="mt-3 space-y-2">
          {themes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => updateDesign({ theme })}
              className={[
                "w-full rounded-xl border px-3 py-2 text-left text-xs font-semibold capitalize transition",
                scene.design?.theme === theme
                  ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0]"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {theme.replace("-", " ")}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Scene surface
        </p>

        <div className="mt-3">
          <label className="text-xs font-semibold text-slate-600">
            Corner radius
          </label>
          <input
            type="range"
            min={8}
            max={32}
            value={scene.design?.radius ?? 28}
            onChange={(event) =>
              updateDesign({ radius: Number(event.target.value) })
            }
            className="mt-2 w-full accent-[#1557c0]"
          />
          <div className="mt-1 text-right text-xs font-semibold text-slate-500">
            {scene.design?.radius ?? 28}px
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-600">Shadow</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {shadows.map((shadow) => (
              <button
                key={shadow}
                type="button"
                onClick={() => updateDesign({ shadow })}
                className={[
                  "rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition",
                  (scene.design?.shadow ?? "soft") === shadow
                    ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {shadow}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-600">Spacing</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {spacingOptions.map((spacing) => (
              <button
                key={spacing}
                type="button"
                onClick={() => updateDesign({ spacing })}
                className={[
                  "rounded-xl border px-2 py-2 text-xs font-semibold capitalize transition",
                  (scene.design?.spacing ?? "comfortable") === spacing
                    ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0]"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {spacing}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ColorField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <span className="flex items-center gap-2">
        <input
          aria-label={`${label} color`}
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-8 cursor-pointer rounded-md border border-slate-200 bg-white p-0.5"
        />
        <input
          aria-label={`${label} hex value`}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-20 rounded-lg border border-slate-200 px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1557c0]"
        />
      </span>
    </label>
  );
}
