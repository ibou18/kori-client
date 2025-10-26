import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import React from "react";

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  handleClick?: () => void;
  buttonTitle?: string;
  icon?: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export default function PageWrapper({
  children,
  title,
  description,
  handleClick,
  buttonTitle,
  icon,
  className,
  actions,
}: PageWrapperProps) {
  return (
    <div className={cn("container mx-auto px-2 py-6", className)}>
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="space-y-1.5">
            {title && (
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-5xl text-primary font-extrabold">
                  {title.charAt(0)}
                </span>
                {title.slice(1)}
              </h1>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {actions}

            {buttonTitle && (
              <Button onClick={handleClick} className="gap-2" size="sm">
                {icon || <PlusCircle className="h-4 w-4" />}
                {buttonTitle}
              </Button>
            )}
          </div>
        </div>

        <Separator />
      </div>

      {children}
    </div>
  );
}
