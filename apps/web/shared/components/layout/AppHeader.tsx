"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/shared/components/layout/Logo";
import { ThemeToggle } from "@/shared/components/layout/ThemeToggle";
import { useAuth } from "@/shared/providers/AuthProvider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

const navItems = [
  {
    label: "Explore",
    href: "/explore",
    isActive: (pathname: string) => pathname === "/explore",
  },
  {
    label: "My Learning",
    href: "/subjects",
    isActive: (pathname: string) => pathname.startsWith("/subjects"),
  },
];

export function AppHeader() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? "U";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_8px_26px_rgba(15,23,42,0.08)] dark:bg-card">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Logo size="md" />

          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => {
              const isActive = item.isActive(pathname);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "flex h-10 items-center rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors",
                    isActive
                      ? "text-[#1557c0] hover:bg-[#dbeafe]"
                      : "text-foreground/70 hover:bg-[#dbeafe] hover:text-[#1557c0]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="
                  flex items-center gap-2 rounded-full px-2 py-1.5
                  transition-colors hover:bg-muted/80
                  data-[state=open]:bg-muted/80
                "
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {initials}
                </div>

                <span className="hidden text-sm font-medium text-foreground/80 sm:inline">
                  {user?.name ?? "User"}
                </span>

                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={10}
              className="
                z-[9999] min-w-64 rounded-xl border border-border
                bg-white p-2 shadow-xl
                dark:bg-card
              "
            >
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-foreground">
                  {user?.name ?? "User"}
                </p>

                <p className="text-xs capitalize text-muted-foreground">
                  {user?.role ?? "student"}
                </p>
              </div>

              <DropdownMenuSeparator className="my-1 h-px bg-border" />

              <DropdownMenuItem
                className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-muted"
              >
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-muted"
              >
                My Learning
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer rounded-md px-3 py-2 text-sm outline-none hover:bg-muted"
              >
                Settings
              </DropdownMenuItem>

              <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm">
                <span>Theme</span>

                <ThemeToggle />
              </div>

              <DropdownMenuSeparator className="my-1 h-px bg-border" />

              <DropdownMenuItem
                onClick={() => {
                  signOut();
                  router.push("/signin");
                }}
                className="cursor-pointer rounded-md px-3 py-2 text-sm text-destructive outline-none hover:bg-muted"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="
              grid h-9 w-9 place-items-center rounded-md
              transition-colors hover:bg-muted/80 md:hidden
            "
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border/60 bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = item.isActive(pathname);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "rounded-md px-3 py-2 text-sm no-underline transition-colors",
                    isActive
                      ? "font-medium text-[#1557c0] hover:bg-[#dbeafe]"
                      : "text-foreground/70 hover:bg-[#dbeafe] hover:text-[#1557c0]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
