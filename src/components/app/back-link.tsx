"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function BackLink({ href = "/dashboard", label = "Back", className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
