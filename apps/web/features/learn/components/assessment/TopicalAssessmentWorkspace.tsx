"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Globe2,
  LoaderCircle,
  RotateCcw,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LearnCurriculum, TopicNode } from "../../types";

type PaperInput =
  | {
      id: string;
      type: "text" | "textarea" | "number";
      label: string;
      placeholder?: string;
      lines?: number;
    }
  | {
      id: string;
      type: "choice";
      label: string;
      options: string[];
    }
  | {
      id: string;
      type: "table";
      label: string;
      columns: string[];
      rows: Array<{ id: string; label: string }>;
    };

type PaperQuestion = {
  groupNumber?: string;
  id: string;
  number: string;
  partLabel?: string;
  prompt: string;
  marks: number;
  inputs: PaperInput[];
};

type QuestionResult = {
  comment: string;
  correct: boolean;
};

type MarkingResult = {
  passed: boolean;
  questionResults: Record<string, QuestionResult>;
  score: number;
};

const questions: PaperQuestion[] = [
  {
    groupNumber: "1",
    id: "q1a",
    number: "1(a)",
    partLabel: "(a)",
    prompt:
      "A computer stores the binary value 10110110. Convert this value into denary. Show your working.",
    marks: 3,
    inputs: [
      {
        id: "working",
        type: "textarea",
        label: "Working",
        lines: 4,
        placeholder: "Show selected place values...",
      },
      {
        id: "answer",
        type: "number",
        label: "Final denary answer",
      },
    ],
  },
  {
    groupNumber: "1",
    id: "q1b",
    number: "1(b)",
    partLabel: "(b)",
    prompt:
      "Select the statements that correctly describe hexadecimal representation.",
    marks: 3,
    inputs: [
      {
        id: "hex-statements",
        type: "choice",
        label: "Choose all that apply",
        options: [
          "One hexadecimal digit can represent four binary bits.",
          "Hexadecimal is base 8.",
          "A-F represent values ten to fifteen.",
          "Hexadecimal changes the value being stored.",
        ],
      },
    ],
  },
  {
    groupNumber: "2",
    id: "q2",
    number: "2.",
    prompt:
      "Complete the table by converting each representation into the missing form.",
    marks: 6,
    inputs: [
      {
        id: "conversion-table",
        type: "table",
        label: "Conversion table",
        columns: ["Binary", "Denary", "Hexadecimal"],
        rows: [
          { id: "row-1", label: "10101010" },
          { id: "row-2", label: "199" },
          { id: "row-3", label: "7F" },
        ],
      },
    ],
  },
];

const moduleQuestions: PaperQuestion[] = [
  ...questions,
  {
    groupNumber: "3",
    id: "q3",
    number: "3.",
    prompt:
      "A bitmap image is stored using 24-bit colour depth. Explain how colour depth affects file size and image quality.",
    marks: 6,
    inputs: [
      {
        id: "colour-depth",
        type: "textarea",
        label: "Answer",
        lines: 7,
        placeholder: "Write a structured explanation...",
      },
    ],
  },
  {
    groupNumber: "4",
    id: "q4",
    number: "4.",
    prompt:
      "Write pseudocode that counts how many binary digits in an 8-bit string are equal to 1.",
    marks: 8,
    inputs: [
      {
        id: "pseudocode",
        type: "textarea",
        label: "Pseudocode",
        lines: 9,
        placeholder: "Write your algorithm...",
      },
    ],
  },
];

export function TopicalAssessmentWorkspace({
  curriculum,
  mode = "topic",
  onBack,
  topic,
}: {
  curriculum?: LearnCurriculum;
  mode?: "topic" | "module";
  onBack: () => void;
  topic?: TopicNode;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [markingResult, setMarkingResult] = useState<MarkingResult | null>(null);
  const [submissionState, setSubmissionState] = useState<
    "answering" | "marking" | "marked"
  >("answering");
  const [remainingSeconds, setRemainingSeconds] = useState(90 * 60);
  const answeredCount = useMemo(
    () => Object.values(answers).filter((value) => value.trim()).length,
    [answers],
  );
  const isModule = mode === "module";
  const activeQuestions = isModule ? moduleQuestions : questions;
  const title = isModule
    ? (curriculum?.moduleAssessment.title ?? "Module assessment")
    : (topic?.title ?? "Topical assessment");
  const subtitle = isModule
    ? `Timed Paper · ${curriculum?.moduleAssessment.durationLabel ?? "90 min"}`
    : `Practice Assignment · ${topic?.topicalAssessment.durationLabel ?? "20 min"}`;
  const questionGroups = useMemo(
    () => groupPaperQuestions(activeQuestions),
    [activeQuestions],
  );
  const attemptsLeft = Math.max(0, 3 - attemptsUsed);
  const wrongQuestions = markingResult
    ? activeQuestions.filter(
        (question) => !markingResult.questionResults[question.id]?.correct,
      )
    : [];

  useEffect(() => {
    if (!isModule) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isModule]);

  function setAnswer(id: string, value: string) {
    if (submissionState === "marked" && markingResult?.passed) return;
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function submitAssessment() {
    if (submissionState === "marking" || attemptsLeft <= 0) return;

    setSubmissionState("marking");
    setMarkingResult(null);

    window.setTimeout(() => {
      setAttemptsUsed((current) => current + 1);
      setMarkingResult(markAssessment(activeQuestions, answers));
      setSubmissionState("marked");
    }, 1400);
  }

  function retryAssessment() {
    if (attemptsLeft <= 0) return;
    setAnswers({});
    setMarkingResult(null);
    setSubmissionState("answering");
  }

  return (
    <main className="flex h-full flex-col overflow-hidden bg-white">
      <div className="flex h-24 shrink-0 items-stretch border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={onBack}
          className="flex w-24 shrink-0 items-center justify-center gap-2 border border-[#1557c0] text-base font-semibold text-[#1557c0] transition hover:bg-[#eaf2ff]"
          aria-label="Back to lesson"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-between gap-6 px-6">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold text-slate-950">
              {title}
            </h1>
            <p className="mt-1 text-base text-slate-500">
              {subtitle}
            </p>
          </div>

          {isModule ? (
            <div className="hidden items-center gap-2 text-base font-semibold text-slate-900 md:flex">
              <Clock3 className="h-5 w-5 text-slate-500" />
              <span>Time left</span>
              <span className="font-normal">{formatDuration(remainingSeconds)}</span>
            </div>
          ) : (
            <div className="hidden items-center gap-2 text-base font-semibold text-slate-900 md:flex">
              <Globe2 className="h-5 w-5 text-slate-500" />
              <span>Due</span>
              <span className="font-normal">May 27, 11:59 PM CAT</span>
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-14">
        <div
          className={[
            "mx-auto grid max-w-7xl gap-10",
            isModule ? "xl:grid-cols-[minmax(0,1fr)_220px]" : "",
          ].join(" ")}
        >
          {markingResult ? (
            <AssessmentResultPanel
              attemptsLeft={attemptsLeft}
              onRetry={retryAssessment}
              result={markingResult}
              wrongQuestions={wrongQuestions}
            />
          ) : null}

          <div className="space-y-16">
            {questionGroups.map((group, groupIndex) => (
              <section
                key={group.groupNumber}
                className={[
                  "grid gap-6",
                  groupIndex > 0 ? "border-t border-slate-200 pt-16" : "",
                  "md:grid-cols-[44px_minmax(0,1fr)]",
                ].join(" ")}
              >
                <div className="text-xl font-semibold leading-8 text-slate-950">
                  {group.groupNumber}.
                </div>

                <div className="space-y-12">
                  {group.questions.map((question) => (
                    <div
                      key={question.id}
                      id={`assessment-${question.id}`}
                      className="scroll-mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_96px]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-start gap-4">
                          {question.partLabel ? (
                            <span className="min-w-10 text-xl font-semibold leading-8 text-slate-950">
                              {question.partLabel}
                            </span>
                          ) : null}
                          <h2 className="text-xl font-semibold leading-8 text-slate-950">
                            {question.prompt}
                          </h2>
                        </div>

                        <div
                          className={[
                            "mt-9 space-y-5",
                            question.partLabel ? "md:ml-14" : "",
                          ].join(" ")}
                        >
                          {question.inputs.map((input) => (
                            <AssessmentInput
                              key={input.id}
                              input={input}
                              value={answers[input.id] ?? ""}
                              values={answers}
                              onChange={setAnswer}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="justify-self-start md:justify-self-end">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                          {question.marks} point
                          {question.marks === 1 ? "" : "s"}
                        </span>
                      </div>

                      {markingResult ? (
                        <div className={question.partLabel ? "md:ml-14" : ""}>
                          <QuestionFeedback
                            result={markingResult.questionResults[question.id]}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {isModule ? (
            <QuestionNavigator
              answers={answers}
              groups={questionGroups}
              results={markingResult?.questionResults}
            />
          ) : null}
        </div>
      </div>

      <div className="flex h-16 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6">
        <p className="text-sm font-medium text-slate-500">
          {submissionState === "marking"
            ? "Marking your answers..."
            : markingResult
              ? `${markingResult.score}% score · ${attemptsLeft} attempts left`
              : `${answeredCount} responses saved locally in this demo.`}
        </p>
        {markingResult && !markingResult.passed ? (
          <button
            type="button"
            disabled={attemptsLeft <= 0}
            onClick={retryAssessment}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#1557c0] px-5 text-sm font-semibold text-[#1557c0] transition hover:bg-[#eaf2ff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </button>
        ) : (
          <button
            type="button"
            disabled={
              submissionState === "marking" ||
              (Boolean(markingResult) && markingResult.passed) ||
              attemptsLeft <= 0
            }
            onClick={submitAssessment}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#1557c0] px-5 text-sm font-semibold text-white transition hover:bg-[#124aa3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submissionState === "marking" ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Marking
              </>
            ) : (
              <>
                Submit assessment
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </main>
  );
}

function QuestionNavigator({
  answers,
  groups,
  results,
}: {
  answers: Record<string, string>;
  groups: Array<{ groupNumber: string; questions: PaperQuestion[] }>;
  results?: Record<string, QuestionResult>;
}) {
  const answeredGroups = groups.filter((group) =>
    isQuestionGroupAnswered(group.questions, answers),
  ).length;

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold text-slate-950">Paper questions</p>
        <p className="mt-1 text-xs text-slate-500">
          {answeredGroups} of {groups.length} answered
        </p>

        <div className="mt-4 space-y-2">
          {groups.map((group) => {
            const answeredParts = group.questions.filter((question) =>
              isQuestionAnswered(question, answers),
            ).length;
            const answered = answeredParts === group.questions.length;
            const totalMarks = group.questions.reduce(
              (total, question) => total + question.marks,
              0,
            );
            const groupResults = group.questions.map(
              (question) => results?.[question.id],
            );
            const hasResults = groupResults.some(Boolean);
            const groupCorrect =
              hasResults && groupResults.every((result) => result?.correct);
            const needsReview =
              hasResults && groupResults.some((result) => result && !result.correct);

            return (
              <button
                key={group.groupNumber}
                type="button"
                onClick={() =>
                  document
                    .getElementById(`assessment-${group.questions[0]?.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className={[
                  "w-full rounded-xl border p-3 text-left transition",
                  groupCorrect
                    ? "border-[#16803a] bg-[#ecfdf3]"
                    : needsReview
                      ? "border-[#b7791f] bg-[#fff7df]"
                      : answered
                        ? "border-[#1557c0] bg-[#f8fbff]"
                        : "border-slate-200 bg-white hover:border-[#1557c0] hover:bg-[#f8fbff]",
                ].join(" ")}
                aria-label={`Go to question ${group.groupNumber}`}
              >
                <span className="grid grid-cols-[34px_1fr_auto] items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    Q{group.groupNumber}
                  </span>

                  <span className="text-xs font-semibold text-slate-500">
                    {totalMarks} marks
                  </span>

                  <span className="flex justify-end gap-1">
                    {group.questions.map((question, index) => {
                      const partAnswered = isQuestionAnswered(question, answers);
                      const partResult = results?.[question.id];

                      return (
                        <span
                          key={question.id}
                          className={[
                            "h-2.5 w-4 rounded-sm",
                            partResult?.correct
                              ? "bg-[#16803a]"
                              : partResult && !partResult.correct
                                ? "bg-[#f4c152]"
                                : partAnswered
                                  ? "bg-[#1557c0]"
                                  : "bg-slate-200",
                          ].join(" ")}
                          aria-label={`Part ${index + 1}`}
                        />
                      );
                    })}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-[#1557c0]" />
            Answered
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded border border-slate-300 bg-white" />
            Not answered
          </div>
          {results ? (
            <>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-[#16803a]" />
                Correct
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-[#fff7df] ring-1 ring-[#b7791f]" />
                Review
              </div>
            </>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function AssessmentResultPanel({
  attemptsLeft,
  onRetry,
  result,
  wrongQuestions,
}: {
  attemptsLeft: number;
  onRetry: () => void;
  result: MarkingResult;
  wrongQuestions: PaperQuestion[];
}) {
  return (
    <section
      className={[
        "rounded-2xl border p-5 xl:col-span-2",
        result.passed
          ? "border-[#bbf7d0] bg-[#ecfdf3]"
          : "border-[#fde68a] bg-[#fff7df]",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div
            className={[
              "inline-flex items-center gap-2 text-lg font-semibold",
              result.passed ? "text-[#166534]" : "text-[#7a5600]",
            ].join(" ")}
          >
            {result.passed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
            {result.passed ? "Passed" : "Review needed"}
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            You scored {result.score}%. A minimum score of 80% is required to
            proceed.
          </p>
        </div>

        {!result.passed ? (
          <button
            type="button"
            disabled={attemptsLeft <= 0}
            onClick={onRetry}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#b7791f] px-4 text-sm font-semibold text-[#7a5600] transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" />
            Retry ({attemptsLeft} left)
          </button>
        ) : null}
      </div>

      {!result.passed ? (
        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-800">
            Review before another attempt:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {wrongQuestions.map((question) => (
              <button
                key={question.id}
                type="button"
                onClick={() =>
                  document
                    .getElementById(`assessment-${question.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#7a5600] ring-1 ring-[#f4c152]"
              >
                Question {question.number.replace(".", "")}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-600">
            Attempts are limited to 3 in 24 hours in this demo flow.
          </p>
        </div>
      ) : null}
    </section>
  );
}

function QuestionFeedback({ result }: { result?: QuestionResult }) {
  if (!result) return null;

  return (
    <div
      className={[
        "mt-5 rounded-2xl p-4 text-sm leading-6",
        result.correct
          ? "bg-[#ecfdf3] text-[#166534]"
          : "bg-[#fff7df] text-[#7a5600]",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        {result.correct ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        )}
        <p>{result.comment}</p>
      </div>
    </div>
  );
}

function isQuestionAnswered(
  question: PaperQuestion,
  answers: Record<string, string>,
) {
  return question.inputs.some((input) => {
    if (answers[input.id]?.trim()) return true;
    if (input.type === "table") {
      return Object.entries(answers).some(
        ([key, value]) => key.startsWith(`${input.id}:`) && value.trim(),
      );
    }

    return false;
  });
}

function isQuestionGroupAnswered(
  questionsToCheck: PaperQuestion[],
  answers: Record<string, string>,
) {
  return questionsToCheck.every((question) =>
    isQuestionAnswered(question, answers),
  );
}

function groupPaperQuestions(questionsToGroup: PaperQuestion[]) {
  const groups: Array<{ groupNumber: string; questions: PaperQuestion[] }> = [];

  questionsToGroup.forEach((question) => {
    const groupNumber =
      question.groupNumber ?? question.number.match(/^\d+/)?.[0] ?? question.id;
    const existingGroup = groups.find(
      (group) => group.groupNumber === groupNumber,
    );

    if (existingGroup) {
      existingGroup.questions.push(question);
      return;
    }

    groups.push({
      groupNumber,
      questions: [question],
    });
  });

  return groups;
}

function markAssessment(
  questionsToMark: PaperQuestion[],
  answers: Record<string, string>,
): MarkingResult {
  const questionResults = questionsToMark.reduce<Record<string, QuestionResult>>(
    (results, question) => {
      results[question.id] = markQuestion(question, answers);
      return results;
    },
    {},
  );
  const correctCount = Object.values(questionResults).filter(
    (result) => result.correct,
  ).length;
  const score = Math.round((correctCount / questionsToMark.length) * 100);

  return {
    passed: score >= 80,
    questionResults,
    score,
  };
}

function markQuestion(
  question: PaperQuestion,
  answers: Record<string, string>,
): QuestionResult {
  if (question.id === "q1a") {
    const answer = answers.answer?.trim();
    const correct = answer === "182";

    return {
      correct,
      comment: correct
        ? "Correct. 10110110 = 128 + 32 + 16 + 4 + 2 = 182."
        : "Review the place values. 10110110 should add 128, 32, 16, 4, and 2.",
    };
  }

  if (question.id === "q1b") {
    const selected = answers["hex-statements"]?.split("|").filter(Boolean) ?? [];
    const expected = [
      "One hexadecimal digit can represent four binary bits.",
      "A-F represent values ten to fifteen.",
    ];
    const correct =
      selected.length === expected.length &&
      expected.every((item) => selected.includes(item));

    return {
      correct,
      comment: correct
        ? "Correct. Hexadecimal is base 16 and maps neatly to four binary bits."
        : "Check the base and mapping: hexadecimal is base 16, and each hex digit maps to four bits.",
    };
  }

  if (question.id === "q2") {
    const filledCells = Object.entries(answers).filter(
      ([key, value]) => key.startsWith("conversion-table:") && value.trim(),
    ).length;
    const correct = filledCells >= 4;

    return {
      correct,
      comment: correct
        ? "Good. Your conversion table has enough completed working for this checkpoint."
        : "Complete more table cells so each representation can be compared clearly.",
    };
  }

  if (question.id === "q3") {
    const answer = answers["colour-depth"]?.trim() ?? "";
    const correct = answer.length >= 80;

    return {
      correct,
      comment: correct
        ? "Good explanation. You connected colour depth to file size and image quality."
        : "Add more detail: higher colour depth stores more bits per pixel, increasing file size and colour range.",
    };
  }

  const answer = answers.pseudocode?.trim() ?? "";
  const correct =
    answer.length >= 40 &&
    /count|total/i.test(answer) &&
    /for|while|loop/i.test(answer);

  return {
    correct,
    comment: correct
      ? "Good structure. Your answer includes iteration and a counter."
      : "Review the algorithm: loop through each bit and increment a counter when the bit is 1.",
  };
}

function AssessmentInput({
  input,
  onChange,
  value,
  values,
}: {
  input: PaperInput;
  onChange: (id: string, value: string) => void;
  value: string;
  values: Record<string, string>;
}) {
  if (input.type === "choice") {
    const selected = value ? value.split("|") : [];

    return (
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-700">
          {input.label}
        </legend>
        <div className="space-y-4">
          {input.options.map((option) => {
            const isSelected = selected.includes(option);
            const nextValue = isSelected
              ? selected.filter((item) => item !== option).join("|")
              : [...selected, option].join("|");

            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange(input.id, nextValue)}
                className="flex w-full items-start gap-3 text-left text-lg leading-7 text-slate-900"
              >
                <span
                  className={[
                    "mt-1 grid h-6 w-6 shrink-0 place-items-center rounded border-2 transition",
                    isSelected
                      ? "border-[#1557c0] bg-[#1557c0]"
                      : "border-slate-300 bg-white",
                  ].join(" ")}
                >
                  {isSelected ? (
                    <span className="h-2.5 w-2.5 rounded-sm bg-white" />
                  ) : null}
                </span>
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  if (input.type === "table") {
    return (
      <div>
        <p className="mb-3 text-sm font-semibold text-slate-700">
          {input.label}
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#f8fafc] text-slate-600">
              <tr>
                {input.columns.map((column) => (
                  <th key={column} className="border-b border-slate-200 px-3 py-3 text-left font-semibold">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {input.rows.map((row, rowIndex) => (
                <tr key={row.id}>
                  {input.columns.map((column, columnIndex) => {
                    const fieldId = `${input.id}:${row.id}:${column}`;
                    const isGiven = columnIndex === rowIndex;

                    return (
                      <td key={fieldId} className="border-t border-slate-100 p-2 align-top">
                        {isGiven ? (
                          <span className="block rounded-xl bg-slate-50 px-3 py-2 font-semibold text-slate-800">
                            {row.label}
                          </span>
                        ) : (
                          <input
                            value={values[fieldId] ?? ""}
                            onChange={(event) =>
                              onChange(fieldId, event.target.value)
                            }
                            className="h-10 w-full rounded-xl border border-slate-200 px-3 outline-none transition focus:border-[#1557c0] focus:ring-4 focus:ring-[#1557c0]/10"
                            aria-label={`${row.label} ${column}`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (input.type === "textarea") {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">
          {input.label}
        </span>
        <textarea
          value={value}
          rows={input.lines ?? 3}
          placeholder={input.placeholder}
          onChange={(event) => onChange(input.id, event.target.value)}
          className="min-h-[112px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1557c0] focus:bg-[#f8fbff] focus:ring-4 focus:ring-[#1557c0]/10"
        />
      </label>
    );
  }

  return (
    <label className="block max-w-md">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {input.label}
      </span>
      <input
        type={input.type === "number" ? "number" : "text"}
        value={value}
        placeholder={input.placeholder}
        onChange={(event) => onChange(input.id, event.target.value)}
        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1557c0] focus:bg-[#f8fbff] focus:ring-4 focus:ring-[#1557c0]/10"
      />
    </label>
  );
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
