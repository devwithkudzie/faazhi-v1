"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Database,
  FileText,
  Home,
  Image,
  LogOut,
  Settings,
  UserCog,
  Users,
} from "lucide-react";

import { Logo } from "@/shared/components/layout/Logo";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: Home },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Reports", href: "/admin/reports", icon: FileText },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
      { label: "Assessments", href: "/admin/subjects", icon: ClipboardCheck },
      { label: "Media library", href: "/admin/media", icon: Image },
      { label: "Imports", href: "/admin/imports", icon: Database },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Roles", href: "/admin/users", icon: UserCog },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? "AD";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8fc_0%,#edf3f8_100%)] text-slate-950">
      <div className="mx-auto grid min-h-screen max-w-[1500px] grid-cols-[292px_1fr] gap-6 px-6 py-6">
        <aside className="sticky top-6 flex h-[calc(100vh-48px)] flex-col rounded-[28px] bg-white/92 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.10)] ring-1 ring-slate-200/70">
          <div className="flex items-center justify-between px-2 pb-5">
            <Logo size="md" />
            <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#1557c0]">
              Admin
            </span>
          </div>

          <nav className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {group.label}
                </p>

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={`${group.label}-${item.label}`}
                        href={item.href}
                        className={cn(
                          "flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold no-underline transition-colors",
                          active
                            ? "bg-[#eaf2ff] text-[#1557c0]"
                            : "text-slate-600 hover:bg-[#edf5ff] hover:text-[#1557c0]",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="mt-5 rounded-3xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Content health
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Scene coverage</span>
              <span className="font-bold text-[#1557c0]">74%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div className="h-full w-[74%] rounded-full bg-[#1557c0]" />
            </div>
          </div>
        </aside>

        <div className="min-w-0 py-1">
          <header className="mb-6 flex items-center justify-between rounded-[28px] bg-white/88 px-6 py-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
            <div>
              <p className="text-sm font-semibold text-[#1557c0]">
                Platform management
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Admin Dashboard
              </h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-full px-2 py-1.5 transition-colors hover:bg-[#edf5ff] data-[state=open]:bg-[#edf5ff]">
                  <span className="hidden text-right sm:block">
                    <span className="block text-sm font-semibold text-slate-900">
                      {user?.name ?? "Admin user"}
                    </span>
                    <span className="block text-xs capitalize text-slate-500">
                      {user?.role ?? "admin"}
                    </span>
                  </span>
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[#1557c0] text-sm font-bold text-white">
                    {initials}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="z-[9999] min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-slate-950">
                    {user?.name ?? "Admin user"}
                  </p>
                  <p className="text-xs capitalize text-slate-500">
                    {user?.role ?? "admin"}
                  </p>
                </div>
                <DropdownMenuSeparator className="my-1 h-px bg-slate-200" />
                <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2 text-sm outline-none hover:bg-slate-100">
                  Account settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-2 text-sm outline-none hover:bg-slate-100">
                  Platform settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 h-px bg-slate-200" />
                <DropdownMenuItem
                  onClick={() => {
                    signOut();
                    router.push("/signin");
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
