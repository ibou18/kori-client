import { Button } from "@/components/ui/button";
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
  const hasActions = Boolean(actions || buttonTitle);
  const hasHeader = Boolean(title || description || hasActions);

  return (
    <div className={cn("container mx-auto px-2 py-5", className)}>
      {/* En-tête de page compact : le fil d'Ariane du header situe déjà la page,
          le titre n'a donc plus besoin d'occuper toute la hauteur. */}
      {hasHeader && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && (
              <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>

          {hasActions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}

              {buttonTitle && (
                <Button onClick={handleClick} className="gap-2" size="sm">
                  {icon || <PlusCircle className="h-4 w-4" />}
                  {buttonTitle}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
