"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckpointSurface } from "./CheckpointSurface";
import { CheckpointActions } from "./CheckpointActions";
import type { PaperQuestion, PaperQuestionPart, Scene } from "../../../types";

function LinedCheckpointTextarea({
  lines = 3,
  onChange,
  placeholder,
  value,
}: {
  lines?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineHeight = 32;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(lines * lineHeight, textarea.scrollHeight)}px`;
  }, [lineHeight, lines, value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      rows={lines}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-none overflow-hidden border-0 bg-transparent px-0 py-0 text-base leading-8 text-slate-900 outline-none placeholder:text-slate-400"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, #cbd5e1 31px, #cbd5e1 32px)",
        lineHeight: `${lineHeight}px`,
        minHeight: `${lines * lineHeight}px`,
      }}
    />
  );
}

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
  const hasExplicitParts = Boolean(paperQuestion.parts?.length);

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
      <div>
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {paperQuestion.paperRef}
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {paperQuestion.questionRef}
            </p>
          </div>
          <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            {paperQuestion.marks} marks
          </span>
        </div>

        {hasExplicitParts && paperQuestion.prompt ? (
          <p className="mt-5 whitespace-pre-line text-lg font-normal leading-8 text-slate-950">
            {paperQuestion.prompt}
          </p>
        ) : null}

        <div className="mt-7 space-y-7">
          {parts.map((part) => (
            <section
              key={part.id}
              className="grid gap-4 md:grid-cols-[minmax(0,1fr)_84px]"
            >
              <div
                className="flex min-w-0 items-start gap-4"
                style={{ marginLeft: Math.max(0, part.depth ?? 0) * 28 }}
              >
                <div className="w-10 shrink-0 pt-1 text-base font-semibold text-slate-900">
                  {part.label}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-line text-base font-normal leading-7 text-slate-900">
                    {part.prompt}
                  </p>

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
                        <label key={fieldKey} className="block">
                          <div className="flex items-end gap-3">
                            <LinedCheckpointTextarea
                              value={answers[fieldKey] ?? ""}
                              lines={field.lines ?? 3}
                              placeholder={field.placeholder}
                              onChange={(nextValue) =>
                                setAnswers((current) => ({
                                  ...current,
                                  [fieldKey]: nextValue,
                                }))
                              }
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

              <div className="justify-self-start md:justify-self-end">
                <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                  {part.marks} point{part.marks === 1 ? "" : "s"}
                </span>
              </div>
            </section>
          ))}
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
