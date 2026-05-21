import { CheckCircle2, Circle, FileQuestion, PlaySquare } from "lucide-react";

const topics = [
  {
    title: "Information Representation",
    lessons: ["Number systems", "Binary number systems", "Hexadecimal"],
    assessment: "Topical assessment",
  },
  {
    title: "Communication and Networking",
    lessons: ["Networks", "Protocols"],
    assessment: "Topical assessment",
  },
];

export function PaperStructurePanel() {
  return (
    <section className="rounded-[28px] bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-950">
          Paper lesson tree
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          This mirrors the student paper workspace, but with editing controls.
        </p>
      </div>

      <div className="space-y-4">
        {topics.map((topic) => (
          <div
            key={topic.title}
            className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200/70"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-slate-950">
                {topic.title}
              </h4>
              <span className="rounded-full bg-[#eaf2ff] px-2.5 py-1 text-xs font-bold text-[#1557c0]">
                {topic.lessons.length} lessons
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {topic.lessons.map((lesson, index) => (
                <div
                  key={lesson}
                  className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200/70"
                >
                  {index === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-300" />
                  )}
                  <PlaySquare className="h-4 w-4 text-[#1557c0]" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                    {lesson}
                  </span>
                </div>
              ))}

              <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-3 py-2 ring-1 ring-amber-100">
                <FileQuestion className="h-4 w-4 text-amber-700" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-amber-900">
                  {topic.assessment}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
