import {
  CheckSquare,
  Code2,
  FileQuestion,
  GitBranch,
  Lightbulb,
  PlaySquare,
} from "lucide-react";

const sceneTypes = [
  {
    label: "Concept",
    description: "Explain a core idea with narration and slides.",
    icon: Lightbulb,
  },
  {
    label: "Example",
    description: "Walk through a worked Cambridge-style example.",
    icon: PlaySquare,
  },
  {
    label: "Diagram",
    description: "Build a visual explanation or animated model.",
    icon: GitBranch,
  },
  {
    label: "Code",
    description: "Show pseudocode or programming logic.",
    icon: Code2,
  },
  {
    label: "Checkpoint",
    description: "Pause the lesson with an embedded question.",
    icon: CheckSquare,
  },
  {
    label: "Exam extract",
    description: "Use a digital-paper style question input.",
    icon: FileQuestion,
  },
];

export function SceneTypePicker() {
  return (
    <section className="rounded-[28px] bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-950">Scene types</h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose the first scene type. More scenes can be added after saving.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sceneTypes.map((scene, index) => {
          const Icon = scene.icon;
          const active = index === 0;

          return (
            <button
              key={scene.label}
              className={[
                "rounded-3xl p-4 text-left ring-1 transition",
                active
                  ? "bg-[#eaf2ff] ring-blue-200"
                  : "bg-slate-50 ring-slate-200 hover:bg-[#f5f9ff] hover:ring-blue-100",
              ].join(" ")}
            >
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#1557c0]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-950">
                {scene.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {scene.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
