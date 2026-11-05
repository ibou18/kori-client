"use client";

import usePageTitleStore from "@/app/store/usePageTitleStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

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
  const pathname = usePathname() ?? "";
  // Dans le back-office, le titre vit dans le fil d'Ariane du header (AdminHeader) :
  // on ne le répète pas dans la page. Ailleurs (pages sans ce header), il reste affiché.
  const titleInHeader = /^\/(fr|en)\/admin(\/|$)/.test(pathname);
  const setHeaderTitle = usePageTitleStore((state) => state.setTitle);

  useEffect(() => {
    setHeaderTitle(title ?? null);
    return () => setHeaderTitle(null);
  }, [title, setHeaderTitle]);

  const showTitle = Boolean(title) && !titleInHeader;
  const hasActions = Boolean(actions || buttonTitle);
  const hasHeader = showTitle || Boolean(description) || hasActions;

  return (
    <div className={cn("container mx-auto px-2 py-5", className)}>
      {/* Titre conservé pour les lecteurs d'écran quand il n'est pas affiché ici */}
      {title && !showTitle && <h1 className="sr-only">{title}</h1>}

      {hasHeader && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {showTitle && (
              <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-900">
                {title}
              </h1>
            )}
            {description && (
              <p
                className={cn(
                  "text-sm text-muted-foreground",
                  showTitle && "mt-0.5",
                )}
              >
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
