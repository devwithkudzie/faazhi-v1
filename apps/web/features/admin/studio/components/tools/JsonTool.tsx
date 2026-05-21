import type { AdminPaperDraft } from "@/features/admin/papers/types/paper-workspace.types";

export function JsonTool({
  draft,
  storageKey,
}: {
  draft: AdminPaperDraft;
  storageKey: string;
}) {
  return (
    <div className="space-y-3">
      <section className="rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
          Storage key
        </p>
        <p className="mt-2 break-all text-xs leading-5 text-white/70">
          {storageKey}
        </p>
      </section>
      <pre className="max-h-[calc(100vh-220px)] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-blue-50">
        {JSON.stringify(draft, null, 2)}
      </pre>
    </div>
  );
}
