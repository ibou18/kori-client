"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { forwardRef, useState } from "react";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  id: string;
  label: React.ReactNode;
  icon?: LucideIcon;
  /** Lien ou texte affiché à droite du label (ex. « Mot de passe oublié ? »). */
  labelAction?: React.ReactNode;
  error?: string;
}

/** Champ de formulaire auth : label, icône à gauche, styles arrondis. */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField(
    { id, label, icon: Icon, labelAction, error, className, ...props },
    ref
  ) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-sm font-medium text-gray-800">
            {label}
          </Label>
          {labelAction}
        </div>
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          )}
          <Input
            id={id}
            ref={ref}
            className={cn(
              "h-12 rounded-xl border-gray-200 bg-white text-base shadow-none transition-shadow placeholder:text-gray-400 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15",
              Icon && "pl-10",
              error && "border-red-400 focus-visible:ring-red-100",
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

interface PasswordFieldProps extends Omit<AuthFieldProps, "type" | "icon"> {
  icon?: LucideIcon;
}

/** Champ mot de passe avec bascule afficher / masquer. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ className, disabled, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <AuthField
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-11", className)}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          className="absolute right-3 top-[2.45rem] text-gray-400 transition-colors hover:text-gray-700 disabled:opacity-50"
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  }
);
