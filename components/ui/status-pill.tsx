import { cn } from "@/lib/utils";

export type StatusKind = "green" | "yellow" | "red" | "neutral";

const STYLES: Record<StatusKind, string> = {
  green: "bg-success/15 text-success border-success/30",
  yellow: "bg-warning/15 text-warning border-warning/30",
  red: "bg-destructive/15 text-destructive border-destructive/30",
  neutral: "bg-secondary text-muted-foreground border-border",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STYLES[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-success": status === "green",
        "bg-warning": status === "yellow",
        "bg-destructive": status === "red",
        "bg-muted-foreground": status === "neutral",
      })} />
      {children}
    </span>
  );
}
