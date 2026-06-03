"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface WebBookingTopNavProps {
  previousStepLabel?: string | null;
  onBackPrevious?: () => void;
  backHref?: string;
  className?: string;
}

export function WebBookingTopNav({
  previousStepLabel,
  onBackPrevious,
  backHref,
  className,
}: WebBookingTopNavProps) {
  const showPrevious = !!previousStepLabel && !!onBackPrevious;

  if (!showPrevious && !backHref) {
    return null;
  }

  return (
    <div
      className={cn(
        "mb-6 flex items-center justify-between gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {showPrevious ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto max-w-full justify-start px-0 text-sm font-medium text-slate-700 hover:bg-transparent hover:text-[#53745D] hover:underline"
            onClick={onBackPrevious}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{previousStepLabel}</span>
          </Button>
        ) : null}
      </div>

      {backHref ? (
        <Link
          href={backHref}
          className="shrink-0 text-sm font-medium text-slate-500 underline-offset-4 hover:text-[#53745D] hover:underline"
        >
          Retour au salon
        </Link>
      ) : null}
    </div>
  );
}
