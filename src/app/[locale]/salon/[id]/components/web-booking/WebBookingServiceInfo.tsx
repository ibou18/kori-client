"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface WebBookingServiceInfoProps {
  description?: string;
}

/** Description de la prestation, repliable (les conditions ont leur propre bloc). */
export function WebBookingServiceInfo({ description }: WebBookingServiceInfoProps) {
  const [open, setOpen] = useState(false);
  const desc = description?.trim();
  if (!desc) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-site-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-12 w-full items-center justify-between gap-2 px-4 text-left text-sm font-semibold text-site-fg transition-colors hover:bg-site-surface"
      >
        <span>{open ? "Masquer la description" : "Lire la description"}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-site-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-site-border bg-site-surface-2 px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-site-fg-2">{desc}</p>
        </div>
      )}
    </div>
  );
}
