import Link from "next/link";

import { cn } from "@/lib/utils";

type AppLogoProps = {
  compact?: boolean;
  href?: string | null;
  className?: string;
};

function LogoContent({ compact = false }: Pick<AppLogoProps, "compact">) {
  return (
    <>
      <svg aria-hidden="true" viewBox="0 0 64 64" className="size-9 shrink-0">
        <rect width="64" height="64" rx="14" fill="currentColor" />
        <path
          d="M18 19h24v9H27v17h15v-8h-7v-9h16v26H18V19Z"
          className="fill-canvas"
        />
        <path d="M27 28h15v9H27z" className="fill-timber-600" />
      </svg>
      {!compact ? (
        <span className="font-heading text-ink-900 text-lg font-bold tracking-[-0.02em]">
          WoodLoop
          <span className="text-timber-600 ml-1 text-xs font-semibold">AI</span>
        </span>
      ) : null}
    </>
  );
}

function AppLogo({ compact = false, href = "/", className }: AppLogoProps) {
  const classes = cn(
    "text-brand-900 inline-flex min-h-11 items-center gap-2 rounded-sm",
    className,
  );

  if (!href) {
    return (
      <div className={classes} aria-label="WoodLoop AI">
        <LogoContent compact={compact} />
      </div>
    );
  }

  return (
    <Link href={href} className={classes} aria-label="WoodLoop AI home">
      <LogoContent compact={compact} />
    </Link>
  );
}

export { AppLogo };
