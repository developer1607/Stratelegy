import { cn } from "@/lib/utils";

export default function FieldError({ message, id, className }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn("text-sm text-destructive", className)}
    >
      {message}
    </p>
  );
}

export function fieldInputClass(hasError) {
  return hasError ? "border-destructive focus-visible:ring-destructive" : "";
}
