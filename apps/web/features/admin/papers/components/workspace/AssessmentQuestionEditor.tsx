import {
  ClipboardList,
  CopyPlus,
  ListChecks,
  Plus,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";

import type {
  AdminAnswerKind,
  AdminAssessmentDraft,
  AdminAssessmentPartDraft,
  AdminAssessmentQuestionDraft,
  AdminAnswerSlotDraft,
  AdminMarkPointDraft,
} from "@/features/admin/papers/types/paper-workspace.types";

const ANSWER_KINDS: Array<{ value: AdminAnswerKind; label: string }> = [
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
    label: "Response",
    lines: kind === "short" ? 1 : 4,
    placeholder: "Write your answer here...",
    options: kind.includes("tick") || kind === "true_false" ? ["Option 1"] : [],
    columns: kind === "table" ? ["Column 1", "Column 2"] : [],
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
    text: "Award one mark for...",
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
    prompt: "Write the question part prompt here.",
    marks: 1,
    answerSlots: [createAnswerSlot()],
    markScheme: [createMarkPoint()],
    guidance: "",
    expectedAnswer: "",
  };
}

function createQuestion(number: number): AdminAssessmentQuestionDraft {
  return {
    id: uniqueId("question"),
    number,
    title: `Question ${number}`,
    difficulty: "medium",
    source: {
      paper: "",
      session: "",
      questionRef: "",
    },
    tags: [],
    context: "",
    parts: [createPart("(a)")],
  };
}

function TextField({
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
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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

function TextAreaField({
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
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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

function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#1557c0]"
    >
      {children}
    </button>
  );
}

function AnswerSlotEditor({
  onChange,
  onDelete,
  slot,
}: {
  onChange: (slot: AdminAnswerSlotDraft) => void;
  onDelete: () => void;
  slot: AdminAnswerSlotDraft;
}) {
  const optionText = joinLines(slot.options);
  const tableColumns = joinLines(slot.columns);

  return (
    <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-2">
        <select
          value={slot.kind}
          onChange={(event) =>
            onChange({
              ...createAnswerSlot(event.target.value as AdminAnswerKind),
              id: slot.id,
              label: slot.label || "Response",
            })
          }
          className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1557c0]"
        >
          {ANSWER_KINDS.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </select>
        <IconButton label="Delete answer input" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="mt-3 grid gap-2">
        <TextField
          label="Input label"
          value={slot.label}
          onChange={(label) => onChange({ ...slot, label })}
        />

        {["short", "long", "working", "code", "gap", "label"].includes(
          slot.kind,
        ) ? (
          <TextField
            label="Placeholder"
            value={slot.placeholder ?? ""}
            onChange={(placeholder) => onChange({ ...slot, placeholder })}
          />
        ) : null}

        {["long", "working", "code"].includes(slot.kind) ? (
          <TextField
            label="Lines"
            value={String(slot.lines ?? 4)}
            onChange={(lines) =>
              onChange({ ...slot, lines: Number(lines) || slot.lines })
            }
          />
        ) : null}

        {["tick", "multi_tick", "true_false"].includes(slot.kind) ? (
          <TextAreaField
            label="Options"
            value={optionText}
            rows={3}
            onChange={(value) => onChange({ ...slot, options: splitLines(value) })}
          />
        ) : null}

        {slot.kind === "table" ? (
          <div className="grid gap-2">
            <TextAreaField
              label="Table columns"
              value={tableColumns}
              rows={2}
              onChange={(value) =>
                onChange({ ...slot, columns: splitLines(value) })
              }
            />
            <TextField
              label="Rows"
              value={String(slot.rows ?? 3)}
              onChange={(rows) => onChange({ ...slot, rows: Number(rows) || 1 })}
            />
          </div>
        ) : null}

        {slot.kind === "match" ? (
          <div className="grid gap-2">
            <TextAreaField
              label="Left items"
              value={joinLines(slot.leftItems)}
              rows={2}
              onChange={(value) =>
                onChange({ ...slot, leftItems: splitLines(value) })
              }
            />
            <TextAreaField
              label="Right items"
              value={joinLines(slot.rightItems)}
              rows={2}
              onChange={(value) =>
                onChange({ ...slot, rightItems: splitLines(value) })
              }
            />
          </div>
        ) : null}

        {slot.kind === "order" || slot.kind === "classify" ? (
          <TextAreaField
            label="Items"
            value={joinLines(slot.items)}
            rows={2}
            onChange={(value) => onChange({ ...slot, items: splitLines(value) })}
          />
        ) : null}

        {slot.kind === "classify" ? (
          <TextAreaField
            label="Categories"
            value={joinLines(slot.categories)}
            rows={2}
            onChange={(value) =>
              onChange({ ...slot, categories: splitLines(value) })
            }
          />
        ) : null}
      </div>
    </div>
  );
}

function MarkPointEditor({
  markPoint,
  onChange,
  onDelete,
}: {
  markPoint: AdminMarkPointDraft;
  onChange: (markPoint: AdminMarkPointDraft) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <div className="flex items-start gap-2">
        <TextAreaField
          label="Mark point"
          rows={2}
          value={markPoint.text}
          onChange={(text) => onChange({ ...markPoint, text })}
        />
        <IconButton label="Delete mark point" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <TextField
          label="Marks"
          value={String(markPoint.marks)}
          onChange={(marks) =>
            onChange({ ...markPoint, marks: Number(marks) || 1 })
          }
        />
        <TextField
          label="Topic"
          value={markPoint.topic ?? ""}
          onChange={(topic) => onChange({ ...markPoint, topic })}
        />
      </div>
      <div className="mt-2 grid gap-2">
        <TextField
          label="Keywords"
          placeholder="comma separated"
          value={(markPoint.keywords ?? []).join(", ")}
          onChange={(value) =>
            onChange({
              ...markPoint,
              keywords: value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
        <TextField
          label="Accepted alternatives"
          placeholder="comma separated"
          value={(markPoint.acceptedAlternatives ?? []).join(", ")}
          onChange={(value) =>
            onChange({
              ...markPoint,
              acceptedAlternatives: value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }
        />
      </div>
    </div>
  );
}

export function AssessmentQuestionEditor({
  assessment,
  onChange,
}: {
  assessment: AdminAssessmentDraft;
  onChange: (assessment: AdminAssessmentDraft) => void;
}) {
  function updateQuestion(
    questionId: string,
    updater: (question: AdminAssessmentQuestionDraft) => AdminAssessmentQuestionDraft,
  ) {
    onChange({
      ...assessment,
      questions: assessment.questions.map((question) =>
        question.id === questionId ? updater(question) : question,
      ),
    });
  }

  function updatePart(
    questionId: string,
    partId: string,
    updater: (part: AdminAssessmentPartDraft) => AdminAssessmentPartDraft,
  ) {
    updateQuestion(questionId, (question) => ({
      ...question,
      parts: question.parts.map((part) =>
        part.id === partId ? updater(part) : part,
      ),
    }));
  }

  return (
    <div className="mt-3 space-y-4 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="flex items-start gap-2">
        <ClipboardList className="mt-1 h-4 w-4 shrink-0 text-[#1557c0]" />
        <div className="min-w-0 flex-1 space-y-2">
          <TextField
            label="Assessment title"
            value={assessment.title}
            onChange={(title) => onChange({ ...assessment, title })}
          />
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Duration"
              value={String(assessment.durationMinutes ?? "")}
              onChange={(durationMinutes) =>
                onChange({
                  ...assessment,
                  durationMinutes: Number(durationMinutes) || undefined,
                })
              }
            />
            <select
              value={assessment.unlock?.markScheme ?? "after_submit"}
              onChange={(event) =>
                onChange({
                  ...assessment,
                  unlock: {
                    markScheme: event.target
                      .value as NonNullable<
                      AdminAssessmentDraft["unlock"]
                    >["markScheme"],
                    expectedAnswer:
                      assessment.unlock?.expectedAnswer ?? "after_submit",
                  },
                })
              }
              className="mt-5 h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#1557c0]"
            >
              <option value="after_submit">Scheme after submit</option>
              <option value="immediate">Scheme immediate</option>
              <option value="teacher_only">Teacher only</option>
            </select>
          </div>
        </div>
      </div>

      {assessment.questions.map((question, questionIndex) => (
        <section
          key={question.id}
          className="space-y-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <TextField
                label={`Question ${questionIndex + 1}`}
                value={question.title}
                onChange={(title) =>
                  updateQuestion(question.id, (current) => ({ ...current, title }))
                }
              />
            </div>
            <IconButton
              label="Delete question"
              onClick={() =>
                onChange({
                  ...assessment,
                  questions: assessment.questions.filter(
                    (candidate) => candidate.id !== question.id,
                  ),
                })
              }
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <TextField
              label="Paper"
              value={question.source?.paper ?? ""}
              onChange={(paper) =>
                updateQuestion(question.id, (current) => ({
                  ...current,
                  source: { ...current.source, paper },
                }))
              }
            />
            <TextField
              label="Session"
              value={question.source?.session ?? ""}
              onChange={(session) =>
                updateQuestion(question.id, (current) => ({
                  ...current,
                  source: { ...current.source, session },
                }))
              }
            />
            <TextField
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

          <TextAreaField
            label="Question context"
            value={question.context ?? ""}
            rows={3}
            onChange={(context) =>
              updateQuestion(question.id, (current) => ({ ...current, context }))
            }
          />

          {question.parts.map((part) => (
            <div
              key={part.id}
              className="space-y-3 rounded-xl bg-white p-3 ring-1 ring-slate-200"
            >
              <div className="flex items-start gap-2">
                <div className="grid w-16 gap-2">
                  <TextField
                    label="Part"
                    value={part.label}
                    onChange={(label) =>
                      updatePart(question.id, part.id, (current) => ({
                        ...current,
                        label,
                      }))
                    }
                  />
                  <TextField
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
                <div className="min-w-0 flex-1">
                  <TextAreaField
                    label="Prompt"
                    value={part.prompt}
                    rows={3}
                    onChange={(prompt) =>
                      updatePart(question.id, part.id, (current) => ({
                        ...current,
                        prompt,
                      }))
                    }
                  />
                </div>
                <IconButton
                  label="Delete part"
                  onClick={() =>
                    updateQuestion(question.id, (current) => ({
                      ...current,
                      parts: current.parts.filter(
                        (candidate) => candidate.id !== part.id,
                      ),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                    <CopyPlus className="h-3.5 w-3.5" />
                    Answer inputs
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updatePart(question.id, part.id, (current) => ({
                        ...current,
                        answerSlots: [
                          ...current.answerSlots,
                          createAnswerSlot("long"),
                        ],
                      }))
                    }
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#1557c0] px-2 text-xs font-semibold text-white transition hover:bg-[#124cad]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Input
                  </button>
                </div>
                <div className="space-y-2">
                  {part.answerSlots.map((slot) => (
                    <AnswerSlotEditor
                      key={slot.id}
                      slot={slot}
                      onChange={(nextSlot) =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          answerSlots: current.answerSlots.map((candidate) =>
                            candidate.id === slot.id ? nextSlot : candidate,
                          ),
                        }))
                      }
                      onDelete={() =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          answerSlots: current.answerSlots.filter(
                            (candidate) => candidate.id !== slot.id,
                          ),
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                    <ListChecks className="h-3.5 w-3.5" />
                    Mark scheme points
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updatePart(question.id, part.id, (current) => ({
                        ...current,
                        markScheme: [...current.markScheme, createMarkPoint()],
                      }))
                    }
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#1557c0] px-2 text-xs font-semibold text-white transition hover:bg-[#124cad]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Point
                  </button>
                </div>
                <div className="space-y-2">
                  {part.markScheme.map((markPoint) => (
                    <MarkPointEditor
                      key={markPoint.id}
                      markPoint={markPoint}
                      onChange={(nextMarkPoint) =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          markScheme: current.markScheme.map((candidate) =>
                            candidate.id === markPoint.id
                              ? nextMarkPoint
                              : candidate,
                          ),
                        }))
                      }
                      onDelete={() =>
                        updatePart(question.id, part.id, (current) => ({
                          ...current,
                          markScheme: current.markScheme.filter(
                            (candidate) => candidate.id !== markPoint.id,
                          ),
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <TextAreaField
                label="Expected answer"
                value={part.expectedAnswer ?? ""}
                rows={3}
                onChange={(expectedAnswer) =>
                  updatePart(question.id, part.id, (current) => ({
                    ...current,
                    expectedAnswer,
                  }))
                }
              />
              <TextAreaField
                label="Examiner guidance"
                value={part.guidance ?? ""}
                rows={2}
                onChange={(guidance) =>
                  updatePart(question.id, part.id, (current) => ({
                    ...current,
                    guidance,
                  }))
                }
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              updateQuestion(question.id, (current) => ({
                ...current,
                parts: [
                  ...current.parts,
                  createPart(`(${String.fromCharCode(97 + current.parts.length)})`),
                ],
              }))
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[#1557c0]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add part
          </button>
        </section>
      ))}

      <button
        type="button"
        onClick={() =>
          onChange({
            ...assessment,
            questions: [
              ...assessment.questions,
              createQuestion(assessment.questions.length + 1),
            ],
          })
        }
        className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#1557c0] px-3 text-xs font-semibold text-white transition hover:bg-[#124cad]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add question
      </button>
    </div>
  );
}
