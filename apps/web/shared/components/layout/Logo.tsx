"use client";

import Link from "next/link";
import Image from "next/image";
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
    sm: "h-7",
    md: "h-9",
    lg: "h-16",
  }[size];

  return (
    <Link href="/" className="group flex h-10 items-center">
      {compact ? (
        <Image
          src="/faazhi-favicon.svg"
          alt="Faazhi"
          width={36}
          height={36}
          className="h-9 w-9 rounded-md shadow-sm"
        />
      ) : (
        <Image
          src={logoSrc}
          alt="Faazhi"
          width={300}
          height={86}
          className={`${sizeClass} w-auto`}
          priority={size === "lg"}
        />
      )}
    </Link>
  );
}
