import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMatchDate(dateStr: string): string {
  return format(parseISO(dateStr), "dd MMM yyyy")
}

export function formatMonthYear(dateStr: string): string {
  return format(parseISO(dateStr), "MMMM yyyy")
}

export function today(): string {
  return new Date().toISOString().split("T")[0] ?? ""
}
