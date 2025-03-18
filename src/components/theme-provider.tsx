"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // Hidrasyon sorunlarını önlemek için bileşenin monte edilmesini bekleyin
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Bileşen monte edilene kadar içeriği göstermeyin
  if (!mounted) {
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
