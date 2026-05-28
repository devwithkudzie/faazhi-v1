"use client";

import { AdminShell } from "@/features/admin/shared/components/AdminShell";
import { useAuth } from "@/shared/providers/AuthProvider";

export default function AccountSettingsPage() {
  const { user } = useAuth();

  return (
    <AdminShell>
      <main className="space-y-6 pb-8">
        <section className="bg-white/88 p-6 shadow-[0_24px_75px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
          <p className="text-sm font-semibold text-[#1557c0]">
            Account
          </p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Account settings
          </h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Manage the signed-in admin profile and basic workspace preferences.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
            <h3 className="text-lg font-semibold text-slate-950">
              Profile
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Name
                </span>
                <input
                  defaultValue={user?.name ?? "Admin user"}
                  className="mt-1 w-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-slate-600">
                  Role
                </span>
                <input
                  defaultValue={user?.role ?? "admin"}
                  className="mt-1 w-full border border-slate-200 px-3 py-2 text-sm capitalize outline-none focus:border-[#1557c0]"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold text-slate-600">
                  Email
                </span>
                <input
                  defaultValue="admin@faazhi.local"
                  className="mt-1 w-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1557c0]"
                />
              </label>
            </div>

            <button className="mt-5 h-10 bg-[#1557c0] px-5 text-sm font-semibold text-white transition hover:bg-[#124aa3]">
              Save profile
            </button>
          </div>

          <aside className="bg-white/90 p-5 shadow-[0_22px_65px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
            <h3 className="text-lg font-semibold text-slate-950">
              Preferences
            </h3>
            <div className="mt-4 space-y-3">
              {[
                "Email me when a subject is published",
                "Show draft content warnings",
                "Use compact admin tables",
              ].map((item) => (
                <label
                  key={item}
                  className="flex items-start gap-3 bg-slate-50 p-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  <input type="checkbox" defaultChecked className="mt-1" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </AdminShell>
  );
}
