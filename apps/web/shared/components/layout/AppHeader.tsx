"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Menu, Moon, Settings, X } from "lucide-react";
import { useState } from "react";

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
    label: "My Learning",
    href: "/subjects",
  },
  {
    label: "Subjects",
    href: "/subjects",
  },
  {
    label: "Practice",
    href: "/subjects/9618/papers",
  },
  {
    label: "Playground",
    href: "/subjects/9618/playground",
  },
];

export function AppHeader() {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("") ?? "U";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo size="md" />

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="
                  flex items-center gap-2 rounded-full px-2 py-1.5
                  transition-colors hover:bg-muted
                  data-[state=open]:bg-muted
                "
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </div>

                <span className="hidden text-sm font-medium text-foreground sm:inline">
                  {user?.name ?? "User"}
                </span>

                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="
                z-50 mt-2 min-w-60 rounded-md border border-border
                bg-background p-1 shadow-md
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
                className="
                  flex cursor-pointer items-center gap-2 rounded-md
                  px-3 py-2 text-sm outline-none
                  transition-colors hover:bg-muted
                "
              >
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <div className="flex items-center justify-between rounded-md px-3 py-2">
                <span className="flex items-center gap-2 text-sm">
                  <Moon className="h-4 w-4" />
                  Theme
                </span>

                <ThemeToggle />
              </div>

              <DropdownMenuSeparator className="my-1 h-px bg-border" />

              <DropdownMenuItem
                onClick={signOut}
                className="
                  flex cursor-pointer items-center gap-2 rounded-md
                  px-3 py-2 text-sm text-destructive outline-none
                  transition-colors hover:bg-muted
                "
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="
              grid h-9 w-9 place-items-center rounded-md
              transition-colors hover:bg-muted md:hidden
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
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="
                  rounded-md px-3 py-2 text-sm
                  text-muted-foreground
                  transition-colors hover:bg-muted hover:text-foreground
                "
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}