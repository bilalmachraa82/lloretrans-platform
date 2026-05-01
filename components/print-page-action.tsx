"use client";

import { Printer } from "lucide-react";

export function PrintPageAction() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <Printer className="h-3.5 w-3.5" />
      Imprimir / PDF
    </button>
  );
}
