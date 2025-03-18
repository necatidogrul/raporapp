"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface HeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function Header({
  title,
  description,
  className,
  ...props
}: HeaderProps) {
  return (
    <div className={cn("space-y-1", className)} {...props}>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
