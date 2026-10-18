import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingState({
  label = "Loading content",
  rows = 3,
  className,
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <section
      className={cn("grid gap-4", className)}
      aria-label={label}
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="border-line bg-surface grid grid-cols-[5rem_1fr] gap-4 rounded-lg border p-4"
        >
          <Skeleton className="aspect-square w-20" />
          <div className="grid content-center gap-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </section>
  );
}

export { LoadingState };
