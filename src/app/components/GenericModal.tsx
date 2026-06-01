"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GenericModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-[95vw]",
};

export function GenericModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "lg",
  className,
}: GenericModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "flex max-h-[min(90vh,100dvh-2rem)] flex-col gap-0 overflow-hidden p-0",
          className,
        )}
      >
        <DialogHeader className="shrink-0 space-y-1.5 px-6 pb-2 pt-6 pr-12">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-gray-600">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

