import type { ReactNode } from "react";

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Standard inner-page layout: title block + content container. */
export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageShellProps) {
  return (
    <div>
      <div className="hero-wash border-b">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{title}</h1>
            {description && (
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">{description}</p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">{children}</div>
    </div>
  );
}
