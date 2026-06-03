"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface WebBookingStepActionsProps {
  onBack?: () => void;
  backLabel?: string;
  children?: ReactNode;
  className?: string;
}

export function WebBookingStepActions({
  onBack,
  backLabel = "Retour",
  children,
  className,
}: WebBookingStepActionsProps) {
  if (!onBack) {
    return children ? (
      <div className={cn("pt-1", className)}>{children}</div>
    ) : null;
  }

  if (!children) {
    return (
      <div className={cn("pt-1", className)}>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBack}
        >
          {backLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2 pt-1", className)}>
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={onBack}
      >
        {backLabel}
      </Button>
      {children}
    </div>
  );
}
