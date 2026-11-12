import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionContainerProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
  as?: "section" | "div";
}

export function SectionContainer({
  children,
  className,
  innerClassName,
  id,
  as: Component = "section",
}: SectionContainerProps) {
  return (
    <Component id={id} className={cn("py-14 sm:py-16 lg:py-20", className)}>
      <div
        className={cn(
          "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8",
          innerClassName,
        )}
      >
        {children}
      </div>
    </Component>
  );
}
