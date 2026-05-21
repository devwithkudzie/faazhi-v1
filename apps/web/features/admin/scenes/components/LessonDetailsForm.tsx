export function LessonDetailsForm() {
  return (
    <section className="rounded-[28px] bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-950">
          Lesson details
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Start with the lesson title and where it sits in the subject.
        </p>
      </div>

      <div className="space-y-4">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Lesson title
          </span>
          <input
            defaultValue="Binary number systems"
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Paper/module
            </span>
            <select className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100">
              <option>Paper 1</option>
              <option>Paper 2</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Topic</span>
            <select className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100">
              <option>Information Representation</option>
              <option>Communication and Networking</option>
            </select>
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Learning goal
          </span>
          <textarea
            defaultValue="Students should understand how binary place values represent denary numbers and why computers use 0s and 1s."
            rows={4}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>
    </section>
  );
}
