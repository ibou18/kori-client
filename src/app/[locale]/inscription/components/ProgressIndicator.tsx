"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

/** Libellés courts des étapes d'inscription, dans l'ordre. */
export const REGISTER_STEP_LABELS = [
  "Vos informations",
  "Votre salon",
  "Résumé",
];

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  labels?: string[];
}

/** Stepper horizontal : pastilles numérotées + barre de progression animée. */
export function ProgressIndicator({
  currentStep,
  totalSteps,
  stepTitle,
  labels = REGISTER_STEP_LABELS,
}: ProgressIndicatorProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-3">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <li key={i} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  done && "bg-primary text-white",
                  active && "bg-primary/10 text-primary ring-2 ring-primary/40",
                  !done && !active && "bg-gray-100 text-gray-400"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden truncate text-xs font-medium sm:block",
                  active ? "text-gray-900" : "text-gray-400"
                )}
              >
                {labels[i] ?? `Étape ${i + 1}`}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{stepTitle}</span>
        <span className="text-xs tabular-nums text-gray-500">
          Étape {currentStep + 1} sur {totalSteps}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
