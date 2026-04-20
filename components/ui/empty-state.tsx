import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center", className)}>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {actions && <div className="mt-4 flex gap-2">{actions}</div>}
    </div>
  );
}
