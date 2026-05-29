"use client";

import { useMemo, useState } from "react";
import {
  ClipboardList,
  CopyPlus,
  FileQuestion,
  ListChecks,
  Plus,
  ScanText,
  Trash2,
} from "lucide-react";

import type {
  AdminAnswerKind,
  AdminAnswerSlotDraft,
  AdminAssessmentDraft,
  AdminAssessmentPartDraft,
  AdminAssessmentQuestionDraft,
  AdminMarkPointDraft,
  AdminPaperDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

type SelectedAssessmentTarget =
  | { type: "topical"; topicId: string }
  | { type: "module" };

type AssessmentTarget =
  | {
      id: string;
      label: string;
      type: "topical";
      topicId: string;
      assessment: AdminAssessmentDraft;
    }
  | {
      id: string;
      label: string;
      type: "module";
      assessment: AdminAssessmentDraft;
    };

type ToolSection = "source" | "inputs" | "marking" | "import";

const answerKinds: Array<{ value: AdminAnswerKind; label: string }> = [
  { value: "short", label: "Short text" },
  { value: "long", label: "Long answer" },
  { value: "code", label: "Code" },
  { value: "table", label: "Table" },
  { value: "tick", label: "Single tick" },
  { value: "multi_tick", label: "Multi tick" },
  { value: "true_false", label: "True / false" },
  { value: "match", label: "Match" },
  { value: "order", label: "Order" },
  { value: "classify", label: "Classify" },
  { value: "diagram", label: "Diagram" },
  { value: "working", label: "Working" },
  { value: "gap", label: "Gap fill" },
  { value: "label", label: "Label" },
];

const sections: Array<{ id: ToolSection; label: string; icon: typeof FileQuestion }> = [
  { id: "source", label: "Source", icon: FileQuestion },
  { id: "inputs", label: "Inputs", icon: CopyPlus },
  { id: "marking", label: "Marking", icon: ListChecks },
  { id: "import", label: "Import", icon: ScanText },
];

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function joinLines(value?: string[]) {
  return (value ?? []).join("\n");
}

function createAnswerSlot(kind: AdminAnswerKind = "long"): AdminAnswerSlotDraft {
  return {
    id: uniqueId("answer"),
    kind,
    label:
      kind === "code"
        ? "Pseudocode answer"
        : kind === "table"
          ? "Complete the trace table"
          : kind === "tick"
            ? "Select the correct statement"
            : "Candidate answer",
    lines: kind === "short" ? 1 : 4,
    placeholder:
      kind === "code"
        ? "Write Cambridge pseudocode here..."
        : "Use precise exam wording...",
    options:
      kind.includes("tick") || kind === "true_false"
        ? ["Packet switching", "Circuit switching", "Encryption"]
        : [],
    columns: kind === "table" ? ["Variable", "Value after iteration"] : [],
    rows: kind === "table" ? 3 : undefined,
    leftItems: kind === "match" ? ["Item 1"] : [],
    rightItems: kind === "match" ? ["Match 1"] : [],
    items: kind === "order" || kind === "classify" ? ["Item 1"] : [],
    categories: kind === "classify" ? ["Category 1", "Category 2"] : [],
  };
}

function createMarkPoint(): AdminMarkPointDraft {
  return {
    id: uniqueId("mark-point"),
    text: "Award 1 mark for a clear explanation using the correct technical term.",
    marks: 1,
    keywords: [],
    acceptedAlternatives: [],
    requiresEvidence: true,
  };
}

function createPart(label: string): AdminAssessmentPartDraft {
  return {
    id: uniqueId("part"),
    label,
    prompt: "Explain one benefit of using packet switching on a wide area network.",
    marks: 1,
    answerSlots: [],
    markScheme: [],
    guidance: "",
    expectedAnswer: "Packets can take different routes, making better use of available network capacity.",
    subparts: [],
    tags: ["networks"],
    topic: "Communication and Internet technologies",
  };
}

function createQuestion(number: number): AdminAssessmentQuestionDraft {
  return {
    id: uniqueId("question"),
    number,
    title: "Network communication scenario",
    difficulty: "medium",
    source: { paper: "9618/12", session: "May/June 2024", questionRef: `Q${number}` },
    context:
      "A company connects several branch offices using a wide area network.",
    tags: ["networks", "WAN"],
    parts: [createPart("(a)")],
  };
}

function Field({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function Area({
  label,
  onChange,
  placeholder,
  rows = 3,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-800 outline-none focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

export function AssessmentTool({
  draft,
  onSelectTarget,
  onUpdateModuleAssessment,
  onUpdateTopicalAssessment,
  selectedTarget,
}: {
  draft: AdminPaperDraft;
  onSelectTarget: (target: SelectedAssessmentTarget) => void;
  onUpdateModuleAssessment: (assessment: AdminAssessmentDraft) => void;
  onUpdateTopicalAssessment: (
    topicId: string,
    assessment: AdminAssessmentDraft,
  ) => void;
  selectedTarget: SelectedAssessmentTarget;
}) {
  const [section, setSection] = useState<ToolSection>("source");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");

  const targets = useMemo<AssessmentTarget[]>(() => {
    const topicalTargets = draft.topics.flatMap((topic) =>
      topic.topicalAssessment
        ? [
            {
              id: topic.id,
              label: topic.topicalAssessmentTitle,
              type: "topical" as const,
              topicId: topic.id,
              assessment: topic.topicalAssessment,
            },
          ]
        : [],
    );

    return draft.moduleAssessment
      ? [
          ...topicalTargets,
          {
            id: "module-assessment",
            label: draft.moduleAssessmentTitle,
            type: "module" as const,
            assessment: draft.moduleAssessment,
          },
        ]
      : topicalTargets;
  }, [draft.moduleAssessment, draft.moduleAssessmentTitle, draft.topics]);

  const targetId =
    selectedTarget.type === "module"
      ? "module-assessment"
      : selectedTarget.topicId;
  const activeTarget =
    targets.find((target) => target.id === targetId) ?? targets[0];
  const assessment = activeTarget?.assessment;
  const question =
    assessment?.questions.find((item) => item.id === selectedQuestionId) ??
    assessment?.questions[0];
  const part =
    question?.parts.find((item) => item.id === selectedPartId) ??
    question?.parts[0];

  function commit(nextAssessment: AdminAssessmentDraft) {
    if (!activeTarget) return;

    if (activeTarget.type === "module") {
      onUpdateModuleAssessment(nextAssessment);
      return;
    }

    onUpdateTopicalAssessment(activeTarget.topicId, nextAssessment);
  }

  function updateQuestion(
    questionId: string,
    updater: (question: AdminAssessmentQuestionDraft) => AdminAssessmentQuestionDraft,
  ) {
    if (!assessment) return;

    commit({
      ...assessment,
      questions: assessment.questions.map((item) =>
        item.id === questionId ? updater(item) : item,
      ),
    });
  }

  function updatePart(
    questionId: string,
    partId: string,
    updater: (part: AdminAssessmentPartDraft) => AdminAssessmentPartDraft,
  ) {
    updateQuestion(questionId, (current) => ({
      ...current,
      parts: current.parts.map((item) =>
        item.id === partId ? updater(item) : item,
      ),
    }));
  }

  function addQuestion() {
    if (!assessment) return;
    const nextQuestion = createQuestion(assessment.questions.length + 1);
    commit({
      ...assessment,
      questions: [...assessment.questions, nextQuestion],
    });
    setSelectedQuestionId(nextQuestion.id);
    setSelectedPartId(nextQuestion.parts[0]?.id ?? null);
  }

  function importFromPaste() {
    if (!assessment) return;

    const cleaned = pasteText.trim();
    if (!cleaned) return;

    const marksMatch = cleaned.match(/\[(\d+)\]|\((\d+)\s*marks?\)/i);
    const marks = Number(marksMatch?.[1] ?? marksMatch?.[2] ?? 1);
    const nextQuestion = createQuestion(assessment.questions.length + 1);
    const nextPart = {
      ...nextQuestion.parts[0],
      prompt: cleaned,
      marks: Number.isFinite(marks) && marks > 0 ? marks : 1,
      answerSlots: [createAnswerSlot(cleaned.match(/pseudocode|code/i) ? "code" : "long")],
      markScheme: Array.from({ length: Math.max(1, Math.min(marks || 1, 8)) }).map(
        () => createMarkPoint(),
      ),
    };
    const importedQuestion = {
      ...nextQuestion,
      title: `Question ${nextQuestion.number}`,
      context: "",
      parts: [nextPart],
    };

    commit({
      ...assessment,
      questions: [...assessment.questions, importedQuestion],
    });
    setSelectedQuestionId(importedQuestion.id);
    setSelectedPartId(nextPart.id);
    setPasteText("");
    setSection("source");
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-[#eef4ff] p-2.5 ring-1 ring-blue-100">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[#1557c0]" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1557c0]">
            Assessments
          </p>
        </div>

        <div className="mt-2 grid gap-1.5">
          {targets.map((target) => {
            const active = target.id === activeTarget?.id;

            return (
              <button
                key={target.id}
                type="button"
                onClick={() => {
                  onSelectTarget(
                    target.type === "module"
                      ? { type: "module" }
                      : { type: "topical", topicId: target.topicId },
                  );
                  setSelectedQuestionId(target.assessment.questions[0]?.id ?? null);
                  setSelectedPartId(
                    target.assessment.questions[0]?.parts[0]?.id ?? null,
                  );
                }}
                className={[
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-left transition",
                  active
                    ? "bg-white text-[#1557c0] ring-1 ring-blue-100"
                    : "text-slate-600 hover:bg-white/70",
                ].join(" ")}
              >
                <FileQuestion className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">
                    {target.label}
                  </span>
                  <span className="block text-[10px] text-slate-500">
                    {target.assessment.questions.length} questions ·{" "}
                    {target.assessment.durationMinutes ?? 20}m
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {assessment ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="Title"
              value={assessment.title}
              onChange={(title) => commit({ ...assessment, title })}
            />
            <Field
              label="Minutes"
              value={String(assessment.durationMinutes ?? "")}
              onChange={(value) =>
                commit({
                  ...assessment,
                  durationMinutes: Number(value) || undefined,
                })
              }
            />
          </div>

          <div className="flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-slate-200">
            {sections.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={[
                    "inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition",
                    section === item.id
                      ? "bg-[#1557c0] text-white"
                      : "text-slate-600 hover:bg-slate-100",
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-white p-2.5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-2">
              <select
                value={question?.id ?? ""}
                onChange={(event) => {
                  const nextQuestion = assessment.questions.find(
                    (item) => item.id === event.target.value,
                  );
                  setSelectedQuestionId(event.target.value);
                  setSelectedPartId(nextQuestion?.parts[0]?.id ?? null);
                }}
                className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1557c0]"
              >
                {assessment.questions.map((item) => (
                  <option key={item.id} value={item.id}>
                    Q{item.number}: {item.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#1557c0] px-2 text-xs font-semibold text-white transition hover:bg-[#124cad]"
              >
                <Plus className="h-3.5 w-3.5" />
                Q
              </button>
            </div>

            {question ? (
              <div className="mt-2 flex items-center justify-between gap-2">
                <select
                  value={part?.id ?? ""}
                  onChange={(event) => setSelectedPartId(event.target.value)}
                  className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1557c0]"
                >
                  {question.parts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label} · {item.marks} marks
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const nextPart = createPart(
                      `(${String.fromCharCode(97 + question.parts.length)})`,
                    );
                    updateQuestion(question.id, (current) => ({
                      ...current,
                      parts: [...current.parts, nextPart],
                    }));
                    setSelectedPartId(nextPart.id);
                  }}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 transition hover:text-[#1557c0]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Part
                </button>
              </div>
            ) : null}
          </div>

          {section === "source" && question && part ? (
            <div className="space-y-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <Field
                label="Question title"
                value={question.title}
                onChange={(title) =>
                  updateQuestion(question.id, (current) => ({ ...current, title }))
                }
              />
              <div className="grid grid-cols-3 gap-2">
                <Field
                  label="Paper"
                  value={question.source?.paper ?? ""}
                  onChange={(paper) =>
                    updateQuestion(question.id, (current) => ({
                      ...current,
                      source: { ...current.source, paper },
                    }))
                  }
                />
                <Field
                  label="Session"
                  value={question.source?.session ?? ""}
                  onChange={(session) =>
                    updateQuestion(question.id, (current) => ({
                      ...current,
                      source: { ...current.source, session },
                    }))
                  }
                />
                <Field
                  label="Ref"
                  value={question.source?.questionRef ?? ""}
                  onChange={(questionRef) =>
                    updateQuestion(question.id, (current) => ({
                      ...current,
                      source: { ...current.source, questionRef },
                    }))
                  }
                />
              </div>
              <Area
                label="Question context"
                value={question.context ?? ""}
                rows={4}
                onChange={(context) =>
                  updateQuestion(question.id, (current) => ({
                    ...current,
                    context,
                  }))
                }
              />
              <div className="grid grid-cols-[72px_1fr_72px] gap-2">
                <Field
                  label="Part"
                  value={part.label}
                  onChange={(label) =>
                    updatePart(question.id, part.id, (current) => ({
                      ...current,
                      label,
                    }))
                  }
                />
                <Field
                  label="Prompt"
                  value={part.prompt}
                  onChange={(prompt) =>
                    updatePart(question.id, part.id, (current) => ({
                      ...current,
                      prompt,
                    }))
                  }
                />
                <Field
                  label="Marks"
                  value={String(part.marks)}
                  onChange={(marks) =>
                    updatePart(question.id, part.id, (current) => ({
                      ...current,
                      marks: Number(marks) || 1,
                    }))
                  }
                />
              </div>
              <Area
                label="Expected answer"
                value={part.expectedAnswer ?? ""}
                rows={4}
                onChange={(expectedAnswer) =>
                  updatePart(question.id, part.id, (current) => ({
                    ...current,
                    expectedAnswer,
                  }))
                }
              />
            </div>
          ) : null}

          {section === "inputs" && question && part ? (
            <div className="space-y-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() =>
                  updatePart(question.id, part.id, (current) => ({
                    ...current,
                    answerSlots: [...current.answerSlots, createAnswerSlot()],
                  }))
                }
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#1557c0] px-3 text-xs font-semibold text-white transition hover:bg-[#124cad]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add answer input
              </button>

              {part.answerSlots.map((slot) => (
                <div key={slot.id} className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2">
                    <select
                      value={slot.kind}
                      onChange={(event) =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          answerSlots: current.answerSlots.map((item) =>
                            item.id === slot.id
                              ? {
                                  ...createAnswerSlot(
                                    event.target.value as AdminAnswerKind,
                                  ),
                                  id: slot.id,
                                  label: slot.label,
                                }
                              : item,
                          ),
                        }))
                      }
                      className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1557c0]"
                    >
                      {answerKinds.map((kind) => (
                        <option key={kind.value} value={kind.value}>
                          {kind.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          answerSlots: current.answerSlots.filter(
                            (item) => item.id !== slot.id,
                          ),
                        }))
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete answer input"
                      title="Delete answer input"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 grid gap-2">
                    <Field
                      label="Label"
                      value={slot.label}
                      onChange={(label) =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          answerSlots: current.answerSlots.map((item) =>
                            item.id === slot.id ? { ...item, label } : item,
                          ),
                        }))
                      }
                    />
                    {["long", "working", "code"].includes(slot.kind) ? (
                      <Field
                        label="Lines"
                        value={String(slot.lines ?? 4)}
                        onChange={(lines) =>
                          updatePart(question.id, part.id, (current) => ({
                            ...current,
                            answerSlots: current.answerSlots.map((item) =>
                              item.id === slot.id
                                ? { ...item, lines: Number(lines) || 1 }
                                : item,
                            ),
                          }))
                        }
                      />
                    ) : null}
                    {["tick", "multi_tick", "true_false"].includes(slot.kind) ? (
                      <Area
                        label="Options"
                        rows={3}
                        value={joinLines(slot.options)}
                        onChange={(value) =>
                          updatePart(question.id, part.id, (current) => ({
                            ...current,
                            answerSlots: current.answerSlots.map((item) =>
                              item.id === slot.id
                                ? { ...item, options: splitLines(value) }
                                : item,
                            ),
                          }))
                        }
                      />
                    ) : null}
                    {slot.kind === "table" ? (
                      <>
                        <Area
                          label="Columns"
                          rows={2}
                          value={joinLines(slot.columns)}
                          onChange={(value) =>
                            updatePart(question.id, part.id, (current) => ({
                              ...current,
                              answerSlots: current.answerSlots.map((item) =>
                                item.id === slot.id
                                  ? { ...item, columns: splitLines(value) }
                                  : item,
                              ),
                            }))
                          }
                        />
                        <Field
                          label="Rows"
                          value={String(slot.rows ?? 3)}
                          onChange={(rows) =>
                            updatePart(question.id, part.id, (current) => ({
                              ...current,
                              answerSlots: current.answerSlots.map((item) =>
                                item.id === slot.id
                                  ? { ...item, rows: Number(rows) || 1 }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {section === "marking" && question && part ? (
            <div className="space-y-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <button
                type="button"
                onClick={() =>
                  updatePart(question.id, part.id, (current) => ({
                    ...current,
                    markScheme: [...current.markScheme, createMarkPoint()],
                  }))
                }
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#1557c0] px-3 text-xs font-semibold text-white transition hover:bg-[#124cad]"
              >
                <Plus className="h-3.5 w-3.5" />
                Add mark point
              </button>

              {part.markScheme.map((markPoint) => (
                <div
                  key={markPoint.id}
                  className="space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"
                >
                  <div className="flex items-start gap-2">
                    <Area
                      label="Mark point"
                      rows={2}
                      value={markPoint.text}
                      onChange={(text) =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          markScheme: current.markScheme.map((item) =>
                            item.id === markPoint.id ? { ...item, text } : item,
                          ),
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          markScheme: current.markScheme.filter(
                            (item) => item.id !== markPoint.id,
                          ),
                        }))
                      }
                      className="mt-5 grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Delete mark point"
                      title="Delete mark point"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Field
                      label="Marks"
                      value={String(markPoint.marks)}
                      onChange={(marks) =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          markScheme: current.markScheme.map((item) =>
                            item.id === markPoint.id
                              ? { ...item, marks: Number(marks) || 1 }
                              : item,
                          ),
                        }))
                      }
                    />
                    <Field
                      label="Keywords"
                      value={(markPoint.keywords ?? []).join(", ")}
                      onChange={(value) =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          markScheme: current.markScheme.map((item) =>
                            item.id === markPoint.id
                              ? {
                                  ...item,
                                  keywords: value
                                    .split(",")
                                    .map((keyword) => keyword.trim())
                                    .filter(Boolean),
                                }
                              : item,
                          ),
                        }))
                      }
                    />
                  </div>
                </div>
              ))}

              <Area
                label="Examiner guidance"
                rows={3}
                value={part.guidance ?? ""}
                onChange={(guidance) =>
                  updatePart(question.id, part.id, (current) => ({
                    ...current,
                    guidance,
                  }))
                }
              />
            </div>
          ) : null}

          {section === "import" ? (
            <div className="space-y-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
              <Area
                label="Paste question paper extract"
                rows={10}
                value={pasteText}
                placeholder="Paste question text from a paper here. The importer will create a draft question with a prompt, answer input, and matching number of mark points when it can detect marks."
                onChange={setPasteText}
              />
              <button
                type="button"
                onClick={importFromPaste}
                className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#1557c0] px-3 text-xs font-semibold text-white transition hover:bg-[#124cad]"
              >
                <ScanText className="h-3.5 w-3.5" />
                Extract draft question
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
