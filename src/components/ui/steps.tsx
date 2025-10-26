import React from "react";
import { cn } from "@/lib/utils";

interface StepsProps {
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, className }: StepsProps) {
  return <ul className={cn("steps w-full", className)}>{children}</ul>;
}

interface StepProps {
  active?: boolean;
  completed?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Step({ active, completed, children, className }: StepProps) {
  return (
    <li
      className={cn(
        "step",
        active && "step-primary",
        completed && "step-primary step-completed",
        className
      )}
    >
      {children}
    </li>
  );
}
