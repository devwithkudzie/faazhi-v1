"use client";

import { BookOpenCheck, Clock3, FileCheck2, Sparkles } from "lucide-react";
import type { LearnCurriculum, TopicNode } from "../../types";

export type AssessmentTarget =
  | { type: "topic"; topic: TopicNode }
  | { type: "module"; curriculum: LearnCurriculum };

export function AssessmentIntroPanel({
  assessment,
  onStart,
}: {
  assessment: AssessmentTarget;
  onStart: () => void;
}) {
  const isModule = assessment.type === "module";
  const title = isModule
    ? assessment.curriculum.moduleAssessment.title
    : assessment.topic.title;
  const duration = isModule
    ? assessment.curriculum.moduleAssessment.durationLabel
    : assessment.topic.topicalAssessment.durationLabel;

  return (
    <div className="flex h-full overflow-y-auto bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col px-8 py-14">
        <div className="mb-10">
          <h1 className="text-5xl font-light tracking-tight text-slate-950">
            {title}
          </h1>
          <button
            type="button"
            className="mt-8 text-lg font-semibold text-[#1557c0] transition hover:underline"
          >
            Review learning objectives
          </button>
        </div>

        <section className="rounded-2xl bg-[#f4f7fd] p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-2xl font-semibold text-slate-700">
                <Sparkles className="h-5 w-5 text-[#1557c0]" />
                coach
              </div>
              <p className="mt-5 text-lg leading-8 text-slate-800">
                Ready to review what you have learned before starting the
                assignment? I am here to help.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-lg border-2 border-[#1557c0] px-4 text-sm font-semibold text-[#1557c0] transition hover:bg-[#eaf2ff]"
            >
              <Sparkles className="h-4 w-4" />
              Help me practice
            </button>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-lg border-2 border-[#1557c0] px-4 text-sm font-semibold text-[#1557c0] transition hover:bg-[#eaf2ff]"
            >
              <Sparkles className="h-4 w-4" />
              Let&apos;s chat
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-[#eef5ff] p-8">
          <h2 className="text-lg font-semibold text-slate-950">
            Assignment details
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-[180px_1fr_auto]">
            <div>
              <p className="text-base font-semibold text-slate-500">Due</p>
              <p className="mt-1 text-base text-slate-600">
                {isModule ? "Timed attempt" : "Jun 1, 11:59 PM CAT"}
              </p>
            </div>

            <div>
              <p className="text-base font-semibold text-slate-500">
                {isModule ? "Duration" : "Attempts"}
              </p>
              <p className="mt-1 text-base text-slate-600">
                {isModule ? duration : "2 left (3 attempts every 23 hours)"}
              </p>
            </div>

            <button
              type="button"
              onClick={onStart}
              className="inline-flex h-14 items-center justify-center rounded-lg bg-[#1557c0] px-8 text-lg font-semibold text-white transition hover:bg-[#124aa3]"
            >
              {isModule ? "Start paper" : "Start"}
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8">
          <h2 className="text-lg font-semibold text-slate-950">Your grade</h2>
          <p className="mt-2 text-base text-slate-500">
            You have not submitted this yet. We keep your highest score.
          </p>
          <p className="mt-8 text-2xl font-semibold text-slate-500">--</p>
        </section>

        <div className="mt-12 flex flex-wrap gap-8 border-t border-slate-200 pt-5 text-sm font-semibold text-[#1557c0]">
          <button type="button" className="inline-flex items-center gap-2">
            <BookOpenCheck className="h-4 w-4" />
            Like
          </button>
          <button type="button" className="inline-flex items-center gap-2">
            <FileCheck2 className="h-4 w-4" />
            Dislike
          </button>
          <button type="button" className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            Report an issue
          </button>
        </div>
      </div>
    </div>
  );
}
