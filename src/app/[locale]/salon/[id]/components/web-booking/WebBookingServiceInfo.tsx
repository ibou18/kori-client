"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CollapsibleBlockProps {
  labelCollapsed: string;
  labelExpanded: string;
  content: string;
}

function CollapsibleBlock({
  labelCollapsed,
  labelExpanded,
  content,
}: CollapsibleBlockProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <span>{open ? labelExpanded : labelCollapsed}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-500 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-3">
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}

interface WebBookingServiceInfoProps {
  description?: string;
  particularities?: string;
}

/** Description et particularités (aligné app mobile). */
export function WebBookingServiceInfo({
  description,
  particularities,
}: WebBookingServiceInfoProps) {
  const desc = description?.trim();
  const parts = particularities?.trim();
  if (!desc && !parts) return null;

  return (
    <div className="space-y-2">
      {desc ? (
        <CollapsibleBlock
          labelCollapsed="Lire la description"
          labelExpanded="Masquer la description"
          content={desc}
        />
      ) : null}
      {parts ? (
        <CollapsibleBlock
          labelCollapsed="Lire les particularités du service"
          labelExpanded="Masquer les particularités"
          content={parts}
        />
      ) : null}
    </div>
  );
}
