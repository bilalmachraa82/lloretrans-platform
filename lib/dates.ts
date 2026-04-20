import { format, formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

export function formatDate(value: Date | number | null | undefined): string {
  if (value == null) return "—";
  const date = typeof value === "number" ? new Date(value * 1000) : value;
  return format(date, "dd/MM/yyyy", { locale: pt });
}

export function formatDateTime(value: Date | number | null | undefined): string {
  if (value == null) return "—";
  const date = typeof value === "number" ? new Date(value * 1000) : value;
  return format(date, "dd/MM/yyyy HH:mm", { locale: pt });
}

export function formatRelative(value: Date | number | null | undefined): string {
  if (value == null) return "—";
  const date = typeof value === "number" ? new Date(value * 1000) : value;
  return formatDistanceToNow(date, { addSuffix: true, locale: pt });
}

export function toUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function fromUnix(seconds: number): Date {
  return new Date(seconds * 1000);
}
