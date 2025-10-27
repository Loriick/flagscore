import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes (0 in development)
      staleTime: process.env.NODE_ENV === "development" ? 0 : 5 * 60 * 1000,
      // Keep data in cache for 10 minutes (0 in development)
      gcTime: process.env.NODE_ENV === "development" ? 0 : 10 * 60 * 1000,
      // Automatic retry on error
      retry: 3,
      // Delay between retries
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Automatic refetch when window regains focus
      refetchOnWindowFocus: process.env.NODE_ENV === "development",
      // Automatic refetch when connection resumes
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
