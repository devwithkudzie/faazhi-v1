"use client";

import {
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  FileText,
  RotateCcw,
  Send,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import type { PaperQuestion, Scene } from "../../types";

type CheckpointState = "answering" | "correct" | "incorrect" | "submitted";

export function QuizScene({
  onContinueScene,
  scene,
}: {
  onContinueScene?: () => void;
  scene: Scene;
}) {
  if (scene.paperQuestion) {
    return (
      <PaperCheckpoint
        onContinueScene={onContinueScene}
        paperQuestion={scene.paperQuestion}
        scene={scene}
      />
    );
  }

  return <ChoiceCheckpoint onContinueScene={onContinueScene} scene={scene} />;
}

function ChoiceCheckpoint({
  onContinueScene,
  scene,
}: {
  onContinueScene?: () => void;
  scene: Scene;
}) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [state, setState] = useState<CheckpointState>("answering");

  const isSubmitted = state !== "answering";
  const isCorrect = selectedChoice === scene.answer;

  function submitAnswer() {
    if (!selectedChoice) return;
    setState(isCorrect ? "correct" : "incorrect");
  }

  function retry() {
    setSelectedChoice(null);
    setState("answering");
  }

  function continueFlow() {
    setState("submitted");
    onContinueScene?.();
  }

  return (
    <CheckpointSurface
      eyebrow={scene.eyebrow ?? "Embedded checkpoint"}
      title={scene.title}
      icon={<ClipboardCheck className="h-5 w-5" />}
    >
      <div className="grid min-h-0 gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <p className="text-lg leading-8 text-slate-700">{scene.question}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {scene.choices?.map((choice) => {
              const isSelected = selectedChoice === choice;
              const shouldShowAnswer = isSubmitted && choice === scene.answer;
              const shouldShowWrong =
                state === "incorrect" && isSelected && choice !== scene.answer;

              return (
                <button
                  key={choice}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => setSelectedChoice(choice)}
                  className={[
                    "min-h-[88px] rounded-2xl border px-4 py-4 text-left text-base font-semibold leading-6 transition",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1557c0]",
                    isSelected && !isSubmitted
                      ? "border-[#1557c0] bg-[#eaf2ff] text-[#1557c0] shadow-[0_10px_30px_rgba(21,87,192,0.12)]"
                      : "",
                    shouldShowAnswer
                      ? "border-[#16803a] bg-[#ecfdf3] text-[#166534]"
                      : "",
                    shouldShowWrong
                      ? "border-[#b42318] bg-[#fff1f0] text-[#9f1c13]"
                      : "",
                    !isSelected && !shouldShowAnswer
                      ? "border-slate-200 bg-white hover:border-[#1557c0] hover:bg-[#eaf2ff] hover:text-[#1557c0]"
                      : "",
                    isSubmitted ? "cursor-default" : "",
                  ].join(" ")}
                >
                  {choice}
                </button>
              );
            })}
          </div>
        </div>

        <CheckpointFeedback
          state={state}
          correctText="Correct. You can continue the learning flow."
          incorrectText={`Good attempt. The expected answer is: ${scene.answer}`}
          defaultText="Choose an answer, then submit it for feedback."
          examinerInsight={scene.examinerInsight}
        />
      </div>

      <CheckpointActions
        state={state}
        canSubmit={Boolean(selectedChoice)}
        onSubmit={submitAnswer}
        onRetry={retry}
        onContinue={continueFlow}
      />
    </CheckpointSurface>
  );
}

function PaperCheckpoint({
  onContinueScene,
  scene,
  paperQuestion,
}: {
  onContinueScene?: () => void;
  scene: Scene;
  paperQuestion: PaperQuestion;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<CheckpointState>("answering");

  const hasAnswer = useMemo(
    () => Object.values(answers).some((answer) => answer.trim().length > 0),
    [answers],
  );

  function retry() {
    setAnswers({});
    setState("answering");
  }

  return (
    <CheckpointSurface
      eyebrow={scene.eyebrow ?? "Digital paper checkpoint"}
      title={scene.title}
      icon={<FileText className="h-5 w-5" />}
    >
      <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[26px] bg-[#f8fafc] p-3 shadow-inner">
          <div className="min-h-[440px] rounded-[22px] bg-white p-7 shadow-[0_22px_65px_rgba(15,23,42,0.10)]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">
                  Cambridge International AS & A Level Computer Science
                </p>
                <p>{paperQuestion.paperRef}</p>
              </div>
              <div className="rounded-full bg-[#eaf2ff] px-3 py-1 font-semibold text-[#1557c0]">
                {paperQuestion.questionRef} · {paperQuestion.marks} marks
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <p className="whitespace-pre-line text-lg leading-8 text-slate-900">
                {paperQuestion.prompt}
              </p>

              <div className="space-y-5">
                {paperQuestion.answerFields.map((field) => (
                  <label key={field.id} className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      {field.label}
                    </span>
                    <div className="flex items-end gap-3">
                      <textarea
                        value={answers[field.id] ?? ""}
                        disabled={state !== "answering"}
                        rows={field.lines ?? 2}
                        placeholder={field.placeholder}
                        onChange={(event) =>
                          setAnswers((current) => ({
                            ...current,
                            [field.id]: event.target.value,
                          }))
                        }
                        className="min-h-[72px] flex-1 resize-none rounded-2xl border border-slate-200 bg-[linear-gradient(to_bottom,transparent_31px,#dbeafe_32px)] bg-[length:100%_32px] px-4 py-3 text-base leading-8 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1557c0] focus:bg-[#f8fbff] focus:ring-4 focus:ring-[#1557c0]/10 disabled:bg-slate-50"
                      />
                      {field.suffix ? (
                        <span className="pb-3 text-sm font-semibold text-slate-500">
                          {field.suffix}
                        </span>
                      ) : null}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <CheckpointFeedback
          state={state}
          defaultText="Answer in the digital paper fields, then submit for marking feedback."
          correctText="Submitted. Review the marking points, then continue."
          incorrectText="Use retry to improve your working before continuing."
          examinerInsight={scene.examinerInsight}
          markScheme={paperQuestion.markScheme}
        />
      </div>

      <CheckpointActions
        state={state}
        canSubmit={hasAnswer}
        submitLabel="Submit response"
        onSubmit={() => setState("correct")}
        onRetry={retry}
        onContinue={() => {
          setState("submitted");
          onContinueScene?.();
        }}
      />
    </CheckpointSurface>
  );
}

function CheckpointSurface({
  eyebrow,
  title,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fbff_34%,#eef5ff_100%)] p-6">
      <div className="flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[#bfdbfe] bg-white/96 p-6 shadow-[0_32px_90px_rgba(21,87,192,0.18)] backdrop-blur">
        <div className="mb-6 flex items-start justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1557c0]">
              {icon}
              {eyebrow}
            </div>
            <h2 className="mt-4 font-serif-paper text-4xl font-semibold text-slate-950">
              {title}
            </h2>
          </div>
          <div className="hidden rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 shadow-inner md:block">
            Workspace checkpoint
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}

function CheckpointFeedback({
  state,
  defaultText,
  correctText,
  incorrectText,
  examinerInsight,
  markScheme,
}: {
  state: CheckpointState;
  defaultText: string;
  correctText: string;
  incorrectText: string;
  examinerInsight?: string;
  markScheme?: PaperQuestion["markScheme"];
}) {
  const isCorrect = state === "correct" || state === "submitted";
  const isIncorrect = state === "incorrect";

  return (
    <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div
        className={[
          "flex gap-3 rounded-2xl p-4 text-sm leading-6",
          isCorrect ? "bg-[#ecfdf3] text-[#166534]" : "",
          isIncorrect ? "bg-[#fff7df] text-[#7a5600]" : "",
          !isCorrect && !isIncorrect ? "bg-white text-slate-600" : "",
        ].join(" ")}
      >
        {isCorrect ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
        )}
        <p>
          {isCorrect ? correctText : isIncorrect ? incorrectText : defaultText}
        </p>
      </div>

      {markScheme?.length && isCorrect ? (
        <div className="mt-5">
          <p className="text-sm font-semibold text-slate-900">Marking points</p>
          <ul className="mt-3 space-y-3">
            {markScheme.map((item) => (
              <li
                key={item.criterion}
                className="rounded-2xl bg-white p-3 text-sm leading-6 text-slate-700"
              >
                <span className="font-semibold text-[#1557c0]">
                  {item.marks} mark{item.marks === 1 ? "" : "s"}:
                </span>{" "}
                {item.criterion}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {examinerInsight ? (
        <div className="mt-5 rounded-2xl bg-[#eaf2ff] p-4 text-sm leading-6 text-[#1557c0]">
          <p className="font-semibold">Examiner insight</p>
          <p className="mt-1 text-[#1f4f9f]">{examinerInsight}</p>
        </div>
      ) : null}
    </aside>
  );
}

function CheckpointActions({
  state,
  canSubmit,
  submitLabel = "Submit answer",
  onSubmit,
  onRetry,
  onContinue,
}: {
  state: CheckpointState;
  canSubmit: boolean;
  submitLabel?: string;
  onSubmit: () => void;
  onRetry: () => void;
  onContinue: () => void;
}) {
  const isAnswered = state === "correct" || state === "submitted";

  return (
    <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
      {state === "incorrect" ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-2xl border border-[#bfdbfe] bg-white px-5 py-3 font-semibold text-[#1557c0] transition hover:bg-[#eaf2ff]"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
      ) : null}

      {isAnswered ? (
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1557c0] px-6 py-3 font-semibold text-white shadow-[0_14px_35px_rgba(21,87,192,0.24)] transition hover:bg-[#0f46a0]"
        >
          Continue
          <CheckCircle2 className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1557c0] px-6 py-3 font-semibold text-white shadow-[0_14px_35px_rgba(21,87,192,0.24)] transition hover:bg-[#0f46a0] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {submitLabel}
          <Send className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
