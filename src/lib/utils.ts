import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function spotsRemaining(capacity: number, booked: number): number {
  return Math.max(0, capacity - booked);
}

export function spotStatus(capacity: number, booked: number) {
  const remaining = spotsRemaining(capacity, booked);
  if (remaining === 0) return "full" as const;
  if (remaining <= 2) return "almost-full" as const;
  return "open" as const;
}
