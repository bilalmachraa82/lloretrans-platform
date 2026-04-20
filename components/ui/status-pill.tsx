import { cn } from "@/lib/utils";

export type StatusKind = "green" | "yellow" | "red" | "neutral";

const STYLES: Record<StatusKind, string> = {
  green: "bg-success/12 text-success border-success/25",
  yellow: "bg-warning/14 text-[hsl(32_85%_35%)] border-warning/30",
  red: "bg-destructive/12 text-destructive border-destructive/25",
  neutral: "bg-secondary text-muted-foreground border-border/70",
};

const DOTS: Record<StatusKind, string> = {
  green: "bg-success",
  yellow: "bg-warning",
  red: "bg-destructive",
  neutral: "bg-muted-foreground/60",
};

export function StatusPill({
  status,
  children,
  className,
}: {
  status: StatusKind;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
        STYLES[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_0_2px_hsl(0_0%_100%/0.6)]", DOTS[status])} />
      {children}
    </span>
  );
}
