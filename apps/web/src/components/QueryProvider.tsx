"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { queryClient } from "../lib/query-client";

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient on client side
  const [client] = useState(() => {
    // Make queryClient available globally for cache clearing
    if (typeof window !== "undefined") {
      (window as any).queryClient = queryClient;
    }
    return queryClient;
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
