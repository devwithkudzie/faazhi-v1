"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import type { SubjectFormInput } from "@/features/admin/subjects/types/subject.types";
import { Button } from "@/shared/ui/button";

const defaultInput: SubjectFormInput = {
  name: "",
  code: "",
  level: "Cambridge A Level",
  description: "",
};

export function SubjectForm({
  onSubmit,
  submitLabel = "Create subject draft",
}: {
  onSubmit: (input: SubjectFormInput) => void;
  submitLabel?: string;
}) {
  const [input, setInput] = useState(defaultInput);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(input);
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Subject name
          </span>
          <input
            value={input.name}
            onChange={(event) =>
              setInput((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Computer Science"
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-slate-700">
            Subject code
          </span>
          <input
            value={input.code}
            onChange={(event) =>
              setInput((current) => ({ ...current, code: event.target.value }))
            }
            placeholder="9618"
            className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Level</span>
        <input
          value={input.level}
          onChange={(event) =>
            setInput((current) => ({ ...current, level: event.target.value }))
          }
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">
          Description
        </span>
        <textarea
          value={input.description}
          onChange={(event) =>
            setInput((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          placeholder="Describe what this subject covers."
          rows={4}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1557c0] focus:ring-4 focus:ring-blue-100"
        />
      </label>

      <Button
        type="submit"
        className="h-11 rounded-2xl bg-[#1557c0] px-5 text-white hover:bg-[#124cad]"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
