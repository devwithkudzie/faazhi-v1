"use client";

import Link from "next/link";
import { useTheme } from "next-themes";

type LogoProps = {
  compact?: boolean;
  variant?: "dark" | "light" | "auto";
  size?: "sm" | "md" | "lg";
};

export function Logo({
  compact = false,
  variant = "auto",
  size = "md",
}: LogoProps) {
  const { theme } = useTheme();

  const resolvedVariant =
    variant === "auto"
      ? theme === "dark"
        ? "light"
        : "dark"
      : variant;

  const logoSrc =
    resolvedVariant === "light"
      ? "/faazhi-logo-pure-white.svg"
      : "/faazhi-logo.svg";

  const sizeClass = {
    sm: "h-8",
    md: "h-12",
    lg: "h-24",
  }[size];

  return (
    <Link href="/" className="group flex items-center gap-2">
      {compact ? (
        <img
          src="/faazhi-favicon.svg"
          alt="Faazhi"
          className="h-9 w-9 rounded-md shadow-sm"
        />
      ) : (
        <img
          src={logoSrc}
          alt="Faazhi"
          className={`${sizeClass} w-auto`}
        />
      )}
    </Link>
  );
}