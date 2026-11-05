"use client";

import { track } from "@/lib/track";

export function ApplyCta({
  location,
  label = "Apply for launch week →",
  size = "lg",
  className = "",
}: {
  location: string;
  label?: string;
  size?: "lg" | "sm";
  className?: string;
}) {
  return (
    <a
      href="#apply"
      onClick={() => track("cta_apply_click", { location })}
      className={`key ${size === "sm" ? "key-sm" : ""} ${className}`}
    >
      {label}
    </a>
  );
}
