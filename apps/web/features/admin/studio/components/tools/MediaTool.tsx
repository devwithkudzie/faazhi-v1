"use client";

import { Image, Music, Upload, Video } from "lucide-react";

const mediaTypes = [
  { label: "Image", icon: Image },
  { label: "Diagram / SVG", icon: Image },
  { label: "Video", icon: Video },
  { label: "Audio", icon: Music },
];

export function MediaTool() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Media library
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Keep media optimized for low-bandwidth lesson delivery.
        </p>

        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1557c0] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0f46a3]"
        >
          <Upload className="h-4 w-4" />
          Upload media
        </button>
      </section>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
          Add media block
        </p>
        <div className="mt-3 grid gap-2">
          {mediaTypes.map((type) => {
            const Icon = type.icon;

            return (
              <button
                key={type.label}
                type="button"
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#1557c0]/40 hover:bg-[#eaf2ff]"
              >
                <Icon className="h-4 w-4 text-[#1557c0]" />
                {type.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
