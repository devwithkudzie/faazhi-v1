"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  Home,
  LogOut,
  Settings,
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
import { adminSubjects } from "@/features/admin/subjects/services/subject.service";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: Home },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Subjects", href: "/admin/subjects", icon: BookOpen },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Account settings", href: "/admin/account", icon: Settings },
    ],
  },
];

function formatCrumb(segment: string) {
  if (/^\d+$/.test(segment)) return segment;

  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((segment, index) => {
    const subject =
      segments[index - 1] === "subjects"
        ? adminSubjects.find((item) => item.id === segment)
        : undefined;

    return {
      href: `/${segments.slice(0, index + 1).join("/")}`,
      label: subject
        ? `${subject.name} ${subject.code}`
        : segment === "admin"
          ? "Admin"
          : formatCrumb(segment),
    };
  });
}

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
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6f8fc_0%,#edf3f8_100%)] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[292px] flex-col border-r border-slate-200/80 bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between px-2 pb-5">
            <Logo size="md" />
            <span className="bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#1557c0]">
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
      </aside>

      <div className="min-h-screen pl-[292px]">
          <header className="fixed left-[292px] right-0 top-0 z-20 flex min-h-[72px] items-center justify-between gap-5 border-b border-slate-200/80 bg-white/95 px-6 py-4 shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <div className="min-w-0">
              {breadcrumbs.length > 0 ? (
                <nav
                  aria-label="Breadcrumb"
                  className="flex flex-wrap items-center gap-1 text-sm font-semibold text-slate-500"
                >
                  {breadcrumbs.map((crumb, index) => {
                    const last = index === breadcrumbs.length - 1;

                    return (
                      <span key={crumb.href} className="flex items-center gap-1">
                        {last ? (
                          <span className="text-slate-900">{crumb.label}</span>
                        ) : (
                          <Link
                            href={crumb.href}
                            className="text-[#1557c0] no-underline hover:text-[#124aa3]"
                          >
                            {crumb.label}
                          </Link>
                        )}
                        {!last ? <span className="text-slate-300">/</span> : null}
                      </span>
                    );
                  })}
                </nav>
              ) : null}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 px-2 py-1.5 transition-colors hover:bg-[#edf5ff] data-[state=open]:bg-[#edf5ff]">
                  <span className="hidden text-right sm:block">
                    <span className="block text-sm font-semibold text-slate-900">
                      {user?.name ?? "Admin user"}
                    </span>
                    <span className="block text-xs capitalize text-slate-500">
                      {user?.role ?? "admin"}
                    </span>
                  </span>
                  <span className="grid h-10 w-10 place-items-center bg-[#1557c0] text-sm font-bold text-white">
                    {initials}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={12}
                className="z-[9999] min-w-56 border border-slate-200 bg-white p-2 shadow-2xl"
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
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin/account"
                    className="block cursor-pointer px-3 py-2 text-sm no-underline outline-none hover:bg-slate-100"
                  >
                    Account settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 h-px bg-slate-200" />
                <DropdownMenuItem
                  onClick={() => {
                    signOut();
                    router.push("/signin");
                  }}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <div className="min-w-0 px-6 pb-8 pt-24">{children}</div>
      </div>
    </div>
  );
}
