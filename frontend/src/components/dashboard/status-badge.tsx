import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  PENDING: "bg-warning/15 text-warning",
  CONFIRMED: "bg-primary/10 text-primary",
  PROCESSING: "bg-primary/10 text-primary",
  SHIPPED: "bg-secondary/20 text-secondary-foreground",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
  REFUNDED: "bg-destructive/10 text-destructive",
  SUSPENDED: "bg-destructive/10 text-destructive",
  PAID: "bg-success/10 text-success",
  UNPAID: "bg-warning/15 text-warning",
  LOW_STOCK: "bg-warning/15 text-warning",
  OUT_OF_STOCK: "bg-destructive/10 text-destructive",
  OPEN: "bg-warning/15 text-warning",
  RESOLVED: "bg-success/10 text-success",
  REJECTED: "bg-destructive/10 text-destructive",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        STYLES[status] ?? "bg-muted text-muted-foreground",
        className,
      )}
    >
      {label}
    </span>
  );
}
