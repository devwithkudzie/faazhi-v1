"use client";

import { useMemo, useState } from "react";
import { CheckpointSurface } from "./CheckpointSurface";
import { CheckpointActions } from "./CheckpointActions";
import type { PaperQuestion, PaperQuestionPart, Scene } from "../../../types";

export function PaperCheckpoint({
  scene,
  paperQuestion,
  onContinueScene,
}: {
  scene: Scene;
  paperQuestion: PaperQuestion;
  onContinueScene?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const parts: PaperQuestionPart[] =
    paperQuestion.parts ??
    [
      {
        id: "main",
        label: paperQuestion.questionRef ?? "",
        prompt: paperQuestion.prompt,
        marks: paperQuestion.marks,
        answerFields: paperQuestion.answerFields,
      },
    ];

  const hasAnswer = useMemo(
    () => Object.values(answers).some((answer) => answer.trim().length > 0),
    [answers],
  );

  function retry() {
    setAnswers({});
  }

  return (
    <CheckpointSurface
      eyebrow={scene.eyebrow ?? "Digital paper checkpoint"}
      title={scene.title}
      icon={<span>📝</span>}
    >
      <div className="space-y-6">
        <div className="rounded-[26px] bg-[#f8fafc] p-3 shadow-inner">
          <div className="min-h-[440px] rounded-[22px] bg-white p-7 shadow-[0_22px_65px_rgba(15,23,42,0.10)]">
            
            {/* Minimal header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {paperQuestion.paperRef}
                </p>

                <h3 className="mt-1 text-xl font-semibold text-slate-950">
                  {paperQuestion.questionRef}
                </h3>
              </div>

              <div className="rounded-full bg-[#eef4ff] px-3 py-1 text-sm font-semibold text-[#1557c0]">
                {paperQuestion.marks} marks
              </div>
            </div>

            {/* Question parts */}
            <div className="mt-7 space-y-8">
              {parts.map((part) => (
                <section
                  key={part.id}
                  className="grid gap-4"
                >
                  <div className="flex items-start gap-3">
                    
                    {/* Part label */}
                    <div className="min-w-10 pt-1 text-sm font-semibold text-slate-900">
                      {part.label}
                    </div>

                    {/* Part content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <p className="whitespace-pre-line text-base leading-7 text-slate-900">
                          {part.prompt}
                        </p>

                        <span className="shrink-0 text-sm font-semibold text-slate-500">
                          [{part.marks}]
                        </span>
                      </div>

                      {/* Answer areas */}
                      <div className="mt-4 space-y-4">
                        {(part.answerFields?.length
                          ? part.answerFields
                          : [
                              {
                                id: `${part.id}-answer`,
                                label: "",
                                lines: Math.max(3, part.marks ?? 2),
                                placeholder: "Write your answer here...",
                              },
                            ]
                        ).map((field) => {
                          const fieldKey = `${part.id}:${field.id}`;

                          return (
                            <label
                              key={fieldKey}
                              className="block"
                            >
                              {field.label ? (
                                <span className="mb-2 block text-sm font-semibold text-slate-700">
                                  {field.label}
                                </span>
                              ) : null}

                              <div className="flex items-end gap-3">
                                <textarea
                                  value={answers[fieldKey] ?? ""}
                                  rows={field.lines ?? 3}
                                  placeholder={field.placeholder}
                                  onChange={(event) =>
                                    setAnswers((current) => ({
                                      ...current,
                                      [fieldKey]: event.target.value,
                                    }))
                                  }
                                  className="min-h-[120px] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1557c0] focus:bg-[#f8fbff] focus:ring-4 focus:ring-[#1557c0]/10"
                                />

                                {field.suffix ? (
                                  <span className="pb-3 text-sm font-semibold text-slate-500">
                                    {field.suffix}
                                  </span>
                                ) : null}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CheckpointActions>
        <button
          type="button"
          onClick={retry}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Retry
        </button>

        <button
          type="button"
          onClick={onContinueScene}
          disabled={!hasAnswer}
          className="rounded-xl bg-[#1557c0] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#124aa3] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit response
        </button>
      </CheckpointActions>
    </CheckpointSurface>
  );
}
