import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  eyebrow?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/70 pb-5 animate-fade-in",
        className,
      )}
    >
      <div className="space-y-1">
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80">{eyebrow}</div>
        )}
        <h1 className="font-display text-3xl font-semibold leading-tight tracking-normal text-foreground">
          {title}
        </h1>
        {description && <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}
