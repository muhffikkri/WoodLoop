import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
  className?: string;
};

function AppHeader({
  title,
  description,
  backHref,
  action,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        "border-line bg-canvas sticky top-0 z-30 min-h-16 border-b",
        className,
      )}
    >
      <div className="flex min-h-16 items-center gap-3 px-4 min-[360px]:px-5 lg:px-8">
        {backHref ? (
          <Button variant="text" size="icon" asChild className="-ml-3">
            <Link href={backHref} aria-label="Go back">
              <ArrowLeft aria-hidden="true" />
            </Link>
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="font-heading truncate text-xl leading-tight font-semibold">
            {title}
          </h1>
          {description ? (
            <p className="text-ink-600 mt-0.5 truncate text-xs">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

export { AppHeader };
