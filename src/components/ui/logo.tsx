import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  // A simple glowing ember/flame icon to represent the charcoal stove
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-accent", className)}
    >
      <path d="M12 2c0 0-4 4-4 8s4 12 4 12 4-8 4-12-4-8-4-8z" fill="currentColor" opacity="0.8" />
      <path d="M12 8c0 0-2 2-2 4s2 6 2 6 2-4 2-6-2-4-2-4z" fill="var(--background)" />
    </svg>
  );
}
