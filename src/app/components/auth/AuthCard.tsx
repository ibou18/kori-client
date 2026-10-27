import { cn } from "@/lib/utils";

interface AuthCardProps extends Omit<React.ComponentProps<"div">, "title"> {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}

/** Carte blanche des formulaires d'authentification avec en-tête. */
export function AuthCard({
  eyebrow,
  title,
  description,
  className,
  children,
  ...props
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-gray-900/5 bg-white p-7 shadow-[0_30px_60px_-30px_rgba(42,55,49,0.25)] sm:p-9",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          {eyebrow}
        </span>
      )}
      <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-gray-900">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-pretty text-gray-600">{description}</p>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}
