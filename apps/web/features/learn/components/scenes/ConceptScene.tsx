import type { Scene } from "../../types";

export function ConceptScene({ scene }: { scene: Scene }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#dbeafe_0%,#f8fbff_38%,#eef4ff_100%)] p-10 text-center">
      <div className="absolute inset-x-0 top-10 mx-auto h-44 w-44 rounded-full bg-[#1557c0]/10 blur-3xl" />
      <div className="relative max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1557c0]">
          {scene.eyebrow ?? "Concept"}
        </p>
        <h2 className="mt-4 font-serif-paper text-5xl font-semibold text-foreground">
          {scene.title}
        </h2>

        {scene.diagram ? (
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {scene.diagram.bits.map((bit) => (
              <div
                key={`${bit.value}-${bit.bit}`}
                className={[
                  "min-w-16 rounded-xl border px-4 py-3 shadow-sm transition",
                  bit.active
                    ? "border-[#1557c0] bg-[#1557c0] text-white"
                    : "border-border bg-white/75 text-foreground",
                ].join(" ")}
              >
                <p className="text-3xl font-semibold">{bit.bit}</p>
                <p className="mt-1 text-xs opacity-70">{bit.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        <p className="mx-auto mt-8 max-w-2xl text-xl font-semibold leading-8 text-foreground/80">
          {scene.narration}
        </p>

        {scene.diagram?.result ? (
          <p className="mt-5 text-lg font-semibold text-[#1557c0]">
            {scene.diagram.result}
          </p>
        ) : null}
      </div>
    </div>
  );
}
