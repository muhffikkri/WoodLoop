import * as React from "react";

import { cn } from "@/lib/utils";

type PageContainerProps = React.ComponentProps<"div"> & {
  size?: "app" | "marketing" | "content" | "form";
};

const widths = {
  app: "max-w-[75rem]",
  marketing: "max-w-[77.5rem]",
  content: "max-w-[45rem]",
  form: "max-w-[47.5rem]",
};

function PageContainer({
  className,
  size = "app",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 min-[360px]:px-5 md:px-8",
        widths[size],
        className,
      )}
      {...props}
    />
  );
}

export { PageContainer };
