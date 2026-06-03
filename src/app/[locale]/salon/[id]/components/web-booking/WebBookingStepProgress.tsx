"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

import { getWebBookingStepLabel } from "./bookingSteps";
import type { WebBookingStep } from "./types";

interface WebBookingStepProgressProps {
  steps: WebBookingStep[];
  currentStep: WebBookingStep;
  className?: string;
}

export function WebBookingStepProgress({
  steps,
  currentStep,
  className,
}: WebBookingStepProgressProps) {
  const stepIndex = Math.max(0, steps.indexOf(currentStep));

  return (
    <ol
      className={cn("flex flex-wrap gap-2 md:gap-3", className)}
      aria-label="Étapes de réservation"
    >
      {steps.map((stepKey, index) => {
        const label = getWebBookingStepLabel(stepKey);
        const done = index < stepIndex;
        const current = index === stepIndex;

        return (
          <li
            key={stepKey}
            className={cn(
              "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium border",
              current
                ? "border-[#53745D] bg-[#F0F4F1] text-[#3a5a47]"
                : done
                  ? "border-[#53745D]/40 bg-white text-[#53745D]"
                  : "border-slate-200 bg-slate-50 text-slate-500",
            )}
            aria-current={current ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                current
                  ? "bg-[#53745D] text-white"
                  : done
                    ? "bg-[#53745D]/20 text-[#53745D]"
                    : "bg-slate-200 text-slate-600",
              )}
            >
              {done ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              ) : (
                index + 1
              )}
            </span>
            {label}
          </li>
        );
      })}
    </ol>
  );
}
