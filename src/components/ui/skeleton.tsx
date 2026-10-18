import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("bg-sage-100 animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
